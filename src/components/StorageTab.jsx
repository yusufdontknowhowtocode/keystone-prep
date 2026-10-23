import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Check, X, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

// Billing model: free for `free_days` after arrival, then `rate` per pallet position
// per month "or fraction thereof" — a started month bills as a full month.

const toDate = s => (s ? new Date(s + 'T00:00:00') : null)
const iso = d => d.toISOString().slice(0, 10)
const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const money = n => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function addMonths(d, n) {
  const x = new Date(d)
  const day = x.getDate()
  x.setMonth(x.getMonth() + n)
  if (x.getDate() < day) x.setDate(0) // clamp (e.g. Jan 31 + 1 month)
  return x
}

export function lotMath(lot, today = new Date()) {
  const arrived = toDate(lot.arrived_on)
  const billableFrom = new Date(arrived); billableFrom.setDate(billableFrom.getDate() + Number(lot.free_days || 0)) // calendar days, DST-safe
  const end = lot.ended_on ? toDate(lot.ended_on) : today
  const monthly = Number(lot.pallet_positions || 0) * Number(lot.rate || 0)
  let periods = 0
  let cursor = billableFrom
  while (cursor <= end) { periods++; cursor = addMonths(billableFrom, periods) }
  const active = !lot.ended_on
  const inFree = active && today < billableFrom
  const nextCharge = active ? (inFree ? billableFrom : cursor) : null
  return { billableFrom, monthly, periods, owedToDate: periods * monthly, nextCharge, inFree, active }
}

const blank = { label: '', arrived_on: iso(new Date()), pallet_positions: '1', rate: '35', free_days: '30', note: '' }

