import React, { useMemo } from 'react'
import Landing from './pages/Landing.jsx'
import Portal from './pages/Portal.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const path = useMemo(() => window.location.pathname.replace(/\/$/, '') || '/', [])
  if (path === '/portal') return <Portal />
  if (path === '/admin') return <Admin />
  return <Landing />
}
