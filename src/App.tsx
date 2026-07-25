import { useEffect, useRef, useState } from 'react'
import LearnMode from './modes/LearnMode'
import PythonLab from './modes/PythonLab'
import CommandPalette from './components/CommandPalette'
import {
  applyTheme,
  buildShareUrl,
  getInitialTheme,
  ModeName,
  readSharedState,
  Theme,
} from './lib/prefs'
import { soundSynth } from './lib/audio'

const shared = readSharedState()

export default function App() {
  const [mode, setMode] = useState<ModeName>(shared?.mode ?? 'learn')
  const [theme, setTheme] = useState<Theme>(getInitialTheme())
  const [toast, setToast] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false)

  const codes = useRef<Record<ModeName, string>>({ learn: '', python: '' })
  const learnModeTriggerRun = useRef<(() => void) | null>(null)
  const learnModeSelectExample = useRef<((id: string) => void) | null>(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    soundSynth.setEnabled(soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  async function handleShare() {
    const url = buildShareUrl({ mode, code: codes.current[mode] })
    try {
      window.history.replaceState(null, '', url)
      await navigator.clipboard.writeText(url)
      setToast('Share link copied to clipboard')
    } catch {
      setToast('Share link is in your address bar')
    }
  }

  return (
    <div className="app">
      <div className="bg-fx" aria-hidden="true" />
      <header className="masthead-floating">
        <div className="brand">
          <div className="brand-logo-container">
            <svg className="brand-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="brand-g">Grade</span>
            <span className="brand-next-badge">Next <span className="next-arrow">❯</span></span>
            <span className="tm-badge">™</span>
          </div>
          <span className="brand-subtitle">// watch your code come alive</span>
        </div>

        <div className="masthead-spacer" />

        <div className="header-actions">
          <div className="gamify-badges">
            <div className="badge-pill streak" title="3 Day Learning Streak!">
              <span className="badge-label">STREAK</span>
              <span className="badge-num">3</span>
            </div>
            <div className="badge-pill xp" title="150 Coding XP Earned!">
              <span className="badge-label">XP</span>
              <span className="badge-num">150</span>
            </div>
          </div>

          <div className="mode-toggle-pills" role="tablist" aria-label="Choose a mode">
            <button
              role="tab"
              aria-selected={mode === 'learn'}
              className={`mode-pill ${mode === 'learn' ? 'active' : ''}`}
              onClick={() => setMode('learn')}
            >
              Learn Mode
            </button>
            <button
              role="tab"
              aria-selected={mode === 'python'}
              className={`mode-pill ${mode === 'python' ? 'active' : ''}`}
              onClick={() => setMode('python')}
            >
              Real Python
            </button>
          </div>

          <button
            className="icon-btn cmd-btn"
            onClick={() => setIsCmdOpen(true)}
            title="Open Command Palette (⌘K)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="cmd-text">⌘K</span>
          </button>

          <button
            className="icon-btn"
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? 'Mute step audio' : 'Enable step audio'}
            aria-label="Toggle step audio feedback"
          >
            {soundEnabled ? 'Audio On' : 'Audio Muted'}
          </button>

          <button className="icon-btn labeled" onClick={handleShare} title="Copy a share link">
            <span>Share</span>
          </button>

          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Toggle light / dark"
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {mode === 'learn' ? (
        <LearnMode
          seedCode={shared?.mode === 'learn' ? shared.code : undefined}
          reportCode={(c) => (codes.current.learn = c)}
          registerRun={(fn) => (learnModeTriggerRun.current = fn)}
          registerSelectExample={(fn) => (learnModeSelectExample.current = fn)}
        />
      ) : (
        <PythonLab
          seedCode={shared?.mode === 'python' ? shared.code : undefined}
          reportCode={(c) => (codes.current.python = c)}
        />
      )}

      <footer className="app-footer">
        <div className="footer-left">
          <span className="footer-brand">GradeNext™</span>
          <span className="footer-ver">v0.1.0</span>
          <span className="footer-status">
            <span className="status-dot"></span> Engine Online
          </span>
        </div>

        <div className="footer-center">
          {mode === 'learn'
            ? 'Learn Mode · Step-by-step visual execution engine for Grades 2–8'
            : 'Real Python Mode · CPython (pandas, scikit-learn, matplotlib) in browser'}
        </div>

        <div className="footer-right">
          <span className="footer-kbd"><kbd>Space</kbd> Play/Pause</span>
          <span className="footer-kbd"><kbd>←</kbd><kbd>→</kbd> Step</span>
          <span className="footer-kbd"><kbd>⌘K</kbd> Commands</span>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onRun={() => {
          if (learnModeTriggerRun.current) learnModeTriggerRun.current()
        }}
        onSelectExample={(id) => {
          if (learnModeSelectExample.current) learnModeSelectExample.current(id)
        }}
        onSelectMode={(m) => setMode(m)}
        onToggleSound={() => setSoundEnabled((s) => !s)}
      />
    </div>
  )
}
