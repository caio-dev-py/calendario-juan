import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Film, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, UserPlus } from 'lucide-react';

/**
 * Tela de cadastro premium com design cinematográfico.
 */
export default function RegisterForm() {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!fullName.trim()) {
            setError('Informe seu nome completo.');
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, fullName.trim());
            setSuccess(true);
        } catch (err) {
            if (err.message?.includes('already registered')) {
                setError('Este email já está cadastrado.');
            } else {
                setError(err.message || 'Erro ao criar conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // TELA DE SUCESSO PREMIUM
    // ==========================================
    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#05050A] px-4 relative overflow-hidden font-sans">
                {/* Background Decorativo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
                    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] mix-blend-screen" />
                </div>

                <div className="w-full max-w-[460px] text-center relative z-10 flex flex-col items-center">
                    {/* Ícone de Check Premium */}
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 mb-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur-xl relative">
                        <div className="absolute inset-0 rounded-[32px] bg-emerald-400/20 blur-md -z-10" />
                        <CheckCircle size={44} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-4 tracking-tight">
                        Conta criada! 🎬
                    </h2>
                    <p className="text-[15px] text-gray-300 mb-2 font-medium">
                        Verifique seu email para confirmar a conta.
                    </p>
                    <p className="text-[14px] text-gray-500 mb-10">
                        Após confirmar, faça login para acessar o sistema.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative w-full sm:w-[80%] flex items-center justify-center px-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-[16px] rounded-2xl transition-all duration-300 ease-out shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden"
                    >
                        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-in-out" />
                        <span className="relative z-10">Ir para Login</span>
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // TELA DE CADASTRO PREMIUM
    // ==========================================
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

            {/* Container Central */}
            <div className="w-full max-w-[540px] relative z-10 my-10 flex flex-col items-center">
                
                {/* Logo / Branding */}
                <div className="text-center mb-10 w-full flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] bg-white/[0.02] border border-white/[0.05] mb-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-xl relative">
                        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-md -z-10" />
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                            <UserPlus size={28} className="text-white drop-shadow-lg" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight">
                        Criar Conta
                    </h1>
                    <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1.5 font-medium">
                        <Film size={14} className="text-purple-400" />
                        Cadastre-se para agendar suas gravações
                    </p>
                </div>

                {/* CARD DO FORMULÁRIO */}
                <div className="relative w-full rounded-[32px] bg-[#141416]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] py-12 sm:py-14 flex flex-col items-center box-border">
                    
                    <div className="absolute inset-x-0 -top-px h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />

                    {/* CONTAINER INTERNO (Respiro garantido) */}
                    <div className="w-[88%] sm:w-[82%] flex flex-col">
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                            {/* Nome Completo */}
                            <div className="flex flex-col gap-2 w-full">
                                <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-300 pl-1">
                                    <User size={16} className="text-purple-400/80" />
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Seu nome completo"
                                    className="w-full box-border px-5 py-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[15px] text-white placeholder-gray-600 focus:outline-none focus:bg-black focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 hover:border-white/[0.15] transition-all duration-300"
                                    autoComplete="name"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2 w-full">
                                <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-300 pl-1">
                                    <Mail size={16} className="text-purple-400/80" />
                                    Email
                                </label>
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

                            {/* Grid para Senha e Confirmação de Senha no Desktop (Fica lado a lado no PC e empilhado no mobile) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                
                                {/* Senha */}
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
                                        minLength={6}
                                        placeholder="Mínimo 6"
                                        className="w-full box-border px-5 py-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[15px] text-white placeholder-gray-600 focus:outline-none focus:bg-black focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 hover:border-white/[0.15] transition-all duration-300"
                                        autoComplete="new-password"
                                    />
                                </div>

                                {/* Confirmar Senha */}
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-300 pl-1">
                                        <Lock size={16} className="text-purple-400/80" />
                                        Confirmar
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Repita a senha"
                                        className="w-full box-border px-5 py-4 bg-black/60 border border-white/[0.08] rounded-2xl text-[15px] text-white placeholder-gray-600 focus:outline-none focus:bg-black focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 hover:border-white/[0.15] transition-all duration-300"
                                        autoComplete="new-password"
                                    />
                                </div>

                            </div>

                            {/* Erro */}
                            {error && (
                                <div className="flex items-start gap-3 p-4 w-full box-border bg-red-500/10 border border-red-500/30 rounded-2xl mt-2">
                                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[13px] font-medium text-red-300 leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Botão de Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full box-border flex items-center justify-center gap-2.5 px-4 py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold text-[16px] rounded-2xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden"
                            >
                                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] transition-transform duration-700 ease-in-out" />
                                
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Criando conta...</span>
                                        </>
                                    ) : (
                                        'Criar Conta'
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Link para Login */}
                <p className="text-center text-[15px] text-gray-500 mt-8 font-medium w-full">
                    Já tem conta?{' '}
                    <Link
                        to="/login"
                        className="text-white hover:text-purple-400 font-bold transition-all duration-300 underline decoration-white/20 hover:decoration-purple-400/60 underline-offset-4"
                    >
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    );
}