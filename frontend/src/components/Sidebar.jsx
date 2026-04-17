const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  {
    id: 'ask', label: 'Ask AI', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'visualize', label: 'Visualize', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    )
  },
  {
    id: 'data', label: 'Data', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    )
  },
  {
    id: 'insights', label: 'Insights', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  },
  {
    id: 'sql', label: 'SQL', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
];

export default function Sidebar({ activePage, onNavigate, datasetInfo, user, onLogout, children }) {
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-60 h-screen flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] shrink-0">

      {/* Brand */}
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold">
            BI
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">InsightAI</h1>
            <p className="text-[10px] text-[var(--color-text-muted)]">Business Intelligence</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="border-b border-[var(--color-border)]">
        {children}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-3 mb-2">
          Pages
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            const isLocked = item.id !== 'dashboard' && !datasetInfo;
            return (
              <button
                key={item.id}
                onClick={() => !isLocked && onNavigate(item.id)}
                title={isLocked ? 'Upload a dataset first' : item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : isLocked
                      ? 'text-[var(--color-text-muted)] opacity-40 cursor-not-allowed'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]'
                  }`}
              >
                <span className={isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isLocked && (
                  <svg className="ml-auto w-3 h-3 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Dataset info */}
        {datasetInfo && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-3 mb-2">
              Dataset
            </p>
            <div className="px-3 py-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] mx-1">
              <div className="flex gap-3 text-[10px] text-[var(--color-text-muted)] mb-2">
                <span className="font-medium text-[var(--color-text-secondary)]">{datasetInfo.row_count?.toLocaleString()} rows</span>
                <span>·</span>
                <span className="font-medium text-[var(--color-text-secondary)]">{datasetInfo.columns?.length} cols</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {datasetInfo.columns?.slice(0, 6).map((col) => (
                  <span key={col} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono truncate max-w-[80px]">
                    {col}
                  </span>
                ))}
                {datasetInfo.columns?.length > 6 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                    +{datasetInfo.columns.length - 6}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[var(--color-border)]">
        {user ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors p-1 rounded shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-[var(--color-text-muted)] text-center">Groq AI · FastAPI · SQLite</p>
        )}
      </div>
    </aside>
  );
}
