import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import RunRate from './RunRate.jsx'

/* ============================================================
   $1M GOAL — cumulative after-tax profit vs the plan (projection v1, Oct 15 2026).
   Actuals: one row per month in `goal_months` (supabase/migrations/2026-10-15-goal-months.sql),
   entered by hand from the bookkeeping sheet.
   Plan lines are estimates: baseline = Keystone revenue +$600/mo each month,
   stretch = +$1,500/mo; Lovetto ~3,000 units at ~$7 net in 2027; taxes ~30%.
   ============================================================ */

const GOAL = 1000000
const DEADLINE = '2028-10'
const PLAN_START = '2026-11'
const BASELINE = [-4403, -2379, 849, 4462, 8463, 12849, 17622, 22782, 28328, 32510, 37079, 42034, 47375, 53103, 59217, 65718, 72605, 79879, 87538, 95585, 103201, 111203, 119592, 128367]
const STRETCH = [-4403, -1799, 2587, 7940, 12509, 18043, 24544, 32011, 40443, 49842, 60207, 71537, 81384, 92197, 103975, 113920, 124831, 136707, 149550, 163359, 177317, 192241, 208131, 224987]

function addMonths(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
function monthsBetween(a, b) { const [ay, am] = a.split('-').map(Number); const [by, bm] = b.split('-').map(Number); return (by - ay) * 12 + (bm - am) }
function thisMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
function money(n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString() }
function label(ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) }

