import db from '../db.js';

/**
 * Model para configurações do filmmaker.
 * Gerencia horário comercial e datas bloqueadas.
 */
const SettingsModel = {
    /**
     * Retorna as configurações atuais.
     * @returns {Object} Configurações com business_hours e blocked_dates parseados
     */
    get() {
        const stmt = db.prepare('SELECT * FROM settings WHERE id = 1');
        const row = stmt.get();

        if (!row) return null;

        return {
            ...row,
            business_hours: JSON.parse(row.business_hours),
            blocked_dates: JSON.parse(row.blocked_dates),
        };
    },

    /**
     * Atualiza o horário comercial.
     * @param {Object} businessHours - Objeto com configuração por dia da semana
     * @returns {Object} Configurações atualizadas
     */
    updateBusinessHours(businessHours) {
        const stmt = db.prepare(`
      UPDATE settings
      SET business_hours = ?, updated_at = datetime('now')
      WHERE id = 1
    `);
        stmt.run(JSON.stringify(businessHours));
        return this.get();
    },

    /**
     * Atualiza a duração do slot de agendamento.
     * @param {number} duration - Duração em minutos
     * @returns {Object} Configurações atualizadas
     */
    updateSlotDuration(duration) {
        const stmt = db.prepare(`
      UPDATE settings
      SET slot_duration = ?, updated_at = datetime('now')
      WHERE id = 1
    `);
        stmt.run(duration);
        return this.get();
    },

    /**
     * Adiciona uma data bloqueada (feriado/folga).
     * @param {string} date - Data no formato YYYY-MM-DD
     * @param {string} reason - Motivo do bloqueio
     * @returns {Object} Configurações atualizadas
     */
    addBlockedDate(date, reason = '') {
        const settings = this.get();
        const blockedDates = settings.blocked_dates;

        // Verificar se a data já está bloqueada
        const exists = blockedDates.find((d) => d.date === date);
        if (exists) {
            const error = new Error('Esta data já está bloqueada.');
            error.status = 409;
            throw error;
        }

        blockedDates.push({ date, reason });

        const stmt = db.prepare(`
      UPDATE settings
      SET blocked_dates = ?, updated_at = datetime('now')
      WHERE id = 1
    `);
        stmt.run(JSON.stringify(blockedDates));

        return this.get();
    },

    /**
     * Remove uma data bloqueada.
     * @param {string} date - Data no formato YYYY-MM-DD
     * @returns {Object} Configurações atualizadas
     */
    removeBlockedDate(date) {
        const settings = this.get();
        const blockedDates = settings.blocked_dates.filter((d) => d.date !== date);

        const stmt = db.prepare(`
      UPDATE settings
      SET blocked_dates = ?, updated_at = datetime('now')
      WHERE id = 1
    `);
        stmt.run(JSON.stringify(blockedDates));

        return this.get();
    },
};

export default SettingsModel;
