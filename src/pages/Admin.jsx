import React, { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Plus, RefreshCw, Pencil, Check, X } from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase.js'
import { SectionTitle, LoadingCard, ErrorCard } from '../components/PortalUI.jsx'

const blankInbound = { client_id: '', ref_code: '', carrier: '', tracking: '', source: '', expected_units: '', received_units: '', eta: '', status: 'in_transit' }
const blankOutbound = { client_id: '', ref_code: '', destination: '', units: '', boxes: '', weight_lb: '', est_cost: '', sku_list: '', status: 'awaiting_approval' }
const blankDamage = { client_id: '', ref_code: '', sku: '', units: '', note: '', status: 'open' }
const blankSku = { client_id: '', sku: '', fnsku: '', name: '', prep_spec: 'FNSKU only', on_hand: 0, prepped: 0, shipped_lifetime: 0, damaged: 0 }
const blankActivity = { client_id: '', kind: 'note', message: '' }

const emptyRecords = { skus: [], inbound: [], outbound: [] }

const INBOUND_STATUSES = ['in_transit', 'receiving', 'received']
const OUTBOUND_STATUSES = ['staging', 'awaiting_approval', 'approved', 'shipped']

// Column configs for the editable record tables.
const SKU_COLUMNS = [
  { key: 'name', label: 'Product', type: 'text' },
  { key: 'sku', label: 'SKU', type: 'text', mono: true },
  { key: 'fnsku', label: 'FNSKU', type: 'text', mono: true },
  { key: 'prep_spec', label: 'Prep', type: 'text' },
  { key: 'on_hand', label: 'On hand', type: 'number' },
  { key: 'prepped', label: 'Prepped', type: 'number' },
  { key: 'damaged', label: 'Damaged', type: 'number' },
]

const INBOUND_COLUMNS = [
  { key: 'ref_code', label: 'Ref', type: 'text', mono: true },
  { key: 'carrier', label: 'Carrier', type: 'text' },
  { key: 'tracking', label: 'Tracking', type: 'text', mono: true },
  { key: 'expected_units', label: 'Expected', type: 'number' },
  { key: 'received_units', label: 'Received', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: INBOUND_STATUSES },
  { key: 'eta', label: 'ETA', type: 'date' },
]

const OUTBOUND_COLUMNS = [
  { key: 'ref_code', label: 'Ref', type: 'text', mono: true },
  { key: 'destination', label: 'Destination', type: 'text' },
  { key: 'units', label: 'Units', type: 'number' },
  { key: 'boxes', label: 'Boxes', type: 'number' },
  { key: 'weight_lb', label: 'Weight lb', type: 'number' },
  { key: 'est_cost', label: 'Est cost', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: OUTBOUND_STATUSES },
  { key: 'tracking', label: 'Tracking', type: 'text', mono: true },
]

