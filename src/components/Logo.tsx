import logoImg from '../assets/gradenext-logo.png'

interface LogoProps {
  height?: number
}

export default function GradeNextLogo({ height = 36 }: LogoProps) {
  return (
    <div className="gradenext-official-brand" title="GradeNext">
      {/* Pure Vector SVG Logo with Dark/Light Theme Support & 0ms Load Delay */}
      <svg
        height={height}
        viewBox="0 0 225 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gradenext-logo-svg-vector"
        aria-label="GradeNext Logo"
      >
        <defs>
          <linearGradient id="gn-brand-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ECCFA" />
            <stop offset="40%" stopColor="#8E5BFF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="gn-x-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <filter id="gn-cap-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- GRADUATION CAP LOGOMARK OVER 'G' --- */}
        <g className="logo-cap-group" transform="translate(4, -2)">
          {/* Cap Diamond Top */}
          <path
            d="M 22 2 L 46 11 L 22 20 L -2 11 Z"
            fill="url(#gn-brand-purple)"
            filter="url(#gn-cap-glow)"
          />
          {/* Cap Base */}
          <path
            d="M 8 15 V 19.5 C 8 19.5 15 23 22 23 C 29 23 36 19.5 36 19.5 V 15"
            fill="url(#gn-brand-purple)"
            opacity="0.95"
          />
          {/* Tassel */}
          <path
            d="M 0 12 V 22"
            stroke="#8E5BFF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="0" cy="23.5" r="2.5" fill="#A855F7" />
        </g>

        {/* --- WORDMARK: GradeNext --- */}
        <text
          x="2"
          y="49"
          fontFamily="'Inter', 'Poppins', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="currentColor"
          letterSpacing="-0.035em"
        >
          Grade<tspan fill="currentColor">Ne</tspan>
        </text>

        {/* Custom Code Brackets 'X' */}
        <g transform="translate(160, 22)">
          <path
            d="M 4 2 L 20 26 M 20 2 L 4 26"
            stroke="url(#gn-x-pink)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <text
          x="188"
          y="49"
          fontFamily="'Inter', 'Poppins', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="currentColor"
          letterSpacing="-0.035em"
        >
          t
        </text>
      </svg>

      {/* Backup Image */}
      <img
        src={logoImg}
        alt="GradeNext Logo"
        style={{ display: 'none' }}
      />
    </div>
  )
}
