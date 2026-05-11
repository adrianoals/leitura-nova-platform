-- ============================================================
-- 12_update_rls_for_acessos.sql
-- Cutover de RLS pra usar unidade_acessos (multi-vínculo)
--
-- Substitui get_my_unidade_id() (singular) por get_my_unidade_ids() (plural)
-- e atualiza TODAS as policies que dependiam de moradores ou da função antiga.
--
-- IMPORTANTE: preserva regras de negócio das migrations anteriores —
-- janela de 12 meses, check de fechamento mensal, envio_habilitado, etc.
-- (vide 02_rls_policies.sql + 09_monthly_closure.sql + 07_fix_storage_policy_unit_owner.sql)
-- ============================================================

BEGIN;

-- ============================================================
-- Nova função (plural; filtra por ativo)
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_unidade_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT unidade_id FROM unidade_acessos
    WHERE auth_user_id = auth.uid() AND ativo = TRUE
$$;

COMMENT ON FUNCTION get_my_unidade_ids IS 'Retorna IDs das unidades com vínculo ativo do user logado. Substitui get_my_unidade_id() singular.';

-- ============================================================
-- CONDOMINIOS — morador select (era JOIN moradores)
-- ============================================================
DROP POLICY IF EXISTS morador_condominios_select ON condominios;
CREATE POLICY morador_condominios_select ON condominios
    FOR SELECT USING (
        id IN (
            SELECT u.condominio_id
            FROM unidades u
            JOIN unidade_acessos ua ON ua.unidade_id = u.id
            WHERE ua.auth_user_id = auth.uid() AND ua.ativo = TRUE
        )
    );

-- ============================================================
-- UNIDADES — morador select
-- ============================================================
DROP POLICY IF EXISTS morador_unidades_select ON unidades;
CREATE POLICY morador_unidades_select ON unidades
    FOR SELECT USING (id IN (SELECT get_my_unidade_ids()));

-- ============================================================
-- LEITURAS_MENSAIS — morador select
-- (preserva: janela 12 meses + check de mês fechado, vide 09_*.sql)
-- ============================================================
DROP POLICY IF EXISTS morador_leituras_select ON leituras_mensais;
CREATE POLICY morador_leituras_select ON leituras_mensais
    FOR SELECT USING (
        unidade_id IN (SELECT get_my_unidade_ids())
        AND mes_referencia >= to_char(NOW() - INTERVAL '12 months', 'YYYY-MM')
        AND EXISTS (
            SELECT 1
            FROM unidades u
            JOIN fechamentos_mensais fm ON fm.condominio_id = u.condominio_id
            WHERE u.id = leituras_mensais.unidade_id
              AND fm.mes_referencia = leituras_mensais.mes_referencia
              AND fm.fechado = TRUE
        )
    );

-- ============================================================
-- LEITURAS_MENSAIS — morador insert
-- (preserva: envio_habilitado + check de mês NÃO fechado, vide 09_*.sql)
-- ============================================================
DROP POLICY IF EXISTS morador_leituras_insert ON leituras_mensais;
CREATE POLICY morador_leituras_insert ON leituras_mensais
    FOR INSERT WITH CHECK (
        unidade_id IN (SELECT get_my_unidade_ids())
        AND EXISTS (
            SELECT 1
            FROM unidades u
            JOIN condominios c ON c.id = u.condominio_id
            WHERE u.id = unidade_id
              AND c.envio_leitura_morador_habilitado = TRUE
        )
        AND NOT EXISTS (
            SELECT 1
            FROM unidades u
            JOIN fechamentos_mensais fm ON fm.condominio_id = u.condominio_id
            WHERE u.id = unidade_id
              AND fm.mes_referencia = leituras_mensais.mes_referencia
              AND fm.fechado = TRUE
        )
    );

-- ============================================================
-- FOTOS_LEITURA — morador select
-- (preserva: check de mês fechado, vide 09_*.sql)
-- ============================================================
DROP POLICY IF EXISTS morador_fotos_select ON fotos_leitura;
CREATE POLICY morador_fotos_select ON fotos_leitura
    FOR SELECT USING (
        leitura_id IN (
            SELECT lm.id
            FROM leituras_mensais lm
            JOIN unidades u ON u.id = lm.unidade_id
            JOIN fechamentos_mensais fm
              ON fm.condominio_id = u.condominio_id
             AND fm.mes_referencia = lm.mes_referencia
             AND fm.fechado = TRUE
            WHERE lm.unidade_id IN (SELECT get_my_unidade_ids())
        )
    );

