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

const DIFF_COLORS: Record<string, string> = { Easy: '#34D399', Medium: '#F59E0B', Hard: '#EF4444' }
const LANG_COLORS: Record<string, string> = { Python: '#38BDF8', 'Web Dev': '#F472B6', Java: '#34D399' }

export default function ExercisesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'Python' | 'Web Dev' | 'Java'>('all')
  const [diffFilter, setDiffFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const filtered = EXERCISES.filter((ex) => {
    if (filter !== 'all' && ex.lang !== filter) return false
    if (diffFilter !== 'all' && ex.difficulty !== diffFilter) return false
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalQuestions = EXERCISES.reduce((a, e) => a + e.questions, 0)
  const doneQuestions = EXERCISES.reduce((a, e) => a + e.done, 0)
  const totalDoneExercises = EXERCISES.filter((e) => e.done === e.questions).length
  const totalInProgressExercises = EXERCISES.filter((e) => e.done > 0 && e.done < e.questions).length

  function triggerToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleLaunchExercise(ex: Exercise) {
    triggerToast(`Launching "${ex.title}" in ${ex.lang === 'Web Dev' ? 'Workbench' : 'Visualiser'}!`)
    setTimeout(() => {
      if (ex.lang === 'Web Dev') {
        navigate('/workbench')
      } else {
        navigate('/visualiser')
      }
    }, 400)
  }

  return (
    <div className="exercises-page">
      {/* Floating Toast */}
      {toast && (
        <div className="wb-floating-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Stats Banner */}
      <div className="exercises-hero-header">
        <div className="ex-hero-text">
          <h1 className="exercises-title">Coding Exercises &amp; Challenges</h1>
          <p className="exercises-sub">Master algorithm concepts, data structures, and live web apps with interactive step-by-step guidance.</p>
        </div>

        <div className="ex-stats-grid">
          <div className="ex-stat-card">
            <span className="ex-stat-val" style={{ color: '#34D399' }}>{totalDoneExercises}</span>
            <span className="ex-stat-lbl">Completed</span>
          </div>
          <div className="ex-stat-card">
            <span className="ex-stat-val" style={{ color: '#F59E0B' }}>{totalInProgressExercises}</span>
            <span className="ex-stat-lbl">In Progress</span>
          </div>
          <div className="ex-stat-card">
            <span className="ex-stat-val" style={{ color: '#8E5BFF' }}>{doneQuestions * 25} XP</span>
            <span className="ex-stat-lbl">XP Earned</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="exercises-overall-progress">
        <div className="ex-prog-header">
          <span>Overall Course Progress</span>
          <span className="ex-prog-count">{doneQuestions} / {totalQuestions} Questions Passed</span>
        </div>
        <div className="exercises-progress-bar">
          <div
            className="epb-fill"
            style={{ width: `${Math.round((doneQuestions / totalQuestions) * 100)}%` }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="exercises-filters">
        <div className="ex-filter-top-row">
          <div className="filter-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search exercises by title or tag (e.g. recursion, sorting, html)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="exercises-search-input"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        <div className="ex-filter-bottom-row">
          <div className="filter-group">
            <span className="filter-group-label">Language:</span>
            <div className="filter-pills">
              {(['all', 'Python', 'Web Dev', 'Java'] as const).map((l) => (
                <button
                  key={l}
                  className={`filter-pill ${filter === l ? 'active' : ''}`}
                  onClick={() => setFilter(l)}
                >
                  {l === 'all' ? 'All Languages' : l}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Difficulty:</span>
            <div className="filter-pills">
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  className={`filter-pill ${diffFilter === d ? 'active' : ''}`}
                  style={
                    diffFilter === d && d !== 'all'
                      ? { background: DIFF_COLORS[d] + '22', borderColor: DIFF_COLORS[d], color: DIFF_COLORS[d] }
                      : {}
                  }
                  onClick={() => setDiffFilter(d)}
                >
                  {d === 'all' ? 'All Levels' : d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="exercises-grid">
        {filtered.map((ex) => {
          const pct = Math.round((ex.done / ex.questions) * 100)
          const btnClass = pct === 100 ? 'btn-completed' : pct > 0 ? 'btn-inprogress' : 'btn-start'

          return (
            <div key={ex.id} className="exercise-card" onClick={() => handleLaunchExercise(ex)}>
              <div className="ex-card-top">
                <div className="ex-badge-group">
                  <span className="ex-lang-tag" style={{ color: LANG_COLORS[ex.lang] ?? '#8E5BFF' }}>
                    {ex.lang}
                  </span>
                  <span className="ex-diff-tag" style={{ color: DIFF_COLORS[ex.difficulty] }}>
                    {ex.difficulty}
                  </span>
                </div>
                {pct === 100 && (
                  <span className="ex-done-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Completed</span>
                  </span>
                )}
              </div>

              <h3 className="ex-title">{ex.title}</h3>

              <div className="ex-tags">
                {ex.tags.map((t) => (
                  <span key={t} className="ex-tag">{t}</span>
                ))}
              </div>

              <div className="ex-progress">
                <div className="ex-progress-bar">
                  <div
                    className="ex-progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? '#34D399' : 'linear-gradient(90deg, #8E5BFF, #38BDF8)',
                    }}
                  />
                </div>
                <span className="ex-progress-text">{ex.done}/{ex.questions}</span>
              </div>

              <button className={`ex-start-btn ${btnClass}`}>
                <span>{pct === 0 ? 'Start Exercise' : pct === 100 ? 'Review Code' : 'Continue Challenge'}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
