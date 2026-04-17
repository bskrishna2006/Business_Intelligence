export default function DashboardPage({ datasetInfo, results, onNavigate }) {
    const { sql_query, table_result, stats, insights } = results || {};

    const quickStats = datasetInfo ? [
        { label: 'Total Rows', value: datasetInfo.row_count?.toLocaleString() ?? '—', icon: '📋', color: '#4f46e5' },
        { label: 'Columns', value: datasetInfo.columns?.length ?? '—', icon: '📊', color: '#0891b2' },
        { label: 'Query Results', value: table_result?.length?.toLocaleString() ?? '—', icon: '🔍', color: '#059669' },
        { label: 'Insights', value: insights?.length ?? '—', icon: '💡', color: '#d97706' },
    ] : [];

    return (
        <div className="flex-1 overflow-auto p-6 bg-[var(--color-bg-primary)]">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Dashboard</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    {datasetInfo ? `Analyzing: ${datasetInfo.row_count?.toLocaleString()} rows · ${datasetInfo.columns?.length} columns` : 'Upload a CSV to get started'}
                </p>
            </div>

            {!datasetInfo ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="text-5xl mb-4">📂</div>
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">No dataset loaded</h3>
                    <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                        Upload a CSV file from the sidebar to start exploring your data with AI.
                    </p>
                </div>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {quickStats.map((s) => (
                            <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg">{s.icon}</span>
                                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">{s.label}</span>
                                </div>
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Columns overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
                                Dataset Columns
                            </h3>
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                {datasetInfo.columns?.map((col) => (
                                    <span key={col} className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] font-mono border border-[var(--color-border)]">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Last query */}
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
                                Last Query
                            </h3>
                            {sql_query ? (
                                <div>
                                    <pre className="text-[11px] font-mono text-[var(--color-accent)] whitespace-pre-wrap leading-relaxed bg-[var(--color-bg-primary)] rounded-lg p-3 border border-[var(--color-border)] max-h-36 overflow-auto">
                                        {sql_query}
                                    </pre>
                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                                        Returned {table_result?.length ?? 0} rows
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-24 text-center">
                                    <p className="text-xs text-[var(--color-text-muted)]">No queries yet</p>
                                    <button
                                        onClick={() => onNavigate('ask')}
                                        className="mt-2 px-3 py-1.5 text-xs bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Ask a question →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights preview */}
                    {insights && insights.length > 0 && (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
                                    Latest Insights
                                </h3>
                                <button onClick={() => onNavigate('insights')} className="text-[10px] text-[var(--color-accent)] hover:underline">
                                    View all →
                                </button>
                            </div>
                            <div className="space-y-2">
                                {insights.slice(0, 3).map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                                        <span className="text-amber-400 text-xs mt-0.5">●</span>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick nav cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                        {[
                            { id: 'ask', icon: '💬', label: 'Ask AI', desc: 'Query in natural language' },
                            { id: 'visualize', icon: '📊', label: 'Visualize', desc: 'Drag & drop chart builder' },
                            { id: 'data', icon: '📋', label: 'Browse Data', desc: 'Explore raw dataset' },
                            { id: 'insights', icon: '💡', label: 'Insights', desc: 'Stats & predictions' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-left hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] transition-all group"
                            >
                                <span className="text-xl block mb-2">{item.icon}</span>
                                <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-0.5">{item.label}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)]">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
