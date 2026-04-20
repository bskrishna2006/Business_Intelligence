import { useState, useMemo, useEffect } from 'react';
import AutoDashboard from './AutoDashboard';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar', icon: '📊' },
  { id: 'line', label: 'Line', icon: '📈' },
  { id: 'area', label: 'Area', icon: '🏔️' },
  { id: 'scatter', label: 'Scatter', icon: '⚬' },
  { id: 'pie', label: 'Pie', icon: '🥧' },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function VisualBuilder({ columns, tableData, datasetInfo }) {
  const [chartType, setChartType] = useState('bar');
  const [xCol, setXCol] = useState('');
  const [yCols, setYCols] = useState([]);
  const [autoRecs, setAutoRecs] = useState([]);
  const [isLoadingAuto, setIsLoadingAuto] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showAutoDashboard, setShowAutoDashboard] = useState(false);

  // Fetch auto-visualization recommendations
  const fetchAutoVisualizations = async () => {
    if (!tableData || tableData.length === 0 || !columns) return;
    
    setIsLoadingAuto(true);
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
          columns: columns || [],
          schema: datasetInfo?.schema || {},
          sample_rows: tableData.slice(0, 100) || [],
        }),
      });
      const data = await res.json();
      if (res.ok && data.recommendations) {
        setAutoRecs(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch auto-visualizations:', err);
    } finally {
      setIsLoadingAuto(false);
    }
  };

  // Load recommendations on mount
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      fetchAutoVisualizations();
    }
  }, [tableData?.length]);

  // Apply recommendation to builder
  const applyRecommendation = (rec) => {
    if (rec.x_axis && rec.y_axis) {
      setXCol(rec.x_axis);
      setYCols([rec.y_axis]);
      setChartType(rec.type || 'bar');
    }
  };

  // Determine numeric vs non-numeric columns from actual data
  const { numericCols, categoricalCols } = useMemo(() => {
    if (!tableData || tableData.length === 0 || !columns) {
      return { numericCols: [], categoricalCols: columns || [] };
    }
    const num = [];
    const cat = [];
    columns.forEach(col => {
      const sample = tableData.slice(0, 10).map(r => r[col]).filter(v => v != null);
      const isNumeric = sample.length > 0 && sample.every(v => !isNaN(Number(v)));
      if (isNumeric) num.push(col);
      else cat.push(col);
    });
    return { numericCols: num, categoricalCols: cat };
  }, [columns, tableData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!tableData || !xCol || yCols.length === 0) return [];
    const grouped = {};
    tableData.forEach(row => {
      const key = String(row[xCol] ?? 'Unknown');
      if (!grouped[key]) {
        grouped[key] = { [xCol]: key };
        yCols.forEach(y => { grouped[key][y] = 0; });
      }
      yCols.forEach(y => {
        grouped[key][y] += Number(row[y]) || 0;
      });
    });
    return Object.values(grouped).slice(0, 50); // Limit for readability
  }, [tableData, xCol, yCols]);

  const handleDragStart = (e, col) => {
    e.dataTransfer.setData('text/plain', col);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  const handleDropX = (e) => {
    e.preventDefault();
    const col = e.dataTransfer.getData('text/plain');
    if (col) setXCol(col);
    setDragging(false);
  };

  const handleDropY = (e) => {
    e.preventDefault();
    const col = e.dataTransfer.getData('text/plain');
    if (col && !yCols.includes(col) && col !== xCol) {
      setYCols(prev => [...prev, col]);
    }
    setDragging(false);
  };

  const removeYCol = (col) => setYCols(prev => prev.filter(c => c !== col));
  const clearAll = () => { setXCol(''); setYCols([]); };

  const tooltipStyle = {
    contentStyle: {
      background: '#1c1f26',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '8px',
      color: '#e4e5e9',
      fontSize: '12px',
    },
  };

  const canRender = xCol && yCols.length > 0 && chartData.length > 0;

  // Show Auto Dashboard if toggled
  if (showAutoDashboard) {
    return <AutoDashboard tableData={tableData} columns={columns} datasetInfo={datasetInfo} onClose={() => setShowAutoDashboard(false)} />;
  }

  return (
    <div className="flex h-full">
      {/* Column Palette — left sidebar */}
      <div className="w-52 shrink-0 border-r border-[var(--color-border)] p-3 overflow-y-auto">
        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
          Columns
        </h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mb-3">Drag to X or Y axis</p>

        {categoricalCols.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-[var(--color-text-muted)] mb-1.5 font-medium">Categorical</p>
            <div className="space-y-1">
              {categoricalCols.map(col => (
                <div
                  key={col}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col)}
                  onDragEnd={handleDragEnd}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] font-mono cursor-grab active:cursor-grabbing hover:bg-[var(--color-bg-elevated)] transition-colors border border-transparent hover:border-[var(--color-border-hover)] select-none"
                >
                  {col}
                </div>
              ))}
            </div>
          </div>
        )}

        {numericCols.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] mb-1.5 font-medium">Numeric</p>
            <div className="space-y-1">
              {numericCols.map(col => (
                <div
                  key={col}
                  draggable
                  onDragStart={(e) => handleDragStart(e, col)}
                  onDragEnd={handleDragEnd}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-mono cursor-grab active:cursor-grabbing hover:bg-[rgba(59,130,246,0.2)] transition-colors border border-transparent hover:border-[var(--color-accent)] select-none"
                >
                  # {col}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Auto Visualization Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] flex-wrap gap-2">
          <button
            onClick={() => setShowAutoDashboard(true)}
            className="px-5 py-2.5 rounded-[11px] font-semibold text-sm bg-gradient-to-r from-[#d4a574] to-[#ddb885] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 flex-shrink-0"
          >
            <span className="text-base">✨</span>
            Auto Visualization
          </button>
          
          <div className="text-xs text-[var(--color-text-muted)] font-medium">
            or build manually below →
          </div>
        </div>

        {/* Config bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] flex-wrap">
          {/* Chart type selector */}
          <div className="flex gap-1 bg-[var(--color-bg-primary)] rounded-lg p-0.5">
            {CHART_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => setChartType(ct.id)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${chartType === ct.id
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                title={ct.label}
              >
                {ct.icon} {ct.label}
              </button>
            ))}
          </div>

          {/* X axis drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropX}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed text-xs min-w-[120px] transition-colors ${xCol
                ? 'border-[var(--color-success)] bg-[rgba(34,197,94,0.08)]'
                : 'border-[var(--color-border-hover)] bg-[var(--color-bg-card)]'
              }`}
          >
            <span className="text-[var(--color-text-muted)] text-[10px] font-medium">X:</span>
            {xCol ? (
              <span className="font-mono text-[var(--color-success)]">{xCol}</span>
            ) : (
              <span className="text-[var(--color-text-muted)]">Drop column</span>
            )}
          </div>

          {/* Y axis drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropY}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed text-xs min-w-[120px] transition-colors ${yCols.length > 0
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                : 'border-[var(--color-border-hover)] bg-[var(--color-bg-card)]'
              }`}
          >
            <span className="text-[var(--color-text-muted)] text-[10px] font-medium">Y:</span>
            {yCols.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {yCols.map(col => (
                  <span
                    key={col}
                    className="font-mono text-[var(--color-accent)] flex items-center gap-1"
                  >
                    {col}
                    <button
                      onClick={() => removeYCol(col)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] text-[10px]"
                    >✕</button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[var(--color-text-muted)]">Drop column(s)</span>
            )}
          </div>

          {(xCol || yCols.length > 0) && (
            <button onClick={clearAll} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] ml-auto">
              Clear
            </button>
          )}
        </div>

        {/* Auto Visualization Recommendations */}
        {autoRecs.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 bg-[var(--color-bg-card)]">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                ✨ AI Recommendations
                {isLoadingAuto && <span className="text-[10px] animate-pulse">Loading...</span>}
              </label>
              <span className="text-[11px] text-[var(--color-text-muted)]">{autoRecs.length} charts</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
              {autoRecs.map((rec, idx) => (
                <button
                  key={rec.id || idx}
                  onClick={() => applyRecommendation(rec)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[9px] border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    xCol === rec.x_axis && yCols.includes(rec.y_axis) && chartType === rec.type
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title={rec.rationale}
                >
                  <span>{rec.type === 'bar' ? '📊' : rec.type === 'line' ? '📈' : rec.type === 'pie' ? '🥧' : rec.type === 'scatter' ? '🔹' : '📉'}</span>
                  {rec.title}
                  {rec.confidence && <span className="text-[10px] opacity-70">({Math.round(rec.confidence * 100)}%)</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart render */}
        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
          {!canRender ? (
            <div className="text-center animate-fade-in">
              <span className="text-3xl block mb-3">📊</span>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Build a visualization</p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
                Drag columns from the left panel to the X and Y drop zones, then pick a chart type.
              </p>
            </div>
          ) : (
            <div className="w-full h-full animate-fade-in">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey={yCols[0]}
                      nameKey={xCol}
                      cx="50%"
                      cy="50%"
                      outerRadius="75%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                  </PieChart>
                ) : chartType === 'scatter' ? (
                  <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey={xCol} name={xCol} tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <YAxis dataKey={yCols[0]} name={yCols[0]} tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Scatter data={chartData} fill="#3b82f6" />
                  </ScatterChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <defs>
                      {yCols.map((_, i) => (
                        <linearGradient key={i} id={`area-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey={xCol} tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    {yCols.map((y, i) => (
                      <Area key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} fill={`url(#area-${i})`} strokeWidth={2} />
                    ))}
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey={xCol} tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    {yCols.map((y, i) => (
                      <Line key={y} type="monotone" dataKey={y} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey={xCol} tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#5f6672', fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    {yCols.map((y, i) => (
                      <Bar key={y} dataKey={y} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={45} />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
