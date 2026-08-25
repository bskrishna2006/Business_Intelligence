import { useState } from 'react';
import ColumnProfilePanel from './ColumnProfilePanel';

export default function DataTable({ data }) {
  const [profiledCol, setProfiledCol] = useState(null);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayRows = data.slice(0, 200);

  const handleColClick = (col) => {
    setProfiledCol((prev) => (prev === col ? null : col));
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-[var(--color-border)] min-w-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-elevated)] sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleColClick(col)}
                  className={`px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider border-b border-[var(--color-border)] cursor-pointer select-none whitespace-nowrap transition-colors ${
                    profiledCol === col
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]'
                  }`}
                  title={`Profile column: ${col}`}
                >
                  <span className="flex items-center gap-1">
                    {col}
                    <span className="opacity-50 text-[8px]">▼</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors">
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`px-3 py-2 text-xs font-mono whitespace-nowrap transition-colors ${
                      profiledCol === col
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]/30'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {row[col] != null ? String(row[col]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 200 && (
          <div className="text-center text-[10px] text-[var(--color-text-muted)] py-2 bg-[var(--color-bg-card)] border-t border-[var(--color-border)]">
            Showing 200 of {data.length.toLocaleString()} rows
          </div>
        )}
      </div>

      {/* Column profiler panel */}
      {profiledCol && (
        <ColumnProfilePanel
          column={profiledCol}
          data={data}
          onClose={() => setProfiledCol(null)}
        />
      )}
    </div>
  );
}
