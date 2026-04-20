import { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ messages, onSendMessage, isLoading, hasDataset }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('analyze'); // 'analyze' (NLP→SQL) or 'visualize' (NLP→Chart)
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const messageData = { question: input.trim(), mode };
    onSendMessage(input.trim(), messageData);
    setInput('');
  };

  const exampleQueries = {
    analyze: [
      "Show total sales per region",
      "Top 5 products by profit",
      "Monthly sales trend",
      "Predict next month sales",
    ],
    visualize: [
      "Show revenue over time",
      "Compare sales by category",
      "Distribution of prices",
      "Relationship between X and Y",
    ]
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]">
      {/* Mode Selector Tabs */}
      <div className="flex gap-2 p-3 border-b border-[var(--color-border-soft)] bg-[var(--color-bg-card)]">
        <button
          onClick={() => setMode('analyze')}
          className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
            mode === 'analyze'
              ? 'bg-[var(--color-accent)] text-white shadow-md'
              : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          📊 Analyze (SQL)
        </button>
        <button
          onClick={() => setMode('visualize')}
          className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
            mode === 'visualize'
              ? 'bg-[#7a9b99] text-white shadow-md'
              : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          📈 Visualize (Chart)
        </button>
        <div className="text-[11px] text-[var(--color-text-muted)] ml-auto flex items-center px-2">
          {mode === 'analyze' ? '🧠 Convert questions to SQL' : '📊 Suggest charts'}
        </div>
      </div>

      {/* Messages area with warm styling */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <span className="text-5xl mb-4">💬</span>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              What would you like to know?
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-xs leading-relaxed">
              {hasDataset
                ? mode === 'analyze'
                  ? "Convert questions to SQL queries and see results with automatic visualizations."
                  : "Ask for charts and I'll suggest the best visualization for your data."
                : "Upload a CSV file from the sidebar to get started."
              }
            </p>
            {hasDataset && (
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                {exampleQueries[mode].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="card text-left text-sm px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-all group"
                  >
                    <span className="opacity-50 group-hover:opacity-100">→</span> {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-[14px] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#d4a574] to-[#ddb885] text-white rounded-br-[4px] shadow-md'
                    : 'card border-[var(--color-border-soft)] text-[var(--color-text-primary)]'
                }`}
              >
                {msg.content}
                {msg.mode && msg.role === 'user' && (
                  <div className="text-[10px] opacity-70 mt-1.5">
                    {msg.mode === 'analyze' ? '🧠 SQL Mode' : '📊 Chart Mode'}
                  </div>
                )}
                {msg.sql && (
                  <div className="mt-3 px-3 py-2 rounded-[10px] bg-[var(--color-bg-secondary)] font-mono text-[11px] text-[var(--color-accent)] overflow-x-auto border border-[var(--color-border)]">
                    {msg.sql}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="card px-4 py-3 border-[var(--color-border-soft)]">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-soft" />
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-soft" style={{animationDelay: '0.15s'}} />
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse-soft" style={{animationDelay: '0.3s'}} />
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">Thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area with warm styling */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-primary)]">
        <div className="flex gap-2.5 items-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[12px] px-4 py-3 focus-within:border-[var(--color-accent)] focus-within:shadow-md transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasDataset ? "Ask anything..." : "Upload data first..."}
            disabled={!hasDataset || isLoading}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !hasDataset}
            className="btn-primary w-8 h-8 rounded-[9px] flex items-center justify-center text-base font-medium shrink-0 shadow-sm hover:shadow-md transition-all disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
