import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import AuthModal from './AuthModal'
import GradeNextLogo from './Logo'
import { Theme } from '../lib/prefs'

interface TopBarProps {
  theme: Theme
  onToggleTheme: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  onShare: () => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

// Icons
function HomeIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function WorkbenchIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function WhiteboardIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> }
function VisualiserIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function FilesIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> }
function ExercisesIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
function LeaderboardIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function DashboardIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg> }

export default function TopBar({ theme, onToggleTheme, soundEnabled, onToggleSound, onShare }: TopBarProps) {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const navItems: NavItem[] = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    { to: '/workbench', label: 'Workbench', icon: <WorkbenchIcon /> },
    { to: '/whiteboard', label: 'Whiteboard', icon: <WhiteboardIcon /> },
    { to: '/visualiser', label: 'Visualiser', icon: <VisualiserIcon /> },
    { to: '/files', label: 'Files', icon: <FilesIcon /> },
    { to: '/exercises', label: 'Exercises', icon: <ExercisesIcon />, badge: 12 },
    { to: '/leaderboard', label: 'Leaderboard', icon: <LeaderboardIcon /> },
  ]

  return (
    <>
      <header className="portal-topbar">
        {/* Left: Brand Logo */}
        <div className="topbar-left">
          <Link to="/" title="GradeNext Home">
            <GradeNextLogo height={38} />
          </Link>
        </div>

        {/* Center: Main Navigation */}
        <nav className="topbar-inline-nav" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `top-nav-icon-only ${isActive ? 'active' : ''}`}
              title={item.label}
              aria-label={item.label}
            >
              <span className="top-nav-icon">{item.icon}</span>
              {item.badge !== undefined && (
                <span className="top-nav-badge-superscript">{item.badge}</span>
              )}
            </NavLink>
          ))}

          {/* DASHBOARD ICON-ONLY BUTTON */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `top-nav-icon-only dashboard-btn ${isActive ? 'active' : ''}`}
            title="Student Performance Dashboard"
            aria-label="Student Performance Dashboard"
          >
            <span className="top-nav-icon"><DashboardIcon /></span>
            <span className="dashboard-glow-dot" />
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="topbar-right">
          {/* Streak + XP */}
          <div className="gamify-symbolic" title={`${user?.streak ?? 3} Day Streak · ${user?.xp ?? 150} XP`}>
            <span className="gamify-stat streak">
              <svg className="flame-icon" width="15" height="15" viewBox="0 0 24 24"><path d="M12 2C10.5 4.5 9 6.5 9 9C9 12 11 14 13 14C14.5 14 16 13 16.5 11.5C18 13.5 18 16 16.5 18.5C15 21 12.5 22 10 22C6.5 22 4 19 4 15C4 10 8 5.5 12 2Z"/></svg>
              <span>{user?.streak ?? 3}</span>
            </span>
            <span className="stat-divider" />
            <span className="gamify-stat xp">
              <svg className="zap-icon" width="15" height="15" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>{user?.xp ?? 150}</span>
            </span>
          </div>

          {/* Sound */}
          <button className="icon-btn" onClick={onToggleSound} title={soundEnabled ? 'Mute' : 'Unmute'} aria-label="Toggle sound">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {soundEnabled ? (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></>) : (<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>)}
            </svg>
          </button>

          {/* Share */}
          <button className="icon-btn" onClick={onShare} title="Share code" aria-label="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>

          {/* Theme */}
          <button className="icon-btn" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {theme === 'dark' ? (<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>) : (<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>)}
            </svg>
          </button>

          {/* Auth Avatar / Sign In */}
          {user ? (
            <div className="topbar-avatar-wrap" style={{ position: 'relative' }}>
              <button className="topbar-avatar" onClick={() => setProfileOpen(p => !p)} title={user.displayName}>
                {user.displayName.charAt(0).toUpperCase()}
              </button>
              {profileOpen && (
                <div className="topbar-profile-menu">
                  <div className="profile-name">{user.displayName}</div>
                  <div className="profile-email">{user.email}</div>
                  <div className="profile-role">{user.role === 'mentor' ? '📚 Mentor' : '🎓 Student'}</div>
                  <hr className="profile-divider" />
                  <button className="profile-logout" onClick={() => { logout(); setProfileOpen(false) }}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="topbar-login-btn" onClick={() => setAuthOpen(true)}>Sign In</button>
          )}
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
