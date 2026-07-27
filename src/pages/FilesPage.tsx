import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface SavedFile {
  id: string
  name: string
  language: 'python' | 'learn'
  code: string
  updatedAt: string
  lines: number
  starred?: boolean
  description?: string
  tags?: string[]
}

const STARTER_FILES: SavedFile[] = [
  {
    id: 'sample-1',
    name: 'Bubble Sort Visualiser.py',
    language: 'learn',
    code: 'numbers = [64, 34, 25, 12, 22, 11, 90]\nn = len(numbers)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if numbers[j] > numbers[j + 1]:\n            temp = numbers[j]\n            numbers[j] = numbers[j + 1]\n            numbers[j + 1] = temp\nprint("Sorted array:", numbers)',
    updatedAt: '2 hours ago',
    lines: 10,
    starred: true,
    description: 'Animated step-by-step array sorting with live pointer indicators.',
    tags: ['Algorithms', 'Sorting', 'Arrays']
  },
  {
    id: 'sample-2',
    name: 'Counting Stars Loop.py',
    language: 'learn',
    code: 'stars = 0\nfor i in range(1, 6):\n    stars = stars + i\n    print("Step", i, "-> Total stars:", stars)\nprint("Final star count:", stars)',
    updatedAt: 'Yesterday',
    lines: 6,
    starred: false,
    description: 'Beginner accumulator pattern for practicing loop state.',
    tags: ['Beginner', 'Loops']
  },
  {
    id: 'sample-3',
    name: 'Matplotlib Data Chart.py',
    language: 'python',
    code: 'import matplotlib.pyplot as plt\nimport numpy as np\n\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\nplt.figure(figsize=(6, 4))\nplt.plot(x, y, color="#8E5BFF", linewidth=2.5, label="Sin Wave")\nplt.title("Wave Visualisation")\nplt.xlabel("X Axis")\nplt.ylabel("Y Axis")\nplt.grid(True, alpha=0.3)\nplt.show()',
    updatedAt: '3 days ago',
    lines: 12,
    starred: true,
    description: 'Sine wave plotter using Pyodide, NumPy, and Matplotlib.',
    tags: ['Data Science', 'Pyodide', 'Charts']
  },
  {
    id: 'sample-4',
    name: 'Odd or Even Checker.py',
    language: 'learn',
    code: 'numbers = [4, 7, 10, 3, 8]\nfor n in numbers:\n    if n % 2 == 0:\n        print(n, "is even")\n    else:\n        print(n, "is odd")',
    updatedAt: '4 days ago',
    lines: 6,
    starred: false,
    description: 'Conditional checking with list iteration and modulo math.',
    tags: ['Conditionals', 'Math']
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

  useEffect(() => {
    localStorage.setItem('gradenext_user_files', JSON.stringify(files))
  }, [files])

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, starred: !f.starred } : f))
    )
  }

  const deleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this project?')) {
      setFiles(prev => prev.filter(f => f.id !== id))
    }
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) return
    const filename = newFileName.endsWith('.py') ? newFileName.trim() : `${newFileName.trim()}.py`
    const newFile: SavedFile = {
      id: `file-${Date.now()}`,
      name: filename,
      language: newFileLang,
      code: newFileLang === 'python' ? '# Write your Python code here\nprint("Hello, Visualizer!")' : '# Write your code here\nx = 10\nprint("X =", x)',
      updatedAt: 'Just now',
      lines: 3,
      starred: false,
      description: 'Custom user project script.',
      tags: ['Custom', newFileLang === 'python' ? 'Real Python' : 'Learn']
    }
    setFiles([newFile, ...files])
    setNewFileName('')
    setNewModalOpen(false)
  }

  const openFile = (file: SavedFile) => {
    if (file.language === 'python') {
      navigate('/workbench')
    } else {
      navigate('/', { state: { code: file.code } })
    }
  }

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          (f.description && f.description.toLowerCase().includes(search.toLowerCase())) ||
                          f.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    if (!matchesSearch) return false
    if (filter === 'starred') return f.starred
    if (filter === 'python') return f.language === 'python'
    if (filter === 'learn') return f.language === 'learn'
    return true
  })

  const starredCount = files.filter(f => f.starred).length

  return (
    <div className="files-page-container">
      {/* Header Banner */}
      <div className="files-header-row">
        <div className="files-title-group">
          <div className="files-badge-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Workspace Library
          </div>
          <h1 className="files-main-title">Projects &amp; Saved Files</h1>
          <p className="files-subtitle">Manage your Python scripts, algorithm visualisations, and workbench code snippets.</p>
        </div>

        <button className="files-create-btn" onClick={() => setNewModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Project
        </button>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="files-toolbar">
        <div className="files-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="files-search-input"
            placeholder="Search projects by name, tag, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="files-filter-pills">
          <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({files.length})
          </button>
          <button className={`filter-pill ${filter === 'learn' ? 'active' : ''}`} onClick={() => setFilter('learn')}>
            Learn Mode
          </button>
          <button className={`filter-pill ${filter === 'python' ? 'active' : ''}`} onClick={() => setFilter('python')}>
            Real Python
          </button>
          <button className={`filter-pill ${filter === 'starred' ? 'active' : ''}`} onClick={() => setFilter('starred')}>
            Starred ({starredCount})
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="files-grid">
          {filteredFiles.map(file => (
            <div className="file-card" key={file.id} onClick={() => openFile(file)}>
              <div className="file-card-top">
                <span className={`file-lang-pill ${file.language}`}>
                  {file.language === 'python' ? 'Python 3.11' : 'Learn Algo'}
                </span>
                <button
                  className={`star-btn ${file.starred ? 'active' : ''}`}
                  title={file.starred ? 'Unstar' : 'Star project'}
                  onClick={e => toggleStar(file.id, e)}
                >
                  ★
                </button>
              </div>

              <div className="file-card-body">
                <div className="file-card-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="file-card-info">
                  <h3 className="file-card-title">{file.name}</h3>
                  <p className="file-card-desc">{file.description || 'Saved Python source script.'}</p>
                </div>
              </div>

              {file.tags && (
                <div className="file-tags-row">
                  {file.tags.map((t, idx) => (
                    <span className="file-tag" key={idx}>{t}</span>
                  ))}
                </div>
              )}

              <div className="file-card-footer">
                <span className="file-meta">{file.lines} lines • {file.updatedAt}</span>
                <div className="file-actions">
                  <button className="file-act-btn delete" title="Delete file" onClick={e => deleteFile(file.id, e)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <button className="file-act-btn open">
                    Open
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="files-empty-card">
          <div className="empty-glow-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 className="empty-title">No matching files found</h3>
          <p className="empty-desc">
            {search ? `No projects match "${search}". Try clearing search keywords.` : 'You have no saved projects in this filter view.'}
          </p>
          <div className="empty-actions">
            {search && (
              <button className="empty-btn secondary" onClick={() => setSearch('')}>
                Clear Search Filter
              </button>
            )}
            <button className="empty-btn primary" onClick={() => setNewModalOpen(true)}>
              + Create New Project
            </button>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {newModalOpen && (
        <div className="files-modal-backdrop" onClick={() => setNewModalOpen(false)}>
          <div className="files-modal-card" onClick={e => e.stopPropagation()}>
            <div className="files-modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close-btn" onClick={() => setNewModalOpen(false)}>✕</button>
            </div>
            <div className="files-modal-body">
              <label className="modal-field-label">Project Name</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Binary Search Algorithm.py"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                autoFocus
              />

              <label className="modal-field-label">Environment Mode</label>
              <div className="modal-mode-select">
                <button
                  type="button"
                  className={`modal-mode-option ${newFileLang === 'learn' ? 'active' : ''}`}
                  onClick={() => setNewFileLang('learn')}
                >
                  <span className="option-title">Learn Mode</span>
                  <span className="option-desc">Animated step-by-step memory visualiser</span>
                </button>
                <button
                  type="button"
                  className={`modal-mode-option ${newFileLang === 'python' ? 'active' : ''}`}
                  onClick={() => setNewFileLang('python')}
                >
                  <span className="option-title">Real Python 3.11</span>
                  <span className="option-desc">Pyodide NumPy/Pandas & Matplotlib lab</span>
                </button>
              </div>
            </div>
            <div className="files-modal-footer">
              <button className="modal-btn cancel" onClick={() => setNewModalOpen(false)}>Cancel</button>
              <button className="modal-btn submit" onClick={handleCreateFile}>Create File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
