import { useState } from 'react'
import { useApp } from '../context'
import PhaseSheet from '../components/PhaseSheet'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b'
}

const STATUS_COLORS = {
  'Not Started': '#5a7a9a', 'In Progress': '#3b82f6',
  'Complete': '#22c55e', 'On Hold': '#f59e0b'
}

const fmtDate = d => {
  if (!d) return '—'
  try {
    const [year, month, day] = d.split('-')
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

function AddPhaseSheet({ onClose }) {
  const { addPhase } = useApp()
  const [form, setForm] = useState({ name: '', start: '', end: '', status: 'Not Started' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.start || !form.end) return
    setLoading(true)
    await addPhase(form)
    setLoading(false)
    onClose()
  }

  const inp = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: S.card, borderRadius: '20px 20px 0 0', borderTop: `2px solid ${S.accent}`, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>Add phase</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          {inp('Phase name', 'name', 'text', 'e.g. Groundworks')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Start date', 'start', 'date')}
            {inp('End date', 'end', 'date')}
          </div>
          <button onClick={save} disabled={!form.name || !form.start || !form.end || loading}
            style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!form.name || !form.start || !form.end || loading) ? 0.5 : 1 }}>
            {loading ? 'Adding…' : 'Add phase'}
          </button>
        </div>
      </div>
    </>
  )
}

function AddUnavailableSheet({ onClose }) {
  const { addUnavailable, user, profile } = useApp()
  const [form, setForm] = useState({ label: '', start: '', end: '', party: profile?.role === 'client' ? 'client' : 'builder' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isBuilder = profile?.role === 'builder' || profile?.role === 'admin'

  const save = () => {
    if (!form.label || !form.start || !form.end) return
    addUnavailable(form)
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: S.card, borderRadius: '20px 20px 0 0', borderTop: `2px solid ${S.border}`, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>Not available</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description</label>
            <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Builder holiday"
              style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Start</label>
              <input type="date" value={form.start} onChange={e => set('start', e.target.value)}
                style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>End</label>
              <input type="date" value={form.end} onChange={e => set('end', e.target.value)}
                style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          {isBuilder && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Party</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['builder', 'client', 'both'].map(p => (
                  <button key={p} onClick={() => set('party', p)} style={{ flex: 1, padding: 10, borderRadius: 10, border: `2px solid ${form.party === p ? S.accent : S.border}`, background: form.party === p ? S.accent + '22' : S.surface, color: form.party === p ? S.accent : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>{p}</button>
                ))}
              </div>
            </div>
          )}
          <button onClick={save} disabled={!form.label || !form.start || !form.end}
            style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!form.label || !form.start || !form.end) ? 0.5 : 1 }}>
            Add period
          </button>
        </div>
      </div>
    </>
  )
}

export default function TimelineView() {
  const { activeProject, user, profile, deleteUnavailable } = useApp()
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [showAddUnav, setShowAddUnav] = useState(false)
  const isBuilder = profile?.role === 'builder' || profile?.role === 'admin'

  if (!activeProject) return (
    <div style={{ padding: 20, textAlign: 'center', color: S.muted, fontFamily: "'DM Sans','Segoe UI',sans-serif", paddingTop: 60 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 6 }}>No project selected</div>
      <div style={{ fontSize: 13 }}>Go to Projects to select or create a project</div>
    </div>
  )

  const p = activeProject
  const phases = p.phases || []
  const unavailable = p.unavailable || []
  const daysLeft = p.endDate ? Math.ceil((new Date(p.endDate) - new Date()) / 86400000) : null
  const totalPhases = phases.length
  const donePhases = phases.filter(ph => ph.status === 'Complete').length
  const openMilestones = phases.reduce((s, ph) => s + (ph.milestones || []).filter(ms => !ms.resolved).length, 0)

  return (
    <div style={{ paddingBottom: 80, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 4 }}>Timeline</div>
        <div style={{ fontSize: 12, color: S.muted }}>{p.name}</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Phases</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: S.text, fontFamily: 'monospace' }}>{donePhases}/{totalPhases}</div>
          </div>
          <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Days left</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: daysLeft !== null && daysLeft < 30 ? S.red : S.accent, fontFamily: 'monospace' }}>{daysLeft !== null ? (daysLeft > 0 ? daysLeft : 0) : '—'}</div>
          </div>
          <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Decisions</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: openMilestones > 0 ? S.amber : S.green, fontFamily: 'monospace' }}>{openMilestones}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: S.muted }}>Overall progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: S.accent }}>{totalPhases ? Math.round(donePhases / totalPhases * 100) : 0}%</span>
          </div>
          <div style={{ height: 8, background: S.surface, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${totalPhases ? donePhases / totalPhases * 100 : 0}%`, height: '100%', background: S.accent, borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: S.muted }}>{fmtDate(p.startDate)}</span>
            <span style={{ fontSize: 11, color: S.muted }}>{fmtDate(p.endDate)}</span>
          </div>
        </div>

        {/* Actions */}
        {isBuilder && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button onClick={() => setShowAddPhase(true)} style={{ flex: 1, padding: 12, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              + Add phase
            </button>
            <button onClick={() => setShowAddUnav(true)} style={{ flex: 1, padding: 12, background: S.surface, color: S.muted, border: `1px solid ${S.border}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🚫 Not available
            </button>
          </div>
        )}
        {!isBuilder && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowAddUnav(true)} style={{ width: '100%', padding: 12, background: S.surface, color: S.muted, border: `1px solid ${S.border}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🚫 Log unavailability
            </button>
          </div>
        )}

        {/* Phases list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Phases</div>
          {phases.length === 0 && (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>
              No phases yet{isBuilder ? ' — tap + Add phase to get started' : ''}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {phases.map(ph => {
              const color = STATUS_COLORS[ph.status] || S.muted
              const openMs = (ph.milestones || []).filter(ms => !ms.resolved).length
              return (
                <button key={ph.id} onClick={() => setSelectedPhase(ph)}
                  style={{ background: S.card, border: `1px solid ${color}44`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 3 }}>{ph.name}</div>
                    <div style={{ fontSize: 12, color: S.muted }}>{fmtDate(ph.start)} → {fmtDate(ph.end)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, color, background: color + '22' }}>{ph.status}</span>
                    {openMs > 0 && <span style={{ fontSize: 10, color: S.amber }}>🔔 {openMs} open</span>}
                  </div>
                  <span style={{ color: S.muted, fontSize: 18, flexShrink: 0 }}>›</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Unavailability */}
        {unavailable.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Not available periods</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unavailable.map(u => (
                <div key={u.id} style={{ background: S.card, border: `1px solid ${S.red}33`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{u.label}</div>
                    <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{fmtDate(u.start)} → {fmtDate(u.end)} · <span style={{ textTransform: 'capitalize' }}>{u.party}</span></div>
                  </div>
                  {isBuilder && (
                    <button onClick={() => deleteUnavailable(u.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 20, padding: '4px 8px', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPhase && <PhaseSheet phase={selectedPhase} onClose={() => setSelectedPhase(null)} />}
      {showAddPhase && <AddPhaseSheet onClose={() => setShowAddPhase(false)} />}
      {showAddUnav && <AddUnavailableSheet onClose={() => setShowAddUnav(false)} />}
    </div>
  )
}