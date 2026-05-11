-- ============================================================
-- rls_unidade_acessos.sql
-- Suite de assertions de RLS pro schema multi-vínculo.
--
-- Como rodar:
--   Cole o arquivo inteiro no Supabase SQL Editor (dashboard) e clique Run.
--   Tudo está dentro de BEGIN/ROLLBACK — nada é persistido.
--   Sucesso = "ROLLBACK" no final + nenhum NOTICE de FAIL.
--   Falha = ERROR com mensagem indicando qual assert falhou.
--
-- Roda contra: prod (após aplicar 11_*.sql e 12_*.sql)
-- ============================================================

BEGIN;

-- ============================================================
-- HELPER FUNCTIONS (criadas dentro da transação; rollback limpa)
-- ============================================================

CREATE OR REPLACE FUNCTION pg_temp.assert_count(query TEXT, expected INTEGER, label TEXT)
RETURNS VOID AS $$
DECLARE
    actual INTEGER;
BEGIN
    EXECUTE 'SELECT COUNT(*) FROM (' || query || ') AS sub' INTO actual;
    IF actual != expected THEN
        RAISE EXCEPTION 'FAIL [%]: esperado % linhas, obtido %', label, expected, actual;
    END IF;
    RAISE NOTICE 'PASS [%]: % rows', label, actual;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.login_as(user_id UUID) RETURNS VOID AS $$
BEGIN
    EXECUTE format('SET LOCAL request.jwt.claims = %L', json_build_object('sub', user_id::text)::text);
    SET LOCAL ROLE authenticated;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.logout() RETURNS VOID AS $$
BEGIN
    RESET ROLE;
    PERFORM set_config('request.jwt.claims', '', true);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIXTURES
-- IDs em formato v4 válido (versão = 4 no 13º char, variant = 8/9/a/b no 17º)
-- ============================================================

INSERT INTO condominios (id, nome, tem_agua, envio_leitura_morador_habilitado) VALUES
    ('11111111-1111-4111-8111-111111111111', 'TEST Condo A', true, true),
    ('22222222-2222-4222-8222-222222222222', 'TEST Condo B', true, true);

INSERT INTO unidades (id, condominio_id, bloco, apartamento) VALUES
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '', '101'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', '', '102'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '22222222-2222-4222-8222-222222222222', '', '201');

INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, raw_app_meta_data, raw_user_meta_data) VALUES
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'test-morador-a@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', '{}'::jsonb, '{"nome": "Morador A"}'::jsonb),
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'test-morador-b@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', '{}'::jsonb, '{"nome": "Morador B"}'::jsonb),
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'test-sindico-a@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', '{}'::jsonb, '{"nome": "Sindico A"}'::jsonb),
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc4', 'test-admin@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', '{}'::jsonb, '{"nome": "Admin"}'::jsonb),
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc5', 'test-outsider@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', '{}'::jsonb, '{"nome": "Outsider"}'::jsonb);

-- Vínculos:
-- Morador A → unidade 101 (condo A), ATIVO
INSERT INTO unidade_acessos (unidade_id, auth_user_id, tipo, ativo) VALUES
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'proprietario', true);

-- Morador B → 2 vínculos: unidade 102 (condo A) ATIVO + unidade 201 (condo B) DESABILITADO
INSERT INTO unidade_acessos (unidade_id, auth_user_id, tipo, ativo) VALUES
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'locatario', true),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'proprietario', false);

-- Síndico do condo A
INSERT INTO sindicos (auth_user_id, condominio_id) VALUES
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', '11111111-1111-4111-8111-111111111111');

-- Admin
INSERT INTO admin_users (auth_user_id) VALUES
    ('cccccccc-cccc-4ccc-8ccc-ccccccccccc4');

-- ============================================================
-- TESTS — MORADOR A (1 vínculo ativo)
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc1');

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text LIKE 'aaaaaaaa-aaaa-4aaa-8aaa-%' OR id::text LIKE 'bbbbbbbb-bbbb-4bbb-8bbb-%'$q$,
    1,
    'morador A vê apenas 1 unidade (a sua)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$q$,
    1,
    'morador A vê especificamente sua unidade (101)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'$q$,
    0,
    'morador A NÃO vê outra unidade do mesmo condomínio (102)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE auth_user_id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    1,
    'morador A vê apenas seu próprio vínculo'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM pessoas WHERE id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    1,
    'morador A vê apenas a própria pessoa'
);

