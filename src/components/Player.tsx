interface Props {
  index: number
  total: number
  playing: boolean
  speed: number
  onPlayPause: () => void
  onSeek: (index: number) => void
  onStepBack: () => void
  onStepForward: () => void
  onRestart: () => void
  onSpeed: (speed: number) => void
}

const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×', value: 1 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
]

export default function Player({
  index,
  total,
  playing,
  speed,
  onPlayPause,
  onSeek,
  onStepBack,
  onStepForward,
  onRestart,
  onSpeed,
}: Props) {
  const lastIndex = Math.max(total - 1, 0)
  const atStart = index <= 0
  const atEnd = index >= lastIndex

  const progressPercent = total > 1 ? (index / lastIndex) * 100 : 0

  return (
    <div className="player-hero">
      <div className="scrubber-container">
        <div className="scrubber-track-wrapper">
          <input
            type="range"
            className="scrubber-input"
            min={0}
            max={lastIndex}
            value={index}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Step through the program"
            style={{
              background: `linear-gradient(90deg, #8E5BFF 0%, #48D6FF ${progressPercent}%, rgba(255, 255, 255, 0.08) ${progressPercent}%)`,
            }}
          />
        </div>
        <div className="scrubber-labels">
          <span className="step-badge">
            Step {Math.min(index + 1, total)} of {total}
          </span>
          {atEnd && total > 1 && <span className="done-badge">🎉 Complete!</span>}
        </div>
      </div>

      <div className="transport-bar">
        <div className="transport-controls">
          <button className="transport-btn" onClick={onRestart} disabled={atStart} title="Restart (From step 1)" aria-label="Restart">
            ⏮
          </button>
          <button className="transport-btn" onClick={onStepBack} disabled={atStart} title="Step back (← key)" aria-label="Step back">
            ◀
          </button>
          <button
            className={`transport-btn play-hero-btn ${playing ? 'playing' : ''}`}
            onClick={onPlayPause}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button className="transport-btn" onClick={onStepForward} disabled={atEnd} title="Step forward (→ key)" aria-label="Step forward">
            ▶
          </button>
        </div>

        <div className="speed-segmented">
          <span className="speed-label">Speed</span>
          <div className="speed-pills">
            {SPEEDS.map((s) => (
              <button
                key={s.value}
                className={`speed-pill ${speed === s.value ? 'active' : ''}`}
                onClick={() => onSpeed(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
