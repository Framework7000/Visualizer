import { useEffect, useRef } from 'react'
import { TurtleState } from '../lang/types'

interface Props {
  turtle?: TurtleState
}

export default function TurtleCanvas({ turtle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
    }

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // Center origin (0, 0) in the middle of canvas
    const cx = width / 2
    const cy = height / 2

    // Background Grid
    ctx.strokeStyle = 'rgba(120, 150, 220, 0.08)'
    ctx.lineWidth = 1
    const gridSize = 25
    for (let x = cx % gridSize; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = cy % gridSize; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Origin Crosshair
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - 10, cy)
    ctx.lineTo(cx + 10, cy)
    ctx.moveTo(cx, cy - 10)
    ctx.lineTo(cx, cy + 10)
    ctx.stroke()

    if (!turtle) {
      ctx.restore()
      return
    }

    // Draw lines
    turtle.lines.forEach((line) => {
      ctx.strokeStyle = line.color || '#22d3ee'
      ctx.lineWidth = line.width || 3
      ctx.lineCap = 'round'
      ctx.shadowColor = line.color || '#22d3ee'
      ctx.shadowBlur = 8

      ctx.beginPath()
      // Note: canvas Y is inverted compared to standard Cartesian Y
      ctx.moveTo(cx + line.x1, cy - line.y1)
      ctx.lineTo(cx + line.x2, cy - line.y2)
      ctx.stroke()
    })

    // Reset shadow for turtle icon
    ctx.shadowBlur = 12
    ctx.shadowColor = turtle.color || '#22d3ee'

    // Draw Turtle Icon at (turtle.x, turtle.y)
    const tx = cx + turtle.x
    const ty = cy - turtle.y // Invert Y

    ctx.save()
    ctx.translate(tx, ty)
    // Rotate canvas (angle 0 = right, angle 90 = up). Canvas angle 0 = right, positive = clockwise
    const rad = (-turtle.angle * Math.PI) / 180
    ctx.rotate(rad)

    // Turtle body triangle facing right
    ctx.fillStyle = turtle.color || '#22d3ee'
    ctx.strokeStyle = '#05070d'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(14, 0)
    ctx.lineTo(-10, -9)
    ctx.lineTo(-5, 0)
    ctx.lineTo(-10, 9)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
    ctx.restore()
  }, [turtle])

  return (
    <div className="turtle-container">
      <div className="turtle-header">
        <span className="turtle-title">Turtle Canvas 2D</span>
        {turtle && (
          <span className="turtle-pos">
            x: {Math.round(turtle.x)}, y: {Math.round(turtle.y)}, angle: {Math.round(turtle.angle)}°
          </span>
        )}
      </div>
      <canvas ref={canvasRef} className="turtle-canvas" />
    </div>
  )
}
