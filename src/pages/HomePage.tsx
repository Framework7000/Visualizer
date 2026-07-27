import { Link } from 'react-router-dom'

// Minimal Creative Icons
function ZapIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function ArrowRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> }

function WorkbenchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function WhiteboardIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg> }
function ExercisesIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
function VisualiserIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function DashboardIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg> }

const INTRO_FEATURES = [
  {
    to: '/workbench',
    icon: <WorkbenchIcon />,
    title: 'Code Workbench',
    desc: 'Instant web & server sandbox supporting HTML, CSS, JavaScript, Python & Java with live previews.',
    tag: 'IDE SANDBOX',
    color: '#6B4CFF',
    gradient: 'linear-gradient(135deg, rgba(107, 76, 255, 0.22), rgba(255, 106, 198, 0.08))',
  },
  {
    to: '/visualiser',
    icon: <VisualiserIcon />,
    title: 'Algorithm Visualiser',
    desc: 'Step-through memory stack execution engine that explains data structures visually line by line.',
    tag: 'AST ENGINE',
    color: '#89E6D5',
    gradient: 'linear-gradient(135deg, rgba(137, 230, 213, 0.22), rgba(159, 245, 208, 0.08))',
  },
  {
    to: '/whiteboard',
    icon: <WhiteboardIcon />,
    title: 'Infinite Whiteboard',
    desc: 'Collaborative architectural canvas with flowchart connectors, drawing, sticky notes & export.',
    tag: 'DESIGN CANVAS',
    color: '#9ECCFA',
    gradient: 'linear-gradient(135deg, rgba(158, 204, 250, 0.22), rgba(141, 187, 255, 0.08))',
  },
  {
    to: '/exercises',
    icon: <ExercisesIcon />,
    title: 'Practice Challenges',
    desc: '12 curated algorithmic problems with automated test suites and real-time feedback.',
    tag: 'CHALLENGES',
    color: '#FBBE95',
    gradient: 'linear-gradient(135deg, rgba(251, 190, 149, 0.22), rgba(255, 204, 156, 0.08))',
  },
]

export default function HomePage() {
  return (
    <div className="home-intro-container">
      {/* Background Animated Neon Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* 1. FULL SCREEN HERO INTRO SECTION */}
      <section className="intro-hero-section snap-section">
        <h1 className="intro-main-title anim-fade-in-1">
          <span className="hero-line-1">
            Visualize{' '}
            <span className="hero-highlight-group">
              <span className="title-gradient shimmer-text">Code &amp; Logic</span>
              <svg className="headline-underline-svg" viewBox="0 0 320 16" fill="none">
                <defs>
                  <linearGradient id="gn-underline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7F5DF9" />
                    <stop offset="50%" stopColor="#6B4CFF" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                <path d="M 4 10 C 80 4, 240 14, 316 8" stroke="url(#gn-underline-grad)" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>
          </span>
          <span className="hero-line-2">Step by Step</span>
        </h1>

        <p className="intro-subtitle anim-fade-in-2">
          The modern way to master programming with{' '}
          <strong className="sub-highlight">step-through execution</strong> and{' '}
          <strong className="sub-highlight">interactive workspaces</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="intro-cta-row anim-fade-in-3">
          <Link to="/dashboard" className="btn-intro-primary">
            <DashboardIcon />
            <span>Student Dashboard</span>
            <ArrowRightIcon />
          </Link>

          <Link to="/visualiser" className="btn-intro-secondary">
            <ZapIcon />
            <span>Launch Visualiser</span>
          </Link>
        </div>
      </section>

      {/* 2. ANIMATED MODULES GRID SECTION */}
      <section id="modules-section" className="intro-grid-section snap-section">
        <div className="intro-section-label">
          <span className="label-line" />
          <span>INTERACTIVE WORKSPACES</span>
          <span className="label-line" />
        </div>

        <div className="intro-cards-grid">
          {INTRO_FEATURES.map((f, i) => (
            <Link
              key={f.to}
              to={f.to}
              className="intro-feature-card"
              style={{
                background: f.gradient,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div className="card-top-row">
                <span className="feature-icon-box" style={{ color: f.color, background: `${f.color}22` }}>
                  {f.icon}
                </span>
                <span className="feature-tag-badge" style={{ color: f.color, borderColor: `${f.color}40` }}>
                  {f.tag}
                </span>
              </div>

              <div className="card-body">
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>

              <div className="card-footer">
                <span className="feature-launch-link" style={{ color: f.color }}>
                  Explore Environment <ArrowRightIcon />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. MINIMAL TECH STATS STRIP & FOOTER WRAPPER */}
      <div className="snap-section-footer snap-section">
        <section className="intro-stats-strip">
          <div className="strip-metric">
            <span className="strip-num">5+</span>
            <span className="strip-lbl">Languages (HTML, CSS, JS, Python, Java)</span>
          </div>
          <div className="strip-divider" />
          <div className="strip-metric">
            <span className="strip-num">AST</span>
            <span className="strip-lbl">Line-by-line Execution Engine</span>
          </div>
          <div className="strip-divider" />
          <div className="strip-metric">
            <span className="strip-num">12+</span>
            <span className="strip-lbl">Interactive Algorithmic Tasks</span>
          </div>
        </section>

        <footer className="intro-site-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-logo-text">Grade<span className="text-highlight">Next</span></span>
              <p className="brand-tagline">Empowering future software engineers through interactive visual learning.</p>
            </div>

            <div className="footer-links-group">
              <div className="footer-col">
                <h4>Environments</h4>
                <Link to="/workbench">Code Workbench</Link>
                <Link to="/visualiser">Algorithm Visualiser</Link>
                <Link to="/whiteboard">Infinite Whiteboard</Link>
              </div>

              <div className="footer-col">
                <h4>Practice &amp; Stats</h4>
                <Link to="/exercises">Practice Exercises</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/dashboard">Student Dashboard</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} GradeNext. All rights reserved.</span>
            <span className="footer-built">Built for high-performance learning.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
