-- ============================================================
-- 03_storage.sql — Configuração do Supabase Storage
-- ============================================================
-- Executar APÓS 02_rls_policies.sql.
-- Cria o bucket de fotos e políticas de acesso.
--
-- NOTA: Em alguns projetos Supabase, a criação de buckets
-- deve ser feita pelo Dashboard (Storage > New Bucket).
-- Nesse caso, use este script apenas como referência e
-- execute as policies manualmente.
-- ============================================================

-- ===================
-- Criar bucket (se suportado via SQL)
-- ===================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'leitura-fotos',
    'leitura-fotos',
    FALSE, -- bucket privado (acesso via policies)
    5242880, -- 5MB por arquivo
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ===================
-- Políticas de Storage
-- ===================

-- Admin: pode fazer tudo no bucket
CREATE POLICY admin_storage_all ON storage.objects
    FOR ALL USING (
        bucket_id = 'leitura-fotos'
        AND EXISTS (
            SELECT 1 FROM admin_users
            WHERE auth_user_id = auth.uid()
        )
    );

-- Morador: pode LER fotos da própria unidade
-- Path esperado: {condominio_id}/{unidade_id}/{mes_referencia}/{tipo}/filename
CREATE POLICY morador_storage_select ON storage.objects
    FOR SELECT USING (
        bucket_id = 'leitura-fotos'
        AND (storage.foldername(name))[2] = (
            SELECT u.id::text FROM moradores m
            JOIN unidades u ON u.id = m.unidade_id
            WHERE m.auth_user_id = auth.uid()
            LIMIT 1
        )
    );

-- Morador: pode fazer UPLOAD na pasta da própria unidade (se envio habilitado)
CREATE POLICY morador_storage_insert ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'leitura-fotos'
        AND (storage.foldername(name))[2] = (
            SELECT u.id::text FROM moradores m
            JOIN unidades u ON u.id = m.unidade_id
            WHERE m.auth_user_id = auth.uid()
            LIMIT 1
        )
        AND EXISTS (
            SELECT 1 FROM moradores m
            JOIN unidades u ON u.id = m.unidade_id
            JOIN condominios c ON c.id = u.condominio_id
            WHERE m.auth_user_id = auth.uid()
            AND c.envio_leitura_morador_habilitado = TRUE
        )
    );
