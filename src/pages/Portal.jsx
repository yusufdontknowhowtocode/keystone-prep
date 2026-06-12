import React, { useEffect, useMemo, useState } from 'react'
import {
  Boxes, AlertTriangle, CreditCard, Settings, LayoutDashboard, Check, Search,
  ChevronRight, Bell, ArrowDownToLine, ArrowUpFromLine, X, LogOut, RefreshCw
} from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase.js'
import {
  DEMO_CLIENT, DEMO_SKUS, DEMO_INBOUND, DEMO_OUTBOUND, DEMO_ISSUES, DEMO_INVOICES, DEMO_ACTIVITY,
} from '../lib/demoData.js'
import { Barcode, Stamp, Photos, Stat, SectionTitle, LoadingCard, ErrorCard, formatDateTime, formatMoney, formatShortDate } from '../components/PortalUI.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'inbound', label: 'Inbound', icon: ArrowDownToLine },
  { id: 'outbound', label: 'Outbound', icon: ArrowUpFromLine },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function emptyData() {
  return { client: null, skus: [], inbound: [], outbound: [], issues: [], invoices: [], activity: [] }
}

function demoData() {
  return {
    client: DEMO_CLIENT,
    skus: DEMO_SKUS,
    inbound: DEMO_INBOUND,
    outbound: DEMO_OUTBOUND,
    issues: DEMO_ISSUES,
    invoices: DEMO_INVOICES,
    activity: DEMO_ACTIVITY,
  }
}

async function fetchPortalData(userId) {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (clientError) throw clientError

  const [skus, inbound, outbound, issues, invoices, activity] = await Promise.all([
    supabase.from('skus').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('inbound_shipments').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('outbound_shipments').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('damage_reports').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*, invoice_lines(*)').eq('client_id', client.id).order('created_at', { ascending: false }),
    supabase.from('activity_log').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(25),
  ])

  for (const result of [skus, inbound, outbound, issues, invoices, activity]) {
    if (result.error) throw result.error
  }

  return {
    client,
    skus: skus.data || [],
    inbound: inbound.data || [],
    outbound: outbound.data || [],
    issues: issues.data || [],
    invoices: invoices.data || [],
    activity: activity.data || [],
  }
}

