import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

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

export default function ChartDisplay({ data, chartBase64 }) {
  if (chartBase64) {
    return (
      <div className="flex justify-center p-4">
        <img src={`data:image/png;base64,${chartBase64}`} alt="Chart" className="max-w-full rounded-lg border border-[var(--color-border)]" />
      </div>
    );
  }
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
  const commonProps = { data: chartData, margin: { top: 10, right: 30, left: 10, bottom: 10 } };
  const tooltipStyle = {
    contentStyle: { background: '#1c1f26', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#e4e5e9', fontSize: '12px' }
  };

  return (
    <div className="rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
      <ResponsiveContainer width="100%" height={320}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie data={chartData} dataKey={valueKeys[0]} nameKey={xKey} cx="50%" cy="50%" outerRadius={110}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend />
          </PieChart>
        ) : chartType === 'line' ? (
          <AreaChart {...commonProps}>
            <defs>
              {valueKeys.map((_, i) => (
                <linearGradient key={i} id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={{ fill: '#5f6672', fontSize: 11 }} />
            <YAxis tick={{ fill: '#5f6672', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            {valueKeys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} fill={`url(#g-${i})`} strokeWidth={2} />)}
          </AreaChart>
        ) : (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={xKey} tick={{ fill: '#5f6672', fontSize: 11 }} />
            <YAxis tick={{ fill: '#5f6672', fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            {valueKeys.map((k, i) => <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={45} />)}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
