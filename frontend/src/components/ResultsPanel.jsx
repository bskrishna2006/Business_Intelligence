import { useState } from 'react';
import DataTable from './DataTable';
import ChartDisplay from './ChartDisplay';
import StatsPanel from './StatsPanel';
import InsightsPanel from './InsightsPanel';
import VisualBuilder from './VisualBuilder';

const TABS = [
  { id: 'explore', label: 'Explore' },
  { id: 'chart', label: 'Chart' },
  { id: 'table', label: 'Table' },
  { id: 'stats', label: 'Stats' },
  { id: 'insights', label: 'Insights' },
  { id: 'sql', label: 'SQL' },
];

export default function ResultsPanel({ results, columns, fullData }) {
  const [activeTab, setActiveTab] = useState('explore');

  const hasResults = !!results;
  const { sql_query, table_result, chart_base64, stats, insights, prediction } = results || {};

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {TABS.map((tab) => {
          // Show explore always if columns exist; other tabs only when results exist
          if (tab.id !== 'explore' && !hasResults) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
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
        {activeTab === 'explore' && (
          columns && columns.length > 0 ? (
            <VisualBuilder columns={columns} tableData={fullData} />
          ) : (
            <EmptyState
              icon="📊"
              title="Explore your data visually"
              desc="Upload a CSV to start building custom visualizations with drag-and-drop."
            />
          )
        )}

        {activeTab === 'chart' && (
          <div className="p-4 overflow-auto h-full">
            <ChartDisplay data={table_result} chartBase64={chart_base64} />
            {(!table_result || table_result.length === 0) && !chart_base64 && (
              <EmptyState icon="📈" title="No chart data" desc="Ask a question to generate a chart." />
            )}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="p-4 overflow-auto h-full">
            <DataTable data={table_result} />
            {(!table_result || table_result.length === 0) && (
              <EmptyState icon="📋" title="No table data" desc="Ask a question to see results." />
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-4 overflow-auto h-full">
            <StatsPanel stats={stats} />
            {(!stats || Object.keys(stats).length === 0) && (
              <EmptyState icon="📐" title="No statistics" desc="Ask a question to compute stats." />
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="p-4 overflow-auto h-full">
            <InsightsPanel insights={insights} prediction={prediction} />
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="p-4 overflow-auto h-full">
            {sql_query ? (
              <div className="rounded-lg p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
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
    <div className="flex items-center justify-center h-full text-center p-8 animate-fade-in">
      <div>
        <span className="text-3xl block mb-3">{icon}</span>
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{title}</h3>
        <p className="text-xs text-[var(--color-text-muted)] max-w-xs">{desc}</p>
      </div>
    </div>
  );
}
