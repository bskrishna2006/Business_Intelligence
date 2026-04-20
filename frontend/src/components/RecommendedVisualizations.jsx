import { useState } from 'react';

const VISUALIZATION_ICONS = {
  bar: '📊',
  line: '📈',
  pie: '🥧',
  scatter: '🔹',
  heatmap: '🔥',
  area: '📊',
  histogram: '📉',
  boxplot: '📦',
};

export default function RecommendedVisualizations({
  recommendations,
  isLoading,
  onCreateVisualization,
  onPreview,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);

  if (isLoading) {
    return (
      <div className="mt-6 p-6 bg-[var(--color-bg-card)] rounded-[14px] border border-[var(--color-border)]">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-8 h-8 border-3 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">
            ✨ Getting AI recommendations...
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Analyzing your dataset to suggest the best visualizations
          </p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="mt-6 p-6 bg-[var(--color-bg-card)] rounded-[14px] border border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)] text-center">
          No recommendations available. Try uploading a dataset with more features.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Recommended Visualizations
        </h3>
        <span className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2 py-1 rounded-full font-medium">
          {recommendations.length} suggestions
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={rec.id || idx}
            className={`relative card p-4 cursor-pointer transition-all duration-300 ${
              selectedId === (rec.id || idx)
                ? 'ring-2 ring-[var(--color-accent)] shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedId(rec.id || idx)}
          >
            {/* Header with Icon and Type */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {VISUALIZATION_ICONS[rec.type?.toLowerCase()] || '📊'}
                </span>
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {rec.title || rec.type}
                  </h4>
                  <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                    {rec.type}
                  </span>
                </div>
              </div>
              {rec.confidence && (
                <div className="flex flex-col items-end">
                  <div className="text-xs font-bold text-[var(--color-accent)]">
                    {Math.round(rec.confidence * 100)}%
                  </div>
                  <div className="w-8 h-1 bg-[var(--color-border)] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-accent)] transition-all duration-300"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rationale */}
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              {rec.rationale || 'AI-recommended visualization for your data'}
            </p>

            {/* Features Used */}
            {rec.features && rec.features.length > 0 && (
              <div className="mb-4 pb-4 border-t border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
                  Uses:
                </p>
                <div className="flex flex-wrap gap-1">
                  {rec.features.slice(0, 3).map((feat, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2 py-1 rounded-full"
                    >
                      {feat}
                    </span>
                  ))}
                  {rec.features.length > 3 && (
                    <span className="text-xs text-[var(--color-text-muted)] px-2 py-1">
                      +{rec.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewingId(rec.id || idx);
                  onPreview && onPreview(rec);
                }}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-[11px] bg-[var(--color-bg-secondary)] text-[var(--color-accent)] border border-[var(--color-border-soft)] hover:bg-[var(--color-bg-elevated)] transition-all duration-200"
              >
                {previewingId === (rec.id || idx) ? '👁️ Preview' : 'Preview'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateVisualization && onCreateVisualization(rec);
                }}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-[11px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-soft)] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                ✨ Create
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 p-4 bg-[var(--color-accent-muted)] rounded-[14px]">
        <p className="text-xs text-[var(--color-accent)] font-medium">
          💡 Tip: Select a card to highlight it, then click "Create" to add it to your dashboard.
        </p>
      </div>
    </div>
  );
}
