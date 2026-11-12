import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, X, PhoneCall } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

/* Client board: signed clients split into DTC / Amazon, with status, volume and follow-ups.
   Data lives in the admin-only `client_crm` table (one row per client). */

export const SEGMENTS = [
  ['dtc', 'DTC / Shopify'],
  ['amazon', 'Amazon FBA & OA'],
  ['other', 'Other'],
]

export const STATUSES = {
  active: { label: 'Active', bg: 'rgba(147,191,160,.18)', fg: 'var(--ok)', order: 0 },
  waiting_shipment: { label: 'Waiting for shipment', bg: 'rgba(147,191,160,.12)', fg: 'var(--ok)', order: 1 },
  holding: { label: 'Holding stock', bg: 'rgba(160,165,172,.20)', fg: 'var(--ink)', order: 2 },
  onboarding: { label: 'Onboarding', bg: 'rgba(160,165,172,.20)', fg: 'var(--ink)', order: 3 },
  reached_out: { label: 'Reached out', bg: 'rgba(160,165,172,.14)', fg: 'var(--sub)', order: 4 },
  signed_idle: { label: 'Signed, no inventory', bg: 'rgba(160,165,172,.10)', fg: 'var(--sub)', order: 5 },
  paused: { label: 'Paused', bg: 'rgba(160,165,172,.08)', fg: 'var(--sub)', order: 6 },
  collections: { label: 'Collections', bg: 'rgba(214,120,110,.16)', fg: 'var(--bad)', order: 7 },
}

const CHANNELS = ['email', 'whatsapp', 'text', 'call', 'linkedin', 'in_person']
const blankCrm = { segment: 'amazon', status: 'signed_idle', est_volume: null, volume_unit: 'units', next_action: null, next_date: null, last_touch: null, touch_channel: null, notes: null }

