export default function FilesPage() {
  return (
    <div className="files-page">
      <div className="files-hero">
        <h1 className="files-title">Files</h1>
        <p className="files-sub">Your saved projects and code snippets</p>
      </div>
      <div className="files-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
        </svg>
        <p>No files yet. Open the <strong>Workbench</strong> to start coding and save your projects here.</p>
      </div>
    </div>
  )
}
