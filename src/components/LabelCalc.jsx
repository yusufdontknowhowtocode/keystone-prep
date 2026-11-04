import React, { useMemo, useRef, useState } from 'react'
import { Boxes } from 'lucide-react'

/* Rate sheet: keep in sync with QuoteEstimator.jsx and the pricing section in Landing.jsx */
const FBA_TIERS = [
  { max: 1000, rate: 0.65 },
  { max: 5000, rate: 0.6 },
  { max: Infinity, rate: 0.55 },
]
const DTC_TIERS = [
  { max: 499, first: 3.5, extra: 0.75 },
  { max: Infinity, first: 3.25, extra: 0.5 },
]
const ADDONS = [
  { key: 'polybag', label: 'Polybag', rate: 0.25 },
  { key: 'bubble', label: 'Bubble wrap', rate: 0.4 },
  { key: 'bundle', label: 'Bundling', rate: 0.5 },
]
const FREE_UNITS = 100
const FBA_STEPS = [100, 250, 500, 750, 1000, 1500, 2500, 5000, 7500, 10000]
const DTC_STEPS = [50, 100, 200, 300, 500, 750, 1000]

// Where the label sits, in % of the box. "home" = waiting, "stuck" = over the barcode.
const HOME = { x: 55, y: 21, r: 4 }
const STUCK = { x: 6, y: 24, r: -1 }

const money = (n, d = 0) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d })

function bars(seed, n = 52) {
  const out = []
  let x = seed + 7
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280
    out.push(1 + (x % 3))
  }
  return out
}

function Barcode({ seed, height = 44, n }) {
  const w = useMemo(() => bars(seed, n), [seed, n])
  return (
    <div className="flex overflow-hidden" style={{ height }} aria-hidden="true">
      {w.map((b, i) => (
        <span key={i} style={{ width: b * 2, flex: 'none', background: i % 2 ? 'transparent' : '#16181D' }} />
      ))}
    </div>
  )
}

export function useLabelCalc() {
  const [mode, setMode] = useState('fba')
  const [fbaStep, setFbaStep] = useState(2)
  const [dtcStep, setDtcStep] = useState(2)
  const [items, setItems] = useState(1)
  const [addons, setAddons] = useState({})
  const [brand, setBrand] = useState('')

  const fba = mode === 'fba'
  const qty = fba ? FBA_STEPS[fbaStep] : DTC_STEPS[dtcStep]
  let rate, monthly, first
  if (fba) {
    const base = FBA_TIERS.find((t) => qty <= t.max).rate
    rate = base + ADDONS.reduce((s, a) => s + (addons[a.key] ? a.rate : 0), 0)
    monthly = qty * rate
    first = Math.max(0, qty - FREE_UNITS) * rate
  } else {
    const t = DTC_TIERS.find((x) => qty <= x.max)
    rate = t.first + t.extra * (items - 1)
    monthly = qty * rate
  }
  return { mode, setMode, fba, qty, rate, monthly, first, fbaStep, setFbaStep, dtcStep, setDtcStep, items, setItems, addons, setAddons, brand, setBrand }
}

