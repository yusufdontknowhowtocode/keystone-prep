import React from 'react'
import { ArrowRight, Barcode, Boxes, Camera, CheckCircle2, Clock, MapPin, MessageCircle, Package, Phone, ShieldCheck, ShoppingBag, Store, Truck, Warehouse } from 'lucide-react'
import { SITE } from '../lib/config.js'
import QuoteEstimator from '../components/QuoteEstimator.jsx'

const PHONE_DISPLAY = '267-517-1112'
const PHONE_TEL = '+12675171112'
const WHATSAPP_URL = 'https://wa.me/12675171112'

const PILOT_EMAIL_SUBJECT = 'Keystone Prep Account'
const PILOT_EMAIL_BODY = `Hi Keystone Prep,\n\nI'd like a rate for my volume.\n\nMonthly unit volume:\nProduct type:\nAmazon / Shopify / both:\nWhat city/state do you ship from:\n\nThanks.`
const pilotMailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(PILOT_EMAIL_SUBJECT)}&body=${encodeURIComponent(PILOT_EMAIL_BODY)}`

// Only fires on real intent: opening an email or WhatsApp to us. Form submissions
// fire their own conversion from QuoteEstimator.jsx.
function trackQuoteClick() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
  }
}

const STANDARD_PREP = [
  ['Up to 1,000 units / mo', '$0.65/unit'],
  ['1,001–5,000 units / mo', '$0.60/unit'],
  ['5,001+ units / mo', '$0.55/unit'],
]

const ADD_ONS = [
  ['Polybagging', '$0.25/unit'],
  ['Bubble wrap', '$0.40/unit'],
  ['Bundling / kitting', '$0.50 per unit bundled'],
  ['Pallet storage', '$25/pallet/mo'],
]

const TRUST_LINES = [
  'Inbound cartons photographed at receiving',
  'Each client gets separated SKU storage',
  'Outbound shipments require approval before pickup',
]

const FACILITY_SPECS = [
  ['Dock-high', 'Receiving'],
  ['48 ft', 'Trailer access'],
  ['6,000', 'Sq ft facility'],
  ['9–5 M–F', 'Receiving hours'],
]

const FAQS = [
  {
    q: 'What does the per-unit rate include?',
    a: 'Everything in the standard flow: receiving your inbound shipment, physical inspection and count verification, FNSKU labeling with the manufacturer barcode covered, and outbound box prep to Amazon spec. Add-ons like polybagging or bundling are only billed on SKUs that actually need them.',
  },
  {
    q: 'How fast is turnaround?',
    a: 'Most standard prep ships within 1–2 business days once we have your inventory and label files in hand. Receiving is logged the day freight arrives, and you can watch every step in the portal.',
  },
  {
    q: 'Can you receive containers and pallet freight?',
    a: 'Yes. The dock is elevated to trailer height, the lot takes full 48-foot trailers, and our receiving crew has years of international container experience through the parent warehouse operation. LTL, FTL, and parcel all work.',
  },
  {
    q: 'How do I send you inventory?',
    a: 'Get a rate below, and once your account is set up we send the ship-to address and your portal login. You (or your supplier) ship to us, we photograph and log everything at check-in, and you track it live.',
  },
  {
    q: 'What products do you not accept?',
    a: 'Hazmat, meltables, regulated goods, oversize or heavy freight, very fragile items, and porous goods unless sealed before storage. If you are unsure whether your product qualifies, ask — a two-minute email saves everyone a headache.',
  },
  {
    q: 'Do you handle expiration-dated products?',
    a: 'Yes. Consumables need the expiration date visible on the sellable unit for FBA, and we verify that during prep — including on multipacks and case packs, where the date has to show on the outside of the finished unit.',
  },
  {
    q: 'How does billing work?',
    a: 'You get an itemized invoice after your shipment goes out, payable by card link or bank transfer. No setup fees, no monthly minimums, no long-term contracts.',
  },
  {
    q: 'Can I visit the warehouse?',
    a: 'Please do. Philly-metro sellers are welcome to schedule a walkthrough before sending anything — we would rather you see the racks, the dock, and the prep bench in person than take our word for it.',
  },
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
            <a href="#faq" className="hover:underline">FAQ</a>
            <a href="/portal" className="hover:underline">Portal demo</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={trackQuoteClick}
              className="pp-btn-ghost px-3 py-2 text-sm hidden sm:flex items-center gap-1.5"
              title={`Text or WhatsApp ${PHONE_DISPLAY}`}
            >
              <MessageCircle size={16} /> {PHONE_DISPLAY}
            </a>
            <a href="#contact" className="pp-btn pp-btn-accent px-4 py-2 text-sm"> Get your rate </a>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
              <MapPin size={15} /> Lansdale, PA · East Coast fulfillment & FBA prep
            </div>
            <h1 className="pp-display text-6xl md:text-8xl font-bold uppercase leading-[.85] tracking-tight">
              East Coast FBA prep with a real loading dock.
            </h1>
            <p className="text-lg md:text-xl pp-sub mt-6 max-w-2xl">
              Keystone runs FBA prep and 3PL out of a 6,000 sq ft staffed warehouse in Lansdale, PA — elevated dock at trailer height, a lot that takes full 48-foot containers, racked client storage, and receiving crews with years of international freight experience. Send a container or send a case; either way you watch every unit live in the portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href="#contact" className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2">
                Get your rate <ArrowRight size={18} />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                onClick={trackQuoteClick}
                className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Text / WhatsApp us
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
                  <div className="text-xs font-semibold uppercase tracking-widest pp-sub">The facility</div>
                  <h2 className="pp-display text-4xl font-bold uppercase mt-1">Built for freight</h2>
                </div>
                <Barcode size={34} className="pp-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {FACILITY_SPECS.map(([value, label]) => (
                  <MiniStat key={label} label={label} value={value} />
                ))}
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
              <Feature icon={Truck} title="Receive" text="Containers and parcel freight arrive at the Lansdale dock and get logged against the client account." />
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
            <a href="#contact" className="pp-btn pp-btn-accent px-5 py-3 mt-5 inline-flex items-center gap-2">
              Get your rate <ArrowRight size={17} />
            </a>
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
                {['Wholesale & private-label FBA sellers', 'Sellers receiving containers or pallet freight', 'Shopify / DTC brands', 'TikTok Shop sellers', '1,000+ units or orders / month preferred', 'Brands that value East Coast speed and real-time visibility'].map(x => <li key={x} className="flex gap-2"><CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {x}</li>)}
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
              {['Separated client rack zones', 'Photo check-ins for cartons and damage reports', 'Test shipments before monthly volume'].map(x => (
                <div key={x} className="pp-card px-4 py-3 flex items-center gap-2 text-sm"><CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {x}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="border-t" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4 py-14">
            <SectionHeading eyebrow="FAQ" title="Questions sellers actually ask." />
            <div className="mt-8 space-y-3">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="pp-card px-5 py-4 group">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                    {q}
                    <span className="pp-sub text-xl leading-none select-none group-open:hidden">+</span>
                    <span className="pp-sub text-xl leading-none select-none hidden group-open:inline">−</span>
                  </summary>
                  <p className="text-sm pp-sub mt-3">{a}</p>
                </details>
              ))}
            </div>
            <p className="text-sm pp-sub mt-6 text-center">
              Something else?{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={trackQuoteClick} className="underline font-medium" style={{ color: 'var(--ink)' }}>
                Text or WhatsApp {PHONE_DISPLAY}
              </a>{' '}
              — we reply fast.
            </p>
          </div>
        </section>

        {/* ---------- QUOTE ESTIMATOR + CONTACT ---------- */}
        <section id="contact" className="border-t" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4 py-14 space-y-8">
            <div>
              <SectionHeading eyebrow="New accounts." title="Get your rate." />
              <p className="pp-sub mt-3 max-w-2xl">
                Get a rough number in seconds, then send it over and we'll confirm your exact rate. If it's a good fit we'll schedule a quick call and walk through the portal.
              </p>
              <p className="text-sm font-medium mt-2">
                Your first test shipment — up to 100 units — is on us, so you can see the work before you commit volume.
              </p>
            </div>

            <QuoteEstimator />

            <div className="text-center pt-2 space-y-3">
              <div className="text-sm pp-sub">Prefer to talk to a person?</div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={trackQuoteClick}
                  className="pp-btn-ghost px-5 py-3 inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} /> Text / WhatsApp {PHONE_DISPLAY}
                </a>
                <a href={pilotMailto} onClick={trackQuoteClick} className="pp-btn-ghost px-5 py-3 inline-flex items-center gap-2">
                  Email {SITE.contactEmail} <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-3 justify-between text-sm pp-sub">
          <div>© {new Date().getFullYear()} {SITE.name}. 805 West Fifth Street, Suite 10, Lansdale, PA 19446.</div>
          <div className="flex flex-wrap gap-4">
            <a href={`tel:${PHONE_TEL}`} className="hover:underline flex items-center gap-1"><Phone size={14} /> {PHONE_DISPLAY}</a>
            <a href="/portal" className="hover:underline">Portal demo</a>
            <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">{SITE.contactEmail}</a>
          </div>
        </div>
      </footer>

      {/* ---------- FLOATING WHATSAPP ---------- */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        onClick={trackQuoteClick}
        aria-label={`Text or WhatsApp Keystone Prep at ${PHONE_DISPLAY}`}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full shadow-lg"
        style={{ width: 56, height: 56, background: '#25D366', color: '#fff' }}
      >
        <MessageCircle size={28} />
      </a>
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