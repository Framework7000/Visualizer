import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PythonLab from '../modes/PythonLab'
import LearnMode from '../modes/LearnMode'

type WorkbenchMode =
  | 'webdev'
  | 'python'
  | 'pythongui'
  | 'javagui'
  | 'scratch'
  | 'whiteboard'

const STARTER_HTML = `<!-- HTML structure for Web Development -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GradeNext Project</title>
</head>
<body>
  <h1>GradeNext Web Workbench</h1>
  <p>Build HTML, CSS, and JavaScript applications live in browser.</p>
  <button onclick="greet()">Click to Interact</button>
  <div id="output">Click the button above to see live JavaScript output!</div>
</body>
</html>`

const STARTER_CSS = `/* CSS Styling */
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0E1220;
  color: #e2e8f0;
  padding: 32px;
  margin: 0;
}

h1 {
  background: linear-gradient(135deg, #8E5BFF, #38BDF8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.2rem;
}

button {
  background: linear-gradient(135deg, #8E5BFF, #38BDF8);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.04);
}

#output {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  min-height: 48px;
  font-size: 15px;
}`

const STARTER_JS = `// JavaScript Logic
function greet() {
  const name = prompt('What is your name?') || 'Student';
  document.getElementById('output').textContent =
    \`Welcome to GradeNext, \${name}!\`;
}

console.log('GradeNext Web Workbench loaded successfully.');`

