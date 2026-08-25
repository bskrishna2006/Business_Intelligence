import { useState } from 'react';
import { Broom, Check, X, Sparkle } from '@phosphor-icons/react';

export default function DataCleaningModal({ isOpen, onClose, onCleanSuccess, authFetch }) {
  const [imputeNumeric, setImputeNumeric] = useState('mean');
  const [fillText, setFillText] = useState('N/A');
  const [dropDuplicates, setDropDuplicates] = useState(true);
  const [dropEmptyCols, setDropEmptyCols] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  if (!isOpen) return null;

  const handleClean = async () => {
    setIsLoading(true);
    setError('');
    setSummary(null);

    const doFetch = authFetch || fetch;

    try {
      const res = await doFetch('/api/datasets/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impute_numeric: imputeNumeric,
          fill_text: fillText,
          drop_duplicates: dropDuplicates,
          drop_empty_cols: dropEmptyCols,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleaning failed');

      setSummary(data.cleaned_summary);
      if (onCleanSuccess) {
        onCleanSuccess(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="card w-full max-w-md bg-[var(--color-bg-card)] border-[var(--color-border)] p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
              <Broom size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Clean & Preprocess Dataset</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">Impute missing values and remove duplicates</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* Options Form */}
        <div className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1.5">
              Numeric Missing Value Imputation
            </label>
            <select
              value={imputeNumeric}
              onChange={(e) => setImputeNumeric(e.target.value)}
              className="input-field w-full text-xs"
            >
              <option value="mean">Replace with Column Mean (Average)</option>
              <option value="median">Replace with Column Median</option>
              <option value="mode">Replace with Column Mode (Most Frequent)</option>
              <option value="zero">Fill with Zero (0)</option>
              <option value="none">Do Not Impute Numeric Values</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1.5">
              Text / Categorical Missing Value Fill
            </label>
            <input
              type="text"
              value={fillText}
              onChange={(e) => setFillText(e.target.value)}
              placeholder="e.g. N/A or Unknown"
              className="input-field w-full text-xs"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-[var(--color-text-primary)]">
              <input
                type="checkbox"
                checked={dropDuplicates}
                onChange={(e) => setDropDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] accent-[var(--color-accent)]"
              />
              <span>Remove exact duplicate rows</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-[var(--color-text-primary)]">
              <input
                type="checkbox"
                checked={dropEmptyCols}
                onChange={(e) => setDropEmptyCols(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] accent-[var(--color-accent)]"
              />
              <span>Drop completely empty columns</span>
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-xs font-semibold border border-[var(--color-danger)]/20">
            {error}
          </div>
        )}

        {/* Summary output */}
        {summary && (
          <div className="p-3 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs font-semibold border border-[var(--color-success)]/20 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check size={14} weight="bold" /> Dataset cleaned successfully!
            </span>
            <span className="text-[10px] opacity-80">
              -{summary.rows_removed} rows, -{summary.cols_removed} cols
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClean}
            disabled={isLoading}
            className="btn-primary px-5 py-2 text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoading ? (
              <span>Cleaning...</span>
            ) : (
              <>
                <Sparkle size={14} weight="fill" />
                <span>Apply Cleaning</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
