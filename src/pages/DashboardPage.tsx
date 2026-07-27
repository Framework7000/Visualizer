import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// High-Precision SVG Icons
function ZapIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function FlameIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C10.5 4.5 9 6.5 9 9C9 12 11 14 13 14C14.5 14 16 13 16.5 11.5C18 13.5 18 16 16.5 18.5C15 21 12.5 22 10 22C6.5 22 4 19 4 15C4 10 8 5.5 12 2Z"/></svg> }
function CheckCircleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }

function WorkbenchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function WhiteboardIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> }
function ExercisesIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
function VisualiserIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function ArrowRightIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> }
function TrendingUpIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> }

const MODULES = [
  {
    to: '/workbench',
    icon: <WorkbenchIcon />,
    title: 'Code Workbench',
    desc: 'Full multi-language execution in HTML, CSS, JS, Python & Java',
    tag: 'IDE SANDBOX',
    color: '#6B4CFF',
    gradient: 'linear-gradient(135deg, rgba(107, 76, 255, 0.2), rgba(255, 106, 198, 0.06))',
  },
  {
    to: '/whiteboard',
    icon: <WhiteboardIcon />,
    title: 'Visual Whiteboard',
    desc: 'Infinite canvas with flowcharts, sticky notes & architectural tools',
    tag: 'CANVAS',
    color: '#9ECCFA',
    gradient: 'linear-gradient(135deg, rgba(158, 204, 250, 0.2), rgba(141, 187, 255, 0.06))',
  },
  {
    to: '/exercises',
    icon: <ExercisesIcon />,
    title: 'Interactive Exercises',
    desc: '12 curated algorithmic challenges with automated evaluation',
    tag: 'PRACTICE',
    color: '#FBBE95',
    gradient: 'linear-gradient(135deg, rgba(251, 190, 149, 0.2), rgba(255, 204, 156, 0.06))',
  },
  {
    to: '/visualiser',
    icon: <VisualiserIcon />,
    title: 'Algorithm Visualiser',
    desc: 'Step-by-step memory stack, pointer & variable execution flow',
    tag: 'STEP ENGINE',
    color: '#89E6D5',
    gradient: 'linear-gradient(135deg, rgba(137, 230, 213, 0.2), rgba(159, 245, 208, 0.06))',
  },
]

const RECENT_ITEMS = [
  { title: 'Fibonacci Sequence (Recursive)', lang: 'Python', step: '4 of 5 steps completed', pct: 80 },
  { title: 'Bubble Sort Algorithm', lang: 'Python', step: 'Completed & Verified', pct: 100 },
  { title: 'Interactive Web Calculator', lang: 'Web Dev', step: '2 of 4 steps completed', pct: 50 },
  { title: 'Binary Search Implementation', lang: 'Python', step: '1 of 5 steps completed', pct: 20 },
]

const WEEKLY_POINTS = [
  { day: 'Mon', mins: 45, x: 40, y: 85 },
  { day: 'Tue', mins: 70, x: 120, y: 50 },
  { day: 'Wed', mins: 30, x: 200, y: 105 },
  { day: 'Thu', mins: 95, x: 280, y: 15, active: true },
  { day: 'Fri', mins: 60, x: 360, y: 65 },
  { day: 'Sat', mins: 40, x: 440, y: 92 },
  { day: 'Sun', mins: 80, x: 520, y: 35 },
]

