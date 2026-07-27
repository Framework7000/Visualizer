import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type FolderColor = 'purple' | 'cyan' | 'green' | 'red' | 'amber' | 'white'

export interface SavedFile {
  id: string
  name: string
  language: 'python' | 'learn'
  code: string
  starred?: boolean
  color?: FolderColor
}

export const FOLDER_COLORS: { name: FolderColor; hex: string; label: string }[] = [
  { name: 'purple', hex: '#8E5BFF', label: 'Purple' },
  { name: 'cyan', hex: '#38BDF8', label: 'Cyan' },
  { name: 'green', hex: '#10B981', label: 'Green' },
  { name: 'red', hex: '#F43F5E', label: 'Red' },
  { name: 'amber', hex: '#F59E0B', label: 'Amber' },
  { name: 'white', hex: '#E2E8F0', label: 'White' },
]

const STARTER_FILES: SavedFile[] = [
  {
    id: 'sample-1',
    name: 'Bubble Sort Visualiser.py',
    language: 'learn',
    code: 'numbers = [64, 34, 25, 12, 22, 11, 90]\nn = len(numbers)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if numbers[j] > numbers[j + 1]:\n            temp = numbers[j]\n            numbers[j] = numbers[j + 1]\n            numbers[j + 1] = temp\nprint("Sorted array:", numbers)',
    starred: true,
    color: 'purple'
  },
  {
    id: 'sample-2',
    name: 'Counting Stars Loop.py',
    language: 'learn',
    code: 'stars = 0\nfor i in range(1, 6):\n    stars = stars + i\n    print("Step", i, "-> Total stars:", stars)\nprint("Final star count:", stars)',
    starred: false,
    color: 'cyan'
  },
  {
    id: 'sample-3',
    name: 'Matplotlib Data Chart.py',
    language: 'python',
    code: 'import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nplt.figure(figsize=(6, 4))\nplt.plot(x, y, color="#8E5BFF", linewidth=2.5, label="Sin Wave")\nplt.title("Wave Visualisation")\nplt.xlabel("X Axis")\nplt.ylabel("Y Axis")\nplt.grid(True, alpha=0.3)\nplt.show()',
    starred: true,
    color: 'green'
  },
  {
    id: 'sample-4',
    name: 'Odd or Even Checker.py',
    language: 'learn',
    code: 'numbers = [4, 7, 10, 3, 8]\nfor n in numbers:\n    if n % 2 == 0:\n        print(n, "is even")\n    else:\n        print(n, "is odd")',
    starred: false,
    color: 'amber'
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
  const [searchFocused, setSearchFocused] = useState(false)
  const [filter, setFilter] = useState<'all' | 'python' | 'learn' | 'starred'>('all')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLang, setNewFileLang] = useState<'learn' | 'python'>('learn')

  // Instant Live Drag & Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  // Color Picker & Inline Rename State
  const [colorPickerFileId, setColorPickerFileId] = useState<string | null>(null)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [starBurstId, setStarBurstId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('gradenext_user_files', JSON.stringify(files))
  }, [files])

  // Global shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const inputEl = document.querySelector('.files-search-input.inline') as HTMLInputElement
        if (inputEl) inputEl.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const changeFileColor = (id: string, color: FolderColor, e: React.MouseEvent) => {
    e.stopPropagation()
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, color } : f))
    )
    setColorPickerFileId(null)
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
      starred: false,
      color: 'purple'
    }
    setFiles([newFile, ...files])
    setNewFileName('')
    setNewModalOpen(false)
  }

  const openFile = (file: SavedFile) => {
    if (editingFileId || colorPickerFileId) return
    if (file.language === 'python') {
      navigate('/workbench')
    } else {
      navigate('/', { state: { code: file.code } })
    }
  }

  // Instant Live Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIdx === null || draggedIdx === targetIndex) return

    // Live instant shifting while dragging
    const updated = [...files]
    const [movedItem] = updated.splice(draggedIdx, 1)
    updated.splice(targetIndex, 0, movedItem)
    setFiles(updated)
    setDraggedIdx(targetIndex)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
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
    <div className="files-page-container ultra-minimal" onClick={() => setColorPickerFileId(null)}>
      {/* Full Page Ambient Glow & Animated Tech Grid Background */}
      <div className="files-ambient-bg full-page">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="files-animated-grid"></div>
      </div>

      {/* Row 1: Saved Files Title & Precise Description */}
      <div className="files-header-title-row">
        <h1 className="files-main-title">Saved Files</h1>
        <p className="files-subtitle">Manage, edit, and launch your saved Python scripts and algorithm visualisations.</p>
      </div>

      {/* Row 2: ONE SINGLE INTEGRATED ROW - Google Style Search Bar on Left, Filter Pills + Plus Button on Right */}
      <div className="files-unified-toolbar">
        <div className={`files-search-wrap inline google-style ${searchFocused ? 'focused' : ''}`}>
          <div className="search-leading">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            className="files-search-input inline google-style"
            placeholder="Search scripts, algorithms or files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          <div className="search-trailing">
            {search ? (
              <button className="clear-search-btn" onClick={() => setSearch('')} title="Clear search">✕</button>
            ) : (
              <kbd className="search-shortcut-badge">⌘K</kbd>
            )}
          </div>

          {/* Google-style Autocomplete Suggestion Dropdown */}
          {searchFocused && search.trim().length > 0 && (
            <div className="google-search-dropdown">
              {filteredFiles.length > 0 ? (
                filteredFiles.map(file => (
                  <div
                    key={file.id}
                    className="search-suggestion-item"
                    onMouseDown={() => openFile(file)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span className="suggestion-name">{file.name}</span>
                    <span className="suggestion-badge">{file.language === 'python' ? 'Python 3.11' : 'Learn Mode'}</span>
                  </div>
                ))
              ) : (
                <div className="search-suggestion-empty">No matching files found</div>
              )}
            </div>
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
            ★ ({starredCount})
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

      {/* Smooth Shifting Reorderable Draggable Folder Cards Grid */}
      {filteredFiles.length > 0 ? (
        <div className="folder-grid ultra-minimal">
          {filteredFiles.map((file, idx) => {
            const fileColor = file.color || 'purple'
            const isColorPickerOpen = colorPickerFileId === file.id

            return (
              <div
                className={`folder-card ultra-minimal color-${fileColor} ${draggedIdx === idx ? 'is-dragging-live' : ''}`}
                key={file.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                {/* Folder Top Tab Curve */}
                <div className="folder-card-tab">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span className="folder-tab-label">{file.language === 'python' ? 'PYTHON 3.11' : 'LEARN ALGO'}</span>
                </div>

                <div className="folder-card-header">
                  {/* Folder Color Palette Picker Trigger */}
                  <button
                    className="folder-color-trigger"
                    title="Change folder color"
                    onClick={(e) => {
                      e.stopPropagation()
                      setColorPickerFileId(isColorPickerOpen ? null : file.id)
                    }}
                  >
                    <span className={`color-dot color-${fileColor}`} />
                  </button>

                  <button
                    className={`star-btn ${file.starred ? 'active' : ''} ${starBurstId === file.id ? 'burst' : ''}`}
                    title={file.starred ? 'Unstar' : 'Star project'}
                    onClick={e => toggleStar(file.id, e)}
                  >
                    ★
                  </button>

                  {/* Color Palette Popover Dropdown */}
                  {isColorPickerOpen && (
                    <div className="folder-color-popover" onClick={e => e.stopPropagation()}>
                      <div className="color-popover-title">Folder Accent</div>
                      <div className="color-swatch-grid">
                        {FOLDER_COLORS.map(c => (
                          <button
                            key={c.name}
                            className={`color-swatch color-${c.name} ${fileColor === c.name ? 'active' : ''}`}
                            title={c.label}
                            onClick={(e) => changeFileColor(file.id, c.name, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="folder-card-body ultra-minimal">
                  <div
                    className="folder-icon-wrap"
                    title="Click to change folder color"
                    onClick={(e) => {
                      e.stopPropagation()
                      setColorPickerFileId(isColorPickerOpen ? null : file.id)
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="folder-svg-icon">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
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
                  <button className="folder-open-btn ultra-minimal" title="Open script" onClick={(e) => { e.stopPropagation(); openFile(file); }}>
                    Open →
                  </button>
                </div>
              </div>
            )
          })}
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
