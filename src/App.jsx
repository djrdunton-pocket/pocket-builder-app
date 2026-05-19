import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context.jsx'
import { ToastProvider } from './components/Toast.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomeView from './views/HomeView.jsx'
import TimelineView from './views/TimelineView.jsx'
import FinanceView from './views/FinanceView.jsx'
import CommsView from './views/CommsView.jsx'
import MoreView from './views/MoreView.jsx'
import { supabase } from './context.jsx'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', purple: '#a78bfa', amber: '#f59e0b'
}

const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="12" fill="#00c9a7" fillOpacity="0.15"/>
    <path d="M26 10L8 24H13V42H39V24H44L26 10Z" stroke="#00c9a7" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
    <rect x="20" y="27" width="12" height="10" rx="2" stroke="#00c9a7" strokeWidth="1.8" fill="none"/>
    <circle cx="26" cy="35.5" r="0.9" fill="#00c9a7"/>
  </svg>
)

const Inp = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }} />
  </div>
)

function TrialBanner() {
  const { trialDaysLeft, isTrialExpired, profile } = useApp()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null
  if (!profile?.trial_started_at) return null
  if (['starter', 'growth', 'pro', 'enterprise'].includes(profile?.plan_tier)) return null

  if (isTrialExpired) {
    return (
      <div style={{ background: S.red + '22', borderBottom: `1px solid ${S.red}44`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 13, color: S.red, fontWeight: 600 }}>Your trial has ended — projects are now read-only</div>
        <button style={{ padding: '6px 14px', background: S.red, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
          Choose a plan
        </button>
      </div>
    )
  }

  if (trialDaysLeft === null) return null

  const color = trialDaysLeft <= 7 ? S.red : trialDaysLeft <= 14 ? S.amber : S.accent

  return (
    <div style={{ background: color + '15', borderBottom: `1px solid ${color}33`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <div style={{ fontSize: 13, color, fontWeight: 600 }}>
        {trialDaysLeft === 0 ? 'Trial expires today' : `Free trial — ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} remaining`}
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
    </div>
  )
}

function MarketingPage() {
  const { setPage } = useApp()
  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: S.text }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: S.bg + 'f0', borderBottom: `1px solid ${S.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={34} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', color: S.text, lineHeight: 1 }}>Pocket Builder</div>
            <div style={{ fontSize: 10, color: S.accent, lineHeight: 1, marginTop: 2 }}>Construction management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage('login')} style={{ padding: '7px 16px', background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Sign In</button>
          <button onClick={() => setPage('signup')} style={{ padding: '7px 16px', background: S.accent, color: S.bg, border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Get Started Free</button>
        </div>
      </nav>

      <section style={{ padding: '90px 24px 70px', textAlign: 'center', maxWidth: 740, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.accent, background: S.accent + '18', border: `1px solid ${S.accent}44`, borderRadius: 20, padding: '4px 14px', marginBottom: 24 }}>Built for UK builders, clients &amp; suppliers</div>
        <h1 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 20px', color: S.text }}>
          Construction management<br /><span style={{ color: S.accent }}>in your pocket</span>
        </h1>
        <p style={{ fontSize: 17, color: S.muted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
          Project timelines, invoicing, P&amp;L, documents, supplier management and messaging — all in one place for builders, clients and suppliers.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('signup')} style={{ padding: '13px 28px', background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Start free trial →</button>
          <button onClick={() => setPage('login')} style={{ padding: '13px 28px', background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Sign in</button>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: S.muted }}>No credit card required · 60-day free trial</div>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            ['🏗', 'For builders', 'Manage multiple projects, track P&L, raise invoices, manage suppliers and keep clients informed.'],
            ['👤', 'Client portal', 'Clients get their own view — timeline, documents, messages and photos shared by the builder.'],
            ['🏭', 'Supplier access', 'Suppliers see what they need — chat, documents and photos shared with them. Nothing more.'],
            ['📊', 'Finance', 'Invoice clients, log supplier costs and labour. See live P&L per project at a glance.'],
            ['📅', 'Timeline', 'Phase-based project timeline with milestones, decision flags and unavailability periods.'],
            ['💬', 'Messaging', 'Separate chat threads for client and supplier. Admin can view all conversations.'],
          ].map(([ic, ti, de]) => (
            <div key={ti} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '20px 18px' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{ic}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: S.text, marginBottom: 6 }}>{ti}</div>
              <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.6 }}>{de}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '70px 24px', background: S.surface, borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: S.text, letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: S.muted, marginBottom: 32, lineHeight: 1.7 }}>Join builders across the UK managing their projects with Pocket Builder. Sign up free and create your first project in minutes.</p>
          <button onClick={() => setPage('signup')} style={{ padding: '14px 32px', background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            Get started free →
          </button>
          <div style={{ marginTop: 14, fontSize: 12, color: S.muted }}>Questions? Email us at <span style={{ color: S.accent }}>hello@pocketbuilder.co.uk</span></div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Logo size={24} />
          <span style={{ fontWeight: 900, color: S.text }}>Pocket Builder</span>
        </div>
        <div style={{ fontSize: 12, color: S.muted }}>© {new Date().getFullYear()} Pocket Builder Ltd · Registered in England & Wales</div>
      </footer>
    </div>
  )
}

function LoginPage() {
  const { signIn, setPage } = useApp()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const go = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    const result = await signIn({ email, password })
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  const sendReset = async () => {
    if (!forgotEmail) return
    setForgotLoading(true)
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'https://pocketbuilder.co.uk'
    })
    setForgotSent(true)
    setForgotLoading(false)
  }

  if (showForgot) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Logo size={56} /></div>
            <div style={{ fontSize: 24, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>Reset password</div>
            <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>We'll send you a reset link</div>
          </div>
          {forgotSent ? (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: S.text, marginBottom: 8 }}>Check your email</div>
              <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7, marginBottom: 20 }}>We've sent a reset link to {forgotEmail}. Click it to set a new password.</div>
              <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                style={{ padding: '12px 24px', background: S.accent, color: S.bg, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24 }}>
              <Inp label="Email address" value={forgotEmail} onChange={setForgotEmail} type="email" placeholder="your@email.com" />
              <button onClick={sendReset} disabled={!forgotEmail || forgotLoading}
                style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!forgotEmail || forgotLoading) ? 0.5 : 1 }}>
                {forgotLoading ? 'Sending…' : 'Send reset link →'}
              </button>
            </div>
          )}
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 13 }}>← Back to sign in</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Logo size={56} /></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>Sign in</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Welcome back to Pocket Builder</div>
        </div>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
          <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••••••" />
          <div style={{ textAlign: 'right', marginBottom: 14, marginTop: -8 }}>
            <button onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12 }}>Forgot password?</button>
          </div>
          {error && <div style={{ color: S.red, fontSize: 13, marginBottom: 12, padding: '9px 12px', background: S.red + '15', borderRadius: 8 }}>{error}</div>}
          <button onClick={go} disabled={loading} style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: S.muted }}>
          Don't have an account?{' '}
          <button onClick={() => setPage('signup')} style={{ background: 'none', border: 'none', color: S.accent, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Sign up free</button>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button onClick={() => setPage('marketing')} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 13 }}>← Back to website</button>
        </div>
      </div>
    </div>
  )
}

function SignUpPage() {
  const { signUp, setPage } = useApp()
  const [role, setRole]         = useState('builder')
  const [name, setName]         = useState('')
  const [company, setCompany]   = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const go = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    const result = await signUp({ email, password, name, role, company })
    if (!result.success) { setError(result.error); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: S.text, marginBottom: 12 }}>Account created!</div>
          <div style={{ fontSize: 14, color: S.muted, lineHeight: 1.7, marginBottom: 24 }}>
            Check your email to confirm your account, then sign in.
          </div>
          <button onClick={() => setPage('login')} style={{ padding: '12px 28px', background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            Go to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Logo size={52} /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>Create account</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>60-day free trial · No credit card required</div>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>I am a</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['builder', '🏗', 'Builder'], ['client', '👤', 'Client'], ['supplier', '🏭', 'Supplier']].map(([r, ic, lb]) => (
                <button key={r} onClick={() => setRole(r)} style={{ padding: '10px 8px', borderRadius: 10, border: `2px solid ${role === r ? S.accent : S.border}`, background: role === r ? S.accent + '22' : S.surface, color: role === r ? S.accent : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <span>{lb}</span>
                </button>
              ))}
            </div>
          </div>

          {role === 'client' && (
            <div style={{ background: S.surface, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: S.muted, lineHeight: 1.6 }}>
              💡 Once registered, your builder will link you to your project.
            </div>
          )}
          {role === 'supplier' && (
            <div style={{ background: S.surface, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: S.muted, lineHeight: 1.6 }}>
              💡 Once registered, your builder will link you to the project.
            </div>
          )}

          <Inp label="Full name" value={name} onChange={setName} placeholder="Your full name" />
          {role === 'builder' && <Inp label="Company name" value={company} onChange={setCompany} placeholder="Your company name" />}
          <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
          <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="Min. 8 characters" />
          <Inp label="Confirm password" value={confirm} onChange={setConfirm} type="password" placeholder="Repeat password" />

          {error && <div style={{ color: S.red, fontSize: 13, marginBottom: 12, padding: '9px 12px', background: S.red + '15', borderRadius: 8 }}>{error}</div>}

          <button onClick={go} disabled={loading} style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: S.muted }}>
          Already have an account?{' '}
          <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: S.accent, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Sign in</button>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button onClick={() => setPage('marketing')} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 13 }}>← Back to website</button>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordPage() {
  const { setPage } = useApp()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const save = async () => {
    if (!password || !confirm) { setError('Please enter a new password.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: S.text, marginBottom: 12 }}>Password updated!</div>
          <div style={{ fontSize: 14, color: S.muted, lineHeight: 1.7, marginBottom: 24 }}>Your password has been changed. Sign in with your new password.</div>
          <button onClick={() => setPage('login')} style={{ padding: '12px 28px', background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            Sign in →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Logo size={56} /></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: S.text, letterSpacing: '-0.02em' }}>New password</div>
          <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>Choose a strong password</div>
        </div>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <Inp label="New password" value={password} onChange={setPassword} type="password" placeholder="Min. 8 characters" />
          <Inp label="Confirm password" value={confirm} onChange={setConfirm} type="password" placeholder="Repeat password" />
          {error && <div style={{ color: S.red, fontSize: 13, marginBottom: 12, padding: '9px 12px', background: S.red + '15', borderRadius: 8 }}>{error}</div>}
          <button onClick={save} disabled={loading} style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Set new password →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PendingPage() {
  const { logout, profile } = useApp()
  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Logo size={56} /></div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: S.text, marginBottom: 12 }}>Awaiting approval</div>
        <div style={{ fontSize: 14, color: S.muted, lineHeight: 1.7, marginBottom: 28 }}>
          Hi {profile?.name?.split(' ')[0] || 'there'} — your account is being reviewed.
        </div>
        <button onClick={logout} style={{ padding: '10px 24px', background: S.surface, color: S.muted, border: `1px solid ${S.border}`, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Logo size={52} /></div>
        <div style={{ fontSize: 14, color: S.muted }}>Loading…</div>
      </div>
    </div>
  )
}

function AppShell() {
  const { activeTab, profile } = useApp()
  const isBuilder = profile?.role === 'builder' || profile?.role === 'admin'

  if (!profile) return <LoadingScreen />

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: S.text, maxWidth: 600, margin: '0 auto' }}>
      <TrialBanner />
      <div style={{ paddingBottom: 64 }}>
        {activeTab === 'home'     && <HomeView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'finance'  && isBuilder && <FinanceView />}
        {activeTab === 'finance'  && !isBuilder && <HomeView />}
        {activeTab === 'comms'    && <CommsView />}
        {activeTab === 'more'     && <MoreView />}
      </div>
      <BottomNav />
    </div>
  )
}

function AppRouter() {
  const { page, setPage, loading } = useApp()
  const [isReset, setIsReset] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      setIsReset(true)
      window.location.hash = ''
    } else if (hash && hash.includes('access_token')) {
      window.location.hash = ''
      window.location.href = 'https://pocketbuilder.co.uk'
    }
  }, [])

  if (loading)   return <LoadingScreen />
  if (isReset)   return <ResetPasswordPage />
  if (page === 'marketing') return <MarketingPage />
  if (page === 'login')     return <LoginPage />
  if (page === 'signup')    return <SignUpPage />
  if (page === 'pending')   return <PendingPage />
  return <AppShell />
}

export default function Root() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AppProvider>
  )
}