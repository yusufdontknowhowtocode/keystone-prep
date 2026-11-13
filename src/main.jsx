import { captureAttribution } from './lib/attribution.js'

captureAttribution()

// Text / WhatsApp / email / call clicks on ANY page count as the secondary 'Contact'
// conversion in Google Ads (previously only the homepage tracked these).
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="sms:"], a[href^="https://wa.me"], a[href^="mailto:"], a[href^="tel:"]')
  if (a && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: 'AW-18227583658/GBCbCLurnckcEKq1y_ND' })
  }
})

const path = window.location.pathname.replace(/\/$/, '') || '/'

if (path === '/') {
  // Homepage is a static page (public/kp + src/landing.html), without React/Tailwind.
  import('./staticLanding.js').then((m) => m.mountStaticLanding())
} else {
  Promise.all([import('react'), import('react-dom/client'), import('./App.jsx'), import('./styles.css')]).then(
    ([React, { createRoot }, { default: App }]) => {
      createRoot(document.getElementById('root')).render(
        React.createElement(React.StrictMode, null, React.createElement(App)),
      )
    },
  )
}
