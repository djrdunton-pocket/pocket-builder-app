import { useState } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa'
}

const fmt = n => '£' + Number(n).toLocaleString('en-GB')

function StatCard({ label, value, color = S.accent, sub }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px', flex: 1 }}>
      <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function AddProjectSheet({ onClose }) {
  const { addProject } = useApp()
  const [form, setForm] = useState({ name: '', address: '', startDate: '', endDate: '', budget: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inp = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
  const save = () => {
    if (!form.name) return
    addProject(form)
    onClose()
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
          <button onClick={save} disabled={!form.name} style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: form.name ? 1 : 0.5 }}>
            Create project
          </button>
        </div>
      </div>
    </>
  )
}

export default function HomeView() {
  const { user, projects, activeProject, activeProjectId, setActiveProjectId, setActiveTab } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'
  const isClient  = user?.role === 'client'

  const myProjects = isBuilder ? projects
    : isClient ? projects.filter(p => p.clientId === user?.id)
    : projects.filter(p => p.supplierIds?.includes(user?.id))

  const p = activeProject
  const totalIncome  = p.invoices.reduce((s, i) => s + i.amount + i.vat, 0)
  const paidIncome   = p.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount + i.vat, 0)
  const totalCosts   = p.supplierInvoices.reduce((s, i) => s + i.amount, 0) + p.labourCosts.reduce((s, i) => s + i.amount, 0)
  const overdueCount = p.invoices.filter(i => i.status === 'Overdue').length
  const nextPhase    = p.phases.find(ph => ph.status !== 'Complete')
  const unreadCount  = [...p.messages.client, ...p.messages.supplier].filter(m => !m.read && m.from !== (user?.role === 'builder' ? 'builder' : 'client')).length

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="12" fill="#00c9a7" fillOpacity="0.15"/>
            <path d="M26 10L8 24H13V42H39V24H44L26 10Z" stroke="#00c9a7" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
            <rect x="20" y="27" width="12" height="10" rx="2" stroke="#00c9a7" strokeWidth="1.8" fill="none"/>
            <circle cx="26" cy="35.5" r="0.9" fill="#00c9a7"/>
          </svg>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: S.text, letterSpacing: '-0.02em', lineHeight: 1 }}>Pocket Builder</div>
            <div style={{ fontSize: 11, color: S.accent, marginTop: 2 }}>
              {user?.name} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Project switcher */}
        {myProjects.length > 1 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
            {myProjects.map(proj => (
              <button key={proj.id} onClick={() => setActiveProjectId(proj.id)} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${activeProjectId === proj.id ? S.accent : S.border}`,
                background: activeProjectId === proj.id ? S.accent + '22' : S.card,
                color: activeProjectId === proj.id ? S.accent : S.muted,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{proj.name}</button>
            ))}
            {isBuilder && (
              <button onClick={() => setShowAdd(true)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px dashed ${S.border}`, background: 'transparent', color: S.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + New
              </button>
            )}
          </div>
        )}
        {myProjects.length <= 1 && isBuilder && (
          <button onClick={() => setShowAdd(true)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px dashed ${S.border}`, background: 'transparent', color: S.muted, cursor: 'pointer' }}>
            + New project
          </button>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Project title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>{p.name}</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{p.address}</div>
        </div>

        {/* Stats */}
        {isBuilder && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <StatCard label="Budget" value={fmt(p.budget)} color={S.accent} />
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
            <StatCard label="Agreed budget" value={fmt(p.budget)} color={S.accent} />
            <StatCard label="Phases" value={p.phases.length} color={S.blue} sub={`${p.phases.filter(ph => ph.status === 'Complete').length} complete`} />
          </div>
        )}

        {/* Alert cards */}
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
                <div style={{ fontSize: 11, color: S.muted }}>{nextPhase.start} → {nextPhase.end} · {nextPhase.status}</div>
              </div>
            </button>
          )}

          {p.phases.filter(ph => ph.milestones.some(ms => !ms.resolved)).length > 0 && (
            <button onClick={() => setActiveTab('timeline')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.amber + '15', border: `1px solid ${S.amber}44`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: S.amber }}>Decisions needed</div>
                <div style={{ fontSize: 11, color: S.muted }}>Open milestones require attention</div>
              </div>
            </button>
          )}

        </div>

        {/* Recent photos */}
        {p.photos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent photos</span>
              <button onClick={() => setActiveTab('comms')} style={{ fontSize: 12, color: S.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {p.photos.slice(0, 5).map(ph => (
                <div key={ph.id} style={{ flexShrink: 0, width: 100, height: 100, background: S.card, borderRadius: 10, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 28 }}>📸</span>
                  <span style={{ fontSize: 9, color: S.muted, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 }}>{ph.caption}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Change requests */}
        {p.changeRequests.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Change requests</div>
            {p.changeRequests.map(cr => (
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

      {showAdd && <AddProjectSheet onClose={() => setShowAdd(false)} />}
    </div>
  )
}