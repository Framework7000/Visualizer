import { motion, AnimatePresence } from 'framer-motion'
import { Access, Value } from '../lang/types'
import { formatValue } from '../lang/interpreter'

export interface Pointer {
  name: string
  index: number
  colorIndex?: number
}

interface Props {
  name: string
  values: Value[]
  accesses: Access[]
  pointers?: Pointer[]
}

function kindFor(accesses: Access[], name: string, index: number): string | null {
  let result: string | null = null
  for (const a of accesses) {
    if (a.name !== name || a.index !== index) continue
    if (a.kind === 'write') return 'write'
    if (a.kind === 'compare') result = 'compare'
    else if (!result) result = 'read'
  }
  return result
}

// Maps a number value to a smooth HSL hue color spectrum (200deg cyan -> 320deg pink)
function getBarColor(val: number, minVal: number, maxVal: number, state: string | null): string {
  if (state === 'write') return 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
  if (state === 'compare') return 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)'
  
  const range = maxVal - minVal || 1
  const pct = Math.max(0, Math.min(1, (val - minVal) / range))
  // Hue from 200 (cyan/blue) to 310 (pink/purple)
  const hue = 200 + pct * 110
  return `linear-gradient(180deg, hsl(${hue}, 90%, 65%) 0%, hsl(${hue}, 80%, 48%) 100%)`
}

export default function ArrayViz({ name, values, accesses, pointers = [] }: Props) {
  const allNumbers = values.length > 0 && values.every((v) => typeof v === 'number')
  const pointersAt = (i: number) => pointers.filter((p) => p.index === i)

  if (!allNumbers) {
    return (
      <div className="array-card">
        <div className="array-card-head">
          <span className="var-name">{name}</span>
          <span className="array-count-badge">{values.length} items</span>
        </div>
        <div className="chip-list">
          {values.length === 0 && <span className="empty-hint">empty list</span>}
          {values.map((v, i) => {
            const kind = kindFor(accesses, name, i)
            const ptrs = pointersAt(i)
            return (
              <div className="chip-cell" key={i}>
                <motion.span
                  layout
                  className={`value-chip ${kind ?? ''} ${ptrs.length ? 'pointed' : ''}`}
                  animate={{ scale: kind || ptrs.length ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  {formatValue(v)}
                </motion.span>
                <PointerBadges pointers={ptrs} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const nums = values as number[]
  const minVal = Math.min(...nums)
  const maxVal = Math.max(1, ...nums)

  return (
    <div className="array-card">
      <div className="array-card-head">
        <span className="var-name">{name}</span>
        <span className="array-count-badge">array [{nums.length}]</span>
      </div>
      <div className="bars">
        {nums.map((n, i) => {
          const kind = kindFor(accesses, name, i)
          const ptrs = pointersAt(i)
          const isWrite = kind === 'write'
          const isCompare = kind === 'compare'
          const state = isWrite ? 'write' : isCompare ? 'compare' : ptrs.length ? 'pointed' : null
          const heightPct = Math.max(12, (Math.abs(n) / maxVal) * 100)
          const barGrad = getBarColor(n, minVal, maxVal, state)

          return (
            <motion.div
              layout
              key={`col-${i}-${n}`}
              className={`bar-col ${state ?? ''}`}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            >
              {isWrite && <span className="bar-action-badge write-badge">SWAP</span>}
              {isCompare && <span className="bar-action-badge compare-badge">CMP</span>}

              <motion.span
                className={`bar-value-pill ${state ?? ''}`}
                animate={{ scale: state ? 1.18 : 1 }}
              >
                {n}
              </motion.span>

              <div className={`bar-track ${state ?? ''}`}>
                <motion.div
                  className={`bar ${state ?? ''}`}
                  style={{ background: barGrad }}
                  animate={{
                    height: `${heightPct}%`,
                    scale: state ? 1.05 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                >
                  <div className="bar-glass-sheen" />
                </motion.div>
              </div>

              <span className="bar-index-badge">{i}</span>
              <PointerBadges pointers={ptrs} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function PointerBadges({ pointers }: { pointers: Pointer[] }) {
  return (
    <div className="ptr-stack">
      <AnimatePresence>
        {pointers.map((p) => (
          <motion.span
            key={p.name}
            layout
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`ptr-badge c${(p.colorIndex ?? 0) % 4}`}
          >
            <span className="ptr-arrow-anim">▲</span>
            {p.name}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
