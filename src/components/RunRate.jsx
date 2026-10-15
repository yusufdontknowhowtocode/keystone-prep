import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

/* Run-rate estimator: estimated monthly income from current clients/ventures.
   Rows live in `income_sources` (supabase/migrations/2026-10-15-income-sources.sql).
   After-tax uses the same ~30% rate as projection v1. */

const TAX = 0.30
const blank = { name: '', kind: 'client', monthly_revenue: '', monthly_cost: '' }

function money(n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString() }

export default function RunRate({ neededPerMonth }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(blank)

  async function load() {
    const { data, error: err } = await supabase.from('income_sources').select('*').order('created_at')
    setLoading(false)
    if (err) return setMissing(true)
    setRows(data || [])
  }
  useEffect(() => { load() }, [])

  async function update(id, patch) {
    setRows(rs => rs.map(r => (r.id === id ? { ...r, ...patch } : r)))
    const { error: err } = await supabase.from('income_sources').update(patch).eq('id', id)
    if (err) setError(err.message)
  }
  async function remove(r) {
    if (!window.confirm(`Remove ${r.name}?`)) return
    setRows(rs => rs.filter(x => x.id !== r.id))
    const { error: err } = await supabase.from('income_sources').delete().eq('id', r.id)
    if (err) setError(err.message)
  }
  async function add(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const { error: err } = await supabase.from('income_sources').insert({
      name: form.name.trim(), kind: form.kind,
      monthly_revenue: Number(form.monthly_revenue || 0), monthly_cost: Number(form.monthly_cost || 0),
    })
    if (err) return setError(err.message)
    setForm(blank)
    load()
  }

  if (loading) return <div className="pp-card p-4 text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading estimate…</div>
  if (missing) return <div className="pp-card p-4 text-sm pp-sub">The <span className="pp-mono">income_sources</span> table doesn't exist yet. Run <span className="pp-mono">supabase/migrations/2026-10-15-income-sources.sql</span> in the Supabase SQL editor, then refresh.</div>

  const active = rows.filter(r => r.active)
  const revenue = active.reduce((n, r) => n + Number(r.monthly_revenue || 0), 0)
  const cost = active.reduce((n, r) => n + Number(r.monthly_cost || 0), 0)
  const pre = revenue - cost
  const after = pre > 0 ? pre * (1 - TAX) : pre
  const pct = neededPerMonth > 0 ? Math.max(0, (after / neededPerMonth) * 100) : 0

  return (
    <section className="pp-card p-4 space-y-3">
      {error && <div className="text-sm" style={{ color: 'var(--bad)' }}>{error}</div>}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-semibold">Estimated monthly income (current clients)</h2>
        <div className="text-xs pp-sub">Estimates — toggle or edit to update</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Revenue / mo" value={money(revenue)} />
        <Stat label="Costs / mo" value={money(cost)} />
        <Stat label="Profit / mo (after tax)" value={money(after)} sub={`${money(pre)} pre-tax`} bad={after < 0} />
        <Stat label="vs needed" value={`${pct.toFixed(1)}%`} sub={`of ${money(neededPerMonth)}/mo`} bad={pct < 100} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left pp-sub text-xs uppercase"><th className="py-1 font-medium">On</th><th className="font-medium">Client / venture</th><th className="font-medium text-right">Revenue/mo</th><th className="font-medium text-right">Cost/mo</th><th className="font-medium text-right">Profit/mo</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t align-top" style={{ borderColor: 'var(--line)', opacity: r.active ? 1 : 0.45 }}>
                <td className="py-2 pr-2"><input type="checkbox" checked={r.active} onChange={e => update(r.id, { active: e.target.checked })} /></td>
                <td className="py-2 pr-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs pp-sub">{r.kind}{r.note ? ` · ${r.note}` : ''}</div>
                </td>
                <td className="py-1.5 pr-2 text-right"><Num value={r.monthly_revenue} onSave={v => update(r.id, { monthly_revenue: v })} /></td>
                <td className="py-1.5 pr-2 text-right"><Num value={r.monthly_cost} onSave={v => update(r.id, { monthly_cost: v })} /></td>
                <td className="py-2 pr-2 text-right pp-mono">{money(Number(r.monthly_revenue || 0) - Number(r.monthly_cost || 0))}</td>
                <td className="py-2 text-right"><button onClick={() => remove(r)} className="pp-btn-ghost p-1" title="Remove"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <input className="pp-input col-span-2" placeholder="Client or venture" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <select className="pp-input" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
          <option value="client">client</option><option value="venture">venture</option><option value="expense">expense</option>
        </select>
        <input className="pp-input" type="number" placeholder="Revenue/mo" value={form.monthly_revenue} onChange={e => setForm({ ...form, monthly_revenue: e.target.value })} />
        <input className="pp-input" type="number" placeholder="Cost/mo" value={form.monthly_cost} onChange={e => setForm({ ...form, monthly_cost: e.target.value })} />
        <button className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center justify-center gap-1 col-span-2 sm:col-span-5"><Plus size={14} /> Add</button>
      </form>
      <div className="text-xs pp-sub">After-tax uses ~30% (same as the plan). Costs = materials/fees tied to each client; your own time isn't counted.</div>
    </section>
  )
}

function Num({ value, onSave }) {
  return (
    <input
      key={value}
      type="number"
      className="pp-input py-1 text-sm text-right w-24 pp-mono"
      defaultValue={value}
      onBlur={e => { const v = Number(e.target.value || 0); if (v !== Number(value)) onSave(v) }}
    />
  )
}

function Stat({ label, value, sub, bad }) {
  return (
    <div className="pp-card p-3" style={bad ? { borderColor: 'var(--bad)' } : undefined}>
      <div className="text-xs pp-sub uppercase tracking-wide">{label}</div>
      <div className="pp-mono text-xl font-bold mt-1" style={bad ? { color: 'var(--bad)' } : undefined}>{value}</div>
      {sub && <div className="text-xs pp-sub mt-0.5">{sub}</div>}
    </div>
  )
}
