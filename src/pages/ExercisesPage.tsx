import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Exercise {
  id: string
  title: string
  lang: 'Python' | 'Web Dev' | 'Java'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  questions: number
  done: number
  tags: string[]
  codeSnippet?: string
}

const EXERCISES: Exercise[] = [
  {
    id: 'fib',
    title: 'Fibonacci (Recursive)',
    lang: 'Python',
    difficulty: 'Easy',
    questions: 5,
    done: 4,
    tags: ['Recursion', 'Math'],
    codeSnippet: `# Fibonacci recursion challenge\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint("fib(6) =", fib(6))`
  },
  {
    id: 'bubble',
    title: 'Bubble Sort',
    lang: 'Python',
    difficulty: 'Easy',
    questions: 5,
    done: 5,
    tags: ['Sorting', 'Loops'],
    codeSnippet: `# Bubble sort algorithm\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nprint(bubble_sort([64, 34, 25, 12, 22]))`
  },
  {
    id: 'binary',
    title: 'Binary Search',
    lang: 'Python',
    difficulty: 'Medium',
    questions: 5,
    done: 1,
    tags: ['Search', 'Divide & Conquer'],
    codeSnippet: `# Binary search algorithm\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint("Found at index:", binary_search([2, 5, 8, 12, 16, 23, 38], 16))`
  },
  {
    id: 'merge',
    title: 'Merge Sort',
    lang: 'Python',
    difficulty: 'Medium',
    questions: 6,
    done: 0,
    tags: ['Sorting', 'Recursion'],
  },
  {
    id: 'calc-web',
    title: 'Web Calculator',
    lang: 'Web Dev',
    difficulty: 'Easy',
    questions: 4,
    done: 2,
    tags: ['HTML', 'JavaScript'],
  },
  {
    id: 'todo',
    title: 'Todo List App',
    lang: 'Web Dev',
    difficulty: 'Medium',
    questions: 6,
    done: 0,
    tags: ['HTML', 'CSS', 'JS'],
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    lang: 'Python',
    difficulty: 'Hard',
    questions: 8,
    done: 0,
    tags: ['Data Structures'],
  },
  {
    id: 'bst',
    title: 'Binary Search Tree',
    lang: 'Python',
    difficulty: 'Hard',
    questions: 8,
    done: 0,
    tags: ['Trees', 'Recursion'],
  },
  {
    id: 'palindrome',
    title: 'Palindrome Check',
    lang: 'Python',
    difficulty: 'Easy',
    questions: 3,
    done: 3,
    tags: ['Strings'],
  },
  {
    id: 'factorial',
    title: 'Factorial',
    lang: 'Python',
    difficulty: 'Easy',
    questions: 3,
    done: 3,
    tags: ['Recursion', 'Math'],
  },
  {
    id: 'portfolio',
    title: 'Portfolio Website',
    lang: 'Web Dev',
    difficulty: 'Medium',
    questions: 5,
    done: 0,
    tags: ['HTML', 'CSS'],
  },
  {
    id: 'quiz-app',
    title: 'Quiz App',
    lang: 'Web Dev',
    difficulty: 'Hard',
    questions: 8,
    done: 0,
    tags: ['HTML', 'CSS', 'JS'],
  },
]

const DIFF_ACCENTS: Record<string, { color: string; bg: string }> = {
  Easy: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  Medium: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  Hard: { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)' }
}

