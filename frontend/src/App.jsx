import { useState } from 'react';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import ChatPanel from './components/ChatPanel';
import ResultsPanel from './components/ResultsPanel';

export default function App() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullData, setFullData] = useState(null);

  const handleUploadSuccess = async (data) => {
    setDatasetInfo(data);
    setMessages([{
      role: 'assistant',
      content: `Dataset uploaded — ${data.row_count} rows, ${data.columns?.length} columns. Ask me anything or explore the data visually.`,
    }]);
    setResults(null);

    // Load full data for the visual builder
    if (data.sample_rows) {
      // Fetch all data via a simple SELECT *
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'Show all data' }),
        });
        const result = await res.json();
        if (result.table_result) setFullData(result.table_result);
        else setFullData(data.sample_rows);
      } catch {
        setFullData(data.sample_rows);
      }
    }
  };

  const handleSendMessage = async (question) => {
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const assistantMsg = {
        role: 'assistant',
        content: data.insights?.length ? data.insights.join(' ') : 'Here are the results.',
        sql: data.sql_query,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setResults(data);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <Sidebar datasetInfo={datasetInfo}>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </Sidebar>

      {/* Chat */}
      <div className="w-[380px] shrink-0 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-bg-secondary)]">
        <div className="px-4 py-2.5 border-b border-[var(--color-border)]">
          <h2 className="text-xs font-semibold text-[var(--color-text-primary)]">Chat</h2>
          <p className="text-[10px] text-[var(--color-text-muted)]">Ask questions in natural language</p>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} hasDataset={!!datasetInfo} />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0 bg-[var(--color-bg-primary)]">
        <ResultsPanel
          results={results}
          columns={datasetInfo?.columns || []}
          fullData={fullData}
        />
      </div>
    </div>
  );
}
