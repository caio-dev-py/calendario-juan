import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

/**
 * Página de acesso negado para usuários sem permissão.
 */
export default function AccessDenied() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg-primary)] px-4 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full opacity-[0.03]"
                    style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)' }}
                />
            </div>

            <div className="text-center max-w-md relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 ring-1 ring-red-500/20 mb-8">
                    <ShieldX size={48} className="text-red-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-3">
                    Acesso Negado
                </h1>
                <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                    Você não tem permissão para acessar esta página.
                    Esta área é restrita para administradores.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] font-semibold rounded-xl transition-all active:scale-[0.98]"
                >
                    <ArrowLeft size={18} />
                    Voltar ao Calendário
                </Link>
            </div>
        </div>
    );
}
