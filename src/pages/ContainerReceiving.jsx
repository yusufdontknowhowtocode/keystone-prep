import React, { useEffect } from 'react'
import {
  ArrowRight,
  Boxes,
  MapPin,
  MessageCircle,
  Truck,
} from 'lucide-react'
import { SITE } from '../lib/config.js'

const PHONE_DISPLAY = '267-517-1112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const STEPS = [
  [
    'Schedule the delivery',
    'Send us the container or trailer details — carrier, PO, and ETA — and we set a receiving appointment so the driver is unloaded without waiting.',
  ],
  [
    'Unload at the dock',
    'Dock-high door at standard trailer height, open paved lot that takes full 48-foot trailers and 53-foot dry vans, drive-in door for box trucks. Floor-loaded or palletized both work.',
  ],
  [
    'Count, inspect, photograph',
    'Every carton is counted against your packing list and photographed at check-in. Discrepancies and damage are documented and reported to you the same day — before they become your problem at Amazon.',
  ],
  [
    'Prep and forward',
    'Units are inspected, FNSKU-labeled, polybagged or bundled as needed, and shipped to Amazon fulfillment centers under your Seller Central labels. Anything staying behind goes into racked, client-separated storage.',
  ],
]

const FAQS = [
  {
    q: 'Can you receive a full 40-ft container?',
    a: 'Yes. The lot takes full 48-foot trailers and 53-foot dry vans, and the receiving crew has years of international container experience through the parent manufacturing operation. Floor-loaded containers are unloaded by hand and counted carton by carton; palletized freight comes straight off at the dock.',
  },
  {
    q: 'Do you work with freight forwarders?',
    a: 'Regularly. Your forwarder or customs broker can deliver directly to our dock — we coordinate the appointment with the trucker, sign the POD, and report the received count to you same day. If you need a forwarder or LTL carrier, we are happy to point you to options.',
  },
  {
    q: 'What does container receiving cost?',
    a: 'Receiving is included in our per-unit prep rate ($0.55–$0.65/unit depending on monthly volume) when we prep the goods. For large wholesale lots of many low-cost units, ask about flat per-carton receiving — it is often the cheaper structure.',
  },
  {
    q: 'What happens to inventory that is not shipping to Amazon right away?',
    a: 'It goes into racked storage in your own client zone — first 30 days included, then from $35/pallet/month based on dwell time, tracked in your portal, and ships out in replenishment batches whenever you create the Amazon shipment.',
  },
  {
    q: 'Who clears customs?',
    a: 'Your customs broker handles clearance before delivery — we receive cleared freight. Delivered Duty Paid (DDP) shipments from overseas suppliers also work; the container simply arrives at our address like any domestic delivery.',
  },
]

