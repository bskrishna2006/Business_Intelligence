import { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ messages, onSendMessage, isLoading, hasDataset }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const exampleQueries = [
    "Show total sales per region",
    "Top 5 products by profit",
    "Monthly sales trend",
    "Predict next month sales",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <span className="text-3xl mb-3">💬</span>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              Ask about your data
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-5 max-w-xs">
              {hasDataset
                ? "Dataset loaded — type a question in plain English."
                : "Upload a CSV file to get started."
              }
            </p>
            {hasDataset && (
              <div className="flex flex-col gap-1.5 w-full max-w-xs">
                {exampleQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-left text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {q}
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
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                    : 'bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-sm'
                }`}
              >
                {msg.content}
                {msg.sql && (
                  <div className="mt-2 px-2.5 py-1.5 rounded-md bg-[rgba(0,0,0,0.25)] font-mono text-[11px] text-[var(--color-text-secondary)] overflow-x-auto">
                    {msg.sql}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl rounded-bl-sm px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--color-border)]">
        <div className="flex gap-2 items-center bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasDataset ? "Ask a question..." : "Upload a dataset first..."}
            disabled={!hasDataset || isLoading}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !hasDataset}
            className="w-7 h-7 rounded-md btn-primary flex items-center justify-center text-sm shrink-0"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
