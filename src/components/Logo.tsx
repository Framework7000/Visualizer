interface LogoProps {
  height?: number
  showSubtitle?: boolean
}

export default function GradeNextLogo({ height = 34, showSubtitle = false }: LogoProps) {
  return (
    <div className="gradenext-brand-container">
      <svg
        height={height}
        viewBox="0 0 232 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gradenext-logo-svg"
        aria-label="GradeNext Logo"
      >
        <defs>
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9E6BFF" />
            <stop offset="100%" stopColor="#6E3E83" />
          </linearGradient>
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- GRADUATION CAP OVER 'G' --- */}
        {/* Cap Top Diamond */}
        <path
          d="M 26 5 L 52 14 L 26 23 L 0 14 Z"
          fill="url(#brand-grad)"
          filter="url(#logo-glow)"
        />
        {/* Cap Base */}
        <path
          d="M 12 18 V 24 C 12 24 18 27 26 27 C 34 27 40 24 40 24 V 18"
          fill="#6E3E83"
        />
        {/* Tassel */}
        <path
          d="M 7 15 V 25"
          stroke="#9E6BFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="7" cy="26.5" r="2" fill="#48D6FF" />

        {/* --- BRAND TEXT: 'Grade' --- */}
        <text
          x="2"
          y="48"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="900"
          fontSize="35"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          Grade
        </text>

        {/* --- BRAND TEXT: 'Ne' --- */}
        <text
          x="114"
          y="48"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="900"
          fontSize="33"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          Ne
        </text>

        {/* --- STYLIZED PURPLE 'X' CROSS --- */}
        <rect
          x="162"
          y="18"
          width="6.5"
          height="30"
          rx="3.25"
          transform="rotate(-30 162 18)"
          fill="url(#brand-grad)"
          filter="url(#logo-glow)"
        />
        <rect
          x="177"
          y="20"
          width="6.5"
          height="30"
          rx="3.25"
          transform="rotate(30 177 20)"
          fill="url(#brand-grad)"
          filter="url(#logo-glow)"
        />

        {/* --- BRAND TEXT: 't' --- */}
        <text
          x="190"
          y="48"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="900"
          fontSize="33"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          t
        </text>

        {/* --- TRADEMARK TM BADGE --- */}
        <text
          x="208"
          y="23"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="800"
          fontSize="10"
          fill="#48D6FF"
        >
          TM
        </text>
      </svg>

      {showSubtitle && <span className="brand-subtitle">// watch your code come alive</span>}
    </div>
  )
}
