import { useState } from 'react';
import DataTable from './DataTable';
import ChartDisplay from './ChartDisplay';
import StatsPanel from './StatsPanel';
import InsightsPanel from './InsightsPanel';
import VisualBuilder from './VisualBuilder';
import { ChartBar, Table, Sliders, Calculator, Lightbulb, Code, Printer } from '@phosphor-icons/react';

const TABS = [
  { id: 'chart', label: 'Chart', icon: ChartBar },
  { id: 'table', label: 'Table', icon: Table },
  { id: 'explore', label: 'Explore', icon: Sliders },
  { id: 'stats', label: 'Stats', icon: Calculator },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'sql', label: 'SQL', icon: Code },
];

export default function ResultsPanel({ results, columns, fullData }) {
  const [activeTab, setActiveTab] = useState('chart');

  const hasResults = !!results;
  const { sql_query, table_result, chart_base64, stats, insights, prediction } = results || {};

  // Determine if chart can be rendered from table_result
  const canAutoChart = table_result && table_result.length > 0 &&
    Object.keys(table_result[0]).length >= 2 &&
    Object.keys(table_result[0]).slice(1).some(k => !isNaN(Number(table_result[0][k])));

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {/* Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            if (tab.id !== 'explore' && !hasResults) return null;
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/15'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {hasResults && (
          <button
            onClick={() => window.print()}
            className="btn-secondary px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 no-print shrink-0"
            title="Export PDF Report"
          >
            <Printer size={13} />
            <span>Export Report</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden p-4" key={activeTab}>
        {!hasResults && activeTab !== 'explore' ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)] space-y-2">
            <ChartBar size={32} className="opacity-40" />
            <p className="text-xs font-semibold">Run a query in Ask AI to view dynamic charts and tables</p>
          </div>
        ) : (
          <>
            {activeTab === 'chart' && (
              canAutoChart ? (
                <div className="h-full bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-sm">
                  <ChartDisplay data={table_result} />
                </div>
              ) : chart_base64 ? (
                <div className="flex items-center justify-center h-full bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-4">
                  <img
                    src={`data:image/png;base64,${chart_base64}`}
                    alt="Analysis Chart"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[var(--color-text-muted)] space-y-2">
                  <ChartBar size={32} className="opacity-40" />
                  <p className="text-xs font-semibold">No chart automatically generated for this query.</p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="btn-secondary px-3 py-1.5 text-xs font-semibold mt-2 cursor-pointer"
                  >
                    Build Custom Chart in Explore →
                  </button>
                </div>
              )
            )}

            {activeTab === 'table' && (
              <div className="h-full">
                <DataTable data={table_result} />
              </div>
            )}

            {activeTab === 'explore' && (
              <VisualBuilder
                columns={columns}
                tableData={table_result?.length ? table_result : fullData}
              />
            )}

            {activeTab === 'stats' && (
              <div className="h-full overflow-auto bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
                <StatsPanel stats={stats} />
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="h-full overflow-auto bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
                <InsightsPanel insights={insights} prediction={prediction} />
              </div>
            )}

            {activeTab === 'sql' && (
              <div className="h-full overflow-auto bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">Executed SQL Query</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-semibold">{table_result?.length ?? 0} rows returned</span>
                </div>
                <pre className="text-xs font-mono text-[var(--color-accent)] whitespace-pre-wrap leading-relaxed bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]">
                  {sql_query}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
