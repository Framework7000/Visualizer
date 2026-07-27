import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Frame, StepKind } from '../lang/types'
import { speakText, stopSpeech } from '../lib/audio'
import VariablesPanel from './VariablesPanel'
import Console from './Console'
import TurtleCanvas from './TurtleCanvas'

interface Props {
  frame: Frame | null
  aboveVars?: ReactNode
  activeStageTab?: 'memory' | 'turtle'
  onTabChange?: (tab: 'memory' | 'turtle') => void
  speed?: number
  playing?: boolean
  voiceEnabled?: boolean
  onToggleVoice?: () => void
  voiceGender?: 'female' | 'male'
}

const STEP_LABELS: Record<StepKind, string> = {
  start: 'START',
  assign: 'SET',
  print: 'PRINT',
  check: 'CHECK',
  loop: 'LOOP',
  update: 'UPDATE',
  done: 'DONE',
}

// Speed-tailored Kid-Friendly Teacher Lesson Script Generator (Unique content & timing for 0.5x vs 1x)
function generateFullAlgorithmLessonScript(note: string, speed: number): string {
  const lower = note.toLowerCase()
  const isSlowSpeed = speed <= 0.5

  if (lower.includes('fib') || lower.includes('fibonacci')) {
    if (isSlowSpeed) {
      return 'Hello there, young coders! Today we are discovering the magic Fibonacci number pattern. In this sequence, every new number is created by simply adding the last two numbers together! At this calm pace, watch closely as computer memory calculates and updates each step for us!'
    }
    return 'Hello coders! Today we are building the famous Fibonacci pattern, where each number is the sum of the two preceding numbers. Watch computer memory calculate each value!'
  }

  if (lower.includes('sort') || lower.includes('bubble') || lower.includes('swap')) {
    if (isSlowSpeed) {
      return 'Welcome to Bubble Sort! Imagine numbers playing a fun game where neighboring numbers compare values and swap places if they are out of order! Watch how the largest numbers gradually bubble up to the end until our list is standing perfectly in order from smallest to biggest.'
    }
    return 'Welcome to Bubble Sort! Watch neighboring numbers compare values and swap places until our list is sorted from smallest to largest!'
  }

  if (lower.includes('star') || lower.includes('*') || lower.includes('count')) {
    if (isSlowSpeed) {
      return 'In this fun lesson, we are using loops like building blocks to draw star patterns line by line on screen. Outer loops count the rows while inner loops place each star. Watch how every star appears in order as our code executes!'
    }
    return 'In this lesson, we use loops to draw star patterns line by line on screen! Watch how each star appears in sequence as variables update.'
  }

  if (lower.includes('turtle') || lower.includes('forward') || lower.includes('angle')) {
    if (isSlowSpeed) {
      return 'Welcome to Turtle Graphics! Our friendly digital turtle moves across the screen using mathematical angles and pen strokes to draw geometric art. Watch closely as it glides along its path and leaves a bright, colorful trail on the canvas!'
    }
    return 'Welcome to Turtle Graphics! Watch our friendly turtle use math angles and pen strokes to draw colorful geometric shapes on screen!'
  }

  // General fallback
  if (isSlowSpeed) {
    return 'Welcome to GradeNext Code Visualiser! Together we are going to explore how computer memory works step by step. Watch variables update, functions enter the call stack, and outputs print live on screen!'
  }

  return 'Welcome coders! Let us watch how computer memory updates variables step by step as our program runs!'
}

// Map animation playback speed (0.5, 1) to SpeechSynthesisUtterance rate
function calcSpeechRate(spd: number = 1): number {
  if (spd <= 0.5) return 0.70 // Smooth, clear 0.5x voice rate
  return 0.95                 // Smooth, natural 1x voice rate
}

export default function Stage({
  frame,
  aboveVars,
  activeStageTab,
  onTabChange,
  speed = 0.5,
  playing = false,
  voiceEnabled = false,
  voiceGender = 'female',
}: Props) {
  const vars = frame?.vars ?? {}
  const accesses = frame?.accesses ?? []
  const output = frame?.output ?? []
  const note = frame?.note ?? 'Press play to watch your code come alive.'
  const kind = frame?.kind ?? 'start'
  const stack = frame?.stack ?? []
  const hasTurtle = Boolean(frame?.turtle)

  const [view, setView] = useState<'memory' | 'turtle'>('memory')

  const voiceDisabled = speed >= 2
  const currentView = activeStageTab ?? view
  const setStageView = (v: 'memory' | 'turtle') => {
    setView(v)
    if (onTabChange) onTabChange(v)
  }

  useEffect(() => {
    if (hasTurtle && !activeStageTab) {
      setView('turtle')
    }
  }, [hasTurtle, activeStageTab])

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech()
    }
  }, [])

  // SINGLE CONTINUOUS VOICE: Triggers ONCE when Play starts (No step-by-step re-triggering!)
  useEffect(() => {
    if (playing && voiceEnabled && !voiceDisabled) {
      const fullScript = generateFullAlgorithmLessonScript(frame?.note ?? '', speed)
      const currentRate = calcSpeechRate(speed)
      speakText(fullScript, currentRate, voiceGender)
    } else if (!playing) {
      stopSpeech()
    }
  }, [playing, speed, voiceEnabled, voiceDisabled, voiceGender])

  return (
    <div className="stage">
      <div className="narration">
        <span className={`step-tag-pill kind-${kind}`}>{STEP_LABELS[kind]}</span>
        <div className="text">
          {kind === 'start' && !playing ? (
            <span className="minimal-hint-text">
              Press{' '}
              <span className="kbd-glow learn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Run &amp; Watch
              </span>{' '}
              to start
            </span>
          ) : (
            note
          )}
        </div>
        {frame && frame.line > 0 && <div className="line-badge">Line {frame.line}</div>}
      </div>

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

      {hasTurtle && (
        <div className="stage-tabs">
          <button
            className={`stage-tab-btn ${currentView === 'turtle' ? 'active' : ''}`}
            onClick={() => setStageView('turtle')}
          >
            Turtle Canvas
          </button>
          <button
            className={`stage-tab-btn ${currentView === 'memory' ? 'active' : ''}`}
            onClick={() => setStageView('memory')}
          >
            Memory Grid
          </button>
        </div>
      )}

      {aboveVars}

      {hasTurtle && currentView === 'turtle' ? (
        <TurtleCanvas turtle={frame?.turtle} />
      ) : (
        <div className="stage-section">
          <div className="stage-section-title">
            <span className="title-text">Variables</span>
          </div>
          <VariablesPanel vars={vars} accesses={accesses} />
        </div>
      )}

      <div className="stage-section">
        <div className="stage-section-title">
          <span className="title-text">Console Output</span>
        </div>
        <Console lines={output} />
      </div>
    </div>
  )
}
