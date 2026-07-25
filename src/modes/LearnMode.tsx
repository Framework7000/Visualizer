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
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [showBlocks, setShowBlocks] = useState(true)

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
    setCode(ex.code)
    setIndex(0)
    setPlaying(false)
    if (ex.id.startsWith('turtle_')) {
      setMobileTab('turtle')
    }
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

  function handleRunFromStart() {
    setIndex(0)
    setPlaying(true)
    if (window.innerWidth < 940) {
      setMobileTab(hasTurtle ? 'turtle' : 'visualizer')
    }
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

  const currentExample = EXAMPLES.find((e) => e.id === activeExample)

  return (
    <>
      <div className={`examples mode-examples ${mobileTab === 'examples' ? 'mobile-show' : ''}`}>
        <span className="examples-label">Examples:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            className={`chip ${activeExample === ex.id ? 'active' : ''}`}
            onClick={() => loadExample(ex.id)}
            title={ex.description}
          >
            <span className="example-tag-badge">{ex.tag}</span>
            <span>{ex.title}</span>
          </button>
        ))}
      </div>

      <div className="workspace">
        {/* Left: Code Editor & Block Palette */}
        <section className={`panel panel-editor ${mobileTab === 'editor' ? 'mobile-show' : ''}`}>
          <div className="panel-head">
            <h2>Your Code</h2>
            {currentExample && <span className="grade-tag">{currentExample.grade}</span>}
            <span className="lang-tag">Python 3.11</span>
            <div className="panel-head-spacer" />
            <button
              className="icon-btn labeled sm"
              onClick={() => setShowBlocks((b) => !b)}
              title="Toggle Quick Code Blocks"
            >
              <span>{showBlocks ? 'Hide Blocks' : 'Show Blocks'}</span>
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
            <button className="btn ghost" onClick={() => loadExample(activeExample || DEFAULT_EXAMPLE.id)}>
              Reset example
            </button>
          </div>
        </section>

        {/* Right: Visualiser Stage */}
        <section
          className={`panel panel-visualizer ${
            mobileTab === 'visualizer' || mobileTab === 'turtle' ? 'mobile-show' : ''
          }`}
        >
          <div className="panel-head">
            <h2>Visualiser Stage</h2>
            <span className="grade-tag live-badge">live execution</span>
            <div className="panel-head-spacer" />
          </div>

          <Stage
            frame={frame}
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
              onPlayPause={handlePlayPause}
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
          </div>
        </section>
      </div>

      <MobileNav
        activeTab={mobileTab}
        onSelectTab={(tab) => setMobileTab(tab)}
        hasTurtle={hasTurtle}
      />
    </>
  )
}