-- ============================================================
-- FOTOS_LEITURA — morador insert
-- (preserva: envio_habilitado + check de mês NÃO fechado, vide 09_*.sql)
-- ============================================================
DROP POLICY IF EXISTS morador_fotos_insert ON fotos_leitura;
CREATE POLICY morador_fotos_insert ON fotos_leitura
    FOR INSERT WITH CHECK (
        leitura_id IN (
            SELECT lm.id
            FROM leituras_mensais lm
            JOIN unidades u ON u.id = lm.unidade_id
            JOIN condominios c ON c.id = u.condominio_id
            LEFT JOIN fechamentos_mensais fm
              ON fm.condominio_id = u.condominio_id
             AND fm.mes_referencia = lm.mes_referencia
            WHERE lm.unidade_id IN (SELECT get_my_unidade_ids())
              AND c.envio_leitura_morador_habilitado = TRUE
              AND COALESCE(fm.fechado, FALSE) = FALSE
        )
    );

-- ============================================================
-- FECHAMENTOS_MENSAIS — morador select (era JOIN moradores)
-- ============================================================
DROP POLICY IF EXISTS morador_fechamentos_select ON fechamentos_mensais;
CREATE POLICY morador_fechamentos_select ON fechamentos_mensais
    FOR SELECT USING (
        condominio_id IN (
            SELECT u.condominio_id
            FROM unidade_acessos ua
            JOIN unidades u ON u.id = ua.unidade_id
            WHERE ua.auth_user_id = auth.uid() AND ua.ativo = TRUE
        )
    );

-- ============================================================
-- STORAGE — morador access to fotos (vide 07_fix_storage_policy_unit_owner.sql)
-- Path: {condominio_id}/{unidade_id}/{mes_referencia}/{tipo}/filename
-- Antes: LIMIT 1 single unidade. Agora: ANY active unidade.
-- ============================================================
DROP POLICY IF EXISTS morador_storage_select ON storage.objects;
CREATE POLICY morador_storage_select ON storage.objects
    FOR SELECT USING (
        bucket_id = 'leitura-fotos'
        AND (storage.foldername(name))[2] IN (
            SELECT u.id::text
            FROM public.unidade_acessos ua
            JOIN public.unidades u ON u.id = ua.unidade_id
            WHERE ua.auth_user_id = auth.uid() AND ua.ativo = TRUE
        )
    );

-- Storage INSERT: morador faz upload em pasta da própria unidade ATIVA
-- (corrige o LIMIT 1 antigo que assumia 1 vínculo único; agora valida envio_habilitado pra unidade específica)
DROP POLICY IF EXISTS morador_storage_insert ON storage.objects;
CREATE POLICY morador_storage_insert ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'leitura-fotos'
        AND (storage.foldername(name))[2] IN (
            SELECT u.id::text
            FROM public.unidade_acessos ua
            JOIN public.unidades u ON u.id = ua.unidade_id
            WHERE ua.auth_user_id = auth.uid() AND ua.ativo = TRUE
        )
        AND EXISTS (
            SELECT 1
            FROM public.unidade_acessos ua
            JOIN public.unidades u ON u.id = ua.unidade_id
            JOIN public.condominios c ON c.id = u.condominio_id
            WHERE ua.auth_user_id = auth.uid()
              AND ua.ativo = TRUE
              AND u.id::text = (storage.foldername(name))[2]
              AND c.envio_leitura_morador_habilitado = TRUE
        )
    );

-- ============================================================
-- Manter get_my_unidade_id() (singular) deprecated pra compat
-- Será dropada no commit 3.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_unidade_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT unidade_id FROM unidade_acessos
    WHERE auth_user_id = auth.uid() AND ativo = TRUE
    LIMIT 1
$$;

COMMENT ON FUNCTION get_my_unidade_id IS 'DEPRECATED: usar get_my_unidade_ids(). Mantida para compat até cleanup no commit 3.';

COMMIT;
