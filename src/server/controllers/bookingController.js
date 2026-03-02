import BookingModel from '../models/booking.js';

/**
 * Controller para gerenciamento de agendamentos.
 * Todas as operações incluem tratamento de erros robusto.
 */
const bookingController = {
    /**
     * GET /api/bookings
     * Lista agendamentos por intervalo de datas ou todos.
     */
    getAll(req, res) {
        try {
            const { start, end } = req.query;

            let bookings;
            if (start && end) {
                bookings = BookingModel.getByDateRange(start, end);
            } else {
                bookings = BookingModel.getAll();
            }

            res.json({ success: true, data: bookings });
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * GET /api/bookings/:id
     * Busca um agendamento específico.
     */
    getById(req, res) {
        try {
            const booking = BookingModel.getById(parseInt(req.params.id));

            if (!booking) {
                return res.status(404).json({ success: false, error: 'Agendamento não encontrado.' });
            }

            res.json({ success: true, data: booking });
        } catch (error) {
            console.error('Erro ao buscar agendamento:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * POST /api/bookings
     * Cria um novo agendamento com validação contra double-booking.
     */
    create(req, res) {
        try {
            const { client_name, recording_type, location, description, start_time, end_time } = req.body;

            // Validação de campos obrigatórios
            if (!client_name || !recording_type || !start_time || !end_time) {
                return res.status(400).json({
                    success: false,
                    error: 'Campos obrigatórios: client_name, recording_type, start_time, end_time.',
                });
            }

            // Validar que start_time é anterior a end_time
            if (new Date(start_time) >= new Date(end_time)) {
                return res.status(400).json({
                    success: false,
                    error: 'O horário de início deve ser anterior ao horário de fim.',
                });
            }

            const booking = BookingModel.create({
                client_name,
                recording_type,
                location,
                description,
                start_time,
                end_time,
            });

            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            // Conflito de horário (double-booking)
            if (error.status === 409) {
                return res.status(409).json({
                    success: false,
                    error: error.message,
                    conflicts: error.conflicts,
                });
            }

            console.error('Erro ao criar agendamento:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * PATCH /api/bookings/:id/status
     * Atualiza o status de um agendamento.
     */
    updateStatus(req, res) {
        try {
            const { status } = req.body;
            const id = parseInt(req.params.id);

            if (!status) {
                return res.status(400).json({ success: false, error: 'Campo status é obrigatório.' });
            }

            const booking = BookingModel.updateStatus(id, status);
            res.json({ success: true, data: booking });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ success: false, error: error.message });
            }

            console.error('Erro ao atualizar status:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * DELETE /api/bookings/:id
     * Exclui um agendamento.
     */
    delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            BookingModel.delete(id);
            res.json({ success: true, message: 'Agendamento excluído com sucesso.' });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ success: false, error: error.message });
            }

            console.error('Erro ao excluir agendamento:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },
};

export default bookingController;
