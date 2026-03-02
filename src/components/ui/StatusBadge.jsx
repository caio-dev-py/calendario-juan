import React from 'react';
import { STATUS_COLORS } from '../../utils/dateUtils';

/**
 * Badge de status colorido para agendamentos.
 * @param {Object} props
 * @param {'Pendente'|'Reservado'|'Concluído'|'Cancelado'} props.status - Status atual
 */
export default function StatusBadge({ status, className = '' }) {
    const colors = STATUS_COLORS[status] || STATUS_COLORS['Pendente'];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full tracking-wide backdrop-blur-sm ${colors.bg} ${colors.text} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shadow-[0_0_4px_currentColor]`} />
            {status}
        </span>
    );
}
