import { useState, useEffect, useRef, createContext, useContext } from 'react'

const SUPABASE_URL = 'https://bdmimbwkvdwahbkxkasf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciJINNU'

const S = {
  bg: '#0b0e16', surface: '#111520', card: '#161b28', border: '#232c3d',
  accent: '#f0a500', text: '#dde3ef', muted: '#5a6a82',
  green: '#22c55e', blue: '#3b82f6', red: '#ef4444', purple: '#a78bfa'
}

const USERS = [
  { id: 1, name: 'James Hartley', email: 'admin@pocketbuilder.co.uk', role: 'admin' },
  { id: 2, name: 'Sarah Mitchell', email: 'builder@pocketbuilder.co.uk', role: 'builder' },
  { id: 3, name: 'Mr & Mrs Johnson', email: 'client@pocketbuilder.co.uk', role: 'client' },
]

const PHASE_STATUSES = ['Not Started', 'In Progress', 'Complete', 'On Hold']
const STATUS_COLORS = {
  'Not Started': S.muted, 'In Progress': S.blue,
  'Complete': S.green, 'On Hold': S.accent
}

const INITIAL_PROJECT = {
  name: '4 Bed Detached New Build',
  address: '12 Maple Drive, Guildford, Surrey',
  startDate: '2025-05-01',
  endDate: '2025-11-30',
  budget: '285000',
  changeRequests: [],
  phases: [
    { id: 1, name: 'Groundworks', start: '2025-05-01', end: '2025-05-28', status: 'Complete', milestones: [] },
    { id: 2, name: 'Structure', start: '2025-06-01', end: '2025-07-31', status: 'In Progress', milestones: [
      { id: 1, text: 'Structural engineer sign-off needed', resolved: false, replies: [] }
    ]},
    { id: 3, name: 'Roofing', start: '2025-08-01', end: '2025-08-20', status: 'Not Started', milestones: [] },
    { id: 4, name: 'First Fix', start: '2025-09-01', end: '2025-09-30', status: 'Not Started', milestones: [] },
    { id: 5, name: 'Second Fix', start: '2025-10-01', end: '2025-10-31', status: 'Not Started', milestones: [] },
    { id: 6, name: 'Finishing', start: '2025-11-01', end: '2025-11-28', status: 'Not Started', milestones: [] },
  ],
  unavailable: [],
}

const INITIAL_BUILDER = {
  name: 'Sarah Mitchell', company: 'BuildRight Ltd',
  phone: '07700 900456', email: 'sarah@buildright.co.uk', address: '45 Trade Street, Guildford'
}

const INITIAL_CLIENT = {
  name: 'Mr & Mrs Johnson', phone: '07700 900789',
  email: 'johnson@example.com', address: '12 Maple Drive, Guildford'
}

const INITIAL_MESSAGES = [
  { id: 1, from: 'builder', fromName: 'Sarah Mitchell', text: 'Site start confirmed for Monday 5th May, 7:30am.', ts: '2025-04-28T09:14:00' },
  { id: 2, from: 'client', fromName: 'Mr Johnson', text: 'Great — will there be parking for the team?', ts: '2025-04-28T10:02:00' },
  { id: 3, from: 'builder', fromName: 'Sarah Mitchell', text: "Yes, use the front drive. I'll send the site rules today.", ts: '2025-04-28T10:15:00' },
]

const INITIAL_DOCS = [
  { id: 1, name: 'Planning Permission.pdf', uploadedBy: 'builder', uploaderName: 'Sarah Mitchell', date: '2025-01-15', size: '2.4 MB' },
  { id: 2, name: 'Architectural Drawings Rev C.pdf', uploadedBy: 'builder', uploaderName: 'Sarah Mitchell', date: '2025-02-20', size: '8.7 MB' },
  { id: 3, name: 'Structural Calculations.pdf', uploadedBy: 'client', uploaderName: 'Mr & Mrs Johnson', date: '2025-03-05', size: '3.2 MB' },
]