const LANG_COLORS: Record<string, string> = {
  Python: '#38BDF8',
  'Web Dev': '#F59E0B',
  Java: '#34D399',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const displayName = user?.displayName?.split(' ')[0] ?? 'Student'
  const userXp = user?.xp ?? 150
  const userStreak = user?.streak ?? 3
  const userDone = user?.exercisesDone ?? 6

  return (
    <div className="home-dashboard-v2">
      {/* 1. ELEGANT WELCOME HERO BANNER */}
      <div className="dash-hero-banner">
        <div className="hero-left-col">
          <div className="hero-avatar-ring">
            <div className="hero-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="avatar-online-dot" />
          </div>
          <div className="hero-text-block">
            <div className="hero-badge-row">
              <span className="streak-tag">
                <FlameIcon /> {userStreak} Day Streak
              </span>
              <span className="rank-tag-pill">Top 5% Learner</span>
            </div>
            <h1 className="hero-greeting">
              Good {getGreeting()}, <span className="text-highlight">{displayName}</span>
            </h1>
            <p className="hero-subtext">
              Welcome to your student performance dashboard. Track your coding progress, stats &amp; achievements.
            </p>
          </div>
        </div>

        <div className="hero-right-col">
          <div className="xp-progress-card">
            <div className="xp-card-header">
              <div className="xp-level-title">
                <span className="lvl-badge">LVL 2</span>
                <span className="lvl-name">Mastering Data Structures</span>
              </div>
              <span className="xp-ratio">{userXp} / 300 XP</span>
            </div>
            <div className="xp-track-bg">
              <div className="xp-fill-bar" style={{ width: `${(userXp / 300) * 100}%` }} />
            </div>
            <div className="xp-card-footer">
              <span>Next reward at 300 XP</span>
              <span className="xp-needed">150 XP remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE KEY METRIC CARDS WITH GENEROUS SPACING */}
      <div className="dash-metrics-grid">
        <div className="metric-card card-violet">
          <div className="metric-top-row">
            <span className="metric-icon-wrap"><ZapIcon /></span>
            <span className="metric-trend"><TrendingUpIcon /> +25 XP Today</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{userXp}</span>
            <span className="metric-unit">XP</span>
          </div>
          <div className="metric-bottom-lbl">Total Experience Points</div>
        </div>

        <div className="metric-card card-amber">
          <div className="metric-top-row">
            <span className="metric-icon-wrap"><FlameIcon /></span>
            <span className="metric-trend active-trend">Active Streak</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{userStreak}</span>
            <span className="metric-unit">Days</span>
          </div>
          <div className="metric-bottom-lbl">Consecutive Learning Days</div>
        </div>

        <div className="metric-card card-emerald">
          <div className="metric-top-row">
            <span className="metric-icon-wrap"><CheckCircleIcon /></span>
            <span className="metric-trend">10% Completed</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-num">{userDone}</span>
            <span className="metric-unit">/ 60 Tasks</span>
          </div>
          <div className="metric-bottom-lbl">Algorithm Exercises Solved</div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="dash-content-grid">
        {/* LEFT COLUMN: WORKSPACES & AREA WAVE CHART */}
        <div className="dash-main-left">
          {/* Workspaces Section */}
          <section className="dash-card-section">
            <div className="section-header">
              <div className="title-group">
                <h2>Interactive Workspaces</h2>
                <p>Launch an environment to build, practice, or visualize code</p>
              </div>
            </div>

            <div className="workspaces-grid">
              {MODULES.map((m) => (
                <Link key={m.to} to={m.to} className="workspace-tile" style={{ background: m.gradient }}>
                  <div className="tile-header">
                    <span className="tile-icon" style={{ color: m.color, background: `${m.color}20` }}>
                      {m.icon}
                    </span>
                    <span className="tile-tag" style={{ color: m.color, borderColor: `${m.color}35`, background: `${m.color}10` }}>
                      {m.tag}
                    </span>
                  </div>

                  <div className="tile-body">
                    <h3 className="tile-title">{m.title}</h3>
                    <p className="tile-desc">{m.desc}</p>
                  </div>

                  <div className="tile-footer">
                    <span className="tile-link-text" style={{ color: m.color }}>
                      Open Workspace <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Activity Curve Graph Section */}
          <section className="dash-card-section">
            <div className="section-header">
              <div className="title-group">
                <h2>Activity &amp; Performance</h2>
                <p>Daily coding minutes recorded over the last 7 days</p>
              </div>
              <div className="header-trend-badge">
                <TrendingUpIcon /> <strong>+18%</strong> time vs last week
              </div>
            </div>

            <div className="chart-container-card">
              <div className="chart-svg-wrap">
                {/* SVG Area Chart with Gridlines & Wave Curve */}
                <svg viewBox="0 0 560 140" className="activity-wave-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#8E5BFF" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#8E5BFF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8E5BFF" />
                      <stop offset="50%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="0" y1="20" x2="560" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="65" x2="560" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="560" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  {/* Smooth Filled Area */}
                  <path
                    d="M 40,85 C 80,60 100,50 120,50 C 160,80 180,105 200,105 C 240,40 260,15 280,15 C 320,40 340,65 360,65 C 400,80 420,92 440,92 C 480,50 500,35 520,35 L 520,130 L 40,130 Z"
                    fill="url(#areaGrad)"
                  />

                  {/* Smooth Gradient Line */}
                  <path
                    d="M 40,85 C 80,60 100,50 120,50 C 160,80 180,105 200,105 C 240,40 260,15 280,15 C 320,40 340,65 360,65 C 400,80 420,92 440,92 C 480,50 500,35 520,35"
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Glowing Data Point Circles */}
                  {WEEKLY_POINTS.map((pt) => (
                    <g key={pt.day} className={`chart-point-group ${pt.active ? 'active-pt' : ''}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={pt.active ? '7' : '5'}
                        fill={pt.active ? '#34D399' : '#38BDF8'}
                        stroke="#0D111C"
                        strokeWidth="2.5"
                      />
                    </g>
                  ))}
                </svg>

                {/* X-Axis Day Labels */}
                <div className="chart-xaxis-labels">
                  {WEEKLY_POINTS.map((pt) => (
                    <div key={pt.day} className={`xaxis-item ${pt.active ? 'active' : ''}`}>
                      <span className="xaxis-day">{pt.day}</span>
                      <span className="xaxis-mins">{pt.mins}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Insights Footer */}
              <div className="chart-insights-bar">
                <div className="insight-cell">
                  <span className="insight-number">1.5 hrs</span>
                  <span className="insight-label">Weekly Practice</span>
                </div>
                <div className="insight-cell">
                  <span className="insight-number">100%</span>
                  <span className="insight-label">Solution Accuracy</span>
                </div>
                <div className="insight-cell">
                  <span className="insight-number">Python</span>
                  <span className="insight-label">Primary Language</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: RECENT PROGRESS + LEADERBOARD */}
        <div className="dash-main-right">
          {/* Recent Progress Section */}
          <section className="dash-card-section">
            <div className="section-header">
              <div className="title-group">
                <h2>Recent Challenges</h2>
                <p>Continue your active problem steps</p>
              </div>
              <Link to="/exercises" className="section-action-link">See all →</Link>
            </div>

            <div className="recent-list-container">
              {RECENT_ITEMS.map((item) => (
                <Link
                  key={item.title}
                  to={item.lang === 'Web Dev' ? '/workbench' : '/visualiser'}
                  className="recent-challenge-card clickable-card"
                  title={`Launch ${item.title}`}
                >
                  <div className="challenge-head">
                    <span className="challenge-title">{item.title}</span>
                    <span className="challenge-lang-tag" style={{ color: LANG_COLORS[item.lang] ?? '#8E5BFF' }}>
                      {item.lang}
                    </span>
                  </div>

                  <div className="challenge-progress-group">
                    <div className="bar-track-outer">
                      <div
                        className="bar-fill-inner"
                        style={{
                          width: `${item.pct}%`,
                          background: item.pct === 100 ? 'linear-gradient(90deg, #34D399, #10B981)' : 'linear-gradient(90deg, #8E5BFF, #38BDF8)',
                        }}
                      />
                    </div>
                    <div className="challenge-meta">
                      <span className="step-text">{item.step}</span>
                      <span className="pct-badge">{item.pct}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Top Learners Leaderboard Section */}
          <section className="dash-card-section">
            <div className="section-header">
              <div className="title-group">
                <h2>Weekly Leaderboard</h2>
                <p>Top performing students this week</p>
              </div>
              <Link to="/leaderboard" className="section-action-link">Leaderboard →</Link>
            </div>

            <div className="leaderboard-card-widget">
              {[
                { rank: 1, name: 'Aryan Singh', xp: 980, trophy: '🥇', label: '1st Place' },
                { rank: 2, name: 'Priya Sharma', xp: 850, trophy: '🥈', label: '2nd Place' },
                { rank: 3, name: 'Rohan Gupta', xp: 720, trophy: '🥉', label: '3rd Place' },
              ].map((l) => (
                <div key={l.rank} className={`leader-row rank-style-${l.rank}`}>
                  <div className="leader-left">
                    <span className="trophy-icon">{l.trophy}</span>
                    <div className="leader-user-info">
                      <span className="leader-user-name">{l.name}</span>
                      <span className="leader-user-place">{l.label}</span>
                    </div>
                  </div>
                  <div className="leader-right">
                    <span className="leader-xp-val">{l.xp}</span>
                    <span className="leader-xp-lbl">XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
