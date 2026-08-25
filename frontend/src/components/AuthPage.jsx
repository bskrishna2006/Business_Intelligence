import { useState } from 'react';
import { 
  ChatTeardropText, 
  ChartBar, 
  Lightning, 
  ShieldCheck, 
  Sparkle,
  ArrowRight,
  Warning,
  Moon,
  Sun
} from '@phosphor-icons/react';

const HIGHLIGHTS = [
    { icon: ChatTeardropText, text: 'Ask questions in natural language' },
    { icon: ChartBar, text: 'Get beautiful charts instantly' },
    { icon: Lightning, text: 'Powered by Groq AI' },
    { icon: ShieldCheck, text: 'Your data stays private' },
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
        <div className="min-h-screen flex w-full bg-[var(--color-bg-primary)]">

            {/* ── Left Visual Panel ── */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] border-r border-[var(--color-border)]">
                {/* Subtle Background Glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-accent)] opacity-5 rounded-full blur-[130px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[var(--color-accent-secondary)] opacity-5 rounded-full blur-[120px]" />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white shadow-md shadow-[var(--color-accent)]/15">
                        <Sparkle size={18} weight="fill" />
                    </div>
                    <span className="text-[var(--color-text-primary)] font-bold tracking-tight text-md">InsightAI</span>
                </div>

                {/* Centered content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
                    <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-4 tracking-tight">
                        Your data,{' '}
                        <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)] bg-clip-text text-transparent">
                            understood naturally.
                        </span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8 font-medium">
                        Upload any CSV and talk to your data in plain English. No SQL skills needed. Just ask, and InsightAI delivers.
                    </p>

                    <div className="space-y-4 mb-8">
                        {HIGHLIGHTS.map((h, i) => {
                            const Icon = h.icon;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-xs text-[var(--color-text-secondary)] font-semibold">{h.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Clean chart visual */}
                    <div className="card p-5 border-[var(--color-border-soft)] bg-[var(--color-bg-card)]">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-4 font-bold uppercase tracking-wider">Example regional data</p>
                        <div className="flex items-end gap-2 h-16">
                            {[55, 78, 42, 95, 61, 83, 36, 88, 70, 52].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t bg-[var(--color-accent)] transition-all hover:bg-[var(--color-accent-soft)]"
                                    style={{
                                        height: `${h}%`,
                                        opacity: i % 2 === 0 ? 1 : 0.6
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to landing */}
                {onBack && (
                    <div className="relative z-10">
                        <button onClick={onBack} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 font-bold cursor-pointer">
                            &larr; Back to home
                        </button>
                    </div>
                )}
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                {/* Theme toggle */}
                <button onClick={onToggleTheme} className="theme-toggle absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer">
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    <span className="font-semibold capitalize">{theme === 'dark' ? 'dark' : 'light'}</span>
                </button>

                <div className="w-full max-w-sm relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8.5 h-8.5 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white">
                            <Sparkle size={18} weight="fill" />
                        </div>
                        <span className="text-[var(--color-text-primary)] font-bold tracking-tight text-md">InsightAI</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-2">
                            {tab === 'login' ? 'Welcome back' : 'Start exploring'}
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)] font-semibold">
                            {tab === 'login'
                                ? 'Access your dashboards and data'
                                : 'Create an account to get started'}
                        </p>
                    </div>

                    {/* Tab toggle */}
                    <div className="flex rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-soft)] p-1 mb-8">
                        {['login', 'signup'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-2.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${tab === t
                                        ? 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm'
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
                                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Full Name</label>
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
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Email Address</label>
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
                                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Password</label>
                                {tab === 'login' && (
                                    <span className="text-[11px] text-[var(--color-accent)] hover:underline cursor-pointer font-semibold">Forgot?</span>
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
                            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/15">
                                <Warning size={16} className="text-[var(--color-danger)] shrink-0 mt-0.5" />
                                <p className="text-xs text-[var(--color-danger)] font-semibold leading-relaxed">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-sm font-semibold shadow-lg shadow-[var(--color-accent)]/15 disabled:opacity-50 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>{loading ? 'Working…' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                            {!loading && <ArrowRight size={14} />}
                        </button>
                    </form>

                    <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 font-medium">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
                            className="text-[var(--color-accent)] hover:underline font-bold transition-colors cursor-pointer"
                        >
                            {tab === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>

                    {/* Back link on mobile */}
                    {onBack && (
                        <p className="lg:hidden text-center text-xs text-[var(--color-text-muted)] mt-6 font-bold">
                            <button onClick={onBack} className="hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer">&larr; Back to home</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
