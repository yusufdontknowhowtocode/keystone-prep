import React, { useEffect } from 'react'
import {
  ArrowRight,
  Boxes,
  MapPin,
  MessageCircle,
  Truck,
} from 'lucide-react'
import { SITE } from '../lib/config.js'
import ServicesMenu from '../components/ServicesMenu.jsx'

const PHONE_DISPLAY = '267-517-1112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const STEPS = [
  [
    'Create the removal order',
    'In Seller Central, create a removal order and enter our address as the ship-to: Keystone Prep Center, 805 W Fifth St, Suite 10, Lansdale, PA 19446. Send us the removal order ID so we can match every box Amazon sends back.',
  ],
  [
    'We receive and match every box',
    'Amazon removals arrive in waves, often weeks apart and from different FCs. Each box is logged against your removal order ID, so you always know what has landed and what is still missing.',
  ],
  [
    'Inspect, count, photograph',
    'Every unit is checked and sorted into sellable, damaged, or customer-return condition, with photos. You get a clear count by SKU and condition, which is exactly what you need for any reimbursement claims.',
  ],
  [
    'Re-prep, store, or move on',
    'Sellable units can be relabeled and sent back into FBA, stored until you need them, shipped to your own customers, or set aside for liquidation. Nothing is thrown away without your written approval.',
  ],
]

const FAQS = [
  {
    q: 'Why send removals to a prep center instead of your own address?',
    a: 'Removals come back in many small boxes from different warehouses, often mixed with damaged or returned units. Sending them to us means everything is received, sorted, and documented in one place, and sellable stock can go straight back into FBA without passing through your garage.',
  },
  {
    q: 'What does removal processing cost?',
    a: 'Receiving is $2 per box, waived for boxes with 5+ units. Units we re-prep for FBA are billed at our standard all-in prep rate of $0.55–$0.65 per unit, depending on volume. Inspection-only sorting and anything unusual is quoted in advance. Storage: first 30 days included, then from $35 per pallet per month.',
  },
  {
    q: 'Can you handle damaged or unsellable units?',
    a: 'Yes. Damaged units are photographed and set aside, never mixed back into sellable stock. You decide what happens next: disposal, liquidation, return to your supplier, or holding them while you file a claim.',
  },
  {
    q: 'Can removed inventory go to Walmart, Amazon Canada, or my own customers?',
    a: 'Often, yes. We have consolidated US removals for sellers moving inventory to Amazon Canada, and we can relabel for Walmart WFS or ship orders direct to your customers. Tell us where it needs to go and we will confirm what is possible.',
  },
  {
    q: 'When is the best time to do removals?',
    a: 'Right after peak. January and February are when long-term storage fees and aged-inventory surcharges push most sellers to pull slow stock. Setting up the removal plan before then means your units land somewhere ready for them.',
  },
]

export default function FbaRemovalProcessing() {
  useEffect(() => {
    document.title =
      'Amazon FBA Removal Order Processing — Keystone Prep, Lansdale PA'

    const desc = document.querySelector('meta[name="description"]')

    if (desc) {
      desc.setAttribute(
        'content',
        'Amazon FBA removal order processing in Lansdale, PA: receive removals, sort sellable from damaged, photograph every unit, re-prep and send back to FBA, store, or liquidate.'
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
      'https://keystoneprepcenter.com/fba-removal-processing'
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

          <ServicesMenu />

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
            Amazon FBA removal processing.
          </h1>

          <p className="text-lg pp-sub mt-6">
            Pulling slow stock out of Amazon before long-term storage fees hit?
            Send your removal orders to Keystone Prep in Lansdale,
            Pennsylvania. We match every returning box to your removal order,
            sort sellable from damaged units, photograph everything, and then
            send it where you need it: back into FBA, into storage, to your
            own customers, or to liquidation.
          </p>

          <p className="text-lg pp-sub mt-4">
            Removals trickle in from many fulfillment centers over weeks. We
            keep the running tally so you don't have to chase tracking numbers.
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
            What you get
          </h2>

          <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {[
              ['Box-by-box tracking', 'Every inbound box logged against your removal order ID'],
              ['Condition report', 'Counts by SKU: sellable, damaged, customer return'],
              ['Photos of everything', 'Useful for Amazon reimbursement claims'],
              ['Your call on every unit', 'Re-prep for FBA, store, ship direct, or liquidate'],
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
            Units headed back to Amazon go through our full{' '}
            <a
              href="/fba-prep-pennsylvania"
              className="underline"
              style={{ color: 'var(--ink)' }}
            >
              Pennsylvania FBA prep
            </a>{' '}
            flow, and large lots can come in through our{' '}
            <a
              href="/container-receiving"
              className="underline"
              style={{ color: 'var(--ink)' }}
            >
              freight dock
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
            Planning a removal?
          </h2>

          <p className="pp-sub mt-3 max-w-xl mx-auto">
            Tell us roughly how many units and SKUs you're pulling, and we'll
            send our address details and a rate the same day.
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
              <a href="/shopify-fulfillment-pennsylvania" className="hover:underline">
              Shopify Fulfillment
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