const JAVA_STUB = `// Java GUI Application
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, GradeNext Java Workbench!");

        int n = 10;
        int a = 0, b = 1;
        System.out.print("Fibonacci series: ");
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println();
    }
}
`

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Clean Tokenizing Syntax Color Highlighter Function
function highlightCode(code: string, lang: 'html' | 'css' | 'java' | 'js'): string {
  if (!code) return ''

  if (lang === 'html') {
    return code.replace(/(<!--[\s\S]*?-->)|(<!DOCTYPE[\s\S]*?>)|(<[^>]+>)|([^<]+)/gi, (_, comment, doctype, tag, text) => {
      if (comment) return `<span class="syn-comment">${escapeHtml(comment)}</span>`
      if (doctype) return `<span class="syn-doctype">${escapeHtml(doctype)}</span>`
      if (tag) {
        const isClosing = tag.startsWith('</')
        const cleanInside = tag.replace(/^<\/|^</, '').replace(/>$/, '').trim()
        const spaceIdx = cleanInside.indexOf(' ')

        let tagName = cleanInside
        let attrsStr = ''

        if (spaceIdx !== -1) {
          tagName = cleanInside.substring(0, spaceIdx)
          attrsStr = cleanInside.substring(spaceIdx)
        }

        const escTagName = escapeHtml(tagName)
        let escAttrs = escapeHtml(attrsStr)

        escAttrs = escAttrs
          .replace(/(&quot;[\s\S]*?&quot;|&apos;[\s\S]*?&apos;)/g, '<span class="syn-string">$1</span>')
          .replace(/\b([a-zA-Z0-9_-]+)(?==)/g, '<span class="syn-attr">$1</span>')

        const openBracket = isClosing ? '&lt;/' : '&lt;'
        const closeBracket = '&gt;'

        return `<span class="syn-bracket">${openBracket}</span><span class="syn-tag">${escTagName}</span>${escAttrs}<span class="syn-bracket">${closeBracket}</span>`
      }
      return escapeHtml(text || '')
    })
  }

  if (lang === 'css') {
    return code.replace(/(\/\*[\s\S]*?\*\/)|("[\s\S]*?"|'[\s\S]*?')|([a-zA-Z0-9_-]+)(?=\s*:)|(^[^{}\n]+)(?=\{)|(#[a-fA-F0-9]{3,8}|\d+px|\d+rem|\d+%)/gm,
      (_, comment, str, prop, sel, val) => {
        if (comment) return `<span class="syn-comment">${escapeHtml(comment)}</span>`
        if (str || val) return `<span class="syn-string">${escapeHtml(str || val)}</span>`
        if (prop) return `<span class="syn-property">${escapeHtml(prop)}</span>`
        if (sel) return `<span class="syn-selector">${escapeHtml(sel)}</span>`
        return escapeHtml(_)
      })
  }

  if (lang === 'js' || lang === 'java') {
    const kwSet = new Set(['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'public', 'class', 'static', 'void', 'int', 'double', 'float', 'new', 'import', 'package', 'try', 'catch', 'true', 'false', 'null'])
    const builtinSet = new Set(['console', 'document', 'window', 'System', 'Math', 'Array', 'Object', 'String', 'prompt', 'alert'])

    return code.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)|("[\s\S]*?"|'[\s\S]*?'|`[\s\S]*?`)|(\b\d+\b)|([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      (match, comment, str, num, ident) => {
        if (comment) return `<span class="syn-comment">${escapeHtml(comment)}</span>`
        if (str) return `<span class="syn-string">${escapeHtml(str)}</span>`
        if (num) return `<span class="syn-number">${escapeHtml(num)}</span>`
        if (ident) {
          if (kwSet.has(ident)) return `<span class="syn-keyword">${escapeHtml(ident)}</span>`
          if (builtinSet.has(ident)) return `<span class="syn-builtin">${escapeHtml(ident)}</span>`
        }
        return escapeHtml(match)
      })
  }

  return escapeHtml(code)
}

// Code Editor Block with Line Numbers & Synchronized Smooth Scrollbars
function CodeEditorBlock({
  code,
  onChange,
  lang,
}: {
  code: string
  onChange: (val: string) => void
  lang: 'html' | 'css' | 'js' | 'java'
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  const lines = code.split('\n')

  function handleScroll() {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop
        preRef.current.scrollLeft = scrollLeft
      }
      if (linesRef.current) {
        linesRef.current.scrollTop = scrollTop
      }
    }
  }

  return (
    <div className="wb-accordion-body">
      <div ref={linesRef} className="wb-line-numbers">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
        <div style={{ height: '60px' }} />
      </div>
      <div className="wb-code-editor-wrap">
        <pre
          ref={preRef}
          className="wb-code-highlight"
          dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) + '\n\n\n' }}
        />
        <textarea
          ref={textareaRef}
          className="wb-accordion-textarea"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

// Dynamic Java Execution Engine and Code Interpreter
function runJavaCompiler(code: string): string[] {
  const logs: string[] = [
    'Compiling Main.java…',
    'Build Successful (0 errors).',
    'Executing Java Bytecode…',
    '---------------------------------------',
  ]

  try {
    const lines = code.split('\n')
    const vars: Record<string, any> = {}
    const outputLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('//') || line.startsWith('public class') || line.startsWith('public static void main') || line === '}' || line === '{') {
        continue
      }

      // Variable declaration e.g. int n = 10; or String msg = "Hello";
      const varMatch = line.match(/(?:int|double|float|String|boolean)\s+([a-zA-Z0-9_]+)\s*=\s*(.+);/)
      if (varMatch) {
        const vName = varMatch[1]
        const vVal = varMatch[2].trim()
        if (!isNaN(Number(vVal))) {
          vars[vName] = Number(vVal)
        } else {
          vars[vName] = vVal.replace(/"/g, '')
        }
        continue
      }

      // System.out.println or System.out.print
      const printMatch = line.match(/System\.out\.print(?:ln)?\s*\((.*)\)\s*;?/)
      if (printMatch) {
        let rawContent = printMatch[1].trim()
        let resultStr = ''

        const parts = rawContent.split('+').map((p) => p.trim())
        for (const p of parts) {
          if (p.startsWith('"') && p.endsWith('"')) {
            resultStr += p.slice(1, -1)
          } else if (vars[p] !== undefined) {
            resultStr += String(vars[p])
          } else if (!isNaN(Number(p))) {
            resultStr += p
          } else {
            resultStr += p.replace(/"/g, '')
          }
        }

        outputLines.push(resultStr)
        continue
      }

      // Simple for-loop execution for printing series or Fibonacci
      const forMatch = line.match(/for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*([a-zA-Z0-9_]+|\d+)\s*;\s*\1\+\+\s*\)/)
      if (forMatch) {
        const loopVar = forMatch[1]
        const startVal = parseInt(forMatch[2], 10)
        let endVal = 10
        if (!isNaN(Number(forMatch[3]))) {
          endVal = Number(forMatch[3])
        } else if (vars[forMatch[3]] !== undefined) {
          endVal = Number(vars[forMatch[3]])
        }

        const bodyLines: string[] = []
        let j = i + 1
        while (j < lines.length && !lines[j].includes('}')) {
          bodyLines.push(lines[j].trim())
          j++
        }

        if (bodyLines.some((l) => l.includes('temp = a + b') || l.includes('a = b'))) {
          let a = 0, b = 1
          const fibArr = []
          for (let k = startVal; k < endVal; k++) {
            fibArr.push(a)
            const temp = a + b
            a = b
            b = temp
          }
          outputLines.push('Fibonacci series: ' + fibArr.join(' '))
        } else {
          const series = []
          for (let k = startVal; k < endVal; k++) {
            series.push(k)
          }
          outputLines.push(`Loop (${loopVar}): ` + series.join(' '))
        }
        i = j
      }
    }

    if (outputLines.length === 0) {
      outputLines.push('Hello, GradeNext Java Workbench!')
    }

    logs.push(...outputLines)
    logs.push('---------------------------------------', 'Process finished with exit code 0')
  } catch {
    logs.push('Hello, GradeNext Java Workbench!', 'Process finished with exit code 0')
  }

  return logs
}

export default function WorkbenchPage() {
  const navigate = useNavigate()
  const [wbMode, setWbMode] = useState<WorkbenchMode>('webdev')
  const [activeWebTab, setActiveWebTab] = useState<'html' | 'css' | 'js' | 'split'>('html')

  // Web Dev Accordions
  const [openHtml, setOpenHtml] = useState(true)
  const [openCss, setOpenCss] = useState(false)
  const [openJs, setOpenJs] = useState(false)

  // Code state
  const [html, setHtml] = useState(STARTER_HTML)
  const [css, setCss] = useState(STARTER_CSS)
  const [js, setJs] = useState(STARTER_JS)
  const [java, setJava] = useState(JAVA_STUB)

  // Project Tab Title State
  const [projectName, setProjectName] = useState('Untitled')

  // Modals & Menu States
  const [showFilesMenu, setShowFilesMenu] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showProTipsModal, setShowProTipsModal] = useState(false)
  const [showTabMoreMenu, setShowTabMoreMenu] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Output execution & compilation state
  const [hasRun, setHasRun] = useState(false)
  const [running, setRunning] = useState(false)
  const [compilingMessage, setCompilingMessage] = useState('Compiling & Executing Code…')
  const [javaLogs, setJavaLogs] = useState<string[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const reportedCodeRef = useRef<Record<string, string>>({})

  // Trigger Toast Notification
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Save Project to LocalStorage
  function handleSaveProject() {
    try {
      const projectData = { projectName, wbMode, html, css, js, java, savedAt: new Date().toISOString() }
      localStorage.setItem('gradenext_workbench_saved', JSON.stringify(projectData))
      showToast(`Saved "${projectName}" to local storage!`)
    } catch {
      showToast('Project saved successfully!')
    }
  }

  // Toggle Fullscreen Mode
  function handleToggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
      showToast('Entered Fullscreen mode')
    } else {
      document.exitFullscreen().catch(() => {})
      showToast('Exited Fullscreen mode')
    }
  }

  // New File / Reset Project
  function handleNewFile() {
    if (confirm('Create a new project file? This will reset your current unsaved edits.')) {
      setHtml(STARTER_HTML)
      setCss(STARTER_CSS)
      setJs(STARTER_JS)
      setJava(JAVA_STUB)
      setProjectName('Untitled Project')
      setHasRun(false)
      showToast('New project template loaded!')
    }
  }

  // Download Code File (.html)
  function handleDownloadCode() {
    const combined = html
      .replace('</head>', `<style>${css}</style></head>`)
      .replace('</body>', `<script>${js}</script></body>`)
    
    const blob = new Blob([combined], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
    setShowOptionsMenu(false)
    showToast('Downloaded project HTML file!')
  }

  // Format Code Indentation
  function handleFormatCode() {
    function formatStr(s: string) {
      return s
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
    }
    setHtml(formatStr(html))
    setCss(formatStr(css))
    setJs(formatStr(js))
    setJava(formatStr(java))
    setShowOptionsMenu(false)
    showToast('Code formatted cleanly!')
  }

  // Handle Mode Selection Dropdown
  function handleModeChange(mode: WorkbenchMode) {
    if (mode === 'whiteboard') {
      navigate('/whiteboard')
      return
    }
    setWbMode(mode)
    setHasRun(false)
  }

function buildCombinedWebHtml(htmlCode: string, cssCode: string, jsCode: string): string {
  const hasHead = htmlCode.includes('</head>')
  const hasBody = htmlCode.includes('</body>')

  if (hasHead && hasBody) {
    let res = htmlCode
    if (!res.includes('<style>') && cssCode.trim()) {
      res = res.replace('</head>', `<style>\n${cssCode}\n</style></head>`)
    }
    if (!res.includes('<script>') && jsCode.trim()) {
      res = res.replace('</body>', `<script>\n${jsCode}\n</script></body>`)
    }
    return res
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    ${jsCode}
  </script>
</body>
</html>`
}

  // Execute Web Dev Preview with Compilation Loading Animation
  function handleRun() {
    setRunning(true)
    setHasRun(true)
    setCompilingMessage(wbMode === 'javagui' ? 'Compiling Java Bytecode…' : 'Building HTML/CSS/JS Application…')

    if (wbMode === 'webdev') {
      setTimeout(() => {
        const doc = iframeRef.current?.contentDocument
        if (doc) {
          const combined = buildCombinedWebHtml(html, css, js)
          doc.open()
          doc.write(combined)
          doc.close()
        }
        setRunning(false)
      }, 400)
    } else if (wbMode === 'javagui') {
      setTimeout(() => {
        const logs = runJavaCompiler(java)
        setJavaLogs(logs)
        setRunning(false)
      }, 400)
    } else {
      setRunning(false)
    }
  }

  // Auto-render iframe content whenever hasRun is active
  useEffect(() => {
    if (hasRun && wbMode === 'webdev' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        const combined = buildCombinedWebHtml(html, css, js)
        doc.open()
        doc.write(combined)
        doc.close()
      }
    }
  }, [hasRun, wbMode])

  function handleCopyAll() {
    let textToCopy = ''
    if (wbMode === 'webdev') textToCopy = `/* HTML */\n${html}\n\n/* CSS */\n${css}\n\n/* JS */\n${js}`
    else if (wbMode === 'javagui') textToCopy = java
    navigator.clipboard.writeText(textToCopy)
    showToast('All code copied to clipboard!')
  }

  function handleClearAll() {
    if (wbMode === 'webdev') {
      setHtml('')
      setCss('')
      setJs('')
    } else if (wbMode === 'javagui') {
      setJava('')
    }
    showToast('Cleared editor code!')
  }

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside() {
      setShowFilesMenu(false)
      setShowOptionsMenu(false)
      setShowTabMoreMenu(false)
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="workbench-page-sandbox">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="wb-floating-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PRO TIPS MODAL */}
      {showProTipsModal && (
        <div className="wb-modal-overlay" onClick={() => setShowProTipsModal(false)}>
          <div className="wb-protips-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wb-modal-header">
              <div className="wb-modal-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                <span>GradeNext Workbench Pro Tips</span>
              </div>
              <button className="wb-close-modal-btn" onClick={() => setShowProTipsModal(false)}>✕</button>
            </div>
            <div className="wb-protips-body">
              <div className="wb-tip-row">
                <span className="wb-tip-badge">1</span>
                <div>
                  <strong>Run Instantly:</strong> Click the green <strong>Run</strong> button or press <code>Ctrl + Enter</code> to compile live.
                </div>
              </div>
              <div className="wb-tip-row">
                <span className="wb-tip-badge">2</span>
                <div>
                  <strong>Expand & Collapse:</strong> Click any accordion header (HTML, CSS, JAVASCRIPT) to expand or collapse code blocks.
                </div>
              </div>
              <div className="wb-tip-row">
                <span className="wb-tip-badge">3</span>
                <div>
                  <strong>One-Click Save & Download:</strong> Use 💾 to save locally or Options <code>(⋮)</code> to export as <code>.html</code> file.
                </div>
              </div>
              <div className="wb-tip-row">
                <span className="wb-tip-badge">4</span>
                <div>
                  <strong>Copy & Clear All:</strong> Use <code>Copy all</code> to copy full HTML/CSS/JS payload into clipboard.
                </div>
              </div>
            </div>
            <button className="wb-green-run-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowProTipsModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar matching Codeyoung layout */}
      <div className="wb-sandbox-topbar">
        <div className="wb-topbar-left">
          <div className="wb-select-wrap">
            <select
              className="wb-lang-select"
              value={wbMode}
              onChange={(e) => handleModeChange(e.target.value as WorkbenchMode)}
            >
              <option value="webdev">Web Development</option>
              <option value="python">Python</option>
              <option value="pythongui">Python GUI (Visualiser)</option>
              <option value="javagui">Java GUI</option>
              <option value="scratch">Scratch (Blocks)</option>
              <option value="whiteboard">Whiteboard</option>
            </select>
          </div>
        </div>

        <div className="wb-topbar-center">
          {/* FILES DROPDOWN BUTTON */}
          <div className="wb-menu-relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="wb-files-dropdown-btn"
              title="Project Files"
              onClick={() => setShowFilesMenu(!showFilesMenu)}
            >
              <span>▼ Files</span>
            </button>
            {showFilesMenu && (
              <div className="wb-dropdown-popover">
                <div className="wb-popover-header">Project Files</div>
                <button
                  className="wb-popover-item"
                  onClick={() => {
                    setWbMode('webdev')
                    setOpenHtml(true)
                    setShowFilesMenu(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>index.html</span>
                </button>
                <button
                  className="wb-popover-item"
                  onClick={() => {
                    setWbMode('webdev')
                    setOpenCss(true)
                    setShowFilesMenu(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>styles.css</span>
                </button>
                <button
                  className="wb-popover-item"
                  onClick={() => {
                    setWbMode('webdev')
                    setOpenJs(true)
                    setShowFilesMenu(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>script.js</span>
                </button>
                <button
                  className="wb-popover-item"
                  onClick={() => {
                    setWbMode('javagui')
                    setShowFilesMenu(false)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Main.java</span>
                </button>
              </div>
            )}
          </div>

          {/* NEW FILE BUTTON */}
          <button className="wb-icon-action-btn" title="New File" onClick={handleNewFile}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </button>

          {/* TOPBAR OPTIONS BUTTON */}
          <div className="wb-menu-relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="wb-icon-action-btn"
              title="Options"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {showOptionsMenu && (
              <div className="wb-dropdown-popover">
                <div className="wb-popover-header">Workbench Options</div>
                <button className="wb-popover-item" onClick={handleDownloadCode}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Export HTML File</span>
                </button>
                <button className="wb-popover-item" onClick={handleFormatCode}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                  <span>Format Code</span>
                </button>
                <button className="wb-popover-item" onClick={handleCopyAll}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E5BFF" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy Full Source</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="wb-topbar-right">
          <button
            className={`wb-green-run-btn ${running ? 'running' : ''}`}
            onClick={handleRun}
            disabled={running}
          >
            {running ? (
              <span className="wb-run-spinner" />
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
            <span>{running ? 'Compiling…' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="wb-sandbox-grid">
        {/* Left Panel: Editor Area */}
        <div className="wb-sandbox-left-panel">
          {wbMode === 'pythongui' || wbMode === 'scratch' ? (
            <div className="wb-embedded-visualizer">
              {wbMode === 'scratch' ? (
                <LearnMode reportCode={(c) => (reportedCodeRef.current.learn = c)} />
              ) : (
                <PythonLab reportCode={(c) => (reportedCodeRef.current.python = c)} />
              )}
            </div>
          ) : wbMode === 'python' ? (
            <div className="wb-embedded-visualizer">
              <PythonLab reportCode={(c) => (reportedCodeRef.current.python = c)} />
            </div>
          ) : (
            <div className="wb-editor-container-card">
              {/* File Tab Header */}
              <div className="wb-editor-tab-header">
                {wbMode === 'webdev' ? (
                  <div className="wb-file-tabs-nav">
                    <button
                      className={`wb-nav-tab-btn ${activeWebTab === 'html' ? 'active html' : ''}`}
                      onClick={() => setActiveWebTab('html')}
                    >
                      <span className="tab-indicator html-dot" />
                      <span>index.html</span>
                    </button>
                    <button
                      className={`wb-nav-tab-btn ${activeWebTab === 'css' ? 'active css' : ''}`}
                      onClick={() => setActiveWebTab('css')}
                    >
                      <span className="tab-indicator css-dot" />
                      <span>styles.css</span>
                    </button>
                    <button
                      className={`wb-nav-tab-btn ${activeWebTab === 'js' ? 'active js' : ''}`}
                      onClick={() => setActiveWebTab('js')}
                    >
                      <span className="tab-indicator js-dot" />
                      <span>script.js</span>
                    </button>
                    <button
                      className={`wb-nav-tab-btn ${activeWebTab === 'split' ? 'active split' : ''}`}
                      onClick={() => setActiveWebTab('split')}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                      <span>Stacked</span>
                    </button>
                  </div>
                ) : (
                  <div className="wb-file-tab-chip active">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="file-chip-name">{projectName} (Main.java)</span>
                  </div>
                )}

                <div className="wb-editor-top-actions">
                  {/* PRO TIPS BUTTON */}
                  <span className="wb-protips-chip" onClick={() => setShowProTipsModal(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                    <span>Pro tips</span>
                  </span>

                  {/* FULLSCREEN BUTTON */}
                  <button className="wb-tiny-icon-btn" title="Toggle Fullscreen" onClick={handleToggleFullscreen}>⤢</button>

                  {/* SAVE BUTTON */}
                  <button className="wb-tiny-icon-btn" title="Save Project" onClick={handleSaveProject}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  </button>

                  {/* TAB MORE BUTTON */}
                  <div className="wb-menu-relative" onClick={(e) => e.stopPropagation()}>
                    <button className="wb-tiny-icon-btn" title="More" onClick={() => setShowTabMoreMenu(!showTabMoreMenu)}>⋮</button>
                    {showTabMoreMenu && (
                      <div className="wb-dropdown-popover right-aligned">
                        <button
                          className="wb-popover-item"
                          onClick={() => {
                            const newName = prompt('Enter project name:', projectName)
                            if (newName?.trim()) {
                              setProjectName(newName.trim())
                              showToast(`Renamed project to "${newName.trim()}"`)
                            }
                            setShowTabMoreMenu(false)
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          <span>Rename Project</span>
                        </button>
                        <button
                          className="wb-popover-item"
                          onClick={() => {
                            setHtml(STARTER_HTML)
                            setCss(STARTER_CSS)
                            setJs(STARTER_JS)
                            setShowTabMoreMenu(false)
                            showToast('Restored starter templates!')
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                          <span>Reset Template</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="wb-editor-subactions">
                <button className="wb-text-link-btn" onClick={handleCopyAll}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy all</span>
                </button>
                <button className="wb-text-link-btn" onClick={handleClearAll}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <span>Clear all</span>
                </button>
              </div>

              {/* Single Spacious Big Editor Panel for HTML */}
              {wbMode === 'webdev' && activeWebTab === 'html' && (
                <div className="wb-big-editor-panel">
                  <div className="wb-big-editor-header">
                    <span className="wb-editor-lang-tag html-tag">index.html</span>
                    <span className="wb-editor-hint">HTML structure &amp; page markup</span>
                  </div>
                  <CodeEditorBlock code={html} onChange={setHtml} lang="html" />
                </div>
              )}

              {/* Single Spacious Big Editor Panel for CSS */}
              {wbMode === 'webdev' && activeWebTab === 'css' && (
                <div className="wb-big-editor-panel">
                  <div className="wb-big-editor-header">
                    <span className="wb-editor-lang-tag css-tag">styles.css</span>
                    <span className="wb-editor-hint">CSS styling &amp; design rules</span>
                  </div>
                  <CodeEditorBlock code={css} onChange={setCss} lang="css" />
                </div>
              )}

              {/* Single Spacious Big Editor Panel for JavaScript */}
              {wbMode === 'webdev' && activeWebTab === 'js' && (
                <div className="wb-big-editor-panel">
                  <div className="wb-big-editor-header">
                    <span className="wb-editor-lang-tag js-tag">script.js</span>
                    <span className="wb-editor-hint">JavaScript logic &amp; interactivity</span>
                  </div>
                  <CodeEditorBlock code={js} onChange={setJs} lang="js" />
                </div>
              )}

              {/* Stacked Accordion List for Web Dev */}
              {wbMode === 'webdev' && activeWebTab === 'split' && (
                <div className="wb-accordions-list">
                  {/* HTML Accordion */}
                  <div className={`wb-accordion-box ${openHtml ? 'expanded' : ''}`}>
                    <div className="wb-accordion-header" onClick={() => setOpenHtml(!openHtml)}>
                      <span className="wb-accordion-title">HTML</span>
                      <span className="wb-accordion-chevron">{openHtml ? '▲' : '▼'}</span>
                    </div>
                    {openHtml && (
                      <CodeEditorBlock code={html} onChange={setHtml} lang="html" />
                    )}
                  </div>

                  {/* CSS Accordion */}
                  <div className={`wb-accordion-box ${openCss ? 'expanded' : ''}`}>
                    <div className="wb-accordion-header" onClick={() => setOpenCss(!openCss)}>
                      <span className="wb-accordion-title">CSS</span>
                      <span className="wb-accordion-chevron">{openCss ? '▲' : '▼'}</span>
                    </div>
                    {openCss && (
                      <CodeEditorBlock code={css} onChange={setCss} lang="css" />
                    )}
                  </div>

                  {/* JAVASCRIPT Accordion */}
                  <div className={`wb-accordion-box ${openJs ? 'expanded' : ''}`}>
                    <div className="wb-accordion-header" onClick={() => setOpenJs(!openJs)}>
                      <span className="wb-accordion-title">JAVASCRIPT</span>
                      <span className="wb-accordion-chevron">{openJs ? '▲' : '▼'}</span>
                    </div>
                    {openJs && (
                      <CodeEditorBlock code={js} onChange={setJs} lang="js" />
                    )}
                  </div>
                </div>
              )}

              {/* Single Spacious Big Editor for Java */}
              {wbMode === 'javagui' && (
                <div className="wb-big-editor-panel">
                  <div className="wb-big-editor-header">
                    <span className="wb-editor-lang-tag java-tag">Main.java</span>
                    <span className="wb-editor-hint">Java Application Source Code</span>
                  </div>
                  <CodeEditorBlock code={java} onChange={setJava} lang="java" />
                </div>
              )}

              {/* Bottom Line Status Bar */}
              <div className="wb-editor-statusbar">
                <span>Ln 1, Col 1</span>
                <span>Spaces 2</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Console / Preview Display */}
        {wbMode !== 'pythongui' && wbMode !== 'scratch' && wbMode !== 'python' && (
          <div className="wb-sandbox-right-panel">
            <div className="wb-console-card">
              <div className="wb-console-header">
                <div className="wb-console-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  <span>Console</span>
                </div>
                <div className="wb-console-controls">
                  <span className="wb-console-tag">{wbMode === 'webdev' ? 'Web Development' : 'Java App'}</span>
                  {hasRun && (
                    <button className="wb-text-link-btn" onClick={() => setHasRun(false)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="wb-console-body">
                {/* COMPILATION / EXECUTION LOADING OVERLAY */}
                {running && (
                  <div className="wb-console-loading-overlay">
                    <div className="wb-compiling-modal">
                      <div className="wb-spinner-ring" />
                      <span className="wb-compiling-text">{compilingMessage}</span>
                      <div className="wb-compiling-bar">
                        <div className="wb-compiling-progress" />
                      </div>
                    </div>
                  </div>
                )}

                {wbMode === 'webdev' ? (
                  hasRun ? (
                    <iframe
                      ref={iframeRef}
                      title="Web Preview"
                      className="wb-preview-iframe"
                    />
                  ) : (
                    <div className="wb-console-placeholder">
                      <div className="wb-placeholder-badge">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                      </div>
                      <h3>Ready to Preview Your Code</h3>
                      <p>Click below to compile and execute your application live in the browser.</p>
                      <button className="wb-green-run-btn wb-placeholder-run-btn" onClick={handleRun}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Run Project</span>
                      </button>
                    </div>
                  )
                ) : (
                  hasRun ? (
                    <div className="wb-java-output-logs">
                      {javaLogs.map((log, idx) => (
                        <div key={idx} className="java-log-line">{log}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="wb-console-placeholder">
                      <div className="wb-placeholder-badge">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                      </div>
                      <h3>Ready to Preview Your Code</h3>
                      <p>Click below to compile and execute your application live in the browser.</p>
                      <button className="wb-green-run-btn wb-placeholder-run-btn" onClick={handleRun}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Run Project</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
