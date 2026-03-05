import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext(null);

/**
 * Hook para acessar o contexto de autenticação.
 * @returns {{ user, profile, loading, isAdmin, signIn, signUp, signOut }}
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    }
    return context;
}

/**
 * Provider de autenticação com Supabase.
 * Gerencia sessão, perfil e role do usuário.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Busca o perfil (role) do usuário na tabela profiles.
     */
    const fetchProfile = useCallback(async (userId) => {
        console.log(`[Auth] Iniciando busca de perfil para: ${userId}`);
        try {
            const { data, error } = await Promise.race([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout na resposta do Banco de Dados (5s)')), 5000)
                ),
            ]);

            if (error && error.code === 'PGRST116') {
                console.warn('[Auth] Perfil não encontrado no banco. Tentando criar...');
                const { data: { user: authUser } } = await supabase.auth.getUser();

                // Pega nome do metadata se existir
                const fullName = authUser?.user_metadata?.full_name || '';

                const newProfile = {
                    id: userId,
                    email: authUser?.email || '',
                    full_name: fullName,
                    role: 'user', // Default
                };

                const { data: created, error: insertError } = await supabase
                    .from('profiles')
                    .upsert(newProfile)
                    .select()
                    .single();

                if (insertError) {
                    console.error('[Auth] Falha crítica ao salvar perfil no banco:', insertError.message);
                    // IMPORTANTE: Não retornar um objeto local aqui para evitar o estado "fantasma" que trava o Admin.
                    // Retornamos um objeto que indica que estamos usando metadados temporários
                    return { ...newProfile, isTemporary: true };
                }
                return created;
            }

            if (error) {
                console.error('[Auth] Erro ao carregar perfil:', error.message);
                return null;
            }

            console.log('[Auth] Perfil recuperado com sucesso:', data.full_name || data.email);
            return data;
        } catch (err) {
            console.error('[Auth] Erro excepcional no fetchProfile:', err.message);
            return null;
        }
    }, []);

    /**
     * Inicializa sessão e escuta mudanças de autenticação.
     */
    useEffect(() => {
        let mounted = true;

        // Safety timeout — nunca ficar loading infinitamente
        const timeout = setTimeout(() => {
            if (mounted) {
                console.warn('Auth timeout — forçando fim do loading');
                setLoading(false);
            }
        }, 5000);

        const initSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Erro na sessão:', sessionError.message);
                    if (mounted) setLoading(false);
                    return;
                }

                if (session?.user) {
                    if (mounted) setUser(session.user);
                    try {
                        const prof = await fetchProfile(session.user.id);
                        if (mounted) setProfile(prof);
                    } catch (profErr) {
                        console.error('Erro ao carregar perfil:', profErr);
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                        setProfile(null);
                    }
                }
            } catch (err) {
                console.error('Erro ao inicializar sessão:', err);
            } finally {
                clearTimeout(timeout);
                if (mounted) setLoading(false);
            }
        };

        initSession();

        // Listener para mudanças de estado (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    const prof = await fetchProfile(session.user.id);
                    setProfile(prof);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(session.user);
                }
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription?.unsubscribe();
        };
    }, [fetchProfile]);

    /**
     * Login com email e senha.
     * Inclui timeout de 10s para evitar travamento infinito no UI.
     */
    const signIn = async (email, password) => {
        console.log(`[Auth] Tentando login para: ${email}...`);
        try {
            const { data, error } = await Promise.race([
                supabase.auth.signInWithPassword({
                    email,
                    password,
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Tempo de resposta excedido: Supabase Auth não respondeu.')), 10000)
                ),
            ]);

            if (error) {
                console.error('[Auth] Erro de login:', error.message);
                throw error;
            }

            console.log('[Auth] Login efetuado, aguardando perfil...');
            return data;
        } catch (err) {
            console.error('[Auth] Falha no processo de Login:', err.message);
            throw err;
        }
    };

    /**
     * Cadastro com email, senha e nome completo.
     */
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) throw error;
        return data;
    };

    /**
     * Logout — com fallback se supabase.auth.signOut() travar.
     */
    const signOut = async () => {
        try {
            // Tentar signOut com timeout de 3s
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
            ]);
        } catch {
            // Se falhar ou timeout, limpar manualmente
            console.warn('signOut fallback — limpando sessão manualmente');
        }
        // Sempre limpar estado e storage
        setUser(null);
        setProfile(null);
        // Limpar localStorage do Supabase
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
    };

    // Admin Check resiliente (Email do usuário no screenshot)
    const ADMIN_EMAILS = ['caiodaniel163@gmail.com', 'juan@exemplo.com'];
    const isHardcodedAdmin = user && ADMIN_EMAILS.includes(user.email);
    const isAdmin = profile?.role === 'admin' || isHardcodedAdmin;

    // Nome de exibição prioritário: Perfil > Metadata > Email > "Visitante"
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Visitante';

    const value = {
        user,
        profile: profile ? { ...profile, full_name: displayName, role: isAdmin ? 'admin' : (profile.role || 'user') } : null,
        loading,
        isAdmin,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
