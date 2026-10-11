import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, ChevronRight, X } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

/* ============================================================
   ADMIN OVERVIEW — two views, both live from Supabase.
   view="home"     → money tiles, "needs attention" list, clients
   view="pipeline" → leads with stage / next action / follow-up date
   Leads live in the `leads` table (supabase/migrations/2026-10-10-leads.sql).
   ============================================================ */

const PAYMENT_TERMS_DAYS = 7 // invoices are due within 7 days of the invoice date
const LEAD_STAGES = ['new', 'quoted', 'agreement_sent', 'signed', 'lost']
const CLOSED = ['signed', 'lost']
const blankLead = { brand: '', email: '', source: '', stage: 'new', est_monthly: '', next_action: '', next_date: '' }

function useOverviewData() {
  const [data, setData] = useState({ skus: [], inbound: [], invoices: [], leads: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leadsMissing, setLeadsMissing] = useState(false)

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
  return { data, setData, loading, error, setError, leadsMissing, load }
}

export default function AdminOverview({ clients, view = 'home', onOpenClient, onGoPipeline }) {
  const { data, setData, loading, error, setError, leadsMissing, load } = useOverviewData()
  if (loading) return <div className="pp-card p-4 text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</div>
  return (
    <>
      {error && <div className="pp-card p-3 text-sm" style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}>Couldn't load: {error}</div>}
      {view === 'pipeline'
        ? <Pipeline leads={data.leads} leadsMissing={leadsMissing} setData={setData} setError={setError} reload={load} />
        : <Home clients={clients} data={data} onOpenClient={onOpenClient} onGoPipeline={onGoPipeline} />}
    </>
  )
}

/* ---------------- HOME ---------------- */

function Home({ clients, data, onOpenClient, onGoPipeline }) {
  const clientById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])

  const invoices = data.invoices.map(inv => {
    const total = (inv.invoice_lines || []).reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0)
    const age = daysSince(inv.created_at)
    return { ...inv, total, age, overdue: inv.status === 'open' && age > PAYMENT_TERMS_DAYS }
  })
  const openInvoices = invoices.filter(i => i.status === 'open').sort((a, b) => b.age - a.age)
  const openTotal = sum(openInvoices.map(i => i.total))
  const overdueTotal = sum(openInvoices.filter(i => i.overdue).map(i => i.total))
  const collected30 = sum(invoices.filter(i => i.status === 'paid' && i.paid_at && daysSince(i.paid_at) <= 30).map(i => i.total))
  const unitsOnHand = sum(data.skus.map(s => Number(s.on_hand || 0)))

  const activeLeads = data.leads.filter(l => !CLOSED.includes(l.stage || 'new'))
  const followUps = activeLeads
    .filter(l => l.next_date && new Date(l.next_date + 'T00:00:00') <= startOfToday())
    .sort((a, b) => a.next_date.localeCompare(b.next_date))
  const pendingInbound = data.inbound
    .filter(i => i.status !== 'received')
    .sort((a, b) => String(a.eta || '9999').localeCompare(String(b.eta || '9999')))

  const clientRows = clients.filter(c => !c.is_admin).map(c => {
    const units = sum(data.skus.filter(s => s.client_id === c.id).map(s => Number(s.on_hand || 0)))
    const inv = invoices.filter(i => i.client_id === c.id)
    const inb = data.inbound.filter(i => i.client_id === c.id)
    const lastDates = [...inb.map(i => i.received_at || i.created_at), ...inv.map(i => i.created_at)].filter(Boolean).sort()
    return {
      ...c,
      units,
      open: sum(inv.filter(i => i.status === 'open').map(i => i.total)),
      overdue: inv.some(i => i.overdue),
      last: lastDates.at(-1) || null,
    }
  }).sort((a, b) => (b.overdue - a.overdue) || (b.open - a.open) || (b.units - a.units))

  // One list of everything that needs action, most urgent first.
  const todo = [
    ...openInvoices.filter(i => i.overdue).map(i => ({
      key: 'inv' + i.id, bad: true,
      text: `${clientById[i.client_id]?.name || 'Client'} owes ${money(i.total)} — ${i.ref_code}, ${i.age} days old`,
      onClick: () => onOpenClient?.(i.client_id, 'invoices'),
    })),
    ...followUps.map(l => ({
      key: 'lead' + l.id, bad: new Date(l.next_date + 'T00:00:00') < startOfToday(),
      text: `${l.brand || l.name || 'Lead'}: ${l.next_action || 'follow up'}${l.next_date ? ` (${shortDate(l.next_date)})` : ''}`,
      onClick: onGoPipeline,
    })),
    ...pendingInbound.map(i => ({
      key: 'in' + i.id,
      text: `Inbound ${i.ref_code || ''} for ${clientById[i.client_id]?.name || 'client'}${i.expected_units ? ` · ${i.expected_units} units` : ''}${i.eta ? ` · ETA ${shortDate(i.eta)}` : ''}`,
      onClick: () => onOpenClient?.(i.client_id, 'inbound'),
    })),
  ]

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Overdue" value={money(overdueTotal)} sub={overdueTotal ? 'chase today' : 'all current'} bad={overdueTotal > 0} />
        <Tile label="Unpaid total" value={money(openTotal)} sub={`${openInvoices.length} open invoice${openInvoices.length === 1 ? '' : 's'}`} />
        <Tile label="Collected · 30d" value={money(collected30)} sub="paid invoices" />
        <Tile label="Units on hand" value={unitsOnHand.toLocaleString()} sub={`${clientRows.filter(c => c.units > 0).length} clients with stock`} />
      </div>

      <section className="pp-card p-4">
        <h2 className="font-semibold mb-3">Needs attention</h2>
        {todo.length === 0
          ? <div className="text-sm pp-sub">Nothing overdue, no follow-ups due, nothing inbound. 👍</div>
          : (
            <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
              {todo.map(t => (
                <button key={t.key} onClick={t.onClick} className="w-full text-left py-2.5 flex items-center gap-2 text-sm hover:opacity-80" style={{ borderColor: 'var(--line)' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.bad ? 'var(--bad)' : 'var(--accent)' }} />
                  <span className="flex-1" style={t.bad ? { color: 'var(--bad)', fontWeight: 600 } : undefined}>{t.text}</span>
                  <ChevronRight size={15} className="pp-sub" />
                </button>
              ))}
            </div>
          )}
      </section>

      <section className="pp-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Clients</h2>
          <button onClick={onGoPipeline} className="text-xs pp-sub hover:underline">{activeLeads.length} active leads · {money(sum(activeLeads.map(l => Number(l.est_monthly || 0))))}/mo →</button>
        </div>
        {clientRows.length === 0 ? <div className="text-sm pp-sub">No clients yet.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left pp-sub text-xs uppercase"><th className="py-2 font-medium">Client</th><th className="text-right font-medium">Units</th><th className="text-right font-medium">Unpaid</th><th className="text-right font-medium">Last activity</th><th /></tr></thead>
              <tbody>
                {clientRows.map(c => (
                  <tr key={c.id} onClick={() => onOpenClient?.(c.id)} className="border-t cursor-pointer hover:opacity-80" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2.5"><span className="font-medium">{c.name}</span> <span className="pp-mono text-xs pp-sub ml-1">{c.account_code}</span></td>
                    <td className="text-right pp-mono">{c.units ? c.units.toLocaleString() : '—'}</td>
                    <td className="text-right pp-mono" style={c.overdue ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>{c.open ? money(c.open) : '—'}</td>
                    <td className="text-right pp-sub">{c.last ? `${daysSince(c.last)}d ago` : '—'}</td>
                    <td className="text-right w-6"><ChevronRight size={15} className="pp-sub inline" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

/* ---------------- PIPELINE ---------------- */

function Pipeline({ leads, leadsMissing, setData, setError, reload }) {
  const [showClosed, setShowClosed] = useState(false)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(blankLead)
  const [saving, setSaving] = useState(false)

  if (leadsMissing) {
    return <div className="pp-card p-4 text-sm pp-sub">The <span className="pp-mono">leads</span> table doesn't exist yet. Run the leads migration in the Supabase SQL editor, then refresh.</div>
  }

  const active = leads.filter(l => !CLOSED.includes(l.stage || 'new'))
  const closedCount = leads.length - active.length
  // Leads with a follow-up date first (soonest first), then newest.
  const shown = (showClosed ? leads : active).slice().sort((a, b) => {
    if (a.next_date && b.next_date) return a.next_date.localeCompare(b.next_date)
    if (a.next_date) return -1
    if (b.next_date) return 1
    return String(b.created_at).localeCompare(String(a.created_at))
  })

  async function addLead(e) {
    e.preventDefault()
    if (!form.brand.trim()) return
    setSaving(true)
    const payload = { ...form, email: form.email.trim() || 'unknown@manual.entry', source: form.source || 'manual', est_monthly: form.est_monthly === '' ? null : Number(form.est_monthly), next_date: form.next_date || null }
    const { error: err } = await supabase.from('leads').insert(payload)
    setSaving(false)
    if (err) return setError(err.message)
    setForm(blankLead)
    setAdding(false)
    reload()
  }

  async function updateLead(id, patch) {
    const { error: err } = await supabase.from('leads').update(patch).eq('id', id)
    if (err) return setError(err.message)
    setData(d => ({ ...d, leads: d.leads.map(l => (l.id === id ? { ...l, ...patch } : l)) }))
  }

  return (
    <section className="pp-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold">Pipeline</h2>
          <div className="text-xs pp-sub">{active.length} active · {money(sum(active.map(l => Number(l.est_monthly || 0))))}/mo estimated</div>
        </div>
        <div className="flex items-center gap-2">
          {closedCount > 0 && (
            <button onClick={() => setShowClosed(s => !s)} className="pp-btn-ghost px-3 py-2 text-sm">{showClosed ? 'Hide' : 'Show'} signed/lost ({closedCount})</button>
          )}
          <button onClick={() => setAdding(a => !a)} className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center gap-1">
            {adding ? <X size={14} /> : <Plus size={14} />} {adding ? 'Cancel' : 'Add lead'}
          </button>
        </div>
      </div>

      {adding && (
        <form onSubmit={addLead} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded" style={{ border: '1px solid var(--line)' }}>
          <input className="pp-input" placeholder="Brand / company *" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} autoFocus />
          <input className="pp-input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="pp-input" placeholder="Where they came from" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
          <input className="pp-input" type="number" placeholder="Est $/mo" value={form.est_monthly} onChange={e => setForm({ ...form, est_monthly: e.target.value })} />
          <input className="pp-input" placeholder="Next action" value={form.next_action} onChange={e => setForm({ ...form, next_action: e.target.value })} />
          <input className="pp-input" type="date" value={form.next_date} onChange={e => setForm({ ...form, next_date: e.target.value })} />
          <button className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center justify-center gap-1 sm:col-span-2" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save lead
          </button>
        </form>
      )}

      {shown.length === 0 ? <div className="text-sm pp-sub">No active leads.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left pp-sub text-xs uppercase"><th className="py-2 font-medium">Lead</th><th className="font-medium">Stage</th><th className="font-medium">Next action</th><th className="font-medium">Follow up</th><th className="text-right font-medium">Est/mo</th></tr></thead>
            <tbody>
              {shown.map(l => {
                const stage = l.stage || 'new'
                const late = l.next_date && !CLOSED.includes(stage) && new Date(l.next_date + 'T00:00:00') < startOfToday()
                return (
                  <tr key={l.id} className="border-t align-top" style={{ borderColor: 'var(--line)', opacity: stage === 'lost' ? 0.5 : 1 }}>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{l.brand || l.name || '—'}</div>
                      <div className="text-xs pp-sub">{[l.email && !l.email.endsWith('@manual.entry') ? l.email : null, l.phone, l.source, l.created_at ? `${daysSince(l.created_at)}d ago` : null].filter(Boolean).join(' · ')}</div>
                      {l.product_type && <div className="text-xs pp-sub">{l.product_type}{l.monthly_units ? ` · ${l.monthly_units}/mo` : ''}</div>}
                    </td>
                    <td className="py-2 pr-2">
                      <select className="pp-input py-1 text-sm" value={stage} onChange={e => updateLead(l.id, { stage: e.target.value })}>
                        {LEAD_STAGES.map(s => <option key={s} value={s}>{labelize(s)}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2"><input className="pp-input py-1 text-sm" defaultValue={l.next_action || ''} placeholder="—" onBlur={e => e.target.value !== (l.next_action || '') && updateLead(l.id, { next_action: e.target.value || null })} /></td>
                    <td className="py-2 pr-2"><input type="date" className="pp-input py-1 text-sm" style={late ? { color: 'var(--bad)', fontWeight: 700 } : undefined} defaultValue={l.next_date || ''} onChange={e => updateLead(l.id, { next_date: e.target.value || null })} /></td>
                    <td className="py-2.5 text-right pp-mono">{l.est_monthly ? money(l.est_monthly) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ---------------- helpers ---------------- */

function Tile({ label, value, sub, bad }) {
  return (
    <div className="pp-card p-3" style={bad ? { borderColor: 'var(--bad)' } : undefined}>
      <div className="text-xs pp-sub uppercase tracking-wide">{label}</div>
      <div className="pp-mono text-xl font-bold mt-1" style={bad ? { color: 'var(--bad)' } : undefined}>{value}</div>
      <div className="text-xs pp-sub mt-0.5">{sub}</div>
    </div>
  )
}

function sum(arr) { return arr.reduce((n, v) => n + v, 0) }
function money(n) { return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function daysSince(d) { return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)) }
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
function shortDate(d) { return new Date(String(d).slice(0, 10) + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
function labelize(v) { return String(v || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }
