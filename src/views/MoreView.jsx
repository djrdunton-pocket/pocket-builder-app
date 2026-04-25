import { useState } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa'
}

const Inp = ({ label, value, onChange, type = 'text', readOnly, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
    {readOnly
      ? <div style={{ fontSize: 15, color: S.text, padding: '12px 0', fontWeight: 500, borderBottom: `1px solid ${S.border}` }}>{value || '—'}</div>
      : <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
    }
  </div>
)

function BuilderDetails() {
  const { activeProject, updateActiveProject, user } = useApp()
  const canEdit = user?.role === 'builder' || user?.role === 'admin'
  const [details, setDetails] = useState({
    builderName: activeProject.builderName || '',
    builderCompany: activeProject.builderCompany || '',
    builderPhone: activeProject.builderPhone || '',
    builderEmail: activeProject.builderEmail || '',
    builderAddress: activeProject.builderAddress || '',
  })
  const set = (k, v) => setDetails(d => ({ ...d, [k]: v }))
  const save = () => updateActiveProject(details)

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: S.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Builder details</div>
      <Inp label="Name"    value={details.builderName}    onChange={v => set('builderName', v)}    readOnly={!canEdit} placeholder="Your name" />
      <Inp label="Company" value={details.builderCompany} onChange={v => set('builderCompany', v)} readOnly={!canEdit} placeholder="Company name" />
      <Inp label="Phone"   value={details.builderPhone}   onChange={v => set('builderPhone', v)}   readOnly={!canEdit} type="tel" placeholder="07700 900000" />
      <Inp label="Email"   value={details.builderEmail}   onChange={v => set('builderEmail', v)}   readOnly={!canEdit} type="email" placeholder="you@company.co.uk" />
      <Inp label="Address" value={details.builderAddress} onChange={v => set('builderAddress', v)} readOnly={!canEdit} placeholder="Business address" />
      {canEdit && (
        <button onClick={save} style={{ width: '100%', padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>
          Save
        </button>
      )}
    </div>
  )
}

function ClientDetails() {
  const { activeProject, updateActiveProject, user } = useApp()
  const canEdit = user?.role === 'client' || user?.role === 'admin'
  const [details, setDetails] = useState({
    clientName:    activeProject.clientName    || '',
    clientPhone:   activeProject.clientPhone   || '',
    clientEmail:   activeProject.clientEmail   || '',
    clientAddress: activeProject.clientAddress || '',
  })
  const set = (k, v) => setDetails(d => ({ ...d, [k]: v }))
  const save = () => updateActiveProject(details)

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: S.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Client details</div>
      <Inp label="Name"    value={details.clientName}    onChange={v => set('clientName', v)}    readOnly={!canEdit} placeholder="Client name" />
      <Inp label="Phone"   value={details.clientPhone}   onChange={v => set('clientPhone', v)}   readOnly={!canEdit} type="tel" placeholder="07700 900000" />
      <Inp label="Email"   value={details.clientEmail}   onChange={v => set('clientEmail', v)}   readOnly={!canEdit} type="email" placeholder="client@email.com" />
      <Inp label="Address" value={details.clientAddress} onChange={v => set('clientAddress', v)} readOnly={!canEdit} placeholder="Client address" />
      {canEdit && (
        <button onClick={save} style={{ width: '100%', padding: 13, background: S.blue, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>
          Save
        </button>
      )}
    </div>
  )
}

function SupplierDetails() {
  const { activeProject, updateActiveProject, user } = useApp()
  const canEdit = user?.role === 'builder' || user?.role === 'admin'
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ supplierName: '', supplierCompany: '', supplierPhone: '', supplierEmail: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const suppliers = activeProject.suppliers || []

  const save = () => {
    if (!form.supplierName) return
    updateActiveProject({ suppliers: [...suppliers, { ...form, id: 'sup_' + Date.now() }] })
    setForm({ supplierName: '', supplierCompany: '', supplierPhone: '', supplierEmail: '' })
    setShowAdd(false)
  }

  const remove = (id) => updateActiveProject({ suppliers: suppliers.filter(s => s.id !== id) })

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: S.amber, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suppliers</div>
        {canEdit && <button onClick={() => setShowAdd(!showAdd)} style={{ fontSize: 12, color: S.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>}
      </div>

      {suppliers.length === 0 && !showAdd && (
        <div style={{ fontSize: 13, color: S.muted, textAlign: 'center', padding: '12px 0' }}>No suppliers added yet</div>
      )}

      {suppliers.map(s => (
        <div key={s.id} style={{ background: S.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{s.supplierName}</div>
            {s.supplierCompany && <div style={{ fontSize: 12, color: S.muted }}>{s.supplierCompany}</div>}
            {s.supplierPhone && <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{s.supplierPhone}</div>}
            {s.supplierEmail && <div style={{ fontSize: 12, color: S.muted }}>{s.supplierEmail}</div>}
          </div>
          {canEdit && (
            <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 20, padding: '0 4px', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          )}
        </div>
      ))}

      {showAdd && (
        <div style={{ background: S.surface, borderRadius: 10, padding: 14, marginTop: 8 }}>
          <Inp label="Name"    value={form.supplierName}    onChange={v => set('supplierName', v)}    placeholder="Contact name" />
          <Inp label="Company" value={form.supplierCompany} onChange={v => set('supplierCompany', v)} placeholder="Company name" />
          <Inp label="Phone"   value={form.supplierPhone}   onChange={v => set('supplierPhone', v)}   type="tel" placeholder="07700 900000" />
          <Inp label="Email"   value={form.supplierEmail}   onChange={v => set('supplierEmail', v)}   type="email" placeholder="supplier@email.com" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={!form.supplierName} style={{ flex: 1, padding: 12, background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: form.supplierName ? 1 : 0.5 }}>Add</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '12px 16px', background: S.card, color: S.muted, border: `1px solid ${S.border}`, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectSettings() {
  const { activeProject, updateActiveProject, user, addChangeRequest, updateChangeRequest } = useApp()
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'
  const [form, setForm] = useState({
    name: activeProject.name || '',
    address: activeProject.address || '',
    startDate: activeProject.startDate || '',
    endDate: activeProject.endDate || '',
    budget: activeProject.budget || '',
  })
  const [newCR, setNewCR] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = () => updateActiveProject(form)

  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: S.purple, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Project settings</div>
      <Inp label="Project name"    value={form.name}      onChange={v => set('name', v)} />
      <Inp label="Site address"    value={form.address}   onChange={v => set('address', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Inp label="Start date" value={form.startDate} onChange={v => set('startDate', v)} type="date" />
        <Inp label="End date"   value={form.endDate}   onChange={v => set('endDate', v)}   type="date" />
      </div>
      <Inp label="Agreed budget (£)" value={form.budget} onChange={v => set('budget', v)} type="number" />
      <button onClick={save} style={{ width: '100%', padding: 13, background: S.purple, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
        Save project settings
      </button>

      <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Change requests</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={newCR} onChange={e => setNewCR(e.target.value)} placeholder="Describe the change request"
          style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '10px 13px', color: S.text, fontSize: 14, outline: 'none' }} />
        <button onClick={() => { if (newCR.trim()) { addChangeRequest(newCR.trim()); setNewCR('') } }} disabled={!newCR.trim()}
          style={{ padding: '10px 14px', background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: newCR.trim() ? 1 : 0.5 }}>Add</button>
      </div>
      {activeProject.changeRequests.map(cr => (
        <div key={cr.id} style={{ background: S.surface, borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: S.text }}>{cr.text}</div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>By {cr.by} · {cr.date}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: cr.status === 'Approved' ? S.green : cr.status === 'Rejected' ? S.red : S.amber, background: (cr.status === 'Approved' ? S.green : cr.status === 'Rejected' ? S.red : S.amber) + '22' }}>{cr.status}</span>
            {isBuilder && cr.status === 'Pending' && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => updateChangeRequest(cr.id, 'Approved')} style={{ padding: '4px 8px', background: S.green + '22', color: S.green, border: `1px solid ${S.green}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓</button>
                <button onClick={() => updateChangeRequest(cr.id, 'Rejected')} style={{ padding: '4px 8px', background: S.red + '22', color: S.red, border: `1px solid ${S.red}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✗</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MoreView() {
  const { user, logout } = useApp()
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'
  const isClient  = user?.role === 'client'
  const isSupplier = user?.role === 'supplier'

  const roleColor = isClient ? S.blue : isSupplier ? S.amber : isBuilder ? S.accent : S.purple

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 2 }}>More</div>
        <div style={{ fontSize: 12, color: S.muted }}>Settings & details</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* User card */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: roleColor + '22', border: `2px solid ${roleColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: roleColor, flexShrink: 0 }}>
            {user?.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: S.text }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: S.muted }}>{user?.email}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, color: roleColor, background: roleColor + '22', display: 'inline-block', marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>

        {/* Role-based sections */}
        {(isBuilder) && <ProjectSettings />}
        {(isBuilder) && <BuilderDetails />}
        {(isBuilder) && <SupplierDetails />}
        {(isClient)  && <ClientDetails />}
        {(isClient)  && <ProjectSettings />}
        {(isSupplier) && <SupplierDetails />}
        {user?.role === 'admin' && (
          <>
            <ProjectSettings />
            <BuilderDetails />
            <ClientDetails />
            <SupplierDetails />
          </>
        )}

        {/* Sign out */}
        <button onClick={logout} style={{ width: '100%', padding: 14, background: S.surface, color: S.red, border: `1px solid ${S.red}33`, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
          Sign out
        </button>
      </div>
    </div>
  )
}