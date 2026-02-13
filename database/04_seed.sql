-- ============================================================
-- 04_seed.sql — Dados iniciais para desenvolvimento
-- ============================================================
-- Executar APÓS todos os scripts anteriores.
-- Cria dados de teste para validar o sistema.
--
-- ⚠️ NÃO executar em produção — apenas dev/staging.
--
-- NOTA: Para criar o admin, primeiro crie um usuário no
-- Supabase Auth (Dashboard > Authentication > Users > Add User)
-- e substitua 'SEU_AUTH_USER_ID_ADMIN' pelo UUID gerado.
-- ============================================================

-- ===================
-- Admin (ajuste o UUID após criar o user no Auth)
-- ===================
-- INSERT INTO admin_users (auth_user_id, nome)
-- VALUES ('SEU_AUTH_USER_ID_ADMIN', 'Administrador');

-- ===================
-- Condomínios de teste
-- ===================
-- Jardim das Flores: água (medidor único) + gás + envio morador
-- Monte Azul: água (medidor único) apenas
-- Vila Verde: água fria + água quente (2 hidrômetros) + gás + envio morador
-- Parque das Águas: água (medidor único) apenas
INSERT INTO condominios (id, nome, tem_agua, tem_agua_quente, tem_gas, envio_leitura_morador_habilitado)
VALUES
    ('a0000001-0000-0000-0000-000000000001', 'Residencial Jardim das Flores', TRUE, FALSE, TRUE, TRUE),
    ('a0000001-0000-0000-0000-000000000002', 'Edifício Monte Azul', TRUE, FALSE, FALSE, FALSE),
    ('a0000001-0000-0000-0000-000000000003', 'Condomínio Vila Verde', TRUE, TRUE, TRUE, TRUE),
    ('a0000001-0000-0000-0000-000000000004', 'Residencial Parque das Águas', TRUE, FALSE, FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- ===================
-- Unidades de teste (Jardim das Flores)
-- ===================
INSERT INTO unidades (id, condominio_id, bloco, apartamento)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Torre A', 'Apto 101'),
    ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Torre A', 'Apto 102'),
    ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Torre A', 'Apto 201'),
    ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Torre B', 'Apto 101')
ON CONFLICT DO NOTHING;

-- Unidades (Monte Azul)
INSERT INTO unidades (id, condominio_id, bloco, apartamento)
VALUES
    ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000002', 'Bloco Único', 'Apto 301'),
    ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000002', 'Bloco Único', 'Apto 302')
ON CONFLICT DO NOTHING;

-- Unidades (Vila Verde — com água quente)
INSERT INTO unidades (id, condominio_id, bloco, apartamento)
VALUES
    ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000003', 'Bloco A', 'Apto 101'),
    ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000003', 'Bloco A', 'Apto 102')
ON CONFLICT DO NOTHING;

-- ===================
-- Leituras de teste (Jardim das Flores — Apto 101, Torre A)
-- Últimos 6 meses de água (medidor único) e gás
-- ===================
INSERT INTO leituras_mensais (unidade_id, tipo, mes_referencia, data_leitura, medicao, valor)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2026-02', '2026-02-10', 18.00, 95.40),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2026-02', '2026-02-10', 6.00,  42.00),
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2026-01', '2026-01-12', 21.00, 108.50),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2026-01', '2026-01-12', 7.00,  48.30),
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2025-12', '2025-12-14', 25.00, 126.00),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2025-12', '2025-12-14', 5.00,  35.50),
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2025-11', '2025-11-11', 19.00, 99.80),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2025-11', '2025-11-11', 8.00,  55.00),
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2025-10', '2025-10-13', 22.00, 113.40),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2025-10', '2025-10-13', 9.00,  61.20),
    ('b0000001-0000-0000-0000-000000000001', 'agua', '2025-09', '2025-09-10', 16.00, 84.00),
    ('b0000001-0000-0000-0000-000000000001', 'gas',  '2025-09', '2025-09-10', 4.00,  28.80)
ON CONFLICT DO NOTHING;

-- ===================
-- Leituras de teste (Vila Verde — Apto 101, Bloco A)
-- 3 meses de água fria + água quente + gás
-- ===================
INSERT INTO leituras_mensais (unidade_id, tipo, mes_referencia, data_leitura, medicao, valor)
VALUES
    ('b0000001-0000-0000-0000-000000000007', 'agua_fria',    '2026-02', '2026-02-10', 12.00, 63.60),
    ('b0000001-0000-0000-0000-000000000007', 'agua_quente',  '2026-02', '2026-02-10', 5.00,  45.00),
    ('b0000001-0000-0000-0000-000000000007', 'gas',          '2026-02', '2026-02-10', 4.00,  28.80),
    ('b0000001-0000-0000-0000-000000000007', 'agua_fria',    '2026-01', '2026-01-12', 14.00, 74.20),
    ('b0000001-0000-0000-0000-000000000007', 'agua_quente',  '2026-01', '2026-01-12', 6.00,  54.00),
    ('b0000001-0000-0000-0000-000000000007', 'gas',          '2026-01', '2026-01-12', 5.00,  35.50),
    ('b0000001-0000-0000-0000-000000000007', 'agua_fria',    '2025-12', '2025-12-14', 10.00, 53.00),
    ('b0000001-0000-0000-0000-000000000007', 'agua_quente',  '2025-12', '2025-12-14', 4.00,  36.00),
    ('b0000001-0000-0000-0000-000000000007', 'gas',          '2025-12', '2025-12-14', 3.00,  21.60)
ON CONFLICT DO NOTHING;

-- ===================
-- Moradores (Para criar um usuário de teste)
-- ===================
-- 1. Crie um usuário no Supabase Auth (Dashboard > Authentication > Passwords > Add User)
-- 2. Copie o UUID do usuário criado (User UID)
-- 3. Execute o script abaixo substituindo 'SEU_UUID_AQUI':

-- INSERT INTO moradores (unidade_id, auth_user_id, nome, email, telefone)
-- VALUES (
--     'b0000001-0000-0000-0000-000000000001', -- Apto 101, Torre A (Jardim das Flores)
--     'SEU_UUID_AQUI',                        -- UUID do Supabase Auth
--     'João Silva',
--     'joao@email.com',
--     '11999999999'
-- );
