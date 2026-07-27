import { useState } from 'react'
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
  },
  {
    id: 'bubble',
    title: 'Bubble Sort',
    lang: 'Python',
    difficulty: 'Easy',
    questions: 5,
    done: 5,
    tags: ['Sorting', 'Loops'],
  },
  {
    id: 'binary',
    title: 'Binary Search',
    lang: 'Python',
    difficulty: 'Medium',
    questions: 5,
    done: 1,
    tags: ['Search', 'Divide & Conquer'],
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

const DIFF_COLORS: Record<string, string> = {
  Easy: '#10B981',
  Medium: '#F59E0B',
  Hard: '#F43F5E'
}

export default function ExercisesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'Python' | 'Web Dev' | 'Java'>('all')
  const [diffFilter, setDiffFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = EXERCISES.filter((ex) => {
    if (filter !== 'all' && ex.lang !== filter) return false
    if (diffFilter !== 'all' && ex.difficulty !== diffFilter) return false
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase())) return false
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
    <div className="challenges-page-container">
      {/* Background Ambient Glow */}
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

      {/* Page Title Row */}
      <div className="challenges-header-row">
        <h1 className="challenges-main-title animated-shimmer">Coding Challenges</h1>
        <p className="challenges-subtitle">Interactive programming quests and algorithmic benchmarks.</p>
      </div>

      {/* Unified Toolbar Row */}
      <div className="challenges-toolbar">
        {/* Search Input */}
        <div className={`challenges-search-wrap ${searchFocused ? 'focused' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="challenges-search-input"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
          )}

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
                    <span className="suggestion-badge" style={{ color: DIFF_COLORS[ex.difficulty] }}>{ex.lang} • {ex.difficulty}</span>
                  </div>
                ))
              ) : (
                <div className="search-suggestion-empty">No matching quests found</div>
              )}
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="challenges-filter-group">
          {(['all', 'Python', 'Web Dev', 'Java'] as const).map((l) => (
            <button
              key={l}
              className={`challenge-pill ${filter === l ? 'active' : ''}`}
              onClick={() => setFilter(l)}
            >
              {l === 'all' ? 'All Languages' : l}
            </button>
          ))}

          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
            <button
              key={d}
              className={`challenge-pill ${diffFilter === d ? 'active' : ''}`}
              onClick={() => setDiffFilter(d)}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Larger Cyber Quest Challenge Cards Grid */}
      {filtered.length > 0 ? (
        <div className="challenges-grid">
          {filtered.map((ex) => {
            const pct = Math.round((ex.done / ex.questions) * 100)
            const diffColor = DIFF_COLORS[ex.difficulty] || '#8E5BFF'
            const isCompleted = pct === 100

            return (
              <div
                className="challenge-cyber-card"
                key={ex.id}
                style={{ '--diff-color': diffColor } as React.CSSProperties}
              >
                {/* Cyber Card Top Stripe */}
                <div className="cyber-card-top-bar" />

                <div className="cyber-card-header">
                  <div className="cyber-badge-wrap">
                    <span className="cyber-lang-badge">{ex.lang}</span>
                    <span className="cyber-diff-badge">
                      <span className="diff-dot" />
                      {ex.difficulty}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="cyber-status-completed">✓ Passed</span>
                  ) : (
                    <span className="cyber-status-count">{ex.done}/{ex.questions}</span>
                  )}
                </div>

                <div className="cyber-card-body">
                  <h3 className="cyber-card-title">{ex.title}</h3>
                </div>

                <div className="cyber-card-footer">
                  <div className="cyber-progress-track">
                    <div className="cyber-progress-fill" style={{ width: `${pct}%` }} />
                  </div>

                  <button
                    className="challenge-launch-btn"
                    onClick={(e) => handleLaunchExercise(ex, e)}
                  >
                    <span>{pct === 0 ? 'Start Quest' : pct === 100 ? 'Review' : 'Continue'} →</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="files-empty-card ultra-minimal">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="empty-desc">No quests match your filter</p>
        </div>
      )}
    </div>
  )
}
