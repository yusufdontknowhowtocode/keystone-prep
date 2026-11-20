import { captureAttribution, contactRef, tagContactHref } from './lib/attribution.js'

captureAttribution()

// Text / WhatsApp / email / call clicks on ANY page count as the secondary 'Contact'
// conversion in Google Ads (previously only the homepage tracked these).
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="sms:"], a[href^="https://wa.me"], a[href^="mailto:"], a[href^="tel:"]')
  if (a) {
    // Ad visitors: add a short ref code to the prefilled message so the lead can be traced.
    try {
      const code = contactRef()
      if (code) a.setAttribute('href', tagContactHref(a.getAttribute('href'), code))
    } catch { /* never block the click */ }
  }
  if (a && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
  }
})

const path = window.location.pathname.replace(/\/$/, '') || '/'

if (path === '/') {
  // Homepage is a static page (public/kp + src/landing.html), without React/Tailwind.
  import('./staticLanding.js').then((m) => m.mountStaticLanding())
} else {
  // The build writes page text into the HTML for crawlers (tools/prerender.mjs). If this
  // path was served the homepage file, drop its markup; React renders the page below.
  document.getElementById('kp-prerender')?.remove()

  Promise.all([import('react'), import('react-dom/client'), import('./App.jsx'), import('./styles.css')]).then(
    ([React, { createRoot }, { default: App }]) => {
      const root = document.getElementById('root')
      if (root.hasAttribute('data-kp-static')) {
        // Prerendered copy of this page: clear it so React starts from an empty root.
        root.replaceChildren()
        root.removeAttribute('data-kp-static')
      }
      createRoot(root).render(
        React.createElement(React.StrictMode, null, React.createElement(App)),
      )
    },
  )
}
