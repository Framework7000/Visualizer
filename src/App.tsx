import { useEffect, useRef, useState } from 'react'
import LearnMode from './modes/LearnMode'
import PythonLab from './modes/PythonLab'
import CommandPalette from './components/CommandPalette'
import GradeNextLogo from './components/Logo'
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
        <GradeNextLogo height={34} />

        <div className="masthead-spacer" />

        <div className="header-actions">
          {/* Symbolic Vector Gamification Pill */}
          <div className="gamify-symbolic" title="3 Day Streak · 150 XP">
            <span className="gamify-stat streak">
              <svg className="flame-icon" width="13" height="13" viewBox="0 0 24 24">
                <path d="M12 2C10.5 4.5 9 6.5 9 9C9 12 11 14 13 14C14.5 14 16 13 16.5 11.5C18 13.5 18 16 16.5 18.5C15 21 12.5 22 10 22C6.5 22 4 19 4 15C4 10 8 5.5 12 2Z"/>
              </svg>
              <span>3</span>
            </span>
            <span className="stat-divider" />
            <span className="gamify-stat xp">
              <svg className="zap-icon" width="13" height="13" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>150</span>
            </span>
          </div>

          <div className="mode-toggle-pills" role="tablist" aria-label="Choose a mode">
            <button
              role="tab"
              aria-selected={mode === 'learn'}
              className={`mode-pill ${mode === 'learn' ? 'active' : ''}`}
              onClick={() => setMode('learn')}
            >
              Learn
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
            title="Search Commands (⌘K)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="cmd-text">⌘K</span>
          </button>

          <button
            className="icon-btn"
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            aria-label="Toggle step audio"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {soundEnabled ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </>
              )}
            </svg>
          </button>

          <button className="icon-btn" onClick={handleShare} title="Copy share link" aria-label="Share code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>

          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Toggle Theme"
            aria-label="Toggle theme"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {theme === 'dark' ? (
                <>
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              )}
            </svg>
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
