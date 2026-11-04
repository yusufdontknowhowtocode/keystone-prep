import React, { useMemo, useState } from 'react'

/* Rate sheet: keep in sync with QuoteEstimator.jsx and the pricing section in Landing.jsx */
const TIERS = [
  { max: 1000, rate: 0.65 },
  { max: 5000, rate: 0.6 },
  { max: Infinity, rate: 0.55 },
]
const FREE_UNITS = 100
const STEPS = [100, 250, 500, 750, 1000, 1500, 2500, 5000, 7500, 10000]

const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

// Deterministic fake barcode so it doesn't jump around between renders.
function bars(seed) {
  const out = []
  let x = seed
  for (let i = 0; i < 46; i++) {
    x = (x * 9301 + 49297) % 233280
    out.push(1 + (x % 3))
  }
  return out
}

export default function LabelCalc() {
  const [step, setStep] = useState(2)
  const units = STEPS[step]
  const rate = TIERS.find((t) => units <= t.max).rate
  const monthly = units * rate
  const first = Math.max(0, units - FREE_UNITS) * rate
  const barWidths = useMemo(() => bars(units), [units])

  return (
    <div className="kp-label">
      <div className="kp-label-top">
        <span>FNSKU · X00KEYSTONE</span>
        <span>LANSDALE, PA</span>
      </div>

      <div className="kp-barcode" aria-hidden="true">
        {barWidths.map((w, i) => (
          <span key={i} style={{ width: w * 2, background: i % 2 ? 'transparent' : '#16181D' }} />
        ))}
      </div>

      <div className="kp-label-rate">
        <span className="pp-display">${rate.toFixed(2)}</span>
        <span>per unit, all-in</span>
      </div>

      <label className="block mt-4">
        <div className="flex items-baseline justify-between text-sm font-semibold">
          <span>Units per month</span>
          <span className="pp-mono">{units.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="kp-range"
          aria-label="Units per month"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="kp-label-cell">
          <div>Typical month</div>
          <strong className="pp-mono">{money(monthly)}</strong>
        </div>
        <div className="kp-label-cell">
          <div>First shipment</div>
          <strong className="pp-mono">{money(first)}</strong>
        </div>
      </div>

      <p className="kp-label-fine">
        Receiving, inspection, FNSKU label and box prep included. First {FREE_UNITS} units on us. Estimate only, before postage.
      </p>
    </div>
  )
}
