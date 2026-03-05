import { useState, useCallback } from 'react';
import { supabaseRest } from '../config/supabaseHelper';
import { useSettings } from './useSettings';
import { generateTimeSlots } from '../utils/dateUtils';

/**
 * Hook para gerenciar a disponibilidade de horários para uma data específica.
 */
export function useAvailability() {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { settings, loading: settingsLoading } = useSettings();

    const fetchAvailability = useCallback(async (dateStr) => {
        if (!settings) return;

        setLoading(true);
        setError(null);

        try {
            const date = new Date(dateStr + 'T12:00:00'); // Evita problemas de timezone
            const dayOfWeek = date.getDay(); // 0 (Domingo) a 6 (Sábado)
            const dayConfig = settings.business_hours?.[dayOfWeek];

            // Se o dia não estiver habilitado, retorna indisponível
            if (!dayConfig || !dayConfig.enabled) {
                const result = {
                    date: dateStr,
                    available: false,
                    reason: 'Este dia não possui horário de atendimento.',
                    slots: [],
                    totalSlots: 0,
                    availableCount: 0
                };
                setAvailability(result);
                return result;
            }

            // Gera todos os slots baseados na configuração do dia
            const allSlots = generateTimeSlots(
                dayConfig.start,
                dayConfig.end,
                settings.slot_duration || 60
            );

            const dayStart = `${dateStr}T00:00:00.000Z`;
            const dayEnd = `${dateStr}T23:59:59.999Z`;

            const { data: existingBookings, error: apiError } = await supabaseRest(
                `horarios_marcados?select=start_time,end_time,status&start_time=gte.${encodeURIComponent(dayStart)}&start_time=lte.${encodeURIComponent(dayEnd)}&status=neq.Cancelado`,
                { timeoutMs: 4000 }
            );

            const booked = Array.isArray(existingBookings) ? existingBookings : [];

            // Filtra os slots ocupados
            const availableSlots = allSlots.filter((slot) => {
                const sStart = new Date(`${dateStr}T${slot.start}:00.000Z`).getTime();
                const sEnd = new Date(`${dateStr}T${slot.end}:00.000Z`).getTime();

                return !booked.some((b) => {
                    const bS = new Date(b.start_time).getTime();
                    const bE = new Date(b.end_time).getTime();
                    // Sobreposição: o slot começa antes da reserva terminar E termina depois da reserva começar
                    return sStart < bE && sEnd > bS;
                });
            });

            const result = {
                date: dateStr,
                available: true,
                businessHours: dayConfig,
                totalSlots: allSlots.length,
                availableCount: availableSlots.length,
                bookedCount: allSlots.length - availableSlots.length,
                slots: availableSlots,
            };

            setAvailability(result);
            return result;
        } catch (err) {
            console.error('fetchAvailability:', err.message);
            setError('Falha ao verificar disponibilidade.');
            return null;
        } finally {
            setLoading(false);
        }
    }, [settings]);

    return {
        availability,
        loading: loading || settingsLoading,
        error,
        fetchAvailability,
        setError
    };
}
