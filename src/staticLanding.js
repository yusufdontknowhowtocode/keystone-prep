// Public homepage: static markup + /kp/site.js, no React or Tailwind on this page.
// The quote form calls window.KP_SUBMIT, which saves the lead to Supabase, emails it via
// Web3Forms and fires the Google Ads conversion (same as QuoteEstimator.jsx).
import landingHtml from './landing.html?raw'
import { getAttribution } from './lib/attribution.js'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function addCss(href) {
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = href
  document.head.appendChild(l)
}

async function submitLead(d) {
  const attribution = getAttribution()
  const dtc = d.mode === 'dtc'
  const exploring = d.when === 'Just exploring' || d.status === 'Still researching products'
  const soon = d.when === 'Within 2 weeks' || d.when === '2 to 4 weeks'
  const tag = exploring ? '[EXPLORING]' : soon ? '[READY]' : '[LATER]'
  const prep = dtc ? ['DTC fulfillment'] : Object.keys(d.adds || {}).filter((k) => d.adds[k])
  const dtcSummary = `DTC fulfillment: ${d.vol} orders/mo, avg ${d.items} items/order, platform ${d.platform || '—'}`
  const notes = [dtc ? dtcSummary : null, `Current provider: ${d.now}`, d.notes].filter(Boolean).join(' | ')

  let dbFailed = true
  try {
    const { hasSupabaseConfig, supabase } = await import('./lib/supabase.js')
    if (hasSupabaseConfig) {
      const { error } = await supabase.from('leads').insert({
        source: attribution.source,
        name: d.name || null,
        email: d.email,
        brand: d.brand || null,
        phone: d.phone || null,
        product_type: d.product || null,
        monthly_units: d.vol || null,
        prep_needs: prep,
        ship_window: d.when || null,
        inventory_status: d.status || null,
        notes,
        est_rate: Number(d.rate.toFixed(4)),
        est_monthly: Number(d.month.toFixed(2)),
      })
      dbFailed = Boolean(error)
      if (error) console.error('Lead insert failed:', error.message)
    }
  } catch (e) {
    console.error(e)
  }

  let mailFailed = true
  if (WEB3FORMS_KEY) {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `${tag} New ${dtc ? 'DTC fulfillment' : 'prep'} quote request — ${d.brand || d.email}`,
          service: dtc ? 'DTC / Shopify fulfillment' : 'Amazon FBA prep',
          from_name: 'Keystone Prep Center',
          name: d.name || '—',
          email: d.email,
          brand: d.brand || '—',
          phone: d.phone || '—',
          product_type: d.product || '—',
          ...(dtc
            ? { monthly_orders: d.vol, avg_items_per_order: d.items, platform: d.platform || '—' }
            : { monthly_units: d.vol, prep_needs: prep.length ? prep.join(', ') : 'FNSKU only' }),
          ship_window: d.when || '—',
          inventory_status: d.status || '—',
          current_provider: d.now || '—',
          estimated_rate: `$${d.rate.toFixed(2)}/${dtc ? 'order' : 'unit'}`,
          estimated_monthly: money(d.month),
          notes: notes || '—',
          source: `${attribution.source} (landed on ${attribution.landing}${attribution.term ? `, term: ${attribution.term}` : ''})`,
        }),
      })
      mailFailed = !(await res.json()).success
    } catch {
      mailFailed = true
    }
  }

  if (dbFailed && mailFailed) throw new Error('lead not saved')
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: 'AW-18227583658/0YvECJW98qMdEKq1y_ND' }) // 'Quote form submit' (primary)
  }
}

export function mountStaticLanding() {
  if (!document.querySelector('link[href="/kp/site.css"]')) {
    addCss('/kp/fonts.css')
    addCss('/kp/site.css')
  }
  window.KP_SUBMIT = submitLead

  // Text / WhatsApp / email clicks count as the secondary 'Contact' conversion, as before.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="sms:"], a[href^="https://wa.me"], a[href^="mailto:"], a[href^="tel:"]')
    if (a && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
    }
  })

  const root = document.getElementById('root')
  root.insertAdjacentHTML('beforebegin', landingHtml)
  root.remove()

  const s = document.createElement('script')
  s.src = '/kp/site.js'
  document.body.appendChild(s)

  // Arriving via /#pricing etc.: jump once the markup exists.
  const id = window.location.hash.slice(1)
  if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50)
}
