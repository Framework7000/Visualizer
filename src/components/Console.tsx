import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  lines: string[]
}

export default function Console({ lines }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="console-window">
      <div className="console-bar">
        <div className="console-dots">
          <span className="dot r" />
          <span className="dot y" />
          <span className="dot g" />
        </div>
        <span className="console-title">terminal output</span>
        <span className="console-badge">{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
      </div>
      <div className="console-body" ref={bodyRef}>
        {lines.length === 0 && <div className="console-empty">Output screen ready... Anything you print() appears here! 🖨️</div>}
        <AnimatePresence initial={false}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              className="console-line"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="console-prompt">&gt;</span>
              <span className="console-text">{line === '' ? ' ' : line}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