export default function ClientBoard({ clients, selectedId, onSelect }) {
  const [crm, setCrm] = useState({})
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [editId, setEditId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase.from('client_crm').select('*')
    if (err) {
      if (/client_crm/.test(err.message) && /(does not exist|schema cache)/i.test(err.message)) setMissing(true)
      else setError(err.message)
    } else setCrm(Object.fromEntries((data || []).map(r => [r.client_id, r])))
    setLoading(false)
  }

  async function save(clientId, patch) {
    const row = { ...blankCrm, ...(crm[clientId] || {}), ...patch, client_id: clientId, updated_at: new Date().toISOString() }
    setCrm(c => ({ ...c, [clientId]: row }))
    const { error: err } = await supabase.from('client_crm').upsert(row, { onConflict: 'client_id' })
    if (err) setError(err.message)
  }

  const rows = useMemo(() => clients.map(c => ({ client: c, crm: { ...blankCrm, ...(crm[c.id] || {}) } })), [clients, crm])
  const counts = useMemo(() => rows.reduce((m, r) => ({ ...m, [r.crm.status]: (m[r.crm.status] || 0) + 1 }), {}), [rows])

  if (missing) return <div className="text-sm pp-sub">The <span className="pp-mono">client_crm</span> table doesn't exist yet. Run <span className="pp-mono">supabase/migrations/2026-11-12-client-crm.sql</span> in the Supabase SQL editor, then refresh.</div>
  if (loading) return <div className="text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading clients…</div>

  const visible = rows.filter(r => !filter || r.crm.status === filter)
  const byStatus = (a, b) => (STATUSES[a.crm.status]?.order ?? 9) - (STATUSES[b.crm.status]?.order ?? 9) || a.client.name.localeCompare(b.client.name)

  return (
    <div className="space-y-4">
      {error && <div className="text-sm" style={{ color: 'var(--bad)' }}>{error}</div>}

      <div className="flex flex-wrap gap-1.5">
        <Chip active={!filter} onClick={() => setFilter('')} label={`All · ${rows.length}`} />
        {Object.entries(STATUSES).filter(([k]) => counts[k]).map(([k, s]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(filter === k ? '' : k)} label={`${s.label} · ${counts[k]}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SEGMENTS.map(([seg, title]) => {
          const list = visible.filter(r => r.crm.segment === seg).sort(byStatus)
          if (seg === 'other' && list.length === 0) return null
          const vol = list.filter(r => ['active', 'waiting_shipment'].includes(r.crm.status)).reduce((n, r) => n + Number(r.crm.est_volume || 0), 0)
          return (
            <div key={seg} className="rounded p-3" style={{ border: '1px solid var(--line)' }}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="font-semibold text-sm">{title} <span className="pp-sub font-normal">· {list.length}</span></div>
                {vol > 0 && <div className="text-xs pp-sub">~{vol.toLocaleString()} {seg === 'dtc' ? 'orders' : 'units'}/mo active</div>}
              </div>
              {list.length === 0 && <div className="text-sm pp-sub py-2">None.</div>}
              {list.map(({ client: c, crm: r }) => (
                <ClientRow
                  key={c.id}
                  client={c}
                  crm={r}
                  selected={c.id === selectedId}
                  editing={editId === c.id}
                  onSelect={() => onSelect(c.id === selectedId ? '' : c.id)}
                  onEdit={() => setEditId(editId === c.id ? null : c.id)}
                  onSave={patch => save(c.id, patch)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ClientRow({ client: c, crm: r, selected, editing, onSelect, onEdit, onSave }) {
  const st = STATUSES[r.status] || STATUSES.signed_idle
  const [channel, setChannel] = useState(r.touch_channel || 'email')
  return (
    <div className="py-2.5 border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-start gap-2">
        <button onClick={onSelect} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium" style={selected ? { color: 'var(--accent)' } : undefined}>{c.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.fg }}>{st.label}</span>
          </div>
          <div className="text-xs pp-sub mt-0.5 flex flex-wrap gap-x-3">
            <span className="pp-mono">{c.account_code}</span>
            {r.est_volume ? <span>~{Number(r.est_volume).toLocaleString()} {r.volume_unit}/mo</span> : <span>volume unknown</span>}
            {r.last_touch && <span>{labelize(r.touch_channel || 'contacted')} {daysAgoLabel(r.last_touch)}</span>}
          </div>
          {r.next_action && (
            <div className="text-sm mt-0.5" style={{ color: 'var(--ink)', opacity: 0.85 }}>
              {r.next_date && <span className="pp-mono pp-sub mr-1.5">{shortDate(r.next_date)}</span>}{r.next_action}
            </div>
          )}
        </button>
        <button onClick={onEdit} className="pp-btn-ghost p-1.5" title="Edit">{editing ? <X size={14} /> : <Pencil size={14} />}</button>
      </div>

      {editing && (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <select className="pp-input py-1.5 text-sm" value={r.segment} onChange={e => onSave({ segment: e.target.value })}>
            {SEGMENTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select className="pp-input py-1.5 text-sm" value={r.status} onChange={e => onSave({ status: e.target.value })}>
            {Object.entries(STATUSES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
          <input type="number" min="0" className="pp-input py-1.5 text-sm" placeholder="Est. volume/mo" defaultValue={r.est_volume ?? ''}
            onBlur={e => { const v = e.target.value === '' ? null : Number(e.target.value); if (v !== r.est_volume) onSave({ est_volume: v }) }} />
          <select className="pp-input py-1.5 text-sm" value={r.volume_unit} onChange={e => onSave({ volume_unit: e.target.value })}>
            <option value="units">units/mo</option>
            <option value="orders">orders/mo</option>
          </select>
          <input className="pp-input py-1.5 text-sm col-span-2 sm:col-span-3" placeholder="Next step" defaultValue={r.next_action || ''}
            onBlur={e => e.target.value !== (r.next_action || '') && onSave({ next_action: e.target.value || null })} />
          <input key={r.next_date || 'none'} type="date" className="pp-input py-1.5 text-sm col-span-2 sm:col-span-1" defaultValue={r.next_date || ''}
            onChange={e => onSave({ next_date: e.target.value || null })} />
          <textarea className="pp-input py-1.5 text-sm col-span-2 sm:col-span-4" rows={2} placeholder="Notes" defaultValue={r.notes || ''}
            onBlur={e => e.target.value !== (r.notes || '') && onSave({ notes: e.target.value || null })} />
          <select className="pp-input py-1.5 text-sm" value={channel} onChange={e => setChannel(e.target.value)}>
            {CHANNELS.map(ch => <option key={ch} value={ch}>{labelize(ch)}</option>)}
          </select>
          <button onClick={() => onSave({ last_touch: localISO(new Date()), touch_channel: channel })} className="pp-btn-ghost px-2 py-1.5 text-xs flex items-center justify-center gap-1 col-span-1 sm:col-span-3 sm:justify-start">
            <PhoneCall size={12} /> Contacted today
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, label }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1 text-xs rounded-full"
      style={active ? { background: 'var(--accent)', color: '#fff', fontWeight: 600 } : { border: '1px solid var(--line)', color: 'var(--ink)' }}>
      {label}
    </button>
  )
}

function localISO(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
function daysAgoLabel(d) { const n = Math.round((startOfToday() - new Date(String(d).slice(0, 10) + 'T00:00:00')) / 86400000); return n <= 0 ? 'today' : n === 1 ? '1d ago' : `${n}d ago` }
function shortDate(d) { return new Date(String(d).slice(0, 10) + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
function labelize(v) { return String(v || '').replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }
