import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  lines: string[]
}

export default function Console({ lines }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  function handleCopy() {
    if (lines.length === 0) return
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="console-window">
      <div className="console-bar">
        <div className="console-dots">
          <span className="dot r" />
          <span className="dot y" />
          <span className="dot g" />
        </div>
        <span className="console-title">TERMINAL OUTPUT</span>
        <span className="console-badge">{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
        {lines.length > 0 && (
          <button className="console-copy-btn" onClick={handleCopy} title="Copy console output">
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="console-body" ref={bodyRef}>
        {lines.length === 0 ? (
          <div className="console-empty">
            <span>Terminal ready</span>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
