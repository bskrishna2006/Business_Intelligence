import { GitMerge, SquaresFour, Sparkle, ArrowRight, CheckCircle } from '@phosphor-icons/react';

export default function PostUploadTransformModal({ 
  datasetInfo, 
  onTransformClick, 
  onDashboardClick 
}) {
  if (!datasetInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="card p-6 bg-[var(--color-bg-card)] border-[var(--color-border)] w-full max-w-lg space-y-6 text-left shadow-2xl animate-fade-in font-mono">
        
        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle size={24} weight="bold" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-[var(--color-text-primary)] uppercase tracking-tight">
              DATASET SUCCESSFULLY LOADED!
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] mt-0.5 font-bold">
              <span>{datasetInfo.name || 'Dataset'}</span>
              <span>•</span>
              <span>{datasetInfo.row_count?.toLocaleString()} rows</span>
              <span>•</span>
              <span>{datasetInfo.columns?.length} columns</span>
            </div>
          </div>
        </div>

        <p className="text-xs font-sans text-[var(--color-text-secondary)] leading-relaxed">
          Would you like to perform data transformations (multi-dataset joins, calculated columns, group-by, or missing value cleaning) before exploring, or proceed straight to the Executive Dashboard?
        </p>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Choice 1: Transformation Studio */}
          <button
            onClick={onTransformClick}
            className="card p-4 border-[var(--color-accent)] bg-[var(--color-accent-muted)] hover:border-[var(--color-accent)] cursor-pointer text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-[var(--color-accent)] text-white">
                <GitMerge size={18} />
              </div>
              <ArrowRight size={14} className="text-[var(--color-accent)] group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-xs font-mono font-bold text-[var(--color-text-primary)] uppercase">
              Transform Data First
            </h4>
            <p className="text-[10px] font-sans text-[var(--color-text-secondary)] leading-normal">
              Merge 2 CSVs, create math formulas, group & aggregate, or fill missing NAs.
            </p>
          </button>

          {/* Choice 2: Dashboard */}
          <button
            onClick={onDashboardClick}
            className="card p-4 border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-secondary)] cursor-pointer text-left transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-white/10 text-[var(--color-text-primary)]">
                <SquaresFour size={18} />
              </div>
              <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="text-xs font-mono font-bold text-[var(--color-text-primary)] uppercase">
              Continue to Dashboard
            </h4>
            <p className="text-[10px] font-sans text-[var(--color-text-secondary)] leading-normal">
              Proceed directly to auto-generated charts, predictions, and Groq AI assistant.
            </p>
          </button>

        </div>

      </div>
    </div>
  );
}
