import React, { useState, useEffect } from 'react';
import { format } from '../../utils/dateUtils';
import { useAvailability } from '../../hooks/useAvailability';
import { Clock, Check, CalendarDays } from 'lucide-react';

/**
 * Componente para seleção de slot de horário disponível.
 */
export default function SlotPicker({ selectedDate, selectedSlot, onSelectSlot }) {
    const { availability, loading, error, fetchAvailability } = useAvailability();

    useEffect(() => {
        if (selectedDate) {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            fetchAvailability(dateStr);
        }
    }, [selectedDate, fetchAvailability]);

    if (!selectedDate) {
        return (
            <div className="text-center py-16">
                <CalendarDays size={40} className="mx-auto mb-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-400">Selecione uma data no calendário acima</p>
                <p className="text-[12px] text-gray-600 mt-1.5">Os horários disponíveis aparecerão aqui</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500">Carregando horários...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 text-red-400">
                <p className="text-sm">Erro ao carregar horários: {error}</p>
            </div>
        );
    }

    if (!availability || !availability.available) {
        return (
            <div className="text-center py-16">
                <div className="text-4xl mb-3">🚫</div>
                <p className="text-sm text-gray-400">
                    {availability?.reason || 'Data não disponível para agendamento.'}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300">
                    Horários disponíveis
                </span>
                <span className="text-[11px] text-gray-500 font-medium bg-white/[0.03] px-2.5 py-1 rounded-lg">
                    {availability.availableCount} de {availability.totalSlots} livres
                </span>
            </div>

            {availability.slots.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-sm text-gray-500">
                        Todos os horários estão ocupados neste dia.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availability.slots.map((slot) => {
                        const slotKey = `${slot.start}-${slot.end}`;
                        const isSelected = selectedSlot === slotKey;

                        return (
                            <button
                                key={slotKey}
                                onClick={() => onSelectSlot(slotKey, slot)}
                                className={`relative flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out cursor-pointer border
                  ${isSelected
                                        ? 'bg-purple-500/[0.12] border-purple-500/30 text-purple-300 ring-1 ring-purple-500/20 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.25)]'
                                        : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04] hover:border-white/[0.10] hover:text-gray-200'
                                    }
                `}
                            >
                                {isSelected && <Check size={14} className="text-purple-400" />}
                                <span>{slot.start} - {slot.end}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
