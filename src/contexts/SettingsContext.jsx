import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
    business_hours: {
        0: { enabled: false, start: '09:00', end: '13:00' },
        1: { enabled: true, start: '09:00', end: '18:00' },
        2: { enabled: true, start: '09:00', end: '18:00' },
        3: { enabled: true, start: '09:00', end: '18:00' },
        4: { enabled: true, start: '09:00', end: '18:00' },
        5: { enabled: true, start: '09:00', end: '18:00' },
        6: { enabled: false, start: '09:00', end: '13:00' },
    },
    slot_duration: 60,
    blocked_dates: [],
};

const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('settings')
                .select('*')
                .eq('id', SETTINGS_ID)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (data) {
                setSettings(data);
            } else {
                // Se não existir, tenta criar com os defaults
                await supabase.from('settings').insert([{ id: SETTINGS_ID, ...DEFAULT_SETTINGS }]);
                setSettings(DEFAULT_SETTINGS);
            }
        } catch (err) {
            console.error('Erro ao carregar configurações:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            const { error: updateError } = await supabase
                .from('settings')
                .upsert({ id: SETTINGS_ID, ...newSettings, updated_at: new Date() });

            if (updateError) throw updateError;
            setSettings((prev) => ({ ...prev, ...newSettings }));
            return true;
        } catch (err) {
            console.error('Erro ao salvar configurações:', err.message);
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, error, updateSettings, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettingsContext deve ser usado dentro de SettingsProvider');
    return context;
}
