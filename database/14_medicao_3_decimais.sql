-- ============================================================
-- 14_medicao_3_decimais.sql
-- Permite até 3 casas decimais em medição e consumo
-- (hidrômetros podem ter precisão de milésimos).
--
-- Antes: NUMERIC(10,2) — máx 99.999.999,99
-- Depois: NUMERIC(11,3) — máx 99.999.999,999 (mantém faixa inteira)
--
-- valor (R$) permanece NUMERIC(10,2).
-- ============================================================

BEGIN;

ALTER TABLE leituras_mensais
    ALTER COLUMN medicao TYPE NUMERIC(11,3),
    ALTER COLUMN consumo TYPE NUMERIC(11,3);

COMMIT;
