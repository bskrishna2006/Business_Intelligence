import { useMemo } from 'react';

const PANEL_WIDTH = 280;

function detectType(values) {
  const nonNull = values.filter((v) => v != null && v !== '');
  if (nonNull.length === 0) return 'empty';
  const numericCount = nonNull.filter((v) => !isNaN(Number(v))).length;
  if (numericCount / nonNull.length >= 0.8) return 'numeric';
  // simple date heuristic
  const dateCount = nonNull.filter((v) => /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(v))).length;
  if (dateCount / nonNull.length >= 0.5) return 'date';
  return 'text';
}

function computeProfile(data, column) {
  const rawValues = data.map((row) => row[column]);
  const nonNull = rawValues.filter((v) => v != null && v !== '' && v !== undefined);
  const nullCount = rawValues.length - nonNull.length;
  const type = detectType(rawValues);

  const profile = {
    type,
    total: rawValues.length,
    nullCount,
    distinctCount: new Set(nonNull.map(String)).size,
  };

  if (type === 'numeric') {
    const nums = nonNull.map(Number).filter((n) => !isNaN(n));
    profile.min = Math.min(...nums);
    profile.max = Math.max(...nums);
    profile.avg = nums.reduce((s, n) => s + n, 0) / nums.length;
    profile.median = (() => {
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    })();

    // histogram: up to 8 bins
    const binCount = Math.min(8, Math.max(2, Math.round(Math.sqrt(nums.length))));
    const range = profile.max - profile.min || 1;
    const binSize = range / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      label: `${(profile.min + i * binSize).toFixed(1)}`,
      count: 0,
    }));
    nums.forEach((n) => {
      const idx = Math.min(binCount - 1, Math.floor((n - profile.min) / binSize));
      bins[idx].count += 1;
    });
    profile.histogram = bins;
  }

  // top values (text or numeric)
  const freq = {};
  nonNull.forEach((v) => {
    const k = String(v);
    freq[k] = (freq[k] || 0) + 1;
  });
  profile.topValues = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([value, count]) => ({ value, count, pct: count / nonNull.length }));

  return profile;
}

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(n);
}

export default function ColumnProfilePanel({ column, data, onClose }) {
  const profile = useMemo(() => {
    if (!column || !data?.length) return null;
    return computeProfile(data, column);
  }, [column, data]);

  if (!column) return null;

  const TYPE_COLORS = {
    numeric: 'text-[var(--color-accent)]',
    text: 'text-[var(--color-accent-secondary)]',
    date: 'text-[var(--color-success)]',
    empty: 'text-[var(--color-text-muted)]',
  };

  const TYPE_LABELS = {
    numeric: '# Numeric',
    text: '𝐓 Text',
    date: '📅 Date',
    empty: '∅ Empty',
  };

  return (
    <div
      style={{ width: PANEL_WIDTH }}
      className="shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col animate-fade-in overflow-y-auto"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-bg-card)] z-10">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Column Profile</p>
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] truncate">{column}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] text-lg leading-none ml-2 shrink-0"
          title="Close"
        >
          ×
        </button>
      </div>

      {!profile ? (
        <div className="p-4 text-xs text-[var(--color-text-muted)]">No data available.</div>
      ) : (
        <div className="p-4 space-y-5">
          {/* Type badge + summary stats */}
          <div>
            <span className={`text-xs font-bold font-mono ${TYPE_COLORS[profile.type]}`}>
              {TYPE_LABELS[profile.type]}
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Total', value: fmt(profile.total) },
                { label: 'Nulls', value: fmt(profile.nullCount) },
                { label: 'Distinct', value: fmt(profile.distinctCount) },
                { label: 'Fill %', value: `${(((profile.total - profile.nullCount) / (profile.total || 1)) * 100).toFixed(0)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-[var(--color-bg-primary)] px-3 py-2 border border-[var(--color-border)]">
                  <p className="text-[9px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Numeric stats */}
          {profile.type === 'numeric' && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Statistics</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Min', value: fmt(profile.min) },
                  { label: 'Max', value: fmt(profile.max) },
                  { label: 'Average', value: fmt(profile.avg?.toFixed ? profile.avg.toFixed(3) : profile.avg) },
                  { label: 'Median', value: fmt(profile.median?.toFixed ? profile.median.toFixed(3) : profile.median) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)]">{label}</span>
                    <span className="font-mono font-semibold text-[var(--color-text-primary)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histogram */}
          {profile.type === 'numeric' && profile.histogram?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Distribution</p>
              <div className="flex items-end gap-0.5 h-16">
                {(() => {
                  const maxCount = Math.max(...profile.histogram.map((b) => b.count), 1);
                  return profile.histogram.map((bin, i) => {
                    const heightPct = (bin.count / maxCount) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${bin.label}: ${bin.count}`}>
                        <div
                          className="w-full rounded-t-sm bg-[var(--color-accent)] opacity-80 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] mt-1 text-center">Frequency distribution</p>
            </div>
          )}

          {/* Top Values */}
          {profile.topValues?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Top Values
              </p>
              <div className="space-y-1.5">
                {profile.topValues.map(({ value, count, pct }) => (
                  <div key={value}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-mono text-[var(--color-text-secondary)] truncate max-w-[140px]" title={value}>
                        {value}
                      </span>
                      <span className="text-[var(--color-text-muted)] shrink-0 ml-1">
                        {count} ({(pct * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--color-bg-primary)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)]"
                        style={{ width: `${(pct * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
