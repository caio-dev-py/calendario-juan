import SettingsModel from '../models/settings.js';
import BookingModel from '../models/booking.js';

/**
 * Controller para cálculo de disponibilidade.
 * Combina horário comercial com agendamentos existentes
 * para determinar slots livres.
 */
const availabilityController = {
    /**
     * GET /api/availability?date=YYYY-MM-DD
     * Calcula e retorna os slots disponíveis para uma data específica.
     *
     * Algoritmo:
     * 1. Verificar se o dia da semana está habilitado no horário comercial
     * 2. Verificar se a data não está bloqueada
     * 3. Gerar todos os slots possíveis baseando-se no horário de trabalho
     * 4. Subtrair os slots já reservados
     * 5. Retornar apenas os slots livres
     */
    getAvailableSlots(req, res) {
        try {
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({
                    success: false,
                    error: 'Parâmetro date é obrigatório (formato YYYY-MM-DD).',
                });
            }

            const settings = SettingsModel.get();
            const targetDate = new Date(date + 'T00:00:00');
            const dayOfWeek = targetDate.getDay(); // 0 = Domingo, 6 = Sábado

            // 1. Verificar se o dia está habilitado
            const dayConfig = settings.business_hours[dayOfWeek];
            if (!dayConfig || !dayConfig.enabled) {
                return res.json({
                    success: true,
                    data: {
                        date,
                        available: false,
                        reason: 'Dia não disponível para agendamentos.',
                        slots: [],
                    },
                });
            }

            // 2. Verificar se a data está bloqueada
            const isBlocked = settings.blocked_dates.some((d) => d.date === date);
            if (isBlocked) {
                const blockedInfo = settings.blocked_dates.find((d) => d.date === date);
                return res.json({
                    success: true,
                    data: {
                        date,
                        available: false,
                        reason: blockedInfo.reason || 'Data bloqueada.',
                        slots: [],
                    },
                });
            }

            // 3. Gerar todos os slots possíveis
            const slotDuration = settings.slot_duration || 60;
            const allSlots = generateSlots(
                date,
                dayConfig.start,
                dayConfig.end,
                slotDuration
            );

            // 4. Buscar agendamentos existentes para o dia
            const dayStart = date + 'T00:00:00.000Z';
            const dayEnd = date + 'T23:59:59.999Z';
            const existingBookings = BookingModel.getByDateRange(dayStart, dayEnd)
                .filter((b) => b.status !== 'Cancelado');

            // 5. Filtrar slots ocupados
            const availableSlots = allSlots.filter((slot) => {
                return !existingBookings.some((booking) => {
                    const bookingStart = booking.start_time;
                    const bookingEnd = booking.end_time;
                    // Verificar sobreposição: slot começa antes do booking terminar
                    // E slot termina depois do booking começar
                    return slot.startISO < bookingEnd && slot.endISO > bookingStart;
                });
            });

            res.json({
                success: true,
                data: {
                    date,
                    available: true,
                    businessHours: { start: dayConfig.start, end: dayConfig.end },
                    totalSlots: allSlots.length,
                    availableCount: availableSlots.length,
                    bookedCount: allSlots.length - availableSlots.length,
                    slots: availableSlots,
                },
            });
        } catch (error) {
            console.error('Erro ao calcular disponibilidade:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },
};

/**
 * Gera slots de tempo para um dia específico.
 * @param {string} date - Data base (YYYY-MM-DD)
 * @param {string} startTime - Hora de início (HH:mm)
 * @param {string} endTime - Hora de fim (HH:mm)
 * @param {number} durationMinutes - Duração de cada slot em minutos
 * @returns {Array<{start, end, startISO, endISO}>} Array de slots
 */
function generateSlots(date, startTime, endTime, durationMinutes) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currentH = startH;
    let currentM = startM;

    while (true) {
        // Calcular fim do slot atual
        let slotEndM = currentM + durationMinutes;
        let slotEndH = currentH + Math.floor(slotEndM / 60);
        slotEndM = slotEndM % 60;

        // Verificar se o slot excede o horário final
        if (slotEndH > endH || (slotEndH === endH && slotEndM > endM)) {
            break;
        }

        const startStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        const endStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

        slots.push({
            start: startStr,
            end: endStr,
            startISO: `${date}T${startStr}:00.000Z`,
            endISO: `${date}T${endStr}:00.000Z`,
        });

        // Avançar para o próximo slot
        currentH = slotEndH;
        currentM = slotEndM;
    }

    return slots;
}

export default availabilityController;
