import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import { Theme } from '../lib/prefs'

interface PortalLayoutProps {
  theme: Theme
  onToggleTheme: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  onShare: () => void
}

export default function PortalLayout({ theme, onToggleTheme, soundEnabled, onToggleSound, onShare }: PortalLayoutProps) {
  return (
    <div className="portal-shell">
      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onShare={onShare}
      />
      <div className="portal-body">
        <main className="portal-main full-width">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
