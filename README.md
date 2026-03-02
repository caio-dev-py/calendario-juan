# 🎬 FilmSchedule

Agenda profissional para filmmakers — sistema SaaS de agendamento de gravações com design dark mode cinematográfico.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase&logoColor=white)

---

## ✨ Features

- **📅 Calendário Interativo** — Visualizações mensal e diária com timeline de horas
- **🎯 Sistema de Reservas** — Fluxo guiado: Data → Horário → Dados → Confirmação
- **👤 Autenticação** — Login/Registro com Supabase Auth
- **⚙️ Painel Admin** — Configuração de horário comercial e datas bloqueadas
- **🎨 Design Premium** — Dark mode cinematográfico com glassmorphism (estilo Vercel/Linear)
- **📱 Responsivo** — Sidebar desktop + bottom nav mobile

## 🚀 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 4 |
| Auth & Database | Supabase |
| Icons | Lucide React |
| Routing | React Router DOM |

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/caio-dev-py/calendario-juan.git
cd calendario-juan

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um projeto no Supabase e configure as credenciais em:
# src/config/supabaseClient.js

# Rode o servidor de desenvolvimento
npm run dev
```

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── admin/          # BusinessHours, BlockedDates, BookingManager
│   ├── auth/           # LoginForm, RegisterForm
│   ├── booking/        # BookingForm, SlotPicker
│   ├── calendar/       # CalendarHeader, MonthView, DayView
│   ├── layout/         # Sidebar, ProtectedRoute
│   └── ui/             # Button, Modal, StatusBadge
├── config/             # Supabase client & helpers
├── contexts/           # AuthContext
├── hooks/              # useAvailability, useBookings, useSettings
├── pages/              # CalendarPage, AdminPage, AccessDenied
├── server/             # Express API (controllers, models)
└── utils/              # dateUtils
```

## 🎨 Design System

- **Palette**: Deep blacks (`#09090b`) com acentos purple/blue
- **Glassmorphism**: `backdrop-blur` + bordas `white/[0.04-0.08]`
- **Tipografia**: Inter font, hierarquia com `text-white` → `gray-300` → `gray-500`
- **Transições**: `300ms ease-out` em todos os elementos interativos
- **Sombras**: Multi-layer com glow purple (`rgba(139,92,246)`)

## 📄 Licença

Este projeto é de uso privado.

---

Desenvolvido com 💜 para filmmakers profissionais.
