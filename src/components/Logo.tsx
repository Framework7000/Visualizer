interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export default function Logo({ size = 'md', showSubtitle = true }: LogoProps) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32

  return (
    <div className={`apple-brand logo-${size}`}>
      {/* Apple-style Squircle Icon Emblem */}
      <div className="apple-logo-icon" style={{ width: iconSize, height: iconSize }}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" rx="10" fill="url(#apple-grad)" />
          <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="rgba(255,255,255,0.2)" />
          {/* Graduation Cap Vector */}
          <path
            d="M20 11L30 16L20 21L10 16L20 11Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 18.5V23.5C14 23.5 17 26 20 26C23 26 26 23.5 26 23.5V18.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Forward Next Chevron */}
          <path
            d="M27 28L31 28"
            stroke="#48D6FF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="apple-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6E3E83" />
              <stop offset="1" stopColor="#8E5BFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="apple-logo-text-group">
        <div className="brand-logo-text">
          <span className="brand-g">Grade</span>
          <span className="brand-next-badge">Next</span>
          <span className="tm-badge">™</span>
        </div>
        {showSubtitle && <span className="brand-subtitle">// watch your code come alive</span>}
      </div>
    </div>
  )
}
