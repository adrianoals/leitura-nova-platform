-- ============================================================
-- 01_tables.sql — Criação das tabelas do Leitura Nova
-- ============================================================
-- Executar no SQL Editor do Supabase (ou via CLI).
-- Ordem: condominios → unidades → moradores → leituras_mensais → fotos_leitura
-- ============================================================

-- Extensão para UUIDs (já vem habilitada no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================
-- CONDOMÍNIOS
-- ===================
CREATE TABLE IF NOT EXISTS condominios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome        TEXT NOT NULL,
    tem_agua    BOOLEAN NOT NULL DEFAULT TRUE,
    tem_agua_quente BOOLEAN NOT NULL DEFAULT FALSE,
    tem_gas     BOOLEAN NOT NULL DEFAULT FALSE,
    envio_leitura_morador_habilitado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE condominios IS 'Condomínios cadastrados no sistema';
COMMENT ON COLUMN condominios.tem_agua_quente IS 'Quando true, unidades possuem 2 hidrômetros: água fria + água quente';
COMMENT ON COLUMN condominios.envio_leitura_morador_habilitado IS 'Quando true, o morador pode enviar foto do medidor + medição';

-- ===================
-- UNIDADES
-- ===================
CREATE TABLE IF NOT EXISTS unidades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id   UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    bloco           TEXT NOT NULL DEFAULT '',
    apartamento     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(condominio_id, bloco, apartamento)
);

COMMENT ON TABLE unidades IS 'Unidades (apartamentos) de cada condomínio';

CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);

-- ===================
-- MORADORES
-- ===================
CREATE TABLE IF NOT EXISTS moradores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id      UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    nome            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE moradores IS 'Moradores vinculados a unidades. auth_user_id liga ao Supabase Auth';
COMMENT ON COLUMN moradores.auth_user_id IS 'UUID do usuário no Supabase Auth (1 login → 1 unidade)';

CREATE INDEX idx_moradores_unidade ON moradores(unidade_id);
CREATE INDEX idx_moradores_auth ON moradores(auth_user_id);

-- ===================
-- ADMIN USERS
-- ===================
CREATE TABLE IF NOT EXISTS admin_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id    UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS 'Usuários com permissão de administrador (acesso total)';

-- ===================
-- SÍNDICOS
-- ===================
CREATE TABLE IF NOT EXISTS sindicos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    condominio_id   UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    nome            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Um síndico pode gerenciar vários condos, mas não duplicar
    UNIQUE(auth_user_id, condominio_id)
);

COMMENT ON TABLE sindicos IS 'Síndicos vinculados a condomínios. Veem tudo do seu condomínio';

CREATE INDEX idx_sindicos_auth ON sindicos(auth_user_id);
CREATE INDEX idx_sindicos_condominio ON sindicos(condominio_id);

-- ===================
-- LEITURAS MENSAIS
-- ===================
CREATE TABLE IF NOT EXISTS leituras_mensais (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id                  UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    tipo                        TEXT NOT NULL CHECK (tipo IN ('agua', 'agua_fria', 'agua_quente', 'gas')),
    mes_referencia              TEXT NOT NULL, -- formato: 'YYYY-MM'
    data_leitura                DATE NOT NULL,
    medicao                     NUMERIC(10, 2) NOT NULL,
    valor                       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    criado_por_admin_auth_user_id UUID REFERENCES auth.users(id),
    criado_por_morador           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Evitar duplicidade: 1 leitura por tipo/mês/unidade
    UNIQUE(unidade_id, tipo, mes_referencia)
);

COMMENT ON TABLE leituras_mensais IS 'Leituras de água (fria/quente) e gás por unidade e mês';
COMMENT ON COLUMN leituras_mensais.tipo IS 'agua = medidor único | agua_fria/agua_quente = 2 medidores | gas';
COMMENT ON COLUMN leituras_mensais.mes_referencia IS 'Formato YYYY-MM (ex: 2026-02)';
COMMENT ON COLUMN leituras_mensais.criado_por_morador IS 'True se a leitura foi enviada pelo morador';

CREATE INDEX idx_leituras_unidade ON leituras_mensais(unidade_id);
CREATE INDEX idx_leituras_mes ON leituras_mensais(mes_referencia);
CREATE INDEX idx_leituras_unidade_mes ON leituras_mensais(unidade_id, mes_referencia);

-- ===================
-- FOTOS DE LEITURA
-- ===================
CREATE TABLE IF NOT EXISTS fotos_leitura (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leitura_id      UUID NOT NULL REFERENCES leituras_mensais(id) ON DELETE CASCADE,
    storage_path    TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fotos_leitura IS 'Fotos vinculadas às leituras (armazenadas no Supabase Storage)';

CREATE INDEX idx_fotos_leitura ON fotos_leitura(leitura_id);

-- ===================
-- TRIGGERS de updated_at
-- ===================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_condominios_updated_at
    BEFORE UPDATE ON condominios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_unidades_updated_at
    BEFORE UPDATE ON unidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_moradores_updated_at
    BEFORE UPDATE ON moradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_leituras_updated_at
    BEFORE UPDATE ON leituras_mensais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
