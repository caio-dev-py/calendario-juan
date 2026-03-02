import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';
import { formatMonthYear, formatFullDate } from '../../utils/dateUtils';
import Button from '../ui/Button';

/**
 * Header do calendário com controles de navegação e toggle de visualização.
 */
export default function CalendarHeader({
    currentDate,
    view,
    onPrev,
    onNext,
    onToday,
    onViewChange,
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
                {/* Botões de navegação */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onPrev}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all duration-300 ease-out cursor-pointer active:scale-[0.95]"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={onNext}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all duration-300 ease-out cursor-pointer active:scale-[0.95]"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Data atual */}
                <h2 className="text-xl font-bold text-white capitalize tracking-[-0.01em]">
                    {view === 'month' ? formatMonthYear(currentDate) : formatFullDate(currentDate)}
                </h2>

                <Button variant="ghost" size="sm" onClick={onToday}>
                    Hoje
                </Button>
            </div>

            {/* Toggle de visualização */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                <button
                    onClick={() => onViewChange('month')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 ease-out cursor-pointer ${view === 'month'
                        ? 'bg-purple-500/[0.15] text-purple-300 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                        }`}
                >
                    <CalendarDays size={14} />
                    Mês
                </button>
                <button
                    onClick={() => onViewChange('day')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 ease-out cursor-pointer ${view === 'day'
                        ? 'bg-purple-500/[0.15] text-purple-300 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                        }`}
                >
                    <Clock size={14} />
                    Dia
                </button>
            </div>
        </div>
    );
}
