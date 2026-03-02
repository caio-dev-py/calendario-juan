import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CalendarPage from './pages/CalendarPage';
import BookingForm from './components/booking/BookingForm';
import AdminPage from './pages/AdminPage';
import BookingManager from './components/admin/BookingManager';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AccessDenied from './pages/AccessDenied';

/**
 * Componente raiz da aplicação.
 * Rotas públicas: /login, /register, /unauthorized
 * Rotas protegidas: /, /booking (qualquer auth), /admin, /manage (admin only)
 */
export default function App() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Rotas públicas (sem layout/sidebar)
    const publicRoutes = ['/login', '/register', '/unauthorized'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    // Spinner global durante carregamento inicial
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="text-center">
                    <div className="w-9 h-9 border-2 border-purple-500/15 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[13px] text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    // Rotas públicas (login, register, unauthorized) — sem sidebar
    if (isPublicRoute) {
        return (
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/unauthorized" element={<AccessDenied />} />
            </Routes>
        );
    }

    // Layout principal com Sidebar (apenas para usuários autenticados)
    return (
        <div className="flex min-h-screen w-full bg-[var(--color-bg-primary)]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8 pb-24 md:pb-10">
                    <Routes>
                        {/* Rotas acessíveis por qualquer usuário autenticado */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <CalendarPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking" element={
                            <ProtectedRoute>
                                <BookingForm />
                            </ProtectedRoute>
                        } />

                        {/* Rotas exclusivas para admin */}
                        <Route path="/admin" element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/manage" element={
                            <ProtectedRoute requiredRole="admin">
                                <BookingManager />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
