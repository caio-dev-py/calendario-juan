import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Wrapper para proteger rotas baseado em autenticação e role.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a ser renderizado se autorizado
 * @param {string} [props.requiredRole] - Role necessária ('admin' | 'user'). Se não informada, apenas requer autenticação.
 */
export default function ProtectedRoute({ children, requiredRole }) {
    const { user, profile, loading, isAdmin } = useAuth();

    // Enquanto verifica sessão, mostra spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[var(--color-text-muted)]">Verificando sessão...</p>
                </div>
            </div>
        );
    }

    // Sem usuário → redireciona para login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se exige role admin e o usuário não é admin → acesso negado
    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Autorizado
    return children;
}
