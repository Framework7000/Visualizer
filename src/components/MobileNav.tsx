export type MobileTab = 'editor' | 'visualizer' | 'turtle' | 'examples'

interface Props {
  activeTab: MobileTab
  onSelectTab: (tab: MobileTab) => void
  hasTurtle?: boolean
}

export default function MobileNav({ activeTab, onSelectTab, hasTurtle }: Props) {
  return (
    <nav className="mobile-nav" aria-label="Mobile Navigation">
      <button
        className={`mobile-nav-btn ${activeTab === 'editor' ? 'active' : ''}`}
        onClick={() => onSelectTab('editor')}
      >
        <span className="mobile-nav-label">Code</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
        onClick={() => onSelectTab('visualizer')}
      >
        <span className="mobile-nav-label">Visualizer</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'turtle' ? 'active' : ''} ${hasTurtle ? 'has-badge' : ''}`}
        onClick={() => onSelectTab('turtle')}
      >
        <span className="mobile-nav-label">Turtle</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'examples' ? 'active' : ''}`}
        onClick={() => onSelectTab('examples')}
      >
        <span className="mobile-nav-label">Examples</span>
      </button>
    </nav>
  )
}
