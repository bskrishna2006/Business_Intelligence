import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import ChartDisplay from './ChartDisplay';
import StatsPanel from './StatsPanel';
import InsightsPanel from './InsightsPanel';
import VisualBuilder from './VisualBuilder';

const TABS = [
  { id: 'chart', label: '📈 Chart' },
  { id: 'table', label: '📋 Table' },
  { id: 'explore', label: '🎛 Explore' },
  { id: 'stats', label: '📐 Stats' },
  { id: 'insights', label: '💡 Insights' },
  { id: 'sql', label: '🔍 SQL' },
];

export default function ResultsPanel({ results, columns, fullData }) {
  const [activeTab, setActiveTab] = useState('chart');

  const hasResults = !!results;
  const { sql_query, table_result, chart_base64, stats, insights, prediction } = results || {};

  // Auto-switch to Chart tab whenever a new result arrives
  useEffect(() => {
    if (hasResults) setActiveTab('chart');
  }, [results]);

  // Determine if chart can be rendered from table_result
  const canAutoChart = table_result && table_result.length > 0 &&
    Object.keys(table_result[0]).length >= 2 &&
    Object.keys(table_result[0]).slice(1).some(k => !isNaN(Number(table_result[0][k])));

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-x-auto shrink-0">
        {TABS.map((tab) => {
          if (tab.id !== 'explore' && !hasResults) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]'
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden" key={activeTab}>

        {/* ── Chart (auto) ── */}
        {activeTab === 'chart' && (
          <div className="h-full overflow-auto p-4 flex flex-col gap-4">
            {/* Auto-chart from query results */}
            {canAutoChart && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Auto-Generated Chart
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{table_result.length} rows</span>
                </div>
                <ChartDisplay data={table_result} chartBase64={null} />
              </div>
            )}
            {/* Fallback: backend matplotlib image */}
            {chart_base64 && !canAutoChart && (
              <ChartDisplay data={null} chartBase64={chart_base64} />
            )}
            {!canAutoChart && !chart_base64 && (
              <EmptyState icon="📈" title="No chart data" desc="Ask a question that returns numeric results to generate a chart." />
            )}
          </div>
        )}

        {/* ── Table ── */}
        {activeTab === 'table' && (
          <div className="p-4 overflow-auto h-full">
            <DataTable data={table_result} />
            {(!table_result || table_result.length === 0) && (
              <EmptyState icon="📋" title="No table data" desc="Ask a question to see results." />
            )}
          </div>
        )}

        {/* ── Explore (Visual Builder) ── */}
        {activeTab === 'explore' && (
          columns && columns.length > 0 ? (
            <VisualBuilder columns={columns} tableData={fullData} />
          ) : (
            <EmptyState icon="📊" title="Explore your data visually" desc="Upload a CSV to start building custom visualizations." />
          )
        )}

        {/* ── Stats ── */}
        {activeTab === 'stats' && (
          <div className="p-4 overflow-auto h-full">
            <StatsPanel stats={stats} />
            {(!stats || Object.keys(stats).length === 0) && (
              <EmptyState icon="📐" title="No statistics" desc="Ask a question to compute stats." />
            )}
          </div>
        )}

        {/* ── Insights ── */}
        {activeTab === 'insights' && (
          <div className="p-4 overflow-auto h-full">
            <InsightsPanel insights={insights} prediction={prediction} />
            {(!insights?.length && !prediction) && (
              <EmptyState icon="💡" title="No insights yet" desc="Ask a question to generate AI insights." />
            )}
          </div>
        )}

        {/* ── SQL ── */}
        {activeTab === 'sql' && (
          <div className="p-4 overflow-auto h-full">
            {sql_query ? (
              <div className="rounded-xl p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                  Generated SQL
                </h4>
                <pre className="text-[13px] font-mono text-[var(--color-accent)] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {sql_query}
                </pre>
              </div>
            ) : (
              <EmptyState icon="🔍" title="No SQL" desc="Ask a question to see the generated query." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex items-center justify-center h-full text-center p-8">
      <div>
        <span className="text-3xl block mb-3">{icon}</span>
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs">{desc}</p>
      </div>
    </div>
  );
}
