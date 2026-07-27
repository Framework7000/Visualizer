interface LogoProps {
  height?: number
}

export default function GradeNextLogo({ height = 34 }: LogoProps) {
  return (
    <div className="gradenext-minimal-brand" title="GradeNext">
      <svg
        height={height}
        viewBox="0 0 220 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gradenext-logo-svg-minimal"
        aria-label="GradeNext Logo"
      >
        <defs>
          <linearGradient id="gn-brand-cap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2A8D" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gn-x-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3A9E" />
            <stop offset="100%" stopColor="#7C4DFF" />
          </linearGradient>
          <filter id="gn-cap-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="gn-pink-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="gn-x-bg-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
          </filter>
        </defs>

        {/* --- OFFICIAL GRADUATION CAP LOGOMARK OVER 'G' --- */}
        <g className="logo-cap-group" transform="translate(1, -5)">
          {/* Cap Diamond Top */}
          <path
            d="M 22 3 L 47 12 L 22 21 L -3 12 Z"
            fill="url(#gn-brand-cap)"
            filter="url(#gn-cap-glow)"
          />
          {/* Cap Base Ring */}
          <path
            d="M 8 16.5 V 21.5 C 8 21.5 15 24.5 22 24.5 C 29 24.5 36 21.5 36 21.5 V 16.5"
            fill="url(#gn-brand-cap)"
            opacity="0.9"
          />
          {/* Hanging Tassel */}
          <g className="logo-tassel">
            <path
              d="M -1 13.5 V 23"
              stroke="#FF2A8D"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="-1" cy="24.5" r="2.8" fill="#FF3A9E" filter="url(#gn-pink-glow)" />
          </g>
        </g>

        {/* Pink Halo Glow Box behind 'X' */}
        <rect
          x="152"
          y="16"
          width="28"
          height="30"
          rx="6"
          fill="#FF3A9E"
          opacity="0.38"
          filter="url(#gn-x-bg-glow)"
        />

        {/* --- OFFICIAL WORDMARK (Poppins Bold) --- */}
        <text
          x="2"
          y="47"
          fontFamily="'Poppins', sans-serif"
          fontWeight="800"
          fontSize="35"
          fill="currentColor"
          letterSpacing="-0.035em"
        >
          Grade<tspan fill="#5B4BFF">ne</tspan><tspan fill="url(#gn-x-gradient)">X</tspan>t
        </text>
      </svg>
    </div>
  )
}

