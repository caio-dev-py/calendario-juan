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
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Perfil não encontrado — criar automaticamente (fallback)
                console.warn('Perfil não encontrado, criando automaticamente...');
                const { data: { user: authUser } } = await supabase.auth.getUser();

                const newProfile = {
                    id: userId,
                    email: authUser?.email || '',
                    full_name: authUser?.user_metadata?.full_name || '',
                    role: 'user',
                };

                const { data: created, error: insertError } = await supabase
                    .from('profiles')
                    .upsert(newProfile)
                    .select()
                    .single();

                if (insertError) {
                    console.error('Erro ao criar perfil:', insertError.message);
                    return newProfile; // retorna local como fallback
                }
                return created;
            }

            if (error) {
                console.error('Erro ao buscar perfil:', error.message);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
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
     */
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
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

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
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
