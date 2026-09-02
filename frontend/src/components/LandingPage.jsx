import { useState } from 'react';
import { 
  Sparkle, 
  Moon, 
  Sun,
  ArrowRight,
  ArrowDown,
  Check
} from '@phosphor-icons/react';

export default function LandingPage({ onGetStarted, theme, onToggleTheme }) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans overflow-x-hidden selection:bg-[var(--color-accent)] selection:text-white">
            
            {/* Top Navigation */}
            <nav className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-mono font-bold text-xs shadow-md">
                        IA
                    </div>
                    <div>
                        <h1 className="text-sm font-mono font-bold text-[var(--color-text-primary)] tracking-tight leading-none">INSIGHTAI</h1>
                        <p className="text-[9px] font-mono text-[var(--color-text-muted)] tracking-wider mt-0.5">AI DATABASE ASSISTANT</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider uppercase">
                        SQLITE · CSV Sandbox
                    </span>
                    
                    {/* Theme Switcher Toggle */}
                    <button 
                        onClick={onToggleTheme} 
                        className="theme-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer font-mono"
                    >
                        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                    </button>

                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-5 py-2 text-xs font-mono font-bold shadow-md cursor-pointer"
                    >
                        GET STARTED
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    {/* Left Column Copy */}
                    <div className="lg:col-span-6 space-y-6 text-left">
                        
                        {/* Top Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[10px] font-mono text-[var(--color-text-secondary)] uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-secondary)] animate-pulse" />
                            LOCAL-FIRST AI DATABASE ASSISTANT
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
                            Talk to your{' '}
                            <span className="text-[var(--color-accent)]">
                                database.
                            </span>
                        </h1>

                        {/* Paragraph */}
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md leading-relaxed font-sans font-medium">
                            Ask questions in natural language. Let AI generate SQL, review the query, and execute it against your database with confidence.
                        </p>

                        {/* CTAs */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={onGetStarted}
                                className="btn-primary px-6 py-3 text-xs font-mono font-bold cursor-pointer flex items-center gap-2"
                            >
                                CONNECT DATABASE →
                            </button>
                            <a
                                href="#how-it-works"
                                className="btn-secondary px-5 py-3 text-xs font-mono font-medium cursor-pointer flex items-center gap-1.5"
                            >
                                LEARN MORE <ArrowDown size={13} />
                            </a>
                        </div>

                        {/* 3 Step Indicator Strip */}
                        <div className="grid grid-cols-3 gap-3 pt-6">
                            <div className="card p-3 bg-[var(--color-bg-card)] border-[var(--color-border)] text-left space-y-1">
                                <p className="text-[9px] font-mono text-[var(--color-accent)] font-bold">01</p>
                                <p className="text-[10px] font-mono font-bold text-[var(--color-text-primary)] uppercase">CONNECT</p>
                                <p className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">Your dataset</p>
                            </div>
                            <div className="card p-3 bg-[var(--color-bg-card)] border-[var(--color-border)] text-left space-y-1">
                                <p className="text-[9px] font-mono text-[var(--color-accent)] font-bold">02</p>
                                <p className="text-[10px] font-mono font-bold text-[var(--color-text-primary)] uppercase">ASK</p>
                                <p className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">Natural language</p>
                            </div>
                            <div className="card p-3 bg-[var(--color-bg-card)] border-[var(--color-border)] text-left space-y-1">
                                <p className="text-[9px] font-mono text-[var(--color-accent)] font-bold">03</p>
                                <p className="text-[10px] font-mono font-bold text-[var(--color-text-primary)] uppercase">EXECUTE</p>
                                <p className="text-[9px] text-[var(--color-text-muted)] font-mono truncate">Real results</p>
                            </div>
                        </div>

                    </div>

                    {/* Right Column macOS Workspace Window Mockup */}
                    <div className="lg:col-span-6 relative">
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-code)] p-5 shadow-2xl space-y-4 text-left">
                            
                            {/* Window Topbar */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400">insightai.workspace</span>
                            </div>

                            {/* Natural Language Box */}
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">NATURAL LANGUAGE</p>
                                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white font-semibold">
                                    Show the 5 highest paid employees
                                </div>
                            </div>

                            {/* Generated SQL Container */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">GENERATED SQL</p>
                                    <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        VALID SQL
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs leading-relaxed">
                                    <p><span className="text-[var(--color-accent)] font-bold">SELECT</span> name, salary</p>
                                    <p><span className="text-[var(--color-accent)] font-bold">FROM</span> employees</p>
                                    <p><span className="text-[var(--color-accent)] font-bold">ORDER BY</span> salary <span className="text-[var(--color-accent)] font-bold">DESC</span></p>
                                    <p><span className="text-[var(--color-accent)] font-bold">LIMIT</span> <span className="text-emerald-400">5</span>;</p>
                                </div>
                            </div>

                            {/* Card Footer Note & Action Button */}
                            <div className="pt-2 flex items-center justify-between">
                                <p className="text-[9px] font-mono text-zinc-400">AI generated · Ready to execute</p>
                                <button
                                    onClick={onGetStarted}
                                    className="btn-primary px-4 py-2 text-xs font-mono font-bold cursor-pointer"
                                >
                                    Try InsightAI
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-[var(--color-border)] text-center space-y-12">
                <div>
                    <p className="text-[9px] font-mono text-[var(--color-accent)] uppercase tracking-widest mb-2 font-bold">
                        HOW INSIGHTAI WORKS
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-mono font-bold text-[var(--color-text-primary)]">
                        From question to SQL
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-medium max-w-md mx-auto mt-2">
                        Connect your dataset, ask questions in natural language, review the generated SQL, and execute it.
                    </p>
                </div>

                {/* 3 Large Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="card p-6 bg-[var(--color-bg-card)] border-[var(--color-border)] space-y-3">
                        <span className="text-xs font-mono text-[var(--color-accent)] font-bold">01</span>
                        <h3 className="text-sm font-mono font-bold text-[var(--color-text-primary)] uppercase">CONNECT</h3>
                        <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                            Upload your CSV or SQLite database file to initialize the in-memory sandbox.
                        </p>
                    </div>

                    <div className="card p-6 bg-[var(--color-bg-card)] border-[var(--color-accent)]/40 shadow-sm space-y-3 relative">
                        <span className="text-xs font-mono text-[var(--color-accent)] font-bold">02</span>
                        <h3 className="text-sm font-mono font-bold text-[var(--color-text-primary)] uppercase">ASK</h3>
                        <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                            Describe what you need in plain English. Groq AI compiles optimized SQL.
                        </p>
                    </div>

                    <div className="card p-6 bg-[var(--color-bg-card)] border-[var(--color-border)] space-y-3">
                        <span className="text-xs font-mono text-[var(--color-accent)] font-bold">03</span>
                        <h3 className="text-sm font-mono font-bold text-[var(--color-text-primary)] uppercase">REVIEW & EXECUTE</h3>
                        <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                            Review the generated SQL and execute it against your database with 100% confidence.
                        </p>
                    </div>
                </div>

                {/* Safety Guarantee Box */}
                <div className="card p-5 bg-[var(--color-bg-card)] border-[var(--color-border)] flex items-start gap-4 text-left max-w-3xl mx-auto">
                    <div className="p-2 rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)] shrink-0">
                        <Check size={18} weight="bold" />
                    </div>
                    <div>
                        <h4 className="text-xs font-mono font-bold text-[var(--color-text-primary)] uppercase mb-1">
                            REVIEW BEFORE EXECUTION
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                            Generated SQL is shown before execution. Destructive operations require explicit confirmation before changing database data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--color-border)] py-8 text-center text-xs font-mono text-[var(--color-text-muted)]">
                <p>© 2026 InsightAI. Local-first AI Database Assistant.</p>
            </footer>

        </div>
    );
}
