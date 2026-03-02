import React, { useState, useEffect, useCallback } from 'react';
import { getToken, SUPABASE_URL, SUPABASE_KEY } from '../config/supabaseHelper';
import {
    addMonths,
    subMonths,
    addDays,
    subDays,
    format,
    startOfMonth,
    endOfMonth,
    isSameDay,
    RECORDING_TYPE_COLORS,
} from '../utils/dateUtils';
import { useSettings } from '../hooks/useSettings';
import CalendarHeader from '../components/calendar/CalendarHeader';
import MonthView from '../components/calendar/MonthView';
import DayView from '../components/calendar/DayView';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { Calendar, MapPin, FileText, User, Film } from 'lucide-react';

/**
 * Página principal do calendário do filmmaker.
 */
export default function CalendarPage() {
    const { settings } = useSettings();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const start = format(startOfMonth(currentDate), "yyyy-MM-dd'T'00:00:00.000'Z'");
            const end = format(endOfMonth(currentDate), "yyyy-MM-dd'T'23:59:59.999'Z'");

            const token = getToken();
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);

            const headers = { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const url = `${SUPABASE_URL}/rest/v1/horarios_marcados?select=*&start_time=gte.${encodeURIComponent(start)}&start_time=lte.${encodeURIComponent(end)}&order=start_time.asc`;
            const res = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timer);

            if (res.ok) {
                const data = await res.json();
                setBookings(Array.isArray(data) ? data : []);
            } else {
                console.error('Calendar fetch error:', res.status);
                setBookings([]);
            }
        } catch (err) {
            if (err.name === 'AbortError') console.warn('Calendar fetch timeout');
            else console.error('Erro ao buscar agendamentos:', err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Navegação
    const handlePrev = () => {
        if (view === 'month') {
            setCurrentDate((d) => subMonths(d, 1));
        } else {
            setSelectedDate((d) => subDays(d, 1));
            setCurrentDate((d) => subDays(d, 1));
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate((d) => addMonths(d, 1));
        } else {
            setSelectedDate((d) => addDays(d, 1));
            setCurrentDate((d) => addDays(d, 1));
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setView('day');
        setCurrentDate(date);
    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    // Business hours do dia selecionado
    const dayOfWeek = selectedDate.getDay();
    const dayBusinessHours = settings?.business_hours?.[dayOfWeek];

    return (
        <div className="flex-1">
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/[0.12] ring-1 ring-purple-500/20">
                    <Calendar size={20} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-[-0.01em]">Calendário</h1>
                </div>
                {loading && (
                    <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin ml-2" />
                )}
            </div>

            {/* Legenda de tipos */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                {Object.entries(RECORDING_TYPE_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        {type}
                    </div>
                ))}
            </div>

            {/* Calendar header + view */}
            <CalendarHeader
                currentDate={view === 'day' ? selectedDate : currentDate}
                view={view}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
                onViewChange={handleViewChange}
            />

            {view === 'month' ? (
                <MonthView
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    bookings={bookings}
                    onSelectDate={handleSelectDate}
                    blockedDates={settings?.blocked_dates || []}
                />
            ) : (
                <DayView
                    currentDate={selectedDate}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                    businessHours={dayBusinessHours?.enabled ? dayBusinessHours : null}
                />
            )}

            {/* Modal de detalhes */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Detalhes do Agendamento"
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Cliente:</span>
                            <span className="text-sm font-medium text-white">{selectedBooking.client_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Film size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Tipo:</span>
                            <span className="text-sm font-medium text-white">{selectedBooking.recording_type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Horário:</span>
                            <span className="text-sm font-medium text-white">
                                {format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}
                            </span>
                        </div>
                        {selectedBooking.location && (
                            <div className="flex items-center gap-3">
                                <MapPin size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-500">Local:</span>
                                <span className="text-sm font-medium text-white">{selectedBooking.location}</span>
                            </div>
                        )}
                        {selectedBooking.description && (
                            <div className="flex items-start gap-3">
                                <FileText size={14} className="text-gray-500 mt-0.5" />
                                <div>
                                    <span className="text-sm text-gray-500">Descrição:</span>
                                    <p className="text-sm text-gray-300 mt-1">{selectedBooking.description}</p>
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                            <StatusBadge status={selectedBooking.status} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
