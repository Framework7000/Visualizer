// Lightweight canvas-based celebration confetti burst for program completions.
// Zero external library dependencies.

export function fireConfetti() {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const colors = ['#8E5BFF', '#48D6FF', '#3DDC84', '#FFC857', '#FF5C7A', '#6E3E83']
  const count = 70
  const particles = Array.from({ length: count }, () => ({
    x: (window.innerWidth / 2) * dpr,
    y: (window.innerHeight / 2) * dpr,
    vx: (Math.random() - 0.5) * 18 * dpr,
    vy: (Math.random() - 0.7) * 22 * dpr,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: (Math.random() * 8 + 6) * dpr,
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 12,
    opacity: 1,
  }))

  let animationFrameId: number
  const startTime = Date.now()

  function render() {
    const elapsed = Date.now() - startTime
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let alive = false
    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.45 * dpr // gravity
      p.rotation += p.rSpeed
      p.opacity = Math.max(0, 1 - elapsed / 1800)

      if (p.opacity > 0) {
        alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
    })

    if (alive && elapsed < 2000) {
      animationFrameId = requestAnimationFrame(render)
    } else {
      cancelAnimationFrame(animationFrameId)
      canvas.remove()
    }
  }

  render()
}
