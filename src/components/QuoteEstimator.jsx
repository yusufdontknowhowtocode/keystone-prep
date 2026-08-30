import React, { useMemo, useState } from 'react'
import { Calculator, Check, Loader2, Send } from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase.js'

/* ============================================================
   RATE SHEET — keep in sync with src/pages/Admin.jsx
   ============================================================ */
const TIERS = [
  { max: 999, rate: 0.65, label: 'Under 1,000 units/mo' },
  { max: 4999, rate: 0.60, label: '1,000–5,000 units/mo' },
  { max: Infinity, rate: 0.55, label: '5,000+ units/mo' },
]

const ADDONS = [
  { key: 'polybag', label: 'Polybagging', rate: 0.25, hint: 'Bagged before boxing' },
  { key: 'bubble', label: 'Bubble wrap', rate: 0.40, hint: 'Fragile or glass items' },
  { key: 'bundle', label: 'Bundling / multipacks', rate: 0.50, hint: 'Per unit going into a bundle' },
]

const FREE_TRIAL_UNITS = 100

const PRODUCT_TYPES = [
  'General merchandise', 'Grocery / consumables', 'Health & personal care',
  'Pet supplies', 'Apparel', 'Home & kitchen', 'Toys & games', 'Other',
]

const SHIP_WINDOWS = ['Within 2 weeks', '2–4 weeks', '1–2 months', 'Just exploring']

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

