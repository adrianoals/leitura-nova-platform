-- ============================================================
-- 07_fix_storage_policy_unit_owner.sql
-- Corrige leitura de fotos para usar unidade_id no path do Storage
-- Regra: morador/proprietário só acessa arquivos da própria unidade
-- Path: {condominio_id}/{unidade_id}/{mes_referencia}/{tipo}/filename
-- ============================================================

DROP POLICY IF EXISTS morador_storage_select ON storage.objects;

CREATE POLICY morador_storage_select ON storage.objects
    FOR SELECT USING (
        bucket_id = 'leitura-fotos'
        AND (storage.foldername(name))[2] = (
            SELECT u.id::text
            FROM public.moradores m
            JOIN public.unidades u ON u.id = m.unidade_id
            WHERE m.auth_user_id = auth.uid()
            LIMIT 1
        )
    );
