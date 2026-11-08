import React, { useEffect } from 'react'
import {
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
} from 'lucide-react'
import { SITE } from '../lib/config.js'

const PHONE_DISPLAY = '267-517-1112'
const PHONE_TEL = 'tel:+12675171112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const PROOF = [
  ['4,400+', 'units counted on arrival'],
  ['3 days', 'from truck to shipping orders'],
  ['231', 'orders shipped in the first 3 weeks'],
]

const HOW = [
  [
    Camera,
    'Every order photographed',
    'Each packed box is photographed on the scale with the label showing. If a customer says something was missing, you get the photo, not a guess.',
  ],
  [
    LayoutDashboard,
    'A portal you can actually check',
    'Inventory, inbound shipments, every shipped order and its packing photo, all in one login.',
  ],
  [
    Clock,
    '2 PM ET same-day cutoff',
    'Orders in by 2 PM Eastern on a business day ship that day. Ground reaches NYC, NJ, Philly, Baltimore and DC in 1–2 days.',
  ],
  [
    UserRound,
    'You talk to the owner',
    'No ticket queue. Text or call the person who packs and runs the floor.',
  ],
]

const TERMS_FREE = [
  'Pick & pack fees for your first 30 days after go-live',
  'Capped at $1,000',
  'Full unit count of your first inbound delivery',
  'First 30 days of storage on your first shipment',
]

const TERMS_BILLED = [
  'Postage (at carrier cost, or ship on your own account)',
  'Packaging, if you use ours',
  'Storage after the first 30 days',
]

const STEPS = [
  ['15-minute call', 'Tell us your products, monthly orders, and how you ship today.'],
  ['Quote within 24 hours', 'One page, per-order pricing. No setup, SKU, bin, or peak-season fees.'],
  ['Send your inventory', 'We count every unit, set up your Shopify connection, and start shipping.'],
]

export default function SwitchOffer() {
  useEffect(() => {
    document.title = 'Switch your fulfillment — first month of pick & pack free | Keystone Prep'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'DTC brands shipping 1,000+ orders a month: switch to Keystone Prep in Lansdale, PA by January 31, 2027 and your first month of pick & pack is free, up to $1,000.'
      )
    }
  }, [])

  return (
    <div className="site-dark kp-svc min-h-screen text-[var(--ink)]">
      <header
        className="border-b-2"
        style={{ borderColor: 'var(--ink)', background: 'rgba(22,24,29,.97)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 font-bold pp-display text-2xl uppercase tracking-wide">
            <Boxes size={24} /> {SITE.name}
          </a>
          <a href={PHONE_TEL} className="pp-btn pp-btn-accent px-4 py-2 text-sm flex items-center gap-1.5">
            <Phone size={15} /> {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
            <MapPin size={15} /> Lansdale, PA · offer open through Jan 31, 2027
          </div>

          <h1 className="pp-display text-5xl md:text-7xl font-bold uppercase leading-[.9] tracking-tight">
            Switch your fulfillment. Your first month of pick &amp; pack is on us.
          </h1>

          <p className="text-lg pp-sub mt-6">
            For DTC brands shipping 1,000+ orders a month. Sign a 6-month
            fulfillment agreement and send your first inventory by January 31,
            2027, and we cover your pick &amp; pack fees for the first 30 days,
            up to $1,000.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="/#contact" className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2">
              Get your quote <ArrowRight size={18} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Text / WhatsApp us
            </a>
          </div>
        </section>

        <section className="border-y" style={{ borderColor: 'var(--line)', background: 'var(--paper2)' }}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">Our most recent switch</h2>
            <p className="pp-sub mt-3">
              In October 2026 a New York DTC and wholesale brand moved to us
              from its previous 3PL: two pallets plus a separate parcel
              shipment, mid-season, with orders waiting.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {PROOF.map(([n, label]) => (
                <div key={label} className="pp-card px-4 py-5 text-center">
                  <div className="pp-display text-4xl font-bold">{n}</div>
                  <div className="text-sm pp-sub mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">How we run your orders</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {HOW.map(([Icon, title, sub]) => (
              <div key={title} className="pp-card px-4 py-3">
                <div className="font-semibold flex items-center gap-2">
                  <Icon size={16} className="pp-accent" /> {title}
                </div>
                <div className="pp-sub mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y" style={{ borderColor: 'var(--line)', background: 'var(--paper2)' }}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">The offer, exactly</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-6 text-sm">
              <div className="pp-card px-5 py-4">
                <div className="font-semibold mb-3">Free</div>
                {TERMS_FREE.map((t) => (
                  <div key={t} className="flex items-start gap-2 py-1">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--ok)' }} /> {t}
                  </div>
                ))}
              </div>
              <div className="pp-card px-5 py-4">
                <div className="font-semibold mb-3">Still billed</div>
                {TERMS_BILLED.map((t) => (
                  <div key={t} className="flex items-start gap-2 py-1 pp-sub">
                    <span className="shrink-0">–</span> {t}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm pp-sub mt-4">
              Who qualifies: brands averaging 1,000+ orders a month that sign a
              6-month agreement and send their first inventory by January 31,
              2027. We&apos;re taking a limited number of brands on this offer.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">How switching works</h2>
          <div className="grid md:grid-cols-3 gap-3 mt-6">
            {STEPS.map(([title, sub], i) => (
              <div key={title} className="pp-card px-4 py-4">
                <div className="pp-mono text-sm pp-accent font-semibold">0{i + 1}</div>
                <div className="font-semibold mt-1">{title}</div>
                <div className="text-sm pp-sub mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t" style={{ borderColor: 'var(--line)', background: 'var(--paper2)' }}>
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase">Let&apos;s look at your numbers.</h2>
            <p className="pp-sub mt-3 max-w-xl mx-auto">
              Call or text Yusuf directly. Local brands are welcome to tour the
              warehouse before sending anything.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <a href={PHONE_TEL} className="pp-btn pp-btn-accent px-5 py-3 inline-flex items-center gap-2">
                <Phone size={16} /> {PHONE_DISPLAY}
              </a>
              <a href="/#contact" className="pp-btn-ghost px-5 py-3 inline-flex items-center gap-2">
                Request a quote <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-3 justify-between text-sm pp-sub">
          <div>
            © {new Date().getFullYear()} {SITE.name}. 805 West Fifth Street, Suite 10, Lansdale, PA 19446.
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/shopify-fulfillment-pennsylvania" className="hover:underline">Shopify Fulfillment</a>
            <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">{SITE.contactEmail}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
