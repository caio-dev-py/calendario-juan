import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco de dados SQLite armazenado na raiz do projeto
const dbPath = path.join(__dirname, '..', '..', 'schedule.db');
const db = new Database(dbPath);

// Habilitar WAL mode para melhor performance de concorrência
db.pragma('journal_mode = WAL');

/**
 * Inicializa as tabelas do banco de dados.
 * Criação automática se não existirem.
 */
function initializeDatabase() {
    // Tabela de configurações (horário comercial, datas bloqueadas)
    db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      business_hours TEXT NOT NULL DEFAULT '{}',
      blocked_dates TEXT NOT NULL DEFAULT '[]',
      slot_duration INTEGER NOT NULL DEFAULT 60,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

    // Tabela de agendamentos
    db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      recording_type TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

    // Índice para buscas por intervalo de datas
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_time
    ON bookings (start_time, end_time)
  `);

    // Inserir configuração padrão se não existir
    const existing = db.prepare('SELECT COUNT(*) as count FROM settings').get();
    if (existing.count === 0) {
        const defaultBusinessHours = JSON.stringify({
            0: { enabled: false, start: '09:00', end: '18:00' }, // Domingo
            1: { enabled: true, start: '09:00', end: '18:00' },  // Segunda
            2: { enabled: true, start: '09:00', end: '18:00' },  // Terça
            3: { enabled: true, start: '09:00', end: '18:00' },  // Quarta
            4: { enabled: true, start: '09:00', end: '18:00' },  // Quinta
            5: { enabled: true, start: '09:00', end: '18:00' },  // Sexta
            6: { enabled: false, start: '09:00', end: '18:00' }, // Sábado
        });

        db.prepare(
            'INSERT INTO settings (id, business_hours, blocked_dates, slot_duration) VALUES (1, ?, ?, 60)'
        ).run(defaultBusinessHours, '[]');
    }
}

// Inicializar banco ao importar
initializeDatabase();

export default db;
