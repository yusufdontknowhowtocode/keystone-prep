import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const SERVICES = [
  {
    href: '/fba-prep-pennsylvania',
    title: 'Amazon FBA Prep',
    blurb: 'Labeling, poly bagging, bundling and shipment creation into Amazon.',
  },
  {
    href: '/shopify-fulfillment-pennsylvania',
    title: 'Shopify & DTC Fulfillment',
    blurb: 'Pick, pack and ship for online stores, plus B2B and wholesale orders.',
  },
  {
    href: '/container-receiving',
    title: 'Container & Freight Receiving',
    blurb: 'Dock-height unloading for containers, pallets and floor-loaded freight.',
  },
  {
    href: '/fba-removal-processing',
    title: 'FBA Removal Processing',
    blurb: 'Receive Amazon removals, inspect, re-prep and send back or store.',
  },
]

export default function ServicesMenu({ className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-semibold hover:underline"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Services <ChevronDown size={15} className={open ? 'rotate-180 transition' : 'transition'} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 w-[min(92vw,560px)]">
          <div className="pp-card p-3 grid sm:grid-cols-2 gap-1" style={{ background: 'var(--card)' }}>
            {SERVICES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="block rounded-md p-3 hover:bg-[var(--paper)]"
              >
                <div className="font-bold text-sm">{s.title}</div>
                <div className="text-xs pp-sub mt-1 leading-snug">{s.blurb}</div>
              </a>
            ))}
            <a href="/#services" className="sm:col-span-2 block px-3 pt-2 pb-1 text-sm font-semibold underline">
              View all services →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
