import React, { useMemo } from 'react'
import { Camera } from 'lucide-react'

export function formatShortDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export function Barcode({ value, height = 34 }) {
  const bars = useMemo(() => {
    let h = 0
    const safe = value || 'ACCOUNT'
    for (let i = 0; i < safe.length; i++) h = (h * 31 + safe.charCodeAt(i)) >>> 0
    const out = []
    for (let i = 0; i < 32; i++) { h = (h * 1103515245 + 12345) >>> 0; out.push((h % 4) + 1) }
    return out
  }, [value])
  return (
    <div className="flex items-end" aria-hidden="true">
      {bars.map((w, i) => <div key={i} style={{ width: w, height, background: 'var(--ink)', marginRight: 2 }} />)}
    </div>
  )
}

export function Stamp({ tone, children }) {
  const colors = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', ink: 'var(--ink)', accent: 'var(--accent)' }
  return <span className="pp-stamp" style={{ color: colors[tone] || colors.ink }}>{children}</span>
}

export function Photos({ urls, count }) {
  const n = urls?.length || count || 0
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: Math.min(n, 4) }).map((_, i) => (
        <div key={i} className="w-9 h-9 rounded border pp-line flex items-center justify-center overflow-hidden" style={{ background: '#F1F0EC' }}>
          {urls?.[i]?.startsWith('http')
            ? <img src={urls[i]} alt="Check-in" className="w-full h-full object-cover" />
            : <Camera size={14} className="pp-sub" />}
        </div>
      ))}
      {n > 4 && <div className="w-9 h-9 rounded border pp-line flex items-center justify-center text-xs pp-sub">+{n - 4}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, accent }) {
  return (
    <div className="pp-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider pp-sub">{label}</div>
      <div className="pp-display text-4xl font-bold mt-1" style={accent ? { color: 'var(--accent)' } : {}}>{value}</div>
      {sub && <div className="text-xs pp-sub mt-1">{sub}</div>}
    </div>
  )
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 gap-3">
      <h2 className="pp-display text-2xl font-bold uppercase tracking-wide">{children}</h2>
      {right}
    </div>
  )
}

export function LoadingCard({ message = 'Loading…' }) {
  return <div className="pp-card p-8 text-center pp-sub text-sm">{message}</div>
}

export function ErrorCard({ message }) {
  return <div className="pp-card p-5 text-sm" style={{ borderColor: 'var(--bad)' }}><b>Something broke:</b> {message}</div>
}