export function CalcControls({ c }) {
  return (
    <div className="kp-panel p-5 md:p-6 mt-8">
      <div className="grid grid-cols-2 gap-2">
        {[
          ['fba', 'Amazon FBA prep'],
          ['dtc', 'Shopify / DTC'],
        ].map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => c.setMode(k)}
            className="py-3 font-semibold text-lg"
            style={c.mode === k ? { background: 'var(--accent)', color: '#16181D', border: '1px solid var(--accent)' } : { border: '1px solid #5A5D64', color: 'var(--ink)' }}
          >
            {l}
          </button>
        ))}
      </div>

      <label className="block mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-lg">{c.fba ? 'Units per month' : 'Orders per month'}</span>
          <span className="pp-mono text-2xl font-semibold">{c.qty.toLocaleString()}</span>
        </div>
        <input
          type="range"
          className="kp-range"
          style={{ '--pct': `${((c.fba ? c.fbaStep : c.dtcStep) / ((c.fba ? FBA_STEPS : DTC_STEPS).length - 1)) * 100}%` }}
          min={0}
          max={(c.fba ? FBA_STEPS : DTC_STEPS).length - 1}
          value={c.fba ? c.fbaStep : c.dtcStep}
          onChange={(e) => (c.fba ? c.setFbaStep : c.setDtcStep)(Number(e.target.value))}
          aria-label={c.fba ? 'Units per month' : 'Orders per month'}
        />
      </label>

      {c.fba ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-lg">
          {ADDONS.map((a) => (
            <label key={a.key} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!c.addons[a.key]}
                onChange={(e) => c.setAddons({ ...c.addons, [a.key]: e.target.checked })}
                className="kp-check"
              />
              {a.label} <span className="pp-mono">+${a.rate.toFixed(2)}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-4 text-sm">
          <span className="font-semibold">Items per order</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => c.setItems(n)}
              className="w-10 h-9 rounded pp-mono font-semibold"
              style={c.items === n ? { background: 'var(--ink)', color: 'var(--paper)' } : { border: '1px solid var(--line)' }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-5 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
        <span className="text-lg shrink-0">Your brand, on the label</span>
        <input className="pp-input kp-brand" placeholder="Your brand" maxLength={24} value={c.brand} onChange={(e) => c.setBrand(e.target.value)} />
      </div>
    </div>
  )
}

export function CalcBox({ c }) {
  const boxRef = useRef(null)
  const drag = useRef(null)
  const [pos, setPos] = useState(HOME)
  const [dragging, setDragging] = useState(false)
  const stuck = pos === STUCK

  const onDown = (e) => {
    const box = boxRef.current.getBoundingClientRect()
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, w: box.width, h: box.height }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const x = Math.min(62, Math.max(0, d.ox + ((e.clientX - d.sx) / d.w) * 100))
    const y = Math.min(60, Math.max(0, d.oy + ((e.clientY - d.sy) / d.h) * 100))
    setPos({ x, y, r: 0 })
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d) return
    setPos((p) => (p.x < 26 && p.y > 12 ? STUCK : p))
  }

  const fba = c.fba
  return (
    <div>
      <div className="kp-box-wrap">
      <div className="kp-floor-diag" aria-hidden="true" />
      <div ref={boxRef} className="kp-box" style={{ touchAction: 'none' }}>
        <div className="kp-box-tape" />
        {!stuck && (
          <div className="kp-marker" aria-hidden="true">
            Drag the label
            <br />
            over the
            <br />
            barcode
            <span className="kp-marker-line" />
          </div>
        )}
        <div className="kp-box-upc">
          <Barcode seed={42} height={96} n={40} />
          <div className="pp-mono text-center mt-1" style={{ fontSize: 'clamp(9px,1.15vw,16px)' }}>0 84219 60317 5</div>
        </div>
        <div className="kp-box-arrows" aria-hidden="true">↑ ↑</div>

        <div
          className={`kp-label kp-label-drag ${dragging ? 'is-dragging' : ''} ${stuck ? 'is-stuck' : ''}`}
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `rotate(${pos.r}deg)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label={`Estimate: ${money(c.rate, 2)} ${fba ? 'per unit' : 'per order'}`}
        >
          <div className="kp-label-top">
            <span className="flex items-center gap-1.5"><Boxes size={18} /><span className="pp-display kp-label-brand">KEYSTONE PREP</span></span>
            <span>Lansdale, PA</span>
          </div>
          <div className="mt-2.5"><Barcode seed={c.qty + (fba ? 1 : 9)} height={52} n={60} /></div>
          <div className="pp-mono text-center mt-0.5" style={{ fontSize: 'clamp(9px,1vw,13px)', fontWeight: 600 }}>KP-{c.qty}{fba ? 'U' : 'O'}-{Math.round(c.rate * 100)}</div>
          <div className="font-semibold mt-2 truncate" style={{ fontSize: 'clamp(11px,1.2vw,16px)' }}>{c.brand.trim() || 'Your brand'}</div>
          <div className="kp-label-rate">
            <span className="pp-display">{money(c.rate, 2)}</span>
            <span>{fba ? 'per unit, all-in' : 'per order'}</span>
          </div>
          <div className="kp-label-rows pp-mono">
            <div><span>{fba ? 'Units / month' : 'Orders / month'}</span><span>{c.qty.toLocaleString()}</span></div>
            <div><span>Typical month</span><span>{money(c.monthly)}</span></div>
            {fba && <div><span>First shipment</span><span>{money(c.first)}</span></div>}
          </div>
          <p className="kp-label-fine">
            {fba ? `Up to ${FREE_UNITS} units on us. ` : 'Pick, pack and box included. '}Estimate only, before postage.
          </p>
        </div>
      </div>
      </div>
      <div className="text-center mt-5 relative">
        <button type="button" className="kp-stick" onClick={() => setPos(stuck ? HOME : STUCK)}>
          {stuck ? 'Peel it off' : 'Stick the label on'}
        </button>
      </div>
    </div>
  )
}
