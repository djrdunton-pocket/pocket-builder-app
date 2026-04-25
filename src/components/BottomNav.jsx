import { useApp } from '../context'

const S = {
  bg: '#0d1525', border: '#1e2d47', accent: '#00c9a7',
  text: '#f0f4ff', muted: '#5a7a9a', red: '#ef4444'
}

const NAV_BUILDER = [
  { id: 'home',     label: 'Projects', icon: HomeIcon },
  { id: 'timeline', label: 'Timeline', icon: TimelineIcon },
  { id: 'finance',  label: 'Finance',  icon: FinanceIcon },
  { id: 'comms',    label: 'Comms',    icon: CommsIcon },
  { id: 'more',     label: 'More',     icon: MoreIcon },
]

const NAV_CLIENT = [
  { id: 'home',     label: 'Project',  icon: HomeIcon },
  { id: 'timeline', label: 'Timeline', icon: TimelineIcon },
  { id: 'comms',    label: 'Comms',    icon: CommsIcon },
  { id: 'more',     label: 'More',     icon: MoreIcon },
]

const NAV_SUPPLIER = [
  { id: 'home',  label: 'Project', icon: HomeIcon },
  { id: 'comms', label: 'Comms',   icon: CommsIcon },
  { id: 'more',  label: 'More',    icon: MoreIcon },
]

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 4L21 12V20C21 20.6 20.6 21 20 21H15V16H9V21H4C3.4 21 3 20.6 3 20V12Z"
        stroke={active ? S.accent : S.muted} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function TimelineIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="3" rx="1.5" fill={active ? S.accent : S.muted} opacity="0.9"/>
      <rect x="3" y="11" width="13" height="3" rx="1.5" fill={active ? S.accent : S.muted} opacity="0.6"/>
      <rect x="3" y="16" width="16" height="3" rx="1.5" fill={active ? S.accent : S.muted} opacity="0.75"/>
    </svg>
  )
}

function FinanceIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={active ? S.accent : S.muted} strokeWidth="1.8" fill="none"/>
      <path d="M16 3H8L2 7H22L16 3Z" stroke={active ? S.accent : S.muted} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <path d="M12 12V17M10 14H14" stroke={active ? S.accent : S.muted} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function CommsIcon({ active, badge }) {
  return (
    <div style={{ position: 'relative', width: 22, height: 22 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15C21 15.6 20.6 16 20 16H7L3 20V5C3 4.4 3.4 4 4 4H20C20.6 4 21 4.4 21 5V15Z"
          stroke={active ? S.accent : S.muted} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      </svg>
      {badge > 0 && (
        <div style={{ position: 'absolute', top: -4, right: -4, background: S.red, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </div>
  )
}

function MoreIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5"  r="1.5" fill={active ? S.accent : S.muted}/>
      <circle cx="12" cy="12" r="1.5" fill={active ? S.accent : S.muted}/>
      <circle cx="12" cy="19" r="1.5" fill={active ? S.accent : S.muted}/>
    </svg>
  )
}

export default function BottomNav() {
  const { user, activeTab, setActiveTab, totalUnread } = useApp()
  if (!user) return null

  const NAV = user.role === 'client' ? NAV_CLIENT
    : user.role === 'supplier' ? NAV_SUPPLIER
    : NAV_BUILDER

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: S.bg, borderTop: `1px solid ${S.border}`,
      display: 'flex', height: 64,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const active = activeTab === item.id
        const badge = item.id === 'comms' ? totalUnread : 0
        return (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minHeight: 44 }}>
            <item.icon active={active} badge={badge} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? S.accent : S.muted, letterSpacing: '0.02em' }}>
              {item.label}
            </span>
            {active && <div style={{ position: 'absolute', bottom: 0, width: 24, height: 2, background: S.accent, borderRadius: 1 }}/>}
          </button>
        )
      })}
    </nav>
  )
}