import { useState, useEffect } from 'react';

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

export default function DashboardPage({ datasetInfo, results, onNavigate }) {
    const { sql_query, table_result, stats, insights } = results || {};
    const [recommendations, setRecommendations] = useState(null);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);

    // Fetch recommendations when dataset changes
    useEffect(() => {
        if (datasetInfo && datasetInfo.columns?.length > 0) {
            fetchRecommendations();
        }
    }, [datasetInfo?.columns?.length]);

    const fetchRecommendations = async () => {
        setIsLoadingRecs(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('/api/datasets/auto-visualize', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    dataset_id: datasetInfo?.dataset_id,
                    columns: datasetInfo?.columns || [],
                    schema: datasetInfo?.schema || {},
                    sample_rows: datasetInfo?.sample_rows || [],
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setRecommendations(data.recommendations || []);
            } else {
                console.error('API error:', data.error);
                setRecommendations([]);
            }
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
            setRecommendations([]);
        } finally {
            setIsLoadingRecs(false);
        }
    };

    const quickStats = datasetInfo ? [
        { label: 'Rows', value: datasetInfo.row_count?.toLocaleString() ?? '—', icon: '📋', accent: 'from-[#d4a574]' },
        { label: 'Columns', value: datasetInfo.columns?.length ?? '—', icon: '📊', accent: 'from-[#7a9b99]' },
        { label: 'Results', value: table_result?.length?.toLocaleString() ?? '—', icon: '🔍', accent: 'from-[#c8b4a0]' },
        { label: 'Insights', value: insights?.length ?? '—', icon: '💡', accent: 'from-[#d4965a]' },
    ] : [];

    return (
        <div className="flex-1 overflow-auto p-7 bg-[var(--color-bg-primary)]">
            {/* Header with warm tones */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Dashboard</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {datasetInfo ? `Exploring ${datasetInfo.row_count?.toLocaleString()} rows across ${datasetInfo.columns?.length} columns` : 'Upload your first dataset to begin'}
                </p>
            </div>

            {!datasetInfo ? (
                /* Warm empty state */
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="text-6xl mb-6">📂</div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">Ready to explore?</h3>
                    <p className="text-base text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
                        Upload a CSV file from the sidebar or drag it here. We'll help you ask questions and uncover insights.
                    </p>
                </div>
            ) : (
                <>
                    {/* Warm Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {quickStats.map((s) => (
                            <div key={s.label} className="card p-5 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                                    <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{s.label}</span>
                                </div>
                                <p className={`text-3xl font-bold bg-gradient-to-r ${s.accent} to-[#8b7d71] bg-clip-text text-transparent`}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recommended Visualizations Section - SIMPLIFIED */}
                    {recommendations && recommendations.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                                    ✨ AI Recommendations
                                </h3>
                                <span className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-3 py-1 rounded-full font-medium">
                                    {recommendations.length} chart{recommendations.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Simple recommendation cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.map((rec, idx) => (
                                    <div
                                        key={rec.id || idx}
                                        className="card p-5 border-[var(--color-border)] hover:border-[var(--color-accent)] group cursor-pointer transition-all"
                                        onClick={() => {
                                            const columns = rec.features?.join(', ') || 'the data';
                                            const question = `Create a ${rec.type} chart showing ${columns}.`;
                                            onNavigate('ask');
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl group-hover:scale-110 transition-transform">
                                                {VISUALIZATION_ICONS[rec.type?.toLowerCase()] || '📊'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">
                                                            {rec.title || rec.type}
                                                        </h4>
                                                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-medium mt-0.5">
                                                            {rec.type} chart
                                                        </p>
                                                    </div>
                                                    {rec.confidence && (
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-sm font-bold text-[var(--color-accent)]">
                                                                {Math.round(rec.confidence * 100)}%
                                                            </div>
                                                            <p className="text-[10px] text-[var(--color-text-muted)]">match</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed line-clamp-2">
                                                    {rec.rationale}
                                                </p>
                                                {rec.features && rec.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {rec.features.slice(0, 2).map((feat, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-xs px-2 py-1 rounded-[8px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium truncate"
                                                            >
                                                                {feat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLoadingRecs && (
                        <div className="card p-8 mb-8 flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-3 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                Generating recommendations...
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                Analyzing your data to suggest the best charts
                            </p>
                        </div>
                    )}

                    {/* Main content grid with warm styling */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Dataset Overview */}
                        <div className="card p-6">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                                <span className="text-base">📋</span> Dataset Columns
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
                                {datasetInfo.columns?.map((col) => (
                                    <span key={col} className="text-xs px-3 py-1.5 rounded-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-[500] border border-[var(--color-border-soft)] hover:bg-[var(--color-accent)] hover:text-white transition-colors">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Last Query Card */}
                        <div className="card p-6">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                                <span className="text-base">🔍</span> Latest Query
                            </h3>
                            {sql_query ? (
                                <div>
                                    <div className="bg-[var(--color-bg-secondary)] rounded-[12px] border border-[var(--color-border)] p-4 mb-3">
                                        <pre className="text-[12px] font-mono text-[var(--color-accent)] whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto">
                                            {sql_query}
                                        </pre>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] font-medium">
                                        ✓ Returned {table_result?.length ?? 0} rows
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <p className="text-sm text-[var(--color-text-muted)] mb-3">No queries yet</p>
                                    <button
                                        onClick={() => onNavigate('ask')}
                                        className="btn-primary px-4 py-2 text-sm font-medium"
                                    >
                                        Ask a question →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights section with warm aesthetic */}
                    {insights && insights.length > 0 && (
                        <div className="card p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <span className="text-base">💡</span> Key Insights
                                </h3>
                                <button onClick={() => onNavigate('insights')} className="text-xs text-[var(--color-accent)] hover:underline font-medium">
                                    View all →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {insights.slice(0, 3).map((insight, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-[11px] bg-[var(--color-accent-muted)] border border-[var(--color-border-soft)]">
                                        <span className="text-[var(--color-accent)] font-bold text-sm mt-0.5 flex-shrink-0">✨</span>
                                        <p className="text-sm text-[var(--color-text-primary)] font-[450]">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick navigation with warm, organic design */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { id: 'ask', icon: '💬', label: 'Ask AI', desc: 'Natural language queries' },
                            { id: 'visualize', icon: '📊', label: 'Visualize', desc: 'Create charts' },
                            { id: 'data', icon: '📋', label: 'Browse', desc: 'Raw data explorer' },
                            { id: 'insights', icon: '✨', label: 'Insights', desc: 'Stats & trends' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="card p-5 text-left group hover:border-[var(--color-accent)] transition-all hover:shadow-md"
                            >
                                <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{item.label}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
