-- ============================================================
-- 13_drop_moradores.sql
-- Cleanup final do refactor multi-vínculo: drop tabela moradores
-- e função get_my_unidade_id() singular (deprecated em 12).
--
-- Pré-requisitos:
--   - Migrations 11 e 12 já aplicadas
--   - Código já refatorado pra usar unidade_acessos + pessoas
--   - Validação em prod confirmou que nada quebrou
--
-- Rollback: restaurar de snapshot anterior (não há volta safe via SQL).
-- ============================================================

BEGIN;

-- 1) Drop função singular (substituída por get_my_unidade_ids() em 12)
DROP FUNCTION IF EXISTS get_my_unidade_id();

-- 2) Drop tabela moradores
--    CASCADE não é necessário: RLS migration 12 já removeu policies que referenciavam moradores,
--    e a verificação prévia mostrou 0 FKs apontando pra cá.
DROP TABLE IF EXISTS moradores;

COMMIT;
