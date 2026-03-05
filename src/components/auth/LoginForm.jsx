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
        <div className="min-h-screen w-full flex items-center justify-center bg-[#05050A] px-4 relative overflow-hidden font-sans">
            
            {/* Background decorativo Premium */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />

                <div 
                    className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"
                    style={{ maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 100%)' }}
                />
            </div>

            {/* Container Central - Mantive 520px e centralizei o conteúdo interno */}
            <div className="w-full max-w-[520px] relative z-10 my-10 flex flex-col items-center">
                
                {/* Logo / Branding */}
                <div className="text-center mb-10 w-full flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-white/[0.02] border border-white/[0.05] mb-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-xl relative">
                        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-md -z-10" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                            <Film size={28} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight">
                        FilmSchedule
                    </h1>
                    <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1.5 font-medium">
                        <Sparkles size={14} className="text-purple-400" />
                        Agenda Profissional para Filmmakers
                    </p>
                </div>

                {/* CARD DO FORMULÁRIO 
                  Mudanças aqui:
                  1. bg-[#111118] um pouco mais claro para separar do fundo preto.
                  2. w-full box-border para forçar tudo a caber.
                  3. Padding forte (p-8 sm:p-12) para empurrar o form pra dentro.
                */}
                <div className="relative w-full rounded-[32px] bg-[#1a1a24]/80 backdrop-blur-2xl border border-white/[0.08] p-8 sm:p-12 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] box-border">
                    
                    <div className="absolute inset-x-0 -top-px h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

                    <h2 className="text-2xl font-semibold text-white/95 mb-2 tracking-wide text-center sm:text-left">
                        Bem-vindo de volta
                    </h2>
                    <p className="text-[15px] text-gray-400 mb-10 text-center sm:text-left">
                        Acesse sua conta para continuar
                    </p>

                    {/* Formulário com w-full explícito */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full box-border">

                        <div className="flex flex-col gap-2 w-full">
                            <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-300 pl-1">
                                <Mail size={16} className="text-purple-400/80" />
                                Email
                            </label>
                            {/* Inputs com w-full e box-border para não estourar a largura */}
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                                className="w-full box-border px-5 py-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[15px] text-white placeholder-gray-600 focus:outline-none focus:bg-black focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 hover:border-white/[0.15] transition-all duration-300"
                                autoComplete="email"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-300 pl-1">
                                <Lock size={16} className="text-purple-400/80" />
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full box-border px-5 py-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[15px] text-white placeholder-gray-600 focus:outline-none focus:bg-black focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 hover:border-white/[0.15] transition-all duration-300"
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 w-full box-border bg-red-500/10 border border-red-500/30 rounded-2xl">
                                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-[13px] font-medium text-red-300 leading-relaxed">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="group relative w-full box-border flex items-center justify-center gap-2.5 px-4 py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-[16px] rounded-2xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden"
                        >
                            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-in-out" />
                            
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Acessando o set...</span>
                                    </>
                                ) : (
                                    'Entrar no Sistema'
                                )}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Link para registro mantido abaixo do card */}
                <p className="text-center text-[15px] text-gray-500 mt-8 font-medium w-full">
                    Ainda não tem acesso?{' '}
                    <Link
                        to="/register"
                        className="text-white hover:text-purple-400 font-bold transition-all duration-300 underline decoration-white/20 hover:decoration-purple-400/60 underline-offset-4"
                    >
                        Criar conta grátis
                    </Link>
                </p>
            </div>
        </div>
    );
}