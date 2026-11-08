import React, { useMemo } from 'react'
import Landing from './pages/Landing.jsx'
import Portal from './pages/Portal.jsx'
import Admin from './pages/Admin.jsx'
import PackCam from './pages/PackCam.jsx'
import FbaPrepPennsylvania from './pages/FbaPrepPennsylvania.jsx'
import ContainerReceiving from './pages/ContainerReceiving.jsx'
import ShopifyFulfillmentPennsylvania from './pages/ShopifyFulfillmentPennsylvania.jsx'
import FbaRemovalProcessing from './pages/FbaRemovalProcessing.jsx'
import SwitchOffer from './pages/SwitchOffer.jsx'

export default function App() {
  const path = useMemo(() => window.location.pathname.replace(/\/$/, '') || '/', [])
  if (path === '/portal') return <Portal />
  if (path === '/admin') return <Admin />
  if (path === '/pack') return <PackCam />
  if (path === '/fba-prep-pennsylvania') return <FbaPrepPennsylvania />
  if (path === '/container-receiving') return <ContainerReceiving />
  if (path === '/shopify-fulfillment-pennsylvania') return <ShopifyFulfillmentPennsylvania />
  if (path === '/fba-removal-processing') return <FbaRemovalProcessing />
  if (path === '/switch') return <SwitchOffer />
  return <Landing />
}