export default function ExercisesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'Python' | 'Web Dev' | 'Java'>('all')
  const [diffFilter, setDiffFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const inputEl = document.querySelector('.exercises-search-input.inline') as HTMLInputElement
        if (inputEl) inputEl.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filtered = EXERCISES.filter((ex) => {
    if (filter !== 'all' && ex.lang !== filter) return false
    if (diffFilter !== 'all' && ex.difficulty !== diffFilter) return false
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase()) && !ex.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  function triggerToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleLaunchExercise(ex: Exercise, e: React.MouseEvent) {
    e.stopPropagation()
    triggerToast(`Launching "${ex.title}"...`)
    setTimeout(() => {
      if (ex.lang === 'Web Dev') {
        navigate('/workbench')
      } else {
        navigate('/visualiser')
      }
    }, 350)
  }

  return (
    <div className="exercises-page-container ultra-minimal">
      {/* Full Page Ambient Glow & Animated Tech Grid Background */}
      <div className="files-ambient-bg full-page">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="files-animated-grid"></div>
      </div>

      {/* Floating Toast */}
      {toast && (
        <div className="wb-floating-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="files-header-title-row">
        <h1 className="files-main-title">Coding Exercises</h1>
        <p className="files-subtitle">Master algorithm concepts, data structures, and live web apps with interactive step-by-step challenges.</p>
      </div>

      {/* Single Integrated Toolbar Row */}
      <div className="files-unified-toolbar">
        {/* Google-Style Pill Search Bar */}
        <div className={`files-search-wrap inline google-style ${searchFocused ? 'focused' : ''}`}>
          <div className="search-leading">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            className="files-search-input inline google-style exercises-search-input"
            placeholder="Search exercises by title or tag (e.g. recursion, sorting)..."
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

          {/* Autocomplete Dropdown */}
          {searchFocused && search.trim().length > 0 && (
            <div className="google-search-dropdown">
              {filtered.length > 0 ? (
                filtered.map(ex => (
                  <div
                    key={ex.id}
                    className="search-suggestion-item"
                    onMouseDown={(e) => handleLaunchExercise(ex, e as any)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <span className="suggestion-name">{ex.title}</span>
                    <span className="suggestion-badge" style={{ color: DIFF_ACCENTS[ex.difficulty]?.color }}>{ex.lang} • {ex.difficulty}</span>
                  </div>
                ))
              ) : (
                <div className="search-suggestion-empty">No matching exercises found</div>
              )}
            </div>
          )}
        </div>

        {/* Frameless Filter Pills */}
        <div className="files-filter-group">
          {(['all', 'Python', 'Web Dev', 'Java'] as const).map((l) => (
            <button
              key={l}
              className={`unified-pill ${filter === l ? 'active' : ''}`}
              onClick={() => setFilter(l)}
            >
              {l === 'all' ? 'All Languages' : l}
            </button>
          ))}

          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
            <button
              key={d}
              className={`unified-pill ${diffFilter === d ? 'active' : ''}`}
              onClick={() => setDiffFilter(d)}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Exercise Cards Grid */}
      {filtered.length > 0 ? (
        <div className="folder-grid ultra-minimal">
          {filtered.map((ex) => {
            const pct = Math.round((ex.done / ex.questions) * 100)
            const accent = DIFF_ACCENTS[ex.difficulty] || { color: '#8E5BFF', bg: 'rgba(142, 91, 255, 0.12)' }
            const isCompleted = pct === 100

            return (
              <div
                className="folder-card ultra-minimal exercise-card-minimal"
                key={ex.id}
                style={{ '--folder-accent': accent.color } as React.CSSProperties}
              >
                {/* Curved Folder Top Tab */}
                <div className="folder-card-tab">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  <span className="folder-tab-label">{ex.lang.toUpperCase()} • {ex.difficulty.toUpperCase()}</span>
                </div>

                <div className="folder-card-header">
                  {isCompleted ? (
                    <span className="ex-completed-badge">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="ex-questions-count">
                      {ex.done}/{ex.questions} Passed
                    </span>
                  )}
                </div>

                <div className="folder-card-body ultra-minimal">
                  <div className="folder-icon-wrap" style={{ color: accent.color }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  </div>
                  <div className="ex-title-group">
                    <h3 className="folder-card-title">{ex.title}</h3>
                    <div className="ex-mini-tags">
                      {ex.tags.map((t) => (
                        <span key={t} className="ex-tag-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="folder-card-footer ultra-minimal">
                  <div className="ex-card-progress-bar">
                    <div
                      className="ex-card-progress-fill"
                      style={{ width: `${pct}%`, background: accent.color }}
                    />
                  </div>
                  <button
                    className="folder-open-btn ultra-minimal"
                    style={{ background: accent.color }}
                    onClick={(e) => handleLaunchExercise(ex, e)}
                  >
                    <span>{pct === 0 ? 'Start' : pct === 100 ? 'Review' : 'Continue'} →</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="files-empty-card ultra-minimal">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="empty-desc">No exercises found</p>
        </div>
      )}
    </div>
  )
}