SELECT pg_temp.logout();

-- ============================================================
-- TESTS — MORADOR B (1 ativo + 1 desabilitado)
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc2');

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text LIKE 'aaaaaaaa-aaaa-4aaa-8aaa-%' OR id::text LIKE 'bbbbbbbb-bbbb-4bbb-8bbb-%'$q$,
    1,
    'morador B com 1 vínculo ativo + 1 desabilitado vê APENAS a unidade ativa'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'$q$,
    1,
    'morador B vê unidade do vínculo ativo (102)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'$q$,
    0,
    'morador B NÃO vê unidade do vínculo desabilitado (201)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE auth_user_id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    2,
    'morador B vê ambos seus vínculos no acesso_self_select (ativo + desabilitado)'
);

SELECT pg_temp.logout();

-- ============================================================
-- TESTS — SÍNDICO (condo A)
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc3');

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE condominio_id::text = '11111111-1111-4111-8111-111111111111'$q$,
    2,
    'síndico vê 2 unidades do seu condomínio (101 + 102)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE condominio_id::text = '22222222-2222-4222-8222-222222222222'$q$,
    0,
    'síndico NÃO vê unidades de outro condomínio'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE unidade_id::text LIKE 'aaaaaaaa-aaaa-4aaa-8aaa-%'$q$,
    2,
    'síndico vê os 2 vínculos das unidades do seu condomínio'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE unidade_id::text = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'$q$,
    0,
    'síndico NÃO vê vínculos de outro condomínio'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM pessoas WHERE id::text IN ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2')$q$,
    2,
    'síndico vê pessoas dos vínculos do seu condomínio'
);

SELECT pg_temp.logout();

-- ============================================================
-- TESTS — ADMIN
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc4');

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text LIKE 'aaaaaaaa-aaaa-4aaa-8aaa-%' OR id::text LIKE 'bbbbbbbb-bbbb-4bbb-8bbb-%'$q$,
    3,
    'admin vê todas as 3 unidades de teste'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE auth_user_id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    3,
    'admin vê todos os 3 vínculos (ativos e desabilitado)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM pessoas WHERE id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    5,
    'admin vê todas as 5 pessoas de teste'
);

SELECT pg_temp.logout();

-- ============================================================
-- TESTS — OUTSIDER (sem vínculo, sem síndico, sem admin)
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc5');

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidades WHERE id::text LIKE 'aaaaaaaa-aaaa-4aaa-8aaa-%' OR id::text LIKE 'bbbbbbbb-bbbb-4bbb-8bbb-%'$q$,
    0,
    'outsider NÃO vê nenhuma unidade'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM unidade_acessos WHERE auth_user_id::text LIKE 'cccccccc-cccc-4ccc-8ccc-%'$q$,
    0,
    'outsider NÃO vê nenhum vínculo (nem o próprio, pois não tem vínculo)'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM pessoas WHERE id::text != 'cccccccc-cccc-4ccc-8ccc-ccccccccccc5'$q$,
    0,
    'outsider NÃO vê outras pessoas'
);

SELECT pg_temp.assert_count(
    $q$SELECT 1 FROM pessoas WHERE id::text = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc5'$q$,
    1,
    'outsider vê a própria pessoa (pessoa_self_select)'
);

SELECT pg_temp.logout();

-- ============================================================
-- TESTS — get_my_unidade_ids() function
-- ============================================================

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc1');
SELECT pg_temp.assert_count(
    'SELECT 1 FROM (SELECT get_my_unidade_ids()) AS x',
    1,
    'get_my_unidade_ids() retorna 1 UUID pro morador A'
);
SELECT pg_temp.logout();

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc2');
SELECT pg_temp.assert_count(
    'SELECT 1 FROM (SELECT get_my_unidade_ids()) AS x',
    1,
    'get_my_unidade_ids() retorna apenas o vínculo ATIVO pro morador B (filtra desabilitado)'
);
SELECT pg_temp.logout();

SELECT pg_temp.login_as('cccccccc-cccc-4ccc-8ccc-ccccccccccc5');
SELECT pg_temp.assert_count(
    'SELECT 1 FROM (SELECT get_my_unidade_ids()) AS x',
    0,
    'get_my_unidade_ids() retorna vazio pro outsider'
);
SELECT pg_temp.logout();

-- ============================================================
-- ROLLBACK — limpa todas as fixtures + funções helper
-- ============================================================

ROLLBACK;