export default function Portal() {
  const [page, setPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState(hasSupabaseConfig ? 'login' : 'demo')
  const [data, setData] = useState(hasSupabaseConfig ? emptyData() : demoData())
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const ping = (msg) => { setToast(msg); window.setTimeout(() => setToast(null), 2600) }

  useEffect(() => {
    if (!hasSupabaseConfig) return
    let mounted = true
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!mounted) return
      setSession(sessionData.session)
      setMode(sessionData.session ? 'live' : 'login')
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setMode(newSession ? 'live' : 'login')
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (mode !== 'live' || !session?.user?.id) return
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, session?.user?.id])

  async function refresh() {
    if (mode === 'demo') {
      setData(demoData())
      return
    }
    setLoading(true)
    setError('')
    try {
      setData(await fetchPortalData(session.user.id))
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function approve(id) {
    if (mode === 'demo') {
      setData(prev => ({
        ...prev,
        outbound: prev.outbound.map(s => s.id === id ? { ...s, status: 'approved', approved_at: new Date().toISOString() } : s),
        activity: [{ id: crypto.randomUUID(), created_at: new Date().toISOString(), message: `Shipment approved — shipping on today's carrier pickup`, kind: 'out' }, ...prev.activity],
      }))
      ping('Demo shipment approved.')
      return
    }
    const { error: rpcError } = await supabase.rpc('approve_outbound_shipment', { shipment_id: id })
    if (rpcError) return ping(rpcError.message)
    await refresh()
    ping('Shipment approved.')
  }

  async function resolveIssue(id, resolution) {
    if (mode === 'demo') {
      setData(prev => ({
        ...prev,
        issues: prev.issues.map(d => d.id === id ? { ...d, status: 'resolved', resolution, resolved_at: new Date().toISOString() } : d),
        activity: [{ id: crypto.randomUUID(), created_at: new Date().toISOString(), message: `Damage report resolved — ${resolution.toLowerCase()}`, kind: 'issue' }, ...prev.activity],
      }))
      ping(`Demo damage report: ${resolution}.`)
      return
    }
    const { error: rpcError } = await supabase.rpc('resolve_damage_report', { report_id: id, resolution_text: resolution })
    if (rpcError) return ping(rpcError.message)
    await refresh()
    ping('Damage report updated.')
  }

  async function updatePrefs(nextPrefs) {
    if (mode === 'demo') {
      setData(prev => ({ ...prev, client: { ...prev.client, prefs: nextPrefs } }))
      ping('Demo preferences saved.')
      return
    }
    const { error: rpcError } = await supabase.rpc('update_client_prefs', { next_prefs: nextPrefs })
    if (rpcError) return ping(rpcError.message)
    setData(prev => ({ ...prev, client: { ...prev.client, prefs: nextPrefs } }))
    ping('Preferences saved.')
  }

  async function signOut() {
    if (hasSupabaseConfig) await supabase.auth.signOut()
    setData(emptyData())
    setMode('login')
  }

  if (loading) return <PortalShell client={data.client} mode={mode}><LoadingCard message="Loading portal…" /></PortalShell>
  if (mode === 'login') return <LoginScreen onDemo={() => { setMode('demo'); setData(demoData()) }} />

  const client = data.client || DEMO_CLIENT
  const openIssues = data.issues.filter(i => i.status === 'open').length
  const pending = data.outbound.filter(o => o.status === 'awaiting_approval').length
  const badge = { outbound: pending, issues: openIssues }

  return (
    <PortalShell client={client} mode={mode} signOut={signOut} refresh={refresh}>
      {error && <ErrorCard message={error} />}
      <nav className="border-b pp-line sticky top-0 z-10 -mx-4 px-2 mb-6" style={{ background: 'var(--paper)' }}>
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto py-2">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`pp-navbtn px-3 py-1.5 text-sm flex items-center gap-1.5 whitespace-nowrap ${page === n.id ? 'active' : ''}`}>
              <n.icon size={15} />
              {n.label}
              {badge[n.id] > 0 && <span className="pp-mono text-xs px-1.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>{badge[n.id]}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pb-16 space-y-6">
        {page === 'dashboard' && <Dashboard {...data} go={setPage} />}
        {page === 'inventory' && <Inventory skus={data.skus} />}
        {page === 'inbound' && <Inbound inbound={data.inbound} />}
        {page === 'outbound' && <Outbound outbound={data.outbound} approve={approve} />}
        {page === 'issues' && <Issues issues={data.issues} resolve={resolveIssue} />}
        {page === 'billing' && <Billing invoices={data.invoices} ping={ping} />}
        {page === 'settings' && <Prefs client={client} updatePrefs={updatePrefs} />}
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </PortalShell>
  )
}

function PortalShell({ client, mode, children, signOut, refresh }) {
  return (
    <div className="pp-root">
      <header className="border-b-2" style={{ borderColor: 'var(--ink)', background: 'var(--card)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-end justify-between gap-4">
          <div>
            <a href="/" className="text-xs font-semibold uppercase tracking-widest pp-sub hover:underline">← Back to site</a>
            <h1 className="pp-display text-3xl sm:text-4xl font-bold uppercase leading-none mt-1">{client?.name || 'Client Portal'}</h1>
            <div className="text-xs mt-1 pp-sub">{mode === 'demo' ? 'Demo mode' : 'Live Supabase mode'}</div>
          </div>
          <div className="text-right hidden sm:block">
            <Barcode value={client?.account_code || 'PORTAL'} />
            <div className="pp-mono text-xs mt-1 tracking-widest">{client?.account_code || '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            {refresh && <button onClick={refresh} className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>}
            {signOut && mode !== 'demo' && <button onClick={signOut} className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1"><LogOut size={14} /> Logout</button>}
            <button className="sm:hidden relative" aria-label="Notifications"><Bell size={20} /></button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-0">{children}</div>
    </div>
  )
}

function LoginScreen({ onDemo }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!hasSupabaseConfig) return onDemo()
    setBusy(true); setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) setError(loginError.message)
    setBusy(false)
  }

  return (
    <div className="pp-root min-h-screen flex items-center justify-center px-4">
      <div className="pp-card w-full max-w-md p-6">
        <div className="text-xs font-semibold uppercase tracking-widest pp-sub">Keystone Prep</div>
        <h1 className="pp-display text-4xl font-bold uppercase mt-1">Client Portal</h1>
        <p className="text-sm pp-sub mt-2">Log in with the account we create for your brand. Use demo mode for the Loom/video walkthrough.</p>
        {error && <div className="mt-4 text-sm p-3 rounded" style={{ background: '#FEF2F2', color: 'var(--bad)' }}>{error}</div>}
        <form onSubmit={submit} className="space-y-3 mt-5">
          <input className="pp-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="pp-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="pp-btn pp-btn-accent w-full py-3" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        </form>
        <button onClick={onDemo} className="pp-btn-ghost w-full py-3 mt-3">Open demo portal</button>
        {!hasSupabaseConfig && <p className="text-xs pp-sub mt-3">No Supabase env vars found, so live login is disabled locally.</p>}
      </div>
    </div>
  )
}

function Dashboard({ skus, outbound, invoices, activity, go }) {
  const onHand = skus.reduce((s, x) => s + Number(x.on_hand || 0), 0)
  const pendingApproval = outbound.filter(o => o.status === 'awaiting_approval').length
  const openInv = invoices.find(i => i.status === 'open')
  const balance = openInv ? (openInv.invoice_lines || []).reduce((s, l) => s + Number(l.qty || 0) * Number(l.rate || 0), 0) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Units in storage" value={onHand.toLocaleString()} sub={`Across ${skus.length} SKUs`} />
        <Stat label="Received this month" value="—" sub="Updates from admin" />
        <Stat label="Awaiting approval" value={pendingApproval} sub="Outbound shipments" accent={pendingApproval > 0} />
        <Stat label="Current balance" value={formatMoney(balance)} sub={openInv ? openInv.period : '—'} />
      </div>

      {pendingApproval > 0 && (
        <button onClick={() => go('outbound')} className="w-full pp-card p-4 flex items-center justify-between text-left" style={{ borderColor: 'var(--accent)', borderWidth: 2 }}>
          <div className="flex items-center gap-3">
            <ArrowUpFromLine className="pp-accent" size={20} />
            <div>
              <div className="font-semibold">{pendingApproval} shipment{pendingApproval > 1 ? 's' : ''} staged and ready</div>
              <div className="text-sm pp-sub">Review box counts and approve to ship</div>
            </div>
          </div>
          <ChevronRight size={18} className="pp-sub" />
        </button>
      )}

      <div>
        <SectionTitle>Activity</SectionTitle>
        <div className="pp-card divide-y" style={{ borderColor: 'var(--line)' }}>
          {activity.map(a => <ActivityRow key={a.id} item={a} />)}
          {activity.length === 0 && <div className="p-8 text-center pp-sub text-sm">No activity yet.</div>}
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item }) {
  return (
    <div className="p-4 flex gap-3 items-start pp-row" style={{ borderColor: 'var(--line)' }}>
      <div className="mt-0.5">
        {item.kind === 'in' && <ArrowDownToLine size={16} style={{ color: 'var(--ok)' }} />}
        {item.kind === 'out' && <ArrowUpFromLine size={16} className="pp-accent" />}
        {item.kind === 'issue' && <AlertTriangle size={16} style={{ color: 'var(--warn)' }} />}
        {item.kind === 'pay' && <CreditCard size={16} style={{ color: 'var(--ok)' }} />}
      </div>
      <div className="flex-1">
        <div className="text-sm">{item.message}</div>
        <div className="text-xs pp-sub mt-0.5">{formatDateTime(item.created_at)}</div>
      </div>
    </div>
  )
}

function Inventory({ skus }) {
  const [q, setQ] = useState('')
  const rows = skus.filter(s => `${s.sku} ${s.name} ${s.fnsku || ''}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <SectionTitle right={<div className="flex items-center gap-2 pp-card px-3 py-1.5"><Search size={14} className="pp-sub" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SKU or name" className="bg-transparent outline-none text-sm w-40" /></div>}>Inventory</SectionTitle>
      <div className="space-y-3">
        {rows.map(s => (
          <div key={s.id} className="pp-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="pp-mono text-xs pp-sub mt-1">{s.sku} · FNSKU {s.fnsku || '—'}</div>
                <div className="text-xs pp-sub mt-1">Prep: {s.prep_spec}</div>
              </div>
              <Photos count={s.photo_count || 0} />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div><div className="pp-display text-2xl font-bold">{s.on_hand}</div><div className="text-xs pp-sub uppercase tracking-wide">On hand</div></div>
              <div><div className="pp-display text-2xl font-bold" style={{ color: 'var(--ok)' }}>{s.prepped}</div><div className="text-xs pp-sub uppercase tracking-wide">Prepped</div></div>
              <div><div className="pp-display text-2xl font-bold pp-sub">{Number(s.shipped_lifetime || 0).toLocaleString()}</div><div className="text-xs pp-sub uppercase tracking-wide">Shipped</div></div>
              <div><div className="pp-display text-2xl font-bold" style={{ color: s.damaged ? 'var(--bad)' : 'var(--sub)' }}>{s.damaged}</div><div className="text-xs pp-sub uppercase tracking-wide">Damaged</div></div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="pp-card p-8 text-center pp-sub text-sm">No SKUs match your search.</div>}
      </div>
    </div>
  )
}

function Inbound({ inbound }) {
  const label = { in_transit: ['In transit', 'warn'], receiving: ['Receiving now', 'accent'], received: ['Received', 'ok'] }
  return (
    <div>
      <SectionTitle>Inbound to warehouse</SectionTitle>
      <div className="space-y-3">
        {inbound.map(s => (
          <div key={s.id} className="pp-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3"><span className="pp-mono font-semibold">{s.ref_code}</span><Stamp tone={label[s.status]?.[1]}>{label[s.status]?.[0] || s.status}</Stamp></div>
              <div className="text-sm mt-1">{s.source}</div>
              <div className="pp-mono text-xs pp-sub mt-1">{s.carrier || 'Carrier TBD'} · {s.tracking || 'Tracking TBD'}</div>
              {s.received_at && <div className="text-xs mt-1" style={{ color: 'var(--ok)' }}>✓ Checked in {formatDateTime(s.received_at)}</div>}
            </div>
            <div className="text-right"><div className="pp-display text-3xl font-bold">{s.received_units || s.expected_units || 0}</div><div className="text-xs pp-sub uppercase tracking-wide">units · ETA {formatShortDate(s.eta)}</div></div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Forward supplier tracking numbers and they appear here. Every carton can be photographed at check-in.</p>
    </div>
  )
}

function Outbound({ outbound, approve }) {
  return (
    <div>
      <SectionTitle>Outbound to Amazon</SectionTitle>
      <div className="space-y-3">
        {outbound.map(s => (
          <div key={s.id} className="pp-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="pp-mono font-semibold">{s.ref_code}</span>
                  {s.status === 'awaiting_approval' && <Stamp tone="accent">Awaiting approval</Stamp>}
                  {s.status === 'approved' && <Stamp tone="warn">Approved</Stamp>}
                  {s.status === 'shipped' && <Stamp tone="ok">Shipped {formatShortDate(s.shipped_at)}</Stamp>}
                  {s.status === 'staging' && <Stamp tone="ink">Staging</Stamp>}
                </div>
                <div className="text-sm mt-1">{s.destination}</div>
                <div className="pp-mono text-xs pp-sub mt-1">{s.units || 0} units · {s.boxes || 0} boxes · {s.weight_lb || 0} lb · {(s.sku_list || []).join(', ')}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right"><div className="pp-display text-2xl font-bold">{formatMoney(s.est_cost)}</div><div className="text-xs pp-sub uppercase tracking-wide">est. prep + freight</div></div>
                {s.status === 'awaiting_approval' && <button onClick={() => approve(s.id)} className="pp-btn pp-btn-accent px-4 py-2 text-sm flex items-center gap-1.5"><Check size={15} /> Approve</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Nothing leaves the building without approval unless the client has enabled auto-approve.</p>
    </div>
  )
}

function Issues({ issues, resolve }) {
  return (
    <div>
      <SectionTitle>Damage reports</SectionTitle>
      <div className="space-y-3">
        {issues.map(d => (
          <div key={d.id} className="pp-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3"><span className="pp-mono font-semibold">{d.ref_code}</span>{d.status === 'open' ? <Stamp tone="bad">Needs decision</Stamp> : <Stamp tone="ok">{d.resolution}</Stamp>}</div>
                <div className="pp-mono text-xs pp-sub mt-1">{d.sku} · {d.units} units · found {formatShortDate(d.created_at)}</div>
                <p className="text-sm mt-2">{d.note}</p>
                <div className="mt-3"><Photos urls={d.photo_urls} /></div>
              </div>
              {d.status === 'open' && <div className="flex flex-col gap-2"><button onClick={() => resolve(d.id, 'Disposed')} className="pp-btn-ghost px-3 py-1.5 text-sm">Dispose units</button><button onClick={() => resolve(d.id, 'Return to client')} className="pp-btn-ghost px-3 py-1.5 text-sm">Return to me</button></div>}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Damaged units are quarantined and photographed. The client decides what happens next.</p>
    </div>
  )
}

function Billing({ invoices, ping }) {
  return (
    <div>
      <SectionTitle>Billing</SectionTitle>
      <div className="space-y-4">
        {invoices.map(inv => {
          const total = (inv.invoice_lines || []).reduce((s, l) => s + Number(l.qty || 0) * Number(l.rate || 0), 0)
          return (
            <div key={inv.id} className="pp-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-2"><div className="flex items-center gap-3"><span className="pp-mono font-semibold">{inv.ref_code}</span>{inv.status === 'open' ? <Stamp tone="accent">Open</Stamp> : <Stamp tone="ok">Paid {formatShortDate(inv.paid_at)}</Stamp>}</div><div className="text-sm pp-sub">{inv.period}</div></div>
              <table className="w-full mt-3 text-sm"><tbody>
                {(inv.invoice_lines || []).map(l => <tr key={l.id} className="border-t" style={{ borderColor: 'var(--line)' }}><td className="py-2">{l.description}</td><td className="py-2 pp-mono text-right pp-sub">{Number(l.qty).toLocaleString()} × {formatMoney(l.rate)}</td><td className="py-2 pp-mono text-right w-24">{formatMoney(l.qty * l.rate)}</td></tr>)}
                <tr className="border-t-2" style={{ borderColor: 'var(--ink)' }}><td className="py-2 font-semibold">Total</td><td></td><td className="py-2 pp-mono text-right font-bold">{formatMoney(total)}</td></tr>
              </tbody></table>
              {inv.status === 'open' && <button onClick={() => inv.stripe_payment_link ? window.open(inv.stripe_payment_link, '_blank') : ping('No Stripe payment link is attached yet.')} className="pp-btn px-4 py-2 text-sm mt-3 flex items-center gap-1.5"><CreditCard size={15} /> Pay {formatMoney(total)}</button>}
            </div>
          )
        })}
      </div>
      <p className="text-xs pp-sub mt-4">Payment links run through Stripe. Paid status is updated by admin for now.</p>
    </div>
  )
}

function Prefs({ client, updatePrefs }) {
  const prefs = client.prefs || {}
  const setPref = (key) => updatePrefs({ ...prefs, [key]: !prefs[key] })
  const Toggle = ({ k, label, desc }) => (
    <div className="flex items-center justify-between p-4 border-t first:border-t-0" style={{ borderColor: 'var(--line)' }}>
      <div><div className="font-medium text-sm">{label}</div><div className="text-xs pp-sub mt-0.5">{desc}</div></div>
      <button onClick={() => setPref(k)} aria-pressed={Boolean(prefs[k])} className="w-11 h-6 rounded-full relative transition-colors" style={{ background: prefs[k] ? 'var(--ok)' : '#CFCDC6' }}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: prefs[k] ? 22 : 2 }} />
      </button>
    </div>
  )
  return (
    <div>
      <SectionTitle>Prep preferences</SectionTitle>
      <div className="pp-card">
        <Toggle k="polybag" label="Polybag by default" desc="Bag every unit unless the SKU says otherwise" />
        <Toggle k="photos" label="Photo every check-in" desc="Carton photos on receipt, unit photos on damage" />
        <Toggle k="expiry" label="Check expiration dates" desc="Flag anything under Amazon's cutoff" />
        <Toggle k="autoApprove" label="Auto-approve shipments under 100 units" desc="Skip approval for small shipments" />
        <Toggle k="emailDigest" label="Daily email digest" desc="One summary email instead of per-event alerts" />
      </div>
      <div className="pp-card p-4 mt-4"><div className="text-xs font-semibold uppercase tracking-wider pp-sub">Account</div><div className="pp-mono text-sm mt-2">{client.name} · {client.account_code}</div><div className="text-sm pp-sub mt-1">Pilot account</div></div>
    </div>
  )
}

function Toast({ message, onDismiss }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white shadow-lg" style={{ background: 'var(--ink)' }}>
      <Check size={15} style={{ color: 'var(--ok)' }} /> {message}
      <button onClick={onDismiss} aria-label="Dismiss"><X size={14} className="opacity-60" /></button>
    </div>
  )
}
