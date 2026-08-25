import { useState, useEffect } from 'react';
import { 
  Table, 
  Columns, 
  MagnifyingGlass, 
  Lightbulb, 
  FolderOpen, 
  ChartBar, 
  ChartLine, 
  ChartPie, 
  DotsNine, 
  GridFour, 
  Sparkle, 
  ArrowRight,
  Trash,
  Clock,
  Plus,
  ChatTeardropText,
  Printer
} from '@phosphor-icons/react';

function getVisualIcon(type) {
  switch (type?.toLowerCase()) {
    case 'bar': return <ChartBar size={24} />;
    case 'line': return <ChartLine size={24} />;
    case 'pie': return <ChartPie size={24} />;
    case 'scatter': return <DotsNine size={24} />;
    case 'heatmap': return <GridFour size={24} />;
    case 'area': return <ChartLine size={24} />;
    case 'histogram': return <ChartBar size={24} />;
    default: return <ChartBar size={24} />;
  }
}

const STORAGE_KEY = 'saved_visualizations';

function loadSavedVisualizations() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSavedVisualizations(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function DashboardPage({ datasetInfo, results, onNavigate, onCreateVisualization, onOpenSavedVisualization }) {
    const { sql_query, table_result, insights } = results || {};
    const [recommendations, setRecommendations] = useState(null);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const [savedVisuals, setSavedVisuals] = useState(loadSavedVisualizations());

    // Fetch recommendations when dataset changes
    useEffect(() => {
        if (datasetInfo && datasetInfo.columns?.length > 0) {
            fetchRecommendations();
        }
    }, [datasetInfo?.columns?.length]);

    useEffect(() => {
        const handleSavedUpdate = () => setSavedVisuals(loadSavedVisualizations());
        window.addEventListener('saved-visualizations', handleSavedUpdate);
        window.addEventListener('storage', handleSavedUpdate);
        return () => {
            window.removeEventListener('saved-visualizations', handleSavedUpdate);
            window.removeEventListener('storage', handleSavedUpdate);
        };
    }, []);

    const handleDeleteSaved = (id) => {
        const updated = savedVisuals.filter((item) => item.id !== id);
        setSavedVisuals(updated);
        saveSavedVisualizations(updated);
        window.dispatchEvent(new Event('saved-visualizations'));
    };

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
        { label: 'Total Rows', value: datasetInfo.row_count?.toLocaleString() ?? '—', icon: Table, accent: 'from-[var(--color-accent)]' },
        { label: 'Data Columns', value: datasetInfo.columns?.length ?? '—', icon: Columns, accent: 'from-[var(--color-accent-secondary)]' },
        { label: 'Query Results', value: table_result?.length?.toLocaleString() ?? '—', icon: MagnifyingGlass, accent: 'from-[var(--color-success)]' },
        { label: 'AI Insights', value: insights?.length ?? '—', icon: Lightbulb, accent: 'from-[var(--color-warning)]' },
    ] : [];

    return (
        <div className="flex-1 overflow-auto p-8 bg-[var(--color-bg-primary)]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">Dashboard</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                        {datasetInfo 
                          ? `Exploring ${datasetInfo.row_count?.toLocaleString()} rows across ${datasetInfo.columns?.length} columns` 
                          : 'Upload a CSV dataset from the sidebar to begin analysis'}
                    </p>
                </div>
                {datasetInfo && (
                    <button
                        onClick={() => window.print()}
                        className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer flex items-center gap-2 no-print"
                    >
                        <Printer size={14} />
                        <span>Export PDF Report</span>
                    </button>
                )}
            </div>

            {!datasetInfo ? (
                /* Premium Empty State */
                <div className="flex flex-col items-center justify-center h-[55vh] text-center max-w-sm mx-auto space-y-4">
                    <div className="p-4 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                        <FolderOpen size={36} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Ready to explore?</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">
                        Drag and drop a CSV file into the sidebar uploader. InsightAI will automatically parse the schema and recommend visualizations.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {quickStats.map((s, idx) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="card p-5 bg-[var(--color-bg-card)] hover:border-[var(--color-border-hover)] relative overflow-hidden group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all duration-300">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{s.label}</span>
                                    </div>
                                    <p className="text-2xl font-extrabold text-[var(--color-text-primary)]">
                                        {s.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* AI Recommendations Section */}
                    {recommendations && recommendations.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Sparkle size={16} className="text-[var(--color-accent)]" />
                                    AI Recommendations
                                </h3>
                                <span className="text-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {recommendations.length} Suggestions
                                </span>
                            </div>

                            {/* Recommendations Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {recommendations.map((rec, idx) => (
                                    <div
                                        key={rec.id || idx}
                                        className="card p-5 bg-[var(--color-bg-card)] border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer group transition-all"
                                        onClick={() => onCreateVisualization ? onCreateVisualization(rec) : onNavigate('ask')}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all duration-300">
                                                {getVisualIcon(rec.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-bold text-[var(--color-text-primary)] text-xs">
                                                            {rec.title || rec.type}
                                                        </h4>
                                                        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                                                            {rec.type} CHART
                                                        </p>
                                                    </div>
                                                    {rec.confidence && (
                                                        <span className="text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded">
                                                            {Math.round(rec.confidence * 100)}% Match
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold line-clamp-2">
                                                    {rec.rationale}
                                                </p>
                                                {rec.features && rec.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {rec.features.slice(0, 2).map((feat, i) => (
                                                            <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-soft)] font-medium">
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
                        <div className="card p-8 bg-[var(--color-bg-card)] border-[var(--color-border-soft)] flex flex-col items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                            <p className="text-xs font-bold text-[var(--color-text-secondary)]">Generating automated recommendations...</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">Analyzing column distributions and schemas</p>
                        </div>
                    )}

                    {/* Saved Visualizations */}
                    {savedVisuals.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Clock size={16} className="text-[var(--color-accent)]" />
                                    Saved Visualizations
                                </h3>
                                <span className="text-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {savedVisuals.length} saved
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {savedVisuals.map((viz) => (
                                    <div key={viz.id} className="card p-5 bg-[var(--color-bg-card)] border-[var(--color-border)]">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                                                    {viz.type === 'dashboard' ? 'dashboard' : (viz.source || 'saved')}
                                                </p>
                                                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                                                    {viz.title || (viz.type === 'dashboard' ? 'AI Dashboard' : `${viz.type} chart`)}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSaved(viz.id)}
                                                className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] cursor-pointer p-1 rounded hover:bg-[var(--color-danger)]/5"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                        {viz.type === 'dashboard' ? (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-medium">
                                                    {viz.charts?.length || 0} charts
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold">
                                                    dashboard
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {viz.x_axis && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-mono">
                                                        X: {viz.x_axis}
                                                    </span>
                                                )}
                                                {(viz.y_axis || (viz.y_cols && viz.y_cols.length > 0)) && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-mono">
                                                        Y: {viz.y_axis || viz.y_cols.join(', ')}
                                                    </span>
                                                )}
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold">
                                                    {viz.type}
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => onOpenSavedVisualization && onOpenSavedVisualization(viz)}
                                            className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                                        >
                                            {viz.type === 'dashboard' ? 'Open Dashboard' : 'Open Visual Builder'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Dataset Overview */}
                        <div className="card p-6 bg-[var(--color-bg-card)] flex flex-col">
                            <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                                <Columns size={16} className="text-[var(--color-accent)]" />
                                Dataset Columns
                            </h3>
                            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                                {datasetInfo.columns?.map((col) => (
                                    <span key={col} className="text-[10px] px-2.5 py-1 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold border border-[var(--color-border-soft)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-default">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Last Query Card */}
                        <div className="card p-6 bg-[var(--color-bg-card)] flex flex-col">
                            <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                                <MagnifyingGlass size={16} className="text-[var(--color-accent)]" />
                                Latest Executed Query
                            </h3>
                            {sql_query ? (
                                <div className="space-y-3">
                                    <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-3">
                                        <pre className="text-[11px] font-mono text-[var(--color-accent)] whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto">
                                            {sql_query}
                                        </pre>
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                                        ✓ Returned {table_result?.length ?? 0} rows from dataset
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 my-auto">
                                    <p className="text-xs text-[var(--color-text-muted)] font-semibold">No queries executed yet</p>
                                    <button
                                        onClick={() => onNavigate('ask')}
                                        className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer"
                                    >
                                        Ask your first question
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Insights section */}
                    {insights && insights.length > 0 && (
                        <div className="card p-6 bg-[var(--color-bg-card)] space-y-4">
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                                <h3 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Lightbulb size={16} className="text-[var(--color-accent)]" />
                                    Key Findings & Insights
                                </h3>
                                <button onClick={() => onNavigate('insights')} className="text-xs text-[var(--color-accent)] hover:underline font-semibold cursor-pointer">
                                    View all Insights
                                </button>
                            </div>
                            <div className="space-y-3">
                                {insights.slice(0, 3).map((insight, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-accent-muted)] border border-[var(--color-border-soft)]">
                                        <Sparkle size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[var(--color-text-primary)] font-semibold leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick navigation */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { id: 'ask', icon: ChatTeardropText, label: 'Ask AI', desc: 'Query in plain English' },
                            { id: 'visualize', icon: ChartBar, label: 'Visualize', desc: 'Build interactive charts' },
                            { id: 'data', icon: Table, label: 'Browse', desc: 'Explore raw spreadsheet' },
                            { id: 'insights', icon: Lightbulb, label: 'Insights', desc: 'AI summary and statistics' },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className="card p-5 text-left group bg-[var(--color-bg-card)] hover:border-[var(--color-accent)] transition-all hover:shadow-sm cursor-pointer"
                                >
                                    <div className="p-2 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all duration-300 inline-block mb-3.5">
                                        <Icon size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-[var(--color-text-primary)] mb-1">{item.label}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">{item.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
