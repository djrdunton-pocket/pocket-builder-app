import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b'
}

function MessengerThread({ thread }) {
  const { activeProject, user, sendMessage } = useApp()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const isAdmin = user?.role === 'admin'
  const messages = activeProject.messages[thread] || []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const go = () => {
    if (!text.trim()) return
    sendMessage(thread, text.trim())
    setText('')
  }

  const isMe = (msg) => {
    if (user?.role === 'builder' || user?.role === 'admin') return msg.from === 'builder'
    if (user?.role === 'client') return msg.from === 'client'
    if (user?.role === 'supplier') return msg.from === 'supplier'
    return false
  }

  const fmtTime = ts => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = ts => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 300 }}>
      {isAdmin && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: '8px 14px', marginBottom: 8, fontSize: 12, color: S.muted }}>
          👁 Admin view — read only
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0', WebkitOverflowScrolling: 'touch' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, fontSize: 14 }}>
            No messages yet — start the conversation
          </div>
        )}
        {messages.map(msg => {
          const mine = isMe(msg)
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: msg.from === 'client' ? S.blue + '33' : msg.from === 'supplier' ? S.amber + '33' : S.accent + '33', border: `2px solid ${msg.from === 'client' ? S.blue : msg.from === 'supplier' ? S.amber : S.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: msg.from === 'client' ? S.blue : msg.from === 'supplier' ? S.amber : S.accent, flexShrink: 0 }}>
                {msg.fromName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', gap: 3 }}>
                <div style={{ fontSize: 10, color: S.muted }}>{mine ? 'You' : msg.fromName} · {fmtDate(msg.ts)} {fmtTime(msg.ts)}</div>
                <div style={{ background: mine ? S.accent : S.card, color: mine ? S.bg : S.text, border: `1px solid ${mine ? S.accent : S.border}`, borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {!isAdmin && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 10 }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go() } }}
            placeholder="Message…" rows={2}
            style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: '10px 14px', color: S.text, fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }} />
          <button onClick={go} disabled={!text.trim()}
            style={{ width: 44, height: 44, borderRadius: '50%', background: text.trim() ? S.accent : S.surface, color: text.trim() ? S.bg : S.muted, border: 'none', cursor: text.trim() ? 'pointer' : 'default', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ↑
          </button>
        </div>
      )}
    </div>
  )
}

function PhotosTab() {
  const { activeProject, user, addPhoto, deletePhoto } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ caption: '', visibleTo: [] })
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'

  const myPhotos = activeProject.photos.filter(ph => {
    if (isBuilder) return true
    if (user?.role === 'client') return ph.visibleTo.includes('client')
    if (user?.role === 'supplier') return ph.visibleTo.includes('supplier')
    return false
  })

  const toggleVisibility = (v) => {
    setForm(f => ({
      ...f,
      visibleTo: f.visibleTo.includes(v)
        ? f.visibleTo.filter(x => x !== v)
        : [...f.visibleTo, v]
    }))
  }

  const save = () => {
    if (!form.caption) return
    addPhoto({ caption: form.caption, visibleTo: form.visibleTo, url: null })
    setForm({ caption: '', visibleTo: [] })
    setShowAdd(false)
  }

  return (
    <div>
      {isBuilder && (
        <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>
          📸 Add photo
        </button>
      )}

      {myPhotos.length === 0 && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>
          No photos yet
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {myPhotos.map(ph => (
          <div key={ph.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 120, background: S.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
              📸
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.text, marginBottom: 4, lineHeight: 1.3 }}>{ph.caption}</div>
              <div style={{ fontSize: 10, color: S.muted, marginBottom: 6 }}>{ph.date}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {ph.visibleTo.map(v => (
                  <span key={v} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: v === 'client' ? S.blue + '22' : S.amber + '22', color: v === 'client' ? S.blue : S.amber }}>{v}</span>
                ))}
              </div>
              {(isBuilder || ph.uploadedBy === user?.id) && (
                <button onClick={() => deletePhoto(ph.id)} style={{ marginTop: 6, background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 11, padding: 0, fontWeight: 600 }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: S.card, borderRadius: '20px 20px 0 0', borderTop: `2px solid ${S.accent}`, padding: '12px 20px 32px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>Add photo</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ background: S.surface, border: `2px dashed ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, color: S.muted }}>Photo upload will work once Supabase Storage is connected</div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Caption</label>
              <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="e.g. Foundation trenches dug"
                style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Visible to</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['client', 'supplier'].map(v => (
                  <button key={v} onClick={() => toggleVisibility(v)} style={{ flex: 1, padding: 10, borderRadius: 10, border: `2px solid ${form.visibleTo.includes(v) ? (v === 'client' ? S.blue : S.amber) : S.border}`, background: form.visibleTo.includes(v) ? (v === 'client' ? S.blue : S.amber) + '22' : S.surface, color: form.visibleTo.includes(v) ? (v === 'client' ? S.blue : S.amber) : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {v === 'client' ? '👤 Client' : '🏭 Supplier'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={!form.caption}
              style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: form.caption ? 1 : 0.5 }}>
              Add photo
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function DocsTab() {
  const { activeProject, user, addDocument, deleteDocument } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', visibleTo: ['client', 'supplier'] })
  const fileRef = useRef(null)
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'

  const myDocs = activeProject.documents.filter(d => {
    if (isBuilder) return true
    if (user?.role === 'client') return d.visibleTo.includes('client')
    if (user?.role === 'supplier') return d.visibleTo.includes('supplier')
    return false
  })

  const toggleVisibility = (v) => {
    setForm(f => ({
      ...f,
      visibleTo: f.visibleTo.includes(v)
        ? f.visibleTo.filter(x => x !== v)
        : [...f.visibleTo, v]
    }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    addDocument({
      name: file.name,
      uploadedBy: user?.id,
      uploaderName: user?.name,
      uploaderRole: user?.role,
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      visibleTo: form.visibleTo,
    })
    e.target.value = ''
  }

  return (
    <div>
      <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} />
      <button onClick={() => fileRef.current.click()} style={{ width: '100%', padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>
        📁 Upload document
      </button>

      {myDocs.length === 0 && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>
          No documents yet
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {myDocs.map(doc => (
          <div key={doc.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>📄</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{doc.uploaderName} · {doc.date} · {doc.size}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {doc.visibleTo?.map(v => (
                  <span key={v} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: v === 'client' ? S.blue + '22' : S.amber + '22', color: v === 'client' ? S.blue : S.amber }}>{v}</span>
                ))}
              </div>
            </div>
            {(user?.id === doc.uploadedBy || isBuilder) && (
              <button onClick={() => deleteDocument(doc.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 20, padding: '4px 8px', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CommsView() {
  const { user, activeProject, unreadClient, unreadSupplier } = useApp()
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'
  const isSupplier = user?.role === 'supplier'
  const isClient = user?.role === 'client'

  const defaultTab = isSupplier ? 'supplier' : 'client'
  const [tab, setTab] = useState(defaultTab)

  const TABS = [
    ...(isClient ? [{ id: 'client', label: 'Messages', badge: unreadClient }] : []),
    ...(isSupplier ? [{ id: 'supplier', label: 'Messages', badge: unreadSupplier }] : []),
    ...(isBuilder ? [
      { id: 'client',   label: 'Client',   badge: unreadClient },
      { id: 'supplier', label: 'Supplier',  badge: unreadSupplier },
    ] : []),
    { id: 'photos', label: 'Photos' },
    { id: 'docs',   label: 'Documents' },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 4 }}>Comms</div>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>{activeProject.name}</div>
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t.id ? S.card : 'transparent', color: tab === t.id ? S.accent : S.muted, borderBottom: tab === t.id ? `2px solid ${S.accent}` : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 5 }}>
              {t.label}
              {t.badge > 0 && <span style={{ background: S.red, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {(tab === 'client' || tab === 'supplier') && <MessengerThread thread={tab} />}
        {tab === 'photos' && <PhotosTab />}
        {tab === 'docs' && <DocsTab />}
      </div>
    </div>
  )
}