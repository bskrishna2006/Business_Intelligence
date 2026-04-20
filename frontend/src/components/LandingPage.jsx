import { useState } from 'react';

const FEATURES = [
    {
        icon: '💭',
        title: 'Natural Language Queries',
        desc: 'Talk to your data like a friend. Ask questions in plain English, get instant answers.',
    },
    {
        icon: '📊',
        title: 'Auto-Generated Charts',
        desc: 'Beautiful visualizations that make sense. No manual tinkering needed.',
    },
    {
        icon: '⚡',
        title: 'Powered by Groq',
        desc: 'Lightning-fast analysis using LLaMA 3.3 70B. Results in milliseconds.',
    },
    {
        icon: '🔒',
        title: 'Your Data, Private',
        desc: 'Everything stays with you. No cloud uploads, fully self-hosted.',
    },
    {
        icon: '🔮',
        title: 'Predictive Insights',
        desc: 'Spot trends and patterns automatically. Stay ahead of your data.',
    },
    {
        icon: '⏱️',
        title: 'CSV to Insights Fast',
        desc: 'Drop a file, ask a question, get answers. That simple.',
    },
];

const STATS = [
    { value: '10x', label: 'Faster than writing SQL' },
    { value: '99%', label: 'Accuracy' },
    { value: '< 10s', label: 'Setup time' },
];

export default function LandingPage({ onGetStarted }) {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden">
            {/* Warm, organic background gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-[#d4a574] opacity-8 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-12%] right-[-8%] w-[450px] h-[450px] bg-[#7a9b99] opacity-6 rounded-full blur-[130px]" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-[#c8b4a0] opacity-5 rounded-full blur-[120px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[var(--color-border-soft)]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[#d4a574] to-[#7a9b99] flex items-center justify-center text-white text-xs font-bold shadow-md">
                        ✨
                    </div>
                    <span className="text-lg font-semibold text-[var(--color-text-primary)]">InsightAI</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="px-5 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-6 py-2 text-sm shadow-md hover:shadow-lg"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-accent-muted)] text-xs text-[var(--color-accent)] mb-10 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                    Built with Groq AI · Fast · Private
                </div>

                <h1 className="text-5xl sm:text-7xl font-bold leading-[1.2] mb-8 text-[var(--color-text-primary)]">
                    Talk to your data,{' '}
                    <span className="bg-gradient-to-r from-[#d4a574] via-[#ddb885] to-[#7a9b99] bg-clip-text text-transparent">
                        naturally.
                    </span>
                </h1>

                <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed font-[450]">
                    Upload any CSV and ask questions in plain English. Get SQL, charts, and insights instantly. 
                    No SQL knowledge needed. No complicated dashboards. Just you and your data.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl"
                    >
                        Start for free →
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="btn-secondary px-8 py-3 text-base font-medium"
                    >
                        View demo
                    </button>
                </div>
            </section>

            {/* Warm color statistics cards */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {STATS.map((s) => (
                        <div key={s.label} className="card p-8 text-center">
                            <p className="text-5xl font-bold bg-gradient-to-r from-[#d4a574] to-[#7a9b99] bg-clip-text text-transparent mb-3">
                                {s.value}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features with warm aesthetic */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
                        Everything you need to understand your data
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-base max-w-2xl mx-auto">
                        No SQL needed. No steep learning curve. Just natural conversation with your data.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHoveredFeature(i)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className={`card p-6 transition-all duration-300 cursor-default group ${
                                hoveredFeature === i ? 'shadow-lg border-[var(--color-accent)]' : ''
                            }`}
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {f.icon}
                            </div>
                            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
                                {f.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Warm CTA section */}
            <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32 text-center">
                <div className="card p-12 border-[var(--color-border-soft)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)]">
                    <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
                        Ready to talk to your data?
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-base mb-8 max-w-xl mx-auto">
                        No credit card needed. Free forever for exploring. Pro tier for teams.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="btn-primary px-10 py-4 text-base font-semibold shadow-lg hover:shadow-xl"
                    >
                        Get started free →
                    </button>
                </div>
            </section>

            {/* Footer with warm tones */}
            <footer className="relative z-10 border-t border-[var(--color-border-soft)] py-8 px-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center gap-3 mb-4 sm:mb-0">
                        <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-[#d4a574] to-[#7a9b99] flex items-center justify-center text-white text-xs font-bold">
                            ✨
                        </div>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            InsightAI — Your data, naturally understood
                        </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Built with care · Powered by Groq AI
                    </p>
                </div>
            </footer>
        </div>
    );
}
