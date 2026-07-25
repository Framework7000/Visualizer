import { useMemo, useRef } from 'react'
import { highlightCode } from '../lib/highlight'

interface Props {
  code: string
  onChange: (code: string) => void
  activeLine: number // 1-based; 0 = none
}

const LINE_HEIGHT = 24
const PADDING_TOP = 14

export default function CodeEditor({ code, onChange, activeLine }: Props) {
  const lineCount = useMemo(() => Math.max(code.split('\n').length, 1), [code])
  const highlighted = useMemo(() => highlightCode(code) + '\n', [code])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop
        preRef.current.scrollLeft = scrollLeft
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTop = scrollTop
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = code.slice(0, start) + '    ' + code.slice(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4
      })
    }
  }

  return (
    <div className="editor vscode-editor">
      <div className="gutter" ref={gutterRef} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={`gutter-num ${i + 1 === activeLine ? 'active' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="code-area">
        {activeLine > 0 && (
          <div
            className="active-strip"
            style={{ top: PADDING_TOP + (activeLine - 1) * LINE_HEIGHT }}
          />
        )}
        <pre ref={preRef} className="hl-layer" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlighted }} />
        <textarea
          ref={textareaRef}
          className="code-input"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label="Code editor"
        />
      </div>
    </div>
  )
}
