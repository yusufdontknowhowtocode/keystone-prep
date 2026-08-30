import React, { useMemo } from 'react'
import Landing from './pages/Landing.jsx'
import Portal from './pages/Portal.jsx'
import Admin from './pages/Admin.jsx'
import FbaPrepPennsylvania from './pages/FbaPrepPennsylvania.jsx'

export default function App() {
  const path = useMemo(() => window.location.pathname.replace(/\/$/, '') || '/', [])
  if (path === '/portal') return <Portal />
  if (path === '/admin') return <Admin />
  if (path === '/fba-prep-pennsylvania') return <FbaPrepPennsylvania />
  return <Landing />
}