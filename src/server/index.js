import express from 'express';
import cors from 'cors';
import bookingController from './controllers/bookingController.js';
import settingsController from './controllers/settingsController.js';
import availabilityController from './controllers/availabilityController.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// ===== Rotas de Agendamentos =====
app.get('/api/bookings', bookingController.getAll);
app.get('/api/bookings/:id', bookingController.getById);
app.post('/api/bookings', bookingController.create);
app.patch('/api/bookings/:id/status', bookingController.updateStatus);
app.delete('/api/bookings/:id', bookingController.delete);

// ===== Rotas de Configurações =====
app.get('/api/settings', settingsController.get);
app.put('/api/settings/business-hours', settingsController.updateBusinessHours);
app.put('/api/settings/slot-duration', settingsController.updateSlotDuration);
app.post('/api/settings/blocked-dates', settingsController.addBlockedDate);
app.delete('/api/settings/blocked-dates/:date', settingsController.removeBlockedDate);

// ===== Rotas de Disponibilidade =====
app.get('/api/availability', availabilityController.getAvailableSlots);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor.',
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🎬 Filmmaker Schedule API rodando na porta ${PORT}`);
    console.log(`   http://localhost:${PORT}/api/settings`);
    console.log(`   http://localhost:${PORT}/api/bookings`);
    console.log(`   http://localhost:${PORT}/api/availability?date=2026-02-27\n`);
});
