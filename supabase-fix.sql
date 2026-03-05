-- ===========================================
-- 🔧 SOLUÇÃO SIMPLIFICADA: Desativa RLS
-- Use isto apenas para sistemas pequenos onde
-- a segurança granular não é a prioridade.
--
-- Execute no SQL Editor do Supabase!
-- ===========================================

-- 1. Desativa a segurança de linha (RLS)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_marcados DISABLE ROW LEVEL SECURITY;

-- 2. Garante permissão total para as roles
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.horarios_marcados TO anon, authenticated, service_role;

-- 3. Limpa qualquer política residual que possa causar conflito
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "horarios_select_authenticated" ON public.horarios_marcados;
DROP POLICY IF EXISTS "horarios_insert_own" ON public.horarios_marcados;
DROP POLICY IF EXISTS "horarios_update_own" ON public.horarios_marcados;
DROP POLICY IF EXISTS "horarios_delete_own" ON public.horarios_marcados;

-- 4. Tabela de configurações
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid PRIMARY KEY,
    business_hours JSONB DEFAULT '{
        "0": {"enabled": false, "start": "09:00", "end": "13:00"},
        "1": {"enabled": true, "start": "09:00", "end": "18:00"},
        "2": {"enabled": true, "start": "09:00", "end": "18:00"},
        "3": {"enabled": true, "start": "09:00", "end": "18:00"},
        "4": {"enabled": true, "start": "09:00", "end": "18:00"},
        "5": {"enabled": true, "start": "09:00", "end": "18:00"},
        "6": {"enabled": false, "start": "09:00", "end": "13:00"}
    }'::jsonb,
    slot_duration INTEGER DEFAULT 60,
    blocked_dates JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insere uma linha de configuração padrão se não existir
INSERT INTO public.settings (id) VALUES ('00000000-0000-0000-0000-000000000000'::uuid) 
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.settings TO anon, authenticated, service_role;

SELECT 'Concluído: RLS desativado, permissões liberadas e tabela settings criada.' as status;
