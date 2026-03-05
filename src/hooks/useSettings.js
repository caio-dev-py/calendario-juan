import { useSettingsContext } from '../contexts/SettingsContext';

/**
 * Hook para gerenciamento de configurações.
 * Agora utiliza o SettingsContext para persistência global.
 */
export function useSettings() {
    const { settings, loading, error, updateSettings, refreshSettings } = useSettingsContext();

    /**
     * Atualiza o horário comercial.
     */
    const updateBusinessHours = async (businessHours) => {
        return updateSettings({ business_hours: businessHours });
    };

    /**
     * Atualiza a duração do slot.
     */
    const updateSlotDuration = async (duration) => {
        return updateSettings({ slot_duration: duration });
    };

    /**
     * Adiciona uma data bloqueada.
     */
    const addBlockedDate = async (date, reason) => {
        const newBlocked = [...(settings?.blocked_dates || []), { date, reason }];
        return updateSettings({ blocked_dates: newBlocked });
    };

    /**
     * Remove uma data bloqueada.
     */
    const removeBlockedDate = async (date) => {
        const newBlocked = (settings?.blocked_dates || []).filter((d) => d.date !== date);
        return updateSettings({ blocked_dates: newBlocked });
    };

    return {
        settings,
        loading,
        error,
        fetchSettings: refreshSettings,
        updateBusinessHours,
        updateSlotDuration,
        addBlockedDate,
        removeBlockedDate,
    };
}
