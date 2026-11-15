// Build-time only. tools/prerender.mjs bundles this file for Node and calls render(route)
// to get each public page's HTML, so crawlers that don't run JavaScript (ChatGPT, Claude,
// Perplexity, Bing) still receive the page text. Nothing here ships to the browser.
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FbaPrepPennsylvania from './pages/FbaPrepPennsylvania.jsx'
import ContainerReceiving from './pages/ContainerReceiving.jsx'
import ShopifyFulfillmentPennsylvania from './pages/ShopifyFulfillmentPennsylvania.jsx'
import FbaRemovalProcessing from './pages/FbaRemovalProcessing.jsx'
import SwitchOffer from './pages/SwitchOffer.jsx'

const PAGES = {
  '/fba-prep-pennsylvania': FbaPrepPennsylvania,
  '/container-receiving': ContainerReceiving,
  '/shopify-fulfillment-pennsylvania': ShopifyFulfillmentPennsylvania,
  '/fba-removal-processing': FbaRemovalProcessing,
  '/switch': SwitchOffer,
}

export function render(route) {
  const Page = PAGES[route]
  return Page ? renderToStaticMarkup(React.createElement(Page)) : ''
}
