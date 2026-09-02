import { useState } from 'react';
import ColumnProfilePanel from './ColumnProfilePanel';

export default function DataTable({ data }) {
  const [profiledCol, setProfiledCol] = useState(null);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayRows = data.slice(0, 200);

  const getColTypeBadge = (colName) => {
    const val = data.find(r => r[colName] != null)?.[colName];
    if (typeof val === 'number') return '#';
    if (typeof val === 'boolean') return 'tf';
    const str = String(val || '').toLowerCase();
    if (str.includes('date') || str.includes('-') && str.length === 10) return '📅';
    return 'abc';
  };

  const isNumericCol = (colName) => {
    const val = data.find(r => r[colName] != null)?.[colName];
    return typeof val === 'number';
  };

  const handleColClick = (col) => {
    setProfiledCol((prev) => (prev === col ? null : col));
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden select-none">
      {/* Table */}
      <div className="flex-1 overflow-auto rounded-md border border-[var(--color-border)] min-w-0 bg-[var(--color-bg-card)]">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)] sticky top-0 z-10">
              <th className="px-2.5 py-2 text-center text-[10px] font-mono text-[var(--color-text-muted)] border-b border-r border-[var(--color-border)] w-10">
                #
              </th>
              {columns.map((col) => {
                const isNum = isNumericCol(col);
                return (
                  <th
                    key={col}
                    onClick={() => handleColClick(col)}
                    className={`px-3 py-2 text-[11px] font-mono font-semibold border-b border-r border-[var(--color-border)] cursor-pointer select-none whitespace-nowrap transition-colors ${
                      isNum ? 'text-right' : 'text-left'
                    } ${
                      profiledCol === col
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]'
                    }`}
                    title={`Click to profile column: ${col}`}
                  >
                    <div className={`flex items-center gap-1.5 ${isNum ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] font-mono border border-[var(--color-border)]">
                        {getColTypeBadge(col)}
                      </span>
                      <span>{col}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                <td className="px-2.5 py-1.5 text-center text-[10px] font-mono text-[var(--color-text-muted)] border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
                  {i + 1}
                </td>
                {columns.map((col) => {
                  const isNum = isNumericCol(col);
                  const val = row[col];
                  return (
                    <td
                      key={col}
                      className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap border-r border-[var(--color-border)] ${
                        isNum ? 'text-right' : 'text-left'
                      } ${
                        profiledCol === col
                          ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]/20'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {val != null ? (typeof val === 'number' ? val.toLocaleString() : String(val)) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 200 && (
          <div className="text-center text-[10px] font-mono text-[var(--color-text-muted)] py-2 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
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
