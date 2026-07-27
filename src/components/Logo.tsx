interface LogoProps {
  height?: number
}

export default function GradeNextLogo({ height = 34 }: LogoProps) {
  return (
    <div className="gradenext-official-brand" title="GradeNext">
      <img
        src="./gradenext-logo.png"
        alt="GradeNext Official Logo"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 2px 10px rgba(124, 58, 237, 0.35))'
        }}
        className="gradenext-official-logo-img"
        onError={(e) => {
          // Fallback to root path if ./ path fails
          e.currentTarget.src = '/gradenext-logo.png'
        }}
      />
    </div>
  )
}
