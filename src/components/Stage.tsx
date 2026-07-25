import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Frame, StepKind } from '../lang/types'
import VariablesPanel from './VariablesPanel'
import Console from './Console'
import TurtleCanvas from './TurtleCanvas'

interface Props {
  frame: Frame | null
  aboveVars?: ReactNode // optional extra viz (e.g. recursion tree)
  activeStageTab?: 'memory' | 'turtle'
  onTabChange?: (tab: 'memory' | 'turtle') => void
}

const ICONS: Record<StepKind, string> = {
  start: '🎬',
  assign: '📦',
  print: '🖨️',
  check: '🤔',
  loop: '🔁',
  update: '✏️',
  done: '🎉',
}

// The right-hand "movie screen": call stack, narration, live variables, turtle canvas, console.
export default function Stage({ frame, aboveVars, activeStageTab, onTabChange }: Props) {
  const vars = frame?.vars ?? {}
  const accesses = frame?.accesses ?? []
  const output = frame?.output ?? []
  const note = frame?.note ?? 'Press play to watch your code come alive.'
  const kind = frame?.kind ?? 'start'
  const stack = frame?.stack ?? []
  const hasTurtle = Boolean(frame?.turtle)

  const [view, setView] = useState<'memory' | 'turtle'>('memory')

  const currentView = activeStageTab ?? view
  const setStageView = (v: 'memory' | 'turtle') => {
    setView(v)
    if (onTabChange) onTabChange(v)
  }

  // Automatically switch view to turtle when turtle drawing is active
  useEffect(() => {
    if (hasTurtle && !activeStageTab) {
      setView('turtle')
    }
  }, [hasTurtle, activeStageTab])

  return (
    <div className="stage">
      <motion.div
        className="narration"
        key={note}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="icon">{ICONS[kind]}</div>
        <div className="text">{note}</div>
        {frame && frame.line > 0 && <div className="line-badge">line {frame.line}</div>}
      </motion.div>

      {stack.length > 0 && (
        <div className="callstack">
          <span className="callstack-label">call stack</span>
          <AnimatePresence initial={false}>
            {stack.map((fn, i) => (
              <motion.span
                key={`${fn}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`callstack-frame ${i === stack.length - 1 ? 'current' : ''}`}
              >
                {fn}()
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stage Tab Switcher if Turtle graphics are present */}
      {hasTurtle && (
        <div className="stage-tabs">
          <button
            className={`stage-tab-btn ${currentView === 'turtle' ? 'active' : ''}`}
            onClick={() => setStageView('turtle')}
          >
            🐢 Turtle Canvas
          </button>
          <button
            className={`stage-tab-btn ${currentView === 'memory' ? 'active' : ''}`}
            onClick={() => setStageView('memory')}
          >
            📦 Memory Grid
          </button>
        </div>
      )}

      {aboveVars}

      {hasTurtle && currentView === 'turtle' ? (
        <TurtleCanvas turtle={frame?.turtle} />
      ) : (
        <>
          <div className="stage-section-title">Variables — the computer's memory</div>
          <VariablesPanel vars={vars} accesses={accesses} />
        </>
      )}

      <div className="stage-section-title">Output screen</div>
      <Console lines={output} />
    </div>
  )
}
