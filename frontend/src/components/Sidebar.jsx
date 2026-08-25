import { 
  SquaresFour, 
  ChatTeardropText, 
  ChartBar, 
  Table, 
  Lightbulb, 
  Database, 
  Sparkle, 
  Moon, 
  Sun,
  SignOut,
  LockKey
} from '@phosphor-icons/react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
  { id: 'ask', label: 'Ask AI', icon: ChatTeardropText },
  { id: 'visualize', label: 'Visualize', icon: ChartBar },
  { id: 'data', label: 'Browse', icon: Table },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'sql', label: 'SQL Query', icon: Database },
];

export default function Sidebar({ activePage, onNavigate, datasetInfo, user, onLogout, children, theme, onToggleTheme }) {
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="w-60 h-screen flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] shrink-0">

      {/* Brand logo & title */}
      <div className="px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white shadow-md shadow-[var(--color-accent)]/15">
            <Sparkle size={16} weight="fill" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[var(--color-text-primary)] tracking-tight">InsightAI</h1>
            <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">Data Explorer</p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div className="border-b border-[var(--color-border)]">
        {children}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-3.5">
            WORKSPACE
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const isLocked = item.id !== 'dashboard' && !datasetInfo;
              return (
                <button
                  key={item.id}
                  onClick={() => !isLocked && onNavigate(item.id)}
                  disabled={isLocked}
                  title={isLocked ? 'Upload a dataset first' : item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group cursor-pointer
                    ${isActive
                      ? 'bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/15'
                      : isLocked
                        ? 'text-[var(--color-text-muted)] opacity-40 cursor-not-allowed'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isLocked && <LockKey size={12} className="opacity-60" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dataset metadata card */}
        {datasetInfo && (
          <div className="pt-4 border-t border-[var(--color-border-soft)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-3">
              CURRENT DATASET
            </p>
            <div className="card px-3.5 py-3 border-[var(--color-border-soft)] bg-[var(--color-bg-card)] mx-0 rounded-lg space-y-2.5">
              <div className="flex gap-2 text-[10px] text-[var(--color-text-secondary)] font-semibold">
                <span>{datasetInfo.row_count?.toLocaleString()} rows</span>
                <span className="text-[var(--color-text-muted)]">•</span>
                <span>{datasetInfo.columns?.length} cols</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {datasetInfo.columns?.slice(0, 4).map((col) => (
                  <span key={col} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-mono truncate max-w-[85px] border border-[var(--color-border-soft)]">
                    {col}
                  </span>
                ))}
                {datasetInfo.columns?.length > 4 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-bold">
                    +{datasetInfo.columns.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User settings / Sign out */}
      <div className="px-3 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/50">
        <div className="flex items-center justify-between px-2 mb-3.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            APPEARANCE
          </span>
          <button 
            onClick={onToggleTheme} 
            className="theme-toggle flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer font-bold"
          >
            {theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
            <span className="capitalize">{theme === 'dark' ? 'dark' : 'light'}</span>
          </button>
        </div>
        {user ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 shadow-sm shadow-[var(--color-accent)]/15">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--color-text-primary)] truncate leading-none mb-0.5">{user.name}</p>
              <p className="text-[9px] text-[var(--color-text-muted)] truncate font-semibold leading-none">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-all p-2 rounded-lg shrink-0 cursor-pointer border border-transparent hover:border-[var(--color-danger)]/10"
            >
              <SignOut size={14} />
            </button>
          </div>
        ) : (
          <p className="text-[9px] text-[var(--color-text-muted)] text-center font-bold">Powered by Groq</p>
        )}
      </div>
    </aside>
  );
}
