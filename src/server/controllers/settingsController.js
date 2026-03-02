import SettingsModel from '../models/settings.js';

/**
 * Controller para configurações do filmmaker.
 */
const settingsController = {
    /**
     * GET /api/settings
     * Retorna as configurações atuais.
     */
    get(req, res) {
        try {
            const settings = SettingsModel.get();
            res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * PUT /api/settings/business-hours
     * Atualiza o horário comercial.
     */
    updateBusinessHours(req, res) {
        try {
            const { business_hours } = req.body;

            if (!business_hours) {
                return res.status(400).json({
                    success: false,
                    error: 'Campo business_hours é obrigatório.',
                });
            }

            const settings = SettingsModel.updateBusinessHours(business_hours);
            res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Erro ao atualizar horário comercial:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * PUT /api/settings/slot-duration
     * Atualiza a duração do slot.
     */
    updateSlotDuration(req, res) {
        try {
            const { duration } = req.body;

            if (!duration || duration < 15 || duration > 480) {
                return res.status(400).json({
                    success: false,
                    error: 'Duração deve ser entre 15 e 480 minutos.',
                });
            }

            const settings = SettingsModel.updateSlotDuration(duration);
            res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Erro ao atualizar duração do slot:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * POST /api/settings/blocked-dates
     * Adiciona uma data bloqueada.
     */
    addBlockedDate(req, res) {
        try {
            const { date, reason } = req.body;

            if (!date) {
                return res.status(400).json({
                    success: false,
                    error: 'Campo date é obrigatório (formato YYYY-MM-DD).',
                });
            }

            const settings = SettingsModel.addBlockedDate(date, reason);
            res.json({ success: true, data: settings });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ success: false, error: error.message });
            }

            console.error('Erro ao bloquear data:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },

    /**
     * DELETE /api/settings/blocked-dates/:date
     * Remove uma data bloqueada.
     */
    removeBlockedDate(req, res) {
        try {
            const { date } = req.params;
            const settings = SettingsModel.removeBlockedDate(date);
            res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Erro ao desbloquear data:', error);
            res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
        }
    },
};

export default settingsController;
