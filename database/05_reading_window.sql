-- ============================================================
-- 05_reading_window.sql
-- DESCONTINUADA: janela por dia não faz parte da modelagem atual.
-- A referência temporal da leitura é:
--   - data_leitura (dia em que ocorreu)
--   - mes_referencia (período YYYY-MM)
-- ============================================================

SELECT 'MIGRATION SKIPPED: leitura_dia_inicio/leitura_dia_fim não são usados no modelo atual.' AS info;