export default function GoalTracker() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ month: addMonths(thisMonth(), -1), profit: '', note: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase.from('goal_months').select('*').order('month')
    setLoading(false)
    if (err) { setMissing(true); return }
    setRows(data || [])
  }
  useEffect(() => { load() }, [])
  // Default the form to the month after the latest entry.
  useEffect(() => { if (rows.length) setForm(f => ({ ...f, month: addMonths(rows[rows.length - 1].month, 1) })) }, [rows])

  const planMonths = useMemo(() => BASELINE.map((_, i) => addMonths(PLAN_START, i)), [])

  // Cumulative actual by month (only months that have an entry, in order).
  const actual = useMemo(() => {
    let cum = 0
    return rows.map(r => { cum += Number(r.profit || 0); return { month: r.month, cum } })
  }, [rows])

  const cumNow = actual.length ? actual[actual.length - 1].cum : 0
  const lastMonth = actual.length ? actual[actual.length - 1].month : addMonths(PLAN_START, -1)
  const monthsLeft = Math.max(1, monthsBetween(lastMonth, DEADLINE))
  const neededPerMonth = (GOAL - cumNow) / monthsLeft
  const planIdx = planMonths.indexOf(lastMonth)
  const baseNow = planIdx >= 0 ? BASELINE[planIdx] : null
  const stretchNow = planIdx >= 0 ? STRETCH[planIdx] : null

  async function save(e) {
    e.preventDefault()
    if (!/^\d{4}-\d{2}$/.test(form.month) || form.profit === '') return
    setSaving(true)
    const { error: err } = await supabase.from('goal_months').upsert({ month: form.month, profit: Number(form.profit), note: form.note || null, updated_at: new Date().toISOString() })
    setSaving(false)
    if (err) return setError(err.message)
    setForm(f => ({ ...f, profit: '', note: '' }))
    load()
  }

  if (loading) return <div className="pp-card p-4 text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading goal…</div>
  if (missing) return <div className="pp-card p-4 text-sm pp-sub">The <span className="pp-mono">goal_months</span> table doesn't exist yet. Run <span className="pp-mono">supabase/migrations/2026-10-15-goal-months.sql</span> in the Supabase SQL editor, then refresh.</div>

  return (
    <section className="space-y-4">
      {error && <div className="pp-card p-3 text-sm" style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }}>{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Cumulative (after tax)" value={money(cumNow)} sub={`through ${label(lastMonth)}`} bad={cumNow < 0} />
        <Stat label="Of $1M goal" value={`${Math.max(0, (cumNow / GOAL) * 100).toFixed(1)}%`} sub={`deadline ${label(DEADLINE)}`} />
        <Stat label="Needed / month" value={money(neededPerMonth)} sub={`${monthsLeft} months left`} bad />
        <Stat label="vs plan" value={baseNow == null ? '—' : money(cumNow - baseNow)} sub={baseNow == null ? 'plan starts Nov 26' : `baseline ${money(baseNow)} · stretch ${money(stretchNow)}`} bad={baseNow != null && cumNow < baseNow} />
      </div>

      <RunRate neededPerMonth={neededPerMonth} />

      <div className="pp-card p-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="font-semibold">Cumulative profit vs plan</h2>
          <div className="text-xs pp-sub flex gap-3">
            <Key color="var(--accent, #3b82f6)" label="Actual" />
            <Key color="var(--ok, #16a34a)" label="Stretch" dashed />
            <Key color="currentColor" label="Baseline" dashed />
          </div>
        </div>
        <Chart planMonths={planMonths} actual={actual} />
        <div className="text-xs pp-sub mt-2">Plan lines are estimates from projection v1. At this scale the $1M goal line sits far above both plans; the gap is the point.</div>
      </div>

      <div className="pp-card p-4 space-y-3">
        <h2 className="font-semibold">Log a month</h2>
        <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className="pp-input" type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
          <input className="pp-input" type="number" step="0.01" placeholder="After-tax profit ($)" value={form.profit} onChange={e => setForm({ ...form, profit: e.target.value })} />
          <input className="pp-input" placeholder="Note (optional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <button className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center justify-center gap-1" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </form>
        <div className="text-xs pp-sub">Same month again overwrites it. Use after-tax profit across Keystone + Lovetto + your KT cut.</div>
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead><tr className="text-left pp-sub text-xs uppercase"><th className="py-1 font-medium">Month</th><th className="font-medium text-right">Profit</th><th className="font-medium text-right">Cumulative</th><th className="font-medium pl-3">Note</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.month} className="border-t" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-1.5 pp-mono">{r.month}</td>
                  <td className="text-right pp-mono" style={Number(r.profit) < 0 ? { color: 'var(--bad)' } : undefined}>{money(Number(r.profit))}</td>
                  <td className="text-right pp-mono">{money(actual[i].cum)}</td>
                  <td className="pl-3 text-xs pp-sub">{r.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function Stat({ label, value, sub, bad }) {
  return (
    <div className="pp-card p-3" style={bad ? { borderColor: 'var(--bad)' } : undefined}>
      <div className="text-xs pp-sub uppercase tracking-wide">{label}</div>
      <div className="pp-mono text-xl font-bold mt-1" style={bad ? { color: 'var(--bad)' } : undefined}>{value}</div>
      <div className="text-xs pp-sub mt-0.5">{sub}</div>
    </div>
  )
}

function Key({ color, label, dashed }) {
  return <span className="flex items-center gap-1"><svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2" strokeDasharray={dashed ? '4 3' : undefined} /></svg>{label}</span>
}

function Chart({ planMonths, actual }) {
  const W = 640, H = 220, P = { l: 56, r: 24, t: 10, b: 24 }
  const months = [addMonths(PLAN_START, -1), ...planMonths]
  const idx = m => monthsBetween(months[0], m)
  const all = [...BASELINE, ...STRETCH, ...actual.map(a => a.cum), 0]
  const yMax = Math.max(...all) * 1.1, yMin = Math.min(...all) * 1.1
  const x = i => P.l + (i / (months.length - 1)) * (W - P.l - P.r)
  const y = v => P.t + (1 - (v - yMin) / (yMax - yMin)) * (H - P.t - P.b)
  const path = pts => pts.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const span = yMax - yMin
  // Skip the negative tick when it sits too close to $0 (labels would overlap).
  const ticks = [yMin, 0, yMax / 2, yMax].filter(v => v === 0 || Math.abs(v) / span > 0.08).map(v => Math.round(v / 1000) * 1000)
  const actualPts = actual.filter(a => idx(a.month) >= 0 && idx(a.month) < months.length).map(a => [idx(a.month), a.cum])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" role="img" aria-label="Cumulative profit vs baseline and stretch plans">
      {ticks.map(t => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">{money(t)}</text>
        </g>
      ))}
      {[0, 6, 12, 18, 24].map(i => <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">{label(months[i])}</text>)}
      <path d={path(BASELINE.map((v, i) => [i + 1, v]))} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={path(STRETCH.map((v, i) => [i + 1, v]))} fill="none" stroke="var(--ok, #16a34a)" strokeWidth="1.5" strokeDasharray="4 3" />
      {actualPts.length > 0 && <path d={path(actualPts)} fill="none" stroke="var(--accent, #3b82f6)" strokeWidth="2.5" />}
      {actualPts.map(([i, v]) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--accent, #3b82f6)" />)}
    </svg>
  )
}
