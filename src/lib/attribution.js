// Remembers where a visitor came from, so a lead that submits the quote form later
// (after clicking around, or on a return visit days after an ad click) is still tagged.
// Google Ads auto-tagging adds gclid/gbraid/wbraid; our own links can add ?src=.
//
// Kept in localStorage for 90 days (the Google Ads click window). An ad click is never
// replaced by a later direct/organic visit; it is only replaced by a newer ad click.
const KEY = 'kp_attribution'
const SEEN = 'kp_attribution_seen' // one capture per tab session
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

const PAID = ['google_ads', 'meta', 'facebook', 'fb', 'instagram', 'ig']
const isPaid = (a) => PAID.includes(String(a?.source || '').toLowerCase())

// What the current page load says about where the visitor came from.
function currentTouch() {
  const p = new URLSearchParams(window.location.search)
  const clickId = p.get('gclid') || p.get('gbraid') || p.get('wbraid')
  let source = p.get('src') || p.get('utm_source') || null
  if (!clickId && p.get('fbclid') && !source) source = 'meta'
  if (clickId) source = 'google_ads'
  if (!source) {
    const ref = document.referrer
    if (ref && !ref.includes(window.location.hostname)) {
      try { source = 'ref:' + new URL(ref).hostname } catch { /* ignore */ }
    }
  }
  return {
    source: source || 'direct',
    landing: window.location.pathname,
    campaign: p.get('utm_campaign') || null,
    term: p.get('utm_term') || null,
    ts: Date.now(),
  }
}

function readSaved() {
  for (const store of ['localStorage', 'sessionStorage']) {
    try {
      const raw = window[store].getItem(KEY)
      if (!raw) continue
      const a = JSON.parse(raw)
      if (!a || !a.source) continue
      if (a.ts && Date.now() - a.ts > MAX_AGE_MS) continue
      return a
    } catch { /* storage blocked or bad JSON: try the next one */ }
  }
  return null
}

function save(a) {
  const raw = JSON.stringify(a)
  try { localStorage.setItem(KEY, raw); return } catch { /* fall through */ }
  try { sessionStorage.setItem(KEY, raw) } catch { /* storage blocked: getAttribution falls back to the current URL */ }
}

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(SEEN)) return
    sessionStorage.setItem(SEEN, '1')
  } catch { /* storage blocked: still try to save below */ }
  const now = currentTouch()
  const saved = readSaved()
  if (saved) {
    if (now.source === 'direct') return // a return visit keeps what first brought them
    if (isPaid(saved) && !isPaid(now)) return // an ad click isn't replaced by organic
  }
  save(now)
}

export function getAttribution() {
  return readSaved() || currentTouch()
}

// Marketing channel (what brought them) for the Admin > Marketing tab.
// Must match the names used in MarketingTab.jsx so spend and leads line up.
// `dtc` = the lead filled the form in DTC mode. Auto-tagged ad clicks carry no campaign
// name, so the landing page and the form mode decide DTC vs FBA.
export function channelFromAttribution(a, { dtc = false } = {}) {
  const src = String(a?.source || '').toLowerCase()
  const campaign = String(a?.campaign || '').toLowerCase()
  const landing = String(a?.landing || '').toLowerCase()
  if (src === 'google_ads') {
    const dtcAd = /dtc|shopify/.test(campaign) || /shopify|fulfillment/.test(landing) || (dtc && !/fba|amazon|prep/.test(landing))
    return dtcAd ? 'Google Ads – DTC' : 'Google Ads – FBA'
  }
  if (['meta', 'facebook', 'fb', 'instagram', 'ig'].includes(src)) return 'Meta Ads'
  if (src.startsWith('ref:') && /google|bing|duckduckgo|yahoo/.test(src)) return 'Google search (organic)'
  if (src.startsWith('ref:') && /reddit/.test(src)) return 'Reddit'
  if (src.startsWith('ref:') && /linkedin/.test(src)) return 'LinkedIn'
  if (src.startsWith('ref:') && /amazon/.test(src)) return 'Amazon SPN'
  // A form lead with no known origin. Named so it shows as its own row instead of
  // mixing with hand-entered leads nobody has tagged yet.
  return 'Website – unattributed'
}
