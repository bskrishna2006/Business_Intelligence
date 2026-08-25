import { useState } from 'react';
import { 
  ChatTeardropText, 
  ChartBar, 
  Lightning, 
  ShieldCheck, 
  Sparkle, 
  Timer, 
  Moon, 
  Sun,
  ArrowRight,
  Play
} from '@phosphor-icons/react';

const FEATURES = [
    {
        icon: ChatTeardropText,
        title: 'Natural Language Queries',
        desc: 'Ask questions in plain English and get instant analytical answers.',
        badge: 'Popular'
    },
    {
        icon: ChartBar,
        title: 'Auto-Generated Charts',
        desc: 'Beautiful visualizations generated on the fly. No manual tinkering needed.',
    },
    {
        icon: Lightning,
        title: 'Instant Execution',
        desc: 'Lightning-fast analysis using Groq LLaMA 3.3. Results in milliseconds.',
    },
    {
        icon: ShieldCheck,
        title: 'Data Privacy First',
        desc: 'Everything stays local and secure. No cloud storage or third-party tracking.',
    },
    {
        icon: Sparkle,
        title: 'Predictive Insights',
        desc: 'Spot hidden trends and patterns automatically to stay ahead of your market.',
    },
    {
        icon: Timer,
        title: 'Rapid Deployment',
        desc: 'Drop a CSV, ask a question, and get results. Setup takes under ten seconds.',
    },
];

const STATS = [
    { value: '10x', label: 'Faster than writing SQL' },
    { value: '99%', label: 'Query Accuracy' },
    { value: '< 10s', label: 'Average Setup Time' },
];

export default function LandingPage({ onGetStarted, theme, onToggleTheme }) {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-accent)] opacity-5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-accent-secondary)] opacity-5 rounded-full blur-[140px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white shadow-md shadow-[var(--color-accent)]/15">
                        <Sparkle size={18} weight="fill" />
                    </div>
                    <span className="text-md font-bold tracking-tight text-[var(--color-text-primary)]">InsightAI</span>
                </div>
                <div className="flex items-center gap-5">
                    <button 
                        onClick={onToggleTheme} 
                        className="theme-toggle flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
                    >
                        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                        <span className="font-semibold capitalize">{theme === 'dark' ? 'dark' : 'light'}</span>
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-semibold cursor-pointer"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-5 py-2 text-xs font-semibold shadow-md shadow-[var(--color-accent)]/10 hover:shadow-lg cursor-pointer"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Copy Panel */}
                    <div className="lg:col-span-7 space-y-8 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-accent-muted)] text-[11px] text-[var(--color-accent)] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                            Next-Gen Data Intelligence
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-text-primary)]">
                            Talk to your data,{' '}
                            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-clip-text text-transparent">
                                naturally.
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed font-medium">
                            Upload any CSV and ask questions in plain English. Get SQL, custom charts, and predictive insights instantly.
                        </p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onGetStarted}
                                className="btn-primary px-7 py-3 text-sm font-semibold shadow-lg shadow-[var(--color-accent)]/15 hover:shadow-xl cursor-pointer flex items-center gap-2 group"
                            >
                                Start exploring free
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="btn-secondary px-7 py-3 text-sm font-semibold cursor-pointer flex items-center gap-2"
                            >
                                <Play size={14} weight="fill" />
                                View demo
                            </button>
                        </div>
                    </div>

                    {/* Right Interactive Mockup Preview */}
                    <div className="lg:col-span-5 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] opacity-10 rounded-2xl blur-3xl pointer-events-none" />
                        <div className="relative rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-card)] p-5 md:p-6 shadow-xl overflow-hidden">
                            {/* Window header */}
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3.5 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)]/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]/70" />
                                </div>
                                <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-medium">sales_q3.csv</span>
                            </div>

                            {/* Conversation Mockup */}
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <div className="bg-[var(--color-accent)] text-white text-xs py-2 px-3.5 rounded-2xl rounded-tr-sm shadow-sm font-medium">
                                        "Show sales trend by region"
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="border border-[var(--color-border-soft)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-xs py-2.5 px-3.5 rounded-2xl rounded-tl-sm shadow-sm space-y-3 max-w-[90%]">
                                        <p className="font-semibold text-[var(--color-text-secondary)]">Analyzing regional sales dataset...</p>
                                        
                                        {/* Micro chart preview */}
                                        <div className="flex items-end gap-1.5 h-18 pt-2">
                                            {[40, 70, 55, 90, 60].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-t-sm bg-[var(--color-accent)] opacity-90 transition-all hover:opacity-100" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-[9px] text-[var(--color-text-muted)] font-mono">
                                            <span>North</span>
                                            <span>East</span>
                                            <span>South</span>
                                            <span>West</span>
                                            <span>Central</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-b border-[var(--color-border-soft)] bg-[var(--color-bg-secondary)]/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STATS.map((s, idx) => (
                        <div key={idx} className="text-center md:text-left space-y-1.5 md:pl-8 md:border-l border-[var(--color-border)] first:border-0 first:pl-0">
                            <p className="text-3xl font-extrabold text-[var(--color-accent)] leading-none">
                                {s.value}
                            </p>
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
                        Unlock powerful analytical capabilities
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                        No complex schemas or SQL wizardry required. Talk to your database dynamically.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => {
                        const Icon = f.icon;
                        const isHovered = hoveredFeature === i;
                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredFeature(i)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                className={`card p-6 flex flex-col items-start text-left relative overflow-hidden transition-all duration-300 ${
                                    isHovered 
                                        ? 'border-[var(--color-accent)] shadow-lg bg-[var(--color-bg-elevated)] -translate-y-0.5' 
                                        : 'bg-[var(--color-bg-card)]'
                                }`}
                            >
                                <div className={`p-3 rounded-lg mb-5 transition-colors ${
                                    isHovered 
                                        ? 'bg-[var(--color-accent)] text-white' 
                                        : 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                                }`}>
                                    <Icon size={20} weight={isHovered ? "fill" : "regular"} />
                                </div>
                                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                    {f.desc}
                                </p>
                                {f.badge && (
                                    <span className="absolute top-4 right-4 bg-[var(--color-accent-secondary-soft)] text-[var(--color-accent-secondary)] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {f.badge}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
                <div className="card p-10 md:p-12 border-[var(--color-border-soft)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)]/50 shadow-xl space-y-6">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                        Ready to talk to your data?
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm max-w-md mx-auto font-medium">
                        Get started with free data uploads. Unlock the Pro tier later for team sharing.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[var(--color-accent)]/15 hover:shadow-xl cursor-pointer"
                    >
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[var(--color-border)] py-8 px-6 bg-[var(--color-bg-secondary)]/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center text-white">
                            <Sparkle size={14} weight="fill" />
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                            InsightAI · Naturally Understood
                        </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                        Built with care · Powered by Groq AI
                    </p>
                </div>
            </footer>
        </div>
    );
}
