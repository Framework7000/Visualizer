import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { getDemoLeaderboard, LeaderboardEntry, subscribeLeaderboard } from '../lib/firestore'

// Trophy & Medal Icons
function TrophyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  )
}

function FlameIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C10.5 4.5 9 6.5 9 9C9 12 11 14 13 14C14.5 14 16 13 16.5 11.5C18 13.5 18 16 16.5 18.5C15 21 12.5 22 10 22C6.5 22 4 19 4 15C4 10 8 5.5 12 2Z"/></svg> }
function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> }

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'global' | 'weekly'>('global')

  useEffect(() => {
    const unsub = subscribeLeaderboard(100, (live) => {
      if (live.length > 0) { setEntries(live); setLoading(false) }
      else { setEntries(getDemoLeaderboard()); setLoading(false) }
    })
    setEntries(getDemoLeaderboard()); setLoading(false)
    return unsub
  }, [])

  const myRank = user ? entries.findIndex(e => e.uid === user.uid) + 1 : -1

  // Top 3 arrangement: [2nd Place, 1st Place, 3rd Place]
  const podiumItems = entries.length >= 3 ? [
    { entry: entries[1], rank: 2, height: 110, color: '#94A3B8' }, // 2nd Place Silver
    { entry: entries[0], rank: 1, height: 155, color: '#F59E0B' }, // 1st Place Gold (Highest!)
    { entry: entries[2], rank: 3, height: 75, color: '#B45309' },  // 3rd Place Bronze
  ] : []

  return (
    <div className="leaderboard-page">
      <div className="lb-hero">
        <h1 className="lb-title">Leaderboard</h1>
        <p className="lb-sub">Updated live · {entries.length} students competing</p>
        {myRank > 0 && (
          <div className="lb-my-rank">Your rank: <strong>#{myRank}</strong> · {user?.xp} XP</div>
        )}
      </div>

      <div className="lb-tabs">
        {(['global', 'weekly'] as const).map(t => (
          <button key={t} className={`lb-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'global' ? 'All Time' : 'This Week'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium (1st place is highest!) */}
      {podiumItems.length === 3 && (
        <div className="lb-podium">
          {podiumItems.map(({ entry: e, rank, height, color }) => (
            <div key={e.uid} className={`podium-slot rank-${rank}`}>
              <div className="podium-avatar-wrap">
                <div className="podium-avatar" style={{ border: `2px solid ${color}` }}>
                  {e.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="podium-trophy-badge" style={{ background: color }}>
                  #{rank}
                </div>
              </div>
              <div className="podium-name">{e.displayName.split(' ')[0]}</div>
              <div className="podium-xp">{e.xp} XP</div>
              <div
                className="podium-block"
                style={{ height: `${height}px`, borderColor: color }}
              >
                <TrophyIcon color={color} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rankings list */}
      <div className="lb-list">
        {loading ? (
          <div className="lb-loading">Loading rankings…</div>
        ) : (
          entries.map((e, i) => {
            const rank = i + 1
            const isMe = user?.uid === e.uid
            const isTop3 = rank <= 3
            const topColors = ['#F59E0B', '#94A3B8', '#B45309']

            return (
              <div key={e.uid} className={`lb-row ${isMe ? 'is-me' : ''}`}>
                <div className="lb-rank">
                  {isTop3 ? (
                    <span className="lb-badge-top" style={{ background: `${topColors[rank - 1]}22`, color: topColors[rank - 1] }}>
                      #{rank}
                    </span>
                  ) : (
                    <span className="lb-rank-num">#{rank}</span>
                  )}
                </div>
                <div className="lb-avatar">{e.displayName.charAt(0).toUpperCase()}</div>
                <div className="lb-info">
                  <span className="lb-name">{e.displayName}{isMe && <span className="lb-you">You</span>}</span>
                  <span className="lb-role">{e.role === 'mentor' ? 'Mentor' : 'Student'}</span>
                </div>
                <div className="lb-stats">
                  <span className="lb-streak"><FlameIcon /> {e.streak}d</span>
                  <span className="lb-exercises"><CheckIcon /> {e.exercisesDone}</span>
                </div>
                <div className="lb-xp-wrap">
                  <div className="lb-xp-bar">
                    <div className="lb-xp-fill" style={{ width: `${Math.min(100, (e.xp / (entries[0]?.xp || 1)) * 100)}%` }} />
                  </div>
                  <span className="lb-xp-val">{e.xp} XP</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
