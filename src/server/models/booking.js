import db from '../db.js';

/**
 * Model para operações CRUD de agendamentos (bookings).
 * Inclui validação de conflito de horários para prevenir double-booking.
 */
const BookingModel = {
    /**
     * Busca todos os agendamentos dentro de um intervalo de datas.
     * @param {string} startDate - Data de início (ISO string)
     * @param {string} endDate - Data de fim (ISO string)
     * @returns {Array} Lista de agendamentos
     */
    getByDateRange(startDate, endDate) {
        const stmt = db.prepare(`
      SELECT * FROM bookings
      WHERE start_time < ? AND end_time > ?
      ORDER BY start_time ASC
    `);
        return stmt.all(endDate, startDate);
    },

    /**
     * Busca um agendamento por ID.
     * @param {number} id - ID do agendamento
     * @returns {Object|undefined} Agendamento encontrado
     */
    getById(id) {
        const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
        return stmt.get(id);
    },

    /**
     * Busca todos os agendamentos.
     * @returns {Array} Lista de todos agendamentos
     */
    getAll() {
        const stmt = db.prepare('SELECT * FROM bookings ORDER BY start_time DESC');
        return stmt.all();
    },

    /**
     * Verifica se existe conflito de horário com agendamentos existentes.
     * Crucial para prevenir double-booking.
     * @param {string} startTime - Início do novo agendamento (ISO string)
     * @param {string} endTime - Fim do novo agendamento (ISO string)
     * @param {number|null} excludeId - ID para excluir da verificação (para updates)
     * @returns {Array} Agendamentos conflitantes
     */
    checkConflict(startTime, endTime, excludeId = null) {
        let query = `
      SELECT * FROM bookings
      WHERE start_time < ? AND end_time > ?
      AND status != 'Cancelado'
    `;
        const params = [endTime, startTime];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const stmt = db.prepare(query);
        return stmt.all(...params);
    },

    /**
     * Cria um novo agendamento após validar ausência de conflitos.
     * @param {Object} booking - Dados do agendamento
     * @returns {Object} Agendamento criado com ID
     * @throws {Error} Se houver conflito de horários
     */
    create(booking) {
        const { client_name, recording_type, location, description, start_time, end_time } = booking;

        // Verificar conflitos antes de inserir
        const conflicts = this.checkConflict(start_time, end_time);
        if (conflicts.length > 0) {
            const error = new Error('Conflito de horário: já existe um agendamento neste período.');
            error.status = 409;
            error.conflicts = conflicts;
            throw error;
        }

        const stmt = db.prepare(`
      INSERT INTO bookings (client_name, recording_type, location, description, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendente')
    `);

        const result = stmt.run(
            client_name,
            recording_type,
            location || '',
            description || '',
            start_time,
            end_time
        );

        return this.getById(result.lastInsertRowid);
    },

    /**
     * Atualiza o status de um agendamento.
     * @param {number} id - ID do agendamento
     * @param {string} status - Novo status (Pendente, Reservado, Concluído, Cancelado)
     * @returns {Object} Agendamento atualizado
     * @throws {Error} Se o agendamento não existir
     */
    updateStatus(id, status) {
        const validStatuses = ['Pendente', 'Reservado', 'Concluído', 'Cancelado'];
        if (!validStatuses.includes(status)) {
            const error = new Error(`Status inválido. Use: ${validStatuses.join(', ')}`);
            error.status = 400;
            throw error;
        }

        const existing = this.getById(id);
        if (!existing) {
            const error = new Error('Agendamento não encontrado.');
            error.status = 404;
            throw error;
        }

        const stmt = db.prepare(`
      UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?
    `);
        stmt.run(status, id);

        return this.getById(id);
    },

    /**
     * Exclui um agendamento.
     * @param {number} id - ID do agendamento
     * @returns {boolean} true se excluído com sucesso
     * @throws {Error} Se o agendamento não existir
     */
    delete(id) {
        const existing = this.getById(id);
        if (!existing) {
            const error = new Error('Agendamento não encontrado.');
            error.status = 404;
            throw error;
        }

        const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
        stmt.run(id);
        return true;
    },
};

export default BookingModel;
