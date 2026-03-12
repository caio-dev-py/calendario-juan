import React from 'react';
import {
    getCalendarDays,
    isSameDay,
    isSameMonth,
    isToday,
    format,
    parseLocalTime,
    WEEKDAY_NAMES,
    RECORDING_TYPE_COLORS,
    STATUS_COLORS,
} from '../../utils/dateUtils';

/**
 * Visualização mensal do calendário em formato de grade.
 */
export default function MonthView({
    currentDate,
    selectedDate,
    bookings = [],
    onSelectDate,
    blockedDates = [],
}) {
    const days = getCalendarDays(currentDate);

    const getBookingsForDay = (day) => {
        return bookings.filter((booking) => {
            const bookingDate = parseLocalTime(booking.start_time);
            return isSameDay(bookingDate, day);
        });
    };

    const isBlockedDate = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return blockedDates.some((d) => d.date === dateStr);
    };

    return (
        <div className="bg-[var(--color-bg-secondary)]/60 rounded-2xl border border-white/[0.05] overflow-hidden backdrop-blur-sm">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b border-white/[0.04]">
                {WEEKDAY_NAMES.map((name) => (
                    <div
                        key={name}
                        className="py-3.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                    >
                        {name}
                    </div>
                ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7">
                {days.map((day, index) => {
                    const dayBookings = getBookingsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    const isBlocked = isBlockedDate(day);

                    return (
                        <button
                            key={index}
                            onClick={() => onSelectDate(day)}
                            className={`relative min-h-[80px] sm:min-h-[100px] p-2 border-b border-r border-white/[0.03] text-left transition-all duration-200 ease-out cursor-pointer group
                ${!isCurrentMonth ? 'opacity-25' : ''}
                ${isSelected ? 'bg-purple-500/[0.08] ring-1 ring-purple-500/30' : 'hover:bg-white/[0.02]'}
                ${isBlocked ? 'bg-red-900/[0.06]' : ''}
              `}
                        >
                            {/* Número do dia */}
                            <span
                                className={`inline-flex items-center justify-center w-7 h-7 text-[13px] font-medium rounded-full transition-all duration-200
                  ${isTodayDate ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.4)]' : ''}
                  ${isSelected && !isTodayDate ? 'text-purple-300' : ''}
                  ${!isTodayDate && !isSelected ? 'text-gray-400 group-hover:text-gray-200' : ''}
                `}
                            >
                                {format(day, 'd')}
                            </span>

                            {/* Indicador de bloqueado */}
                            {isBlocked && (
                                <div className="absolute top-2 right-2">
                                    <span className="text-[10px] text-red-400/80 font-medium">Bloqueado</span>
                                </div>
                            )}

                            {/* Tags de agendamentos */}
                            {dayBookings.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                    {dayBookings.slice(0, 3).map((booking) => {
                                        const typeColors = RECORDING_TYPE_COLORS[booking.recording_type] || RECORDING_TYPE_COLORS['Outro'];
                                        return (
                                            <div
                                                key={booking.id}
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold truncate ${typeColors.bg} text-white/90 border ${typeColors.border}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeColors.dot}`} />
                                                <span className="truncate hidden sm:inline">
                                                    {format(parseLocalTime(booking.start_time), 'HH:mm')} {booking.client_name}
                                                </span>
                                                <span className="truncate sm:hidden">
                                                    {format(parseLocalTime(booking.start_time), 'HH:mm')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {dayBookings.length > 3 && (
                                        <span className="text-[10px] text-gray-500 pl-1">
                                            +{dayBookings.length - 3} mais
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
