export default function Sidebar({ datasetInfo, children }) {
  return (
    <aside className="w-72 h-screen flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] shrink-0">
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

      {/* Upload Area */}
      {children}

      {/* Dataset Info */}
      {datasetInfo && (
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Dataset
            </h3>
            <div className="flex gap-3 text-[10px] text-[var(--color-text-muted)]">
              <span>{datasetInfo.row_count?.toLocaleString()} rows</span>
              <span>{datasetInfo.columns?.length} cols</span>
            </div>
          </div>
          
          <div className="space-y-1">
            {datasetInfo.columns?.map((col, i) => (
              <div
                key={i}
                className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] font-mono truncate"
              >
                {col}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Groq AI · FastAPI · SQLite
        </p>
      </div>
    </aside>
  );
}
