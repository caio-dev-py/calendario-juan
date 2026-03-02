import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import { CalendarOff, Plus, Trash2, AlertCircle } from 'lucide-react';

/**
 * Gerenciamento de datas bloqueadas (feriados, folgas).
 */
export default function BlockedDates() {
    const { settings, loading, addBlockedDate, removeBlockedDate, error, setError } = useSettings();
    const [newDate, setNewDate] = useState('');
    const [reason, setReason] = useState('');
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        if (!newDate) return;
        setAdding(true);
        setError(null);

        try {
            await addBlockedDate(newDate, reason);
            setNewDate('');
            setReason('');
        } catch (err) {
            // Erro já tratado pelo hook
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (date) => {
        try {
            await removeBlockedDate(date);
        } catch (err) {
            console.error('Erro ao remover data:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    const blockedDates = settings?.blocked_dates || [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <CalendarOff size={20} className="text-rose-400" />
                    Datas Bloqueadas
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Bloqueie feriados, férias ou dias de folga para que não apareçam como disponíveis.
                </p>
            </div>

            {/* Formulário de adição */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)]">
                <div className="flex-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)] block mb-1">Data</label>
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)] block mb-1">Motivo (opcional)</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Feriado Nacional"
                        className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                </div>
                <Button
                    variant="primary"
                    size="md"
                    onClick={handleAdd}
                    disabled={adding || !newDate}
                >
                    <Plus size={16} />
                    Bloquear
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* Lista de datas bloqueadas */}
            {blockedDates.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)]">
                    <CalendarOff size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhuma data bloqueada.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {blockedDates
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map((blocked) => (
                            <div
                                key={blocked.date}
                                className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)] group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <div>
                                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                            {new Date(blocked.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                                weekday: 'long',
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        {blocked.reason && (
                                            <span className="text-xs text-[var(--color-text-muted)] ml-2">
                                                — {blocked.reason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(blocked.date)}
                                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
