import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { WEEKDAYS_CONFIG } from '../../utils/dateUtils';
import Button from '../ui/Button';
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react';

/**
 * Configuração de horário comercial do filmmaker.
 * Permite habilitar/desabilitar dias e definir horários de início/fim.
 */
export default function BusinessHours() {
    const { settings, loading, updateBusinessHours, updateSlotDuration, error } = useSettings();
    const [saving, setSaving] = useState(false);
    const [localHours, setLocalHours] = useState(null);
    const [localDuration, setLocalDuration] = useState(60);
    const [saved, setSaved] = useState(false);

    // Inicializar estado local quando settings carrega
    React.useEffect(() => {
        if (settings) {
            setLocalHours(settings.business_hours);
            setLocalDuration(settings.slot_duration);
        }
    }, [settings]);

    if (loading || !localHours) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    const handleToggleDay = (dayKey) => {
        setLocalHours((prev) => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled },
        }));
        setSaved(false);
    };

    const handleTimeChange = (dayKey, field, value) => {
        setLocalHours((prev) => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], [field]: value },
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateBusinessHours(localHours);
            await updateSlotDuration(localDuration);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Erro ao salvar:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Clock size={20} className="text-purple-400" />
                        Horário Comercial
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Defina os dias e horários em que você está disponível para gravações.
                    </p>
                </div>
            </div>

            {/* Dias da semana */}
            <div className="space-y-2">
                {WEEKDAYS_CONFIG.map((day) => {
                    const config = localHours[day.key];
                    return (
                        <div
                            key={day.key}
                            className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${config.enabled
                                    ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)]'
                                    : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] opacity-60'
                                }`}
                        >
                            {/* Toggle */}
                            <button
                                onClick={() => handleToggleDay(day.key)}
                                className="flex-shrink-0 cursor-pointer"
                            >
                                {config.enabled ? (
                                    <ToggleRight size={28} className="text-purple-400" />
                                ) : (
                                    <ToggleLeft size={28} className="text-[var(--color-text-muted)]" />
                                )}
                            </button>

                            {/* Nome do dia */}
                            <span className={`w-32 text-sm font-medium ${config.enabled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                                }`}>
                                {day.label}
                            </span>

                            {/* Horários */}
                            {config.enabled && (
                                <div className="flex items-center gap-2 text-sm">
                                    <input
                                        type="time"
                                        value={config.start}
                                        onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                                        className="px-2 py-1.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                    />
                                    <span className="text-[var(--color-text-muted)]">até</span>
                                    <input
                                        type="time"
                                        value={config.end}
                                        onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                                        className="px-2 py-1.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Duração do slot */}
            <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)]">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] block mb-2">
                    Duração de cada slot (minutos)
                </label>
                <select
                    value={localDuration}
                    onChange={(e) => { setLocalDuration(parseInt(e.target.value)); setSaved(false); }}
                    className="px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-purple-500/40 cursor-pointer"
                >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                    <option value={240}>4 horas</option>
                </select>
            </div>

            {/* Botão Salvar */}
            <div className="flex items-center gap-3">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Salvar Configurações
                        </>
                    )}
                </Button>
                {saved && (
                    <span className="text-sm text-emerald-400 animate-pulse">
                        ✓ Configurações salvas!
                    </span>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
