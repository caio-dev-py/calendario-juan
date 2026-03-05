import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar,
    CalendarPlus,
    Settings,
    Film,
    LayoutDashboard,
    Clock,
    LogOut,
    User,
    Shield,
} from 'lucide-react';

/**
 * Sidebar de navegação com branding, user info e controle baseado em role.
 */
export default function Sidebar() {
    const { profile, isAdmin, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Links acessíveis para todos os autenticados
    const commonItems = [
        { path: '/', label: 'Calendário', icon: Calendar },
        { path: '/booking', label: 'Nova Reserva', icon: CalendarPlus },
    ];

    // Links exclusivos para admins
    const adminItems = [
        { path: '/admin', label: 'Configurações', icon: Settings },
        { path: '/manage', label: 'Gerenciar', icon: LayoutDashboard },
    ];

    const navItems = isAdmin ? [...commonItems, ...adminItems] : commonItems;

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (err) {
            console.error('Erro ao sair:', err);
        }
    };

    return (
        <>
            {/* Sidebar para desktop */}
            <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-[var(--color-bg-secondary)]/80 border-r border-white/[0.04] backdrop-blur-xl">
                {/* Logo / Branding */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.04]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.4)]">
                        <Film size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-[15px] font-bold text-white leading-tight tracking-[-0.01em]">
                            FilmSchedule
                        </h1>
                        <p className="text-[11px] text-gray-500">Agenda Profissional</p>
                    </div>
                </div>

                {/* Navegação */}
                <nav className="flex-1 px-3 py-5 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ease-out group ${isActive
                                    ? 'bg-purple-500/[0.12] text-purple-300 shadow-[inset_0_1px_0_rgba(139,92,246,0.15)]'
                                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                                    }`}
                            >
                                <Icon size={18} className={`transition-colors duration-300 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                {item.label}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer — Perfil + Logout */}
                <div className="px-4 py-5 border-t border-white/[0.04] space-y-3">
                    {/* Info do usuário */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-500/[0.12] ring-1 ring-purple-500/20">
                            <User size={14} className="text-purple-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                                {profile?.full_name || 'Carregando...'}
                            </p>
                            <div className="flex items-center gap-1">
                                {isAdmin && <Shield size={10} className="text-amber-400" />}
                                <span className="text-[10px] text-gray-500">
                                    {isAdmin ? 'Administrador' : 'Cliente'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <Clock size={13} />
                        <span className="truncate">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                    </div>

                    {/* Botão de logout */}
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] text-gray-500 hover:bg-red-500/[0.08] hover:text-red-400 transition-all duration-300 ease-out cursor-pointer"
                    >
                        <LogOut size={15} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Bottom nav para mobile */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2.5 border-t border-white/[0.04]"
                style={{
                    background: 'rgba(9,9,11,0.92)',
                    backdropFilter: 'blur(24px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                }}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 ${isActive
                                ? 'text-purple-400'
                                : 'text-gray-500'
                                }`}
                        >
                            <Icon size={20} />
                            {item.label}
                        </NavLink>
                    );
                })}
                {/* Botão logout no mobile */}
                <button
                    onClick={handleSignOut}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-500 hover:text-red-400 transition-all duration-300 cursor-pointer"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </nav>
        </>
    );
}
