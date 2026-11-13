import React, { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

/* ============================================================
   MARKETING — spend vs results per channel.
   Spend: one row per channel per month in `marketing_spend`, typed in by hand.
   Results: `leads.channel` (what brought them). Website form leads are tagged
   automatically from the ad click (lib/attribution.js); everything else is
   tagged here. Migration: supabase/migrations/2026-11-13-marketing.sql
   ============================================================ */

export const CHANNELS = [
  'Google Ads – FBA',
  'Google Ads – DTC',
  'Meta Ads',
  'PrepMarketplace',
  'Amazon SPN',
  '3P Mercury',
  'Google search (organic)',
  'Referral – Leonardo',
  'Referral – Leon',
  'Referral – Glen',
  'Referral – client / word of mouth',
  '3PL / partner outreach',
  'Cold outreach (email / LinkedIn)',
  'LinkedIn',
  'Reddit',
  'Website – unattributed',
  'Other',
]
const UNTAGGED = 'Untagged'
const ADVANCED = ['quoted', 'agreement_sent', 'signed']

const pad = (n) => String(n).padStart(2, '0')
const ym = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
function money(n) { return n == null ? '—' : '$' + Math.round(n).toLocaleString() }
function monthLabel(m) { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) }

function periodRange(period) {
  const now = new Date()
  if (period === 'this') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null }
  if (period === 'last') return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1) }
  if (period === '90') return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1), to: null }
  return { from: null, to: null }
}
function inRange(date, { from, to }) {
  if (!date) return false
  const d = new Date(date)
  return (!from || d >= from) && (!to || d < to)
}

