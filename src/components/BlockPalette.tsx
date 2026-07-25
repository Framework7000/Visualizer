import { useState } from 'react'

interface BlockItem {
  id: string
  label: string
  snippet: string
  category: 'variables' | 'loops' | 'logic' | 'print' | 'turtle'
  icon: string
}

const BLOCKS: BlockItem[] = [
  // Turtle
  { id: 't_fd', label: 'forward(50)', snippet: 'forward(50)\n', category: 'turtle', icon: '🐢' },
  { id: 't_rt', label: 'right(90)', snippet: 'right(90)\n', category: 'turtle', icon: '🔄' },
  { id: 't_lt', label: 'left(90)', snippet: 'left(90)\n', category: 'turtle', icon: '↺' },
  { id: 't_color', label: 'color("#22d3ee")', snippet: 'color("#22d3ee")\n', category: 'turtle', icon: '🎨' },
  { id: 't_penup', label: 'pen_up()', snippet: 'pen_up()\n', category: 'turtle', icon: '🖊️' },
  { id: 't_pendown', label: 'pen_down()', snippet: 'pen_down()\n', category: 'turtle', icon: '✏️' },

  // Variables
  { id: 'v_num', label: 'x = 10', snippet: 'x = 10\n', category: 'variables', icon: '📦' },
  { id: 'v_list', label: 'nums = [5, 2, 8]', snippet: 'nums = [5, 2, 8]\n', category: 'variables', icon: '📊' },

  // Loops
  { id: 'l_range', label: 'for i in range(5):', snippet: 'for i in range(5):\n    print(i)\n', category: 'loops', icon: '🔁' },
  { id: 'l_list', label: 'for item in list:', snippet: 'for item in nums:\n    print(item)\n', category: 'loops', icon: '🔄' },

  // Logic
  { id: 'c_if', label: 'if x > 5:', snippet: 'if x > 5:\n    print("Big!")\nelse:\n    print("Small!")\n', category: 'logic', icon: '🔀' },

  // Print
  { id: 'p_text', label: 'print("Hello")', snippet: 'print("Hello world!")\n', category: 'print', icon: '🖨️' },
]

interface Props {
  onInsertSnippet: (snippet: string) => void
}

export default function BlockPalette({ onInsertSnippet }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'All Blocks', icon: '🧱' },
    { id: 'turtle', label: 'Turtle', icon: '🐢' },
    { id: 'loops', label: 'Loops', icon: '🔁' },
    { id: 'variables', label: 'Variables', icon: '📦' },
    { id: 'logic', label: 'Logic', icon: '🔀' },
    { id: 'print', label: 'Output', icon: '🖨️' },
  ]

  const filtered = activeCategory === 'all' ? BLOCKS : BLOCKS.filter((b) => b.category === activeCategory)

  return (
    <div className="block-palette">
      <div className="block-header">
        <span className="block-title">🧱 Quick Code Blocks</span>
        <span className="block-sub">Click a block to insert code</span>
      </div>

      <div className="block-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`block-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="block-chips">
        {filtered.map((block) => (
          <button
            key={block.id}
            className={`block-chip cat-${block.category}`}
            onClick={() => onInsertSnippet(block.snippet)}
            title={`Add ${block.label} to code`}
          >
            <span className="block-icon">{block.icon}</span>
            <span className="block-label">{block.label}</span>
            <span className="block-add">+</span>
          </button>
        ))}
      </div>
    </div>
  )
}
