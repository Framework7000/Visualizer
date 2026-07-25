import { useState, useEffect } from 'react'

interface CommandItem {
  id: string
  title: string
  category: 'Actions' | 'Examples' | 'Modes'
  icon: string
  shortcut?: string
  action: () => void
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onRun: () => void
  onSelectExample: (id: string) => void
  onSelectMode: (mode: 'learn' | 'python') => void
  onToggleSound: () => void
}

export default function CommandPalette({
  isOpen,
  onClose,
  onRun,
  onSelectExample,
  onSelectMode,
  onToggleSound,
}: Props) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setQuery('')
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const items: CommandItem[] = [
    {
      id: 'run',
      title: 'Run & Watch Program',
      category: 'Actions',
      icon: '▶️',
      shortcut: 'Space',
      action: () => {
        onRun()
        onClose()
      },
    },
    {
      id: 'mode_learn',
      title: 'Switch to Learn Mode (Visualizer)',
      category: 'Modes',
      icon: '🎓',
      action: () => {
        onSelectMode('learn')
        onClose()
      },
    },
    {
      id: 'mode_python',
      title: 'Switch to Real Python Lab',
      category: 'Modes',
      icon: '🐍',
      action: () => {
        onSelectMode('python')
        onClose()
      },
    },
    {
      id: 'ex_star',
      title: 'Load Example: Glowing Star (Turtle)',
      category: 'Examples',
      icon: '🐢',
      action: () => {
        onSelectExample('turtle_star')
        onClose()
      },
    },
    {
      id: 'ex_spiral',
      title: 'Load Example: Rainbow Spiral (Turtle)',
      category: 'Examples',
      icon: '🎨',
      action: () => {
        onSelectExample('turtle_spiral')
        onClose()
      },
    },
    {
      id: 'ex_stars',
      title: 'Load Example: Counting Stars',
      category: 'Examples',
      icon: '⭐',
      action: () => {
        onSelectExample('counting')
        onClose()
      },
    },
    {
      id: 'sound',
      title: 'Toggle Step Audio Feedback',
      category: 'Actions',
      icon: '🔊',
      action: () => {
        onToggleSound()
        onClose()
      },
    },
  ]

  const filtered = query.trim()
    ? items.filter(
        (i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : items

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrapper">
          <span className="cmd-search-icon">🔍</span>
          <input
            type="text"
            className="cmd-input"
            placeholder="Type a command or search examples... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No matching commands found</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                className="cmd-item"
                onClick={item.action}
              >
                <span className="cmd-item-icon">{item.icon}</span>
                <span className="cmd-item-title">{item.title}</span>
                <span className="cmd-item-cat">{item.category}</span>
                {item.shortcut && <span className="cmd-shortcut">{item.shortcut}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
