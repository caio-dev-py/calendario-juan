import { useState, useCallback } from 'react';
import { supabaseRest, getToken } from '../config/supabaseHelper';

/**
 * Hook para gerenciamento de agendamentos via Supabase REST API.
 * Todas as queries têm timeout garantido.
 */
export function useBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBookings = useCallback(async (startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            let queryParams = 'select=*&order=start_time.asc';
            if (startDate) queryParams += `&start_time=gte.${encodeURIComponent(startDate)}`;
            if (endDate) queryParams += `&end_time=lte.${encodeURIComponent(endDate)}`;

            const { data, error: apiError } = await supabaseRest(
                `horarios_marcados?${queryParams}`
            );

            if (apiError) throw new Error(apiError.message);
            setBookings(Array.isArray(data) ? data : []);
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error('fetchBookings:', err.message);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createBooking = useCallback(async (bookingData) => {
        setLoading(true);
        setError(null);
        try {
            // Ler user_id do token JWT (decodifica payload)
            let userId = null;
            const token = getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.sub || null;
                } catch { /* ignore */ }
            }

            const insertData = {
                user_id: userId,
                client_name: bookingData.client_name,
                client_email: bookingData.client_email || '',
                client_phone: bookingData.client_phone || '',
                recording_type: bookingData.recording_type || 'Outro',
                title: bookingData.title || '',
                description: bookingData.description || '',
                location: bookingData.location || '',
                start_time: bookingData.start_time,
                end_time: bookingData.end_time,
                status: bookingData.status || 'Pendente',
                notes: bookingData.notes || '',
            };

            console.log('Creating booking:', insertData);

            const { data, error: apiError } = await supabaseRest(
                'horarios_marcados',
                { method: 'POST', body: insertData, timeoutMs: 8000 }
            );

            if (apiError) {
                console.error('Insert error:', apiError);
                throw new Error(apiError.message);
            }

            const created = Array.isArray(data) ? data[0] : data;
            if (created) setBookings((prev) => [...prev, created]);
            return created;
        } catch (err) {
            console.error('createBooking:', err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (id, status) => {
        setError(null);
        try {
            const { data, error: apiError } = await supabaseRest(
                `horarios_marcados?id=eq.${id}`,
                { method: 'PATCH', body: { status } }
            );

            if (apiError) throw new Error(apiError.message);
            const updated = Array.isArray(data) ? data[0] : data;
            if (updated) setBookings((prev) => prev.map((b) => b.id === id ? updated : b));
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteBooking = useCallback(async (id) => {
        setError(null);
        try {
            const { error: apiError } = await supabaseRest(
                `horarios_marcados?id=eq.${id}`,
                { method: 'DELETE' }
            );

            if (apiError) throw new Error(apiError.message);
            setBookings((prev) => prev.filter((b) => b.id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        createBooking,
        updateStatus,
        deleteBooking,
        setError,
    };
}
