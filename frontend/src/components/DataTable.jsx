export default function DataTable({ data }) {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);
  const displayRows = data.slice(0, 100);

  return (
    <div className="overflow-auto max-h-[420px] rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-elevated)] sticky top-0 z-10">
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors">
              {columns.map((col, j) => (
                <td key={j} className="px-3 py-2 text-xs text-[var(--color-text-secondary)] font-mono whitespace-nowrap">
                  {row[col] != null ? String(row[col]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 100 && (
        <div className="text-center text-[10px] text-[var(--color-text-muted)] py-2 bg-[var(--color-bg-card)]">
          Showing 100 of {data.length} rows
        </div>
      )}
    </div>
  );
}
