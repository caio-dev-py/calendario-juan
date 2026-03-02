-- ===========================================
-- 🎬 FilmSchedule — Setup Supabase
-- Cole e execute no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New Query)
-- ===========================================

-- ===========================
-- 1. TABELA: profiles
-- Perfis de usuários vinculados ao auth.users
-- ===========================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    phone TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuarios podem ler seu proprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins podem ler todos os perfis"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Usuarios podem atualizar seu proprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Usuários podem criar seu próprio perfil (fallback caso trigger falhe)
CREATE POLICY "Usuarios podem inserir seu proprio perfil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger: criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índice
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);


-- ===========================
-- 2. TABELA: horarios_marcados
-- Agendamentos de gravação para o calendário
-- ===========================

CREATE TABLE IF NOT EXISTS public.horarios_marcados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Quem agendou (referência ao auth.users)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Dados do cliente
    client_name TEXT NOT NULL,
    client_email TEXT DEFAULT '',
    client_phone TEXT DEFAULT '',

    -- Dados da gravação
    recording_type TEXT NOT NULL DEFAULT 'Outro'
        CHECK (recording_type IN (
            'Casamento', 'Ensaio', 'Corporativo',
            'Aniversário', 'Evento', 'Outro'
        )),
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',

    -- Horários
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Status do agendamento
    status TEXT NOT NULL DEFAULT 'Pendente'
        CHECK (status IN ('Pendente', 'Reservado', 'Concluído', 'Cancelado')),

    -- Metadados
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validação: end_time > start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Habilitar RLS
ALTER TABLE public.horarios_marcados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para horarios_marcados

-- Admins podem fazer TUDO (CRUD completo)
CREATE POLICY "Admins tem acesso total aos horarios"
    ON public.horarios_marcados FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Usuários comuns podem VER todos os horários (para ver disponibilidade)
CREATE POLICY "Usuarios podem ver todos os horarios"
    ON public.horarios_marcados FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Usuários comuns podem CRIAR novos agendamentos (suas próprias reservas)
CREATE POLICY "Usuarios podem criar seus proprios horarios"
    ON public.horarios_marcados FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- Usuários comuns podem ATUALIZAR apenas seus próprios agendamentos
CREATE POLICY "Usuarios podem atualizar seus proprios horarios"
    ON public.horarios_marcados FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger: atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS set_horarios_updated_at ON public.horarios_marcados;
CREATE TRIGGER set_horarios_updated_at
    BEFORE UPDATE ON public.horarios_marcados
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_horarios_user_id ON public.horarios_marcados(user_id);
CREATE INDEX IF NOT EXISTS idx_horarios_start_time ON public.horarios_marcados(start_time);
CREATE INDEX IF NOT EXISTS idx_horarios_end_time ON public.horarios_marcados(end_time);
CREATE INDEX IF NOT EXISTS idx_horarios_status ON public.horarios_marcados(status);
CREATE INDEX IF NOT EXISTS idx_horarios_date_range ON public.horarios_marcados(start_time, end_time);


-- ===========================
-- 3. FUNÇÃO: Verificar conflito de horário
-- Previne double-booking
-- ===========================

CREATE OR REPLACE FUNCTION public.check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.horarios_marcados
        WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
            AND status NOT IN ('Cancelado')
            AND start_time < NEW.end_time
            AND end_time > NEW.start_time
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: já existe um agendamento neste período.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_conflict_before_insert ON public.horarios_marcados;
CREATE TRIGGER check_conflict_before_insert
    BEFORE INSERT ON public.horarios_marcados
    FOR EACH ROW EXECUTE FUNCTION public.check_booking_conflict();

DROP TRIGGER IF EXISTS check_conflict_before_update ON public.horarios_marcados;
CREATE TRIGGER check_conflict_before_update
    BEFORE UPDATE ON public.horarios_marcados
    FOR EACH ROW EXECUTE FUNCTION public.check_booking_conflict();


-- ===========================
-- SETUP FINAL
-- ===========================

-- Para criar o primeiro ADMIN, registre-se normalmente
-- e depois execute este SQL trocando o email:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'seu-email@exemplo.com';
