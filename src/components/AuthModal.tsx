import { useState } from 'react'
import { useAuth } from '../lib/auth'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'mentor'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password, role)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-header">
          <div className="auth-logo-row">
            <svg width="28" height="28" viewBox="0 0 512 512" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="am-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8E5BFF"/>
                  <stop offset="100%" stopColor="#38BDF8"/>
                </linearGradient>
              </defs>
              <path d="M256 40 L440 150 L256 260 L72 150 Z" fill="url(#am-grad)"/>
              <path d="M128 185 V 260 C 128 260 185 310 256 310 C 327 310 384 260 384 260 V 185" fill="url(#am-grad)" opacity="0.75"/>
            </svg>
            <span className="auth-brand">GradeNext</span>
          </div>
          <h2 className="auth-title">{tab === 'login' ? 'Welcome back' : 'Create account'}</h2>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Register</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Aryan Singh" required autoComplete="name" />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.com" required autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete={tab === 'login' ? 'current-password' : 'new-password'} minLength={6} />
          </div>
          {tab === 'register' && (
            <div className="auth-field">
              <label>I am a</label>
              <div className="auth-role-pills">
                <button type="button" className={`role-pill ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>🎓 Student</button>
                <button type="button" className={`role-pill ${role === 'mentor' ? 'active' : ''}`} onClick={() => setRole('mentor')}>📚 Mentor</button>
              </div>
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button className="auth-close-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  )
}
