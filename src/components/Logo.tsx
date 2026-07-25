interface LogoProps {
  height?: number
  showSubtitle?: boolean
}

export default function GradeNextLogo({ height = 40, showSubtitle = true }: LogoProps) {
  return (
    <div className="gradenext-brand-container">
      <svg
        height={height}
        viewBox="0 0 240 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gradenext-logo-svg"
        aria-label="GradeNext Logo"
      >
        <defs>
          <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8E5BFF" />
            <stop offset="100%" stopColor="#6E3E83" />
          </linearGradient>
          <filter id="purple-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- GRADUATION CAP OVER 'G' --- */}
        {/* Diamond Cap Top */}
        <path
          d="M 28 4 L 56 14 L 28 24 L 0 14 Z"
          fill="url(#purple-grad)"
          filter="url(#purple-glow)"
        />
        {/* Cap Base */}
        <path
          d="M 12 19 V 25 C 12 25 18 28.5 28 28.5 C 38 28.5 44 25 44 25 V 19"
          fill="#6E3E83"
        />
        {/* Tassel */}
        <path
          d="M 7 16 V 26"
          stroke="#8E5BFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="7" cy="27.5" r="2.5" fill="#8E5BFF" />

        {/* --- BRAND TEXT: 'Grade' --- */}
        <text
          x="2"
          y="49"
          fontFamily="'Inter', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          Grade
        </text>

        {/* --- BRAND TEXT: 'Ne' --- */}
        <text
          x="116"
          y="49"
          fontFamily="'Inter', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          Ne
        </text>

        {/* --- STYLIZED BRAND PURPLE 'X' --- */}
        {/* Main diagonal stroke 1 */}
        <rect
          x="166"
          y="18"
          width="7"
          height="32"
          rx="3.5"
          transform="rotate(-30 166 18)"
          fill="url(#purple-grad)"
          filter="url(#purple-glow)"
        />
        {/* Main diagonal stroke 2 */}
        <rect
          x="182"
          y="20"
          width="7"
          height="32"
          rx="3.5"
          transform="rotate(30 182 20)"
          fill="url(#purple-grad)"
          filter="url(#purple-glow)"
        />

        {/* --- BRAND TEXT: 't' --- */}
        <text
          x="196"
          y="49"
          fontFamily="'Inter', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill="currentColor"
          letterSpacing="-0.03em"
        >
          t
        </text>

        {/* --- TRADEMARK TM BADGE --- */}
        <text
          x="214"
          y="24"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="800"
          fontSize="11"
          fill="#48D6FF"
        >
          TM
        </text>
      </svg>

      {showSubtitle && <span className="brand-subtitle">// watch your code come alive</span>}
    </div>
  )
}
