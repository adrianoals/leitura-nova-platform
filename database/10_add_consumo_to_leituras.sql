-- ============================================================
-- 10_add_consumo_to_leituras.sql — Consumo persistido em leituras
-- ============================================================
-- Objetivo:
-- 1) Adicionar coluna consumo em leituras_mensais
-- 2) Recalcular consumo automaticamente em INSERT/UPDATE/DELETE
-- 3) Fazer backfill do histórico existente
-- ============================================================

ALTER TABLE public.leituras_mensais
ADD COLUMN IF NOT EXISTS consumo NUMERIC(10, 2);

COMMENT ON COLUMN public.leituras_mensais.consumo IS
    'Consumo calculado como medição atual - medição do mês anterior (mesma unidade/tipo)';

CREATE OR REPLACE FUNCTION public.recalculate_consumo_for_unidade_tipo(
    p_unidade_id UUID,
    p_tipo TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    WITH ordered AS (
        SELECT
            lm.id,
            lm.medicao
              - LAG(lm.medicao) OVER (
                    ORDER BY lm.mes_referencia
                ) AS consumo_calc
        FROM public.leituras_mensais lm
        WHERE lm.unidade_id = p_unidade_id
          AND lm.tipo = p_tipo
    )
    UPDATE public.leituras_mensais lm
    SET consumo = ordered.consumo_calc
    FROM ordered
    WHERE lm.id = ordered.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalculate_consumo_leituras()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        PERFORM public.recalculate_consumo_for_unidade_tipo(NEW.unidade_id, NEW.tipo);
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.unidade_id IS DISTINCT FROM NEW.unidade_id
           OR OLD.tipo IS DISTINCT FROM NEW.tipo THEN
            PERFORM public.recalculate_consumo_for_unidade_tipo(OLD.unidade_id, OLD.tipo);
        END IF;

        PERFORM public.recalculate_consumo_for_unidade_tipo(NEW.unidade_id, NEW.tipo);
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        PERFORM public.recalculate_consumo_for_unidade_tipo(OLD.unidade_id, OLD.tipo);
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_consumo_leituras ON public.leituras_mensais;
CREATE TRIGGER trg_recalculate_consumo_leituras
    AFTER INSERT OR UPDATE OR DELETE ON public.leituras_mensais
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_recalculate_consumo_leituras();

-- Backfill histórico existente
WITH calc AS (
    SELECT
        lm.id,
        lm.medicao
          - LAG(lm.medicao) OVER (
                PARTITION BY lm.unidade_id, lm.tipo
                ORDER BY lm.mes_referencia
            ) AS consumo_calc
    FROM public.leituras_mensais lm
)
UPDATE public.leituras_mensais lm
SET consumo = calc.consumo_calc
FROM calc
WHERE lm.id = calc.id;
