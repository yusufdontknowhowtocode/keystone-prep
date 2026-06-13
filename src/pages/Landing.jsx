import React from 'react'
import { ArrowRight, Barcode, Boxes, Camera, CheckCircle2, Clock, MapPin, ShieldCheck, Truck, Warehouse } from 'lucide-react'
import { SITE } from '../lib/config.js'

const PILOT_EMAIL_SUBJECT = 'Keystone Prep Pilot Account'
const PILOT_EMAIL_BODY = `Hi Keystone Prep,\n\nI'm interested in the first 100 units free pilot.\n\nMonthly unit volume:\nProduct type:\nAmazon / Shopify / both:\nWhat city/state do you ship from:\n\nThanks.`
const pilotMailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(PILOT_EMAIL_SUBJECT)}&body=${encodeURIComponent(PILOT_EMAIL_BODY)}`

const PRICING = [
  ['Receiving + inspection', '$0.35/unit'],
  ['FNSKU labeling', '$0.30/unit'],
  ['Polybagging', '$0.25/unit'],
  ['Bubble/bundle/custom prep', 'quoted per SKU'],
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
            <a href="#process" className="hover:underline">Process</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#fit" className="hover:underline">Pilot fit</a>
            <a href="/portal" className="hover:underline">Portal demo</a>
          </nav>
          <a href={pilotMailto} className="pp-btn pp-btn-accent px-4 py-2 text-sm">Apply for pilot</a>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 pp-card px-3 py-1.5 text-sm font-semibold mb-5">
              <MapPin size={15} /> Lansdale, PA · pilot accounts now opening
            </div>
            <h1 className="pp-display text-6xl md:text-8xl font-bold uppercase leading-[.85] tracking-tight">
              East Coast FBA prep for wholesale sellers.
            </h1>
            <p className="text-lg md:text-xl pp-sub mt-6 max-w-2xl">
              Pilot onboarding for wholesale and private-label sellers who want photo check-ins, separated storage, and a live portal before inventory moves to Amazon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a href={pilotMailto} className="pp-btn pp-btn-accent px-5 py-3 flex items-center justify-center gap-2">
                Apply for first 100 units free <ArrowRight size={18} />
              </a>
              <a href="/portal" className="pp-btn-ghost px-5 py-3 flex items-center justify-center gap-2">
                View portal demo
              </a>
            </div>
            <p className="text-xs pp-sub mt-4 max-w-xl">
              We’re onboarding a small number of test shipments after account approval. Inventory acceptance requires completed account setup and warehouse onboarding approval.
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

        <section className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-14 mb-14">
          <div className="pp-card p-4 md:p-5 grid md:grid-cols-3 gap-3">
            {TRUST_LINES.map((line) => (
              <div key={line} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {line}
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="border-y" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4 py-14">
            <SectionHeading eyebrow="Process" title="The boring workflow sellers actually want." />
            <div className="grid md:grid-cols-4 gap-3 mt-8">
              <Feature icon={Truck} title="Receive" text="Supplier boxes arrive in Lansdale and get logged against the client account." />
              <Feature icon={Camera} title="Photograph" text="Cartons and exceptions are photographed at check-in so clients know exactly what arrived." />
              <Feature icon={Boxes} title="Prep" text="Inspect, label, polybag, bundle, and stage wholesale or private-label inventory for FBA." />
              <Feature icon={Clock} title="Approve" text="Clients review outbound shipments in the portal before anything leaves the warehouse." />
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-[.8fr_1.2fr] gap-8">
          <div>
            <SectionHeading eyebrow="Simple pricing" title="Clear pilot pricing." />
            <p className="pp-sub mt-3">Simple per-unit pricing for pilot accounts. Final rates depend on SKU complexity, packaging requirements, and monthly volume.</p>
            <p className="text-sm pp-sub mt-3">Shipping, Amazon fees, and special packaging materials are billed separately or paid directly by the client. </p>
          </div>
          <div className="pp-card overflow-hidden">
            {PRICING.map(([name, price], i) => (
              <div key={name} className={`flex items-center justify-between gap-4 p-4 ${i ? 'border-t' : ''}`} style={{ borderColor: 'var(--line)' }}>
                <span className="font-medium">{name}</span>
                <span className="pp-mono font-semibold">{price}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="fit" className="max-w-6xl mx-auto px-4 pb-14">
          <div className="pp-card p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div>
              <SectionHeading eyebrow="Good fit" title="Who we want first." />
              <ul className="mt-4 space-y-3 text-sm">
                {['Wholesale FBA sellers', 'Private-label brands', '500–3,000 units/month', 'Small-to-medium boxed products', 'Brands that value East Coast speed and photo check-ins'].map(x => <li key={x} className="flex gap-2"><CheckCircle2 size={17} style={{ color: 'var(--ok)' }} /> {x}</li>)}
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
              <SectionHeading eyebrow="Pilot accounts" title="Start with 100 units free." />
              <p className="pp-sub mt-3 max-w-2xl">Send your monthly volume, product type, and current prep workflow. If it’s a good fit, we’ll schedule a quick call and walk through the portal demo.</p>
            </div>
            <a href={pilotMailto} className="pp-btn pp-btn-accent px-6 py-4 flex items-center justify-center gap-2">
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