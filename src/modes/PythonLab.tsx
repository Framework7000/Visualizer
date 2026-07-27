import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import CodeEditor from '../components/CodeEditor'
import Stage from '../components/Stage'
import Player from '../components/Player'
import TreeView from '../components/TreeView'
import { PY_EXAMPLES, DEFAULT_PY_EXAMPLE } from '../python/examples'
import { runPython, PyRunResult } from '../python/pyodideRunner'
import { loadCode, saveCode } from '../lib/prefs'
import { soundSynth } from '../lib/audio'
import { fireConfetti } from '../lib/confetti'

interface Props {
  seedCode?: string
  reportCode: (code: string) => void
}

// "Real Python" mode: runs genuine Python (numpy, pandas, scikit-learn,
// matplotlib) in the browser via Pyodide, traces it line-by-line, and replays
// it in the SAME animated visualiser as Learn mode — plus charts and console.
export default function PythonLab({ seedCode, reportCode }: Props) {
  const [code, setCode] = useState(seedCode ?? loadCode('python') ?? DEFAULT_PY_EXAMPLE.code)
  const [activeExample, setActiveExample] = useState(DEFAULT_PY_EXAMPLE.id)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<PyRunResult | null>(null)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female')

  function handleToggleVoiceGender() {
    setVoiceGender((g) => (g === 'female' ? 'male' : 'female'))
  }

  const frames = result?.frames ?? []
  const total = frames.length
  const clampedIndex = Math.min(index, Math.max(total - 1, 0))
  const frame = total > 0 ? frames[clampedIndex] : null
  const activeLine = frame?.line ?? 0

  // Playback timer: advance frames while "playing".
  const intervalRef = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) return
    const delay = 650 / speed
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= total - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, delay)
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [playing, speed, total])

  // Sound effects on step change
  useEffect(() => {
    if (clampedIndex > 0) {
      soundSynth.playStep()
      if (clampedIndex === total - 1 && total > 1) {
        soundSynth.playDone()
        fireConfetti()
      }
    }
  }, [clampedIndex, total])

  // Autosave + report code for the Share button.
  useEffect(() => {
    saveCode('python', code)
    reportCode(code)
  }, [code, reportCode])

  function togglePlay() {
    if (total === 0) return
    if (clampedIndex >= total - 1) {
      setIndex(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }

  // Keyboard shortcuts for playback (ignored while typing in the editor).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (total === 0) return
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setPlaying(false)
        setIndex((i) => Math.min(total - 1, i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPlaying(false)
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total, clampedIndex])

  const visualizerPanelRef = useRef<HTMLDivElement>(null)

  async function handleRun() {
    setRunning(true)
    setPlaying(false)
    setResult(null)
    setIndex(0)
    setStatus('Getting Python ready…')
    
    // Smooth auto scroll to Visualiser stage so animation is immediately visible
    setTimeout(() => {
      visualizerPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    const res = await runPython(code, setStatus)
    setResult(res)
    setStatus('')
    setRunning(false)
    setIndex(0)
    if (res.frames.length > 1) setPlaying(true)
  }

  function loadExample(id: string) {
    const ex = PY_EXAMPLES.find((e) => e.id === id)
    if (!ex) return
    setActiveExample(id)
    setCode(ex.code)
    setResult(null)
    setIndex(0)
    setPlaying(false)
  }

  return (
    <>
      <div className="unified-full-browser-window">
        {/* 1. CONTINUOUS CHROME / SAFARI TAB BAR ACROSS 100% FULL WIDTH AT TOP */}
        <div className="chrome-tab-header full-width-tabbar">
          <div className="chrome-tabs-list" role="tablist">
            {PY_EXAMPLES.map((ex) => {
              const isActive = activeExample === ex.id
              const isPlayingThis = isActive && (running || playing)
              return (
                <button
                  key={ex.id}
                  className={`chrome-tab ${isActive ? 'active' : ''}`}
                  onClick={() => loadExample(ex.id)}
                  title={ex.tag}
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="chrome-tab-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </span>
                  <span className="chrome-tab-title">{ex.title}</span>
                  {isPlayingThis && (
                    <span className="live-playing-dot" title="Running execution animation" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. COMBINED 50-50 WORKSPACE BODY INSIDE SINGLE WINDOW */}
        <div className="unified-window-body">
          {/* Left Column: Code Editor */}
          <section className="panel panel-editor">
            <div className="editor-subhead-bar">
              <span className="editor-label-title">Python Code</span>
              <span className="lang-text-clean">Python 3.11</span>
            </div>

            <CodeEditor
              code={code}
              onChange={(c) => {
                setCode(c)
                setActiveExample('')
              }}
              activeLine={activeLine}
            />

            <div className="toolbar">
              <button className="btn primary" onClick={handleRun} disabled={running}>
                {running ? (
                  <>
                    <span className="wb-run-spinner" />
                    <span>Running…</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    <span>Run &amp; Visualise</span>
                  </>
                )}
              </button>
              <button
                className="btn ghost"
                onClick={() => loadExample(activeExample || DEFAULT_PY_EXAMPLE.id)}
                disabled={running}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Reset</span>
              </button>
            </div>
          </section>

          {/* Right Column: Visualiser Stage */}
          <section className="panel panel-visualizer" ref={visualizerPanelRef}>
            {running && (
              <div className="py-results">
                <motion.div
                  className="py-loading-hero"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="py-spinner-pulse" />
                  <div className="py-loading-text">
                    <div className="py-loading-title">{status || 'Compiling Python & Loading Packages…'}</div>
                    <div className="py-loading-sub">Running Pyodide CPython engine in browser</div>
                  </div>
                  <div className="py-loading-bar-track">
                    <div className="py-loading-bar-fill" />
                  </div>
                </motion.div>
              </div>
            )}

            {!running && !result && (
              <div className="py-results-empty">
                <div className="empty-hero-minimal">
                  <div className="minimal-hint-text">
                    Press{' '}
                    <span className="kbd-glow python">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Run &amp; Visualise
                    </span>{' '}
                    to start
                  </div>
                </div>
              </div>
            )}

            {!running && result && total === 0 && result.error && (
              <div className="py-results">
                <pre className="py-error">{result.error}</pre>
              </div>
            )}

            {!running && result && total > 0 && (
              <>
                <Stage
                  frame={frame}
                  speed={speed}
                  playing={playing}
                  voiceEnabled={voiceEnabled}
                  voiceGender={voiceGender}
                  onToggleVoice={() => setVoiceEnabled((v) => !v)}
                  aboveVars={
                    result.tree.length > 1 ? (
                      <TreeView
                        nodes={result.tree}
                        currentIndex={clampedIndex}
                        activeId={frame?.nodeId ?? -1}
                      />
                    ) : null
                  }
                />

                <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Player
                    index={clampedIndex}
                    total={total}
                    playing={playing}
                    speed={speed}
                    voiceEnabled={voiceEnabled}
                    onToggleVoice={() => setVoiceEnabled((v) => !v)}
                    voiceGender={voiceGender}
                    onToggleVoiceGender={handleToggleVoiceGender}
                    onPlayPause={togglePlay}
                    onSeek={(i) => {
                      setPlaying(false)
                      setIndex(i)
                    }}
                    onStepBack={() => {
                      setPlaying(false)
                      setIndex((i) => Math.max(0, i - 1))
                    }}
                    onStepForward={() => {
                      setPlaying(false)
                      setIndex((i) => Math.min(total - 1, i + 1))
                    }}
                    onRestart={() => {
                      setPlaying(false)
                      setIndex(0)
                    }}
                    onSpeed={setSpeed}
                  />

                  {result.truncated && (
                    <div className="py-note">
                      This program has many steps — showing the first {total} so it stays smooth.
                    </div>
                  )}

                  {result.error && <pre className="py-error">{result.error}</pre>}

                  {result.images.length > 0 && (
                    <>
                      <div className="stage-section-title">Charts</div>
                      <div className="py-plots">
                        {result.images.map((img, i) => (
                          <motion.div
                            key={i}
                            className="py-plot-card"
                            initial={{ opacity: 0, scale: 0.82, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                          >
                            <div className="plot-badge-pill">📊 Matplotlib Figure</div>
                            <div className="plot-glass-sheen" />
                            <img src={`data:image/png;base64,${img}`} alt={`chart ${i + 1}`} />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
