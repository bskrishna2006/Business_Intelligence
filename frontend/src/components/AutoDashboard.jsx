import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#d4a574', '#7a9b99', '#c8b4a0', '#d4965a', '#8b7d71', '#a9a09a'];
const ICON_MAP = {
  bar: '📊', line: '📈', area: '🏔️', scatter: '🔹', pie: '🥧', histogram: '📉'
};

export default function AutoDashboard({ tableData, columns, datasetInfo, onClose }) {
  const [dashboards, setDashboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAutoDashboard();
  }, [tableData?.length]);

  const fetchAutoDashboard = async () => {
    if (!tableData || tableData.length === 0 || !columns) {
      setError('No data available');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/datasets/auto-dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          dataset_id: datasetInfo?.dataset_id,
          columns: columns || [],
          schema: datasetInfo?.schema || {},
          sample_rows: tableData.slice(0, 500) || [],
        }),
      });

      const data = await res.json();
      const normalizeError = (err) => {
        if (!err) return null;
        if (typeof err === 'string') return err;
        if (typeof err?.message === 'string') return err.message;
        try {
          return JSON.stringify(err);
        } catch {
          return 'Unexpected error';
        }
      };

      if (res.ok && data.charts && data.charts.length > 0) {
        setDashboards(data.charts);
      } else {
        setError(normalizeError(data.error) || 'Failed to generate dashboard');
      }
    } catch (err) {
      console.error('Failed to fetch auto-dashboard:', err);
      setError('Error generating visualizations');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chart) => {
    if (!chart.data || chart.data.length === 0) {
      return (
        <div className="w-full h-64 flex items-center justify-center text-[var(--color-text-muted)]">
          No data for this chart
        </div>
      );
    }

    const tooltipStyle = {
      contentStyle: {
        background: '#faf8f6',
        border: '1px solid #e0d9d1',
        borderRadius: '8px',
        color: '#3d3531',
        fontSize: '12px',
      },
    };

    try {
      switch (chart.type) {
        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,53,49,0.1)" />
                <XAxis dataKey={chart.x_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8078' }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {chart.series && chart.series.map((s, i) => (
                  <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} radius={[8, 8, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );

        case 'line':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,53,49,0.1)" />
                <XAxis dataKey={chart.x_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8078' }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {chart.series && chart.series.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );

        case 'area':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,53,49,0.1)" />
                <XAxis dataKey={chart.x_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8078' }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                {chart.series && chart.series.map((s, i) => (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={COLORS[i % COLORS.length]}
                    fill={COLORS[i % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );

        case 'scatter':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,53,49,0.1)" />
                <XAxis dataKey={chart.x_axis} name={chart.x_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <YAxis dataKey={chart.y_axis} name={chart.y_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <Tooltip {...tooltipStyle} />
                <Scatter data={chart.data} fill={COLORS[0]} />
              </ScatterChart>
            </ResponsiveContainer>
          );

        case 'pie':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chart.data}
                  dataKey={chart.y_axis}
                  nameKey={chart.x_axis}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chart.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          );

        case 'histogram':
          return (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,53,49,0.1)" />
                <XAxis dataKey={chart.x_axis} tick={{ fontSize: 12, fill: '#8b8078' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b8078' }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey={chart.y_axis} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          );

        default:
          return <div>Unsupported chart type: {chart.type}</div>;
      }
    } catch (e) {
      console.error('Chart render error:', e);
      return <div className="text-red-500 text-sm">Error rendering chart</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--color-bg-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-soft)] bg-[var(--color-bg-card)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            ✨ AI Dashboard
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Auto-generated visualizations showing relationships in your data
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-[10px] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all"
        >
          ← Back to Builder
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 border-4 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Analyzing dataset...
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Generating optimal visualizations with AI
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {error}
            </p>
            <button
              onClick={fetchAutoDashboard}
              className="mt-3 px-4 py-2 text-sm font-medium rounded-[10px] bg-[var(--color-accent)] text-white hover:shadow-md transition-all"
            >
              Retry
            </button>
          </div>
        ) : dashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl">📊</span>
            <p className="text-sm text-[var(--color-text-secondary)]">
              No visualizations could be generated
            </p>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs text-center">
              Try uploading a larger dataset with more columns and rows
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((chart, idx) => (
              <div
                key={idx}
                className="card p-5 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-md transition-all"
              >
                {/* Chart Header */}
                <div className="mb-4 pb-3 border-b border-[var(--color-border-soft)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ICON_MAP[chart.type] || '📊'}</span>
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                          {chart.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mt-0.5">
                          {chart.type} chart
                        </p>
                      </div>
                    </div>
                    {chart.confidence && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-[var(--color-accent)]">
                          {Math.round(chart.confidence * 100)}%
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">match</p>
                      </div>
                    )}
                  </div>
                  {chart.rationale && (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {chart.rationale}
                    </p>
                  )}
                </div>

                {/* Chart Render */}
                <div className="w-full">
                  {renderChart(chart)}
                </div>

                {/* Chart Details */}
                {chart.features && chart.features.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-border-soft)]">
                    <p className="text-xs text-[var(--color-text-muted)] font-medium mb-2">
                      Columns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chart.features.map((f, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-[7px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {dashboards.length > 0 && (
        <div className="border-t border-[var(--color-border-soft)] px-6 py-3 bg-[var(--color-bg-card)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            {dashboards.length} visualizations auto-generated • Analyzing {tableData?.length?.toLocaleString()} rows
          </p>
        </div>
      )}
    </div>
  );
}
