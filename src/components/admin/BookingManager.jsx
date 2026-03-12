import React, { useState, useEffect } from 'react';
import { useBookings } from '../../hooks/useBookings';
import {
    format,
    parseLocalTime,
    RECORDING_TYPE_COLORS,
} from '../../utils/dateUtils';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import {
    LayoutDashboard,
    Trash2,
    MapPin,
    FileText,
    Filter,
    RefreshCw,
} from 'lucide-react';

/**
 * Painel de gerenciamento de agendamentos.
 * Lista todos os agendamentos com filtros e ações de status.
 */
export default function BookingManager() {
    const { bookings, loading, fetchBookings, updateStatus, deleteBooking, error } = useBookings();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const filteredBookings = statusFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateStatus(id, newStatus);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
        try {
            await deleteBooking(id);
            setShowModal(false);
        } catch (err) {
            console.error('Erro ao excluir:', err);
        }
    };

    const openBookingDetail = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const statuses = ['all', 'Pendente', 'Reservado', 'Concluído', 'Cancelado'];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <LayoutDashboard size={24} className="text-purple-400" />
                        Gerenciar Agendamentos
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {bookings.length} agendamento{bookings.length !== 1 ? 's' : ''} no total
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchBookings()}>
                    <RefreshCw size={14} />
                    Atualizar
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                <Filter size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${statusFilter === status
                            ? 'bg-purple-600/20 text-purple-300'
                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                            }`}
                    >
                        {status === 'all' ? 'Todos' : status}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Lista vazia */}
            {!loading && filteredBookings.length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                    <LayoutDashboard size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum agendamento encontrado.</p>
                </div>
            )}

            {/* Lista de agendamentos */}
            {!loading && filteredBookings.length > 0 && (
                <div className="space-y-2">
                    {filteredBookings.map((booking) => {
                        const typeColors = RECORDING_TYPE_COLORS[booking.recording_type] || RECORDING_TYPE_COLORS['Outro'];
                        return (
                            <button
                                key={booking.id}
                                onClick={() => openBookingDetail(booking)}
                                className={`w-full text-left p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer group`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`w-1 h-12 rounded-full flex-shrink-0 ${typeColors.dot}`} />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                                    {booking.client_name}
                                                </span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}>
                                                    {booking.recording_type}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                📅 {parseLocalTime(booking.start_time).toLocaleDateString('pt-BR')} · {format(parseLocalTime(booking.start_time), 'HH:mm')} - {format(parseLocalTime(booking.end_time), 'HH:mm')}
                                            </div>
                                            {booking.location && (
                                                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                    📍 {booking.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Modal de detalhes */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Detalhes do Agendamento"
                size="md"
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <InfoRow label="Cliente" value={selectedBooking.client_name} />
                            <InfoRow label="Tipo" value={selectedBooking.recording_type} />
                            <InfoRow
                                label="Data"
                                value={parseLocalTime(selectedBooking.start_time).toLocaleDateString('pt-BR', {
                                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                                })}
                            />
                            <InfoRow
                                label="Horário"
                                value={`${format(parseLocalTime(selectedBooking.start_time), 'HH:mm')} - ${format(parseLocalTime(selectedBooking.end_time), 'HH:mm')}`}
                            />
                            {selectedBooking.location && (
                                <InfoRow label="Local" value={selectedBooking.location} icon={<MapPin size={14} />} />
                            )}
                            {selectedBooking.description && (
                                <InfoRow label="Descrição" value={selectedBooking.description} icon={<FileText size={14} />} />
                            )}
                            <div>
                                <span className="text-xs text-[var(--color-text-muted)]">Status</span>
                                <div className="mt-1">
                                    <StatusBadge status={selectedBooking.status} />
                                </div>
                            </div>
                        </div>

                        {/* Ações de status */}
                        <div className="pt-4 border-t border-[var(--color-border)]">
                            <p className="text-xs text-[var(--color-text-muted)] mb-2">Alterar status:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Pendente', 'Reservado', 'Concluído', 'Cancelado'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={selectedBooking.status === status ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleStatusChange(selectedBooking.id, status)}
                                        disabled={selectedBooking.status === status}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Excluir */}
                        <div className="pt-3">
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(selectedBooking.id)}
                            >
                                <Trash2 size={14} />
                                Excluir Agendamento
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {error && (
                <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300 z-50">
                    {error}
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, icon }) {
    return (
        <div>
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                {icon}
                {label}
            </span>
            <p className="text-sm text-[var(--color-text-primary)] mt-0.5">{value}</p>
        </div>
    );
}
