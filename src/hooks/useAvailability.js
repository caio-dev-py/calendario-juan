import { useState, useCallback } from 'react';
import { supabaseRest, SUPABASE_URL, SUPABASE_KEY, getToken } from '../config/supabaseHelper';

const DEFAULT_BUSINESS_HOURS = { start: '09:00', end: '18:00' };

function generateAllSlots() {
    const startHour = parseInt(DEFAULT_BUSINESS_HOURS.start.split(':')[0], 10);
    const endHour = parseInt(DEFAULT_BUSINESS_HOURS.end.split(':')[0], 10);
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
        slots.push({
            start: `${String(h).padStart(2, '0')}:00`,
            end: `${String(h + 1).padStart(2, '0')}:00`,
        });
    }
    return slots;
}

function buildResult(date, allSlots, availableSlots) {
    return {
        date,
        available: true,
        businessHours: DEFAULT_BUSINESS_HOURS,
        totalSlots: allSlots.length,
        availableCount: availableSlots.length,
        bookedCount: allSlots.length - availableSlots.length,
        slots: availableSlots,
    };
}

export function useAvailability() {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAvailability = useCallback(async (date) => {
        setLoading(true);
        setError(null);

        const allSlots = generateAllSlots();

        try {
            const dayStart = `${date}T00:00:00.000Z`;
            const dayEnd = `${date}T23:59:59.999Z`;

            const { data: existingBookings, error: apiError } = await supabaseRest(
                `horarios_marcados?select=start_time,end_time,status&start_time=gte.${encodeURIComponent(dayStart)}&start_time=lte.${encodeURIComponent(dayEnd)}&status=neq.Cancelado`,
                { timeoutMs: 4000 }
            );

            if (apiError) {
                console.warn('Availability error:', apiError.message);
                const result = buildResult(date, allSlots, allSlots);
                setAvailability(result);
                return result;
            }

            const booked = Array.isArray(existingBookings) ? existingBookings : [];

            const availableSlots = allSlots.filter((slot) => {
                const sStart = new Date(`${date}T${slot.start}:00.000Z`).getTime();
                const sEnd = new Date(`${date}T${slot.end}:00.000Z`).getTime();
                return !booked.some((b) => {
                    const bS = new Date(b.start_time).getTime();
                    const bE = new Date(b.end_time).getTime();
                    return sStart < bE && sEnd > bS;
                });
            });

            const result = buildResult(date, allSlots, availableSlots);
            setAvailability(result);
            return result;
        } catch (err) {
            console.error('fetchAvailability:', err.message);
            const result = buildResult(date, allSlots, allSlots);
            setAvailability(result);
            return result;
        } finally {
            setLoading(false);
        }
    }, []);

    return { availability, loading, error, fetchAvailability, setError };
}