export default function ContainerReceiving() {
  useEffect(() => {
    document.title =
      'Container Receiving for Amazon FBA — Keystone Prep, Lansdale PA'

    const desc = document.querySelector('meta[name="description"]')

    if (desc) {
      desc.setAttribute(
        'content',
        'Container and pallet freight receiving for Amazon FBA sellers in Lansdale, PA — dock-high door, 48–53 ft trailer access, carton-level counts, photo check-ins, FNSKU prep, and forwarding to any US Amazon FC.'
      )
    }

    let canonical = document.querySelector('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute(
      'href',
      'https://keystoneprepcenter.com/container-receiving'
    )
  }, [])

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header
        className="border-b-2"
        style={{
          borderColor: 'var(--ink)',
          background: 'var(--card)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <a
            href="/"
            className="flex items-center gap-2 font-bold pp-display text-2xl uppercase tracking-wide"
          >
            <Boxes size={24} /> {SITE.name}
          </a>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="pp-btn-ghost px-3 py-2 text-sm hidden sm:flex items-center gap-1.5"
            >
              <MessageCircle size={16} /> {PHONE_DISPLAY}
            </a>

            <a
              href="/#contact"
              className="pp-btn pp-btn-accent px-4 py-2 text-sm"
            >
              Get your rate
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
            <MapPin size={15} /> Lansdale, PA · Philadelphia metro
          </div>

          <h1 className="pp-display text-5xl md:text-7xl font-bold uppercase leading-[.9] tracking-tight">
            Container receiving for Amazon sellers.
          </h1>

          <p className="text-lg pp-sub mt-6">
            Importing wholesale or private-label inventory? Keystone Prep
            receives your container or pallet freight at a real dock in
            Lansdale, Pennsylvania — elevated door at trailer height, a lot
            that takes full 48- and 53-foot trailers, and a receiving crew with
            years of international container experience. Your freight is
            counted, inspected, and photographed the day it arrives, then
            FBA-prepped and forwarded to Amazon fulfillment centers.
          </p>

          <p className="text-lg pp-sub mt-4">
            Pennsylvania sits in the middle of the East Coast Amazon FC
            corridor — Lehigh Valley, Hazleton, Carlisle — so freight landing
            here reaches Amazon fast and cheap.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href="/#contact"
              className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2"
            >
              Get your rate <ArrowRight size={18} />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> Text / WhatsApp us
            </a>
          </div>
        </section>

        <section
          className="border-y"
          style={{
            borderColor: 'var(--line)',
            background: '#fff',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">
              How it works
            </h2>

            <div className="mt-6 space-y-3">
              {STEPS.map(([title, body], i) => (
                <div
                  key={title}
                  className="pp-card px-5 py-4 flex gap-4"
                >
                  <div
                    className="pp-display text-3xl font-bold pp-accent"
                    style={{ minWidth: 36 }}
                  >
                    {i + 1}
                  </div>

                  <div>
                    <div className="font-semibold">{title}</div>
                    <p className="text-sm pp-sub mt-1">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">
            The dock
          </h2>

          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {[
              [
                'Dock-high door',
                'Standard trailer height — containers and dry vans unload straight in',
              ],
              [
                '48–53 ft trailer access',
                'Open paved lot with room for full-size trailers to back in',
              ],
              [
                'Drive-in door',
                'Ground-level door for box trucks and courier freight',
              ],
              [
                'Receiving 9–5 Mon–Fri',
                'Delivery appointments coordinated with your carrier',
              ],
            ].map(([title, sub]) => (
              <div key={title} className="pp-card px-4 py-3">
                <div className="font-semibold flex items-center gap-2">
                  <Truck size={16} className="pp-accent" />
                  {title}
                </div>

                <div className="pp-sub mt-1">{sub}</div>
              </div>
            ))}
          </div>

          <p className="text-sm pp-sub mt-4">
            Keystone operates inside the U.S. facility of KT Trims, an
            apparel-trim manufacturer supplying global fashion brands — the
            same crew that receives KT's international freight receives yours.
            Learn more about our full{' '}
            <a
              href="/fba-prep-pennsylvania"
              className="underline"
              style={{ color: 'var(--ink)' }}
            >
              Pennsylvania FBA prep services
            </a>
            .
          </p>
        </section>

        <section
          className="border-y"
          style={{
            borderColor: 'var(--line)',
            background: '#fff',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="pp-display text-4xl font-bold uppercase">
              Common questions
            </h2>

            <div className="mt-6 space-y-3">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="pp-card px-5 py-4">
                  <div className="font-semibold">{q}</div>
                  <p className="text-sm pp-sub mt-2">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase">
            Have freight on the water?
          </h2>

          <p className="pp-sub mt-3 max-w-xl mx-auto">
            Tell us the ETA and what's in the container — we'll confirm the
            receiving appointment and a rate the same day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <a
              href="/#contact"
              className="pp-btn pp-btn-accent px-5 py-3 inline-flex items-center gap-2"
            >
              Get your rate <ArrowRight size={17} />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="pp-btn-ghost px-5 py-3 inline-flex items-center gap-2"
            >
              <MessageCircle size={16} /> {PHONE_DISPLAY}
            </a>
          </div>
        </section>
      </main>

      <footer
        className="border-t"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-3 justify-between text-sm pp-sub">
          <div>
            © {new Date().getFullYear()} {SITE.name}. 805 West Fifth Street,
            Suite 10, Lansdale, PA 19446.
          </div>

          <div className="flex flex-wrap gap-4">
            <a href="/" className="hover:underline">
              Home
            </a>

            <a
              href="/fba-prep-pennsylvania"
              className="hover:underline"
            >
              PA FBA Prep
            </a>

            <a href="/portal" className="hover:underline">
              Portal demo
            </a>

            <a
              href={`mailto:${SITE.contactEmail}`}
              className="hover:underline"
            >
              {SITE.contactEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}