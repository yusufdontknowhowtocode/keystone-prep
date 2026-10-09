import React, { useEffect } from 'react'
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Truck,
  Warehouse,
} from 'lucide-react'
import { SITE } from '../lib/config.js'

const PHONE_DISPLAY = '267-517-1112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const RATES = [
  ['Pick & pack (first item)', '$4.50/order'],
  ['Each additional item', '$1.00/item'],
  ['Kitting / bundles', '$0.50 per item kitted'],
  ['Returns processing', '$4.00/return'],
  ['Storage', 'from $35/pallet/mo'],
]

const SERVICES = [
  'Shopify orders picked, packed, and shipped same day',
  'Orders by 3 PM ET ship same day, Mon–Fri',
  'Your branded boxes, inserts, and thank-you cards',
  'Multi-SKU kits, bundles, and gift sets',
  'Wholesale / B2B carton orders to retailers',
  'Returns inspected and photographed',
  'Every inbound carton photographed at check-in',
  'Live inventory in your client portal',
]

const FAQS = [
  {
    q: 'How do you connect to my Shopify store?',
    a: 'You add us as a staff member in your Shopify admin with fulfillment permissions. We pull orders directly from your store and tracking writes back to the customer automatically. No app install, no API fees, no integration setup charge.',
  },
  {
    q: 'What is your order cutoff?',
    a: 'Orders placed by 3:00 PM Eastern on a business day ship the same day. Many fulfillment centers cut off before noon, so the later cutoff gives your afternoon customers same-day shipping too.',
  },
  {
    q: 'How fast do packages reach customers?',
    a: 'We ship from Lansdale, PA in the Philadelphia metro. Ground service reaches New York, New Jersey, Pennsylvania, Maryland, DC, and much of New England in 1–2 days, and a large share of the U.S. population sits within a few days of our dock.',
  },
  {
    q: 'Are there monthly minimums or setup fees?',
    a: 'No. There are no setup fees, no monthly order minimums, no bin or SKU fees, and no peak-season surcharge. Volume pricing is available from 300 orders a month.',
  },
  {
    q: 'Which carriers do you use?',
    a: 'UPS, FedEx, and USPS. You can ship on your own carrier account, or we buy labels and bill postage at cost. FedEx One Rate packaging is available for FedEx orders.',
  },
  {
    q: 'Can I visit the warehouse?',
    a: 'Yes. Sellers in the Philadelphia area, South Jersey, and Delaware are welcome to tour the facility and walk through their SKUs with us before sending inventory.',
  },
]

export default function ShopifyFulfillmentPennsylvania() {
  useEffect(() => {
    document.title =
      'Shopify Fulfillment in Pennsylvania — Keystone Prep, Lansdale PA'

    const desc = document.querySelector('meta[name="description"]')

    if (desc) {
      desc.setAttribute(
        'content',
        'Shopify fulfillment center in Lansdale, PA. $4.50/order pick & pack, 3 PM ET same-day cutoff, 1–2 day ground to the Northeast, branded packaging, no setup fees or minimums.'
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
      'https://keystoneprepcenter.com/shopify-fulfillment-pennsylvania'
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
            Shopify fulfillment in Pennsylvania.
          </h1>

          <p className="text-lg pp-sub mt-6">
            Keystone Prep picks, packs, and ships Shopify orders from a staffed
            warehouse in Lansdale, Pennsylvania. Orders placed by 3 PM Eastern
            ship the same day, and ground packages reach New York, New Jersey,
            and most of the Northeast in 1–2 days.
          </p>

          <p className="text-lg pp-sub mt-4">
            Simple per-order pricing, no setup fees, no monthly minimums, and
            direct access to the owner instead of a support ticket queue. Built
            for growing DTC brands that have outgrown packing orders at home or
            are tired of being a small account at a big 3PL.
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
              What we handle
            </h2>

            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              {SERVICES.map((s) => (
                <div
                  key={s}
                  className="flex items-start gap-2 text-sm pp-card px-4 py-3"
                >
                  <CheckCircle2
                    size={17}
                    className="shrink-0 mt-0.5"
                    style={{ color: 'var(--ok)' }}
                  />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="pp-display text-4xl font-bold uppercase">
            Shopify fulfillment pricing
          </h2>

          <p className="pp-sub mt-3">
            Straightforward per-order pricing. No setup, API, bin, or SKU fees,
            and no peak-season surcharge. Volume pricing from 300 orders a
            month.
          </p>

          <div className="pp-card overflow-hidden mt-6">
            {RATES.map(([name, price], i) => (
              <div
                key={name}
                className={`flex items-center justify-between gap-4 p-4 ${
                  i ? 'border-t' : ''
                }`}
                style={{ borderColor: 'var(--line)' }}
              >
                <span className="font-medium">{name}</span>
                <span className="pp-mono font-semibold">{price}</span>
              </div>
            ))}
          </div>

          <p className="text-sm pp-sub mt-3">
            Postage is billed at carrier cost, or ship on your own UPS, FedEx,
            or USPS account. Storage includes the first 30 days. $25 minimum
            per inbound shipment ($50 for container/trailer freight).
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
              Why brands ship from here
            </h2>

            <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
              {[
                [
                  Clock,
                  '3 PM ET same-day cutoff',
                  'Later than most fulfillment centers, so more orders go out the day they come in',
                ],
                [
                  Truck,
                  '1–2 day ground to the Northeast',
                  'NYC, New Jersey, Philly, Baltimore, DC, and Boston without paying for air',
                ],
                [
                  Package,
                  'Your packaging, your brand',
                  'Custom boxes, mailers, inserts, and gift notes packed the way you want',
                ],
                [
                  Warehouse,
                  'Dock-high warehouse',
                  'Receives parcel, pallets, and full containers, with racked client storage',
                ],
              ].map(([Icon, title, sub]) => (
                <div key={title} className="pp-card px-4 py-3">
                  <div className="font-semibold flex items-center gap-2">
                    <Icon size={16} className="pp-accent" />
                    {title}
                  </div>

                  <div className="pp-sub mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <p className="text-sm pp-sub mt-4">
              Also selling on Amazon? We handle{' '}
              <a
                href="/fba-prep-pennsylvania"
                className="underline"
                style={{ color: 'var(--ink)' }}
              >
                FBA prep
              </a>{' '}
              from the same inventory, so one warehouse covers both channels.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
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
        </section>

        <section
          className="border-t"
          style={{
            borderColor: 'var(--line)',
            background: '#fff',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase">
              Get a Shopify fulfillment quote.
            </h2>

            <p className="pp-sub mt-3 max-w-xl mx-auto">
              Tell us your monthly orders and products and we&apos;ll send a
              rate the same day.
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

            <a href="/fba-prep-pennsylvania" className="hover:underline">
              FBA Prep
            </a>

            <a href="/container-receiving" className="hover:underline">
              Container Receiving
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
