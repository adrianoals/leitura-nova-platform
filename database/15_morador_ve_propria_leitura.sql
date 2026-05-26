-- ============================================================
-- 15_morador_ve_propria_leitura.sql
-- Permite o morador ver suas PRÓPRIAS leituras (e fotos) imediatamente,
-- sem depender do fechamento do mês. Mantém o gate de fechamento APENAS
-- pras leituras criadas pelo admin.
--
-- Resolve o bug onde INSERT ... RETURNING falhava pra morador, pois a
-- policy SELECT bloqueava o RETURNING da row recém-criada (mês não fechado).
-- ============================================================

BEGIN;

-- LEITURAS_MENSAIS — morador select
-- Antes: precisava mês fechado pra ver QUALQUER leitura
-- Agora: vê própria (criado_por_morador=TRUE) OU admin com mês fechado
DROP POLICY IF EXISTS morador_leituras_select ON leituras_mensais;
CREATE POLICY morador_leituras_select ON leituras_mensais
    FOR SELECT USING (
        unidade_id IN (SELECT get_my_unidade_ids())
        AND mes_referencia >= to_char(NOW() - INTERVAL '12 months', 'YYYY-MM')
        AND (
            criado_por_morador = TRUE
            OR EXISTS (
                SELECT 1
                FROM unidades u
                JOIN fechamentos_mensais fm ON fm.condominio_id = u.condominio_id
                WHERE u.id = leituras_mensais.unidade_id
                  AND fm.mes_referencia = leituras_mensais.mes_referencia
                  AND fm.fechado = TRUE
            )
        )
    );

-- FOTOS_LEITURA — morador select
-- Mesma lógica: fotos de leituras próprias OU de leituras de mês fechado
DROP POLICY IF EXISTS morador_fotos_select ON fotos_leitura;
CREATE POLICY morador_fotos_select ON fotos_leitura
    FOR SELECT USING (
        leitura_id IN (
            SELECT lm.id
            FROM leituras_mensais lm
            JOIN unidades u ON u.id = lm.unidade_id
            LEFT JOIN fechamentos_mensais fm
              ON fm.condominio_id = u.condominio_id
             AND fm.mes_referencia = lm.mes_referencia
            WHERE lm.unidade_id IN (SELECT get_my_unidade_ids())
              AND (
                  lm.criado_por_morador = TRUE
                  OR COALESCE(fm.fechado, FALSE) = TRUE
              )
        )
    );

COMMIT;
