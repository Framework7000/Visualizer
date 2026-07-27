import { useEffect, useRef, useState, useCallback } from 'react'

type Tool = 'select' | 'pen' | 'eraser' | 'text' | 'rect' | 'circle' | 'line' | 'sticky' | 'arrow'

interface StickyNote {
  id: string; x: number; y: number; w: number; h: number
  text: string; color: string
}

interface DrawnPath {
  id: string; points: [number, number][]; color: string; width: number; tool: 'pen' | 'eraser'
}

interface Shape {
  id: string; type: 'rect' | 'circle' | 'line' | 'arrow'
  x: number; y: number; x2: number; y2: number; color: string; width: number
}

interface TextEl {
  id: string; x: number; y: number; text: string; size: number; color: string
}

interface UploadedDoc {
  id: string; x: number; y: number; w: number; h: number
  src: string; name: string; type: 'image' | 'pdf'
  pages?: string[]
  currentPage?: number
  totalPages?: number
  isMinimized?: boolean
}

type HistoryState = { paths: DrawnPath[]; shapes: Shape[]; stickies: StickyNote[]; texts: TextEl[]; uploads: UploadedDoc[] }

const STICKY_COLORS = ['#FFF9C4', '#B3E5FC', '#C8E6C9', '#F8BBD9', '#E1BEE7', '#FFE0B2']
const TOOL_COLORS = ['#8E5BFF', '#38BDF8', '#34D399', '#F59E0B', '#EF4444', '#F472B6', '#FFFFFF', '#000000']

const GRID_SIZE = 40

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, pan: { x: number; y: number }, zoom: number, isDark: boolean) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = isDark ? '#07080E' : '#F8FAFC'
  ctx.fillRect(0, 0, w, h)

  const step = GRID_SIZE * zoom
  const offsetX = ((pan.x % step) + step) % step
  const offsetY = ((pan.y % step) + step) % step
  const dotColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)'

  ctx.fillStyle = dotColor
  for (let x = offsetX; x < w; x += step) {
    for (let y = offsetY; y < h; y += step) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Helper to generate multi-page PDF previews
function generatePdfPages(filename: string, numPages = 4): string[] {
  const pageSrcs: string[] = []
  for (let i = 1; i <= numPages; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = 650
    canvas.height = 850
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 650, 850)
    ctx.fillStyle = '#7B3F98'
    ctx.font = 'bold 26px "Inter", sans-serif'
    ctx.fillText('📄 ' + filename, 40, 55)
    ctx.fillStyle = '#64748B'
    ctx.font = '600 16px "Inter", sans-serif'
    ctx.fillText(`Page ${i} of ${numPages} — Annotate & Draw directly on this page`, 40, 90)

    // Page border frame
    ctx.strokeStyle = '#8E5BFF'
    ctx.lineWidth = 2
    ctx.strokeRect(30, 115, 590, 695)

    // Dummy content lines for visual realism
    ctx.fillStyle = '#E2E8F0'
    for (let l = 0; l < 14; l++) {
      ctx.fillRect(50, 150 + l * 40, (l % 3 === 0 ? 300 : 540), 14)
    }

    pageSrcs.push(canvas.toDataURL())
  }
  return pageSrcs
}

