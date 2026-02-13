-- ============================================================
-- 06_unique_access_per_unit.sql
-- Garante a regra: 1 unidade = 1 acesso (morador/proprietário)
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM moradores
        GROUP BY unidade_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem unidades com mais de um acesso em moradores. Corrija os dados antes de aplicar a constraint.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'moradores_unidade_unique'
    ) THEN
        ALTER TABLE moradores
        ADD CONSTRAINT moradores_unidade_unique UNIQUE (unidade_id);
    END IF;
END $$;
