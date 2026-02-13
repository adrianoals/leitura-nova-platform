-- ============================================================
-- 02_rls_policies.sql — Políticas de Row Level Security
-- ============================================================
-- Executar APÓS 01_tables.sql.
-- 3 roles: admin (tudo), síndico (seu condomínio), morador (sua unidade)
-- ============================================================

-- ===================
-- Habilitar RLS em todas as tabelas
-- ===================
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sindicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE leituras_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_leitura ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ===================
-- Funções auxiliares
-- ===================

-- Verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é síndico de um condomínio específico
CREATE OR REPLACE FUNCTION is_sindico_of(condo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM sindicos
        WHERE auth_user_id = auth.uid()
        AND condominio_id = condo_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter IDs dos condos do síndico logado
CREATE OR REPLACE FUNCTION get_my_condominio_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
        SELECT condominio_id FROM sindicos
        WHERE auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter unidade_id do morador logado
CREATE OR REPLACE FUNCTION get_my_unidade_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT unidade_id FROM moradores
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONDOMINIOS
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_condominios_all ON condominios
    FOR ALL USING (is_admin());

-- Síndico: leitura dos seus condos
CREATE POLICY sindico_condominios_select ON condominios
    FOR SELECT USING (id IN (SELECT get_my_condominio_ids()));

-- Morador: leitura do seu condomínio
CREATE POLICY morador_condominios_select ON condominios
    FOR SELECT USING (
        id IN (
            SELECT u.condominio_id FROM unidades u
            JOIN moradores m ON m.unidade_id = u.id
            WHERE m.auth_user_id = auth.uid()
        )
    );

-- =====================================================
-- UNIDADES
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_unidades_all ON unidades
    FOR ALL USING (is_admin());

-- Síndico: leitura das unidades dos seus condos
CREATE POLICY sindico_unidades_select ON unidades
    FOR SELECT USING (condominio_id IN (SELECT get_my_condominio_ids()));

-- Morador: leitura da própria unidade
CREATE POLICY morador_unidades_select ON unidades
    FOR SELECT USING (id = get_my_unidade_id());

-- =====================================================
-- MORADORES
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_moradores_all ON moradores
    FOR ALL USING (is_admin());

-- Síndico: leitura dos moradores dos seus condos
CREATE POLICY sindico_moradores_select ON moradores
    FOR SELECT USING (
        unidade_id IN (
            SELECT id FROM unidades
            WHERE condominio_id IN (SELECT get_my_condominio_ids())
        )
    );

-- Morador: leitura do próprio registro
CREATE POLICY morador_moradores_select ON moradores
    FOR SELECT USING (auth_user_id = auth.uid());

-- =====================================================
-- SÍNDICOS
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_sindicos_all ON sindicos
    FOR ALL USING (is_admin());

-- Síndico: leitura do próprio registro
CREATE POLICY sindico_sindicos_select ON sindicos
    FOR SELECT USING (auth_user_id = auth.uid());

-- =====================================================
-- LEITURAS MENSAIS
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_leituras_all ON leituras_mensais
    FOR ALL USING (is_admin());

-- Síndico: leitura de todas as leituras dos seus condos
CREATE POLICY sindico_leituras_select ON leituras_mensais
    FOR SELECT USING (
        unidade_id IN (
            SELECT id FROM unidades
            WHERE condominio_id IN (SELECT get_my_condominio_ids())
        )
    );

-- Morador: leitura dos últimos 12 meses da própria unidade
CREATE POLICY morador_leituras_select ON leituras_mensais
    FOR SELECT USING (
        unidade_id = get_my_unidade_id()
        AND mes_referencia >= to_char(NOW() - INTERVAL '12 months', 'YYYY-MM')
    );

-- Morador: pode inserir leitura SE envio habilitado no condomínio
CREATE POLICY morador_leituras_insert ON leituras_mensais
    FOR INSERT WITH CHECK (
        unidade_id = get_my_unidade_id()
        AND EXISTS (
            SELECT 1 FROM unidades u
            JOIN condominios c ON c.id = u.condominio_id
            WHERE u.id = unidade_id
            AND c.envio_leitura_morador_habilitado = TRUE
        )
    );

-- =====================================================
-- FOTOS DE LEITURA
-- =====================================================

-- Admin: CRUD total
CREATE POLICY admin_fotos_all ON fotos_leitura
    FOR ALL USING (is_admin());

-- Síndico: leitura das fotos dos seus condos
CREATE POLICY sindico_fotos_select ON fotos_leitura
    FOR SELECT USING (
        leitura_id IN (
            SELECT lm.id FROM leituras_mensais lm
            JOIN unidades u ON u.id = lm.unidade_id
            WHERE u.condominio_id IN (SELECT get_my_condominio_ids())
        )
    );

-- Morador: leitura das fotos da própria unidade
CREATE POLICY morador_fotos_select ON fotos_leitura
    FOR SELECT USING (
        leitura_id IN (
            SELECT id FROM leituras_mensais
            WHERE unidade_id = get_my_unidade_id()
        )
    );

-- Morador: pode inserir foto SE envio habilitado
CREATE POLICY morador_fotos_insert ON fotos_leitura
    FOR INSERT WITH CHECK (
        leitura_id IN (
            SELECT lm.id FROM leituras_mensais lm
            JOIN unidades u ON u.id = lm.unidade_id
            JOIN condominios c ON c.id = u.condominio_id
            WHERE lm.unidade_id = get_my_unidade_id()
            AND c.envio_leitura_morador_habilitado = TRUE
        )
    );

-- =====================================================
-- ADMIN USERS
-- =====================================================

-- Admin: pode ver todos os admins
CREATE POLICY admin_users_select ON admin_users
    FOR SELECT USING (is_admin());