const Ctx = createContext(null)
const useApp = () => useContext(Ctx)
function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('marketing')
  const [project, setProject] = useState(INITIAL_PROJECT)
  const [builder, setBuilder] = useState(INITIAL_BUILDER)
  const [client, setClient] = useState(INITIAL_CLIENT)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [docs, setDocs] = useState(INITIAL_DOCS)

  const login = (email) => {
    const u = USERS.find(u => u.email === email)
    if (u) { setUser(u); setPage('app'); return true }
    return false
  }
  const logout = () => { setUser(null); setPage('marketing') }

  const sendMessage = (text) => {
    const role = user.role === 'client' ? 'client' : 'builder'
    setMessages(m => [...m, {
      id: Date.now(), from: role, fromName: user.name,
      text, ts: new Date().toISOString()
    }])
  }

  const addDoc = (file) => {
    setDocs(d => [...d, {
      id: Date.now(), name: file.name,
      uploadedBy: user.role, uploaderName: user.name,
      date: new Date().toISOString().slice(0, 10),
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB'
    }])
  }

  const deleteDoc = (id) => setDocs(d => d.filter(x => x.id !== id))

  const addPhase = (phase) => setProject(p => ({ ...p, phases: [...p.phases, { ...phase, id: Date.now(), milestones: [] }] }))
  const updatePhase = (id, updates) => setProject(p => ({ ...p, phases: p.phases.map(ph => ph.id === id ? { ...ph, ...updates } : ph) }))
  const deletePhase = (id) => setProject(p => ({ ...p, phases: p.phases.filter(ph => ph.id !== id) }))

  const addMilestone = (phaseId, text) => setProject(p => ({
    ...p, phases: p.phases.map(ph => ph.id === phaseId
      ? { ...ph, milestones: [...ph.milestones, { id: Date.now(), text, resolved: false, replies: [] }] }
      : ph)
  }))
  const replyMilestone = (phaseId, msId, text) => setProject(p => ({
    ...p, phases: p.phases.map(ph => ph.id === phaseId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId
          ? { ...ms, replies: [...ms.replies, { by: user.name, text, ts: new Date().toISOString() }] }
          : ms) }
      : ph)
  }))
  const resolveMilestone = (phaseId, msId) => setProject(p => ({
    ...p, phases: p.phases.map(ph => ph.id === phaseId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId ? { ...ms, resolved: true } : ms) }
      : ph)
  }))

  const addUnavailable = (entry) => setProject(p => ({ ...p, unavailable: [...p.unavailable, { ...entry, id: Date.now() }] }))
  const deleteUnavailable = (id) => setProject(p => ({ ...p, unavailable: p.unavailable.filter(u => u.id !== id) }))

  const addChangeRequest = (text) => setProject(p => ({
    ...p, changeRequests: [...p.changeRequests, { id: Date.now(), text, status: 'Pending', by: user.name, date: new Date().toISOString().slice(0, 10) }]
  }))
  const updateChangeRequest = (id, status) => setProject(p => ({
    ...p, changeRequests: p.changeRequests.map(c => c.id === id ? { ...c, status } : c)
  }))

  return (
    <Ctx.Provider value={{
      user, login, logout, page, setPage,
      project, setProject, builder, setBuilder, client, setClient,
      messages, sendMessage, docs, addDoc, deleteDoc,
      addPhase, updatePhase, deletePhase,
      addMilestone, replyMilestone, resolveMilestone,
      addUnavailable, deleteUnavailable,
      addChangeRequest, updateChangeRequest,
    }}>
      {children}
    </Ctx.Provider>
  )
}
// ── UI primitives ──────────────────────────────────────────────
const Card = ({ children, style: s = {} }) => (
  <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, padding: 18, ...s }}>{children}</div>
)

const Btn = ({ children, onClick, variant = 'ghost', small, disabled, style: s = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? '4px 10px' : '8px 18px',
    background: variant === 'primary' ? S.accent : variant === 'danger' ? '#ef444422' : S.surface,
    color: variant === 'primary' ? '#0b0e16' : variant === 'danger' ? S.red : S.text,
    border: `1px solid ${variant === 'primary' ? S.accent : variant === 'danger' ? '#ef444466' : S.border}`,
    borderRadius: 8, fontWeight: 700, fontSize: small ? 11 : 13,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap', ...s
  }}>{children}</button>
)

const Input = ({ label, value, onChange, type = 'text', readOnly, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</label>}
    {readOnly
      ? <div style={{ fontSize: 14, color: S.text, padding: '8px 0', fontWeight: 500 }}>{value || '—'}</div>
      : <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: '8px 11px', color: S.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    }
  </div>
)

const Tag = ({ children, color }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color, background: color + '22', border: `1px solid ${color}44` }}>{children}</span>
)

const SectionHead = ({ children, color = S.accent, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{children}</span>
    {action}
  </div>
)

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, width: '100%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: S.text }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
)

