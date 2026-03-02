import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

/**
 * Configurações padrão do filmmaker.
 * Usadas como fallback quando não há tabela de settings no Supabase.
 */
const DEFAULT_SETTINGS = {
    business_hours: {
        monday: { enabled: true, start: '09:00', end: '18:00' },
        tuesday: { enabled: true, start: '09:00', end: '18:00' },
        wednesday: { enabled: true, start: '09:00', end: '18:00' },
        thursday: { enabled: true, start: '09:00', end: '18:00' },
        friday: { enabled: true, start: '09:00', end: '18:00' },
        saturday: { enabled: false, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '13:00' },
    },
    slot_duration: 60,
    blocked_dates: [],
};

/**
 * Hook para gerenciamento de configurações.
 * Usa configurações padrão embutidas (sem depender do Express backend).
 */
export function useSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Carrega configurações (por enquanto, usa os defaults).
     */
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Carrega os defaults (futuramente pode vir de uma tabela Supabase)
            setSettings(DEFAULT_SETTINGS);
            return DEFAULT_SETTINGS;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Atualiza o horário comercial.
     */
    const updateBusinessHours = useCallback(async (businessHours) => {
        setError(null);
        try {
            setSettings((prev) => ({ ...prev, business_hours: businessHours }));
            return { ...settings, business_hours: businessHours };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [settings]);

    /**
     * Atualiza a duração do slot.
     */
    const updateSlotDuration = useCallback(async (duration) => {
        setError(null);
        try {
            setSettings((prev) => ({ ...prev, slot_duration: duration }));
            return { ...settings, slot_duration: duration };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [settings]);

    /**
     * Adiciona uma data bloqueada.
     */
    const addBlockedDate = useCallback(async (date, reason) => {
        setError(null);
        try {
            const newBlocked = [...(settings?.blocked_dates || []), { date, reason }];
            setSettings((prev) => ({ ...prev, blocked_dates: newBlocked }));
            return { ...settings, blocked_dates: newBlocked };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [settings]);

    /**
     * Remove uma data bloqueada.
     */
    const removeBlockedDate = useCallback(async (date) => {
        setError(null);
        try {
            const newBlocked = (settings?.blocked_dates || []).filter((d) => d.date !== date);
            setSettings((prev) => ({ ...prev, blocked_dates: newBlocked }));
            return { ...settings, blocked_dates: newBlocked };
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [settings]);

    // Carregar configurações ao montar
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateBusinessHours,
        updateSlotDuration,
        addBlockedDate,
        removeBlockedDate,
        setError,
    };
}
