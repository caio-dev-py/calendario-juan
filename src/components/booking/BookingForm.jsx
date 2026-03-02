import React, { useState, useEffect } from 'react';
import { getToken, SUPABASE_URL, SUPABASE_KEY } from '../../config/supabaseHelper';
import {
    format,
    addMonths,
    subMonths,
    addDays,
    subDays,
    isSameDay,
    startOfMonth,
    endOfMonth,
    RECORDING_TYPES,
} from '../../utils/dateUtils';
import { useBookings } from '../../hooks/useBookings';
import { useSettings } from '../../hooks/useSettings';
import CalendarHeader from '../calendar/CalendarHeader';
import MonthView from '../calendar/MonthView';
import SlotPicker from './SlotPicker';
import Button from '../ui/Button';
import { CalendarCheck, MapPin, User, FileText, Film, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Página de reserva — Fluxo: Data → Horário → Dados → Confirmar
 */
export default function BookingForm() {
    const { createBooking, loading: bookingLoading, error: bookingError, setError } = useBookings();
    const { settings } = useSettings();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedSlotData, setSelectedSlotData] = useState(null);
    const [bookings, setBookings] = useState([]);

    const [formData, setFormData] = useState({
        client_name: '',
        recording_type: 'Evento',
        location: '',
        description: '',
    });

    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);

    // Buscar agendamentos do mês via REST direto
    useEffect(() => {
        const fetchMonthBookings = async () => {
            try {
                const start = format(startOfMonth(currentDate), "yyyy-MM-dd'T'00:00:00.000'Z'");
                const end = format(endOfMonth(currentDate), "yyyy-MM-dd'T'23:59:59.999'Z'");

                const token = getToken();
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 5000);

                const headers = { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const url = `${SUPABASE_URL}/rest/v1/horarios_marcados?select=*&start_time=gte.${encodeURIComponent(start)}&start_time=lte.${encodeURIComponent(end)}&order=start_time.asc`;
                const res = await fetch(url, { headers, signal: controller.signal });
                clearTimeout(timer);

                if (res.ok) {
                    const data = await res.json();
                    setBookings(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Erro ao buscar agendamentos:', err);
            }
        };
        fetchMonthBookings();
    }, [currentDate]);

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setSelectedSlotData(null);
        setStep(1);
    };

    const handleSelectSlot = (slotKey, slotData) => {
        setSelectedSlot(slotKey);
        setSelectedSlotData(slotData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProceedToForm = () => {
        if (selectedSlot) {
            setStep(2);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!selectedDate || !selectedSlotData) return;

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        try {
            await createBooking({
                ...formData,
                start_time: `${dateStr}T${selectedSlotData.start}:00.000Z`,
                end_time: `${dateStr}T${selectedSlotData.end}:00.000Z`,
            });
            setSuccess(true);
            setStep(3);
        } catch (err) {
            // erro já setado pelo hook
        }
    };

    const handleReset = () => {
        setSelectedDate(null);
        setSelectedSlot(null);
        setSelectedSlotData(null);
        setFormData({ client_name: '', recording_type: 'Evento', location: '', description: '' });
        setSuccess(false);
        setStep(1);
    };

    // ==================== STEP 3: CONFIRMAÇÃO ====================
    if (step === 3 && success) {
        return (
            <div className="py-4">
                <div className="max-w-lg mx-auto">
                    <div
                        className="relative rounded-2xl border border-white/[0.06] p-10 md:p-12 text-center ring-1 ring-inset ring-white/[0.03]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(22,22,28,0.95) 0%, rgba(16,16,20,0.97) 100%)',
                            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4)',
                        }}
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
                            <CheckCircle size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-[-0.01em]">
                            Reserva Confirmada! 🎬
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Sua sessão de gravação foi agendada com sucesso.
                        </p>

                        <div className="p-5 bg-white/[0.03] rounded-xl border border-white/[0.06] text-left space-y-3.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Data</span>
                                <span className="text-white font-medium">
                                    {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Horário</span>
                                <span className="text-white font-medium">
                                    {selectedSlotData?.start} – {selectedSlotData?.end}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Cliente</span>
                                <span className="text-white font-medium">
                                    {formData.client_name}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tipo</span>
                                <span className="text-white font-medium">
                                    {formData.recording_type}
                                </span>
                            </div>
                            {formData.location && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Local</span>
                                    <span className="text-white font-medium">
                                        {formData.location}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleReset}
                            className="mt-8 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] rounded-xl transition-all duration-300 ease-out shadow-[0_8px_30px_-4px_rgba(139,92,246,0.35)] hover:shadow-[0_12px_40px_-4px_rgba(139,92,246,0.5)] cursor-pointer"
                        >
                            Fazer Nova Reserva
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== LAYOUT PRINCIPAL ====================
    return (
        <div className="py-4">
            {/* ---- PAGE HEADER ---- */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-[-0.01em]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/[0.12] ring-1 ring-purple-500/20">
                        <CalendarCheck size={20} className="text-purple-400" />
                    </div>
                    Nova Reserva
                </h1>
                <p className="text-sm text-gray-500 mt-2.5 ml-[52px]">
                    Selecione uma data e horário disponível para agendar sua gravação.
                </p>
            </div>

            {/* ---- STEP INDICATOR ---- */}
            <div className="flex items-center gap-3 mb-8">
                {[
                    { num: 1, label: 'Data e Horário' },
                    { num: 2, label: 'Informações' },
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all duration-300 ${step >= s.num
                            ? 'bg-purple-500/[0.12] text-purple-300 ring-1 ring-purple-500/20'
                            : 'bg-white/[0.03] text-gray-500 border border-white/[0.05]'
                            }`}>
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${step >= s.num
                                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                                : 'bg-white/[0.05] text-gray-500'
                                }`}>
                                {step > s.num ? '✓' : s.num}
                            </span>
                            {s.label}
                        </div>
                        {i < 1 && (
                            <div className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${step > 1 ? 'bg-purple-500/25' : 'bg-white/[0.04]'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* ==================== STEP 1: DATA + HORÁRIO ==================== */}
            {step === 1 && (
                <div className="space-y-6">
                    {/* Card: Calendário */}
                    <div
                        className="rounded-2xl border border-white/[0.05] p-5 md:p-7"
                        style={{ background: 'rgba(17,17,19,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    >
                        <h3 className="text-lg font-semibold text-gray-200 mb-5">
                            Selecione a Data
                        </h3>
                        <CalendarHeader
                            currentDate={currentDate}
                            view="month"
                            onPrev={() => setCurrentDate((d) => subMonths(d, 1))}
                            onNext={() => setCurrentDate((d) => addMonths(d, 1))}
                            onToday={() => setCurrentDate(new Date())}
                            onViewChange={() => { }}
                        />
                        <MonthView
                            currentDate={currentDate}
                            selectedDate={selectedDate}
                            bookings={bookings}
                            onSelectDate={handleSelectDate}
                            blockedDates={settings?.blocked_dates || []}
                        />
                    </div>

                    {/* Card: Horários */}
                    <div
                        className="rounded-2xl border border-white/[0.05] p-5 md:p-7"
                        style={{ background: 'rgba(17,17,19,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    >
                        <h3 className="text-lg font-semibold text-gray-200 mb-5">
                            Escolha o Horário
                        </h3>
                        <SlotPicker
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            onSelectSlot={handleSelectSlot}
                        />
                    </div>

                    {/* Botão Continuar */}
                    {selectedSlot && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleProceedToForm}
                                className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] rounded-xl transition-all duration-300 ease-out shadow-[0_8px_30px_-4px_rgba(139,92,246,0.35)] hover:shadow-[0_12px_40px_-4px_rgba(139,92,246,0.5)] cursor-pointer"
                            >
                                Continuar →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== STEP 2: FORMULÁRIO ==================== */}
            {step === 2 && (
                <div className="max-w-xl">
                    <div
                        className="relative rounded-2xl border border-white/[0.05] p-7 md:p-9 ring-1 ring-inset ring-white/[0.03]"
                        style={{
                            background: 'linear-gradient(135deg, rgba(22,22,28,0.9) 0%, rgba(16,16,20,0.95) 100%)',
                            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />

                        {/* Resumo da seleção */}
                        <div className="p-4 bg-purple-500/[0.06] border border-purple-500/15 rounded-xl mb-8">
                            <p className="text-sm text-purple-300 font-medium">
                                📅 {selectedDate && format(selectedDate, 'dd/MM/yyyy')} · {selectedSlotData?.start} – {selectedSlotData?.end}
                            </p>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-[12px] text-purple-400/70 hover:text-purple-300 hover:underline mt-1.5 cursor-pointer transition-colors"
                            >
                                Alterar data/horário
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-200 mb-7">
                            Dados da Reserva
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Nome */}
                            <div className="flex flex-col gap-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                    <User size={14} className="text-purple-400/70" />
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Seu nome completo"
                                    className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out"
                                />
                            </div>

                            {/* Tipo */}
                            <div className="flex flex-col gap-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                    <Film size={14} className="text-purple-400/70" />
                                    Tipo de Gravação *
                                </label>
                                <select
                                    name="recording_type"
                                    value={formData.recording_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out cursor-pointer"
                                >
                                    {RECORDING_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Local */}
                            <div className="flex flex-col gap-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                    <MapPin size={14} className="text-purple-400/70" />
                                    Local da Gravação
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Endereço ou local de gravação"
                                    className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out"
                                />
                            </div>

                            {/* Descrição */}
                            <div className="flex flex-col gap-2.5">
                                <label className="flex items-center gap-2 text-[13px] font-medium text-gray-300/90 pl-0.5">
                                    <FileText size={14} className="text-purple-400/70" />
                                    Descrição / Observações
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Detalhes adicionais sobre a gravação..."
                                    className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:bg-white/[0.06] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20 hover:border-white/[0.12] transition-all duration-300 ease-out resize-none"
                                />
                            </div>

                            {/* Erro */}
                            {bookingError && (
                                <div className="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/15 rounded-xl backdrop-blur-sm">
                                    <AlertCircle size={18} className="text-red-400/90 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-300/90 leading-relaxed">{bookingError}</p>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-5 py-3.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] text-gray-300 font-medium text-sm rounded-xl transition-all duration-300 ease-out cursor-pointer"
                                >
                                    <ArrowLeft size={16} />
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading || !formData.client_name}
                                    className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] rounded-xl transition-all duration-300 ease-out disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_8px_30px_-4px_rgba(139,92,246,0.35)] hover:shadow-[0_12px_40px_-4px_rgba(139,92,246,0.5)] cursor-pointer"
                                >
                                    {bookingLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Agendando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Confirmar Reserva
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
