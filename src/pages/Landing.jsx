import React from 'react'
import { ArrowRight, Barcode, Boxes, Camera, CheckCircle2, Clock, MapPin, Package, ShieldCheck, ShoppingBag, Store, Truck, Warehouse } from 'lucide-react'
import { SITE } from '../lib/config.js'

const PILOT_EMAIL_SUBJECT = 'Keystone Prep Pilot Account'
const PILOT_EMAIL_BODY = `Hi Keystone Prep,\n\nI'm interested in the first 100 units free pilot.\n\nMonthly unit volume:\nProduct type:\nAmazon / Shopify / both:\nWhat city/state do you ship from:\n\nThanks.`
const pilotMailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(PILOT_EMAIL_SUBJECT)}&body=${encodeURIComponent(PILOT_EMAIL_BODY)}`
function trackQuoteClick() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
  }
}
// Standard prep is one all-in per-unit rate that covers receiving, inspection,
// FNSKU labeling, and outbound box prep. Discounts are earned at volume.
const STANDARD_PREP = [
  ['Up to 1,000 units / mo', '$0.65/unit'],
  ['1,001–5,000 units / mo', '$0.60/unit'],
  ['5,001+ units / mo', '$0.55/unit'],
]

// Opt-in extras, only billed when a SKU actually needs them.
const ADD_ONS = [
  ['Polybagging', '$0.25/unit'],
  ['Bubble wrap', '$0.40/unit'],
  ['Bundling / kitting / custom prep', 'from $0.50/unit'],
  ['Pallet storage', '$25/pallet/mo'],
]

const TRUST_LINES = [
  'Inbound cartons photographed at receiving',
  'Each client gets separated SKU storage',
  'Outbound shipments require approval before pickup',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b-2" style={{ borderColor: 'var(--ink)', background: 'var(--card)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 font-bold pp-display text-2xl uppercase tracking-wide">
            <Boxes size={24} /> {SITE.name}
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#process" className="hover:underline">Process</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#fit" className="hover:underline">Fit</a>
            <a href="/portal" className="hover:underline">Portal demo</a>
          </nav>
          <a href={pilotMailto} onClick={trackQuoteClick} className="pp-btn pp-btn-accent px-4 py-2 text-sm"> Get a quote </a>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
              <MapPin size={15} /> Lansdale, PA · East Coast fulfillment & FBA prep
            </div>
            <h1 className="pp-display text-6xl md:text-8xl font-bold uppercase leading-[.85] tracking-tight">
              East Coast 3PL & FBA prep for online sellers.
            </h1>
            <p className="text-lg md:text-xl pp-sub mt-6 max-w-2xl">
              Receiving, inspection, FNSKU labeling, prep, storage, and order fulfillment for Amazon FBA, Shopify, and TikTok Shop sellers — with photo check-ins and a live client portal. Backed by an established apparel-manufacturing warehouse with years of international receiving and labeling experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href={pilotMailto} onClick={trackQuoteClick} className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2">
                Start with 100 units free <ArrowRight size={18} />
              </a>
              <a href="/portal" className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2">
                View portal demo
              </a>
            </div>
            <p className="text-xs pp-sub mt-4 max-w-xl">
              Now onboarding new accounts. Inventory acceptance requires completed account setup and warehouse onboarding approval.
            </p>
          </div>

          <div className="pp-card p-5 shadow-sm">
            <div className="border-2 border-dashed rounded-lg p-5" style={{ borderColor: 'var(--line)' }}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest pp-sub">Client Portal Preview</div>
                  <h2 className="pp-display text-4xl font-bold uppercase mt-1">Every unit visible</h2>
                </div>
                <Barcode size={34} className="pp-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <MiniStat label="Units stored" value="1,573" />
                <MiniStat label="Awaiting approval" value="2" accent />
                <MiniStat label="Open issues" value="2" />
                <MiniStat label="Current invoice" value="$748" />
              </div>
              <div className="mt-5 space-y-2">
                {TRUST_LINES.map((x) => (
                  <div key={x} className="flex items-center gap-2 text-sm pp-card px-3 py-2">
                    <CheckCircle2 size={16} style={{ color: 'var(--ok)' }} /> {x}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mb-14">
          <div className="pp-card overflow-hidden">
            <div className="grid md:grid-cols-[1.4fr_1fr]">
              <img
                src="/warehouse.jpg"
                alt="Keystone Prep warehouse in Lansdale, PA — racked inventory and box prep area"
                className="w-full h-full object-cover"
                style={{ minHeight: '420px' }}
              />
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest pp-sub">
                  <MapPin size={15} /> A real facility, not a middleman
                </div>
                <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase leading-none mt-2">
                  Your inventory, in our warehouse.
                </h2>
                <p className="pp-sub mt-3">
                  Keystone runs out of an established, staffed warehouse in Lansdale, PA — racked storage, dedicated prep area, and hands-on receiving. When you send inventory, real people handle it in a real facility you can come see.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-14 mb-14">
          <div className="pp-card p-4 md:p-5 grid md:grid-cols-3 gap-3">
            {TRUST_LINES.map((line) => (
              <div key={line} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {line}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mb-14">
          <div className="pp-card p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <Warehouse size={28} className="pp-accent shrink-0" />
            <p className="text-sm md:text-base pp-sub">
              <span className="font-semibold" style={{ color: 'var(--ink)' }}>Backed by an established warehouse operation.</span> Keystone runs out of the US facility of KT Trims, an apparel-trim manufacturer that supplies major global fashion brands — bringing years of hands-on international receiving, inspection, and labeling experience to your inventory.
            </p>
          </div>
        </section>

        <section id="services" className="border-y" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4 py-14">
            <SectionHeading eyebrow="Services" title="One warehouse. Every channel." />
            <p className="pp-sub mt-3 max-w-2xl">Whether you sell on Amazon, your own store, or TikTok, we receive, prep, store, and ship your inventory — and you watch all of it in real time in the portal.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
              <Feature icon={Boxes} title="Amazon FBA prep" text="Receiving, inspection, FNSKU labeling, polybag, bundle, and box prep to Amazon's spec — so nothing gets rejected or hit with defect fees." />
              <Feature icon={Store} title="DTC fulfillment" text="Store your inventory with us and we pick, pack, and ship individual orders straight to your customers from your Shopify or website store." />
              <Feature icon={ShoppingBag} title="TikTok Shop" text="Fulfillment for TikTok Shop sellers — we handle the orders so you can focus on the content that drives them." />
              <Feature icon={Package} title="Storage & returns" text="Separated client storage by SKU, plus inbound receiving and returns processing as you scale." />
            </div>
          </div>
        </section>

        <section id="process" className="border-y" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4 py-14">
            <SectionHeading eyebrow="Process" title="The boring workflow sellers actually want." />
            <div className="pp-card overflow-hidden mt-8">
              <img
                src="/warehouse2.jpg"
                alt="Keystone Prep warehouse floor in Lansdale, PA — loading dock and staging area where inbound inventory is received"
                className="w-full object-cover"
                style={{ height: '320px' }}
              />
            </div>
            <div className="grid md:grid-cols-4 gap-3 mt-3">
              <Feature icon={Truck} title="Receive" text="Supplier boxes arrive in Lansdale and get logged against the client account." />
              <Feature icon={Camera} title="Photograph" text="Cartons and exceptions are photographed at check-in so clients know exactly what arrived." />
              <Feature icon={Boxes} title="Prep" text="Inspect, label, polybag, bundle, and stage wholesale or private-label inventory for FBA." />
              <Feature icon={Clock} title="Approve" text="Clients review outbound shipments in the portal before anything leaves the warehouse." />
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-[.8fr_1.2fr] gap-8">
          <div>
            <SectionHeading eyebrow="Simple pricing" title="One rate. Fully compliant." />
            <p className="pp-sub mt-3">
              Amazon ended in-house FBA prep in January 2026 — every unit now has to arrive labeled and compliant, or you eat $0.32–$8.25/unit in defect fees. One per-unit rate covers the whole standard flow: receiving, inspection, FNSKU label, and outbound box prep.
            </p>
            <p className="text-sm pp-sub mt-3">
              Shipping, Amazon fees, and special packaging materials are billed separately or paid directly by the client. Final rates depend on SKU complexity and monthly volume.
            </p>
            <p className="text-sm pp-sub mt-3">
              Pricing above is for FBA prep. DTC and TikTok Shop order fulfillment (pick, pack &amp; ship) is quoted per account based on order volume — ask for a quote.
            </p>
          </div>

          <div className="space-y-4">
            <div className="pp-card overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--line)' }}>
                <span className="font-semibold">Standard prep — all-in per unit</span>
                <span className="text-xs pp-sub font-semibold uppercase tracking-wider hidden sm:block">Receive · inspect · label · box</span>
              </div>
              {STANDARD_PREP.map(([name, price], i) => (
                <div key={name} className={`flex items-center justify-between gap-4 p-4 ${i ? 'border-t' : ''}`} style={{ borderColor: 'var(--line)' }}>
                  <span className="font-medium">{name}</span>
                  <span className="pp-mono font-semibold">{price}</span>
                </div>
              ))}
            </div>

            <div className="pp-card overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
                <span className="font-semibold">Add-ons</span>
                <span className="pp-sub text-sm"> — only if your SKU needs them</span>
              </div>
              {ADD_ONS.map(([name, price], i) => (
                <div key={name} className={`flex items-center justify-between gap-4 p-4 ${i ? 'border-t' : ''}`} style={{ borderColor: 'var(--line)' }}>
                  <span className="font-medium">{name}</span>
                  <span className="pp-mono font-semibold">{price}</span>
                </div>
              ))}
            </div>

            <p className="text-sm pp-sub">
              Shipping large wholesale lots? Ask about flat per-carton receiving — cheaper for cases of many low-cost units.
            </p>
          </div>
        </section>

        <section id="fit" className="max-w-6xl mx-auto px-4 pb-14">
          <div className="pp-card p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div>
              <SectionHeading eyebrow="Good fit" title="Who we want first." />
              <ul className="mt-4 space-y-3 text-sm">
                {['Wholesale & private-label FBA sellers', 'Shopify / DTC brands', 'TikTok Shop sellers', '500+ units or orders / month', 'Small-to-medium boxed products', 'Brands that value East Coast speed and real-time visibility'].map(x => <li key={x} className="flex gap-2"><CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {x}</li>)}
              </ul>
            </div>
            <div>
              <SectionHeading eyebrow="Not a fit yet" title="What we decline at first." />
              <ul className="mt-4 space-y-3 text-sm pp-sub">
                {['Hazmat, meltables, or regulated goods', 'Oversize/heavy freight', 'Clothing with tons of size/color variants', 'Very fragile items', 'Porous goods unless sealed before storage'].map(x => <li key={x} className="flex gap-2"><ShieldCheck size={17} /> {x}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="pp-card p-6 md:p-8 grid lg:grid-cols-[.9fr_1.1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest pp-sub"><Warehouse size={15} /> Local trust angle</div>
              <h2 className="pp-display text-4xl md:text-5xl font-bold uppercase leading-none mt-2">Tours welcome for local sellers.</h2>
              <p className="pp-sub mt-3">Philly-metro sellers can schedule a quick warehouse walkthrough before sending inventory. For non-local sellers, the portal demo shows the receiving, photo, approval, and issue-resolution workflow.</p>
            </div>
            <div className="space-y-3">
              {['Separated client rack zones', 'Photo check-ins for cartons and damage reports', 'Pilot test shipments before monthly volume'].map(x => (
                <div key={x} className="pp-card px-4 py-3 flex items-center gap-2 text-sm"><CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {x}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <SectionHeading eyebrow="New accounts." title="Start with 100 units free." />
              <p className="pp-sub mt-3 max-w-2xl">Send your monthly volume, product type, and current prep workflow. If it’s a good fit, we’ll schedule a quick call and walk through the portal demo.</p>
            </div>
            <a href={pilotMailto} onClick={trackQuoteClick} className="pp-btn pp-btn-accent px-6 py-4 flex items-center justify-center gap-2">
              Email {SITE.name} <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-3 justify-between text-sm pp-sub">
          <div>© {new Date().getFullYear()} {SITE.name}. Lansdale, PA.</div>
          <div className="flex gap-4"><a href="/portal" className="hover:underline">Portal demo</a><a href={`mailto:${SITE.contactEmail}`} className="hover:underline">{SITE.contactEmail}</a></div>
        </div>
      </footer>
    </div>
  )
}

function MiniStat({ label, value, accent }) {
  return <div className="pp-card p-3"><div className="text-xs uppercase tracking-wider pp-sub font-semibold">{label}</div><div className="pp-display text-3xl font-bold" style={accent ? { color: 'var(--accent)' } : {}}>{value}</div></div>
}

function Feature({ icon: Icon, title, text }) {
  return <div className="pp-card p-5"><Icon size={22} className="pp-accent" /><h3 className="font-bold mt-4">{title}</h3><p className="text-sm pp-sub mt-2">{text}</p></div>
}

function SectionHeading({ eyebrow, title }) {
  return <div><div className="text-xs font-semibold uppercase tracking-widest pp-sub">{eyebrow}</div><h2 className="pp-display text-4xl md:text-5xl font-bold uppercase leading-none mt-1">{title}</h2></div>
}