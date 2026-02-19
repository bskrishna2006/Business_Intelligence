export default function InsightsPanel({ insights, prediction }) {
  if ((!insights || insights.length === 0) && !prediction) return null;

  return (
    <div className="space-y-4">
      {insights && insights.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
            Insights
          </h4>
          <div className="space-y-1.5">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[13px] text-[var(--color-text-secondary)] animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-[var(--color-warning)] shrink-0 text-xs mt-0.5">●</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prediction && Object.keys(prediction).length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
            Prediction
          </h4>
          <div className="p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-accent)] border-opacity-30 animate-slide-up">
            {prediction.error ? (
              <p className="text-sm text-[var(--color-warning)]">{prediction.error}</p>
            ) : (
              <div className="space-y-1.5">
                {prediction.message && (
                  <p className="text-sm text-[var(--color-text-primary)]">{prediction.message}</p>
                )}
                {prediction.predicted_value != null && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[var(--color-accent)] font-mono">
                      {typeof prediction.predicted_value === 'number' ? prediction.predicted_value.toFixed(2) : prediction.predicted_value}
                    </span>
                    {prediction.metric && <span className="text-xs text-[var(--color-text-muted)]">{prediction.metric}</span>}
                  </div>
                )}
                {prediction.confidence && (
                  <p className="text-[10px] text-[var(--color-text-muted)]">R² Score: {prediction.confidence}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
