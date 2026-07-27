import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface SavedFile {
  id: string
  name: string
  language: 'python' | 'learn'
  code: string
  starred?: boolean
}

const STARTER_FILES: SavedFile[] = [
  {
    id: 'sample-1',
    name: 'Bubble Sort Visualiser.py',
    language: 'learn',
    code: 'numbers = [64, 34, 25, 12, 22, 11, 90]\nn = len(numbers)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if numbers[j] > numbers[j + 1]:\n            temp = numbers[j]\n            numbers[j] = numbers[j + 1]\n            numbers[j + 1] = temp\nprint("Sorted array:", numbers)',
    starred: true
  },
  {
    id: 'sample-2',
    name: 'Counting Stars Loop.py',
    language: 'learn',
    code: 'stars = 0\nfor i in range(1, 6):\n    stars = stars + i\n    print("Step", i, "-> Total stars:", stars)\nprint("Final star count:", stars)',
    starred: false
  },
  {
    id: 'sample-3',
    name: 'Matplotlib Data Chart.py',
    language: 'python',
    code: 'import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nplt.figure(figsize=(6, 4))\nplt.plot(x, y, color="#8E5BFF", linewidth=2.5, label="Sin Wave")\nplt.title("Wave Visualisation")\nplt.xlabel("X Axis")\nplt.ylabel("Y Axis")\nplt.grid(True, alpha=0.3)\nplt.show()',
    starred: true
  },
  {
    id: 'sample-4',
    name: 'Odd or Even Checker.py',
    language: 'learn',
    code: 'numbers = [4, 7, 10, 3, 8]\nfor n in numbers:\n    if n % 2 == 0:\n        print(n, "is even")\n    else:\n        print(n, "is odd")',
    starred: false
  }
]

