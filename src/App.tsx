import { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LearnMode from './modes/LearnMode'
import PythonLab from './modes/PythonLab'
import CommandPalette from './components/CommandPalette'
import ShareModal from './components/ShareModal'
import PortalLayout from './components/PortalLayout'
import { AuthProvider } from './lib/auth'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import WorkbenchPage from './pages/WorkbenchPage'
import WhiteboardPage from './pages/WhiteboardPage'
import FilesPage from './pages/FilesPage'
import ExercisesPage from './pages/ExercisesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import {
  applyTheme,
  getInitialTheme,
  ModeName,
  readSharedState,
  Theme,
} from './lib/prefs'

const shared = readSharedState()

// Visualiser page: sleek Learn + Python modes with rich top control header
function VisualiserPage({
  mode, setMode, codes, learnModeTriggerRun, learnModeSelectExample,
}: {
  mode: ModeName
  setMode: (m: ModeName) => void
  codes: React.MutableRefObject<Record<ModeName, string>>
  learnModeTriggerRun: React.MutableRefObject<(() => void) | null>
  learnModeSelectExample: React.MutableRefObject<((id: string) => void) | null>
}) {
  const [tabOrder, setTabOrder] = useState<ModeName[]>(['learn', 'python'])
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null)

  const handleTabDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTabIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTabDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleTabDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedTabIdx === null || draggedTabIdx === dropIndex) {
      setDraggedTabIdx(null)
      return
    }
    const updated = [...tabOrder]
    const [moved] = updated.splice(draggedTabIdx, 1)
    updated.splice(dropIndex, 0, moved)
    setTabOrder(updated)
    setDraggedTabIdx(null)
  }

  const activeTabIdx = tabOrder.indexOf(mode)

  return (
    <div className="visualiser-page-container">
      <div className="chrome-safari-top-tabstrip">
        <div className="chrome-tabstrip-container">
          {/* Animated sliding background indicator pill */}
          <div
            className="chrome-tab-slider"
            style={{
              left: activeTabIdx === 0 ? '4px' : 'calc(50% + 2px)',
              width: 'calc(50% - 6px)',
            }}
          />

          {tabOrder.map((tMode, idx) => (
            <button
              key={tMode}
              role="tab"
              aria-selected={mode === tMode}
              draggable={true}
              onDragStart={(e) => handleTabDragStart(e, idx)}
              onDragOver={handleTabDragOver}
              onDrop={(e) => handleTabDrop(e, idx)}
              className={`chrome-top-tab ${mode === tMode ? 'active' : ''} ${draggedTabIdx === idx ? 'is-dragging-tab' : ''}`}
              onClick={() => setMode(tMode)}
            >
              {tMode === 'learn' ? (
                <>
                  <svg className="chrome-tab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  <span className="chrome-tab-title">Learn</span>
                </>
              ) : (
                <>
                  <svg className="chrome-tab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span className="chrome-tab-title">Real Python</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<ModeName>(shared?.mode ?? 'learn')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const codes = useRef<Record<ModeName, string>>({
    learn: shared?.mode === 'learn' ? shared.code : '',
    python: shared?.mode === 'python' ? shared.code : '',
  })
  const learnModeTriggerRun = useRef<(() => void) | null>(null)
  const learnModeSelectExample = useRef<((id: string) => void) | null>(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function toggleSound() {
    setSoundEnabled((s) => !s)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            element={
              <PortalLayout
                theme={theme}
                onToggleTheme={toggleTheme}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                onShare={() => setShareOpen(true)}
              />
            }
          >
            <Route index element={<HomePage />} />
            <Route
              path="visualiser"
              element={
                <VisualiserPage
                  mode={mode}
                  setMode={setMode}
                  codes={codes}
                  learnModeTriggerRun={learnModeTriggerRun}
                  learnModeSelectExample={learnModeSelectExample}
                />
              }
            />
            <Route path="workbench" element={<WorkbenchPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="whiteboard" element={<WhiteboardPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onRun={() => {
            if (mode === 'learn') learnModeTriggerRun.current?.()
          }}
          onSelectExample={(id) => {
            if (mode === 'learn') learnModeSelectExample.current?.(id)
          }}
          onSelectMode={setMode}
          onToggleSound={toggleSound}
        />

        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          streak={3}
          xp={150}
          mode={mode}
          theme={theme}
        />
      </HashRouter>
    </AuthProvider>
  )
}
