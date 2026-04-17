import { useState } from 'react';

const FEATURES = [
    {
        icon: '🧠',
        title: 'Natural Language Queries',
        desc: 'Ask questions in plain English. Our AI converts them to precise SQL instantly.',
    },
    {
        icon: '📊',
        title: 'Auto-Generated Charts',
        desc: 'Beautiful visualizations generated automatically from your query results.',
    },
    {
        icon: '⚡',
        title: 'Powered by Groq',
        desc: 'Lightning-fast inference using LLaMA 3.3 70B for enterprise-grade accuracy.',
    },
    {
        icon: '🔒',
        title: 'Secure & Private',
        desc: 'Your data never leaves your environment. Fully self-hosted architecture.',
    },
    {
        icon: '🔮',
        title: 'Predictive Insights',
        desc: 'Automatically detect trends, anomalies and forecasts in your datasets.',
    },
    {
        icon: '📁',
        title: 'CSV to Insights in Seconds',
        desc: 'Upload any CSV file and start querying in under 10 seconds.',
    },
];

const STATS = [
    { value: '10x', label: 'Faster than manual SQL' },
    { value: '99%', label: 'Query accuracy' },
    { value: '0ms', label: 'Setup time' },
];

export default function LandingPage({ onGetStarted }) {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    return (
        <div className="min-h-screen bg-[#070b14] text-white overflow-x-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#4f46e5] opacity-10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#7c3aed] opacity-10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-[#06b6d4] opacity-5 rounded-full blur-[100px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        BI
                    </div>
                    <span className="text-base font-semibold text-white">InsightAI</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onGetStarted}
                        className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="px-4 py-1.5 text-sm bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow"
                    >
                        Get Started Free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4f46e5]/40 bg-[#4f46e5]/10 text-xs text-[#818cf8] mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
                    Powered by Groq · LLaMA 3.3 70B · FastAPI
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
                    Ask your data{' '}
                    <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#67e8f9] bg-clip-text text-transparent">
                        anything
                    </span>
                </h1>

                <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                    InsightAI transforms your CSV files into an intelligent analytics engine.
                    Ask questions in plain English and get instant SQL queries, charts, and AI-generated insights.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-3 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#4f46e5]/30 hover:shadow-[#4f46e5]/50"
                    >
                        Start for free →
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-3 border border-white/10 text-white/70 rounded-xl font-medium text-sm hover:bg-white/5 transition-all"
                    >
                        Sign in to your account
                    </button>
                </div>
            </section>

            {/* Animated Dashboard Preview */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
                <div className="relative rounded-2xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2 p-1 shadow-2xl">
                    {/* Mock dashboard */}
                    <div className="rounded-xl bg-[#0d1424] p-5 overflow-hidden">
                        {/* Mock header */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            <div className="flex-1 mx-4 h-5 rounded bg-white/5 flex items-center px-3">
                                <span className="text-[10px] text-white/20">InsightAI — Business Intelligence</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Stat cards */}
                            {[
                                { label: 'Avg Stress Level', value: '6.8', color: '#ef4444' },
                                { label: 'Avg Productivity', value: '62.4', color: '#22c55e' },
                                { label: 'Rows Analyzed', value: '10,000', color: '#4f46e5' },
                            ].map((s) => (
                                <div key={s.label} className="rounded-lg bg-white/4 p-3 border border-white/5">
                                    <p className="text-[10px] text-white/40 mb-1">{s.label}</p>
                                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Mock chart bars */}
                        <div className="mt-4 rounded-lg bg-white/4 border border-white/5 p-4">
                            <p className="text-[10px] text-white/40 mb-3">Avg Productivity by Occupation</p>
                            <div className="flex items-end gap-2 h-[80px]">
                                {[65, 82, 47, 91, 58, 73, 39, 85].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                                        height: `${h}%`,
                                        background: `linear-gradient(to top, #4f46e5, #7c3aed)`,
                                        opacity: 0.7 + (i % 3) * 0.1,
                                    }} />
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                                {['Dev', 'Mgr', 'HR', 'DS', 'Mktg', 'Ops', 'Sales', 'Edu'].map((l) => (
                                    <div key={l} className="flex-1 text-[8px] text-white/25 text-center truncate">{l}</div>
                                ))}
                            </div>
                        </div>

                        {/* Mock SQL chip */}
                        <div className="mt-3 rounded-lg bg-white/4 border border-white/5 px-4 py-2.5 flex items-center gap-2">
                            <span className="text-[10px] text-[#818cf8] font-mono shrink-0">SQL</span>
                            <span className="text-[10px] text-white/30 font-mono truncate">
                                SELECT occupation, AVG(work_productivity_score) AS avg_prod FROM data GROUP BY occupation ORDER BY avg_prod DESC
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
                <div className="grid grid-cols-3 gap-4">
                    {STATS.map((s) => (
                        <div key={s.label} className="text-center py-8 rounded-2xl border border-white/5 bg-white/2">
                            <p className="text-4xl font-bold bg-gradient-to-r from-[#818cf8] to-[#67e8f9] bg-clip-text text-transparent mb-2">
                                {s.value}
                            </p>
                            <p className="text-sm text-white/40">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-3">Everything you need to understand your data</h2>
                    <p className="text-white/40 text-sm">No SQL knowledge required. No dashboards to configure.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHoveredFeature(i)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className={`rounded-2xl border p-5 cursor-default transition-all duration-200 ${hoveredFeature === i
                                    ? 'border-[#4f46e5]/50 bg-[#4f46e5]/8 shadow-lg shadow-[#4f46e5]/10'
                                    : 'border-white/5 bg-white/2'
                                }`}
                        >
                            <div className="text-2xl mb-3">{f.icon}</div>
                            <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                            <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
                <div className="rounded-3xl border border-[#4f46e5]/20 bg-gradient-to-br from-[#4f46e5]/10 to-[#7c3aed]/5 p-12">
                    <h2 className="text-3xl font-bold mb-3">Ready to unlock your data?</h2>
                    <p className="text-white/40 text-sm mb-8">
                        Create a free account and upload your first dataset in minutes.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-3.5 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-[#4f46e5]/30"
                    >
                        Get Started Free →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-6 px-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-[10px] font-bold">BI</div>
                    <span className="text-xs text-white/30">InsightAI — Business Intelligence Platform</span>
                </div>
                <p className="text-xs text-white/20">Built with Groq · FastAPI · React</p>
            </footer>
        </div>
    );
}
