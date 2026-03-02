import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Film, Mail, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react';

/**
 * Tela de login premium com design cinematográfico.
 */
export default function LoginForm() {
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/');
        } catch (err) {
            if (err.message?.includes('Invalid login credentials')) {
                setError('Email ou senha incorretos.');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Confirme seu email antes de fazer login.');
            } else {
                setError(err.message || 'Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg-primary)] px-4 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradiente superior — roxo */}
                <div
                    className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full opacity-[0.05]"
                    style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
                />
                {/* Gradiente inferior — azul */}
                <div
                    className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full opacity-[0.06]"
                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
                />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Card central */}
            <div className="w-full max-w-[520px] relative z-10">
                {/* Logo / Branding */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 mb-6 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(139,92,246,0.35)]">
                        <Film size={32} className="text-white drop-shadow-sm" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-[-0.02em]">
                        FilmSchedule
                    </h1>
                    <p className="text-sm text-gray-500 mt-2.5 flex items-center justify-center gap-1.5">
                        <Sparkles size={13} className="text-purple-400/80" />
                        Agenda Profissional para Filmmakers
                    </p>
                </div>

                {/* Card do formulário — glassmorphism premium */}
                <div
                    className="relative rounded-[28px] border border-white/[0.06] p-10 sm:p-12 md:p-14 ring-1 ring-inset ring-white/[0.04]"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(20,20,30,0.90) 100%)',
                        backdropFilter: 'blur(40px) saturate(1.5)',
                        WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
                        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                >
                    {/* Glow sutil no topo do card */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                    <h2 className="text-xl font-semibold text-white/95 mb-1.5">
                        Bem-vindo de volta
                    </h2>
                    <p className="text-[15px] text-gray-400 mb-10">
                        Entre na sua conta para continuar
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-7">

                        {/* Bloco de Email */}
                        <div className="flex flex-col gap-2.5">
                            <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                <Mail size={14} className="text-purple-400/70" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                                className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out"
                                autoComplete="email"
                            />
                        </div>

                        {/* Bloco de Senha */}
                        <div className="flex flex-col gap-2.5">
                            <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                <Lock size={14} className="text-purple-400/70" />
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out"
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Erro */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/15 rounded-xl backdrop-blur-sm">
                                <AlertCircle size={18} className="text-red-400/90 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300/90 leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="group relative w-full flex items-center justify-center gap-2.5 px-4 py-4 mt-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] rounded-xl transition-all duration-300 ease-out disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-blue-600 disabled:active:scale-100 cursor-pointer overflow-hidden shadow-[0_8px_30px_-4px_rgba(139,92,246,0.35)] hover:shadow-[0_12px_40px_-4px_rgba(139,92,246,0.5)]"
                        >
                            {/* Shimmer no hover */}
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>
                </div>

                {/* Link para registro */}
                <p className="text-center text-sm text-gray-500 mt-10">
                    Não tem conta?{' '}
                    <Link
                        to="/register"
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-200 hover:underline underline-offset-2 decoration-purple-400/30"
                    >
                        Criar conta gratuitamente
                    </Link>
                </p>
            </div>
        </div>
    );
}