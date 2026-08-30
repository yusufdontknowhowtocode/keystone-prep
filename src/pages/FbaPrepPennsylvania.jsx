import React, { useEffect } from 'react'
import { ArrowRight, Boxes, CheckCircle2, MapPin, MessageCircle, Truck, Warehouse } from 'lucide-react'
import { SITE } from '../lib/config.js'

const PHONE_DISPLAY = '267-517-1112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const RATES = [
  ['Up to 1,000 units / mo', '$0.65/unit'],
  ['1,001–5,000 units / mo', '$0.60/unit'],
  ['5,001+ units / mo', '$0.55/unit'],
]

const SERVICES = [
  'Receiving & photographed check-in',
  'Inspection & count verification',
  'FNSKU labeling (manufacturer barcode covered)',
  'Polybagging & suffocation warnings',
  'Bundling & multipack assembly',
  'Case-pack and carton prep to Amazon spec',
  'Racked storage between shipments',
  'Outbound to any U.S. Amazon FC',
]

const FAQS = [
  {
    q: 'Where in Pennsylvania are you located?',
    a: 'Lansdale, PA — 805 West Fifth Street, Suite 10 — in the Philadelphia metro, minutes off the PA Turnpike Northeast Extension. Pennsylvania hosts one of the densest Amazon fulfillment-center corridors on the East Coast (Lehigh Valley, Hazleton, Carlisle), which keeps inbound transit from our dock to Amazon short and cheap.',
  },
  {
    q: 'Do I have to be in Pennsylvania to use you?',
    a: 'No. Most clients never visit — suppliers ship directly to our dock from anywhere (domestic parcel, LTL, or international containers), and you watch receiving, prep, and outbound live in the client portal. Local sellers are welcome to tour the warehouse first.',
  },
  {
    q: 'How fast is turnaround?',
    a: 'Most standard prep ships within 1–2 business days once inventory and label files are in hand. Receiving is logged and photographed the day freight arrives.',
  },
  {
    q: 'What does the per-unit rate include?',
    a: 'Receiving, inspection, FNSKU labeling, and outbound box prep — one rate, no setup fees, no monthly minimums. Add-ons like polybagging or bundling are only billed on SKUs that need them.',
  },
]

export default function FbaPrepPennsylvania() {
  useEffect(() => {
    document.title = 'FBA Prep Center in Pennsylvania — Keystone Prep, Lansdale PA'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', 'Pennsylvania FBA prep center in Lansdale, PA — dock-high receiving, 48-ft trailer access, FNSKU labeling, polybagging, bundling, and storage. $0.55–$0.65/unit all-in. Minutes from the PA Amazon FC corridor.')
  }, [])

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b-2" style={{ borderColor: 'var(--ink)', background: 'var(--card)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 font-bold pp-display text-2xl uppercase tracking-wide">
            <Boxes size={24} /> {SITE.name}
          </a>
          <div className="flex items-center gap-2">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="pp-btn-ghost px-3 py-2 text-sm hidden sm:flex items-center gap-1.5">
              <MessageCircle size={16} /> {PHONE_DISPLAY}
            </a>
            <a href="/#contact" className="pp-btn pp-btn-accent px-4 py-2 text-sm">Get your rate</a>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
            <MapPin size={15} /> Lansdale, PA · Philadelphia metro
          </div>
          <h1 className="pp-display text-5xl md:text-7xl font-bold uppercase leading-[.9] tracking-tight">
            FBA prep center in Pennsylvania.
          </h1>
          <p className="text-lg pp-sub mt-6">
            Keystone Prep runs Amazon FBA prep and 3PL out of a 6,000 sq ft staffed warehouse in Lansdale, Pennsylvania — elevated dock at trailer height, a lot that takes full 48-foot containers, and racked client storage. Pennsylvania sits in the middle of the East Coast's Amazon fulfillment corridor, so inventory prepped here reaches FCs in the Lehigh Valley, Hazleton, and Carlisle fast and cheap.
          </p>
          <p className="text-lg pp-sub mt-4">
            Send a container or a single case. Every carton is photographed at receiving, every unit is tracked live in your client portal, and outbound shipments wait for your approval before anything leaves the building.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="/#contact" className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2">
              Get your rate <ArrowRight size={18} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Text / WhatsApp us
            </a>
          </div>
        </section>

        <section className="border-y" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">What we handle</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              {SERVICES.map(s => (
                <div key={s} className="flex items-start gap-2 text-sm pp-card px-4 py-3">
                  <CheckCircle2 size={17} className="shrink-0 mt-0.5" style={{ color: 'var(--ok)' }} /> {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">Pennsylvania FBA prep pricing</h2>
          <p className="pp-sub mt-3">One all-in rate per unit — receiving, inspection, FNSKU label, and box prep. No setup fees, no minimums, no contracts.</p>
          <div className="pp-card overflow-hidden mt-6">
            {RATES.map(([name, price], i) => (
              <div key={name} className={`flex items-center justify-between gap-4 p-4 ${i ? 'border-t' : ''}`} style={{ borderColor: 'var(--line)' }}>
                <span className="font-medium">{name}</span>
                <span className="pp-mono font-semibold">{price}</span>
              </div>
            ))}
          </div>
          <p className="text-sm pp-sub mt-3">
            Add-ons only when a SKU needs them: polybagging $0.25/unit, bubble wrap $0.40/unit, bundling $0.50 per unit bundled, pallet storage $25/pallet/mo. Your first test shipment — up to 100 units — is on us, valid 30 days from account setup.
          </p>
        </section>

        <section className="border-y" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">The facility</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
              {[
                ['Dock-high receiving', 'Elevated dock at standard trailer height'],
                ['48-ft trailer access', 'Open paved lot with room to maneuver full containers'],
                ['6,000 sq ft', 'Racked storage with separated client zones'],
                ['Receiving 9–5 Mon–Fri', 'Parcel, LTL, and container freight accepted'],
              ].map(([title, sub]) => (
                <div key={title} className="pp-card px-4 py-3">
                  <div className="font-semibold flex items-center gap-2"><Warehouse size={16} className="pp-accent" /> {title}</div>
                  <div className="pp-sub mt-1">{sub}</div>
                </div>
              ))}
            </div>
            <p className="text-sm pp-sub mt-4">
              Keystone operates out of the U.S. facility of KT Trims, an apparel-trim manufacturer supplying major global fashion brands — a receiving crew with years of international container experience handles your freight.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">Common questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="pp-card px-5 py-4">
                <div className="font-semibold">{q}</div>
                <p className="text-sm pp-sub mt-2">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase">Get a Pennsylvania prep rate in seconds.</h2>
            <p className="pp-sub mt-3 max-w-xl mx-auto">Use the estimator on our homepage for an instant number, or message us directly — we reply fast, seven days a week.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <a href="/#contact" className="pp-btn pp-btn-accent px-5 py-3 inline-flex items-center gap-2">
                Estimate your cost <ArrowRight size={17} />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="pp-btn-ghost px-5 py-3 inline-flex items-center gap-2">
                <MessageCircle size={16} /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-3 justify-between text-sm pp-sub">
          <div>© {new Date().getFullYear()} {SITE.name}. 805 West Fifth Street, Suite 10, Lansdale, PA 19446.</div>
          <div className="flex flex-wrap gap-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/portal" className="hover:underline">Portal demo</a>
            <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">{SITE.contactEmail}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}