export default function MarketingTab() {
  const [leads, setLeads] = useState([])
  const [spend, setSpend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('this')
  const [spendMonth, setSpendMonth] = useState(ym(new Date()))
  const [showAllLeads, setShowAllLeads] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const [l, s] = await Promise.all([
      supabase.from('leads').select('id,created_at,brand,name,source,channel,stage').order('created_at', { ascending: false }),
      supabase.from('marketing_spend').select('*').order('month'),
    ])
    setLoading(false)
    if (l.error || s.error) return setError((l.error || s.error).message)
    setLeads(l.data || [])
    setSpend(s.data || [])
  }
  useEffect(() => { load() }, [])

  const channels = useMemo(() => {
    const extra = [...leads.map(l => l.channel), ...spend.map(s => s.channel)].filter(c => c && !CHANNELS.includes(c))
    return [...CHANNELS, ...new Set(extra)]
  }, [leads, spend])

  const range = periodRange(period)

  const rows = useMemo(() => {
    const by = {}
    const get = (c) => (by[c] ||= { channel: c, spend: 0, leads: 0, advanced: 0, signed: 0 })
    for (const s of spend) {
      // a month counts if its first day falls in the period
      if (period === 'all' || inRange(s.month + 'T00:00:00', range)) get(s.channel).spend += Number(s.amount) || 0
    }
    for (const l of leads) {
      if (period !== 'all' && !inRange(l.created_at, range)) continue
      const r = get(l.channel || UNTAGGED)
      r.leads++
      if (ADVANCED.includes(l.stage)) r.advanced++
      if (l.stage === 'signed') r.signed++
    }
    return Object.values(by).sort((a, b) => (b.spend - a.spend) || (b.leads - a.leads))
  }, [leads, spend, period])

  const total = rows.reduce((t, r) => ({ spend: t.spend + r.spend, leads: t.leads + r.leads, advanced: t.advanced + r.advanced, signed: t.signed + r.signed }), { spend: 0, leads: 0, advanced: 0, signed: 0 })
  const untagged = leads.filter(l => !l.channel)

  async function setChannel(id, channel) {
    const { error: err } = await supabase.from('leads').update({ channel: channel || null }).eq('id', id)
    if (err) return setError(err.message)
    setLeads(ls => ls.map(l => (l.id === id ? { ...l, channel: channel || null } : l)))
  }

  async function saveSpend(channel, value) {
    const month = spendMonth + '-01'
    const existing = spend.find(s => s.channel === channel && s.month === month)
    const amount = value === '' ? 0 : Number(value)
    if (Number.isNaN(amount)) return
    if (existing && Number(existing.amount) === amount) return
    if (!existing && amount === 0) return
    const { data, error: err } = await supabase.from('marketing_spend')
      .upsert({ channel, month, amount }, { onConflict: 'channel,month' }).select().single()
    if (err) return setError(err.message)
    setSpend(ss => [...ss.filter(s => !(s.channel === channel && s.month === month)), data])
  }

  if (loading) return <div className="pp-card p-4 text-sm pp-sub flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</div>

  const monthOptions = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); return ym(d) })
  const spendFor = (c) => spend.find(s => s.channel === c && s.month === spendMonth + '-01')?.amount ?? ''
  const periodLeads = leads.filter(l => period === 'all' || inRange(l.created_at, range))

  return (
    <div className="space-y-4">
      {error && <div className="pp-card p-3 text-sm" style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}>{error.includes('marketing_spend') ? 'Run supabase/migrations/2026-11-13-marketing.sql first. ' : ''}{error}</div>}

      <section className="pp-card p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <h2 className="font-semibold">Marketing</h2>
            <div className="text-xs pp-sub">Spend vs leads by channel · "Quoted+" = quoted, agreement sent or signed</div>
          </div>
          <select className="pp-input py-1.5 text-sm" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="this">This month</option>
            <option value="last">Last month</option>
            <option value="90">Last 3 months</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left pp-sub text-xs">
                <th className="py-2 pr-3 font-medium">Channel</th>
                <th className="py-2 px-2 font-medium text-right">Spend</th>
                <th className="py-2 px-2 font-medium text-right">Leads</th>
                <th className="py-2 px-2 font-medium text-right">Quoted+</th>
                <th className="py-2 px-2 font-medium text-right">Signed</th>
                <th className="py-2 px-2 font-medium text-right">$ / lead</th>
                <th className="py-2 pl-2 font-medium text-right">$ / signed</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="py-3 pp-sub">Nothing in this period yet.</td></tr>}
              {rows.map(r => (
                <tr key={r.channel} className="border-t" style={{ borderColor: 'var(--line)', opacity: r.channel === UNTAGGED ? 0.7 : 1 }}>
                  <td className="py-2 pr-3">{r.channel}</td>
                  <td className="py-2 px-2 text-right pp-mono">{r.spend ? money(r.spend) : '—'}</td>
                  <td className="py-2 px-2 text-right pp-mono">{r.leads}</td>
                  <td className="py-2 px-2 text-right pp-mono">{r.advanced}</td>
                  <td className="py-2 px-2 text-right pp-mono" style={r.signed ? { color: 'var(--ok)', fontWeight: 600 } : undefined}>{r.signed}</td>
                  <td className="py-2 px-2 text-right pp-mono">{r.spend && r.leads ? money(r.spend / r.leads) : r.spend ? 'no leads' : '—'}</td>
                  <td className="py-2 pl-2 text-right pp-mono" style={r.spend && !r.signed ? { color: 'var(--bad)' } : undefined}>{r.spend && r.signed ? money(r.spend / r.signed) : r.spend ? 'none yet' : '—'}</td>
                </tr>
              ))}
              {rows.length > 0 && (
                <tr className="border-t font-semibold" style={{ borderColor: 'var(--line)' }}>
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 px-2 text-right pp-mono">{money(total.spend)}</td>
                  <td className="py-2 px-2 text-right pp-mono">{total.leads}</td>
                  <td className="py-2 px-2 text-right pp-mono">{total.advanced}</td>
                  <td className="py-2 px-2 text-right pp-mono">{total.signed}</td>
                  <td className="py-2 px-2 text-right pp-mono">{total.spend && total.leads ? money(total.spend / total.leads) : '—'}</td>
                  <td className="py-2 pl-2 text-right pp-mono">{total.spend && total.signed ? money(total.spend / total.signed) : '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {untagged.length > 0 && (
        <section className="pp-card p-4">
          <h3 className="font-semibold">Untagged leads · {untagged.length}</h3>
          <div className="text-xs pp-sub mb-2">Pick what brought each one. "Source" is just how they contacted us.</div>
          {untagged.map(l => <LeadRow key={l.id} l={l} channels={channels} onChange={setChannel} />)}
        </section>
      )}

      <section className="pp-card p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <div>
            <h3 className="font-semibold">Spend</h3>
            <div className="text-xs pp-sub">Type what you paid each channel that month (ads, subscriptions, referral fees). Saves when you leave the box.</div>
          </div>
          <select className="pp-input py-1.5 text-sm" style={{ width: 'auto' }} value={spendMonth} onChange={e => setSpendMonth(e.target.value)}>
            {monthOptions.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {channels.map(c => (
            <label key={c + spendMonth} className="flex items-center justify-between gap-3 py-1.5 border-t text-sm" style={{ borderColor: 'var(--line)' }}>
              <span>{c}</span>
              <input type="number" step="0.01" min="0" inputMode="decimal" className="pp-input py-1 text-sm pp-mono text-right" style={{ width: 110 }}
                defaultValue={spendFor(c)} placeholder="0" onBlur={e => saveSpend(c, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="pp-card p-4">
        <button onClick={() => setShowAllLeads(s => !s)} className="text-sm font-semibold hover:underline">
          {showAllLeads ? 'Hide' : 'Show'} all leads in this period ({periodLeads.length}) to re-tag
        </button>
        {showAllLeads && periodLeads.map(l => <LeadRow key={l.id} l={l} channels={channels} onChange={setChannel} />)}
      </section>
    </div>
  )
}

function LeadRow({ l, channels, onChange }) {
  return (
    <div className="py-2 border-t grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-sm" style={{ borderColor: 'var(--line)' }}>
      <div className="sm:col-span-2 min-w-0">
        <div className="font-medium truncate">{l.brand || l.name || '—'}</div>
        <div className="text-xs pp-sub">{new Date(l.created_at).toLocaleDateString()} · {l.stage || 'new'} · source: {l.source || '—'}</div>
      </div>
      <select className="pp-input py-1.5 text-sm" value={l.channel || ''} onChange={e => onChange(l.id, e.target.value)}>
        <option value="">— pick channel —</option>
        {channels.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  )
}
