import { useState } from 'react';

const HIGHLIGHTS = [
    { icon: '💭', text: 'Ask questions in natural language' },
    { icon: '📊', text: 'Get beautiful charts instantly' },
    { icon: '⚡', text: 'Powered by Groq AI' },
    { icon: '🔒', text: 'Your data stays private' },
];

export default function AuthPage({ onLogin, onBack, theme, onToggleTheme }) {
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
        <div className="min-h-screen flex bg-[var(--color-bg-primary)]">

            {/* ── Left Visual Panel ── */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
                {/* Warm organic background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-15%] left-[-8%] w-[450px] h-[450px] bg-[var(--color-accent)] opacity-12 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[var(--color-accent-secondary)] opacity-10 rounded-full blur-[130px]" />
                    <div className="absolute top-[40%] left-[50%] w-[250px] h-[250px] bg-[var(--color-accent-soft)] opacity-8 rounded-full blur-[120px]" />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white text-xs font-bold shadow-md">
                        ✨
                    </div>
                    <span className="text-[var(--color-text-primary)] font-semibold text-base">InsightAI</span>
                </div>

                {/* Centered content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] leading-snug mb-4">
                        Your data,{' '}
                        <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent">
                            understood naturally.
                        </span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-10 max-w-sm font-[450]">
                        Upload any CSV and talk to your data in plain English. 
                        No SQL skills needed. Just ask, and InsightAI delivers.
                    </p>

                    <div className="space-y-4">
                        {HIGHLIGHTS.map((h, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] border border-[var(--color-border-soft)] flex items-center justify-center text-base shrink-0">
                                    {h.icon}
                                </div>
                                <span className="text-sm text-[var(--color-text-secondary)]">{h.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Warm chart visual */}
                    <div className="mt-10 card p-5 border-[var(--color-border-soft)]">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-4 font-medium">Example data visualization</p>
                        <div className="flex items-end gap-2 h-16">
                            {[55, 78, 42, 95, 61, 83, 36, 88, 70, 52].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t-md transition-transform hover:scale-y-110"
                                    style={{
                                        height: `${h}%`,
                                        background: `linear-gradient(to top, rgba(43, 122, 120, ${i % 2 === 0 ? 0.75 : 0.45}), rgba(47, 95, 143, ${i % 2 === 0 ? 0.5 : 0.3}))`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to landing */}
                {onBack && (
                    <div className="relative z-10">
                        <button onClick={onBack} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1 font-medium">
                            ← Back to home
                        </button>
                    </div>
                )}
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                {/* Subtle warm glow */}
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[var(--color-accent)] opacity-8 rounded-full blur-[100px] pointer-events-none" />

                <button onClick={onToggleTheme} className="theme-toggle absolute top-6 right-6">
                    <span>{theme === 'dark' ? 'Night' : 'Light'}</span>
                    <span className="text-base leading-none">{theme === 'dark' ? '🌙' : '☀️'}</span>
                </button>

                <div className="w-full max-w-sm relative z-10">
                    {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center text-white text-xs font-bold">✨</div>
                        <span className="text-[var(--color-text-primary)] font-semibold text-sm">InsightAI</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                            {tab === 'login' ? 'Welcome back' : 'Start exploring'}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {tab === 'login'
                                ? 'Access your dashboards and data'
                                : 'Create an account to get started'}
                        </p>
                    </div>

                    {/* Tab toggle with warm styling */}
                    <div className="flex rounded-[12px] bg-[var(--color-bg-secondary)] border border-[var(--color-border-soft)] p-1 mb-8">
                        {['login', 'signup'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-[10px] transition-all duration-200 ${tab === t
                                        ? 'btn-primary shadow-md'
                                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                {t === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {tab === 'signup' && (
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] mb-2 font-medium">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="John Doe"
                                    className="input-field w-full"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-2 font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="input-field w-full"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-[var(--color-text-muted)] font-medium">Password</label>
                                {tab === 'login' && (
                                    <span className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer font-medium">Forgot?</span>
                                )}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="input-field w-full"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 px-4 py-3 rounded-[11px] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/25">
                                <span className="text-[var(--color-danger)] mt-0.5 text-lg flex-shrink-0">⚠</span>
                                <p className="text-xs text-[var(--color-danger)] font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all mt-2"
                        >
                            {loading
                                ? 'Working…'
                                : tab === 'login' ? 'Sign In →' : 'Get Started →'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 font-[450]">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                            className="text-[var(--color-accent)] hover:underline font-medium transition-colors"
                        >
                            {tab === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>

                    {/* Back link on mobile */}
                    {onBack && (
                        <p className="lg:hidden text-center text-xs text-[var(--color-text-muted)] mt-6 font-medium">
                            <button onClick={onBack} className="hover:text-[var(--color-text-secondary)] transition-colors">← Back to home</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