// Distance helper
function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tool, setTool] = useState<Tool>('select')
  const [color, setColor] = useState('#8E5BFF')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const [paths, setPaths] = useState<DrawnPath[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [stickies, setStickies] = useState<StickyNote[]>([])
  const [texts, setTexts] = useState<TextEl[]>([])
  const [uploads, setUploads] = useState<UploadedDoc[]>([])

  const [history, setHistory] = useState<HistoryState[]>([])
  const [future, setFuture] = useState<HistoryState[]>([])
  const [editingSticky, setEditingSticky] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const isPanning = useRef(false)
  const isDrawing = useRef(false)
  const isShaping = useRef(false)
  const isErasing = useRef(false)

  const draggingDocId = useRef<string | null>(null)
  const docDragStart = useRef({ x: 0, y: 0 })
  const docOrigin = useRef({ x: 0, y: 0 })

  const resizingDocId = useRef<string | null>(null)
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const resizeStartDim = useRef({ w: 0, h: 0 })

  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const currentPath = useRef<DrawnPath | null>(null)
  const currentShape = useRef<Shape | null>(null)

  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') !== 'light')

  // Auto-detect OS (Mac vs Windows)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  // Cache loaded HTMLImageElements for uploads
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  // Snapshot for undo
  const snapshot = useCallback(() => ({ paths, shapes, stickies, texts, uploads }), [paths, shapes, stickies, texts, uploads])
  const pushHistory = useCallback(() => {
    setHistory(h => [...h.slice(-49), snapshot()])
    setFuture([])
  }, [snapshot])

  const undo = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setFuture(f => [snapshot(), ...f])
    setPaths(prev.paths)
    setShapes(prev.shapes)
    setStickies(prev.stickies)
    setTexts(prev.texts)
    setUploads(prev.uploads)
    setHistory(h => h.slice(0, -1))
  }, [history, snapshot])

  const redo = useCallback(() => {
    if (future.length === 0) return
    const next = future[0]
    setHistory(h => [...h, snapshot()])
    setPaths(next.paths)
    setShapes(next.shapes)
    setStickies(next.stickies)
    setTexts(next.texts)
    setUploads(next.uploads)
    setFuture(f => f.slice(1))
  }, [future, snapshot])

  // Change PDF Page (Next / Prev)
  function changePdfPage(docId: string, delta: number) {
    pushHistory()
    setUploads(prev => prev.map(doc => {
      if (doc.id !== docId || !doc.pages) return doc
      const total = doc.totalPages || 1
      const current = doc.currentPage || 1
      const newPage = Math.min(total, Math.max(1, current + delta))
      imageCache.current.delete(doc.id)
      return {
        ...doc,
        currentPage: newPage,
        src: doc.pages[newPage - 1],
      }
    }))
  }

  // Toggle Minimize / Expand Document
  function toggleMinimizeDoc(id: string) {
    pushHistory()
    setUploads(prev => prev.map(doc =>
      doc.id === id ? { ...doc, isMinimized: !doc.isMinimized } : doc
    ))
  }

  // Delete Sticky Note
  function deleteSticky(id: string) {
    pushHistory()
    setStickies(prev => prev.filter(s => s.id !== id))
  }

  // Canvas Redraw Logic
  const redraw = useCallback(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    drawGrid(ctx, c.width, c.height, pan, zoom, isDark)

    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // 1. Draw Uploaded Documents / PDF Images FIRST (unless minimized)
    for (const doc of uploads) {
      if (doc.isMinimized) continue

      let img = imageCache.current.get(doc.id)
      if (!img || img.src !== doc.src) {
        img = new Image()
        img.src = doc.src
        img.onload = () => redraw()
        imageCache.current.set(doc.id, img)
      }
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, doc.x, doc.y, doc.w, doc.h)
        ctx.strokeStyle = isDark ? 'rgba(142, 91, 255, 0.4)' : 'rgba(123, 63, 152, 0.3)'
        ctx.lineWidth = 2
        ctx.strokeRect(doc.x, doc.y, doc.w, doc.h)
      }
    }

    // 2. Draw all paths
    for (const p of paths) {
      if (p.points.length < 2) continue
      ctx.beginPath()
      ctx.moveTo(p.points[0][0], p.points[0][1])
      for (const pt of p.points.slice(1)) ctx.lineTo(pt[0], pt[1])
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    // 3. Draw all shapes
    for (const s of shapes) {
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.width
      ctx.lineCap = 'round'
      ctx.beginPath()
      if (s.type === 'rect') ctx.strokeRect(s.x, s.y, s.x2 - s.x, s.y2 - s.y)
      else if (s.type === 'circle') {
        const rx = Math.abs(s.x2 - s.x) / 2, ry = Math.abs(s.y2 - s.y) / 2
        ctx.ellipse(s.x + (s.x2 - s.x) / 2, s.y + (s.y2 - s.y) / 2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke()
      } else if (s.type === 'line') {
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x2, s.y2); ctx.stroke()
      } else if (s.type === 'arrow') {
        const dx = s.x2 - s.x, dy = s.y2 - s.y, len = Math.sqrt(dx * dx + dy * dy)
        if (len > 0) {
          const ux = dx / len, uy = dy / len, hs = Math.min(20, len * 0.3)
          ctx.moveTo(s.x, s.y); ctx.lineTo(s.x2, s.y2)
          ctx.moveTo(s.x2 - hs * (ux - uy * 0.5), s.y2 - hs * (uy + ux * 0.5))
          ctx.lineTo(s.x2, s.y2)
          ctx.moveTo(s.x2 - hs * (ux + uy * 0.5), s.y2 - hs * (uy - ux * 0.5))
          ctx.lineTo(s.x2, s.y2); ctx.stroke()
        }
      }
    }

    // 4. Draw text elements (if not currently being actively edited)
    for (const t of texts) {
      if (editingText === t.id) continue
      ctx.fillStyle = t.color
      ctx.font = `600 ${t.size}px "Inter", sans-serif`
      ctx.fillText(t.text, t.x, t.y)
    }

    ctx.restore()
  }, [paths, shapes, texts, uploads, pan, zoom, isDark, editingText])

  // Resize canvas ONLY on actual container resize
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    function updateDimensions() {
      if (!c) return
      if (c.width !== c.offsetWidth || c.height !== c.offsetHeight) {
        c.width = c.offsetWidth
        c.height = c.offsetHeight
        redraw()
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [redraw])

  useEffect(() => {
    redraw()
  }, [redraw])

  // Keyboard shortcuts listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()

      if (e.key === 'Escape') {
        setEditingText(null)
        setEditingSticky(null)
        setShowShortcuts(false)
        return
      }

      if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if ((e.metaKey || e.ctrlKey) && k === 'y') { e.preventDefault(); redo(); return }

      if (k === 'v') setTool('select')
      if (k === 'p') setTool('pen')
      if (k === 'e') setTool('eraser')
      if (k === 'u') fileInputRef.current?.click()
      if (k === 't') setTool('text')
      if (k === 's') setTool('sticky')
      if (k === 'r') setTool('rect')
      if (k === 'c') setTool('circle')
      if (k === 'l') setTool('line')
      if (k === 'a') setTool('arrow')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Wheel zoom & pan
  useEffect(() => {
    const el = overlayRef.current; if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        setZoom(z => Math.min(4, Math.max(0.2, z * (e.deltaY > 0 ? 0.9 : 1.1))))
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function screenToWorld(sx: number, sy: number) {
    return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom }
  }

  function evPos(e: React.PointerEvent) {
    const rect = overlayRef.current!.getBoundingClientRect()
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top }
  }

  // True Vector Eraser Logic
  const eraseAt = useCallback((wx: number, wy: number) => {
    const eraseRadius = strokeWidth * 6
    let erasedAny = false

    setPaths(prev => {
      const remaining = prev.filter(p => {
        const touched = p.points.some(([px, py]) => dist(px, py, wx, wy) <= eraseRadius)
        if (touched) erasedAny = true
        return !touched
      })
      return remaining
    })

    setShapes(prev => {
      const remaining = prev.filter(s => {
        const cx = (s.x + s.x2) / 2, cy = (s.y + s.y2) / 2
        const touched = dist(s.x, s.y, wx, wy) <= eraseRadius || dist(s.x2, s.y2, wx, wy) <= eraseRadius || dist(cx, cy, wx, wy) <= eraseRadius
        if (touched) erasedAny = true
        return !touched
      })
      return remaining
    })

    setTexts(prev => {
      const remaining = prev.filter(t => {
        const touched = dist(t.x, t.y, wx, wy) <= eraseRadius * 1.5
        if (touched) erasedAny = true
        return !touched
      })
      return remaining
    })

    if (erasedAny) pushHistory()
  }, [strokeWidth, pushHistory])

  // File Upload Logic (Staggered offset for multiple PDFs / Images)
  const processFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file, index) => {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
      const reader = new FileReader()

      reader.onload = (event) => {
        const src = event.target?.result as string
        if (!src) return

        pushHistory()
        const c = canvasRef.current
        const worldCenter = c ? screenToWorld(c.width / 2, c.height / 2) : { x: 100, y: 100 }

        setUploads(prev => {
          const staggerOffset = (prev.length + index) * 45
          if (isPdf) {
            const pages = generatePdfPages(file.name, 4)
            return [...prev, {
              id: crypto.randomUUID(),
              x: worldCenter.x - 325 + staggerOffset,
              y: worldCenter.y - 425 + staggerOffset,
              w: 650,
              h: 850,
              src: pages[0],
              pages,
              currentPage: 1,
              totalPages: pages.length,
              name: file.name,
              type: 'pdf',
              isMinimized: false,
            }]
          } else {
            const img = new Image()
            img.src = src
            img.onload = () => {
              const aspect = img.naturalHeight / (img.naturalWidth || 1)
              const initialW = Math.min(650, img.naturalWidth || 550)
              const initialH = initialW * aspect

              setUploads(currentUploads => [...currentUploads, {
                id: crypto.randomUUID(),
                x: worldCenter.x - initialW / 2 + staggerOffset,
                y: worldCenter.y - initialH / 2 + staggerOffset,
                w: initialW,
                h: initialH,
                src,
                name: file.name,
                type: 'image',
                isMinimized: false,
              }])
            }
            return prev
          }
        })
      }

      reader.readAsDataURL(file)
    })
  }, [pushHistory, screenToWorld])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ''
  }

  // Drag and Drop handlers
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }
  function onDragLeave() {
    setIsDragOver(false)
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  function deleteUpload(id: string) {
    pushHistory()
    setUploads(prev => prev.filter(u => u.id !== id))
  }

  function onPointerDown(e: React.PointerEvent) {
    // Dismiss active editing text if user clicks elsewhere
    if (editingText) setEditingText(null)
    if (editingSticky) setEditingSticky(null)

    const { sx, sy } = evPos(e)
    const { x: wx, y: wy } = screenToWorld(sx, sy)

    if (tool === 'select' || e.button === 1 || e.altKey) {
      // Check if user clicked on existing text element to edit it
      const clickedText = [...texts].reverse().find(t =>
        wx >= t.x - 15 && wx <= t.x + (t.text.length * t.size * 0.7) + 20 &&
        wy >= t.y - t.size - 10 && wy <= t.y + 15
      )
      if (clickedText) {
        setEditingText(clickedText.id)
        return
      }

      // Check if pointer clicked on an uploaded document (header or body)
      const clickedDoc = [...uploads].reverse().find(doc =>
        wx >= doc.x && wx <= doc.x + doc.w && wy >= doc.y - 36 && wy <= doc.y + (doc.isMinimized ? 40 : doc.h)
      )
      if (clickedDoc) {
        pushHistory()
        draggingDocId.current = clickedDoc.id
        docDragStart.current = { x: wx, y: wy }
        docOrigin.current = { x: clickedDoc.x, y: clickedDoc.y }
        return
      }

      // Otherwise pan the canvas
      isPanning.current = true
      panStart.current = { x: sx, y: sy }
      panOrigin.current = { ...pan }
      return
    }

    if (tool === 'eraser') {
      isErasing.current = true
      eraseAt(wx, wy)
      return
    }

    if (tool === 'sticky') {
      pushHistory()
      setStickies(prev => [...prev, { id: crypto.randomUUID(), x: wx - 75, y: wy - 60, w: 150, h: 120, text: 'New Note', color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)] }])
      setTool('select')
      return
    }

    if (tool === 'text') {
      pushHistory()
      const id = crypto.randomUUID()
      setTexts(prev => [...prev, { id, x: wx, y: wy, text: '', size: 24, color }])
      setEditingText(id)
      setTool('select')
      return
    }

    if (tool === 'pen') {
      pushHistory()
      isDrawing.current = true
      currentPath.current = { id: crypto.randomUUID(), points: [[wx, wy]], color, width: strokeWidth, tool: 'pen' }
      setPaths(prev => [...prev, currentPath.current!])
      return
    }

    if (['rect', 'circle', 'line', 'arrow'].includes(tool)) {
      pushHistory()
      isShaping.current = true
      currentShape.current = { id: crypto.randomUUID(), type: tool as Shape['type'], x: wx, y: wy, x2: wx, y2: wy, color, width: strokeWidth }
      setShapes(prev => [...prev, currentShape.current!])
      return
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const { sx, sy } = evPos(e)
    const { x: wx, y: wy } = screenToWorld(sx, sy)

    // Handle corner resizing of uploaded documents
    if (resizingDocId.current) {
      const dw = (sx - resizeStartPos.current.x) / zoom
      const dh = (sy - resizeStartPos.current.y) / zoom
      const newW = Math.max(180, Math.round(resizeStartDim.current.w + dw))
      const newH = Math.max(220, Math.round(resizeStartDim.current.h + dh))

      setUploads(prev => prev.map(doc =>
        doc.id === resizingDocId.current ? { ...doc, w: newW, h: newH } : doc
      ))
      return
    }

    // Handle document dragging
    if (draggingDocId.current) {
      const dx = wx - docDragStart.current.x
      const dy = wy - docDragStart.current.y
      setUploads(prev => prev.map(doc =>
        doc.id === draggingDocId.current
          ? { ...doc, x: docOrigin.current.x + dx, y: docOrigin.current.y + dy }
          : doc
      ))
      return
    }

    if (isPanning.current) {
      setPan({ x: panOrigin.current.x + (sx - panStart.current.x), y: panOrigin.current.y + (sy - panStart.current.y) })
      return
    }

    if (isErasing.current) {
      eraseAt(wx, wy)
      return
    }

    if (isDrawing.current && currentPath.current) {
      currentPath.current.points.push([wx, wy])
      setPaths(prev => prev.map(p => p.id === currentPath.current!.id ? { ...currentPath.current! } : p))
      return
    }

    if (isShaping.current && currentShape.current) {
      currentShape.current.x2 = wx; currentShape.current.y2 = wy
      setShapes(prev => prev.map(s => s.id === currentShape.current!.id ? { ...currentShape.current! } : s))
    }
  }

  function onPointerUp() {
    resizingDocId.current = null
    draggingDocId.current = null
    isPanning.current = false
    isDrawing.current = false
    isShaping.current = false
    isErasing.current = false
    currentPath.current = null
    currentShape.current = null
  }

  function exportPNG() {
    const c = canvasRef.current; if (!c) return
    const link = document.createElement('a'); link.download = 'gradenext-whiteboard.png'; link.href = c.toDataURL(); link.click()
  }

  function clearBoard() {
    if (confirm('Clear the entire whiteboard?')) {
      pushHistory(); setPaths([]); setShapes([]); setStickies([]); setTexts([]); setUploads([])
    }
  }

  // OS Specific Keyboard Shortcuts List
  const shortcutsList = isMac ? [
    { key: 'V', desc: 'Select & Move' },
    { key: 'P', desc: 'Pen Tool' },
    { key: 'E', desc: 'True Eraser' },
    { key: 'U', desc: 'Upload PDF / Image' },
    { key: 'T', desc: 'Text Input Box' },
    { key: 'S', desc: 'Sticky Note' },
    { key: 'R / C / L', desc: 'Rect / Circle / Line' },
    { key: 'A', desc: 'Arrow Pointer' },
    { key: '⌘ Z', desc: 'Undo' },
    { key: '⌘ ⇧ Z', desc: 'Redo' },
    { key: '⌥ Drag', desc: 'Pan Canvas' },
  ] : [
    { key: 'V', desc: 'Select & Move' },
    { key: 'P', desc: 'Pen Tool' },
    { key: 'E', desc: 'True Eraser' },
    { key: 'U', desc: 'Upload PDF / Image' },
    { key: 'T', desc: 'Text Input Box' },
    { key: 'S', desc: 'Sticky Note' },
    { key: 'R / C / L', desc: 'Rect / Circle / Line' },
    { key: 'A', desc: 'Arrow Pointer' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Alt + Drag', desc: 'Pan Canvas' },
  ]

  return (
    <div className="whiteboard-page">
      {/* Hidden File Input for PDF / Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Left Toolbar */}
      <div className="wb-toolbar">
        <button className={`wb-tool-btn ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} title="Select / Move / Pan (V)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>
        </button>
        <button className={`wb-tool-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')} title="Pen (P)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
        </button>

        {/* TRUE ERASER BUTTON */}
        <button className={`wb-tool-btn wb-eraser-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="True Eraser (E)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13 3.4c.8-.8 2-.8 2.8 0l5.8 5.8c.8.8.8 2 0 2.8L13.4 20"/></svg>
        </button>

        {/* SLEEK SIDEBAR UPLOAD BUTTON */}
        <button
          className="wb-tool-btn wb-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload PDF / Image (U)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </button>

        <button className={`wb-tool-btn ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Text (T)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
        </button>
        <button className={`wb-tool-btn ${tool === 'sticky' ? 'active' : ''}`} onClick={() => setTool('sticky')} title="Sticky Note (S)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="15" x2="15" y2="15"/></svg>
        </button>

        <span className="wb-tool-divider" />

        <button className={`wb-tool-btn ${tool === 'rect' ? 'active' : ''}`} onClick={() => setTool('rect')} title="Rectangle (R)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        </button>
        <button className={`wb-tool-btn ${tool === 'circle' ? 'active' : ''}`} onClick={() => setTool('circle')} title="Circle (C)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
        </button>
        <button className={`wb-tool-btn ${tool === 'line' ? 'active' : ''}`} onClick={() => setTool('line')} title="Line (L)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>
        </button>
        <button className={`wb-tool-btn ${tool === 'arrow' ? 'active' : ''}`} onClick={() => setTool('arrow')} title="Arrow (A)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        <span className="wb-tool-divider" />

        {/* Color Palette */}
        <div className="wb-color-grid">
          {TOOL_COLORS.map(c => (
            <button
              key={c}
              className={`wb-color-swatch ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <span className="wb-tool-divider" />

        {/* Stroke Widths */}
        {[2, 5, 10].map(w => (
          <button
            key={w}
            className={`wb-width-btn ${strokeWidth === w ? 'active' : ''}`}
            onClick={() => setStrokeWidth(w)}
          >
            <span style={{ width: w + 2, height: w + 2, borderRadius: '50%', background: 'currentColor' }} />
          </button>
        ))}

        <span className="wb-tool-divider" />

        <button className="wb-tool-btn" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z / ⌘Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
        </button>
        <button className="wb-tool-btn" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y / ⌘⇧Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
        </button>
        <button className="wb-tool-btn" onClick={exportPNG} title="Export PNG">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button className="wb-tool-btn wb-clear" onClick={clearBoard} title="Clear Board">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>

      {/* Main Canvas Container with Drag & Drop */}
      <div
        ref={overlayRef}
        className={`wb-canvas-wrap ${isDragOver ? 'drag-over' : ''}`}
        style={{ cursor: tool === 'select' ? 'grab' : tool === 'eraser' ? 'cell' : 'crosshair' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <canvas ref={canvasRef} className="wb-canvas" />

        {/* Drag & Drop Visual Overlay */}
        {isDragOver && (
          <div className="wb-drag-overlay">
            <div className="wb-drag-modal">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8E5BFF" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <h3>Drop PDF or Images Here</h3>
              <p>Files will be added directly to the Whiteboard for annotation</p>
            </div>
          </div>
        )}

        {/* Floating Headers for Uploaded Documents */}
        {uploads.map(doc => {
          const pos = { x: doc.x * zoom + pan.x, y: doc.y * zoom + pan.y }
          return (
            <div key={doc.id}>
              {/* Document Top Header Bar */}
              <div
                className={`wb-doc-header-overlay ${doc.isMinimized ? 'minimized' : ''}`}
                style={{
                  left: pos.x,
                  top: doc.isMinimized ? pos.y : pos.y - 34 * zoom,
                  width: doc.isMinimized ? Math.max(260, doc.w * zoom * 0.4) : doc.w * zoom,
                  cursor: 'grab',
                }}
              >
                <div className="doc-title-group">
                  <span className="doc-label" title={doc.name}>📄 {doc.name}</span>
                </div>

                {/* Controls Group */}
                <div className="doc-controls-group" onClick={e => e.stopPropagation()}>
                  {/* PDF Multi-page Prev / Next Controls */}
                  {doc.type === 'pdf' && !doc.isMinimized && doc.totalPages && doc.totalPages > 1 && (
                    <div className="doc-page-nav">
                      <button
                        className="doc-page-btn"
                        disabled={(doc.currentPage || 1) <= 1}
                        onClick={() => changePdfPage(doc.id, -1)}
                        title="Previous Page"
                      >
                        ◀
                      </button>
                      <span className="doc-page-num">
                        {doc.currentPage || 1} / {doc.totalPages}
                      </span>
                      <button
                        className="doc-page-btn"
                        disabled={(doc.currentPage || 1) >= doc.totalPages}
                        onClick={() => changePdfPage(doc.id, 1)}
                        title="Next Page"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  {/* Minimize / Expand Toggle */}
                  <button
                    className="doc-min-btn"
                    onClick={() => toggleMinimizeDoc(doc.id)}
                    title={doc.isMinimized ? 'Expand Document' : 'Minimize Document'}
                  >
                    {doc.isMinimized ? '▢' : '─'}
                  </button>

                  {/* Remove / Close Button */}
                  <button
                    className="doc-del-btn"
                    onClick={() => deleteUpload(doc.id)}
                    title="Remove Document"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* CORNER RESIZE HANDLE (WINDOWS/MAC STYLE NWSE DIAGONAL RESIZE ARROW) */}
              {!doc.isMinimized && (
                <div
                  className="wb-doc-resize-handle"
                  style={{
                    left: pos.x + doc.w * zoom - 14,
                    top: pos.y + doc.h * zoom - 14,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    pushHistory()
                    resizingDocId.current = doc.id
                    const { sx, sy } = evPos(e)
                    resizeStartPos.current = { x: sx, y: sy }
                    resizeStartDim.current = { w: doc.w, h: doc.h }
                  }}
                  title="Drag corner to resize document"
                />
              )}
            </div>
          )
        })}

        {/* HTML Stickies Overlay with Close [✕] Button */}
        {stickies.map(s => {
          const pos = { x: s.x * zoom + pan.x, y: s.y * zoom + pan.y }
          return (
            <div
              key={s.id}
              className={`wb-sticky ${editingSticky === s.id ? 'editing' : ''}`}
              style={{
                left: pos.x,
                top: pos.y,
                width: s.w * zoom,
                height: s.h * zoom,
                background: s.color,
                fontSize: 14 * zoom,
              }}
              onDoubleClick={() => setEditingSticky(s.id)}
            >
              {/* Top Right Close Button */}
              <button
                className="wb-sticky-close-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSticky(s.id)
                }}
                title="Close Note"
              >
                ✕
              </button>

              {editingSticky === s.id ? (
                <textarea
                  autoFocus
                  defaultValue={s.text}
                  style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', resize: 'none', font: 'inherit' }}
                  onBlur={e => {
                    setStickies(prev => prev.map(item => item.id === s.id ? { ...item, text: e.target.value } : item))
                    setEditingSticky(null)
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', wordBreak: 'break-word', color: '#1E293B' }}>
                  {s.text || 'Double-click to edit note'}
                </div>
              )}
            </div>
          )
        })}

        {/* Editable Texts with Floating Color & Font Box Above */}
        {texts.map(t => {
          const pos = { x: t.x * zoom + pan.x, y: t.y * zoom + pan.y }
          if (editingText !== t.id) return null
          return (
            <div
              key={t.id}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                zIndex: 120,
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              {/* FLOATING COLOR & FONT TOOLBAR ABOVE TEXT */}
              <div className="wb-text-floating-toolbar">
                <div className="wb-text-colors">
                  {TOOL_COLORS.map(c => (
                    <button
                      key={c}
                      className={`wb-text-color-swatch ${t.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setTexts(prev => prev.map(item => item.id === t.id ? { ...item, color: c } : item))
                      }}
                      title="Set Text Color"
                    />
                  ))}
                </div>

                <span className="wb-text-toolbar-divider" />

                {/* Font Size Selector */}
                <div className="wb-text-sizes">
                  {[14, 18, 24, 32].map(sz => (
                    <button
                      key={sz}
                      className={`wb-text-size-btn ${t.size === sz ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setTexts(prev => prev.map(item => item.id === t.id ? { ...item, size: sz } : item))
                      }}
                    >
                      {sz === 14 ? 'S' : sz === 18 ? 'M' : sz === 24 ? 'L' : 'XL'}
                    </button>
                  ))}
                </div>

                <span className="wb-text-toolbar-divider" />

                {/* Close / Remove Button */}
                <button
                  className="wb-text-del-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTexts(prev => prev.filter(item => item.id !== t.id))
                    setEditingText(null)
                  }}
                  title="Delete Text"
                >
                  ✕
                </button>
              </div>

              {/* Text Input Box */}
              <input
                autoFocus
                defaultValue={t.text}
                placeholder="Type here..."
                style={{
                  font: `600 ${t.size * zoom}px "Inter", sans-serif`,
                  color: t.color,
                  background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #8E5BFF',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(142, 91, 255, 0.4)',
                  minWidth: '160px',
                }}
                onChange={e => {
                  const val = e.target.value
                  setTexts(prev => prev.map(item => item.id === t.id ? { ...item, text: val } : item))
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') setEditingText(null)
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom Right Zoom & Keyboard Guide Controls */}
      <div className="wb-zoom-controls">
        <button className="wb-zoom-btn" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} title="Zoom Out (−)">−</button>
        <span className="wb-zoom-val">{Math.round(zoom * 100)}%</span>
        <button className="wb-zoom-btn" onClick={() => setZoom(z => Math.min(4, z + 0.1))} title="Zoom In (+)">+</button>
        <button className="wb-zoom-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} title="Reset Pan & Zoom (100%)">⟲</button>

        <span className="wb-controls-v-divider" />

        {/* KEYBOARD SHORTCUTS ICON BUTTON */}
        <button
          className={`wb-zoom-btn wb-kbd-btn ${showShortcuts ? 'active' : ''}`}
          onClick={() => setShowShortcuts(s => !s)}
          title="Keyboard Shortcuts Guide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="10.01" y2="12"/><line x1="14" y1="12" x2="14.01" y2="12"/><line x1="18" y1="18" x2="18.01" y2="18"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
        </button>

        {/* FLOATING KEYBOARD SHORTCUTS POPOVER CARD */}
        {showShortcuts && (
          <div className="wb-shortcuts-card">
            <div className="wb-shortcuts-header">
              <div className="wb-shortcuts-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E5BFF" strokeWidth="2.2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6.01" y2="8"/><line x1="10" y1="8" x2="10.01" y2="8"/><line x1="14" y1="8" x2="14.01" y2="8"/><line x1="18" y1="8" x2="18.01" y2="8"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="10" y1="12" x2="10.01" y2="12"/><line x1="14" y1="12" x2="14.01" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
                <span>Shortcuts ({isMac ? 'macOS ' : 'Windows 🪟'})</span>
              </div>
              <button className="wb-shortcuts-close" onClick={() => setShowShortcuts(false)}>✕</button>
            </div>
            <div className="wb-shortcuts-grid">
              {shortcutsList.map(item => (
                <div key={item.key} className="wb-shortcut-item">
                  <span className="wb-shortcut-desc">{item.desc}</span>
                  <kbd className="wb-shortcut-key">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
