export default function StatsPanel({ stats }) {
  if (!stats || Object.keys(stats).length === 0) return null;

  const formatValue = (val) => {
    if (typeof val === 'number') return val % 1 === 0 ? val.toLocaleString() : val.toFixed(2);
    return String(val);
  };

  const isNested = typeof Object.values(stats)[0] === 'object';

  if (isNested) {
    return (
      <div className="space-y-5">
        {Object.entries(stats).map(([col, colStats]) => (
          <div key={col}>
            <h4 className="text-xs font-medium text-[var(--color-text-primary)] mb-2">{col}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(colStats).map(([key, value]) => (
                <div key={key} className="rounded-lg p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{key}</div>
                  <div className="text-sm font-semibold font-mono text-[var(--color-text-primary)] mt-0.5">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="rounded-lg p-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-center">
          <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{key}</div>
          <div className="text-sm font-semibold font-mono text-[var(--color-text-primary)] mt-0.5">
            {formatValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
