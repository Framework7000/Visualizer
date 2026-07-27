import { useEffect, useMemo, useRef, useState } from 'react'
import { run } from '../lang/interpreter'
import { EXAMPLES, DEFAULT_EXAMPLE } from '../lang/examples'
import CodeEditor from '../components/CodeEditor'
import Stage from '../components/Stage'
import Player from '../components/Player'
import BlockPalette from '../components/BlockPalette'
import MobileNav, { MobileTab } from '../components/MobileNav'
import { loadCode, saveCode } from '../lib/prefs'
import { soundSynth } from '../lib/audio'
import { fireConfetti } from '../lib/confetti'

interface Props {
  seedCode?: string
  reportCode: (code: string) => void
  registerRun?: (fn: () => void) => void
  registerSelectExample?: (fn: (id: string) => void) => void
}

export default function LearnMode({
  seedCode,
  reportCode,
  registerRun,
  registerSelectExample,
}: Props) {
  const [code, setCode] = useState(seedCode ?? loadCode('learn') ?? DEFAULT_EXAMPLE.code)
  const [activeExample, setActiveExample] = useState(DEFAULT_EXAMPLE.id)
  const lastSelectedExampleRef = useRef(DEFAULT_EXAMPLE.id)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female')
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [showBlocks, setShowBlocks] = useState(true)

  function handleToggleVoiceGender() {
    setVoiceGender((g) => (g === 'female' ? 'male' : 'female'))
  }

  const result = useMemo(() => run(code), [code])
  const frames = result.frames
  const total = frames.length

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(total - 1, 0)))
  }, [total])

  const clampedIndex = Math.min(index, Math.max(total - 1, 0))
  const frame = total > 0 ? frames[clampedIndex] : null
  const activeLine = playing || clampedIndex > 0 || result.error ? frame?.line ?? 0 : 0
  const hasTurtle = frames.some((f) => Boolean(f.turtle))

  useEffect(() => {
    if (clampedIndex > 0) {
      soundSynth.playStep()
      if (clampedIndex === total - 1 && total > 1) {
        soundSynth.playDone()
        fireConfetti()
      }
    }
  }, [clampedIndex, total])

  const intervalRef = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) return
    const delay = 700 / speed
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

  useEffect(() => {
    saveCode('learn', code)
    reportCode(code)
  }, [code, reportCode])

  useEffect(() => {
    if (registerRun) registerRun(handleRunFromStart)
    if (registerSelectExample) registerSelectExample(loadExample)
  }, [registerRun, registerSelectExample])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === ' ') {
        e.preventDefault()
        handlePlayPause()
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

  function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id)
    if (!ex) return
    setActiveExample(id)
    lastSelectedExampleRef.current = id
    setCode(ex.code)
    setIndex(0)
    setPlaying(false)
    if (ex.id.startsWith('turtle_')) {
      setMobileTab('turtle')
    }
  }

  function handleResetExample() {
    const targetId = activeExample || lastSelectedExampleRef.current || DEFAULT_EXAMPLE.id
    const ex = EXAMPLES.find((e) => e.id === targetId) || DEFAULT_EXAMPLE
    setActiveExample(ex.id)
    setCode(ex.code)
    setIndex(0)
    setPlaying(false)
  }

  function handleCodeChange(next: string) {
    setCode(next)
    setActiveExample('')
    setIndex(0)
    setPlaying(false)
  }

  function handleInsertSnippet(snippet: string) {
    setCode((prev) => {
      const endsWithNewline = prev.endsWith('\n') || prev.length === 0
      return prev + (endsWithNewline ? '' : '\n') + snippet
    })
    setIndex(0)
    setPlaying(false)
  }

  function handlePlayPause() {
    if (total === 0) return
    if (clampedIndex >= total - 1) {
      setIndex(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }

  const visualizerSectionRef = useRef<HTMLDivElement>(null)

  function handleRunFromStart() {
    setIndex(0)
    setPlaying(true)
    if (window.innerWidth < 940) {
      setMobileTab(hasTurtle ? 'turtle' : 'visualizer')
    }
    setTimeout(() => {
      visualizerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleFixError() {
    if (!result.error) return
    const lines = code.split('\n')
    const lineIdx = result.errorLine ? result.errorLine - 1 : lines.length - 1

    if (lineIdx >= 0 && lineIdx < lines.length) {
      const errLine = lines[lineIdx]
      const match = result.error.match(/stuck at "([^"]+)"/) || result.error.match(/token "([^"]+)"/)
      
      if (match && match[1]) {
        const token = match[1]
        lines[lineIdx] = errLine.replace(token, '').trimEnd()
      } else {
        lines[lineIdx] = errLine.replace(/[^\w\s=+\-*/()%:,"'.[\]{}#]+/g, '').trimEnd()
        if (lines[lineIdx] === errLine) {
          lines[lineIdx] = `# ${errLine}`
        }
      }

      setCode(lines.join('\n'))
      soundSynth.playDone()
    }
  }

  return (
    <>
      <div className="unified-full-browser-window">
        {/* 1. CONTINUOUS CHROME / SAFARI TAB BAR ACROSS 100% FULL WIDTH AT TOP */}
        <div className="chrome-tab-header full-width-tabbar">
          <div className="chrome-tabs-list" role="tablist">
            {EXAMPLES.map((ex) => {
              const isActive = activeExample === ex.id
              const isPlayingThis = isActive && playing
              return (
                <button
                  key={ex.id}
                  className={`chrome-tab ${isActive ? 'active' : ''}`}
                  onClick={() => loadExample(ex.id)}
                  title={ex.description}
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
          <section className={`panel panel-editor ${mobileTab === 'editor' ? 'mobile-show' : ''}`}>
            <div className="editor-subhead-bar">
              <span className="editor-label-title">Your Code</span>
              <span className="lang-text-clean">Python 3.11</span>
              <div className="panel-head-spacer" />
              <button
                className="blocks-toggle-btn icon-btn"
                onClick={() => setShowBlocks((b) => !b)}
                title={showBlocks ? 'Hide Blocks' : 'Show Blocks'}
                aria-label={showBlocks ? 'Hide Blocks' : 'Show Blocks'}
              >
                {showBlocks ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            <CodeEditor code={code} onChange={handleCodeChange} activeLine={activeLine} />

            {showBlocks && <BlockPalette onInsertSnippet={handleInsertSnippet} />}

            {result.error && (
              <div className="error-banner">
                <span className="error-tag">ERROR</span>
                <span className="error-text">
                  {result.error}
                  {result.errorLine ? ` (line ${result.errorLine})` : ''}
                </span>
                <button
                  className="error-fix-btn"
                  onClick={handleFixError}
                  title="Auto-fix error line"
                  aria-label="Auto-fix error"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </button>
              </div>
            )}

            <div className="toolbar">
              <button className="btn primary glow" onClick={handleRunFromStart} disabled={total === 0}>
                Run &amp; Watch
              </button>
              <button className="btn ghost" onClick={handleResetExample}>
                Reset example
              </button>
            </div>
          </section>

          {/* Right Column: Visualiser Stage */}
          <section
            ref={visualizerSectionRef}
            className={`panel panel-visualizer ${
              mobileTab === 'visualizer' || mobileTab === 'turtle' ? 'mobile-show' : ''
            }`}
          >
            <Stage
              frame={frame}
              speed={speed}
              playing={playing}
              voiceEnabled={voiceEnabled}
              voiceGender={voiceGender}
              onToggleVoice={() => setVoiceEnabled((v) => !v)}
              activeStageTab={mobileTab === 'turtle' ? 'turtle' : undefined}
              onTabChange={(tab) => {
                if (window.innerWidth < 940) {
                  setMobileTab(tab === 'turtle' ? 'turtle' : 'visualizer')
                }
              }}
            />

            <div style={{ padding: '0 18px 16px' }}>
              <Player
                index={clampedIndex}
                total={total}
                playing={playing}
                speed={speed}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled((v) => !v)}
                voiceGender={voiceGender}
                onToggleVoiceGender={handleToggleVoiceGender}
                onPlayPause={handlePlayPause}
                onSeek={setIndex}
                onStepBack={() => setIndex((i) => Math.max(i - 1, 0))}
                onStepForward={() => setIndex((i) => Math.min(i + 1, total - 1))}
                onRestart={() => setIndex(0)}
                onSpeed={setSpeed}
              />
            </div>
          </section>
        </div>
      </div>

      <MobileNav
        activeTab={mobileTab}
        onSelectTab={(tab) => setMobileTab(tab)}
        hasTurtle={hasTurtle}
      />
    </>
  )
}
