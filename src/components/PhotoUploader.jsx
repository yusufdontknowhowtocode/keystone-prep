import React, { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

/**
 * Upload check-in photos against a record and persist the public URLs.
 *
 * table    — 'inbound_shipments' or 'damage_reports'
 * row      — the record (needs id, client_id, photo_urls)
 * onSaved  — called after a successful upload/delete so the parent can refresh
 */
export default function PhotoUploader({ table, row, onSaved }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const photos = row.photo_urls || []

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setBusy(true); setError('')
    const uploaded = []

    try {
      for (const file of files) {
        const clean = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${row.client_id}/${row.id}/${Date.now()}-${clean}`

        const { error: upErr } = await supabase.storage
          .from('checkin-photos')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw upErr

        const { data } = supabase.storage.from('checkin-photos').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }

      const next = [...photos, ...uploaded]
      const { error: dbErr } = await supabase.from(table).update({ photo_urls: next }).eq('id', row.id)
      if (dbErr) throw dbErr

      if (onSaved) await onSaved()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function removePhoto(url) {
    setBusy(true); setError('')
    try {
      // Storage path is everything after the bucket name in the public URL.
      const marker = '/checkin-photos/'
      const idx = url.indexOf(marker)
      if (idx !== -1) {
        const path = decodeURIComponent(url.slice(idx + marker.length))
        await supabase.storage.from('checkin-photos').remove([path])
      }
      const next = photos.filter(p => p !== url)
      const { error: dbErr } = await supabase.from(table).update({ photo_urls: next }).eq('id', row.id)
      if (dbErr) throw dbErr
      if (onSaved) await onSaved()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {photos.map(url => (
        <div key={url} className="relative">
          <a href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt="Check-in photo"
              className="rounded object-cover border"
              style={{ width: 44, height: 44, borderColor: 'var(--line)' }}
            />
          </a>
          <button
            type="button"
            onClick={() => removePhoto(url)}
            disabled={busy}
            title="Remove photo"
            className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center"
            style={{ width: 16, height: 16, background: 'var(--bad)', color: '#fff', lineHeight: 0 }}
          >
            <X size={10} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="pp-btn-ghost px-2 py-1 text-xs flex items-center gap-1"
        title="Add check-in photos"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
        {photos.length === 0 ? 'Add photos' : 'Add'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />

      {error && <span className="text-xs" style={{ color: 'var(--bad)' }}>{error}</span>}
    </div>
  )
}