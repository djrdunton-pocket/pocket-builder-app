import { useState, useEffect } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b'
}

const STATUSES = ['Not Started', 'In Progress', 'Complete', 'On Hold']
const STATUS_COLORS = {
  'Not Started': S.muted, 'In Progress': S.blue,
  'Complete': S.green, 'On Hold': S.amber
}

const Inp = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }} />
  </div>
)

export default function PhaseSheet({ phase, onClose }) {
  const { updatePhase, deletePhase, addMilestone, replyMilestone, resolveMilestone, user, activeProject } = useApp()
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'

  const [form, setForm] = useState({ name: '', start: '', end: '', status: 'Not Started' })
  const [tab, setTab] = useState('details')
  const [newMilestone, setNewMilestone] = useState('')
  const [replies, setReplies] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (phase) setForm({ name: phase.name, start: phase.start, end: phase.end, status: phase.status })
  }, [phase])

  if (!phase) return null

  const livePhase = activeProject.phases.find(p => p.id === phase.id) || phase
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => {
    updatePhase(phase.id, form)
    onClose()
  }

  const handleDelete = () => {
    if (confirmDelete) { deletePhase(phase.id); onClose() }
    else setConfirmDelete(true)
  }

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return
    addMilestone(phase.id, newMilestone.trim())
    setNewMilestone('')
  }

  const handleReply = (msId) => {
    if (!replies[msId]?.trim()) return
    replyMilestone(phase.id, msId, replies[msId].trim())
    setReplies(r => ({ ...r, [msId]: '' }))
  }

  const statusColor = STATUS_COLORS[form.status] || S.muted

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: S.card, borderRadius: '20px 20px 0 0',
        borderTop: `2px solid ${S.accent}`,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>{form.name || 'Phase'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '10px 20px 0', gap: 6, borderBottom: `1px solid ${S.border}` }}>
          {['details', 'milestones'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer', textTransform: 'capitalize',
              background: tab === t ? S.surface : 'transparent',
              color: tab === t ? S.accent : S.muted,
              borderBottom: tab === t ? `2px solid ${S.accent}` : '2px solid transparent',
            }}>{t}</button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {tab === 'details' && (
            <div>
              <Inp label="Phase name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Groundworks" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Inp label="Start date" value={form.start} onChange={v => set('start', v)} type="date" />
                <Inp label="End date"   value={form.end}   onChange={v => set('end', v)}   type="date" />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {STATUSES.map(s => {
                    const active = form.status === s
                    const color = STATUS_COLORS[s]
                    return (
                      <button key={s} onClick={() => set('status', s)} style={{
                        padding: '10px', borderRadius: 10, border: `2px solid ${active ? color : S.border}`,
                        background: active ? color + '22' : S.surface, color: active ? color : S.muted,
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}>{s}</button>
                    )
                  })}
                </div>
              </div>

              {isBuilder && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={save} style={{ flex: 1, padding: '14px', background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                    Save changes
                  </button>
                  <button onClick={handleDelete} style={{ padding: '14px 16px', background: confirmDelete ? S.red : S.surface, color: confirmDelete ? '#fff' : S.red, border: `1px solid ${S.red}44`, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {confirmDelete ? 'Confirm delete' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'milestones' && (
            <div>
              {isBuilder && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)}
                    placeholder="e.g. Kitchen tile choice needed"
                    onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                    style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 14, outline: 'none' }} />
                  <button onClick={handleAddMilestone} style={{ padding: '12px 16px', background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Add</button>
                </div>
              )}

              {livePhase.milestones.length === 0 && (
                <div style={{ textAlign: 'center', color: S.muted, fontSize: 14, padding: '24px 0' }}>No milestones yet</div>
              )}

              {livePhase.milestones.map(ms => (
                <div key={ms.id} style={{ background: S.surface, borderRadius: 12, padding: 14, marginBottom: 10, border: `1px solid ${ms.resolved ? S.green : S.accent}44` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                      <span style={{ fontSize: 16 }}>{ms.resolved ? '✅' : '🔔'}</span>
                      <span style={{ fontSize: 14, color: S.text, fontWeight: 600, lineHeight: 1.4 }}>{ms.text}</span>
                    </div>
                    {isBuilder && !ms.resolved && (
                      <button onClick={() => resolveMilestone(phase.id, ms.id)}
                        style={{ flexShrink: 0, marginLeft: 8, padding: '5px 10px', background: S.green + '22', color: S.green, border: `1px solid ${S.green}44`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Resolve
                      </button>
                    )}
                  </div>

                  {ms.replies.map((r, i) => (
                    <div key={i} style={{ background: S.card, borderRadius: 8, padding: '8px 10px', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: S.accent, fontWeight: 700 }}>{r.by}: </span>
                      <span style={{ color: S.muted }}>{r.text}</span>
                    </div>
                  ))}

                  {!ms.resolved && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input value={replies[ms.id] || ''} onChange={e => setReplies(r => ({ ...r, [ms.id]: e.target.value }))}
                        placeholder="Reply…"
                        onKeyDown={e => e.key === 'Enter' && handleReply(ms.id)}
                        style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontSize: 13, outline: 'none' }} />
                      <button onClick={() => handleReply(ms.id)} style={{ padding: '9px 14px', background: S.accent, color: S.bg, border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>↑</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}