// Runs after `vite build`. Writes the page text into the built HTML so crawlers that don't
// run JavaScript (ChatGPT, Claude, Perplexity, Bing) can read the site.
//
//   dist/index.html                -> homepage markup (src/landing.html) inside #kp-prerender
//   dist/<service-page>/index.html -> that page's own title, description, canonical and its
//                                     React markup inside #root[data-kp-static]
//   dist/portal|admin|pack/index.html -> the bare app shell
//
// The browser code (src/main.jsx, src/staticLanding.js) adopts or clears this markup, so
// visitors see the same pages as before. This script never fails the build: on any error
// it logs a warning and leaves dist as vite built it.
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.env.KP_DIST ? path.resolve(process.env.KP_DIST) : path.join(ROOT, 'dist')
const SSR_OUT = path.join(ROOT, '.prerender')
const SITE = 'https://keystoneprepcenter.com'

// Public pages. Title and description are read from each page's own useEffect, so they
// stay in one place.
const PAGES = [
  { route: '/fba-prep-pennsylvania', file: 'FbaPrepPennsylvania.jsx' },
  { route: '/container-receiving', file: 'ContainerReceiving.jsx' },
  { route: '/shopify-fulfillment-pennsylvania', file: 'ShopifyFulfillmentPennsylvania.jsx' },
  { route: '/fba-removal-processing', file: 'FbaRemovalProcessing.jsx' },
  { route: '/switch', file: 'SwitchOffer.jsx' },
]

// App routes get the plain shell (no homepage markup). Admin and pack stay out of search.
const APP_ROUTES = [
  { route: '/portal', title: 'Client Portal | Keystone Prep Center' },
  { route: '/admin', title: 'Admin | Keystone Prep Center', noindex: true },
  { route: '/pack', title: 'Pack | Keystone Prep Center', noindex: true },
]

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

export function extractMeta(src) {
  const unquote = (s) => s.replace(/\\(['"`\\])/g, '$1').replace(/\s*\n\s*/g, ' ')
  const title = src.match(/document\.title\s*=\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/)
  const desc = src.match(/['"]content['"]\s*,\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/)
  return {
    title: title ? unquote(title[2]) : null,
    description: desc ? unquote(desc[2]) : null,
  }
}

// Swap one tag for another, or add it before </head> when the shell doesn't have it.
function setTag(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, () => tag)
  return html.replace(/<\/head>/i, () => `    ${tag}\n  </head>`)
}

export function setHead(html, { title, description, url, noindex }) {
  let out = html
  if (title) {
    out = setTag(out, /<title>[\s\S]*?<\/title>/i, `<title>${escText(title)}</title>`)
    out = setTag(
      out,
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escAttr(title)}" />`,
    )
  }
  if (description) {
    out = setTag(
      out,
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escAttr(description)}" />`,
    )
    out = setTag(
      out,
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escAttr(description)}" />`,
    )
  }
  if (url) {
    out = setTag(
      out,
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${escAttr(url)}" />`,
    )
    out = setTag(out, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escAttr(url)}" />`)
  }
  if (noindex) {
    out = setTag(out, /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex" />')
  }
  return out
}

const ROOT_DIV = /<div id="root"><\/div>/

// The homepage stylesheets are normally added by a script in <head>. This covers visitors
// with JavaScript off, who now get the markup and would otherwise see it unstyled.
const HOME_CSS_NOSCRIPT =
  '<noscript><link rel="stylesheet" href="/kp/fonts.css" /><link rel="stylesheet" href="/kp/site.css" /></noscript>'

export function injectHome(html, landing) {
  if (!ROOT_DIV.test(html)) throw new Error('no <div id="root"></div> in the built index.html')
  return html
    .replace(/<\/head>/i, () => `    ${HOME_CSS_NOSCRIPT}\n  </head>`)
    .replace(ROOT_DIV, () => `<div id="kp-prerender">\n${landing}\n</div>\n    <div id="root"></div>`)
}

export function injectPage(html, markup) {
  if (!markup) return html
  if (!ROOT_DIV.test(html)) throw new Error('no <div id="root"></div> in the built index.html')
  return html.replace(ROOT_DIV, () => `<div id="root" data-kp-static>${markup}</div>`)
}

// Bundle the pages for Node with the project's own vite config, then load the bundle.
// Returns null when that isn't possible, and the pages are written with their head tags only.
async function loadRenderer() {
  try {
    const { build } = await import('vite')
    await build({
      root: ROOT,
      logLevel: 'warn',
      build: { ssr: 'src/prerender-entry.js', outDir: SSR_OUT, emptyOutDir: true, copyPublicDir: false },
    })
    const entry = (await readdir(SSR_OUT)).find((f) => /^prerender-entry\.m?js$/.test(f))
    if (!entry) throw new Error('server bundle not found in .prerender')
    const mod = await import(pathToFileURL(path.join(SSR_OUT, entry)).href)
    if (typeof mod.render !== 'function') throw new Error('server bundle has no render()')
    return mod.render
  } catch (e) {
    console.warn(`[prerender] page markup skipped: ${e.message}`)
    return null
  }
}

async function writeRoute(route, html) {
  const dir = path.join(DIST, route.replace(/^\//, ''))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), html)
}

async function main() {
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8')
  if (shell.includes('id="kp-prerender"')) {
    console.log('[prerender] dist/index.html is already prerendered, nothing to do')
    return
  }
  const landing = await readFile(path.join(ROOT, 'src', 'landing.html'), 'utf8')
  const render = process.env.KP_SKIP_SSR ? null : await loadRenderer()
  const report = []

  for (const page of PAGES) {
    const meta = extractMeta(await readFile(path.join(ROOT, 'src', 'pages', page.file), 'utf8'))
    let markup = ''
    if (render) {
      try {
        markup = render(page.route)
      } catch (e) {
        console.warn(`[prerender] ${page.route}: markup skipped: ${e.message}`)
      }
    }
    const html = injectPage(setHead(shell, { ...meta, url: SITE + page.route }), markup)
    await writeRoute(page.route, html)
    report.push(`${page.route} (${markup ? Math.round(markup.length / 1024) + ' KB of markup' : 'head tags only'})`)
  }

  for (const app of APP_ROUTES) {
    await writeRoute(app.route, setHead(shell, { title: app.title, url: SITE + app.route, noindex: app.noindex }))
    report.push(`${app.route} (shell)`)
  }

  // Homepage last, so everything above started from the untouched shell.
  await writeFile(path.join(DIST, 'index.html'), injectHome(setHead(shell, { url: SITE + '/' }), landing))
  report.push(`/ (${Math.round(landing.length / 1024)} KB of markup)`)

  console.log('[prerender] wrote:\n  ' + report.join('\n  '))
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  main()
    .catch((e) => console.warn(`[prerender] skipped, dist left as built: ${e.message}`))
    .finally(() => rm(SSR_OUT, { recursive: true, force: true }).catch(() => {}))
}
