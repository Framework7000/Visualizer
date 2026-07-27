import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  streak: number
  xp: number
  mode: 'learn' | 'python'
  theme: 'light' | 'dark'
}

/* ── SVG Icon Components ── */

function FlameIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.5 4.5 9 6.5 9 9C9 12 11 14 13 14C14.5 14 16 13 16.5 11.5C18 13.5 18 16 16.5 18.5C15 21 12.5 22 10 22C6.5 22 4 19 4 15C4 10 8 5.5 12 2Z" fill="url(#flame-grad)" />
      <defs>
        <linearGradient id="flame-grad" x1="4" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function BoltIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="url(#bolt-grad)" />
      <defs>
        <linearGradient id="bolt-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#8E5BFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function BookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function PythonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 7.29 4.12 7.29 4.12V6.26H12.01V6.9H5.28S2 6.53 2 11.53 4.88 16.32 4.88 16.32H6.46V14.1s-.16-2.73 2.64-2.73h5.78" />
      <path d="M12 22c5.52 0 4.71-2.12 4.71-2.12V17.74H11.99V17.1h6.73s3.28.37 3.28-4.63-2.88-4.79-2.88-4.79H17.54V9.9s.16 2.73-2.64 2.73H9.12" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function ShareHeaderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#share-head-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      <defs>
        <linearGradient id="share-head-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E5BFF" /><stop offset="1" stopColor="#48D6FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function ShareModal({ open, onClose, streak, xp, mode, theme }: Props) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'copied' | 'downloaded'>('idle')
  const blobRef = useRef<Blob | null>(null)

  useEffect(() => {
    if (open) { setStatus('idle'); blobRef.current = null }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Generate the canvas image blob
  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current

    const canvas = document.createElement('canvas')
    const dpr = 2
    const W = 420 * dpr, H = 500 * dpr
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const isDark = theme === 'dark'

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    if (isDark) {
      bgGrad.addColorStop(0, '#0C0F1A'); bgGrad.addColorStop(0.5, '#14102A'); bgGrad.addColorStop(1, '#0A0D18')
    } else {
      bgGrad.addColorStop(0, '#EFEBFA'); bgGrad.addColorStop(0.5, '#F7F4FD'); bgGrad.addColorStop(1, '#EFE9F8')
    }
    ctx.fillStyle = bgGrad
    roundRect(ctx, 0, 0, W, H, 32 * dpr); ctx.fill()

    // Border
    ctx.strokeStyle = isDark ? 'rgba(142, 91, 255, 0.35)' : 'rgba(123, 63, 152, 0.3)'
    ctx.lineWidth = 3 * dpr
    roundRect(ctx, 2 * dpr, 2 * dpr, W - 4 * dpr, H - 4 * dpr, 30 * dpr); ctx.stroke()

    // Glow orbs
    const orb1 = ctx.createRadialGradient(W * 0.2, H * 0.25, 0, W * 0.2, H * 0.25, W * 0.4)
    orb1.addColorStop(0, isDark ? 'rgba(142, 91, 255, 0.12)' : 'rgba(142, 91, 255, 0.08)'); orb1.addColorStop(1, 'transparent')
    ctx.fillStyle = orb1; ctx.fillRect(0, 0, W, H)
    const orb2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, W * 0.35)
    orb2.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.06)'); orb2.addColorStop(1, 'transparent')
    ctx.fillStyle = orb2; ctx.fillRect(0, 0, W, H)

    // Title
    ctx.font = `800 ${36 * dpr}px "Inter", "SF Pro Display", system-ui, sans-serif`
    const tg = ctx.createLinearGradient(W * 0.2, H * 0.12, W * 0.8, H * 0.12)
    tg.addColorStop(0, '#8E5BFF'); tg.addColorStop(1, '#48D6FF')
    ctx.fillStyle = tg; ctx.textAlign = 'center'
    ctx.fillText('GradeNext', W / 2, H * 0.14)

    // Tagline
    ctx.font = `600 ${13 * dpr}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(28,15,53,0.5)'
    ctx.fillText('Learn to Code, Visualise to Understand', W / 2, H * 0.19)

    // Divider
    const divY = H * 0.235
    const dg = ctx.createLinearGradient(W * 0.15, divY, W * 0.85, divY)
    dg.addColorStop(0, 'transparent'); dg.addColorStop(0.5, isDark ? 'rgba(142, 91, 255, 0.4)' : 'rgba(123, 63, 152, 0.35)'); dg.addColorStop(1, 'transparent')
    ctx.strokeStyle = dg; ctx.lineWidth = 1.5 * dpr
    ctx.beginPath(); ctx.moveTo(W * 0.15, divY); ctx.lineTo(W * 0.85, divY); ctx.stroke()

    // Stats cards
    const cardY = H * 0.30, cardW = W * 0.36, cardH = H * 0.28, gap = W * 0.06
    drawStatCard(ctx, W / 2 - cardW - gap / 2, cardY, cardW, cardH, dpr, isDark, { icon: 'flame', value: String(streak), label: 'Day Streak', accentColor: '#F59E0B' })
    drawStatCard(ctx, W / 2 + gap / 2, cardY, cardW, cardH, dpr, isDark, { icon: 'bolt', value: String(xp), label: 'Total XP', accentColor: '#8E5BFF' })

    // Mode badge
    const badgeY = H * 0.66
    const badgeText = mode === 'learn' ? 'Learn Mode' : 'Real Python Mode'
    ctx.font = `700 ${14 * dpr}px "Inter", system-ui, sans-serif`
    const badgeW = ctx.measureText(badgeText).width + 40 * dpr, badgeH = 38 * dpr, badgeX = (W - badgeW) / 2
    ctx.fillStyle = isDark ? 'rgba(142, 91, 255, 0.15)' : 'rgba(123, 63, 152, 0.12)'
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 999); ctx.fill()
    ctx.strokeStyle = isDark ? 'rgba(142, 91, 255, 0.4)' : 'rgba(123, 63, 152, 0.35)'
    ctx.lineWidth = 1.5 * dpr; roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 999); ctx.stroke()
    ctx.fillStyle = isDark ? '#E2D9F3' : '#43325B'; ctx.textAlign = 'center'
    ctx.fillText(badgeText, W / 2, badgeY + badgeH * 0.65)

    // Quote
    ctx.font = `italic 600 ${14 * dpr}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(28,15,53,0.45)'
    ctx.fillText('"Every line of code is a step forward."', W / 2, H * 0.78)

    // Bottom
    ctx.font = `700 ${11 * dpr}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(28,15,53,0.3)'
    ctx.fillText('gradenext.com  ·  Visualise & Learn', W / 2, H * 0.90)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blobRef.current = blob
        resolve(blob)
      }, 'image/png')
    })
  }, [streak, xp, mode, theme])

  const shareText = `🔥 ${streak} Day Streak · ⚡ ${xp} XP on GradeNext! Learn to Code, Visualise to Understand.`

  const handleWhatsApp = useCallback(async () => {
    setStatus('generating')
    const blob = await generateImage()
    if (!blob) { setStatus('idle'); return }
    const file = new File([blob], 'gradenext-stats.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text: shareText, files: [file] })
      } catch { /* user cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
    }
    setStatus('idle')
  }, [generateImage, shareText])

  const handleInstagram = useCallback(async () => {
    setStatus('generating')
    const blob = await generateImage()
    if (!blob) { setStatus('idle'); return }
    const file = new File([blob], 'gradenext-stats.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ text: shareText, files: [file] })
      } catch { /* user cancelled */ }
    } else {
      downloadBlob(blob)
    }
    setStatus('idle')
  }, [generateImage, shareText])

  const handleCopy = useCallback(async () => {
    setStatus('generating')
    const blob = await generateImage()
    if (!blob) { setStatus('idle'); return }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      downloadBlob(blob)
      setStatus('downloaded')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }, [generateImage])

  const handleDownload = useCallback(async () => {
    setStatus('generating')
    const blob = await generateImage()
    if (!blob) { setStatus('idle'); return }
    downloadBlob(blob)
    setStatus('downloaded')
    setTimeout(() => setStatus('idle'), 2000)
  }, [generateImage])

  if (!open) return null

  return (
    <div className="share-backdrop" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-modal-title-row">
            <ShareHeaderIcon />
            <h3 className="share-modal-title">Share Your Progress</h3>
          </div>
          <p className="share-modal-subtitle">Show off your GradeNext journey</p>
        </div>

        {/* Preview Card */}
        <div className="share-preview-card">
          <div className="share-preview-brand">
            <span className="share-brand-gradient">GradeNext</span>
            <span className="share-brand-tag">Learn to Code, Visualise to Understand</span>
          </div>

          <div className="share-stats-row">
            <div className="share-stat-block streak-block">
              <FlameIcon size={28} />
              <span className="share-stat-value">{streak}</span>
              <span className="share-stat-label">Day Streak</span>
            </div>
            <div className="share-stat-divider" />
            <div className="share-stat-block xp-block">
              <BoltIcon size={28} />
              <span className="share-stat-value">{xp}</span>
              <span className="share-stat-label">Total XP</span>
            </div>
          </div>

          <div className="share-mode-badge">
            {mode === 'learn' ? <BookIcon size={14} /> : <PythonIcon size={14} />}
            <span>{mode === 'learn' ? 'Learn Mode' : 'Real Python Mode'}</span>
          </div>

          <div className="share-quote">"Every line of code is a step forward."</div>
        </div>

        {/* Share Action Buttons */}
        <div className="share-actions-grid">
          <button
            className="share-action-btn whatsapp"
            onClick={handleWhatsApp}
            disabled={status === 'generating'}
            title="Share to WhatsApp"
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </button>

          <button
            className="share-action-btn instagram"
            onClick={handleInstagram}
            disabled={status === 'generating'}
            title="Share to Instagram"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </button>

          <button
            className="share-action-btn copy"
            onClick={handleCopy}
            disabled={status === 'generating'}
            title="Copy image to clipboard"
          >
            <CopyIcon />
            <span>{status === 'copied' ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            className="share-action-btn download"
            onClick={handleDownload}
            disabled={status === 'generating'}
            title="Download image"
          >
            <DownloadIcon />
            <span>{status === 'downloaded' ? 'Saved!' : 'Download'}</span>
          </button>
        </div>

        {/* Back button */}
        <div className="share-modal-footer">
          <button className="share-back-btn" onClick={onClose}>
            <BackIcon />
            <span>Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Canvas Drawing Helpers ── */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawStatCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  dpr: number, isDark: boolean,
  stat: { icon: 'flame' | 'bolt'; value: string; label: string; accentColor: string },
) {
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(123,63,152,0.06)'
  roundRect(ctx, x, y, w, h, 16 * dpr); ctx.fill()
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(123,63,152,0.18)'
  ctx.lineWidth = 1.5 * dpr
  roundRect(ctx, x, y, w, h, 16 * dpr); ctx.stroke()

  const cx = x + w / 2

  // Draw icon as styled text (canvas can't render React SVGs)
  const iconSize = 28 * dpr
  ctx.font = `${iconSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(stat.icon === 'flame' ? '🔥' : '⚡', cx, y + h * 0.30)

  const valSize = 34 * dpr
  ctx.font = `900 ${valSize}px "Inter", system-ui, sans-serif`
  ctx.fillStyle = stat.accentColor
  ctx.fillText(stat.value, cx, y + h * 0.58)

  const labSize = 12 * dpr
  ctx.font = `600 ${labSize}px "Inter", system-ui, sans-serif`
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(28,15,53,0.55)'
  ctx.fillText(stat.label, cx, y + h * 0.78)
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gradenext-stats.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