export default function Admin() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [clients, setClients] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [forms, setForms] = useState({ inbound: blankInbound, outbound: blankOutbound, damage: blankDamage, sku: blankSku, activity: blankActivity })

  // --- read/edit-view state ---
  const [viewClientId, setViewClientId] = useState('')
  const [records, setRecords] = useState(emptyRecords)
  const [recordsLoading, setRecordsLoading] = useState(false)

  useEffect(() => {
    if (!hasSupabaseConfig) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user?.id) loadAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  useEffect(() => {
    if (viewClientId) loadRecords(viewClientId)
    else setRecords(emptyRecords)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewClientId])

  async function login(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) setError(loginError.message)
    setBusy(false)
  }

  async function loadAdmin() {
    setLoading(true); setError('')
    try {
      const { data: me, error: meError } = await supabase.from('clients').select('*').eq('user_id', session.user.id).single()
      if (meError) throw meError
      setProfile(me)
      if (!me.is_admin) return
      const { data: rows, error: clientsError } = await supabase.from('clients').select('id,name,account_code,email,created_at').order('created_at', { ascending: false })
      if (clientsError) throw clientsError
      setClients(rows || [])
      const defaultId = rows?.find(c => c.id !== me.id)?.id || rows?.[0]?.id || ''
      setForms(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, { ...v, client_id: v.client_id || defaultId }])))
      setViewClientId(prev => prev || defaultId)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function loadRecords(clientId) {
    setRecordsLoading(true)
    try {
      const [skus, inbound, outbound] = await Promise.all([
        supabase.from('skus').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('inbound_shipments').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('outbound_shipments').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      ])
      for (const r of [skus, inbound, outbound]) { if (r.error) throw r.error }
      setRecords({ skus: skus.data || [], inbound: inbound.data || [], outbound: outbound.data || [] })
    } catch (err) {
      setError(err.message || String(err))
      setRecords(emptyRecords)
    } finally {
      setRecordsLoading(false)
    }
  }

  async function insert(table, payload, resetKey, resetValue) {
    setBusy(true); setError(''); setNotice('')
    try {
      const cleaned = cleanPayload(payload)
      const { error: insertError } = await supabase.from(table).insert(cleaned)
      if (insertError) throw insertError
      setNotice(`Saved to ${table}.`)
      setForms(prev => ({ ...prev, [resetKey]: { ...resetValue, client_id: payload.client_id } }))
      if (payload.client_id && payload.client_id === viewClientId) loadRecords(viewClientId)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  // ---- inline row update ----
  async function saveRow(table, row, patch) {
    setError(''); setNotice('')

    // Nothing actually changed — skip the write.
    const changed = Object.keys(patch).filter(k => String(patch[k] ?? '') !== String(row[k] ?? ''))
    if (changed.length === 0) return true

    // Auto-stamp received_at when an inbound flips to received.
    if (table === 'inbound_shipments' && patch.status === 'received' && !row.received_at) {
      patch.received_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase.from(table).update(patch).eq('id', row.id)
    if (updateError) { setError(updateError.message); return false }

    // Paper trail for any quantity change on a SKU — this is the count-error guard.
    const qtyKeys = ['on_hand', 'prepped', 'damaged', 'shipped_lifetime']
    const qtyChanges = changed.filter(k => qtyKeys.includes(k))
    if (table === 'skus' && qtyChanges.length > 0) {
      const detail = qtyChanges.map(k => `${k} ${row[k] ?? 0} → ${patch[k]}`).join(', ')
      await supabase.from('activity_log').insert({
        client_id: row.client_id,
        kind: 'note',
        message: `Inventory corrected on ${row.sku}: ${detail}`,
      })
    }

    setNotice('Row updated.')
    await loadRecords(viewClientId)
    return true
  }

  if (!hasSupabaseConfig) return <AdminShell><ErrorCard message="Supabase env vars are not configured. Copy .env.example to .env.local first." /></AdminShell>
  if (loading) return <AdminShell><LoadingCard message="Loading admin…" /></AdminShell>
  if (!session) return <AdminLogin email={email} setEmail={setEmail} password={password} setPassword={setPassword} login={login} busy={busy} error={error} />
  if (profile && !profile.is_admin) return <AdminShell><ErrorCard message="This login is not marked as an admin in the clients table." /></AdminShell>

  const viewedClient = clients.find(c => c.id === viewClientId)

  return (
    <AdminShell onRefresh={() => { loadAdmin(); if (viewClientId) loadRecords(viewClientId) }}>
      {error && <ErrorCard message={error} />}
      {notice && <div className="pp-card p-4 text-sm" style={{ borderColor: 'var(--ok)' }}>{notice}</div>}

      <section className="pp-card p-4">
        <SectionTitle>Clients</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left pp-sub"><th className="py-2">Brand</th><th>Code</th><th>Email</th></tr></thead>
            <tbody>{clients.map(c => <tr key={c.id} className="border-t" style={{ borderColor: 'var(--line)' }}><td className="py-2 font-medium">{c.name}</td><td className="pp-mono">{c.account_code}</td><td>{c.email}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      {/* ---------- EDITABLE CLIENT RECORDS ---------- */}
      <section className="pp-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionTitle>Client records</SectionTitle>
          <div className="flex items-center gap-2">
            <select className="pp-input" value={viewClientId} onChange={e => setViewClientId(e.target.value)}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} · {c.account_code}</option>)}
            </select>
            <button onClick={() => viewClientId && loadRecords(viewClientId)} className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1" disabled={!viewClientId || recordsLoading}>
              {recordsLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
            </button>
          </div>
        </div>

        {!viewClientId && <div className="text-sm pp-sub">Pick a client to see their inbound, inventory, and outbound.</div>}

        {viewClientId && (
          <div className="space-y-5">
            <RecordBlock title={`Inventory${viewedClient ? ` · ${viewedClient.account_code}` : ''}`} count={records.skus.length} loading={recordsLoading} empty="No SKUs logged yet.">
              <EditableTable columns={SKU_COLUMNS} rows={records.skus} onSave={(row, patch) => saveRow('skus', row, patch)} />
              <div className="text-xs pp-sub mt-2">Total on hand: <span className="pp-mono">{records.skus.reduce((n, s) => n + Number(s.on_hand || 0), 0)}</span> across {records.skus.length} SKUs</div>
            </RecordBlock>

            <RecordBlock title="Inbound" count={records.inbound.length} loading={recordsLoading} empty="No inbound shipments logged yet.">
              <EditableTable
                columns={INBOUND_COLUMNS}
                rows={records.inbound}
                onSave={(row, patch) => saveRow('inbound_shipments', row, patch)}
                flagRow={r => r.received_units != null && r.expected_units != null && Number(r.received_units) !== Number(r.expected_units)}
                flagLabel="count mismatch"
              />
            </RecordBlock>

            <RecordBlock title="Outbound" count={records.outbound.length} loading={recordsLoading} empty="No outbound shipments staged yet.">
              <EditableTable columns={OUTBOUND_COLUMNS} rows={records.outbound} onSave={(row, patch) => saveRow('outbound_shipments', row, patch)} />
            </RecordBlock>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <FormCard title="Add SKU" onSubmit={() => insert('skus', normalizeSku(forms.sku), 'sku', blankSku)} busy={busy}>
          <ClientSelect value={forms.sku.client_id} clients={clients} onChange={v => update('sku', 'client_id', v)} />
          <Input label="SKU" value={forms.sku.sku} onChange={v => update('sku', 'sku', v)} />
          <Input label="FNSKU" value={forms.sku.fnsku} onChange={v => update('sku', 'fnsku', v)} />
          <Input label="Product name" value={forms.sku.name} onChange={v => update('sku', 'name', v)} />
          <Input label="Prep spec" value={forms.sku.prep_spec} onChange={v => update('sku', 'prep_spec', v)} />
          <Input label="On hand" type="number" value={forms.sku.on_hand} onChange={v => update('sku', 'on_hand', v)} />
        </FormCard>

        <FormCard title="Log inbound" onSubmit={() => insert('inbound_shipments', normalizeInbound(forms.inbound), 'inbound', blankInbound)} busy={busy}>
          <ClientSelect value={forms.inbound.client_id} clients={clients} onChange={v => update('inbound', 'client_id', v)} />
          <Input label="Ref code" value={forms.inbound.ref_code} placeholder="IN-0001" onChange={v => update('inbound', 'ref_code', v)} />
          <Input label="Carrier" value={forms.inbound.carrier} onChange={v => update('inbound', 'carrier', v)} />
          <Input label="Tracking" value={forms.inbound.tracking} onChange={v => update('inbound', 'tracking', v)} />
          <Input label="Source" value={forms.inbound.source} onChange={v => update('inbound', 'source', v)} />
          <Input label="Expected units" type="number" value={forms.inbound.expected_units} onChange={v => update('inbound', 'expected_units', v)} />
          <Input label="Received units (count twice)" type="number" value={forms.inbound.received_units} onChange={v => update('inbound', 'received_units', v)} />
          <CountCheck expected={forms.inbound.expected_units} received={forms.inbound.received_units} />
          <label className="block text-sm">
            <span className="font-semibold">Status</span>
            <select className="pp-input mt-1" value={forms.inbound.status} onChange={e => update('inbound', 'status', e.target.value)}>
              {INBOUND_STATUSES.map(s => <option key={s} value={s}>{labelize(s)}</option>)}
            </select>
          </label>
          <Input label="ETA" type="date" value={forms.inbound.eta} onChange={v => update('inbound', 'eta', v)} />
        </FormCard>

        <FormCard title="Stage outbound" onSubmit={() => insert('outbound_shipments', normalizeOutbound(forms.outbound), 'outbound', blankOutbound)} busy={busy}>
          <ClientSelect value={forms.outbound.client_id} clients={clients} onChange={v => update('outbound', 'client_id', v)} />
          <Input label="Ref code" value={forms.outbound.ref_code} placeholder="OUT-0001" onChange={v => update('outbound', 'ref_code', v)} />
          <Input label="Destination" value={forms.outbound.destination} placeholder="Amazon FBA — ABE8" onChange={v => update('outbound', 'destination', v)} />
          <Input label="Units" type="number" value={forms.outbound.units} onChange={v => update('outbound', 'units', v)} />
          <Input label="Boxes" type="number" value={forms.outbound.boxes} onChange={v => update('outbound', 'boxes', v)} />
          <Input label="Weight lb" type="number" value={forms.outbound.weight_lb} onChange={v => update('outbound', 'weight_lb', v)} />
          <Input label="Estimated cost" type="number" value={forms.outbound.est_cost} onChange={v => update('outbound', 'est_cost', v)} />
          <Input label="SKU list comma-separated" value={forms.outbound.sku_list} onChange={v => update('outbound', 'sku_list', v)} />
        </FormCard>

        <FormCard title="Open damage report" onSubmit={() => insert('damage_reports', normalizeDamage(forms.damage), 'damage', blankDamage)} busy={busy}>
          <ClientSelect value={forms.damage.client_id} clients={clients} onChange={v => update('damage', 'client_id', v)} />
          <Input label="Ref code" value={forms.damage.ref_code} placeholder="DMG-0001" onChange={v => update('damage', 'ref_code', v)} />
          <Input label="SKU" value={forms.damage.sku} onChange={v => update('damage', 'sku', v)} />
          <Input label="Units" type="number" value={forms.damage.units} onChange={v => update('damage', 'units', v)} />
          <TextArea label="Note" value={forms.damage.note} onChange={v => update('damage', 'note', v)} />
        </FormCard>
      </div>

      <FormCard title="Add activity note" onSubmit={() => insert('activity_log', forms.activity, 'activity', blankActivity)} busy={busy}>
        <ClientSelect value={forms.activity.client_id} clients={clients} onChange={v => update('activity', 'client_id', v)} />
        <select className="pp-input" value={forms.activity.kind} onChange={e => update('activity', 'kind', e.target.value)}>
          <option value="note">Note</option><option value="in">Inbound</option><option value="out">Outbound</option><option value="issue">Issue</option><option value="pay">Payment</option>
        </select>
        <TextArea label="Message" value={forms.activity.message} onChange={v => update('activity', 'message', v)} />
      </FormCard>
    </AdminShell>
  )

  function update(section, key, value) {
    setForms(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
  }
}

/* ============================================================
   EDITABLE TABLE
   Click the pencil on a row to turn it into inputs. Save writes
   only the changed columns back to Supabase.
   ============================================================ */
function EditableTable({ columns, rows, onSave, flagRow, flagLabel }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({})
  const [saving, setSaving] = useState(false)

  function startEdit(row) {
    const next = {}
    for (const col of columns) next[col.key] = row[col.key] ?? ''
    setDraft(next)
    setEditingId(row.id)
  }

  function cancel() {
    setEditingId(null)
    setDraft({})
  }

  async function commit(row) {
    setSaving(true)
    const patch = {}
    for (const col of columns) {
      const raw = draft[col.key]
      patch[col.key] = col.type === 'number'
        ? (raw === '' || raw == null ? null : Number(raw))
        : (raw === '' ? null : raw)
    }
    const ok = await onSave(row, patch)
    setSaving(false)
    if (ok) cancel()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left pp-sub">
            {columns.map(c => <th key={c.key} className="py-2 pr-4 whitespace-nowrap">{c.label}</th>)}
            <th className="py-2 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const editing = editingId === row.id
            const flagged = flagRow ? flagRow(row) : false
            return (
              <tr key={row.id} className="border-t align-middle" style={{ borderColor: 'var(--line)' }}>
                {columns.map(col => (
                  <td key={col.key} className={`py-2 pr-4 whitespace-nowrap ${col.mono && !editing ? 'pp-mono' : ''}`}>
                    {editing
                      ? <CellInput col={col} value={draft[col.key]} onChange={v => setDraft(d => ({ ...d, [col.key]: v }))} />
                      : <CellValue col={col} row={row} flagged={flagged} flagLabel={flagLabel} />}
                  </td>
                ))}
                <td className="py-2">
                  {editing ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => commit(row)} disabled={saving} className="pp-btn pp-btn-accent px-2 py-1 text-xs flex items-center gap-1" title="Save">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button onClick={cancel} disabled={saving} className="pp-btn-ghost px-2 py-1 text-xs" title="Cancel"><X size={13} /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(row)} className="pp-btn-ghost px-2 py-1 text-xs flex items-center gap-1" title="Edit row"><Pencil size={13} /></button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CellValue({ col, row, flagged, flagLabel }) {
  const raw = row[col.key]
  if (col.type === 'select') return <StatusPill value={raw} />

  const isMismatchCell = flagged && (col.key === 'received_units' || col.key === 'expected_units')
  const display = raw === null || raw === undefined || raw === '' ? '—' : String(raw)

  return (
    <span style={isMismatchCell ? { color: 'var(--bad)', fontWeight: 600 } : undefined}>
      {display}
      {flagged && col.key === 'received_units' && flagLabel && (
        <span className="text-xs ml-1.5 pp-sub">({flagLabel})</span>
      )}
    </span>
  )
}

function CellInput({ col, value, onChange }) {
  if (col.type === 'select') {
    return (
      <select className="pp-input py-1 text-sm" value={value || ''} onChange={e => onChange(e.target.value)}>
        {col.options.map(o => <option key={o} value={o}>{labelize(o)}</option>)}
      </select>
    )
  }
  return (
    <input
      className="pp-input py-1 text-sm"
      style={{ minWidth: col.type === 'number' ? 80 : 130 }}
      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
    />
  )
}

function StatusPill({ value }) {
  const tone = {
    received: 'var(--ok)', shipped: 'var(--ok)', approved: 'var(--ok)',
    receiving: 'var(--accent)', awaiting_approval: 'var(--accent)',
    in_transit: 'var(--warn)', staging: 'var(--sub)',
  }[value] || 'var(--sub)'
  return <span className="pp-mono text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: tone, color: tone }}>{labelize(value)}</span>
}

// Live expected-vs-received check on the Log Inbound form.
function CountCheck({ expected, received }) {
  if (expected === '' || received === '' || expected == null || received == null) return null
  const e = Number(expected), r = Number(received)
  if (Number.isNaN(e) || Number.isNaN(r)) return null
  if (e === r) return <div className="text-xs" style={{ color: 'var(--ok)' }}>✓ Counts match.</div>
  const diff = r - e
  return (
    <div className="text-xs" style={{ color: 'var(--bad)' }}>
      Discrepancy: {diff > 0 ? `+${diff} over` : `${Math.abs(diff)} short`}. Recount before saving, then note it in the activity log.
    </div>
  )
}

function labelize(v) {
  return String(v || '').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
}

function RecordBlock({ title, count, loading, empty, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="pp-display text-xl font-bold uppercase">{title}</h3>
        <span className="pp-mono text-xs px-1.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>{count}</span>
      </div>
      {loading ? <div className="text-sm pp-sub">Loading…</div> : count === 0 ? <div className="text-sm pp-sub">{empty}</div> : children}
    </div>
  )
}

function AdminShell({ children, onRefresh }) {
  return (
    <div className="pp-root min-h-screen">
      <header className="border-b-2" style={{ borderColor: 'var(--ink)', background: 'var(--card)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div><a href="/" className="text-xs pp-sub font-semibold uppercase tracking-widest hover:underline flex items-center gap-1"><ArrowLeft size={14}/> Back to site</a><h1 className="pp-display text-4xl font-bold uppercase">Admin Console</h1></div>
          {onRefresh && <button onClick={onRefresh} className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1"><RefreshCw size={14}/> Refresh</button>}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">{children}</main>
    </div>
  )
}

function AdminLogin({ email, setEmail, password, setPassword, login, busy, error }) {
  return (
    <AdminShell>
      <form onSubmit={login} className="pp-card p-6 max-w-md mx-auto space-y-3">
        <h2 className="pp-display text-3xl font-bold uppercase">Admin login</h2>
        {error && <ErrorCard message={error} />}
        <input className="pp-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="pp-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="pp-btn pp-btn-accent w-full py-3 flex items-center justify-center gap-2" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Log in</button>
      </form>
    </AdminShell>
  )
}

function FormCard({ title, children, onSubmit, busy }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="pp-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3"><h2 className="pp-display text-2xl font-bold uppercase">{title}</h2><button className="pp-btn pp-btn-accent px-3 py-2 text-sm flex items-center gap-1" disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Save</button></div>
      {children}
    </form>
  )
}

function ClientSelect({ value, clients, onChange }) {
  return <select className="pp-input" value={value} onChange={e => onChange(e.target.value)} required><option value="">Select client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name} · {c.account_code}</option>)}</select>
}
function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="block text-sm"><span className="font-semibold">{label}</span><input className="pp-input mt-1" type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>
}
function TextArea({ label, value, onChange }) {
  return <label className="block text-sm"><span className="font-semibold">{label}</span><textarea className="pp-input mt-1 min-h-24" value={value} onChange={e => onChange(e.target.value)} /></label>
}

function cleanPayload(payload) {
  const out = {}
  for (const [k, v] of Object.entries(payload)) {
    if (v === '') continue
    out[k] = v
  }
  return out
}
function normalizeSku(v) { return { ...v, on_hand: Number(v.on_hand || 0), prepped: Number(v.prepped || 0), shipped_lifetime: Number(v.shipped_lifetime || 0), damaged: Number(v.damaged || 0) } }
function normalizeInbound(v) {
  const out = { ...v, expected_units: numOrNull(v.expected_units), received_units: numOrNull(v.received_units) }
  if (out.status === 'received' && out.received_units != null) out.received_at = new Date().toISOString()
  return out
}
function normalizeOutbound(v) { return { ...v, units: numOrNull(v.units), boxes: numOrNull(v.boxes), weight_lb: numOrNull(v.weight_lb), est_cost: numOrNull(v.est_cost), sku_list: String(v.sku_list || '').split(',').map(s => s.trim()).filter(Boolean) } }
function normalizeDamage(v) { return { ...v, units: numOrNull(v.units), photo_urls: [] } }
function numOrNull(v) { return v === '' || v == null ? null : Number(v) }