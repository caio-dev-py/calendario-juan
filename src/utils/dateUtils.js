import {
    format,
    parse,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    addDays,
    subDays,
    isSameDay,
    isSameMonth,
    isToday,
    setHours,
    setMinutes,
    addMinutes,
    isBefore,
    isAfter,
    differenceInMinutes,
    parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gera um array de slots de tempo entre start e end com intervalo definido.
 * @param {string} startTime - Horário de início (HH:mm)
 * @param {string} endTime - Horário de fim (HH:mm)
 * @param {number} intervalMinutes - Intervalo entre slots em minutos (padrão: 60)
 * @returns {Array<{start: string, end: string}>} Array de slots de tempo
 */
export function generateTimeSlots(startTime, endTime, intervalMinutes = 60) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let current = new Date(2000, 0, 1, startH, startM);
    const end = new Date(2000, 0, 1, endH, endM);

    while (isBefore(current, end)) {
        const slotEnd = addMinutes(current, intervalMinutes);
        // Não ultrapassar o horário final
        if (isAfter(slotEnd, end)) break;

        slots.push({
            start: format(current, 'HH:mm'),
            end: format(slotEnd, 'HH:mm'),
        });

        current = slotEnd;
    }

    return slots;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem.
 * @param {{start: Date|string, end: Date|string}} a - Primeiro intervalo
 * @param {{start: Date|string, end: Date|string}} b - Segundo intervalo
 * @returns {boolean} true se houver sobreposição
 */
export function isOverlapping(a, b) {
    const aStart = typeof a.start === 'string' ? parseISO(a.start) : a.start;
    const aEnd = typeof a.end === 'string' ? parseISO(a.end) : a.end;
    const bStart = typeof b.start === 'string' ? parseISO(b.start) : b.start;
    const bEnd = typeof b.end === 'string' ? parseISO(b.end) : b.end;

    // Dois intervalos se sobrepõem se um começa antes do outro terminar
    return isBefore(aStart, bEnd) && isBefore(bStart, aEnd);
}

/**
 * Converte um horário local para UTC ISO string.
 * @param {Date} localDate - Data no horário local
 * @returns {string} ISO string em UTC
 */
export function toUTC(localDate) {
    return localDate.toISOString();
}

/**
 * Converte uma string UTC ISO para Date local.
 * @param {string} utcString - ISO string em UTC
 * @returns {Date} Data no horário local
 */
export function fromUTC(utcString) {
    return parseISO(utcString);
}

/**
 * Converte um timestamp do banco de dados para Date local sem conversão de timezone.
 * O banco salva os horários no fuso brasileiro, mas com sufixo 'Z'.
 * Essa função remove o 'Z' para que o JavaScript não trate como UTC.
 * @param {string} dbTimestamp - Timestamp do banco (ex: "2026-03-12T14:00:00.000Z")
 * @returns {Date} Data no horário correto (sem offset de timezone)
 */
export function parseLocalTime(dbTimestamp) {
    if (!dbTimestamp) return new Date();
    // Remove o Z final e qualquer offset (+00:00, etc.) para tratar como horário local
    const cleaned = dbTimestamp.replace(/Z$/i, '').replace(/[+-]\d{2}:\d{2}$/, '');
    return new Date(cleaned);
}

/**
 * Formata um slot de horário para exibição.
 * @param {string} time - Horário no formato HH:mm
 * @returns {string} Horário formatado (ex: "14:00")
 */
export function formatSlot(time) {
    return time;
}

/**
 * Formata uma data para exibição do dia da semana.
 * @param {Date} date - Objeto Date
 * @returns {string} Nome do dia (ex: "Segunda-feira")
 */
export function formatDayName(date) {
    return format(date, 'EEEE', { locale: ptBR });
}

/**
 * Formata uma data completa.
 * @param {Date} date - Objeto Date
 * @returns {string} Data formatada (ex: "27 de fevereiro de 2026")
 */
export function formatFullDate(date) {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Formata uma data para uso no header do calendário.
 * @param {Date} date - Objeto Date
 * @returns {string} Mês e ano (ex: "Fevereiro 2026")
 */
export function formatMonthYear(date) {
    return format(date, 'MMMM yyyy', { locale: ptBR });
}

/**
 * Retorna os dias do mês para exibição no calendário (incluindo buffer).
 * @param {Date} date - Qualquer data dentro do mês desejado
 * @returns {Date[]} Array de datas cobrindo o grid do calendário
 */
export function getCalendarDays(date) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calStart, end: calEnd });
}

/**
 * Gera as horas do dia para a visualização diária.
 * @param {string} startHour - Hora de início (padrão "06:00")
 * @param {string} endHour - Hora de fim (padrão "22:00")
 * @returns {string[]} Array de horas no formato "HH:00"
 */
export function getDayHours(startHour = '06', endHour = '22') {
    const hours = [];
    for (let h = parseInt(startHour); h <= parseInt(endHour); h++) {
        hours.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return hours;
}

/**
 * Mapeamento de cores por tipo de gravação.
 */
export const RECORDING_TYPE_COLORS = {
    'Videoclipe': { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-300', dot: 'bg-purple-500' },
    'Entrevista': { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-300', dot: 'bg-blue-500' },
    'Evento': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', dot: 'bg-emerald-500' },
    'Comercial': { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', dot: 'bg-amber-500' },
    'Casamento': { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-300', dot: 'bg-rose-500' },
    'Outro': { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-300', dot: 'bg-cyan-500' },
};

/**
 * Mapeamento de cores por status.
 */
export const STATUS_COLORS = {
    'Pendente': { bg: 'bg-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-500' },
    'Reservado': { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-500' },
    'Concluído': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-500' },
    'Cancelado': { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-500' },
};

/**
 * Tipos de gravação disponíveis.
 */
export const RECORDING_TYPES = [
    'Casamento',
    'Ensaio',
    'Corporativo',
    'Aniversário',
    'Evento',
    'Outro',
];

/**
 * Nomes dos dias da semana para o calendário.
 */
export const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Dias da semana para configuração.
 */
export const WEEKDAYS_CONFIG = [
    { key: 0, label: 'Domingo' },
    { key: 1, label: 'Segunda-feira' },
    { key: 2, label: 'Terça-feira' },
    { key: 3, label: 'Quarta-feira' },
    { key: 4, label: 'Quinta-feira' },
    { key: 5, label: 'Sexta-feira' },
    { key: 6, label: 'Sábado' },
];

// Re-export commonly used date-fns functions
export {
    format,
    parse,
    startOfMonth,
    endOfMonth,
    addMonths,
    subMonths,
    addDays,
    subDays,
    isSameDay,
    isSameMonth,
    isToday,
    parseISO,
    differenceInMinutes,
};
