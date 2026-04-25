import { AppProvider, useApp } from './context'
import BottomNav from './components/BottomNav'
import HomeView from './views/HomeView'
import TimelineView from './views/TimelineView'
import FinanceView from './views/FinanceView'
import CommsView from './views/CommsView'
import MoreView from './views/MoreView'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', purple: '#a78bfa'
}

const USERS = [
  { id: 'u1', name: 'James Hartley',    email: 'admin@pocketbuilder.co',    role: 'admin'    },
  { id: 'u2', name: 'Sarah Mitchell',   email: 'builder@pocketbuilder.co',  role: 'builder'  },
  { id: 'u3', name: 'Mr & Mrs Johnson', email: 'client@pocketbuilder.co',   role: 'client'   },
  { id: 'u4', name: 'Dave Reynolds',    email: 'supplier@pocketbuilder.co', role: 'supplier' },
]

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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="56" height="56" viewBox="0 0 52 52" fill="none">
              <rect width="52" height="52" rx="12" fill="#00c9a7" fillOpacity="0.15"/>
              <path d="M26 10L8 24H13V42H39V24H44L26 10Z" stroke="#00c9a7" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
              <rect x="20" y="27" width="12" height="10" rx="2" stroke="#00c9a7" strokeWidth="1.8" fill="none"/>
              <circle cx="26" cy="35.5" r="0.9" fill="#00c9a7"/>
            </svg>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>Pocket Builder</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Construction management in your pocket</div>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Email address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder="your@email.com"
              style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '13px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ color: S.red, fontSize: 13, marginBottom: 12, padding: '9px 12px', background: S.red + '15', borderRadius: 8 }}>{error}</div>}
          <button onClick={go} style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            Sign in →
          </button>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Demo accounts — tap to fill</div>
          {USERS.map(u => {
            const c = u.role === 'admin' ? S.purple : u.role === 'builder' ? S.accent : u.role === 'supplier' ? '#f59e0b' : S.blue
            return (
              <button key={u.id} onClick={() => setEmail(u.email)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '11px 14px', cursor: 'pointer', width: '100%', marginBottom: 8, minHeight: 56 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: S.muted }}>{u.email}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: c, background: c + '22', border: `1px solid ${c}44`, flexShrink: 0 }}>{u.role}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const { activeTab, user } = useApp()
  const isBuilder = user?.role === 'builder' || user?.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: S.text, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ paddingBottom: 64 }}>
        {activeTab === 'home'     && <HomeView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'finance'  && isBuilder && <FinanceView />}
        {activeTab === 'comms'    && <CommsView />}
        {activeTab === 'more'     && <MoreView />}
      </div>
      <BottomNav />
    </div>
  )
}

function AppRouter() {
  const { page } = useApp()
  if (page === 'login' || page === 'marketing') return <LoginPage />
  return <AppShell />
}

import { useState } from 'react'

export default function Root() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}