export default function QuoteEstimator() {
  const [units, setUnits] = useState(500)
  const [addons, setAddons] = useState({})
  const [form, setForm] = useState({ name: '', email: '', brand: '', phone: '', product_type: '', ship_window: '', notes: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const tier = useMemo(() => TIERS.find(t => Number(units || 0) <= t.max) || TIERS[TIERS.length - 1], [units])

  const addonRate = useMemo(
    () => ADDONS.reduce((sum, a) => sum + (addons[a.key] ? a.rate : 0), 0),
    [addons]
  )

  const perUnit = tier.rate + addonRate
  const monthly = Number(units || 0) * perUnit
  const trialCredit = Math.min(Number(units || 0), FREE_TRIAL_UNITS) * tier.rate
  const firstMonth = Math.max(monthly - trialCredit, 0)

  const selectedPrep = ADDONS.filter(a => addons[a.key]).map(a => a.label)

  function set(key, value) { setForm(f => ({ ...f, [key]: value })) }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.trim()) return setError('Email is required so we can send your quote.')

    setSending(true)

    const source = new URLSearchParams(window.location.search).get('src') || 'organic'


    const payload = {
        source,
        name: form.name.trim() || null,
        email: form.email.trim(),
        brand: form.brand.trim() || null,
        phone: form.phone.trim() || null,
        product_type: form.product_type || null,
        monthly_units: Number(units) || null,
        prep_needs: selectedPrep,
        ship_window: form.ship_window || null,
        notes: form.notes.trim() || null,
        est_rate: Number(perUnit.toFixed(4)),
        est_monthly: Number(monthly.toFixed(2)),
    }

    // 1. Durable record in Supabase. Failure here shouldn't block the email.
    let dbFailed = false
    if (hasSupabaseConfig) {
      const { error: dbError } = await supabase.from('leads').insert(payload)
      if (dbError) { dbFailed = true; console.error('Lead insert failed:', dbError.message) }
    }

    // 2. Email notification via Web3Forms.
    let mailFailed = false
    if (WEB3FORMS_KEY) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `New prep quote request — ${form.brand || form.email}`,
            from_name: 'Keystone Prep Center',
            name: payload.name || '—',
            email: payload.email,
            brand: payload.brand || '—',
            phone: payload.phone || '—',
            product_type: payload.product_type || '—',
            monthly_units: payload.monthly_units || '—',
            prep_needs: selectedPrep.length ? selectedPrep.join(', ') : 'FNSKU only',
            ship_window: payload.ship_window || '—',
            estimated_rate: `$${perUnit.toFixed(2)}/unit`,
            estimated_monthly: money(monthly),
            notes: payload.notes || '—',
          }),
        })
        const json = await res.json()
        if (!json.success) mailFailed = true
      } catch { mailFailed = true }
    } else {
      mailFailed = true
    }

    setSending(false)

    if (dbFailed && mailFailed) {
      setError("Something went wrong sending that. Email us directly and we'll get straight back to you.")
      return
    }
        if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
    }
    setSent(true)
  }

  if (sent) {
    return (
      <section className="pp-card p-6 sm:p-8 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ background: 'var(--ok)' }}>
          <Check size={24} color="#fff" />
        </div>
        <h2 className="pp-display text-3xl font-bold uppercase">Got it</h2>
        <p className="text-sm pp-sub mt-2 max-w-md mx-auto">
          Your estimate came out around <span className="pp-mono">${perUnit.toFixed(2)}/unit</span>. We'll confirm your exact rate by email, usually within a couple of hours.
        </p>
        <p className="text-xs pp-sub mt-4">Your first test shipment (up to {FREE_TRIAL_UNITS} units) is on us either way — no card, no commitment.</p>
                <button
          onClick={() => { setSent(false); setError('') }}
          className="pp-btn-ghost px-4 py-2 text-sm mt-4"
        >
          Send another request
        </button>
      </section>
    )
  }

  return (
    <section className="pp-card p-5 sm:p-7 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Calculator size={18} className="pp-accent" />
        <h2 className="pp-display text-3xl sm:text-4xl font-bold uppercase">Estimate your cost</h2>
      </div>
      <p className="text-sm pp-sub mt-1">
        Move the numbers around to see where you'd land. Your first test shipment — up to {FREE_TRIAL_UNITS} units — is on us.
      </p>

      <form onSubmit={submit} className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* ---------- LEFT: the calculator ---------- */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold">Units per month</label>
            <input
              type="range" min="100" max="10000" step="100"
              value={Math.min(Number(units) || 100, 10000)}
              onChange={e => setUnits(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: 'var(--accent)' }}
            />
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number" min="1"
                className="pp-input py-1.5 text-sm"
                style={{ width: 110 }}
                value={units}
                onChange={e => setUnits(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <span className="text-xs pp-sub">{tier.label} · ${tier.rate.toFixed(2)}/unit base</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Extra prep needed?</div>
            <div className="text-xs pp-sub">Only billed on SKUs that actually need it.</div>
            <div className="mt-2 space-y-2">
              {ADDONS.map(a => (
                <label key={a.key} className="flex items-start gap-2.5 p-2.5 rounded cursor-pointer border" style={{ borderColor: addons[a.key] ? 'var(--accent)' : 'var(--line)' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(addons[a.key])}
                    onChange={e => setAddons(prev => ({ ...prev, [a.key]: e.target.checked }))}
                    className="mt-0.5"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.label} <span className="pp-mono pp-sub">+${a.rate.toFixed(2)}</span></div>
                    <div className="text-xs pp-sub">{a.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ---------- the number ---------- */}
          <div className="p-4 rounded" style={{ background: 'var(--card)', border: '2px solid var(--ink)' }}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide pp-sub">All-in per unit</div>
                <div className="pp-display text-4xl font-bold leading-none">${perUnit.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide pp-sub">Typical month</div>
                <div className="pp-display text-3xl font-bold leading-none">{money(monthly)}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 text-sm flex items-center justify-between" style={{ borderTop: '1px solid var(--line)' }}>
              <span>First shipment, after {FREE_TRIAL_UNITS} free units</span>
              <span className="pp-mono font-bold" style={{ color: 'var(--ok)' }}>{money(firstMonth)}</span>
            </div>
            <p className="text-xs pp-sub mt-2">
              Estimate only — we confirm your exact rate by email once we know your SKUs. Storage is billed separately at $25/pallet/month.
            </p>
          </div>
        </div>

        {/* ---------- RIGHT: who are you ---------- */}
        <div className="space-y-3">
          <Field label="Your name">
            <input className="pp-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
          </Field>
          <Field label="Email" required>
            <input className="pp-input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@brand.com" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Amazon store / brand">
              <input className="pp-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand name" />
            </Field>
            <Field label="Phone (optional)">
              <input className="pp-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="215-555-0100" />
            </Field>
          </div>
          <Field label="Product type">
            <select className="pp-input" value={form.product_type} onChange={e => set('product_type', e.target.value)}>
              <option value="">Select…</option>
              {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="When would you send a first shipment?">
            <select className="pp-input" value={form.ship_window} onChange={e => set('ship_window', e.target.value)}>
              <option value="">Select…</option>
              {SHIP_WINDOWS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Anything else we should know?">
            <textarea className="pp-input min-h-20" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Expiration dates, fragile items, case packs…" />
          </Field>

          {error && <div className="text-sm p-3 rounded" style={{ background: '#FEF2F2', color: 'var(--bad)' }}>{error}</div>}

          <button className="pp-btn pp-btn-accent w-full py-3 flex items-center justify-center gap-2" disabled={sending}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? 'Sending…' : 'Send me an exact quote'}
          </button>
          <p className="text-xs pp-sub text-center">No card required. We reply personally, usually within a couple of hours.</p>
        </div>
      </form>
    </section>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function money(n) {
  return Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}