// ── Login ──────────────────────────────────────────────────────
function LoginPage() {
  const { login, setPage } = useApp()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const go = () => {
    if (!login(email)) setError('Email not recognised. Use a demo account below.')
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: S.accent, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>🏗</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>Pocket Builder</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Construction management in your pocket</div>
        </div>
        <Card>
          <Input label="Email address" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
          {error && <div style={{ color: S.red, fontSize: 12, marginBottom: 12, padding: '8px 12px', background: S.red + '15', borderRadius: 7 }}>{error}</div>}
          <Btn variant="primary" onClick={go} style={{ width: '100%', padding: '11px 0' }}>Sign In →</Btn>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <button onClick={() => setPage('marketing')} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 13 }}>← Back to website</button>
          </div>
        </Card>
        <div style={{ marginTop: 18, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Demo accounts — click to fill</div>
          {USERS.map(u => {
            const c = u.role === 'admin' ? S.purple : u.role === 'builder' ? S.accent : S.blue
            return (
              <button key={u.id} onClick={() => setEmail(u.email)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, padding: '9px 13px', cursor: 'pointer', width: '100%', marginBottom: 6 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: S.muted }}>{u.email}</div>
                </div>
                <Tag color={c}>{u.role}</Tag>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
// ── Marketing page ─────────────────────────────────────────────
function MarketingPage() {
  const { setPage } = useApp()

  return (
    <div style={{ background: S.bg, minHeight: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: S.text }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: S.bg + 'f0', borderBottom: `1px solid ${S.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: S.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏗</div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>Pocket Builder</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage('login')} style={{ padding: '7px 16px', background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Sign In</button>
          <button onClick={() => setPage('login')} style={{ padding: '7px 16px', background: S.accent, color: '#0b0e16', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '90px 24px 70px', textAlign: 'center', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.accent, background: S.accent + '18', border: `1px solid ${S.accent}44`, borderRadius: 20, padding: '4px 14px', marginBottom: 24 }}>Built for UK builders & clients</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px', color: S.text }}>
          Construction management<br /><span style={{ color: S.accent }}>in your pocket</span>
        </h1>
        <p style={{ fontSize: 17, color: S.muted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
          Project timelines, documents, milestones and messaging — all in one place for builders and their clients.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('login')} style={{ padding: '13px 28px', background: S.accent, color: '#0b0e16', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Start free trial →</button>
          <button onClick={() => setPage('login')} style={{ padding: '13px 28px', background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>View demo</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: S.muted }}>No credit card required · 14-day free trial</div>
      </section>

      {/* Mock app screenshot */}
      <section style={{ maxWidth: 860, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: S.surface, padding: '10px 16px', display: 'flex', gap: 6, alignItems: 'center', borderBottom: `1px solid ${S.border}` }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            <div style={{ flex: 1, background: S.card, borderRadius: 6, height: 22, marginLeft: 8 }} />
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[['Project', '4 Bed Detached', S.accent], ['Progress', '33% complete', S.green], ['Budget', '£285,000', S.blue]].map(([l, v, c]) => (
                <div key={l} style={{ background: S.surface, borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: S.surface, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Project Timeline</div>
              {[['Groundworks', S.green, '100%'], ['Structure', S.blue, '45%'], ['Roofing', S.muted, '0%']].map(([name, color, pct]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 80, fontSize: 12, color: S.muted }}>{name}</div>
                  <div style={{ flex: 1, height: 8, background: S.card, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: pct, height: '100%', background: color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color, width: 32, textAlign: 'right' }}>{pct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 40, color: S.text, letterSpacing: '-0.02em' }}>Everything you need</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            ['📅', 'Phase timeline', 'Visual Gantt-style timeline with milestones, decision flags and unavailability blocks.'],
            ['📁', 'Documents', 'Builder and client both upload. Everyone views. Only the uploader can delete.'],
            ['💬', 'Messenger', 'Direct messaging between builder and client. Admin can view the full thread.'],
            ['🔐', 'Role-based access', 'Admin, builder and client each see and edit only what is relevant to them.'],
            ['📋', 'Change requests', 'Log and track changes to scope with status updates visible to both parties.'],
            ['👤', 'Contact details', 'Builder and client each manage their own contact information.'],
          ].map(([ic, ti, de]) => (
            <div key={ti} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '20px 18px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{ic}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: S.text, marginBottom: 6 }}>{ti}</div>
              <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.6 }}>{de}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '70px 24px', background: S.surface, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 10, color: S.text, letterSpacing: '-0.02em' }}>Simple pricing</h2>
          <p style={{ textAlign: 'center', color: S.muted, marginBottom: 40, fontSize: 15 }}>A flat monthly fee for builders, plus a small per-project fee. Clients always access free.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { name: 'Builder', price: '£29', period: '/month', color: S.accent, features: ['Unlimited projects', 'Client portal included', 'Document storage', 'Messaging', 'Timeline & milestones', 'Priority support'], cta: 'Start free trial', popular: true },
              { name: 'Per project', price: '£9', period: '/project', color: S.blue, features: ['Pay as you go', 'No monthly commitment', 'Full feature access', 'Client portal included', 'Document storage', 'Messaging'], cta: 'Start free trial', popular: false },
            ].map(plan => (
              <div key={plan.name} style={{ background: S.card, border: `2px solid ${plan.popular ? plan.color : S.border}`, borderRadius: 14, padding: 26, position: 'relative' }}>
                {plan.popular && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#0b0e16', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: S.text, fontFamily: 'monospace' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: S.muted }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: plan.color }}>✓</span>
                      <span style={{ color: S.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPage('login')} style={{ width: '100%', padding: '10px 0', background: plan.popular ? plan.color : S.surface, color: plan.popular ? '#0b0e16' : S.text, border: `1px solid ${plan.popular ? plan.color : S.border}`, borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: S.muted, fontSize: 12, marginTop: 20 }}>All prices exclude VAT. 14-day free trial on all plans. No credit card required.</p>
        </div>
      </section>

      {/* T&Cs */}
      <section style={{ padding: '70px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: S.text, marginBottom: 24, letterSpacing: '-0.02em' }}>Terms & conditions</h2>
        {[
          ['1. Service', 'Pocket Builder provides SaaS project management software for construction professionals, accessible on a subscription basis.'],
          ['2. Subscriptions', 'Billed monthly or per project. Cancel at any time — cancellation takes effect at the end of the current billing period.'],
          ['3. Your data', 'Your project data belongs to you. We do not sell or share it with third parties. Data is stored securely on UK-based servers.'],
          ['4. Liability', 'Pocket Builder is a management tool only. We accept no responsibility for construction decisions, cost overruns, or disputes between builders and clients.'],
          ['5. Governing law', 'These terms are governed by English law. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.'],
        ].map(([title, text]) => (
          <div key={title} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontWeight: 800, color: S.text, marginBottom: 6, fontSize: 14 }}>{title}</div>
            <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7 }}>{text}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, background: S.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏗</div>
          <span style={{ fontWeight: 900, color: S.text }}>Pocket Builder</span>
        </div>
        <div style={{ fontSize: 12, color: S.muted }}>© {new Date().getFullYear()} Pocket Builder Ltd · Registered in England & Wales</div>
      </footer>
    </div>
  )
}
// ── Project Details view ───────────────────────────────────────
function ProjectView() {
  const { user, project, setProject, addPhase, updatePhase, deletePhase, addChangeRequest, updateChangeRequest } = useApp()
  const canEdit = user.role === 'admin' || user.role === 'builder' || user.role === 'client'
  const isBuilder = user.role === 'builder' || user.role === 'admin'
  const [showPhaseModal, setShowPhaseModal] = useState(false)
  const [showCRModal, setShowCRModal] = useState(false)
  const [newPhase, setNewPhase] = useState({ name: '', start: '', end: '', status: 'Not Started' })
  const [newCR, setNewCR] = useState('')

  const set = (k, v) => setProject(p => ({ ...p, [k]: v }))

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionHead>Project details</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <Input label="Project name" value={project.name} onChange={v => set('name', v)} readOnly={!canEdit} />
          <Input label="Site address" value={project.address} onChange={v => set('address', v)} readOnly={!canEdit} />
          <Input label="Start date" type="date" value={project.startDate} onChange={v => set('startDate', v)} readOnly={!canEdit} />
          <Input label="End date" type="date" value={project.endDate} onChange={v => set('endDate', v)} readOnly={!canEdit} />
          <Input label="Agreed budget (£)" value={project.budget} onChange={v => set('budget', v)} readOnly={!canEdit} />
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionHead action={isBuilder && <Btn small onClick={() => setShowPhaseModal(true)}>+ Add phase</Btn>}>Phases</SectionHead>
        {project.phases.length === 0 && <div style={{ color: S.muted, fontSize: 13 }}>No phases yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.phases.map(ph => (
            <div key={ph.id} style={{ background: S.surface, borderRadius: 8, padding: '10px 14px', border: `1px solid ${STATUS_COLORS[ph.status]}44`, display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: S.text, fontSize: 14 }}>{ph.name}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{ph.start} → {ph.end}</div>
              </div>
              <Tag color={STATUS_COLORS[ph.status]}>{ph.status}</Tag>
              {isBuilder && (
                <select value={ph.status} onChange={e => updatePhase(ph.id, { status: e.target.value })}
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: '4px 8px', color: S.text, fontSize: 12, outline: 'none' }}>
                  {PHASE_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              {isBuilder && <button onClick={() => deletePhase(ph.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead action={<Btn small onClick={() => setShowCRModal(true)}>+ Add request</Btn>}>Change requests</SectionHead>
        {project.changeRequests.length === 0 && <div style={{ color: S.muted, fontSize: 13 }}>No change requests yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.changeRequests.map(cr => (
            <div key={cr.id} style={{ background: S.surface, borderRadius: 8, padding: '10px 14px', border: `1px solid ${S.border}`, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: S.text }}>{cr.text}</div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>Raised by {cr.by} on {cr.date}</div>
              </div>
              <Tag color={cr.status === 'Approved' ? S.green : cr.status === 'Rejected' ? S.red : S.accent}>{cr.status}</Tag>
              {isBuilder && cr.status === 'Pending' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn small onClick={() => updateChangeRequest(cr.id, 'Approved')}>Approve</Btn>
                  <Btn small variant="danger" onClick={() => updateChangeRequest(cr.id, 'Rejected')}>Reject</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {showPhaseModal && (
        <Modal title="Add phase" onClose={() => setShowPhaseModal(false)}>
          <Input label="Phase name" value={newPhase.name} onChange={v => setNewPhase(p => ({ ...p, name: v }))} />
          <Input label="Start date" type="date" value={newPhase.start} onChange={v => setNewPhase(p => ({ ...p, start: v }))} />
          <Input label="End date" type="date" value={newPhase.end} onChange={v => setNewPhase(p => ({ ...p, end: v }))} />
          <Btn variant="primary" onClick={() => { addPhase(newPhase); setNewPhase({ name: '', start: '', end: '', status: 'Not Started' }); setShowPhaseModal(false) }}
            disabled={!newPhase.name || !newPhase.start || !newPhase.end} style={{ width: '100%', marginTop: 8 }}>
            Add phase
          </Btn>
        </Modal>
      )}

      {showCRModal && (
        <Modal title="Add change request" onClose={() => setShowCRModal(false)}>
          <Input label="Describe the change" value={newCR} onChange={setNewCR} placeholder="e.g. Add bi-fold doors to rear elevation" />
          <Btn variant="primary" onClick={() => { addChangeRequest(newCR); setNewCR(''); setShowCRModal(false) }}
            disabled={!newCR} style={{ width: '100%', marginTop: 8 }}>
            Submit request
          </Btn>
        </Modal>
      )}
    </div>
  )
}

// ── Builder & Client detail views ──────────────────────────────
function BuilderView() {
  const { user, builder, setBuilder } = useApp()
  const canEdit = user.role === 'builder' || user.role === 'admin'
  return (
    <Card>
      <SectionHead>Builder details</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <Input label="Name" value={builder.name} onChange={v => setBuilder(b => ({ ...b, name: v }))} readOnly={!canEdit} />
        <Input label="Company" value={builder.company} onChange={v => setBuilder(b => ({ ...b, company: v }))} readOnly={!canEdit} />
        <Input label="Phone" value={builder.phone} onChange={v => setBuilder(b => ({ ...b, phone: v }))} readOnly={!canEdit} />
        <Input label="Email" value={builder.email} onChange={v => setBuilder(b => ({ ...b, email: v }))} readOnly={!canEdit} />
        <Input label="Address" value={builder.address} onChange={v => setBuilder(b => ({ ...b, address: v }))} readOnly={!canEdit} />
      </div>
    </Card>
  )
}

function ClientView() {
  const { user, client, setClient } = useApp()
  const canEdit = user.role === 'client' || user.role === 'admin'
  return (
    <Card>
      <SectionHead>Client details</SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <Input label="Name" value={client.name} onChange={v => setClient(c => ({ ...c, name: v }))} readOnly={!canEdit} />
        <Input label="Phone" value={client.phone} onChange={v => setClient(c => ({ ...c, phone: v }))} readOnly={!canEdit} />
        <Input label="Email" value={client.email} onChange={v => setClient(c => ({ ...c, email: v }))} readOnly={!canEdit} />
        <Input label="Address" value={client.address} onChange={v => setClient(c => ({ ...c, address: v }))} readOnly={!canEdit} />
      </div>
    </Card>
  )
}
// ── Timeline view ──────────────────────────────────────────────
function TimelineView() {
  const { user, project, addMilestone, replyMilestone, resolveMilestone, addUnavailable, deleteUnavailable } = useApp()
  const isBuilder = user.role === 'builder' || user.role === 'admin'
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [newMilestone, setNewMilestone] = useState('')
  const [replyText, setReplyText] = useState({})
  const [showUnavModal, setShowUnavModal] = useState(false)
  const [newUnav, setNewUnav] = useState({ label: '', start: '', end: '', party: 'builder' })

  const start = new Date(project.startDate)
  const end = new Date(project.endDate)
  const totalDays = (end - start) / (1000 * 60 * 60 * 24)

  const getLeft = d => Math.max(0, (new Date(d) - start) / (end - start) * 100)
  const getWidth = (s, e) => Math.min(100 - getLeft(s), Math.max(1, (new Date(e) - new Date(s)) / (end - start) * 100))

  const months = []
  let d = new Date(start.getFullYear(), start.getMonth(), 1)
  while (d <= end) {
    months.push({ label: d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }), pct: (d - start) / (end - start) * 100 })
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }

  const todayPct = Math.min(100, Math.max(0, (new Date() - start) / (end - start) * 100))

  return (
    <div>
      {/* Gantt chart */}
      <Card style={{ marginBottom: 16, overflowX: 'auto' }}>
        <SectionHead action={<Btn small onClick={() => setShowUnavModal(true)}>+ Not available</Btn>}>Project timeline</SectionHead>
        <div style={{ minWidth: 500 }}>
          {/* Month labels */}
          <div style={{ position: 'relative', height: 20, marginLeft: 120, marginBottom: 8 }}>
            {months.map((m, i) => (
              <div key={i} style={{ position: 'absolute', left: `${m.pct}%`, fontSize: 10, color: S.muted, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>{m.label}</div>
            ))}
          </div>

          {/* Phase bars */}
          {project.phases.map(ph => (
            <div key={ph.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 112, fontSize: 11, color: S.muted, fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{ph.name}</div>
              <div style={{ flex: 1, position: 'relative', height: 28, background: S.surface, borderRadius: 6, cursor: 'pointer' }} onClick={() => setSelectedPhase(selectedPhase?.id === ph.id ? null : ph)}>
                {/* Unavailability blocks */}
                {project.unavailable.map(u => (
                  <div key={u.id} style={{ position: 'absolute', left: `${getLeft(u.start)}%`, width: `${getWidth(u.start, u.end)}%`, top: 0, height: '100%', background: '#ef444418', borderLeft: '2px dashed #ef444466', zIndex: 1 }} />
                ))}
                {/* Phase bar */}
                {ph.start && ph.end && (
                  <div style={{ position: 'absolute', left: `${getLeft(ph.start)}%`, width: `${getWidth(ph.start, ph.end)}%`, top: 4, height: 20, background: STATUS_COLORS[ph.status] + '44', border: `1px solid ${STATUS_COLORS[ph.status]}88`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <span style={{ fontSize: 9, color: STATUS_COLORS[ph.status], fontWeight: 800 }}>{ph.status}</span>
                  </div>
                )}
                {/* Milestone diamonds */}
                {ph.milestones.map((ms, i) => (
                  <div key={ms.id} style={{ position: 'absolute', left: `${getLeft(ph.end)}%`, top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: 10, height: 10, background: ms.resolved ? S.green : S.accent, zIndex: 3, marginLeft: i * 14 }} />
                ))}
                {/* Today line */}
                <div style={{ position: 'absolute', left: `${todayPct}%`, top: 0, width: 2, height: '100%', background: S.accent, opacity: 0.7, zIndex: 4 }} />
              </div>
            </div>
          ))}

          {/* Today label */}
          <div style={{ position: 'relative', marginLeft: 120, height: 16 }}>
            <div style={{ position: 'absolute', left: `${todayPct}%`, transform: 'translateX(-50%)', fontSize: 9, color: S.accent, fontWeight: 800 }}>TODAY</div>
          </div>
        </div>
      </Card>

      {/* Selected phase detail */}
      {selectedPhase && (
        <Card style={{ marginBottom: 16 }}>
          <SectionHead color={STATUS_COLORS[selectedPhase.status]} action={
            isBuilder && (
              <Btn small onClick={() => {
                if (newMilestone.trim()) {
                  addMilestone(selectedPhase.id, newMilestone.trim())
                  setNewMilestone('')
                  setSelectedPhase(p => project.phases.find(ph => ph.id === p.id))
                }
              }}>+ Add milestone</Btn>
            )
          }>{selectedPhase.name} — milestones</SectionHead>

          {isBuilder && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="e.g. Kitchen tile choice needed"
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: '7px 11px', color: S.text, fontSize: 13, outline: 'none' }} />
              <Btn small variant="primary" onClick={() => {
                if (newMilestone.trim()) {
                  addMilestone(selectedPhase.id, newMilestone.trim())
                  setNewMilestone('')
                }
              }}>Add</Btn>
            </div>
          )}

          {selectedPhase.milestones.length === 0 && <div style={{ color: S.muted, fontSize: 13 }}>No milestones for this phase yet.</div>}

          {project.phases.find(ph => ph.id === selectedPhase.id)?.milestones.map(ms => (
            <div key={ms.id} style={{ background: S.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 8, border: `1px solid ${ms.resolved ? S.green : S.accent}44` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>{ms.resolved ? '✅' : '🔔'}</span>
                  <span style={{ fontSize: 13, color: S.text, fontWeight: 600 }}>{ms.text}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Tag color={ms.resolved ? S.green : S.accent}>{ms.resolved ? 'Resolved' : 'Decision needed'}</Tag>
                  {isBuilder && !ms.resolved && (
                    <Btn small onClick={() => resolveMilestone(selectedPhase.id, ms.id)}>Mark resolved</Btn>
                  )}
                </div>
              </div>
              {/* Replies */}
              {ms.replies.map((r, i) => (
                <div key={i} style={{ background: S.card, borderRadius: 6, padding: '7px 10px', marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: S.accent, fontWeight: 700 }}>{r.by}: </span>
                  <span style={{ color: S.muted }}>{r.text}</span>
                </div>
              ))}
              {!ms.resolved && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input value={replyText[ms.id] || ''} onChange={e => setReplyText(t => ({ ...t, [ms.id]: e.target.value }))}
                    placeholder="Add a reply…" style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, padding: '6px 10px', color: S.text, fontSize: 12, outline: 'none' }} />
                  <Btn small variant="primary" onClick={() => {
                    if (replyText[ms.id]?.trim()) {
                      replyMilestone(selectedPhase.id, ms.id, replyText[ms.id].trim())
                      setReplyText(t => ({ ...t, [ms.id]: '' }))
                    }
                  }}>Reply</Btn>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* Unavailability list */}
      <Card>
        <SectionHead>Not available periods</SectionHead>
        {project.unavailable.length === 0 && <div style={{ color: S.muted, fontSize: 13 }}>No unavailability logged yet.</div>}
        {project.unavailable.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.surface, borderRadius: 8, padding: '9px 12px', marginBottom: 6, border: `1px solid ${S.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{u.label}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{u.start} → {u.end} · {u.party}</div>
            </div>
            {(user.role === 'admin' || (user.role === 'builder' && u.party === 'builder') || (user.role === 'client' && u.party === 'client')) && (
              <button onClick={() => deleteUnavailable(u.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 18 }}>×</button>
            )}
          </div>
        ))}
      </Card>

      {showUnavModal && (
        <Modal title="Add unavailable period" onClose={() => setShowUnavModal(false)}>
          <Input label="Description" value={newUnav.label} onChange={v => setNewUnav(u => ({ ...u, label: v }))} placeholder="e.g. Builder holiday" />
          <Input label="Start date" type="date" value={newUnav.start} onChange={v => setNewUnav(u => ({ ...u, start: v }))} />
          <Input label="End date" type="date" value={newUnav.end} onChange={v => setNewUnav(u => ({ ...u, end: v }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Party</label>
            <select value={newUnav.party} onChange={e => setNewUnav(u => ({ ...u, party: e.target.value }))}
              style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: '8px 11px', color: S.text, fontSize: 14, outline: 'none' }}>
              <option value="builder">Builder</option>
              <option value="client">Client</option>
              <option value="both">Both</option>
            </select>
          </div>
          <Btn variant="primary" style={{ width: '100%' }} disabled={!newUnav.label || !newUnav.start || !newUnav.end}
            onClick={() => { addUnavailable(newUnav); setNewUnav({ label: '', start: '', end: '', party: 'builder' }); setShowUnavModal(false) }}>
            Add period
          </Btn>
        </Modal>
      )}
    </div>
  )
}
// ── Documents view ─────────────────────────────────────────────
function DocsView() {
  const { user, docs, addDoc, deleteDoc } = useApp()
  const fileRef = useRef(null)

  return (
    <div>
      <Card>
        <SectionHead action={<Btn small variant="primary" onClick={() => fileRef.current.click()}>+ Upload document</Btn>}>Documents</SectionHead>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { addDoc(e.target.files[0]); e.target.value = '' } }} />
        {docs.length === 0 && <div style={{ color: S.muted, fontSize: 13 }}>No documents uploaded yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.surface, borderRadius: 8, padding: '10px 14px', border: `1px solid ${S.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: S.muted }}>Uploaded by {doc.uploaderName} · {doc.date} · {doc.size}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={doc.uploadedBy === 'builder' ? S.accent : S.blue}>{doc.uploadedBy}</Tag>
                {(user.role === 'admin' || user.role === doc.uploadedBy) && (
                  <button onClick={() => deleteDoc(doc.id)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ── Messenger view ─────────────────────────────────────────────
function MessengerView() {
  const { user, messages, sendMessage } = useApp()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const isAdmin = user.role === 'admin'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fmtTime = ts => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = ts => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const go = () => {
    if (!text.trim()) return
    sendMessage(text.trim())
    setText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 400 }}>
      {isAdmin && (
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: S.muted }}>
          👁 You are viewing this conversation as admin. You cannot send messages.
        </div>
      )}
      <Card style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => {
          const isMe = (user.role === 'client' && msg.from === 'client') || (user.role === 'builder' && msg.from === 'builder')
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.from === 'client' ? S.blue + '33' : S.accent + '33', border: `2px solid ${msg.from === 'client' ? S.blue : S.accent}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: msg.from === 'client' ? S.blue : S.accent, flexShrink: 0 }}>
                {msg.fromName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
                <div style={{ fontSize: 10, color: S.muted }}>{isMe ? 'You' : msg.fromName} · {fmtDate(msg.ts)} {fmtTime(msg.ts)}</div>
                <div style={{ background: isMe ? S.accent : S.surface, color: isMe ? '#0b0e16' : S.text, border: `1px solid ${isMe ? S.accent : S.border}`, borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '8px 12px', fontSize: 13, lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.muted, fontSize: 13 }}>No messages yet</div>}
        <div ref={bottomRef} />
      </Card>
      {!isAdmin && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go() } }}
            placeholder="Type a message… Enter to send, Shift+Enter for new line"
            rows={2}
            style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '9px 13px', color: S.text, fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }} />
          <Btn variant="primary" onClick={go} disabled={!text.trim()} style={{ height: 54, padding: '0 20px' }}>Send ↑</Btn>
        </div>
      )}
    </div>
  )
}
// ── App shell ──────────────────────────────────────────────────
function AppShell() {
  const { user, logout, project } = useApp()
  const [view, setView] = useState('project')

  const isBuilder = user.role === 'builder' || user.role === 'admin'
  const isClient = user.role === 'client'
  const roleColor = user.role === 'admin' ? S.purple : user.role === 'builder' ? S.accent : S.blue

  const NAV = [
    { id: 'project', label: 'Project' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
    { id: 'messages', label: 'Messages' },
    { id: 'builder', label: 'Builder' },
    { id: 'client', label: 'Client' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#0d1019', borderBottom: `1px solid ${S.border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: S.accent, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏗</div>
          <span style={{ fontWeight: 900, fontSize: 15, color: S.text, letterSpacing: '-0.02em' }}>Pocket Builder</span>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ padding: '5px 12px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: 'none', background: view === n.id ? S.accent : 'transparent', color: view === n.id ? '#0b0e16' : S.muted }}>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.text }}>{user.name}</div>
            <div style={{ fontSize: 10, color: roleColor, fontWeight: 700, textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button onClick={logout} style={{ padding: '4px 10px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, color: S.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Sign out</button>
        </div>
      </header>

      {/* Project bar */}
      <div style={{ background: '#0f1320', borderBottom: `1px solid ${S.border}`, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: S.text }}>{project.name}</div>
          <div style={{ fontSize: 11, color: S.muted }}>{project.address}</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            ['Budget', `£${Number(project.budget).toLocaleString('en-GB')}`, S.accent],
            ['Start', project.startDate, S.text],
            ['End', project.endDate, S.text],
            ['Phases', project.phases.length, S.blue],
          ].map(([label, value, color]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontWeight: 800, color, fontSize: 13, fontFamily: 'monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '22px 20px' }}>
        {view === 'project' && <ProjectView />}
        {view === 'timeline' && <TimelineView />}
        {view === 'documents' && <DocsView />}
        {view === 'messages' && <MessengerView />}
        {view === 'builder' && <BuilderView />}
        {view === 'client' && <ClientView />}
      </main>
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────
function App() {
  const { page } = useApp()
  if (page === 'marketing') return <MarketingPage />
  if (page === 'login') return <LoginPage />
  return <AppShell />
}

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}
