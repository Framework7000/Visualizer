interface Props {
  index: number
  total: number
  playing: boolean
  speed: number
  voiceEnabled?: boolean
  onToggleVoice?: () => void
  voiceGender?: 'female' | 'male'
  onToggleVoiceGender?: () => void
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
  voiceEnabled = false,
  onToggleVoice,
  voiceGender = 'female',
  onToggleVoiceGender,
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
  const voiceDisabled = speed >= 2

  return (
    <div className="youtube-player-bar">
      {/* 1. Continuous Full-Width Top Scrubber Line */}
      <div className="youtube-scrubber-track-container">
        <input
          type="range"
          className="youtube-scrubber-input"
          min={0}
          max={lastIndex}
          value={index}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Step through the program"
          style={{
            background: `linear-gradient(90deg, #8E5BFF 0%, #38BDF8 ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)`,
          }}
        />
      </div>

      {/* 2. Unified Controls Bar Row */}
      <div className="youtube-controls-row">
        <div className="youtube-left-controls">
          <button
            className="youtube-play-btn"
            onClick={onPlayPause}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>

          <button className="youtube-icon-btn" onClick={onRestart} disabled={atStart} title="Restart (From step 1)" aria-label="Restart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
          </button>

          <button className="youtube-icon-btn" onClick={onStepBack} disabled={atStart} title="Step back (← key)" aria-label="Step back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="4" y1="19" x2="4" y2="5" stroke="currentColor" strokeWidth="2.5"/></svg>
          </button>

          <button className="youtube-icon-btn" onClick={onStepForward} disabled={atEnd} title="Step forward (→ key)" aria-label="Step forward">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5"/></svg>
          </button>

          <span className="youtube-step-counter">
            Step {Math.min(index + 1, total)} of {total}
          </span>
        </div>

        <div className="youtube-right-controls">
          {/* Voice Narration Pill Button */}
          <button
            className={`unified-voice-pill ${voiceDisabled ? 'disabled' : !voiceEnabled ? 'off' : voiceGender}`}
            onClick={() => {
              if (voiceDisabled) return
              if (!voiceEnabled) {
                if (voiceGender === 'male') onToggleVoiceGender?.()
                onToggleVoice?.()
              } else if (voiceGender === 'female') {
                onToggleVoiceGender?.()
              } else {
                onToggleVoice?.()
              }
            }}
            disabled={voiceDisabled}
            title={
              voiceDisabled
                ? 'Voice narration disabled at 2x & 4x speed'
                : `Voice: ${!voiceEnabled ? 'Off' : voiceGender === 'female' ? 'Female' : 'Male'}. Click to switch.`
            }
            aria-label="Voice Narration Toggle"
          >
            {voiceDisabled || !voiceEnabled ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
            <span className="voice-pill-text">
              {voiceDisabled || !voiceEnabled
                ? 'Voice: Off'
                : voiceGender === 'female'
                ? 'Voice: Female'
                : 'Voice: Male'}
            </span>
          </button>

          {/* Speed Selector Pills */}
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
