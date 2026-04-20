import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

// Warm, inviting color palette
const COLORS = ['#d4a574', '#7a9b99', '#c8b4a0', '#d4965a', '#8b7d71', '#a89977', '#9b8b7e', '#b8a89d'];

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

function detectChartType(data) {
  if (!data || data.length === 0) return 'bar';
  const keys = Object.keys(data[0]);
  if (keys.length < 2) return 'bar';

  const xKey = keys[0];
  const firstVal = data[0][xKey];
  const isTime = typeof firstVal === 'string' && (
    /\d{4}[-/]\d{2}/.test(firstVal) || /^\d{4}$/.test(firstVal) ||
    ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
      .some(m => firstVal.toLowerCase().includes(m))
  );
  if (isTime || data.length > 12) return 'line';
  if (keys.length === 2 && data.length <= 6) return 'pie';
  return 'bar';
}

export default function ChartDisplay({ data, chartBase64, recommendations, selectedRecIdx = 0, onSelectRec }) {
  const [internalSelectedIdx, setInternalSelectedIdx] = useState(selectedRecIdx);
  const selectedIdx = onSelectRec ? selectedRecIdx : internalSelectedIdx;

  // Display recommendation-based chart
  if (recommendations && recommendations.length > 0) {
    const selectedRec = recommendations[selectedIdx];
    
    return (
      <div className="card p-6 border-[var(--color-border-soft)]">
        {/* Recommendation Header */}
        <div className="mb-6 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {VISUALIZATION_ICONS[selectedRec.type?.toLowerCase()] || '📊'}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  {selectedRec.title || selectedRec.type}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {selectedRec.rationale || 'Visualization recommendation'}
                </p>
              </div>
            </div>
            {selectedRec.confidence && (
              <div className="flex items-center gap-2 text-xs">
                <div className="text-[var(--color-accent)] font-bold">
                  {Math.round(selectedRec.confidence * 100)}% match
                </div>
                <div className="w-16 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] transition-all duration-300"
                    style={{ width: `${selectedRec.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recommendation Selector */}
          {recommendations.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {recommendations.map((rec, idx) => (
                <button
                  key={rec.id || idx}
                  onClick={() => onSelectRec ? onSelectRec(idx) : setInternalSelectedIdx(idx)}
                  className={`flex-shrink-0 px-3 py-2 rounded-[10px] transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-xs font-medium ${
                    selectedIdx === idx
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-soft)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <span>{VISUALIZATION_ICONS[rec.type?.toLowerCase()] || '📊'}</span>
                  <span className="hidden sm:inline">{rec.title || rec.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Preview */}
        <div className="mb-6">
          {data && Array.isArray(data) && data.length > 0 ? (
            <RecommendationChart 
              data={data}
              chartType={selectedRec.type?.toLowerCase() || 'bar'}
              features={selectedRec.features}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm text-[var(--color-text-muted)]">
                No data available for this visualization
              </p>
            </div>
          )}
        </div>

        {/* Features Info */}
        {selectedRec.features && selectedRec.features.length > 0 && (
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">
              Data Fields
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRec.features.map((feat, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-[8px] bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-[500]"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Display base64 chart
  if (chartBase64) {
    return (
      <div className="card p-5 border-[var(--color-border-soft)]">
        <div className="flex justify-center">
          <img 
            src={`data:image/png;base64,${chartBase64}`} 
            alt="Chart" 
            className="max-w-full rounded-[14px] border border-[var(--color-border)] shadow-md"
          />
        </div>
      </div>
    );
  }

  // Display regular chart
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);
  if (keys.length < 2) return null;
  const xKey = keys[0];
  const valueKeys = keys.slice(1).filter(k => data.some(row => !isNaN(Number(row[k]))));
  if (valueKeys.length === 0) return null;

  const chartData = data.map(row => {
    const newRow = { [xKey]: row[xKey] };
    valueKeys.forEach(k => { newRow[k] = Number(row[k]) || 0; });
    return newRow;
  });

  const chartType = detectChartType(data);
  const commonProps = { data: chartData, margin: { top: 15, right: 30, left: 10, bottom: 10 } };
  const tooltipStyle = {
    contentStyle: { 
      background: '#ffffff', 
      border: '1px solid #e0d5c7', 
      borderRadius: '11px', 
      color: '#3d3531', 
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(61, 53, 49, 0.1)'
    }
  };

  return (
    <div className="card p-5 border-[var(--color-border-soft)]">
      <ResponsiveContainer width="100%" height={340}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie 
              data={chartData} 
              dataKey={valueKeys[0]} 
              nameKey={xKey} 
              cx="50%" 
              cy="50%" 
              outerRadius={115}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelStyle={{ fill: '#3d3531', fontSize: '11px', fontWeight: 500 }}
            >
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px' }} />
          </PieChart>
        ) : chartType === 'line' ? (
          <AreaChart {...commonProps}>
            <defs>
              {valueKeys.map((_, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 53, 49, 0.06)" vertical={false} />
            <XAxis 
              dataKey={xKey} 
              tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
              axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
            />
            <YAxis 
              tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
              axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px', fontWeight: 500 }} />
            {valueKeys.map((k, i) => (
              <Area 
                key={k} 
                type="monotone" 
                dataKey={k} 
                stroke={COLORS[i % COLORS.length]} 
                fill={`url(#gradient-${i})`} 
                strokeWidth={2.5}
                isAnimationActive={true}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 53, 49, 0.06)" vertical={false} />
            <XAxis 
              dataKey={xKey} 
              tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
              axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
            />
            <YAxis 
              tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
              axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
            />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px', fontWeight: 500 }} />
            {valueKeys.map((k, i) => (
              <Bar 
                key={k} 
                dataKey={k} 
                fill={COLORS[i % COLORS.length]} 
                radius={[6, 6, 0, 0]} 
                maxBarSize={50}
                isAnimationActive={true}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// Helper component to render recommendation-based charts
function RecommendationChart({ data, chartType, features }) {
  if (!data || data.length === 0) return null;

  const keys = Object.keys(data[0]);
  if (keys.length < 2) return null;

  const xKey = keys[0];
  const valueKeys = features && features.length > 0 
    ? features.filter(f => keys.includes(f))
    : keys.slice(1).filter(k => data.some(row => !isNaN(Number(row[k]))));

  if (valueKeys.length === 0) return null;

  const chartData = data.map(row => {
    const newRow = { [xKey]: row[xKey] };
    valueKeys.forEach(k => { newRow[k] = Number(row[k]) || 0; });
    return newRow;
  });

  const commonProps = { data: chartData, margin: { top: 15, right: 30, left: 10, bottom: 10 } };
  const tooltipStyle = {
    contentStyle: { 
      background: '#ffffff', 
      border: '1px solid #e0d5c7', 
      borderRadius: '11px', 
      color: '#3d3531', 
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(61, 53, 49, 0.1)'
    }
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      {chartType === 'pie' ? (
        <PieChart>
          <Pie 
            data={chartData} 
            dataKey={valueKeys[0]} 
            nameKey={xKey} 
            cx="50%" 
            cy="50%" 
            outerRadius={110}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelStyle={{ fill: '#3d3531', fontSize: '11px', fontWeight: 500 }}
          >
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px' }} />
        </PieChart>
      ) : chartType === 'line' || chartType === 'area' ? (
        <AreaChart {...commonProps}>
          <defs>
            {valueKeys.map((_, i) => (
              <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 53, 49, 0.06)" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
            axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
          />
          <YAxis 
            tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
            axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
          />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px', fontWeight: 500 }} />
          {valueKeys.map((k, i) => (
            <Area 
              key={k} 
              type="monotone" 
              dataKey={k} 
              stroke={COLORS[i % COLORS.length]} 
              fill={`url(#grad-${i})`} 
              strokeWidth={2.5}
              isAnimationActive={true}
            />
          ))}
        </AreaChart>
      ) : (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 53, 49, 0.06)" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
            axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
          />
          <YAxis 
            tick={{ fill: '#8b8078', fontSize: 11, fontWeight: 450 }}
            axisLine={{ stroke: 'rgba(61, 53, 49, 0.1)' }}
          />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: '#3d3531', paddingTop: '15px', fontWeight: 500 }} />
          {valueKeys.map((k, i) => (
            <Bar 
              key={k} 
              dataKey={k} 
              fill={COLORS[i % COLORS.length]} 
              radius={[6, 6, 0, 0]} 
              maxBarSize={50}
              isAnimationActive={true}
            />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
