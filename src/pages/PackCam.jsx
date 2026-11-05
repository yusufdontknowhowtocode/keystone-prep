import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Loader2, Trash2, ArrowLeft, Plus, Check } from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase.js'

// Pack camera: shoot one photo per packed box. Each photo auto-attaches to the
// next order in today's queue (in pack order). Tap an order to make it the target,
// or reassign any photo from its dropdown. Photos land in the private 'order-photos'
// bucket and show up in that client's portal under Orders.

const BUCKET = 'order-photos'
const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local

async function shrink(file, max = 1600, quality = 0.78) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise(res => c.toBlob(b => res(b || file), 'image/jpeg', quality))
  } catch { return file }
}

export default function PackCam() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState(() => { try { return localStorage.getItem('packcam.client') || '' } catch { return '' } })
  const [date, setDate] = useState(today())
  const [orders, setOrders] = useState([])      // fulfilled_orders for date
  const [extra, setExtra] = useState([])        // order #s typed in by hand
  const [photos, setPhotos] = useState([])      // order_photos rows (+ url)
  const [target, setTarget] = useState(null)    // manual target order_no
  const [busy, setBusy] = useState(0)
  const [err, setErr] = useState('')
  const [newNo, setNewNo] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (!hasSupabaseConfig) { setReady(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
  }, [])

  useEffect(() => {
    if (!session) return
    ;(async () => {
      const { data: me } = await supabase.from('clients').select('is_admin').eq('user_id', session.user.id).single()
      setIsAdmin(Boolean(me?.is_admin))
      if (!me?.is_admin) return
      const { data } = await supabase.from('clients').select('id,name,account_code,is_admin').eq('is_admin', false).order('name')
      setClients(data || [])
      if (!clientId) setClientId((data || []).find(c => c.account_code === 'BRIC-0001')?.id || data?.[0]?.id || '')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => { if (clientId && isAdmin) { try { localStorage.setItem('packcam.client', clientId) } catch {} ; load() } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, date, isAdmin])

  async function load() {
    setErr('')
    const start = new Date(date + 'T00:00:00'), end = new Date(start); end.setDate(end.getDate() + 1)
    const [o, p] = await Promise.all([
      supabase.from('fulfilled_orders').select('order_no,items,box,scale_weight').eq('client_id', clientId).eq('packed_on', date).order('created_at'),
      supabase.from('order_photos').select('*').eq('client_id', clientId).gte('taken_at', start.toISOString()).lt('taken_at', end.toISOString()).order('taken_at'),
    ])
    if (o.error || p.error) { setErr((o.error || p.error).message); return }
    setOrders(o.data || [])
    const rows = p.data || []
    if (rows.length) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(rows.map(r => r.path), 3600)
      const map = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]))
      setPhotos(rows.map(r => ({ ...r, url: map[r.path] })))
    } else setPhotos([])
  }

  const queue = useMemo(() => {
    const nums = [...orders.map(o => o.order_no), ...extra]
    for (const p of photos) if (p.order_no && !nums.includes(p.order_no)) nums.push(p.order_no)
    return [...new Set(nums)]
  }, [orders, extra, photos])

  const byOrder = useMemo(() => {
    const m = {}
    for (const p of photos) (m[p.order_no || '_'] ||= []).push(p)
    return m
  }, [photos])

  const nextOrder = target && queue.includes(target) ? target : queue.find(n => !byOrder[n]?.length) || null

  async function onFiles(e) {
    const files = Array.from(e.target.files || [])
    if (fileRef.current) fileRef.current.value = ''
    if (!files.length) return
    // Assign sequentially: first file to the current target, the rest to the following empty orders.
    let assignQueue = []
    let cursor = nextOrder
    const taken = new Set(Object.keys(byOrder))
    for (let i = 0; i < files.length; i++) {
      assignQueue.push(cursor)
      if (cursor) taken.add(cursor)
      cursor = queue.find(n => !taken.has(n)) || null
    }
    setTarget(null)
    for (let i = 0; i < files.length; i++) await upload(files[i], assignQueue[i])
  }

  async function upload(file, orderNo) {
    setBusy(b => b + 1); setErr('')
    try {
      const blob = await shrink(file)
      const path = `${clientId}/${date}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data: row, error: dbErr } = await supabase.from('order_photos').insert({ client_id: clientId, order_no: orderNo, path }).select().single()
      if (dbErr) throw dbErr
      setPhotos(ps => [...ps, { ...row, url: URL.createObjectURL(blob) }])
    } catch (e) { setErr(e.message || String(e)) }
    finally { setBusy(b => b - 1) }
  }

  async function reassign(photo, orderNo) {
    const val = orderNo || null
    const { error } = await supabase.from('order_photos').update({ order_no: val }).eq('id', photo.id)
    if (error) return setErr(error.message)
    setPhotos(ps => ps.map(p => p.id === photo.id ? { ...p, order_no: val } : p))
  }

  async function remove(photo) {
    if (!window.confirm('Delete this photo?')) return
    await supabase.storage.from(BUCKET).remove([photo.path])
    const { error } = await supabase.from('order_photos').delete().eq('id', photo.id)
    if (error) return setErr(error.message)
    setPhotos(ps => ps.filter(p => p.id !== photo.id))
  }

  function addOrders(e) {
    e.preventDefault()
    const nums = newNo.split(/[\s,]+/).map(s => s.replace(/^#/, '').trim()).filter(Boolean)
    setExtra(x => [...new Set([...x, ...nums])])
    setNewNo('')
  }

  if (!ready) return <Shell><p className="pp-sub">Loading…</p></Shell>
  if (!session || !isAdmin) return <Shell><p className="text-sm">Sign in on <a className="underline" href="/admin">/admin</a> first, then come back here.</p></Shell>

  const done = queue.filter(n => byOrder[n]?.length).length
  const unassigned = byOrder._ || []

  return (
    <Shell>
      <div className="flex gap-2 flex-wrap items-center">
        <select value={clientId} onChange={e => { setClientId(e.target.value); setExtra([]) }} className="pp-input px-3 py-2 text-sm flex-1 min-w-0">
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="pp-input px-3 py-2 text-sm" />
      </div>

      <form onSubmit={addOrders} className="flex gap-2">
        <input value={newNo} onChange={e => setNewNo(e.target.value)} inputMode="numeric" placeholder="add order #s (e.g. 2997 2998)" className="pp-input px-3 py-2 text-sm flex-1 min-w-0" />
        <button className="pp-btn-ghost px-3 py-2 text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
      </form>

      {err && <div className="text-sm" style={{ color: 'var(--accent)' }}>{err}</div>}

      <div className="text-xs pp-sub">{done}/{queue.length} orders photographed{busy > 0 && <> · uploading {busy}…</>}</div>

      <ul className="space-y-2 pb-32">
        {queue.length === 0 && <li className="pp-card p-4 text-sm pp-sub">No orders for this day yet. Add order #s above, or just shoot — photos go to “Unassigned” and you can assign them after.</li>}
        {queue.map(n => {
          const ps = byOrder[n] || []
          const o = orders.find(x => x.order_no === n)
          const isNext = n === nextOrder
          return (
            <li key={n} onClick={() => setTarget(n)} className="pp-card p-3 flex gap-3 items-center cursor-pointer"
              style={isNext ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 2px var(--accent)' } : {}}>
              <div className="w-20 shrink-0">
                <div className="pp-mono font-bold">#{n}</div>
                <div className="text-[11px] mt-0.5" style={{ color: ps.length ? 'var(--ok)' : isNext ? 'var(--accent)' : 'var(--sub)' }}>
                  {ps.length ? <span className="inline-flex items-center gap-0.5"><Check size={11} /> done</span> : isNext ? 'next' : 'waiting'}
                </div>
              </div>
              <div className="text-xs pp-sub flex-1 min-w-0 truncate">{o ? `${o.box || ''} · ${o.scale_weight || ''}` : 'not logged yet'}</div>
              <div className="flex gap-1.5">
                {ps.map(p => <Thumb key={p.id} p={p} queue={queue} onMove={reassign} onDelete={remove} />)}
              </div>
            </li>
          )
        })}
      </ul>

      {unassigned.length > 0 && (
        <section>
          <div className="text-xs font-semibold uppercase tracking-wider pp-sub mb-2">Unassigned</div>
          <div className="flex gap-2 flex-wrap pb-32">
            {unassigned.map(p => <Thumb key={p.id} p={p} queue={queue} onMove={reassign} onDelete={remove} big />)}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 inset-x-0 p-4 flex justify-center" style={{ background: 'linear-gradient(transparent, var(--paper) 40%)' }}>
        <label className="pp-btn-accent px-8 py-4 text-lg rounded-full flex items-center gap-2 cursor-pointer shadow-lg">
          {busy > 0 ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
          {nextOrder ? `Snap #${nextOrder}` : 'Snap (unassigned)'}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onFiles} className="hidden" />
        </label>
      </div>
    </Shell>
  )
}

function Thumb({ p, queue, onMove, onDelete, big }) {
  const size = big ? 'w-24 h-24' : 'w-14 h-14'
  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <a href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="" className={`${size} object-cover rounded`} /></a>
      <select value={p.order_no || ''} onChange={e => onMove(p, e.target.value)} className="absolute bottom-0 inset-x-0 text-[10px] bg-black/70 text-white" aria-label="Move photo to order">
        <option value="">unassigned</option>
        {queue.map(n => <option key={n} value={n}>#{n}</option>)}
      </select>
      <button onClick={() => onDelete(p)} className="absolute -top-1.5 -right-1.5 bg-black/80 text-white rounded-full p-0.5" aria-label="Delete photo"><Trash2 size={11} /></button>
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="pp-root admin-dark min-h-screen">
      <header className="border-b px-4 py-3 flex items-center gap-3" style={{ borderColor: 'var(--line)', background: 'var(--card)' }}>
        <a href="/admin" className="pp-sub" aria-label="Back to admin"><ArrowLeft size={18} /></a>
        <h1 className="pp-display text-xl font-bold uppercase">Pack camera</h1>
      </header>
      <main className="max-w-xl mx-auto px-4 py-4 space-y-3">{children}</main>
    </div>
  )
}