export default function StorageTab({ clientId }) {
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true); setError('')
    const { data, error: e } = await supabase.from('storage_lots').select('*').eq('client_id', clientId).order('arrived_on')
    if (e) setError(e.message.includes('storage_lots') ? 'Storage table missing: run supabase/migrations/2026-10-23-storage-lots.sql' : e.message)
    setLots(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [clientId])

  const num = v => (v === '' || v == null ? null : Number(v))

  async function add(e) {
    e.preventDefault(); setBusy(true); setError('')
    const { error: err } = await supabase.from('storage_lots').insert({
      client_id: clientId, label: form.label || 'Inbound', arrived_on: form.arrived_on,
      pallet_positions: num(form.pallet_positions) ?? 1, rate: num(form.rate) ?? 35,
      free_days: num(form.free_days) ?? 30, note: form.note || null,
    })
    setBusy(false)
    if (err) return setError(err.message)
    setForm(f => ({ ...blank, rate: f.rate, free_days: f.free_days })) // keep client's terms for the next lot
    load()
  }

  async function save(lot) {
    setBusy(true)
    const patch = {
      label: draft.label, arrived_on: draft.arrived_on, ended_on: draft.ended_on || null,
      pallet_positions: num(draft.pallet_positions), rate: num(draft.rate), free_days: num(draft.free_days), note: draft.note || null,
    }
    const { error: err } = await supabase.from('storage_lots').update(patch).eq('id', lot.id)
    setBusy(false)
    if (err) return setError(err.message)
    setEditing(null); load()
  }

  async function remove(lot) {
    if (!window.confirm(`Delete storage lot "${lot.label}"?`)) return
    await supabase.from('storage_lots').delete().eq('id', lot.id)
    load()
  }

  const today = new Date()
  const rows = lots.map(l => ({ lot: l, m: lotMath(l, today) }))
  const active = rows.filter(r => r.m.active)
  const billingNow = active.filter(r => !r.m.inFree).reduce((n, r) => n + r.m.monthly, 0)
  const whenAllBilling = active.reduce((n, r) => n + r.m.monthly, 0)
  const positions = active.reduce((n, r) => n + Number(r.lot.pallet_positions || 0), 0)
  const owed = rows.reduce((n, r) => n + r.m.owedToDate, 0)
  const nextDates = active.map(r => r.m.nextCharge).filter(Boolean).sort((a, b) => a - b)

  return (
    <div className="space-y-4">
      {error && <div className="text-sm" style={{ color: 'var(--bad)' }}>{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Pallet positions" value={positions} />
        <Stat label="Billing now / mo" value={money(billingNow)} />
        <Stat label="Once free days end / mo" value={money(whenAllBilling)} />
        <Stat label="Next charge" value={nextDates[0] ? fmt(nextDates[0]) : '—'} />
      </div>
      <div className="text-xs pp-sub">Billed to date across all lots (started months count as full): <span className="pp-mono">{money(owed)}</span>. Compare against storage lines already invoiced.</div>

      {loading ? <div className="text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left pp-sub">
                {['Lot', 'Arrived', 'Positions', 'Rate', 'Free days', 'Free until', 'Per month', 'Months billed', 'Owed to date', 'Next charge', 'Cleared', ''].map(h => <th key={h} className="py-2 pr-4 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={12} className="py-3 pp-sub">No storage lots yet. Add one per inbound shipment below.</td></tr>}
              {rows.map(({ lot, m }) => editing === lot.id ? (
                <tr key={lot.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-2 pr-2"><In v={draft.label} on={v => setDraft(d => ({ ...d, label: v }))} /></td>
                  <td className="py-2 pr-2"><In type="date" v={draft.arrived_on} on={v => setDraft(d => ({ ...d, arrived_on: v }))} /></td>
                  <td className="py-2 pr-2"><In type="number" v={draft.pallet_positions} on={v => setDraft(d => ({ ...d, pallet_positions: v }))} /></td>
                  <td className="py-2 pr-2"><In type="number" v={draft.rate} on={v => setDraft(d => ({ ...d, rate: v }))} /></td>
                  <td className="py-2 pr-2"><In type="number" v={draft.free_days} on={v => setDraft(d => ({ ...d, free_days: v }))} /></td>
                  <td colSpan={5}></td>
                  <td className="py-2 pr-2"><In type="date" v={draft.ended_on} on={v => setDraft(d => ({ ...d, ended_on: v }))} /></td>
                  <td className="py-2 flex gap-1">
                    <button onClick={() => save(lot)} disabled={busy} className="pp-btn pp-btn-accent px-2 py-1 text-xs"><Check size={13} /></button>
                    <button onClick={() => setEditing(null)} className="pp-btn-ghost px-2 py-1 text-xs"><X size={13} /></button>
                  </td>
                </tr>
              ) : (
                <tr key={lot.id} className="border-t" style={{ borderColor: 'var(--line)', opacity: m.active ? 1 : 0.55 }}>
                  <td className="py-2 pr-4">{lot.label}{lot.note ? <div className="text-xs pp-sub">{lot.note}</div> : null}</td>
                  <td className="py-2 pr-4 pp-mono">{fmt(toDate(lot.arrived_on))}</td>
                  <td className="py-2 pr-4 pp-mono">{lot.pallet_positions}</td>
                  <td className="py-2 pr-4 pp-mono">{money(lot.rate)}</td>
                  <td className="py-2 pr-4 pp-mono">{lot.free_days}</td>
                  <td className="py-2 pr-4 pp-mono" style={m.inFree ? { color: 'var(--ok)' } : undefined}>{fmt(m.billableFrom)}</td>
                  <td className="py-2 pr-4 pp-mono">{money(m.monthly)}</td>
                  <td className="py-2 pr-4 pp-mono">{m.periods}</td>
                  <td className="py-2 pr-4 pp-mono font-semibold">{money(m.owedToDate)}</td>
                  <td className="py-2 pr-4 pp-mono">{m.nextCharge ? fmt(m.nextCharge) : '—'}</td>
                  <td className="py-2 pr-4 pp-mono">{lot.ended_on ? fmt(toDate(lot.ended_on)) : '—'}</td>
                  <td className="py-2 flex gap-1">
                    <button onClick={() => { setEditing(lot.id); setDraft({ ...lot, ended_on: lot.ended_on || '' }) }} className="pp-btn-ghost px-2 py-1 text-xs" title="Edit"><Pencil size={13} /></button>
                    <button onClick={() => remove(lot)} className="pp-btn-ghost px-2 py-1 text-xs" title="Delete"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={add} className="pp-card p-3 grid grid-cols-2 md:grid-cols-7 gap-2 items-end text-sm">
        <Field label="Lot / shipment"><In v={form.label} on={v => setForm(f => ({ ...f, label: v }))} ph="e.g. Black harnesses" /></Field>
        <Field label="Arrived"><In type="date" v={form.arrived_on} on={v => setForm(f => ({ ...f, arrived_on: v }))} /></Field>
        <Field label="Pallet positions"><In type="number" v={form.pallet_positions} on={v => setForm(f => ({ ...f, pallet_positions: v }))} /></Field>
        <Field label="$ / position / mo"><In type="number" v={form.rate} on={v => setForm(f => ({ ...f, rate: v }))} /></Field>
        <Field label="Free days"><In type="number" v={form.free_days} on={v => setForm(f => ({ ...f, free_days: v }))} /></Field>
        <Field label="Note"><In v={form.note} on={v => setForm(f => ({ ...f, note: v }))} /></Field>
        <button disabled={busy} className="pp-btn pp-btn-accent px-3 py-2 flex items-center justify-center gap-1"><Plus size={14} /> Add lot</button>
      </form>
      <div className="text-xs pp-sub">Use the client's agreement terms (e.g. Bricklight $20 / 30 days per inbound; Authletic $25; standard $35). Set "Cleared" when a lot ships out or merges into another so it stops billing. Half positions (0.5) are fine.</div>
    </div>
  )
}

function Stat({ label, value }) {
  return <div className="pp-card p-3"><div className="text-xs uppercase tracking-wider pp-sub font-semibold">{label}</div><div className="pp-mono text-lg font-semibold mt-1">{value}</div></div>
}
function Field({ label, children }) {
  return <label className="block"><span className="text-xs pp-sub">{label}</span>{children}</label>
}
function In({ v, on, type = 'text', ph = '' }) {
  return <input className="pp-input py-1 text-sm w-full" style={{ minWidth: type === 'number' ? 70 : 110 }} type={type} value={v ?? ''} placeholder={ph} onChange={e => on(e.target.value)} />
}
