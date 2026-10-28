// Remembers where a visitor came from on their FIRST page load, so a lead that
// submits the quote form after clicking around the site is still tagged correctly.
// Google Ads auto-tagging adds gclid/gbraid/wbraid; our own links can add ?src=.
const KEY = 'kp_attribution'

export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return
    const p = new URLSearchParams(window.location.search)
    const clickId = p.get('gclid') || p.get('gbraid') || p.get('wbraid')
    let source = p.get('src') || p.get('utm_source') || null
    if (clickId) source = 'google_ads'
    if (!source) {
      const ref = document.referrer
      if (ref && !ref.includes(window.location.hostname)) {
        try { source = 'ref:' + new URL(ref).hostname } catch { /* ignore */ }
      }
    }
    sessionStorage.setItem(KEY, JSON.stringify({
      source: source || 'direct',
      landing: window.location.pathname,
      campaign: p.get('utm_campaign') || null,
      term: p.get('utm_term') || null,
    }))
  } catch { /* storage blocked: getAttribution falls back to the current URL */ }
}

export function getAttribution() {
  try {
    const saved = sessionStorage.getItem(KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  const p = new URLSearchParams(window.location.search)
  const clickId = p.get('gclid') || p.get('gbraid') || p.get('wbraid')
  return { source: clickId ? 'google_ads' : (p.get('src') || 'organic'), landing: window.location.pathname, campaign: null, term: null }
}
