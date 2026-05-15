import { useState, useEffect } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa'
}

const fmt = n => '£' + Number(n || 0).toLocaleString('en-GB')

const fmtDate = d => {
  if (!d) return '—'
  try {
    const [year, month, day] = d.split('-')
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

function StatCard({ label, value, color = S.accent, sub }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px', flex: 1 }}>
      <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function AddProjectSheet({ onClose, onCreated }) {
  const { addProject } = useApp()
  const [form, setForm] = useState({ name: '', address: '', startDate: '', endDate: '', budget: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inp = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  const save = async () => {
    if (!form.name) return
    setLoading(true)
    await addProject(form)
    setLoading(false)
    onClose()
    if (onCreated) onCreated()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: S.card, borderRadius: '20px 20px 0 0', borderTop: `2px solid ${S.accent}`, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>New project</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          {inp('Project name', 'name', 'text', 'e.g. 4 Bed Detached New Build')}
          {inp('Site address', 'address', 'text', 'e.g. 12 Maple Drive, Guildford')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Start date', 'startDate', 'date')}
            {inp('End date', 'endDate', 'date')}
          </div>
          {inp('Agreed budget (£)', 'budget', 'number', '85000')}
          <button onClick={save} disabled={!form.name || loading}
            style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: form.name && !loading ? 1 : 0.5 }}>
            {loading ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </div>
    </>
  )
}

function ProjectList({ onSelect }) {
  const { projects, activeProjectId, setActiveProjectId, profile } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const isBuilder = profile?.role === 'builder' || profile?.role === 'admin'

  const active   = projects.filter(p => p.status === 'active')
  const archived = projects.filter(p => p.status === 'archived')

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
              <rect width="52" height="52" rx="12" fill="#00c9a7" fillOpacity="0.15"/>
              <path d="M26 10L8 24H13V42H39V24H44L26 10Z" stroke="#00c9a7" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
              <rect x="20" y="27" width="12" height="10" rx="2" stroke="#00c9a7" strokeWidth="1.8" fill="none"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: S.text }}>Pocket Builder</div>
              <div style={{ fontSize: 11, color: S.accent }}>My Projects</div>
            </div>
          </div>
          {isBuilder && (
            <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              + New
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: S.text, marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 14, color: S.muted, marginBottom: 28, lineHeight: 1.6 }}>Create your first project to get started</div>
            {isBuilder && (
              <button onClick={() => setShowAdd(true)} style={{ padding: '14px 28px', background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                + Create first project
              </button>
            )}
          </div>
        )}

        {active.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Active projects</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map(proj => {
                const daysLeft = proj.endDate ? Math.ceil((new Date(proj.endDate) - new Date()) / 86400000) : null
                const phases   = proj.phases || []
                const done     = phases.filter(ph => ph.status === 'Complete').length
                return (
                  <button key={proj.id} onClick={() => { setActiveProjectId(proj.id); onSelect() }}
                    style={{ background: activeProjectId === proj.id ? S.accent + '18' : S.card, border: `2px solid ${activeProjectId === proj.id ? S.accent : S.border}`, borderRadius: 14, padding: '16px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: S.text, marginBottom: 3 }}>{proj.name}</div>
                        <div style={{ fontSize: 12, color: S.muted }}>{proj.address || 'No address set'}</div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: S.green + '22', color: S.green, marginLeft: 10 }}>Active</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Budget</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: S.accent, fontFamily: 'monospace' }}>{proj.budget ? fmt(proj.budget) : 'Not set'}</div>
                      </div>
                      <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Phases</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{done}/{phases.length}</div>
                      </div>
                      <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Days left</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: daysLeft !== null && daysLeft < 30 ? S.red : S.text, fontFamily: 'monospace' }}>{daysLeft !== null ? (daysLeft > 0 ? daysLeft : '0') : '—'}</div>
                      </div>
                    </div>
                    {(proj.startDate || proj.endDate) && (
                      <div style={{ marginTop: 8, fontSize: 11, color: S.muted }}>
                        {fmtDate(proj.startDate)} → {fmtDate(proj.endDate)}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {archived.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Archived projects</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {archived.map(proj => (
                <button key={proj.id} onClick={() => { setActiveProjectId(proj.id); onSelect() }}
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{proj.address || 'No address'}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: S.muted + '22', color: S.muted }}>Archived</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {showAdd && <AddProjectSheet onClose={() => setShowAdd(false)} onCreated={onSelect} />}
    </div>
  )
}

function ProjectDashboard() {
  const { profile, activeProject, setActiveTab } = useApp()
  const isBuilder = profile?.role === 'builder' || profile?.role === 'admin'
  const isClient  = profile?.role === 'client'

  const p = activeProject
  if (!p) return null

  const totalIncome    = (p.invoices || []).reduce((s, i) => s + (i.amount || 0) + (i.vat || 0), 0)
  const paidIncome     = (p.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0) + (i.vat || 0), 0)
  const totalCosts     = (p.supplierInvoices || []).reduce((s, i) => s + (i.amount || 0), 0) + (p.labourCosts || []).reduce((s, i) => s + (i.amount || 0), 0)
  const overdueCount   = (p.invoices || []).filter(i => i.status === 'Overdue').length
  const nextPhase      = (p.phases || []).find(ph => ph.status !== 'Complete')
  const unreadCount    = [...(p.messages?.client || []), ...(p.messages?.supplier || [])].filter(m => !m.read && m.from !== profile?.role).length
  const openMilestones = (p.phases || []).reduce((s, ph) => s + (ph.milestones || []).filter(ms => !ms.resolved).length, 0)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px 14px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 2 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: S.muted }}>{p.address}</div>
        {p.startDate && <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{fmtDate(p.startDate)} → {fmtDate(p.endDate)}</div>}
        {p.status === 'archived' && (
          <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: S.muted + '22', color: S.muted }}>Archived — view only</span>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {isBuilder && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <StatCard label="Budget" value={p.budget ? fmt(p.budget) : 'Not set'} color={S.accent} />
              <StatCard label="Invoiced" value={fmt(totalIncome)} sub={`${fmt(paidIncome)} received`} color={S.green} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <StatCard label="Costs" value={fmt(totalCosts)} color={S.blue} />
              <StatCard label="Margin" value={fmt(paidIncome - totalCosts)} color={paidIncome - totalCosts >= 0 ? S.green : S.red} />
            </div>
          </>
        )}

        {isClient && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <StatCard label="Agreed budget" value={p.budget ? fmt(p.budget) : 'Not set'} color={S.accent} />
            <StatCard label="Phases" value={(p.phases || []).length} color={S.blue} sub={`${(p.phases || []).filter(ph => ph.status === 'Complete').length} complete`} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {overdueCount > 0 && isBuilder && (
            <button onClick={() => setActiveTab('finance')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.red + '15', border: `1px solid ${S.red}44`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.red }}>{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 11, color: S.muted }}>Tap to view in Finance</div>
              </div>
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={() => setActiveTab('comms')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.blue + '15', border: `1px solid ${S.blue}44`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.blue }}>{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 11, color: S.muted }}>Tap to open Comms</div>
              </div>
            </button>
          )}
          {nextPhase && (
            <button onClick={() => setActiveTab('timeline')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.accent + '15', border: `1px solid ${S.accent}44`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.accent }}>Next: {nextPhase.name}</div>
                <div style={{ fontSize: 11, color: S.muted }}>{fmtDate(nextPhase.start)} → {fmtDate(nextPhase.end)} · {nextPhase.status}</div>
              </div>
            </button>
          )}
          {openMilestones > 0 && (
            <button onClick={() => setActiveTab('timeline')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.amber + '15', border: `1px solid ${S.amber}44`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.amber }}>Decisions needed</div>
                <div style={{ fontSize: 11, color: S.muted }}>Open milestones require attention</div>
              </div>
            </button>
          )}
        </div>

        {(p.photos || []).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent photos</span>
              <button onClick={() => setActiveTab('comms')} style={{ fontSize: 12, color: S.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {(p.photos || []).slice(0, 5).map(ph => (
                <div key={ph.id} style={{ flexShrink: 0, width: 100, height: 100, background: S.card, borderRadius: 10, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 28 }}>📸</span>
                  <span style={{ fontSize: 9, color: S.muted, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 }}>{ph.caption}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(p.changeRequests || []).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Change requests</div>
            {(p.changeRequests || []).map(cr => (
              <div key={cr.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: S.text, fontWeight: 600 }}>{cr.text}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>By {cr.by} · {cr.date}</div>
                </div>
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: cr.status === 'Approved' ? S.green : cr.status === 'Rejected' ? S.red : S.amber, background: (cr.status === 'Approved' ? S.green : cr.status === 'Rejected' ? S.red : S.amber) + '22' }}>
                  {cr.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomeView() {
  const { profile, activeProject, projects } = useApp()
  const [view, setView] = useState('list')

  useEffect(() => {
    if (projects.length > 0 && activeProject) {
      setView('dashboard')
    } else {
      setView('list')
    }
  }, [projects.length])

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {projects.length > 0 && (
        <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '0 16px', display: 'flex', gap: 4 }}>
          <button onClick={() => setView('list')} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent', color: view === 'list' ? S.accent : S.muted, borderBottom: view === 'list' ? `2px solid ${S.accent}` : '2px solid transparent' }}>
            All projects
          </button>
          {activeProject && (
            <button onClick={() => setView('dashboard')} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent', color: view === 'dashboard' ? S.accent : S.muted, borderBottom: view === 'dashboard' ? `2px solid ${S.accent}` : '2px solid transparent', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProject.name}
            </button>
          )}
        </div>
      )}
      {view === 'list' && <ProjectList onSelect={() => setView('dashboard')} />}
      {view === 'dashboard' && <ProjectDashboard />}
    </div>
  )
}