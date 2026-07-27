interface LogoProps {
  height?: number
}

export default function GradeNextLogo({ height = 36 }: LogoProps) {
  const baseUrl = (import.meta as any).env?.BASE_URL || '/'
  const logoSrc = `${baseUrl}gradenext-logo.png`

  return (
    <div className="gradenext-official-brand" title="GradeNext">
      <img
        src={logoSrc}
        alt="GradeNext Official Logo"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        className="gradenext-official-logo-img"
        onError={(e) => {
          e.currentTarget.src = '/gradenext-logo.png'
        }}
      />
    </div>
  )
}
