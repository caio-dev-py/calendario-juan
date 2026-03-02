-- ===========================================
-- 🔧 FIX URGENTE: Corrige RLS recursivo
-- O problema: políticas RLS de profiles fazem
-- SELECT na própria tabela profiles, causando
-- loop infinito que trava TODAS as queries.
--
-- Execute AGORA no SQL Editor do Supabase!
-- ===========================================

-- 1. REMOVER políticas problemáticas de PROFILES
DROP POLICY IF EXISTS "Usuarios podem ler seu proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ler todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios podem atualizar seu proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios podem inserir seu proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Service role pode inserir perfis" ON public.profiles;

-- 2. REMOVER políticas problemáticas de HORARIOS
DROP POLICY IF EXISTS "Admins tem acesso total aos horarios" ON public.horarios_marcados;
DROP POLICY IF EXISTS "Usuarios podem ver todos os horarios" ON public.horarios_marcados;
DROP POLICY IF EXISTS "Usuarios podem criar seus proprios horarios" ON public.horarios_marcados;
DROP POLICY IF EXISTS "Usuarios podem atualizar seus proprios horarios" ON public.horarios_marcados;


-- ========================================
-- 3. NOVAS POLÍTICAS PARA PROFILES
-- (Sem recursão — usam auth.uid() direto)
-- ========================================

-- Qualquer usuário autenticado pode LER seu próprio perfil
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Qualquer usuário autenticado pode INSERIR seu próprio perfil
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Qualquer usuário autenticado pode ATUALIZAR seu próprio perfil
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ========================================
-- 4. NOVAS POLÍTICAS PARA HORARIOS_MARCADOS
-- (Sem sub-query recursiva em profiles)
-- ========================================

-- Qualquer autenticado pode VER todos os horários
CREATE POLICY "horarios_select_authenticated"
    ON public.horarios_marcados FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Qualquer autenticado pode CRIAR agendamentos (vinculados ao seu user_id)
CREATE POLICY "horarios_insert_own"
    ON public.horarios_marcados FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Dono pode ATUALIZAR seus próprios agendamentos
CREATE POLICY "horarios_update_own"
    ON public.horarios_marcados FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Dono pode DELETAR seus próprios agendamentos
CREATE POLICY "horarios_delete_own"
    ON public.horarios_marcados FOR DELETE
    USING (auth.uid() = user_id);


-- ========================================
-- 5. RECRIAR PERFIS FALTANTES
-- ========================================

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;


-- ========================================
-- VERIFICAÇÃO
-- ========================================

SELECT 'Profiles:', count(*) FROM public.profiles;
SELECT 'Horarios:', count(*) FROM public.horarios_marcados;
