import { useState } from 'react';

const HIGHLIGHTS = [
    { icon: '🧠', text: 'NL → SQL in milliseconds with Groq AI' },
    { icon: '📊', text: 'Auto-generated charts & visualizations' },
    { icon: '🔮', text: 'Predictive insights & trend detection' },
    { icon: '🔒', text: 'Your data stays private & local' },
];

export default function AuthPage({ onLogin, onBack }) {
    const [tab, setTab] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const body = tab === 'login' ? { email, password } : { name, email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
            localStorage.setItem('auth_token', data.token);
            onLogin(data.user);
        } catch {
            setError('Network error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#070b14]">

            {/* ── Left Visual Panel ── */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                {/* Layered glow orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4f46e5] opacity-15 rounded-full blur-[130px]" />
                    <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-[#7c3aed] opacity-12 rounded-full blur-[110px]" />
                    <div className="absolute top-[45%] left-[45%] w-[250px] h-[250px] bg-[#06b6d4] opacity-8 rounded-full blur-[90px]" />
                </div>

                {/* Grid lines overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        BI
                    </div>
                    <span className="text-white font-semibold text-base">InsightAI</span>
                </div>

                {/* Centered content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-white leading-snug mb-4">
                        Your data,{' '}
                        <span className="bg-gradient-to-r from-[#818cf8] to-[#67e8f9] bg-clip-text text-transparent">
                            intelligently
                        </span>
                        <br />answered.
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-sm">
                        Upload any CSV and instantly query it using plain English.
                        InsightAI generates SQL, charts, and insights automatically.
                    </p>

                    <div className="space-y-4">
                        {HIGHLIGHTS.map((h, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-base shrink-0">
                                    {h.icon}
                                </div>
                                <span className="text-sm text-white/60">{h.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mock chart visual */}
                    <div className="mt-10 rounded-2xl border border-white/8 bg-white/3 p-4 backdrop-blur-sm">
                        <p className="text-[10px] text-white/30 mb-3">Live example — Productivity by Occupation</p>
                        <div className="flex items-end gap-1.5 h-16">
                            {[55, 78, 42, 95, 61, 83, 36, 88, 70, 52].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t"
                                    style={{
                                        height: `${h}%`,
                                        background: `linear-gradient(to top, #4f46e5${i % 2 === 0 ? 'cc' : '88'}, #7c3aed${i % 2 === 0 ? '66' : '44'})`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to landing */}
                {onBack && (
                    <div className="relative z-10">
                        <button onClick={onBack} className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                            ← Back to home
                        </button>
                    </div>
                )}
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                {/* Subtle right bg glow */}
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#4f46e5] opacity-5 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-sm relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold">BI</div>
                        <span className="text-white font-semibold text-sm">InsightAI</span>
                    </div>

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white mb-1.5">
                            {tab === 'login' ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-sm text-white/40">
                            {tab === 'login'
                                ? 'Sign in to access your dashboards'
                                : 'Start analyzing your data for free'}
                        </p>
                    </div>

                    {/* Tab toggle */}
                    <div className="flex rounded-xl bg-white/5 border border-white/8 p-1 mb-7">
                        {['login', 'signup'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${tab === t
                                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white shadow-md'
                                        : 'text-white/40 hover:text-white/70'
                                    }`}
                            >
                                {t === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === 'signup' && (
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#4f46e5] focus:bg-[#4f46e5]/5 transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-white/50 mb-1.5">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#4f46e5] focus:bg-[#4f46e5]/5 transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs text-white/50">Password</label>
                                {tab === 'login' && (
                                    <span className="text-[11px] text-[#818cf8] hover:underline cursor-default">Forgot password?</span>
                                )}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#4f46e5] focus:bg-[#4f46e5]/5 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20">
                                <span className="text-red-400 mt-0.5">⚠</span>
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[#4f46e5]/25 mt-2"
                        >
                            {loading
                                ? 'Please wait…'
                                : tab === 'login' ? 'Sign In →' : 'Create Account →'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-white/30 mt-6">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                            className="text-[#818cf8] hover:underline font-medium"
                        >
                            {tab === 'login' ? 'Sign up free' : 'Sign in'}
                        </button>
                    </p>

                    {/* Back link on mobile */}
                    {onBack && (
                        <p className="lg:hidden text-center text-xs text-white/20 mt-4">
                            <button onClick={onBack} className="hover:text-white/40 transition-colors">← Back to home</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
