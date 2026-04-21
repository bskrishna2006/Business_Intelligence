import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import DashboardPage from './components/DashboardPage';
import ChatPanel from './components/ChatPanel';
import ResultsPanel from './components/ResultsPanel';
import VisualBuilder from './components/VisualBuilder';
import DataTable from './components/DataTable';
import InsightsPanel from './components/InsightsPanel';
import StatsPanel from './components/StatsPanel';

function authFetch(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('ui_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState('landing'); // 'landing' | 'auth' | 'app'
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [savedDashboard, setSavedDashboard] = useState(null);

  const [datasetInfo, setDatasetInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullData, setFullData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ui_theme', theme);
  }, [theme]);

  // ─── Restore session ───
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setAuthChecked(true); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) { setUser(data.user); setView('app'); }
        else localStorage.removeItem('auth_token');
      })
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await authFetch('/api/datasets/current');
        if (!res.ok) return;
        const data = await res.json();
        setDatasetInfo(data);
        setActivePage((prev) => (prev === 'landing' ? 'dashboard' : prev));

        try {
          const tableRes = await authFetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: 'Show all data' }),
          });
          const tableData = await tableRes.json();
          setFullData(tableData.table_result || data.sample_rows);
        } catch {
          setFullData(data.sample_rows || []);
        }
      } catch {
        // Ignore restore errors
      }
    })();
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); setView('app'); };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null); setView('landing');
    setDatasetInfo(null); setMessages([]);
    setResults(null); setFullData(null);
    setActivePage('dashboard');
  };

  const handleUploadSuccess = async (data) => {
    setDatasetInfo(data);
    setMessages([{
      role: 'assistant',
      content: `Dataset loaded — ${data.row_count} rows, ${data.columns?.length} columns. Go to Ask AI to start querying!`,
    }]);
    setResults(null);
    setActivePage('dashboard');

    try {
      const res = await authFetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Show all data' }),
      });
      const result = await res.json();
      setFullData(result.table_result || data.sample_rows);
    } catch {
      setFullData(data.sample_rows);
    }
  };

  const handleSendMessage = async (question, messageData = {}) => {
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);
    try {
      const res = await authFetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, ...messageData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.insights?.length ? data.insights.join(' ') : 'Here are the results.',
        sql: data.sql_query,
      }]);
      setResults(data);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVisualization = (recommendation) => {
    console.log('Creating visualization:', recommendation);
    setSelectedRecommendation(recommendation);
    setActivePage('visualize');
  };

  const handleOpenSavedVisualization = (saved) => {
    if (!saved) return;
    if (saved.type === 'dashboard') {
      setSavedDashboard(saved);
      setSelectedRecommendation(null);
      setActivePage('visualize');
      return;
    }
    setSavedDashboard(null);
    setSelectedRecommendation({
      type: saved.type,
      title: saved.title,
      x_axis: saved.x_axis || saved.x_col,
      y_axis: saved.y_axis,
      y_cols: saved.y_cols || [],
    });
    setActivePage('visualize');
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!authChecked) return null;
  if (view === 'landing') return (
    <LandingPage onGetStarted={() => setView('auth')} theme={theme} onToggleTheme={handleToggleTheme} />
  );
  if (view === 'auth') return (
    <AuthPage onLogin={handleLogin} onBack={() => setView('landing')} theme={theme} onToggleTheme={handleToggleTheme} />
  );

  // ─── Main App ───
  const { sql_query, table_result, chart_base64, stats, insights, prediction } = results || {};

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            datasetInfo={datasetInfo}
            results={results}
            onNavigate={setActivePage}
            onCreateVisualization={handleCreateVisualization}
            onOpenSavedVisualization={handleOpenSavedVisualization}
          />
        );

      case 'ask':
        return (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Chat column */}
            <div className="w-[380px] shrink-0 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-bg-secondary)]">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ask AI</h2>
                <p className="text-[10px] text-[var(--color-text-muted)]">Query your data in plain English</p>
              </div>
              <div className="flex-1 min-h-0">
                <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} hasDataset={!!datasetInfo} />
              </div>
            </div>
            {/* Results column */}
            <div className="flex-1 min-w-0 bg-[var(--color-bg-primary)] flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Results</h2>
                <p className="text-[10px] text-[var(--color-text-muted)]">Charts, tables and insights</p>
              </div>
              <div className="flex-1 min-h-0">
                <ResultsPanel results={results} columns={datasetInfo?.columns || []} fullData={fullData} />
              </div>
            </div>
          </div>
        );

      case 'visualize':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Visual Builder</h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">Drag columns to build custom charts</p>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {datasetInfo
                ? (
                  <VisualBuilder
                    columns={datasetInfo.columns}
                    tableData={fullData}
                    datasetInfo={datasetInfo}
                    selectedRecommendation={selectedRecommendation}
                    savedDashboard={savedDashboard}
                    clearSavedDashboard={() => setSavedDashboard(null)}
                  />
                )
                : <EmptyPage icon="📊" title="No dataset" desc="Upload a CSV to build visualizations." />}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Data Browser</h2>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {table_result?.length
                    ? `Showing ${table_result.length} query results`
                    : fullData?.length
                      ? `${fullData.length.toLocaleString()} rows loaded`
                      : 'No data'}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <DataTable data={table_result?.length ? table_result : fullData} />
              {!table_result?.length && !fullData?.length && (
                <EmptyPage icon="📋" title="No data" desc="Upload a CSV or run a query." />
              )}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="flex-1 overflow-auto p-6 bg-[var(--color-bg-primary)]">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Insights & Statistics</h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">AI-generated analysis of your last query</p>
            </div>
            {stats && Object.keys(stats).length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">Statistics</p>
                <StatsPanel stats={stats} />
              </div>
            )}
            {(insights?.length > 0 || prediction) && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">AI Insights</p>
                <InsightsPanel insights={insights} prediction={prediction} />
              </div>
            )}
            {!stats && !insights?.length && !prediction && (
              <EmptyPage icon="💡" title="No insights yet" desc="Run a query in Ask AI to generate insights." />
            )}
          </div>
        );

      case 'sql':
        return (
          <div className="flex-1 overflow-auto p-6 bg-[var(--color-bg-primary)]">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">SQL Query</h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">The SQL generated from your last natural language question</p>
            </div>
            {sql_query ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-accent)]">Generated SQL</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{table_result?.length ?? 0} rows returned</span>
                </div>
                <pre className="text-sm font-mono text-[var(--color-accent)] whitespace-pre-wrap leading-relaxed bg-[var(--color-bg-primary)] rounded-lg p-4 border border-[var(--color-border)] overflow-x-auto">
                  {sql_query}
                </pre>
              </div>
            ) : (
              <EmptyPage icon="🔍" title="No query yet" desc="Ask a question in the Ask AI page to see the generated SQL." />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        datasetInfo={datasetInfo}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      >
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          authFetch={authFetch}
        />
      </Sidebar>

      {/* Page content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}

function EmptyPage({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <span className="text-4xl mb-3 block">{icon}</span>
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-xs">{desc}</p>
    </div>
  );
}
