import logoImg from '../assets/gradenext-logo.png'

interface LogoProps {
  height?: number
}

export default function GradeNextLogo({ height = 36 }: LogoProps) {
  return (
    <div className="gradenext-official-brand" title="GradeNext">
      <img
        src={logoImg}
        alt="GradeNext Official Logo"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        className="gradenext-official-logo-img"
      />
    </div>
  )
}
