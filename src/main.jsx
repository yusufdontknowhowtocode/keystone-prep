import { captureAttribution } from './lib/attribution.js'

captureAttribution()

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
