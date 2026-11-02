import React, { useEffect, useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

// One row per client: pallets × $/pallet per month, starting on "billing starts".
// Charges repeat monthly on that date. Stored in storage_lots (one row per client).

const toDate = s => (s ? new Date(s + 'T00:00:00') : null)
const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const money = n => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function addMonths(d, n) {
  const x = new Date(d); const day = x.getDate()
  x.setMonth(x.getMonth() + n)
  if (x.getDate() < day) x.setDate(0)
  return x
}

function nextCharge(start, today) {
  if (!start) return null
  if (start >= today) return start
  let n = 0, d = start
  while (d < today) { n++; d = addMonths(start, n) }
  return d
}

const DEFAULT_RATE = 35
// Agreed storage rates per client (from signed agreements). Anything not listed = standard $35.
const AGREED = {
  'BRIC-0001': { rate: 20, note: 'agreement rate' },
  'AUTH-0001': { rate: 25, note: 'agreement rate' },
  'NORD-0001': { rate: 25, note: 'agreement rate' },
  'AXIS-0001': { rate: 35, note: '1 pallet free 30 days; extra pallets $35 → $45 (mo 2) → $50' },
}
const agreed = c => AGREED[c.account_code] || { rate: DEFAULT_RATE, note: 'standard rate' }

export default function StorageOverview({ clients }) {
  const [rows, setRows] = useState({}) // client_id -> storage_lots row
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  async function load() {
    setLoading(true); setError('')
    const { data, error: e } = await supabase.from('storage_lots').select('*').is('ended_on', null).order('created_at')
    if (e) setError(e.message)
    const byClient = {}
    for (const r of data || []) if (!byClient[r.client_id]) byClient[r.client_id] = r
    setRows(byClient)
    setDrafts(Object.fromEntries(clients.map(c => {
      const r = byClient[c.id]
      return [c.id, { pallets: r ? String(r.pallet_positions) : '', rate: r ? String(r.rate) : String(agreed(c).rate), start: r ? r.arrived_on : '', note: r?.note || '' }]
    })))
    setLoading(false)
  }
  useEffect(() => { load() }, [clients.length])

  const set = (id, k, v) => setDrafts(d => ({ ...d, [id]: { ...d[id], [k]: v } }))

  async function save(c) {
    const d = drafts[c.id]
    if (!d.start) return setError(`Set a "billing starts" date for ${c.name}.`)
    setSavingId(c.id); setError('')
    const payload = { pallet_positions: Number(d.pallets || 0), rate: Number(d.rate || 0), arrived_on: d.start, free_days: 0, note: d.note || null }
    const existing = rows[c.id]
    const { error: e } = existing
      ? await supabase.from('storage_lots').update(payload).eq('id', existing.id)
      : await supabase.from('storage_lots').insert({ ...payload, client_id: c.id, label: 'Storage' })
    setSavingId(null)
    if (e) return setError(e.message)
    load()
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const list = clients.map(c => {
    const d = drafts[c.id] || {}
    const monthly = Number(d.pallets || 0) * Number(d.rate || 0)
    const next = nextCharge(toDate(d.start), today)
    const dirty = rows[c.id]
      ? String(rows[c.id].pallet_positions) !== d.pallets || String(rows[c.id].rate) !== d.rate || rows[c.id].arrived_on !== d.start || (rows[c.id].note || '') !== d.note
      : Boolean(d.pallets || d.start)
    return { c, d, monthly, next, dirty }
  }).sort((a, b) => (b.monthly > 0) - (a.monthly > 0) || ((a.next?.getTime() ?? 9e15) - (b.next?.getTime() ?? 9e15)))

  const totalMonthly = list.reduce((n, r) => n + r.monthly, 0)
  const billing = list.filter(r => r.monthly > 0 || r.dirty || rows[r.c.id])
  const idle = list.filter(r => !billing.includes(r))
  const visible = showAll ? [...billing, ...idle] : billing
  const soon = list.filter(r => r.monthly > 0 && r.next && (r.next - today) / 86400000 <= 7)

  return (
    <section className="pp-card p-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Storage</h2>
          <div className="text-xs pp-sub">Edit pallets, rate, or start date, then hit ✓. Charges repeat monthly on the start date.</div>
        </div>
        <div className="text-sm">Total: <span className="pp-mono font-semibold">{money(totalMonthly)}</span>/mo</div>
      </div>

      {soon.length > 0 && (
        <div className="text-sm" style={{ color: 'var(--accent)' }}>
          Due in the next 7 days: {soon.map(r => `${r.c.name} ${money(r.monthly)} on ${fmt(r.next)}`).join(' · ')}
        </div>
      )}
      {error && <div className="text-sm" style={{ color: 'var(--bad)' }}>{error}</div>}

      {loading ? <div className="text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left pp-sub">
                {['Client', 'Pallets', '$ / pallet / mo', 'Billing starts', 'Next charge', 'Per month', 'Note', ''].map(h => <th key={h} className="py-2 pr-3 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map(({ c, d, monthly, next, dirty }) => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-2 pr-3 whitespace-nowrap">{c.name}<div className="text-xs pp-sub"><span className="pp-mono">{c.account_code}</span> · {agreed(c).note}</div></td>
                  <td className="py-2 pr-3"><input className="pp-input py-1 text-sm" style={{ width: 80 }} type="number" step="0.5" value={d.pallets ?? ''} placeholder="0" onChange={e => set(c.id, 'pallets', e.target.value)} /></td>
                  <td className="py-2 pr-3"><input className="pp-input py-1 text-sm" style={{ width: 80 }} type="number" value={d.rate ?? ''} onChange={e => set(c.id, 'rate', e.target.value)} /></td>
                  <td className="py-2 pr-3"><input className="pp-input py-1 text-sm" type="date" value={d.start || ''} onChange={e => set(c.id, 'start', e.target.value)} /></td>
                  <td className="py-2 pr-3 pp-mono whitespace-nowrap">{monthly > 0 && next ? fmt(next) : '—'}</td>
                  <td className="py-2 pr-3 pp-mono font-semibold">{monthly > 0 ? money(monthly) : '—'}</td>
                  <td className="py-2 pr-3"><input className="pp-input py-1 text-sm" style={{ minWidth: 140 }} value={d.note || ''} placeholder="e.g. 4 racks + 2 pallets" onChange={e => set(c.id, 'note', e.target.value)} /></td>
                  <td className="py-2">
                    {dirty && (
                      <button onClick={() => save(c)} disabled={savingId === c.id} className="pp-btn pp-btn-accent px-2 py-1 text-xs" title="Save">
                        {savingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {billing.length === 0 && !showAll && <div className="text-sm pp-sub py-3">No one is being billed for storage yet.</div>}
          {idle.length > 0 && (
            <button onClick={() => setShowAll(v => !v)} className="text-xs pp-sub hover:underline mt-2">
              {showAll ? 'Hide' : 'Show'} clients with no storage ({idle.length}) — click to add one
            </button>
          )}
        </div>
      )}
      <div className="text-xs pp-sub">Each client's rate is pre-filled from their agreement. "Billing starts" = the day the free period ends.</div>
    </section>
  )
}
