const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard', icon: '📊'
  },
  {
    id: 'ask', label: 'Ask AI', icon: '💬'
  },
  {
    id: 'visualize', label: 'Visualize', icon: '📈'
  },
  {
    id: 'data', label: 'Browse', icon: '📋'
  },
  {
    id: 'insights', label: 'Insights', icon: '✨'
  },
  {
    id: 'sql', label: 'SQL', icon: '💾'
  },
];

export default function Sidebar({ activePage, onNavigate, datasetInfo, user, onLogout, children, theme, onToggleTheme }) {
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-60 h-screen flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-soft)] shrink-0">

      {/* Brand with warm gradient */}
      <div className="px-5 py-5 border-b border-[var(--color-border-soft)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white text-sm font-bold shadow-md">
            ✨
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text-primary)]">InsightAI</h1>
            <p className="text-[10px] text-[var(--color-text-muted)] font-[450]">Data Explorer</p>
          </div>
        </div>
      </div>

      {/* Upload section */}
      <div className="border-b border-[var(--color-border-soft)]">
        {children}
      </div>

      {/* Warm Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-3">
          Pages
        </p>
        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            const isLocked = item.id !== 'dashboard' && !datasetInfo;
            return (
              <button
                key={item.id}
                onClick={() => !isLocked && onNavigate(item.id)}
                title={isLocked ? 'Upload data first' : item.label}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] text-white shadow-md'
                    : isLocked
                      ? 'text-[var(--color-text-muted)] opacity-35 cursor-not-allowed'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)] hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {isLocked && (
                  <svg className="w-3.5 h-3.5 opacity-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Dataset info with warm styling */}
        {datasetInfo && (
          <div className="mt-6 pt-4 border-t border-[var(--color-border-soft)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-3">
              Current Dataset
            </p>
            <div className="card px-3.5 py-3 border-[var(--color-border-soft)] mx-0">
              <div className="flex gap-2 text-[11px] text-[var(--color-text-secondary)] mb-3 font-medium">
                <span>{datasetInfo.row_count?.toLocaleString()} rows</span>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span>{datasetInfo.columns?.length} cols</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {datasetInfo.columns?.slice(0, 5).map((col) => (
                  <span key={col} className="text-[9px] px-2 py-1 rounded-[8px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-mono truncate max-w-[70px] border border-[var(--color-border-soft)]">
                    {col}
                  </span>
                ))}
                {datasetInfo.columns?.length > 5 && (
                  <span className="text-[9px] px-2 py-1 rounded-[8px] bg-[var(--color-bg-primary)] text-[var(--color-text-muted)]">
                    +{datasetInfo.columns.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User section with warm styling */}
      <div className="px-3 py-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-primary)]">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Theme
          </span>
          <button onClick={onToggleTheme} className="theme-toggle">
            <span>{theme === 'dark' ? 'Night' : 'Light'}</span>
            <span className="text-base leading-none">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all p-2 rounded-[8px] shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-[var(--color-text-muted)] text-center font-medium">Powered by Groq</p>
        )}
      </div>
    </aside>
  );
}
