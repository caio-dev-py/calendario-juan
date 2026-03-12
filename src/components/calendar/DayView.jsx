import React from 'react';
import {
    getDayHours,
    format,
    parseLocalTime,
    RECORDING_TYPE_COLORS,
    STATUS_COLORS,
} from '../../utils/dateUtils';
import StatusBadge from '../ui/StatusBadge';

/**
 * Visualização diária do calendário com timeline de horas.
 */
export default function DayView({
    currentDate,
    bookings = [],
    onBookingClick,
    businessHours,
}) {
    const hours = getDayHours('06', '22');

    const getBookingPosition = (booking) => {
        const start = parseLocalTime(booking.start_time);
        const end = parseLocalTime(booking.end_time);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;

        const top = (startHour - 6) * 80;
        const height = Math.max((endHour - startHour) * 80, 30);

        return { top, height };
    };

    const dayBookings = bookings.filter((booking) => {
        const bookingDate = parseLocalTime(booking.start_time);
        return (
            bookingDate.getFullYear() === currentDate.getFullYear() &&
            bookingDate.getMonth() === currentDate.getMonth() &&
            bookingDate.getDate() === currentDate.getDate()
        );
    });

    return (
        <div className="bg-[var(--color-bg-secondary)]/60 rounded-2xl border border-white/[0.05] overflow-hidden backdrop-blur-sm">
            {/* Header com resumo do dia */}
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <span className="text-sm text-gray-300">
                    {dayBookings.length} agendamento{dayBookings.length !== 1 ? 's' : ''} hoje
                </span>
                {businessHours && (
                    <span className="text-[11px] text-gray-500 font-medium bg-white/[0.03] px-2.5 py-1 rounded-lg">
                        {businessHours.start} – {businessHours.end}
                    </span>
                )}
            </div>

            {/* Timeline */}
            <div className="relative overflow-y-auto max-h-[calc(100vh-260px)]">
                <div className="relative" style={{ height: `${hours.length * 80}px` }}>
                    {/* Linhas de hora */}
                    {hours.map((hour, index) => {
                        const isWorkHour = businessHours
                            ? hour >= businessHours.start && hour < businessHours.end
                            : false;

                        return (
                            <div
                                key={hour}
                                className={`absolute left-0 right-0 border-t border-white/[0.04] ${isWorkHour ? 'bg-purple-900/[0.03]' : ''
                                    }`}
                                style={{ top: `${index * 80}px`, height: '80px' }}
                            >
                                <span className="absolute left-3 -top-2.5 text-[11px] font-medium text-gray-500 bg-[var(--color-bg-secondary)] px-1.5 select-none">
                                    {hour}
                                </span>
                                <div
                                    className="absolute left-16 right-3 border-t border-white/[0.025]"
                                    style={{ top: '40px' }}
                                />
                            </div>
                        );
                    })}

                    {/* Blocos de agendamentos */}
                    {dayBookings.map((booking) => {
                        const { top, height } = getBookingPosition(booking);
                        const typeColors = RECORDING_TYPE_COLORS[booking.recording_type] || RECORDING_TYPE_COLORS['Outro'];

                        return (
                            <button
                                key={booking.id}
                                onClick={() => onBookingClick && onBookingClick(booking)}
                                className={`absolute left-16 right-3 rounded-xl border cursor-pointer transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20 overflow-hidden ${typeColors.bg} ${typeColors.border}`}
                                style={{ top: `${top}px`, height: `${height}px`, minHeight: '30px' }}
                            >
                                <div className="p-3 h-full flex flex-col justify-between">
                                    <div>
                                        <div className={`text-sm font-semibold text-white/90 truncate`}>
                                            {booking.client_name}
                                        </div>
                                        <div className="text-xs text-gray-300/70 truncate">
                                            {format(parseLocalTime(booking.start_time), 'HH:mm')} - {format(parseLocalTime(booking.end_time), 'HH:mm')} · {booking.recording_type}
                                        </div>
                                    </div>
                                    {height > 50 && (
                                        <div className="flex items-center justify-between">
                                            {booking.location && (
                                                <span className="text-[10px] text-gray-400 truncate">
                                                    📍 {booking.location}
                                                </span>
                                            )}
                                            <StatusBadge status={booking.status} />
                                        </div>
                                    )}
                                </div>

                                {/* Left accent border */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${typeColors.dot}`}
                                />
                            </button>
                        );
                    })}

                    {/* Indicador de hora atual */}
                    <CurrentTimeIndicator />
                </div>
            </div>
        </div>
    );
}

/**
 * Linha vermelha indicando a hora atual na timeline.
 */
function CurrentTimeIndicator() {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const top = (currentHour - 6) * 80;

    if (top < 0 || top > 16 * 80) return null;

    return (
        <div
            className="absolute left-12 right-0 z-10 pointer-events-none"
            style={{ top: `${top}px` }}
        >
            <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] -ml-1.5" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500/80 to-red-500/20" />
            </div>
        </div>
    );
}
