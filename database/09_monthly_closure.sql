-- ============================================================
-- 09_monthly_closure.sql — Fechamento mensal de leituras
-- ============================================================
-- Objetivo:
-- 1) Permitir ao admin fechar/reabrir mês por condomínio
-- 2) Garantir que morador só visualize meses fechados
-- 3) Bloquear envio de leitura/foto de morador em mês fechado
-- ============================================================

CREATE TABLE IF NOT EXISTS fechamentos_mensais (
    id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id                   UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    mes_referencia                  TEXT NOT NULL CHECK (mes_referencia ~ '^\d{4}-\d{2}$'),
    fechado                         BOOLEAN NOT NULL DEFAULT FALSE,
    fechado_em                      TIMESTAMPTZ,
    fechado_por_admin_auth_user_id  UUID REFERENCES auth.users(id),
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(condominio_id, mes_referencia)
);

COMMENT ON TABLE fechamentos_mensais IS 'Controle de fechamento mensal por condomínio';
COMMENT ON COLUMN fechamentos_mensais.fechado IS 'Quando true, mês publicado para moradores';
COMMENT ON COLUMN fechamentos_mensais.fechado_por_admin_auth_user_id IS 'Admin que fechou o mês';

CREATE INDEX IF NOT EXISTS idx_fechamentos_condominio_mes
    ON fechamentos_mensais(condominio_id, mes_referencia);

CREATE INDEX IF NOT EXISTS idx_fechamentos_fechado
    ON fechamentos_mensais(fechado);

CREATE TRIGGER trg_fechamentos_mensais_updated_at
    BEFORE UPDATE ON fechamentos_mensais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE fechamentos_mensais ENABLE ROW LEVEL SECURITY;

-- Admin: CRUD total
DROP POLICY IF EXISTS admin_fechamentos_all ON fechamentos_mensais;
CREATE POLICY admin_fechamentos_all ON fechamentos_mensais
    FOR ALL USING (is_admin());

-- Síndico: leitura dos fechamentos do(s) seu(s) condomínio(s)
DROP POLICY IF EXISTS sindico_fechamentos_select ON fechamentos_mensais;
CREATE POLICY sindico_fechamentos_select ON fechamentos_mensais
    FOR SELECT USING (condominio_id IN (SELECT get_my_condominio_ids()));

-- Morador: leitura do fechamento do próprio condomínio
DROP POLICY IF EXISTS morador_fechamentos_select ON fechamentos_mensais;
CREATE POLICY morador_fechamentos_select ON fechamentos_mensais
    FOR SELECT USING (
        condominio_id IN (
            SELECT u.condominio_id
            FROM moradores m
            JOIN unidades u ON u.id = m.unidade_id
            WHERE m.auth_user_id = auth.uid()
        )
    );

-- Morador: só vê leituras da própria unidade e de meses fechados (até 12 meses)
DROP POLICY IF EXISTS morador_leituras_select ON leituras_mensais;
CREATE POLICY morador_leituras_select ON leituras_mensais
    FOR SELECT USING (
        unidade_id = get_my_unidade_id()
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

-- Morador: pode inserir leitura apenas se envio habilitado E mês aberto
DROP POLICY IF EXISTS morador_leituras_insert ON leituras_mensais;
CREATE POLICY morador_leituras_insert ON leituras_mensais
    FOR INSERT WITH CHECK (
        unidade_id = get_my_unidade_id()
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

-- Morador: só vê fotos de leituras de meses fechados
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
            WHERE lm.unidade_id = get_my_unidade_id()
        )
    );

-- Morador: pode inserir foto apenas em leitura de mês aberto
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
            WHERE lm.unidade_id = get_my_unidade_id()
              AND c.envio_leitura_morador_habilitado = TRUE
              AND COALESCE(fm.fechado, FALSE) = FALSE
        )
    );