export default function FilesPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<SavedFile[]>(() => {
    const local = localStorage.getItem('gradenext_user_files')
    if (local) {
      try {
        return JSON.parse(local)
      } catch {
        return STARTER_FILES
      }
    }
    return STARTER_FILES
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'python' | 'learn' | 'starred'>('all')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLang, setNewFileLang] = useState<'learn' | 'python'>('learn')

  // Drag & Drop State for File Cards
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Inline Rename & Star Animation State
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [starBurstId, setStarBurstId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('gradenext_user_files', JSON.stringify(files))
  }, [files])

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarBurstId(id)
    setTimeout(() => setStarBurstId(null), 400)
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, starred: !f.starred } : f))
    )
  }

  const deleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== id))
    }
  }

  const startRename = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingFileId(file.id)
    setEditingName(file.name)
  }

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      setFiles(prev =>
        prev.map(f => (f.id === id ? { ...f, name: editingName.trim() } : f))
      )
    }
    setEditingFileId(null)
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) return
    const filename = newFileName.endsWith('.py') ? newFileName.trim() : `${newFileName.trim()}.py`
    const newFile: SavedFile = {
      id: `file-${Date.now()}`,
      name: filename,
      language: newFileLang,
      code: newFileLang === 'python' ? '# Write Python code here\nprint("Hello!")' : '# Write code here\nx = 10',
      starred: false
    }
    setFiles([newFile, ...files])
    setNewFileName('')
    setNewModalOpen(false)
  }

  const openFile = (file: SavedFile) => {
    if (editingFileId) return
    if (file.language === 'python') {
      navigate('/workbench')
    } else {
      navigate('/', { state: { code: file.code } })
    }
  }

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }

    const updated = [...files]
    const [movedItem] = updated.splice(draggedIdx, 1)
    updated.splice(dropIndex, 0, movedItem)
    setFiles(updated)
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'starred') return f.starred
    if (filter === 'python') return f.language === 'python'
    if (filter === 'learn') return f.language === 'learn'
    return true
  })

  const starredCount = files.filter(f => f.starred).length

  return (
    <div className="files-page-container ultra-minimal">
      {/* Full Page Ambient Glow Background */}
      <div className="files-ambient-bg full-page">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
      </div>

      {/* Row 1: Saved Files Title & Precise Description */}
      <div className="files-header-title-row">
        <h1 className="files-main-title">Saved Files</h1>
        <p className="files-subtitle">Manage, edit, and launch your saved Python scripts and algorithm visualisations.</p>
      </div>

      {/* Row 2: ONE SINGLE INTEGRATED ROW - Search Input on Left, Filter Pills + Plus Button on Right */}
      <div className="files-unified-toolbar">
        <div className="files-search-wrap inline">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="files-search-input inline"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Filter Pills + Plus Button in exact same row with unified styling */}
        <div className="files-filter-group">
          <button className={`unified-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({files.length})
          </button>
          <button className={`unified-pill ${filter === 'learn' ? 'active' : ''}`} onClick={() => setFilter('learn')}>
            Learn
          </button>
          <button className={`unified-pill ${filter === 'python' ? 'active' : ''}`} onClick={() => setFilter('python')}>
            Python
          </button>
          <button className={`unified-pill ${filter === 'starred' ? 'active' : ''}`} onClick={() => setFilter('starred')}>
            ★ Starred ({starredCount})
          </button>
          <button
            className="unified-pill plus-btn"
            onClick={() => setNewModalOpen(true)}
            title="New File"
          >
            +
          </button>
        </div>
      </div>

      {/* Reorderable Draggable Folder Cards Grid */}
      {filteredFiles.length > 0 ? (
        <div className="folder-grid ultra-minimal">
          {filteredFiles.map((file, idx) => (
            <div
              className={`folder-card ultra-minimal draggable ${draggedIdx === idx ? 'is-dragging' : ''} ${dragOverIdx === idx ? 'is-drag-over' : ''}`}
              key={file.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
              onClick={() => openFile(file)}
            >
              {/* Folder Top Tab Curve */}
              <div className="folder-card-tab">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span className="folder-tab-label">{file.language === 'python' ? 'PYTHON 3.11' : 'LEARN ALGO'}</span>
              </div>

              <div className="folder-card-header">
                <button
                  className={`star-btn ${file.starred ? 'active' : ''} ${starBurstId === file.id ? 'burst' : ''}`}
                  title={file.starred ? 'Unstar' : 'Star project'}
                  onClick={e => toggleStar(file.id, e)}
                >
                  ★
                </button>
              </div>

              <div className="folder-card-body ultra-minimal">
                <div className="folder-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>

                {editingFileId === file.id ? (
                  <input
                    type="text"
                    className="folder-card-title-input"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={() => saveRename(file.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveRename(file.id)
                      if (e.key === 'Escape') setEditingFileId(null)
                    }}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <h3
                    className="folder-card-title editable"
                    title="Double click or click edit icon to rename"
                    onDoubleClick={e => startRename(file, e)}
                  >
                    <span>{file.name}</span>
                    <button
                      className="title-edit-btn"
                      title="Rename file"
                      onClick={e => startRename(file, e)}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                  </h3>
                )}
              </div>

              <div className="folder-card-footer ultra-minimal">
                <button className="folder-act-btn delete" title="Delete file" onClick={e => deleteFile(file.id, e)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <button className="folder-open-btn ultra-minimal">
                  Open →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="files-empty-card ultra-minimal">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <p className="empty-desc">No files found</p>
        </div>
      )}

      {/* New File Modal */}
      {newModalOpen && (
        <div className="files-modal-backdrop" onClick={() => setNewModalOpen(false)}>
          <div className="files-modal-card minimal" onClick={e => e.stopPropagation()}>
            <div className="files-modal-header">
              <h3>New File</h3>
              <button className="modal-close-btn" onClick={() => setNewModalOpen(false)}>✕</button>
            </div>
            <div className="files-modal-body">
              <label className="modal-field-label">Filename</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. script.py"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                autoFocus
              />

              <label className="modal-field-label">Environment</label>
              <div className="modal-mode-select">
                <button
                  type="button"
                  className={`modal-mode-option ${newFileLang === 'learn' ? 'active' : ''}`}
                  onClick={() => setNewFileLang('learn')}
                >
                  <span className="option-title">Learn Mode</span>
                </button>
                <button
                  type="button"
                  className={`modal-mode-option ${newFileLang === 'python' ? 'active' : ''}`}
                  onClick={() => setNewFileLang('python')}
                >
                  <span className="option-title">Python 3.11</span>
                </button>
              </div>
            </div>
            <div className="files-modal-footer">
              <button className="modal-btn cancel" onClick={() => setNewModalOpen(false)}>Cancel</button>
              <button className="modal-btn submit" onClick={handleCreateFile}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
