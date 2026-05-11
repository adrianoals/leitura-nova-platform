-- ============================================================
-- 11_pessoas_and_unidade_acessos.sql
-- Cria tabelas pessoas e unidade_acessos (substituem moradores N:N)
-- Mantém moradores intacta como backup (drop apenas no commit 3)
-- ============================================================

BEGIN;

-- ===================
-- PESSOAS
-- ===================
CREATE TABLE IF NOT EXISTS pessoas (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE pessoas IS 'Espelho de auth.users no schema public para joins via RLS';

-- Trigger: auto-popular pessoas quando auth.users é criado
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.pessoas (id, nome)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nome')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

DROP TRIGGER IF EXISTS trg_pessoas_updated_at ON pessoas;
CREATE TRIGGER trg_pessoas_updated_at
    BEFORE UPDATE ON pessoas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- UNIDADE_ACESSOS
-- ===================
CREATE TABLE IF NOT EXISTS unidade_acessos (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id   UUID NOT NULL REFERENCES unidades(id)   ON DELETE CASCADE,
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo         TEXT CHECK (tipo IS NULL OR tipo IN ('proprietario', 'locatario')),
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(unidade_id, auth_user_id)
);

COMMENT ON TABLE unidade_acessos IS 'Vínculos N:N entre auth.users e unidades. Substitui moradores.';
COMMENT ON COLUMN unidade_acessos.tipo IS 'NULL = legado/sem rótulo. proprietario/locatario são informacionais (não afetam permissões).';
COMMENT ON COLUMN unidade_acessos.ativo IS 'Soft-disable: vínculo permanece mas RLS bloqueia acesso quando false';

-- FK explícita pra PostgREST conseguir fazer embedded join `pessoa:pessoas(...)`.
-- (Ambas as tabelas referenciam auth.users.id, mas PostgREST não traversa isso sozinho.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unidade_acessos_pessoa_fkey'
    ) THEN
        ALTER TABLE unidade_acessos
            ADD CONSTRAINT unidade_acessos_pessoa_fkey
            FOREIGN KEY (auth_user_id) REFERENCES pessoas(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_acessos_unidade ON unidade_acessos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_acessos_auth ON unidade_acessos(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_acessos_unidade_ativo ON unidade_acessos(unidade_id) WHERE ativo;

DROP TRIGGER IF EXISTS trg_acessos_updated_at ON unidade_acessos;
CREATE TRIGGER trg_acessos_updated_at
    BEFORE UPDATE ON unidade_acessos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- RLS — pessoas
-- ===================
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_pessoas_all ON pessoas;
CREATE POLICY admin_pessoas_all ON pessoas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
    );

DROP POLICY IF EXISTS pessoa_self_select ON pessoas;
CREATE POLICY pessoa_self_select ON pessoas
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS sindico_pessoas_select ON pessoas;
CREATE POLICY sindico_pessoas_select ON pessoas
    FOR SELECT USING (
        id IN (
            SELECT ua.auth_user_id
            FROM unidade_acessos ua
            JOIN unidades u ON u.id = ua.unidade_id
            JOIN sindicos s ON s.condominio_id = u.condominio_id
            WHERE s.auth_user_id = auth.uid()
        )
    );

-- ===================
-- RLS — unidade_acessos
-- ===================
ALTER TABLE unidade_acessos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_acessos_all ON unidade_acessos;
CREATE POLICY admin_acessos_all ON unidade_acessos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
    );

DROP POLICY IF EXISTS acesso_self_select ON unidade_acessos;
CREATE POLICY acesso_self_select ON unidade_acessos
    FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS sindico_acessos_select ON unidade_acessos;
CREATE POLICY sindico_acessos_select ON unidade_acessos
    FOR SELECT USING (
        unidade_id IN (
            SELECT u.id FROM unidades u
            JOIN sindicos s ON s.condominio_id = u.condominio_id
            WHERE s.auth_user_id = auth.uid()
        )
    );

-- ===================
-- MIGRAÇÃO DE DADOS
-- (Popula pessoas e unidade_acessos a partir de moradores)
-- ===================

-- Popula pessoas a partir dos auth.users com morador linkado
INSERT INTO pessoas (id, nome)
SELECT auth_user_id, nome FROM moradores
WHERE auth_user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Popula unidade_acessos a partir dos moradores válidos
-- Linhas com auth_user_id IS NULL (moradores órfãos) são deliberadamente ignoradas
INSERT INTO unidade_acessos (unidade_id, auth_user_id, tipo, ativo)
SELECT unidade_id, auth_user_id, NULL, TRUE FROM moradores
WHERE auth_user_id IS NOT NULL
ON CONFLICT (unidade_id, auth_user_id) DO NOTHING;

COMMIT;
