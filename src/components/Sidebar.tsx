import { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
}

interface SidebarProps {
  exerciseCount?: number
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const SIDEBAR_WIDTH_KEY = 'gradenext:sidebar-width'
const MIN_WIDTH = 56
const DEFAULT_WIDTH = 224
const MAX_WIDTH = 320

// Nav icons
function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function WorkbenchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function WhiteboardIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> }
function FilesIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> }
function ExercisesIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
function LeaderboardIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function CollapseIcon({ flipped }: { flipped?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

export default function Sidebar({ exerciseCount = 12, collapsed: initialCollapsed = false, onCollapse }: SidebarProps) {
  const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH
  const [width, setWidth] = useState(savedWidth)
  const [collapsed, setCollapsed] = useState(savedWidth <= MIN_WIDTH + 10 || initialCollapsed)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)
  const location = useLocation()

  const navItems: NavItem[] = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    { to: '/workbench', icon: <WorkbenchIcon />, label: 'Workbench' },
    { to: '/whiteboard', icon: <WhiteboardIcon />, label: 'Whiteboard' },
    { to: '/visualiser', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>, label: 'Visualiser' },
    { to: '/files', icon: <FilesIcon />, label: 'Files' },
    { to: '/exercises', icon: <ExercisesIcon />, label: 'Exercises', badge: exerciseCount },
    { to: '/leaderboard', icon: <LeaderboardIcon />, label: 'Leaderboard' },
  ]

  const effectiveWidth = collapsed ? MIN_WIDTH : width

  // Drag-to-resize
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = effectiveWidth
  }, [effectiveWidth])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      const newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startW.current + (e.clientX - startX.current)))
      setWidth(newW)
      setCollapsed(newW <= MIN_WIDTH + 10)
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(newW))
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // Touch support for mobile (drag from bottom instead)
  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    const newW = next ? MIN_WIDTH : DEFAULT_WIDTH
    setWidth(newW)
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(newW))
    onCollapse?.(next)
  }

  return (
    <aside
      className={`portal-sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{ width: effectiveWidth }}
      aria-label="Main navigation"
    >
      {/* Collapse toggle */}
      <button className="sidebar-collapse-btn" onClick={toggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <CollapseIcon flipped={collapsed} />
      </button>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="sidebar-badge-dot" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Drag handle */}
      <div
        className="sidebar-resize-handle"
        onMouseDown={onMouseDown}
        title="Drag to resize"
      />
    </aside>
  )
}
