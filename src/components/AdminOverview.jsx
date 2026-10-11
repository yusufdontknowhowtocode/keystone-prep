import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { SectionTitle } from './PortalUI.jsx'

/* ============================================================
   ADMIN OVERVIEW — one screen for money, clients, inbound, pipeline.
   Everything is pulled live from Supabase. Nothing here is typed in
   twice: invoices come from the invoice builder, inventory from SKUs,
   inbound from inbound_shipments. Leads live in the `leads` table
   (see supabase/migrations/2026-10-10-leads.sql).
   ============================================================ */

const PAYMENT_TERMS_DAYS = 7 // invoices are due within 7 days of the invoice date
const LEAD_STAGES = ['new', 'quoted', 'agreement_sent', 'signed', 'lost']
const blankLead = { company: '', contact: '', source: '', stage: 'new', est_monthly: '', next_action: '', next_date: '' }

export default function AdminOverview({ clients }) {
  const [data, setData] = useState({ skus: [], inbound: [], invoices: [], leads: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leadsMissing, setLeadsMissing] = useState(false)
  const [leadForm, setLeadForm] = useState(blankLead)
  const [savingLead, setSavingLead] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [skus, inbound, invoices, leads] = await Promise.all([
        supabase.from('skus').select('client_id,on_hand'),
        supabase.from('inbound_shipments').select('id,client_id,ref_code,carrier,expected_units,received_units,eta,status,created_at,received_at'),
        supabase.from('invoices').select('id,client_id,ref_code,period,status,created_at,paid_at,invoice_lines(qty,rate)'),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
      ])
      for (const r of [skus, inbound, invoices]) if (r.error) throw r.error
      setLeadsMissing(Boolean(leads.error))
      setData({ skus: skus.data || [], inbound: inbound.data || [], invoices: invoices.data || [], leads: leads.error ? [] : (leads.data || []) })
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])

  const invoices = useMemo(() => data.invoices.map(inv => {
    const total = (inv.invoice_lines || []).reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0)
    const age = daysSince(inv.created_at)
    return { ...inv, total, age, overdue: inv.status === 'open' && age > PAYMENT_TERMS_DAYS }
  }), [data.invoices])

  const openInvoices = invoices.filter(i => i.status === 'open').sort((a, b) => b.age - a.age)
  const openTotal = sum(openInvoices.map(i => i.total))
  const overdueTotal = sum(openInvoices.filter(i => i.overdue).map(i => i.total))
  const collected30 = sum(invoices.filter(i => i.status === 'paid' && i.paid_at && daysSince(i.paid_at) <= 30).map(i => i.total))
  const unitsOnHand = sum(data.skus.map(s => Number(s.on_hand || 0)))

  const clientRows = clients.filter(c => !c.is_admin).map(c => {
    const skus = data.skus.filter(s => s.client_id === c.id)
    const inb = data.inbound.filter(i => i.client_id === c.id)
    const inv = invoices.filter(i => i.client_id === c.id)
    const lastDates = [...inb.map(i => i.received_at || i.created_at), ...inv.map(i => i.created_at)].filter(Boolean)
    const last = lastDates.length ? lastDates.sort().at(-1) : null
    return {
      ...c,
      units: sum(skus.map(s => Number(s.on_hand || 0))),
      skuCount: skus.length,
      open: sum(inv.filter(i => i.status === 'open').map(i => i.total)),
      overdue: inv.some(i => i.overdue),
      billed30: sum(inv.filter(i => daysSince(i.created_at) <= 30).map(i => i.total)),
      last,
    }
  }).sort((a, b) => (b.overdue - a.overdue) || (b.open - a.open) || (b.units - a.units))

  const pendingInbound = data.inbound
    .filter(i => i.status !== 'received')
    .sort((a, b) => String(a.eta || '9999').localeCompare(String(b.eta || '9999')))

  const activeLeads = data.leads.filter(l => !['signed', 'lost'].includes(l.stage))
  const pipelineMonthly = sum(activeLeads.map(l => Number(l.est_monthly || 0)))

  async function addLead(e) {
    e.preventDefault()
    if (!leadForm.company.trim()) return
    setSavingLead(true)
    const payload = { ...leadForm, est_monthly: leadForm.est_monthly === '' ? null : Number(leadForm.est_monthly), next_date: leadForm.next_date || null }
    const { error: err } = await supabase.from('leads').insert(payload)
    setSavingLead(false)
    if (err) return setError(err.message)
    setLeadForm(blankLead)
    load()
  }

  async function updateLead(id, patch) {
    const { error: err } = await supabase.from('leads').update(patch).eq('id', id)
    if (err) return setError(err.message)
    setData(d => ({ ...d, leads: d.leads.map(l => (l.id === id ? { ...l, ...patch } : l)) }))
  }

  return (
    <section className="pp-card p-4 space-y-6">
      <SectionTitle right={
        <button onClick={load} className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
        </button>
      }>Overview</SectionTitle>

      {error && <div className="text-sm" style={{ color: 'var(--bad)' }}>Couldn't load: {error}</div>}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Tile label="Open invoices" value={money(openTotal)} sub={`${openInvoices.length} unpaid`} />
        <Tile label="Overdue" value={money(overdueTotal)} sub={`past ${PAYMENT_TERMS_DAYS} days`} bad={overdueTotal > 0} />
        <Tile label="Collected · 30d" value={money(collected30)} sub="paid invoices" />
        <Tile label="Units on hand" value={unitsOnHand.toLocaleString()} sub={`${clientRows.filter(c => c.units > 0).length} clients with stock`} />
        <Tile label="Pipeline" value={money(pipelineMonthly) + '/mo'} sub={`${activeLeads.length} active leads`} />
      </div>

      {/* Money */}
      <Block title="Unpaid invoices" empty={!openInvoices.length && 'Nothing unpaid. Log invoices in the client invoice builder below for them to show here.'}>
        <table className="w-full text-sm">
          <thead><tr className="text-left pp-sub"><th className="py-2">Client</th><th>Invoice</th><th>Period</th><th className="text-right">Amount</th><th className="text-right">Days open</th></tr></thead>
          <tbody>
            {openInvoices.map(i => (
              <tr key={i.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                <td className="py-2 font-medium">{clientById[i.client_id]?.account_code || '—'}</td>
                <td className="pp-mono">{i.ref_code}</td>
                <td>{i.period || '—'}</td>
                <td className="text-right pp-mono">{money(i.total)}</td>
                <td className="text-right pp-mono" style={i.overdue ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>
                  {i.overdue && <AlertTriangle size={13} className="inline mr-1 -mt-0.5" />}{i.age}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      {/* Clients */}
      <Block title="Clients" empty={!clientRows.length && 'No clients yet.'}>
        <table className="w-full text-sm">
          <thead><tr className="text-left pp-sub"><th className="py-2">Code</th><th>Brand</th><th className="text-right">Units</th><th className="text-right">SKUs</th><th className="text-right">Billed · 30d</th><th className="text-right">Unpaid</th><th className="text-right">Last activity</th></tr></thead>
          <tbody>
            {clientRows.map(c => (
              <tr key={c.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                <td className="py-2 pp-mono">{c.account_code}</td>
                <td className="font-medium">{c.name}</td>
                <td className="text-right pp-mono">{c.units.toLocaleString()}</td>
                <td className="text-right pp-mono">{c.skuCount}</td>
                <td className="text-right pp-mono">{money(c.billed30)}</td>
                <td className="text-right pp-mono" style={c.overdue ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>{c.open ? money(c.open) : '—'}</td>
                <td className="text-right pp-sub">{c.last ? `${daysSince(c.last)}d ago` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      {/* Inbound */}
      <Block title="Inbound not yet received" empty={!pendingInbound.length && 'Nothing in transit or waiting to be received.'}>
        <table className="w-full text-sm">
          <thead><tr className="text-left pp-sub"><th className="py-2">Client</th><th>Ref</th><th>Carrier</th><th className="text-right">Expected</th><th>Status</th><th className="text-right">ETA</th></tr></thead>
          <tbody>
            {pendingInbound.map(i => (
              <tr key={i.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                <td className="py-2 font-medium">{clientById[i.client_id]?.account_code || '—'}</td>
                <td className="pp-mono">{i.ref_code}</td>
                <td>{i.carrier || '—'}</td>
                <td className="text-right pp-mono">{i.expected_units ?? '—'}</td>
                <td>{labelize(i.status)}</td>
                <td className="text-right pp-mono">{i.eta || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      {/* Pipeline */}
      <Block title="Pipeline">
        {leadsMissing ? (
          <div className="text-sm pp-sub">The <span className="pp-mono">leads</span> table doesn't exist yet. Run <span className="pp-mono">supabase/migrations/2026-10-10-leads.sql</span> in the Supabase SQL editor, then refresh.</div>
        ) : (
          <>
            {data.leads.length > 0 && (
              <table className="w-full text-sm mb-4">
                <thead><tr className="text-left pp-sub"><th className="py-2">Company</th><th>Contact</th><th>Stage</th><th className="text-right">Est/mo</th><th>Next action</th><th className="text-right">By</th></tr></thead>
                <tbody>
                  {data.leads.map(l => {
                    const late = l.next_date && !['signed', 'lost'].includes(l.stage) && new Date(l.next_date) < startOfToday()
                    return (
                      <tr key={l.id} className="border-t" style={{ borderColor: 'var(--line)', opacity: l.stage === 'lost' ? 0.5 : 1 }}>
                        <td className="py-2 font-medium">{l.company}</td>
                        <td>{l.contact || '—'}</td>
                        <td>
                          <select className="pp-input py-1 text-sm" value={l.stage} onChange={e => updateLead(l.id, { stage: e.target.value })}>
                            {LEAD_STAGES.map(s => <option key={s} value={s}>{labelize(s)}</option>)}
                          </select>
                        </td>
                        <td className="text-right pp-mono">{l.est_monthly ? money(l.est_monthly) : '—'}</td>
                        <td>{l.next_action || '—'}</td>
                        <td className="text-right pp-mono" style={late ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>{l.next_date || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <form onSubmit={addLead} className="grid grid-cols-2 md:grid-cols-7 gap-2 items-end">
              <input className="pp-input" placeholder="Company" value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })} />
              <input className="pp-input" placeholder="Contact" value={leadForm.contact} onChange={e => setLeadForm({ ...leadForm, contact: e.target.value })} />
              <input className="pp-input" placeholder="Source" value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} />
              <input className="pp-input" type="number" placeholder="Est $/mo" value={leadForm.est_monthly} onChange={e => setLeadForm({ ...leadForm, est_monthly: e.target.value })} />
              <input className="pp-input" placeholder="Next action" value={leadForm.next_action} onChange={e => setLeadForm({ ...leadForm, next_action: e.target.value })} />
              <input className="pp-input" type="date" value={leadForm.next_date} onChange={e => setLeadForm({ ...leadForm, next_date: e.target.value })} />
              <button className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center justify-center gap-1" disabled={savingLead}>
                {savingLead ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add lead
              </button>
            </form>
          </>
        )}
      </Block>
    </section>
  )
}

function Tile({ label, value, sub, bad }) {
  return (
    <div className="pp-card p-3" style={bad ? { borderColor: 'var(--bad)' } : undefined}>
      <div className="text-xs pp-sub uppercase tracking-wide">{label}</div>
      <div className="pp-mono text-xl font-bold mt-1" style={bad ? { color: 'var(--bad)' } : undefined}>{value}</div>
      <div className="text-xs pp-sub mt-0.5">{sub}</div>
    </div>
  )
}

function Block({ title, empty, children }) {
  return (
    <div>
      <div className="font-semibold mb-2">{title}</div>
      {empty ? <div className="text-sm pp-sub">{empty}</div> : <div className="overflow-x-auto">{children}</div>}
    </div>
  )
}

function sum(arr) { return arr.reduce((n, v) => n + v, 0) }
function money(n) { return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function daysSince(d) { return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) }
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
function labelize(v) { return String(v || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }
