import { AnimatePresence, motion } from 'framer-motion'
import { Access, DictValue, isDict, Value } from '../lang/types'
import { formatValue } from '../lang/interpreter'
import ArrayViz, { Pointer } from './ArrayViz'
import DictView from './DictView'

interface Props {
  vars: Record<string, Value>
  accesses: Access[]
}

export default function VariablesPanel({ vars, accesses }: Props) {
  const entries = Object.entries(vars)
  const lists = entries.filter(([, v]) => Array.isArray(v)) as [string, Value[]][]
  const dicts = entries.filter(([, v]) => isDict(v)) as [string, DictValue][]
  const scalars = entries.filter(([, v]) => !Array.isArray(v) && !isDict(v))

  const intScalars = scalars.filter(
    ([, v]) => typeof v === 'number' && Number.isInteger(v),
  ) as [string, number][]

  const colorOf = new Map(intScalars.map(([n], i) => [n, i % 4]))

  const pointersFor = (listName: string, len: number): Pointer[] =>
    intScalars
      .filter(([, idx]) => idx >= 0 && idx < len)
      .filter(([n]) => n.length <= 12 && len > 1 && isIndexLike(n, listName))
      .map(([n, idx]) => ({ name: n, index: idx, colorIndex: colorOf.get(n) ?? 0 }))

  if (entries.length === 0) {
    return (
      <div className="empty-hint-card">
        <div className="empty-hint-icon">✨</div>
        <div className="empty-hint-title">No Variables In Memory Yet</div>
        <div className="empty-hint-sub">Type variables or run an example to watch memory boxes populate live.</div>
      </div>
    )
  }

  const getTypeLabel = (val: Value): string => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float'
    if (typeof val === 'string') return 'str'
    if (typeof val === 'boolean') return 'bool'
    return 'value'
  }

  return (
    <>
      {lists.map(([name, values]) => (
        <ArrayViz
          key={name}
          name={name}
          values={values}
          accesses={accesses}
          pointers={pointersFor(name, values.length)}
        />
      ))}

      {dicts.map(([name, dict]) => (
        <DictView key={name} name={name} dict={dict} />
      ))}

      {scalars.length > 0 && (
        <div className="vars-grid">
          <AnimatePresence>
            {scalars.map(([name, value]) => {
              const isText = typeof value === 'string'
              const typeLabel = getTypeLabel(value)

              return (
                <motion.div
                  key={name}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                  className="var-card"
                >
                  <div className="var-card-header">
                    <span className="var-name">{name}</span>
                    <span className={`type-badge type-${typeLabel}`}>{typeLabel}</span>
                  </div>

                  <motion.div
                    key={String(value)}
                    initial={{ scale: 1.2, filter: 'brightness(1.5)' }}
                    animate={{ scale: 1, filter: 'brightness(1)' }}
                    transition={{ duration: 0.3 }}
                    className={`var-value ${isText ? 'text' : ''}`}
                  >
                    {formatValue(value)}
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

const INDEX_NAMES = new Set([
  'i', 'j', 'k', 'l', 'm', 'n',
  'idx', 'index', 'pos', 'p', 'q', 'lo', 'hi', 'low', 'high', 'mid',
  'left', 'right', 'start', 'end', 'min_index', 'max_index', 'pivot',
])

function isIndexLike(varName: string, listName: string): boolean {
  const v = varName.toLowerCase()
  if (INDEX_NAMES.has(v)) return true
  return v.includes(listName.toLowerCase()) || v.endsWith('_index') || v.endsWith('idx')
}
