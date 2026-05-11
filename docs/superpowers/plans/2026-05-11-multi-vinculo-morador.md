# Multi-vínculo Morador ↔ Unidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir N usuários por unidade e N unidades por usuário, substituindo a tabela `moradores` (1:1) pelo par `pessoas` + `unidade_acessos` (N:N), com tipos `proprietario`/`locatario`/NULL e flag `ativo` para soft-disable.

**Architecture:** 3 commits coordenados — (1) schema novo coexistindo com `moradores`; (2) cutover de RLS, server actions e UIs; (3) DROP da tabela antiga após validação em produção. URL do portal morador reestrutura para `/app/u/[unidadeId]/...` para páginas unit-scoped. Backward-compat via redirects 308 nas URLs antigas.

**Tech Stack:** Postgres (Supabase), Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4. Sem framework de teste — verificação via `npx tsc --noEmit` + queries SQL + QA visual em `npm run dev`.

**Spec reference:** `docs/superpowers/specs/2026-05-11-multi-vinculo-morador-design.md`

⚠️ **Plano grande.** Recomendado executar fase a fase, com pausas entre commits. Especialmente importante: validar produção entre commit 2 e commit 3.

⚠️ **RLS é segurança crítica.** Sem testes automatizados, o risco de regressão de acesso indevido é real. Validação manual rigorosa (Task 12) é o único safety net — não pular.

---

## File Structure

### Criar (commit 1)

| Arquivo | Responsabilidade |
|---|---|
| `database/11_pessoas_and_unidade_acessos.sql` | Cria `pessoas`, `unidade_acessos`, trigger, RLS pras novas tabelas, migra dados |

### Criar (commit 2)

| Arquivo | Responsabilidade |
|---|---|
| `database/12_update_rls_for_acessos.sql` | Substitui `get_my_unidade_id()` por `get_my_unidade_ids()`, atualiza policies existentes |
| `src/components/morador/UnitDropdown.tsx` | Dropdown de troca de unidade no header (visível com 2+ vínculos) |
| `src/components/morador/UnitSelectorPage.tsx` | Tela `/app` quando user tem 2+ vínculos (cards) |
| `src/components/admin/AcessosList.tsx` | Tabela de vínculos no detalhe da unidade |
| `src/components/admin/AddAcessoDialog.tsx` | Dialog "Adicionar acesso" (modos novo/existente) |
| `src/app/app/u/[unidadeId]/layout.tsx` | Layout das rotas unit-scoped (verifica RLS + header) |
| `src/app/app/u/[unidadeId]/page.tsx` | Dashboard da unidade (movido de `/app/page.tsx`) |
| `src/app/app/u/[unidadeId]/enviar-leitura/page.tsx` | Form (movido de `/app/enviar-leitura`) |
| `src/app/app/u/[unidadeId]/leituras/page.tsx` | Histórico (movido de `/app/leituras`) |
| `src/app/app/u/[unidadeId]/leituras/[mes]/page.tsx` | Detalhe do mês (movido de `/app/leituras/[mes]`) |

### Modificar (commit 2)

| Arquivo | Mudança |
|---|---|
| `src/types/index.ts` | Adicionar `Pessoa`, `UnidadeAcesso`, `TipoAcesso`. Marcar `MoradorData` como deprecated |
| `src/lib/adminPreview.ts` | `resolveMoradorPortalContext` retorna lista de vínculos; nova função `resolveUnidadeContextById` para unit-scoped pages |
| `src/actions/acessoActions.ts` | Reescrita: `createAcesso` 2 modos, `updatePessoa`, `updateAuthCredentials`, `updateAcesso`, `toggleAcessoAtivo`, `deleteAcesso`, `deleteUsuario` |
| `src/actions/moradorActions.ts` | `enviarLeitura` recebe `unidadeId` explícito |
| `src/app/app/page.tsx` | Vira gateway (0/1/2+ vínculos → tela ou redirect) |
| `src/app/app/enviar-leitura/page.tsx` | Vira redirect 308 → `/app/u/[id]/enviar-leitura` (backward-compat) |
| `src/app/app/leituras/page.tsx` | Vira redirect 308 → `/app/u/[id]/leituras` |
| `src/app/app/leituras/[mes]/page.tsx` | Vira redirect 308 → `/app/u/[id]/leituras/[mes]` |
| `src/app/admin/moradores/[id]/page.tsx` | Reescrita: lista N acessos, dialog "Adicionar acesso" |
| `src/app/admin/moradores/page.tsx` | Coluna "Morador" vira "Acessos" com contador |
| `src/app/sindico/condominios/[id]/page.tsx` | Coluna "Morador" vira contador |

### Não mover (mantém em `/app/` por serem user-scoped, não unit-scoped)

- `src/app/app/senha/page.tsx` — troca de senha é do USUÁRIO, não da unidade
- `src/app/app/suporte/page.tsx` — suporte é do USUÁRIO; pode mencionar qualquer unidade dele
- `src/app/app/layout.tsx` — layout genérico do portal, sem header de unidade

### Criar (commit 3)

| Arquivo | Responsabilidade |
|---|---|
| `database/13_drop_moradores.sql` | `DROP TABLE moradores` |

### Modificar (commit 3)

| Arquivo | Mudança |
|---|---|
| `src/types/index.ts` | Remover `MoradorData` (já estava deprecated) |
| Páginas redirect antigas | Opcionalmente remover após algumas semanas (deixar nessa fase) |

---

# FASE 1 — Commit 1: Schema novo (additive, app continua usando moradores)

Objetivo: criar `pessoas` e `unidade_acessos` em paralelo, copiar dados, deixar `moradores` intacta. App não muda; nada quebra. Pré-requisito pro commit 2.

## Task 1: Criar migration SQL e aplicar em dev

**Files:**
- Create: `database/11_pessoas_and_unidade_acessos.sql`

- [ ] **Step 1.1: Criar arquivo de migration com o SQL completo**

```sql
-- ============================================================
-- 11_pessoas_and_unidade_acessos.sql
-- Cria tabelas pessoas e unidade_acessos (substituem moradores N:N)
-- Mantém moradores intacta como backup (drop apenas no commit 3)
-- ============================================================

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

CREATE INDEX idx_acessos_unidade ON unidade_acessos(unidade_id);
CREATE INDEX idx_acessos_auth ON unidade_acessos(auth_user_id);
CREATE INDEX idx_acessos_unidade_ativo ON unidade_acessos(unidade_id) WHERE ativo;

CREATE TRIGGER trg_acessos_updated_at
    BEFORE UPDATE ON unidade_acessos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- RLS — pessoas
-- ===================
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_pessoas_all ON pessoas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY pessoa_self_select ON pessoas
    FOR SELECT USING (id = auth.uid());

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

CREATE POLICY admin_acessos_all ON unidade_acessos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY acesso_self_select ON unidade_acessos
    FOR SELECT USING (auth_user_id = auth.uid());

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
```

- [ ] **Step 1.2: Antes de aplicar, gerar relatório de moradores órfãos**

Conectar no Supabase SQL Editor (dashboard do projeto) e rodar:

```sql
SELECT id, unidade_id, nome, email, created_at
FROM moradores
WHERE auth_user_id IS NULL
ORDER BY created_at;
```

Salvar resultado num arquivo local (ex: `database/orphan-moradores-2026-05-11.txt`) **fora do git** para revisão. São esperadas 0 ou poucas linhas; se houver muitas, parar e investigar.

- [ ] **Step 1.3: Aplicar migration em dev**

Abrir Supabase SQL Editor → cole o conteúdo de `database/11_pessoas_and_unidade_acessos.sql` → Run. Esperar "Success".

Se der erro de duplicação de policy (`policy already exists`), significa que a migration foi parcialmente aplicada antes — investigar antes de prosseguir.

- [ ] **Step 1.4: Verificar dados migrados**

No SQL Editor:

```sql
-- Esses dois COUNT devem ser iguais:
SELECT COUNT(*) AS moradores_validos FROM moradores WHERE auth_user_id IS NOT NULL;
SELECT COUNT(*) AS unidade_acessos_total FROM unidade_acessos;

-- E esses também devem ser iguais (1 pessoa por auth_user_id distinto em moradores):
SELECT COUNT(DISTINCT auth_user_id) AS auth_users_distintos FROM moradores WHERE auth_user_id IS NOT NULL;
SELECT COUNT(*) AS pessoas_total FROM pessoas;

-- Sanity: nenhum unidade_acesso deve ter tipo preenchido (todos NULL = legado)
SELECT COUNT(*) FROM unidade_acessos WHERE tipo IS NOT NULL;  -- deve retornar 0

-- Sanity: todos ativos
SELECT COUNT(*) FROM unidade_acessos WHERE ativo = FALSE;  -- deve retornar 0
```

Se algum count não bater, investigar antes de seguir. NÃO commitar ainda.

- [ ] **Step 1.5: Verificar trigger funciona pra novos usuários**

No SQL Editor (cuidado: cria user real em dev):

```sql
-- Criar user de teste via auth.users (use um email descartável)
-- Em ambiente dev/test do Supabase você pode também criar via dashboard
-- Aqui o teste é a INSERT direta no auth (apenas funciona como service role):
INSERT INTO auth.users (id, email, raw_user_meta_data, instance_id, aud, role)
VALUES (
    gen_random_uuid(),
    'teste-trigger@example.com',
    jsonb_build_object('nome', 'Trigger Test User'),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
)
RETURNING id;

-- Verificar que pessoa foi criada automaticamente
SELECT * FROM pessoas WHERE nome = 'Trigger Test User';

-- Cleanup
DELETE FROM auth.users WHERE email = 'teste-trigger@example.com';
-- (cascade vai limpar pessoas)
SELECT * FROM pessoas WHERE nome = 'Trigger Test User';  -- deve retornar 0 linhas
```

- [ ] **Step 1.6: Verificar RLS das novas tabelas**

Ainda no SQL Editor (que roda como service_role e ignora RLS), verificar que as policies foram criadas:

```sql
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE tablename IN ('pessoas', 'unidade_acessos')
ORDER BY tablename, policyname;
```

Esperado: 6 linhas (3 policies por tabela: admin_*, *_self_select, sindico_*).

Para teste funcional do RLS (opcional mas recomendado), abrir o app em dev, logar como morador existente e checar:

```sql
-- (Substitua o JWT por um do seu próprio user de morador. Ou use o Supabase
-- dashboard "Test as user" feature.)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"<auth_user_id_do_morador>"}';

SELECT * FROM pessoas;            -- deve retornar 1 linha (a própria)
SELECT * FROM unidade_acessos;    -- deve retornar 1+ linhas (vínculos do user)
```

- [ ] **Step 1.7: Stage e commit (commit 1)**

```bash
git add database/11_pessoas_and_unidade_acessos.sql
git status  # confirmar que SÓ esse arquivo foi staged
git commit -m "$(cat <<'EOF'
Add pessoas and unidade_acessos tables (multi-vínculo schema, additive)

Creates the new N:N schema (pessoas mirrors auth.users, unidade_acessos
replaces moradores conceptually) alongside the existing moradores table.
Migrates existing data; moradores stays intact as backup. App still uses
moradores — cutover happens in commit 2.

Trigger on_auth_user_created auto-populates pessoas for new auth users.
Existing auth users are populated by the data migration block.

Spec: docs/superpowers/specs/2026-05-11-multi-vinculo-morador-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Push opcional aqui — esse commit é safe pra produção** (additive, app não usa nada novo). Se quiser deploy parcial pra "preparar terreno", esse é o momento.

---

# FASE 2 — Commit 2: Cutover do app

Objetivo: refactorar RLS, server actions, lib, URLs e UIs pra usar `unidade_acessos`. Mantém `moradores` no banco como backup. Esse é o commit grande.

⚠️ **Sequência importa.** Tasks dependem das anteriores. Não pular ordem.

## Task 2: Migration SQL — nova função e atualização de policies existentes

**Files:**
- Create: `database/12_update_rls_for_acessos.sql`

- [ ] **Step 2.1: Criar a migration SQL**

```sql
-- ============================================================
-- 12_update_rls_for_acessos.sql
-- Substitui get_my_unidade_id() por get_my_unidade_ids() (set)
-- Atualiza policies que referenciavam moradores via essa função
-- ============================================================

-- Nova função (plural; filtra por ativo)
CREATE OR REPLACE FUNCTION get_my_unidade_ids()
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT unidade_id FROM unidade_acessos
    WHERE auth_user_id = auth.uid() AND ativo = TRUE
$$;

COMMENT ON FUNCTION get_my_unidade_ids IS 'Retorna IDs das unidades com vínculo ativo do user logado. Substitui get_my_unidade_id() singular.';

-- ============================================================
-- Atualizar policies existentes que usavam get_my_unidade_id()
-- ============================================================

-- unidades: SELECT pro morador (era: id = get_my_unidade_id())
DROP POLICY IF EXISTS morador_unidades_select ON unidades;
CREATE POLICY morador_unidades_select ON unidades
    FOR SELECT USING (id IN (SELECT get_my_unidade_ids()));

-- leituras_mensais: SELECT pelo morador (suas próprias unidades)
DROP POLICY IF EXISTS morador_leituras_select ON leituras_mensais;
CREATE POLICY morador_leituras_select ON leituras_mensais
    FOR SELECT USING (unidade_id IN (SELECT get_my_unidade_ids()));

-- leituras_mensais: INSERT pelo morador
DROP POLICY IF EXISTS morador_leituras_insert ON leituras_mensais;
CREATE POLICY morador_leituras_insert ON leituras_mensais
    FOR INSERT WITH CHECK (
        unidade_id IN (SELECT get_my_unidade_ids())
        AND criado_por_morador = TRUE
    );

-- leituras_mensais: UPDATE pelo morador (se aplicável conforme spec original)
DROP POLICY IF EXISTS morador_leituras_update ON leituras_mensais;
CREATE POLICY morador_leituras_update ON leituras_mensais
    FOR UPDATE USING (
        unidade_id IN (SELECT get_my_unidade_ids())
        AND criado_por_morador = TRUE
    );

-- fotos_leitura: SELECT pelo morador (via JOIN com leituras_mensais)
DROP POLICY IF EXISTS morador_fotos_select ON fotos_leitura;
CREATE POLICY morador_fotos_select ON fotos_leitura
    FOR SELECT USING (
        leitura_id IN (
            SELECT id FROM leituras_mensais
            WHERE unidade_id IN (SELECT get_my_unidade_ids())
        )
    );

-- fotos_leitura: INSERT pelo morador
DROP POLICY IF EXISTS morador_fotos_insert ON fotos_leitura;
CREATE POLICY morador_fotos_insert ON fotos_leitura
    FOR INSERT WITH CHECK (
        leitura_id IN (
            SELECT id FROM leituras_mensais
            WHERE unidade_id IN (SELECT get_my_unidade_ids())
        )
    );

-- ============================================================
-- IMPORTANTE: Storage RLS (database/07_fix_storage_policy_unit_owner.sql)
-- também usa get_my_unidade_id(). Atualizar via Supabase dashboard:
-- Storage → Policies → editar a policy do bucket 'fotos-leitura'
-- substituindo `= get_my_unidade_id()` por `IN (SELECT get_my_unidade_ids())`
-- ou recriar a policy via SQL aqui.
-- ============================================================

-- ============================================================
-- Manter get_my_unidade_id() funcional por compat (retorna NULL ou primeira)
-- Vai ser dropada no commit 3.
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_unidade_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT unidade_id FROM unidade_acessos
    WHERE auth_user_id = auth.uid() AND ativo = TRUE
    LIMIT 1
$$;

COMMENT ON FUNCTION get_my_unidade_id IS 'DEPRECATED: usar get_my_unidade_ids(). Mantida para compat até cleanup no commit 3.';
```

- [ ] **Step 2.2: Antes de aplicar, listar policies que usam get_my_unidade_id**

```sql
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE qual LIKE '%get_my_unidade_id%'
ORDER BY tablename, policyname;
```

Anotar resultado. Se aparecerem policies além das listadas em Step 2.1, **adicionar ao SQL antes de aplicar**. As listadas são as mapeadas em `database/02_rls_policies.sql`; sistema pode ter outras se foram criadas via dashboard.

- [ ] **Step 2.3: Aplicar migration em dev**

Cole `database/12_update_rls_for_acessos.sql` no Supabase SQL Editor → Run.

Verificar que ainda não há erro:

```sql
SELECT proname FROM pg_proc WHERE proname IN ('get_my_unidade_id', 'get_my_unidade_ids');
-- Deve retornar ambas
```

- [ ] **Step 2.4: Atualizar Storage policies via dashboard**

Abrir Supabase Dashboard → Storage → bucket `fotos-leitura` (ou nome do bucket atual) → Policies. Para cada policy que mencione `get_my_unidade_id()`, editar substituindo:

```
WHERE storage.foldername(name)[1] = get_my_unidade_id()::text
```

Por:

```
WHERE storage.foldername(name)[1] IN (SELECT get_my_unidade_ids()::text)
```

(O cast `::text` é necessário porque storage path é text.)

NÃO commitar ainda.

## Task 3: TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 3.1: Adicionar novos tipos antes do `MoradorData`**

Editar `src/types/index.ts`. Adicionar entre as interfaces existentes (após `Unidade`, antes de `LeituraMensal`):

```ts
export type TipoAcesso = 'proprietario' | 'locatario';

export interface Pessoa {
  id: string;          // = auth.users.id
  nome: string | null;
}

export interface UnidadeAcesso {
  id: string;
  unidadeId: string;
  authUserId: string;
  tipo: TipoAcesso | null;
  ativo: boolean;
  pessoa?: Pessoa;
  unidade?: Unidade;
}
```

- [ ] **Step 3.2: Marcar `MoradorData` como deprecated**

No bloco existente do `MoradorData`, adicionar comentário:

```ts
/** @deprecated Use UnidadeAcesso. Será removido após cleanup do refactor multi-vínculo. */
export interface MoradorData {
  id: string;
  authUserId: string;
  nome: string;
  unidadeId: string;
  unidade?: Unidade;
}
```

- [ ] **Step 3.3: Type-check**

```bash
npx tsc --noEmit
```

Esperado: passa sem erros (ainda não usamos os novos tipos em nada).

## Task 4: Refactor de `lib/adminPreview.ts` — context plural

**Files:**
- Modify: `src/lib/adminPreview.ts`

⚠️ **Esta task tem alto blast radius.** `resolveMoradorPortalContext` é usado em 6 lugares. Mudar a assinatura quebra todos. Vamos manter compatibilidade adicionando uma função NOVA pra o caso plural, sem quebrar a antiga (deprecate-in-place).

- [ ] **Step 4.1: Adicionar nova função `resolveMoradorPortalContextPlural`**

Em `src/lib/adminPreview.ts`, ao final do arquivo (depois de `resolveMoradorPortalContext`), adicionar:

```ts
import type { UnidadeAcesso } from '@/types';

export type MoradorPortalContextPlural = {
    mode: 'morador' | 'admin_preview';
    vinculos: Array<{
        unidadeId: string;
        unidade: { id: string; bloco: string; apartamento: string };
        condominio: {
            id: string;
            nome: string;
            temAgua: boolean;
            temAguaQuente: boolean;
            temGas: boolean;
            envioLeituraMoradorHabilitado: boolean;
        };
        tipo: 'proprietario' | 'locatario' | null;
    }>;
};

export async function resolveMoradorPortalContextPlural(
    supabase: { from: (table: string) => unknown },
    authUserId: string
): Promise<MoradorPortalContextPlural | null> {
    // Caso admin_preview: redireciona para o caso single-context (compat)
    const previewPayload = await getAdminMoradorPreviewPayload();
    if (previewPayload && previewPayload.adminAuthUserId === authUserId) {
        const isAdmin = await isAdminAuthUser(supabase as never, authUserId);
        if (isAdmin) {
            const previewContext = await getMoradorContextByUnidadeId(supabase as never, previewPayload.unidadeId);
            if (previewContext) {
                return {
                    mode: 'admin_preview',
                    vinculos: [{
                        unidadeId: previewContext.unidade.id,
                        unidade: previewContext.unidade,
                        condominio: previewContext.condominio,
                        tipo: null,
                    }],
                };
            }
        }
    }

    // Caso normal: buscar todos os vínculos ativos do user
    const { data: acessos, error } = await (supabase
        .from('unidade_acessos') as { select: (q: string) => { eq: (col: string, val: unknown) => { eq: (col: string, val: unknown) => Promise<{ data: unknown[]; error: unknown }> } } })
        .select(`
            id,
            unidade_id,
            tipo,
            unidade:unidades (
                id,
                bloco,
                apartamento,
                condominio:condominios (
                    id,
                    nome,
                    tem_agua,
                    tem_agua_quente,
                    tem_gas,
                    envio_leitura_morador_habilitado
                )
            )
        `)
        .eq('auth_user_id', authUserId)
        .eq('ativo', true);

    if (error || !acessos || acessos.length === 0) return null;

    const vinculos = (acessos as Array<{
        unidade_id: string;
        tipo: 'proprietario' | 'locatario' | null;
        unidade: {
            id: string;
            bloco: string;
            apartamento: string;
            condominio: {
                id: string;
                nome: string;
                tem_agua: boolean;
                tem_agua_quente: boolean;
                tem_gas: boolean;
                envio_leitura_morador_habilitado: boolean;
            };
        } | null;
    }>)
        .filter((a) => a.unidade && a.unidade.condominio)
        .map((a) => ({
            unidadeId: a.unidade_id,
            unidade: {
                id: a.unidade!.id,
                bloco: a.unidade!.bloco,
                apartamento: a.unidade!.apartamento,
            },
            condominio: {
                id: a.unidade!.condominio.id,
                nome: a.unidade!.condominio.nome,
                temAgua: a.unidade!.condominio.tem_agua,
                temAguaQuente: a.unidade!.condominio.tem_agua_quente,
                temGas: a.unidade!.condominio.tem_gas,
                envioLeituraMoradorHabilitado: a.unidade!.condominio.envio_leitura_morador_habilitado,
            },
            tipo: a.tipo,
        }));

    return { mode: 'morador', vinculos };
}

/**
 * Resolve o contexto de UMA unidade específica para o user logado.
 * Usado nas páginas /app/u/[unidadeId]/* — verifica que o user tem
 * vínculo ativo com essa unidade. Retorna null se não tiver acesso
 * (a página deve chamar notFound()).
 */
export async function resolveUnidadeContextById(
    supabase: { from: (table: string) => unknown },
    authUserId: string,
    unidadeId: string,
): Promise<MoradorPortalContextPlural['vinculos'][number] | null> {
    const ctx = await resolveMoradorPortalContextPlural(supabase, authUserId);
    if (!ctx) return null;
    return ctx.vinculos.find((v) => v.unidadeId === unidadeId) ?? null;
}
```

- [ ] **Step 4.2: Manter a função antiga `resolveMoradorPortalContext` funcional**

Ela já existe e continua usada pelas páginas legadas (que viram redirects). Não tocar nela ainda — vai ser removida em conjunto com as páginas redirect na limpeza opcional pós-commit 3.

Adicionar comentário JSDoc:

```ts
/**
 * @deprecated Usar resolveMoradorPortalContextPlural ou resolveUnidadeContextById
 * para suporte a multi-vínculo. Esta função retorna apenas o primeiro vínculo,
 * mantida para backward-compat com páginas legadas /app/* (redirects).
 */
export async function resolveMoradorPortalContext(...
```

- [ ] **Step 4.3: Type-check**

```bash
npx tsc --noEmit
```

Esperado: passa sem erros.

## Task 5: Refactor de `acessoActions.ts`

**Files:**
- Modify: `src/actions/acessoActions.ts` (rewrite ~major)

⚠️ Substituição grande. Esse arquivo tem 200+ linhas hoje; vai ficar maior.

- [ ] **Step 5.1: Importar tipos novos no topo do arquivo**

Adicionar imports necessários:

```ts
import type { TipoAcesso } from '@/types';
```

- [ ] **Step 5.2: Atualizar `createAcessoSchema` e adicionar 2 modos**

Substituir o schema existente e a função `createAcesso`:

```ts
const createAcessoSchema = z.object({
    unidade_id: z.string().uuid('Unidade inválida'),
    modo: z.enum(['novo_usuario', 'usuario_existente']),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().optional(),  // obrigatória só no modo novo_usuario
    tipo: z.enum(['proprietario', 'locatario']).optional(),
});

export async function createAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const adminClient = createAdminClient();

    const parsed = createAcessoSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        modo: formData.get('modo'),
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha') || undefined,
        tipo: formData.get('tipo') || undefined,
    });

    const unidadeId = String(formData.get('unidade_id') || '');

    if (!parsed.success) {
        redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Dados inválidos: ' + parsed.error.issues[0].message)}`);
    }

    const { modo, nome, email, senha, tipo } = parsed.data;

    if (modo === 'novo_usuario') {
        if (!senha || senha.length < 6) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Senha deve ter no mínimo 6 caracteres')}`);
        }

        // Cria auth.users (trigger cria pessoas; user_metadata.nome vai pra pessoas.nome)
        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
            user_metadata: { nome: nome ?? null },
        });

        if (createErr || !created?.user) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Erro ao criar usuário: ' + (createErr?.message ?? 'desconhecido'))}`);
        }

        const newAuthUserId = created.user.id;

        // Insere vínculo
        const { error: insertErr } = await supabase.from('unidade_acessos').insert({
            unidade_id: parsed.data.unidade_id,
            auth_user_id: newAuthUserId,
            tipo: tipo ?? null,
            ativo: true,
        });

        if (insertErr) {
            // Rollback do user pra evitar órfão
            await adminClient.auth.admin.deleteUser(newAuthUserId);
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Erro ao criar vínculo: ' + insertErr.message)}`);
        }
    } else {
        // modo === 'usuario_existente'
        // Buscar auth user pelo email
        const { data: existingList, error: listErr } = await adminClient.auth.admin.listUsers();
        if (listErr) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Erro ao buscar usuário: ' + listErr.message)}`);
        }

        const existing = existingList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Nenhum usuário encontrado com esse email')}`);
        }

        // Verificar se já existe vínculo nessa unidade
        const { data: existingAcesso } = await supabase
            .from('unidade_acessos')
            .select('id')
            .eq('unidade_id', parsed.data.unidade_id)
            .eq('auth_user_id', existing.id)
            .maybeSingle();

        if (existingAcesso) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Esse usuário já tem vínculo com esta unidade')}`);
        }

        const { error: insertErr } = await supabase.from('unidade_acessos').insert({
            unidade_id: parsed.data.unidade_id,
            auth_user_id: existing.id,
            tipo: tipo ?? null,
            ativo: true,
        });

        if (insertErr) {
            redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Erro ao criar vínculo: ' + insertErr.message)}`);
        }
    }

    revalidatePath(`/admin/moradores/${unidadeId}`);
    redirect(`/admin/moradores/${unidadeId}?success=${encodeMessage('Acesso criado com sucesso')}`);
}
```

- [ ] **Step 5.3: Substituir `updateAcesso` por 3 ações separadas**

Remover a `updateAcesso` antiga e adicionar:

```ts
// Atualiza nome em pessoas (user-level)
const updatePessoaSchema = z.object({
    auth_user_id: z.string().uuid(),
    nome: z.string().trim(),
    return_path: z.string().optional(),
});

export async function updatePessoa(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = updatePessoaSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        nome: formData.get('nome'),
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    const { error } = await supabase
        .from('pessoas')
        .update({ nome: parsed.data.nome })
        .eq('id', parsed.data.auth_user_id);

    if (error) {
        redirect((parsed.data.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(parsed.data.return_path ?? '/admin/moradores');
    redirect((parsed.data.return_path ?? '/admin/moradores') + `?success=${encodeMessage('Nome atualizado')}`);
}

// Atualiza email/senha em auth.users (admin-level)
const updateCredentialsSchema = z.object({
    auth_user_id: z.string().uuid(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    return_path: z.string().optional(),
});

export async function updateAuthCredentials(formData: FormData) {
    await ensureAdmin();
    const adminClient = createAdminClient();

    const parsed = updateCredentialsSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        email: formData.get('email') || undefined,
        senha: formData.get('senha') || undefined,
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    const { email, senha, auth_user_id, return_path } = parsed.data;
    const updates: Record<string, string> = {};
    if (email) updates.email = email;
    if (senha) updates.password = senha;

    if (Object.keys(updates).length === 0) {
        redirect((return_path ?? '/admin/moradores') + `?error=${encodeMessage('Nada para atualizar')}`);
    }

    const { error } = await adminClient.auth.admin.updateUserById(auth_user_id, updates);

    if (error) {
        redirect((return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(return_path ?? '/admin/moradores');
    redirect((return_path ?? '/admin/moradores') + `?success=${encodeMessage('Credenciais atualizadas')}`);
}

// Atualiza tipo do vínculo
const updateAcessoTipoSchema = z.object({
    acesso_id: z.string().uuid(),
    tipo: z.enum(['proprietario', 'locatario', '']),  // string vazia = NULL
    return_path: z.string().optional(),
});

export async function updateAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = updateAcessoTipoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        tipo: formData.get('tipo'),
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    const tipoValue = parsed.data.tipo === '' ? null : parsed.data.tipo;

    const { error } = await supabase
        .from('unidade_acessos')
        .update({ tipo: tipoValue })
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect((parsed.data.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(parsed.data.return_path ?? '/admin/moradores');
    redirect((parsed.data.return_path ?? '/admin/moradores') + `?success=${encodeMessage('Tipo atualizado')}`);
}
```

- [ ] **Step 5.4: Adicionar `toggleAcessoAtivo`**

```ts
const toggleAcessoSchema = z.object({
    acesso_id: z.string().uuid(),
    ativo: z.enum(['true', 'false']),
    return_path: z.string().optional(),
});

export async function toggleAcessoAtivo(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = toggleAcessoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        ativo: formData.get('ativo'),
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    const novoAtivo = parsed.data.ativo === 'true';

    const { error } = await supabase
        .from('unidade_acessos')
        .update({ ativo: novoAtivo })
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect((parsed.data.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(parsed.data.return_path ?? '/admin/moradores');
    redirect((parsed.data.return_path ?? '/admin/moradores') + `?success=${encodeMessage(novoAtivo ? 'Acesso reativado' : 'Acesso desabilitado')}`);
}
```

- [ ] **Step 5.5: Substituir `deleteAcesso` (agora apaga só 1 vínculo)**

Substituir a função `deleteAcesso` antiga (que apagava morador + auth.users) por:

```ts
const deleteAcessoSchema = z.object({
    acesso_id: z.string().uuid(),
    return_path: z.string().optional(),
});

export async function deleteAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = deleteAcessoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    const { error } = await supabase
        .from('unidade_acessos')
        .delete()
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect((parsed.data.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(parsed.data.return_path ?? '/admin/moradores');
    redirect((parsed.data.return_path ?? '/admin/moradores') + `?success=${encodeMessage('Vínculo excluído')}`);
}
```

- [ ] **Step 5.6: Adicionar `deleteUsuario` (apaga auth user + cascade)**

```ts
const deleteUsuarioSchema = z.object({
    auth_user_id: z.string().uuid(),
    return_path: z.string().optional(),
});

export async function deleteUsuario(formData: FormData) {
    await ensureAdmin();
    const adminClient = createAdminClient();

    const parsed = deleteUsuarioSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        return_path: formData.get('return_path') || undefined,
    });

    if (!parsed.success) {
        redirect((parsed.data?.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Dados inválidos')}`);
    }

    // ON DELETE CASCADE limpa pessoas + todos os unidade_acessos
    const { error } = await adminClient.auth.admin.deleteUser(parsed.data.auth_user_id);

    if (error) {
        redirect((parsed.data.return_path ?? '/admin/moradores') + `?error=${encodeMessage('Erro: ' + error.message)}`);
    }

    revalidatePath(parsed.data.return_path ?? '/admin/moradores');
    redirect((parsed.data.return_path ?? '/admin/moradores') + `?success=${encodeMessage('Usuário e todos os vínculos excluídos')}`);
}
```

- [ ] **Step 5.7: Type-check**

```bash
npx tsc --noEmit
```

Esperado: passa sem erros. Se houver erros de tipos do Supabase relacionados a callsites antigos, anotar — alguns vão ser corrigidos nas tasks de UI seguintes.

## Task 6: Refactor de `moradorActions.ts` (`enviarLeitura` recebe unidadeId)

**Files:**
- Modify: `src/actions/moradorActions.ts:32-100` (função `ensureMorador` e `enviarLeituraMorador`)

- [ ] **Step 6.1: Substituir `ensureMorador` por versão que aceita `unidadeId`**

Localizar a função `ensureMorador` (linha 32) e substituir por:

```ts
import { resolveUnidadeContextById, resolveMoradorPortalContextPlural } from '@/lib/adminPreview';

async function ensureMoradorOnUnidade(unidadeId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vinculo = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);

    if (!vinculo) {
        redirect('/app');  // gateway decide o que fazer
    }

    return { supabase, user, vinculo };
}
```

E remover a antiga `ensureMorador` (a que retornava `context` único).

- [ ] **Step 6.2: Atualizar `enviarLeituraMorador` pra receber `unidadeId`**

Substituir a função inteira por:

```ts
const enviarLeituraSchema = z.object({
    unidade_id: z.string().uuid(),
    tipo: z.enum(['agua', 'agua_fria', 'agua_quente', 'gas']),
    medicao: z.coerce.number().positive('Medição deve ser maior que zero'),
});

export async function enviarLeituraMorador(formData: FormData) {
    const parsed = enviarLeituraSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        tipo: formData.get('tipo'),
        medicao: formData.get('medicao'),
    });

    const unidadeIdRaw = String(formData.get('unidade_id') || '');

    if (!parsed.success) {
        redirect(`/app/u/${unidadeIdRaw}/enviar-leitura?error=${encodeMessage('Dados inválidos para envio')}`);
    }

    const { supabase, user, vinculo } = await ensureMoradorOnUnidade(parsed.data.unidade_id);

    if (!vinculo.condominio.envioLeituraMoradorHabilitado) {
        redirect(`/app/u/${parsed.data.unidade_id}/enviar-leitura?error=${encodeMessage('Envio de leitura não está habilitado para sua unidade')}`);
    }

    const tipo = parsed.data.tipo as TipoLeitura;
    const tiposPermitidos = getTiposPermitidos(vinculo.condominio);

    if (!tiposPermitidos.includes(tipo)) {
        redirect(`/app/u/${parsed.data.unidade_id}/enviar-leitura?error=${encodeMessage('Tipo de leitura não permitido para sua unidade')}`);
    }

    // ... resto do corpo original (upload de fotos, insert da leitura, etc)
    // adaptar para usar parsed.data.unidade_id em vez de context.unidade.id
}
```

⚠️ Manter o resto da lógica de upload/insert/delete intacta — só substituir as referências a `context.unidade.id` por `parsed.data.unidade_id`, e os `redirect`s devem usar `/app/u/${unidadeId}/enviar-leitura` em vez de `/app/enviar-leitura`.

- [ ] **Step 6.3: Type-check**

```bash
npx tsc --noEmit
```

## Task 7: Criar layout das páginas unit-scoped + mover páginas

**Files:**
- Create: `src/app/app/u/[unidadeId]/layout.tsx`
- Create: `src/app/app/u/[unidadeId]/page.tsx` (movido de `/app/page.tsx`)
- Create: `src/app/app/u/[unidadeId]/enviar-leitura/page.tsx` (movido de `/app/enviar-leitura/page.tsx`)
- Create: `src/app/app/u/[unidadeId]/leituras/page.tsx` (movido de `/app/leituras/page.tsx`)
- Create: `src/app/app/u/[unidadeId]/leituras/[mes]/page.tsx` (movido de `/app/leituras/[mes]/page.tsx`)
- Create: `src/components/morador/UnitDropdown.tsx`

⚠️ Os arquivos antigos NÃO são deletados nessa task (eles viram redirects na Task 9).

- [ ] **Step 7.1: Criar `src/components/morador/UnitDropdown.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type Vinculo = {
    unidadeId: string;
    label: string;  // ex: "Edifício Aurora — Apt 1502"
    href: string;   // pra onde ir ao trocar (pode ser /app/u/[id])
};

interface UnitDropdownProps {
    atual: Vinculo;
    outros: Vinculo[];
}

export default function UnitDropdown({ atual, outros }: UnitDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    if (outros.length === 0) {
        // Apenas 1 unidade — render flat, sem dropdown
        return <span className="text-sm font-medium text-slate-700">{atual.label}</span>;
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-vscode-blue"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {atual.label}
                <FaChevronDown className="h-3 w-3" />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-slate-200 z-50 py-1">
                    {outros.map((v) => (
                        <Link
                            key={v.unidadeId}
                            href={v.href}
                            role="menuitem"
                            className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setOpen(false)}
                        >
                            {v.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 7.2: Criar `src/app/app/u/[unidadeId]/layout.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural, resolveUnidadeContextById } from '@/lib/adminPreview';
import UnitDropdown from '@/components/morador/UnitDropdown';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ unidadeId: string }>;
}

export default async function UnidadeLayout({ children, params }: LayoutProps) {
    const { unidadeId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // proxy.ts já redireciona, mas redundância segura
        return null;
    }

    const vinculoAtual = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);
    if (!vinculoAtual) notFound();

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);
    const outros = (ctx?.vinculos ?? [])
        .filter((v) => v.unidadeId !== unidadeId)
        .map((v) => ({
            unidadeId: v.unidadeId,
            label: `${v.condominio.nome} — Apt ${v.unidade.bloco ? `${v.unidade.bloco}/` : ''}${v.unidade.apartamento}`,
            href: `/app/u/${v.unidadeId}`,
        }));

    const atual = {
        unidadeId,
        label: `${vinculoAtual.condominio.nome} — Apt ${vinculoAtual.unidade.bloco ? `${vinculoAtual.unidade.bloco}/` : ''}${vinculoAtual.unidade.apartamento}`,
        href: `/app/u/${unidadeId}`,
    };

    return (
        <>
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="text-xs text-slate-500">Você está em:</div>
                    <UnitDropdown atual={atual} outros={outros} />
                </div>
            </div>
            {children}
        </>
    );
}
```

- [ ] **Step 7.3: Mover `/app/page.tsx` → `/app/u/[unidadeId]/page.tsx`**

Copiar o conteúdo de `src/app/app/page.tsx` para `src/app/app/u/[unidadeId]/page.tsx`. Adaptar:
- Recebe `params: Promise<{ unidadeId: string }>`
- Substituir chamada a `resolveMoradorPortalContext` por `resolveUnidadeContextById(supabase, user.id, unidadeId)`
- Adaptar uso do contexto (a estrutura `vinculo` é diferente da `context` antiga, mas tem `unidade`, `condominio`, `tipo`)

⚠️ NÃO deletar `/app/page.tsx` ainda — ele vira gateway na Task 8.

- [ ] **Step 7.4: Mover `/app/enviar-leitura/page.tsx` → `/app/u/[unidadeId]/enviar-leitura/page.tsx`**

Copiar o arquivo. Adaptações similares: receber `unidadeId` dos params, usar `resolveUnidadeContextById`, passar `unidade_id` no `<form>` da `enviarLeituraMorador` action via `<input type="hidden">`. Substituir todas as redirect URLs `/app/enviar-leitura` por `/app/u/[id]/enviar-leitura`.

- [ ] **Step 7.5: Mover `/app/leituras/page.tsx` → `/app/u/[unidadeId]/leituras/page.tsx` (mesmas adaptações)**

- [ ] **Step 7.6: Mover `/app/leituras/[mes]/page.tsx` → `/app/u/[unidadeId]/leituras/[mes]/page.tsx`**

Adaptações: receber AMBOS params (`unidadeId` e `mes`), filtrar leituras por `unidade_id = unidadeId`.

- [ ] **Step 7.7: Type-check**

```bash
npx tsc --noEmit
```

Esperado: passa. Se houver erros de tipo no contexto antigo vs novo, ajustar callsites.

## Task 8: Tornar `/app/page.tsx` o gateway

**Files:**
- Modify: `src/app/app/page.tsx`
- Create: `src/components/morador/UnitSelectorPage.tsx`

- [ ] **Step 8.1: Criar `src/components/morador/UnitSelectorPage.tsx`**

```tsx
import Link from 'next/link';
import { FaBuilding, FaArrowRight } from 'react-icons/fa';

interface VinculoCard {
    unidadeId: string;
    condominioNome: string;
    bloco: string;
    apartamento: string;
    tipo: 'proprietario' | 'locatario' | null;
}

interface Props {
    vinculos: VinculoCard[];
}

export default function UnitSelectorPage({ vinculos }: Props) {
    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Selecione uma unidade</h1>
            <p className="text-slate-600 mb-8">Você tem acesso a {vinculos.length} unidades. Escolha qual quer acessar agora.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vinculos.map((v) => (
                    <Link
                        key={v.unidadeId}
                        href={`/app/u/${v.unidadeId}`}
                        className="group p-5 rounded-lg border border-slate-200 bg-white hover:border-vscode-blue hover:shadow-sm transition"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-vscode-blue">
                                <FaBuilding />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-900">{v.condominioNome}</div>
                                <div className="text-sm text-slate-600">Apt {v.bloco ? `${v.bloco}/` : ''}{v.apartamento}</div>
                                {v.tipo && (
                                    <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                                        {v.tipo}
                                    </div>
                                )}
                            </div>
                            <FaArrowRight className="text-slate-400 group-hover:text-vscode-blue transition" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
```

- [ ] **Step 8.2: Substituir `/app/page.tsx` pelo gateway**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';
import UnitSelectorPage from '@/components/morador/UnitSelectorPage';

export default async function AppGateway() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);

    if (!ctx || ctx.vinculos.length === 0) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 text-center">
                <h1 className="text-xl font-bold text-slate-900 mb-2">Sem acesso ativo</h1>
                <p className="text-slate-600">
                    Você não tem nenhum vínculo ativo com unidades. Entre em contato com o administrador do seu condomínio.
                </p>
            </div>
        );
    }

    if (ctx.vinculos.length === 1) {
        redirect(`/app/u/${ctx.vinculos[0].unidadeId}`);
    }

    return (
        <UnitSelectorPage
            vinculos={ctx.vinculos.map((v) => ({
                unidadeId: v.unidadeId,
                condominioNome: v.condominio.nome,
                bloco: v.unidade.bloco,
                apartamento: v.unidade.apartamento,
                tipo: v.tipo,
            }))}
        />
    );
}
```

- [ ] **Step 8.3: Type-check**

```bash
npx tsc --noEmit
```

## Task 9: Backward-compat — redirects das URLs antigas

**Files:**
- Modify: `src/app/app/enviar-leitura/page.tsx` (vira redirect)
- Modify: `src/app/app/leituras/page.tsx` (vira redirect)
- Modify: `src/app/app/leituras/[mes]/page.tsx` (vira redirect)

- [ ] **Step 9.1: Substituir `/app/enviar-leitura/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';

export default async function EnviarLeituraRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);

    if (!ctx || ctx.vinculos.length === 0) {
        redirect('/app');
    }

    if (ctx.vinculos.length === 1) {
        redirect(`/app/u/${ctx.vinculos[0].unidadeId}/enviar-leitura`);
    }

    // 2+ vínculos: manda pro seletor
    redirect('/app');
}
```

- [ ] **Step 9.2: Mesma estrutura para `/app/leituras/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';

export default async function LeiturasRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);
    if (!ctx || ctx.vinculos.length === 0) redirect('/app');
    if (ctx.vinculos.length === 1) redirect(`/app/u/${ctx.vinculos[0].unidadeId}/leituras`);
    redirect('/app');
}
```

- [ ] **Step 9.3: `/app/leituras/[mes]/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';

interface Props {
    params: Promise<{ mes: string }>;
}

export default async function LeiturasMesRedirect({ params }: Props) {
    const { mes } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);
    if (!ctx || ctx.vinculos.length === 0) redirect('/app');
    if (ctx.vinculos.length === 1) redirect(`/app/u/${ctx.vinculos[0].unidadeId}/leituras/${mes}`);
    redirect('/app');
}
```

- [ ] **Step 9.4: Type-check**

```bash
npx tsc --noEmit
```

## Task 10: Reescrita do `/admin/moradores/[id]/page.tsx`

**Files:**
- Modify: `src/app/admin/moradores/[id]/page.tsx`
- Create: `src/components/admin/AcessosList.tsx`
- Create: `src/components/admin/AddAcessoDialog.tsx`

⚠️ Substituição grande. A página antiga assumia 1 morador; nova lista N acessos com ações.

- [ ] **Step 10.1: Criar `src/components/admin/AcessosList.tsx`**

```tsx
import { toggleAcessoAtivo, deleteAcesso, updateAcesso } from '@/actions/acessoActions';

interface Acesso {
    id: string;
    authUserId: string;
    nome: string | null;
    tipo: 'proprietario' | 'locatario' | null;
    ativo: boolean;
    createdAt: string;
}

interface Props {
    acessos: Acesso[];
    returnPath: string;
}

export default function AcessosList({ acessos, returnPath }: Props) {
    if (acessos.length === 0) {
        return <p className="text-sm text-slate-500 italic">Nenhum acesso cadastrado nesta unidade.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Nome</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Criado em</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {acessos.map((a) => (
                        <tr key={a.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-900">{a.nome ?? <span className="text-slate-400 italic">(sem nome)</span>}</td>
                            <td className="px-4 py-3">
                                <form action={updateAcesso} className="inline">
                                    <input type="hidden" name="acesso_id" value={a.id} />
                                    <input type="hidden" name="return_path" value={returnPath} />
                                    <select
                                        name="tipo"
                                        defaultValue={a.tipo ?? ''}
                                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                                        className="text-sm border border-slate-200 rounded px-2 py-1"
                                    >
                                        <option value="">— sem tipo —</option>
                                        <option value="proprietario">Proprietário</option>
                                        <option value="locatario">Locatário</option>
                                    </select>
                                </form>
                            </td>
                            <td className="px-4 py-3">
                                <form action={toggleAcessoAtivo} className="inline">
                                    <input type="hidden" name="acesso_id" value={a.id} />
                                    <input type="hidden" name="ativo" value={a.ativo ? 'false' : 'true'} />
                                    <input type="hidden" name="return_path" value={returnPath} />
                                    <button
                                        type="submit"
                                        className={
                                            a.ativo
                                                ? 'text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100'
                                                : 'text-xs px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }
                                    >
                                        {a.ativo ? 'Ativo' : 'Desabilitado'}
                                    </button>
                                </form>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 text-right">
                                <form action={deleteAcesso} className="inline">
                                    <input type="hidden" name="acesso_id" value={a.id} />
                                    <input type="hidden" name="return_path" value={returnPath} />
                                    <button
                                        type="submit"
                                        className="text-xs text-red-600 hover:underline"
                                        onClick={(e) => {
                                            if (!confirm('Excluir este vínculo? Não exclui a conta do usuário.')) e.preventDefault();
                                        }}
                                    >
                                        Excluir vínculo
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

- [ ] **Step 10.2: Criar `src/components/admin/AddAcessoDialog.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { createAcesso } from '@/actions/acessoActions';

interface Props {
    unidadeId: string;
}

export default function AddAcessoDialog({ unidadeId }: Props) {
    const [open, setOpen] = useState(false);
    const [modo, setModo] = useState<'novo_usuario' | 'usuario_existente'>('novo_usuario');

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-vscode-blue text-white text-sm font-semibold rounded-md hover:bg-vscode-blue-dark"
            >
                + Adicionar acesso
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-semibold mb-4">Adicionar acesso à unidade</h2>

                        <div className="mb-4">
                            <label className="text-xs text-slate-600 block mb-2">Tipo de cadastro</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModo('novo_usuario')}
                                    className={`flex-1 px-3 py-2 rounded text-sm ${modo === 'novo_usuario' ? 'bg-vscode-blue text-white' : 'bg-slate-100 text-slate-700'}`}
                                >
                                    Novo usuário
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModo('usuario_existente')}
                                    className={`flex-1 px-3 py-2 rounded text-sm ${modo === 'usuario_existente' ? 'bg-vscode-blue text-white' : 'bg-slate-100 text-slate-700'}`}
                                >
                                    Usuário existente
                                </button>
                            </div>
                        </div>

                        <form action={createAcesso} className="space-y-3">
                            <input type="hidden" name="unidade_id" value={unidadeId} />
                            <input type="hidden" name="modo" value={modo} />

                            {modo === 'novo_usuario' && (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-600">Nome</label>
                                        <input name="nome" type="text" className="w-full px-3 py-2 border border-slate-300 rounded" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-600">Email</label>
                                        <input name="email" type="email" required className="w-full px-3 py-2 border border-slate-300 rounded" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-600">Senha (mín. 6 chars)</label>
                                        <input name="senha" type="text" required minLength={6} className="w-full px-3 py-2 border border-slate-300 rounded" />
                                    </div>
                                </>
                            )}

                            {modo === 'usuario_existente' && (
                                <div>
                                    <label className="text-xs text-slate-600">Email do usuário existente</label>
                                    <input name="email" type="email" required className="w-full px-3 py-2 border border-slate-300 rounded" />
                                    <p className="text-xs text-slate-500 mt-1">O usuário já precisa ter conta no sistema (vínculo em outra unidade).</p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-600">Tipo (opcional)</label>
                                <select name="tipo" className="w-full px-3 py-2 border border-slate-300 rounded">
                                    <option value="">— sem tipo —</option>
                                    <option value="proprietario">Proprietário</option>
                                    <option value="locatario">Locatário</option>
                                </select>
                            </div>

                            <div className="flex gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-3 py-2 bg-vscode-blue text-white rounded text-sm font-semibold"
                                >
                                    Criar acesso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
```

- [ ] **Step 10.3: Reescrever `src/app/admin/moradores/[id]/page.tsx`**

Substituir o conteúdo (manter imports relevantes do AdminLayout, etc):

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AcessosList from '@/components/admin/AcessosList';
import AddAcessoDialog from '@/components/admin/AddAcessoDialog';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function UnidadeAcessosPage({ params, searchParams }: Props) {
    const { id: unidadeId } = await params;
    const { success, error } = await searchParams;
    const supabase = await createClient();

    // Buscar unidade + condomínio
    const { data: unidade } = await supabase
        .from('unidades')
        .select('id, bloco, apartamento, condominio:condominios(id, nome)')
        .eq('id', unidadeId)
        .single();

    if (!unidade) notFound();

    // Buscar acessos com pessoa
    const { data: acessos } = await supabase
        .from('unidade_acessos')
        .select('id, auth_user_id, tipo, ativo, created_at, pessoa:pessoas(id, nome)')
        .eq('unidade_id', unidadeId)
        .order('created_at', { ascending: true });

    const acessosFmt = (acessos ?? []).map((a) => {
        const pessoa = Array.isArray(a.pessoa) ? a.pessoa[0] : a.pessoa;
        return {
            id: a.id,
            authUserId: a.auth_user_id,
            nome: pessoa?.nome ?? null,
            tipo: a.tipo as 'proprietario' | 'locatario' | null,
            ativo: a.ativo,
            createdAt: a.created_at,
        };
    });

    const returnPath = `/admin/moradores/${unidadeId}`;
    const condominio = Array.isArray(unidade.condominio) ? unidade.condominio[0] : unidade.condominio;

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/admin/moradores" className="text-vscode-blue text-sm">← Voltar</Link>
                <h1 className="text-2xl font-bold mt-2">
                    Acessos da unidade — {condominio?.nome}, Apt {unidade.bloco ? `${unidade.bloco}/` : ''}{unidade.apartamento}
                </h1>
                <p className="text-sm text-slate-600 mt-1">{acessosFmt.length} acesso(s) cadastrado(s)</p>
            </div>

            {success && (
                <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>
            )}
            {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            <div className="mb-6">
                <AddAcessoDialog unidadeId={unidadeId} />
            </div>

            <AcessosList acessos={acessosFmt} returnPath={returnPath} />
        </div>
    );
}
```

- [ ] **Step 10.4: Type-check**

```bash
npx tsc --noEmit
```

## Task 11: Atualizar `/admin/moradores` (lista) com contador

**Files:**
- Modify: `src/app/admin/moradores/page.tsx`

- [ ] **Step 11.1: Adaptar query e linha da tabela**

Localizar a query que busca unidades com `moradores(id, nome)`. Substituir por:

```tsx
const { data: unidades } = await supabase
    .from('unidades')
    .select('id, bloco, apartamento, condominio_id, acessos:unidade_acessos(id, ativo)')
    .eq('condominio_id', condominioId)
    .order('apartamento');
```

E na renderização de cada linha, substituir a coluna "Morador" (que mostrava `firstOfRelation(u.moradores)?.nome`) por:

```tsx
const totalAcessos = (u.acessos ?? []).length;
const ativos = (u.acessos ?? []).filter((a) => a.ativo).length;
// ... na td:
<td className="px-4 py-4 text-sm text-slate-700">
    {totalAcessos === 0 ? (
        <span className="text-slate-400 italic">Nenhum acesso</span>
    ) : (
        <span>{ativos} ativo{ativos !== 1 ? 's' : ''} {totalAcessos > ativos && `(${totalAcessos - ativos} desabilitado${totalAcessos - ativos !== 1 ? 's' : ''})`}</span>
    )}
</td>
```

Atualizar também as estatísticas no topo da página (`totalComMorador` etc.) — adaptar pra contar unidades com pelo menos 1 acesso ativo.

- [ ] **Step 11.2: Type-check**

```bash
npx tsc --noEmit
```

## Task 12: Atualizar `/sindico/condominios/[id]/page.tsx` com contador

**Files:**
- Modify: `src/app/sindico/condominios/[id]/page.tsx`

- [ ] **Step 12.1: Adaptar query**

Localizar a query que busca `unidades` com `moradores(id, nome)`. Substituir por:

```tsx
.select('id, bloco, apartamento, acessos:unidade_acessos(id, ativo, pessoa:pessoas(nome))')
```

- [ ] **Step 12.2: Adaptar renderização da coluna**

Onde antes mostrava `morador?.nome || 'Não configurado'`, mostrar agora:

```tsx
const acessosAtivos = (u.acessos ?? []).filter((a) => a.ativo);
const nomes = acessosAtivos
    .map((a) => Array.isArray(a.pessoa) ? a.pessoa[0]?.nome : a.pessoa?.nome)
    .filter(Boolean)
    .join(', ');
// ... na td:
<td className="px-4 py-4 text-sm text-slate-700">
    {acessosAtivos.length === 0 ? (
        <span className="text-slate-400 italic">Não configurado</span>
    ) : (
        <div title={nomes}>
            <span className="font-medium">{acessosAtivos.length} ativo{acessosAtivos.length !== 1 ? 's' : ''}</span>
            {nomes && <span className="text-xs text-slate-500 block truncate max-w-xs">{nomes}</span>}
        </div>
    )}
</td>
```

- [ ] **Step 12.3: Type-check + build**

```bash
npx tsc --noEmit
npm run build
```

Esperado: ambos passam. `npm run build` é importante aqui porque é a primeira validação production-parity de toda a fase 2.

## Task 13: QA visual + manual em dev

⚠️ **Esta é a única defesa contra regressão de RLS.** Não pular.

- [ ] **Step 13.1: Aplicar migration 12 em dev se ainda não aplicou**

(Se você seguiu Task 2 já aplicou. Senão, agora é o momento.)

- [ ] **Step 13.2: Iniciar dev server**

```bash
npm run dev
```

Abrir `http://localhost:3000`.

- [ ] **Step 13.3: Cenário — Morador 1-vínculo (existente)**

1. Logar como morador existente que tem 1 vínculo
2. Esperado: redirect direto pra `/app/u/[id]` (sem ver seletor)
3. Header mostra "Você está em: [condomínio] — Apt X" (sem dropdown porque só tem 1)
4. Clicar em "Enviar leitura" → vai pra `/app/u/[id]/enviar-leitura`
5. Enviar uma leitura de teste — deve funcionar
6. Acessar histórico — `/app/u/[id]/leituras` mostra leituras corretas
7. Acessar URL antiga `/app/enviar-leitura` no browser — deve fazer 308 redirect pra nova
8. Logout

- [ ] **Step 13.4: Cenário — Morador 2+ vínculos (criar manualmente)**

1. Logar como admin → ir em qualquer outra unidade → "Adicionar acesso" → modo "usuário existente" → email do morador do passo anterior
2. Logar como esse morador (logout/login)
3. Esperado: ver tela seletor com 2 cards
4. Clicar num → entra em `/app/u/[id]`
5. Header mostra dropdown — clicar pra ver outras unidades
6. Trocar unidade → URL muda
7. Tentar `/app/enviar-leitura` no browser → redirect deve mandar pro `/app` (seletor)
8. Logout

- [ ] **Step 13.5: Cenário — Admin gerenciando**

1. Logar como admin
2. Ir em `/admin/moradores` → escolher condomínio → ver lista com contador "X ativos"
3. Clicar numa unidade → `/admin/moradores/[id]` mostra "Acessos da unidade" com lista
4. Adicionar acesso → modo "novo usuário" → preencher → criar — deve aparecer na lista
5. Editar tipo via select inline → deve persistir
6. Toggle ativo → deve mudar o badge
7. Excluir vínculo (botão) → confirmar → deve sumir da lista
8. NÃO testar "deleteUsuario" sem ter user de teste descartável

- [ ] **Step 13.6: Cenário — Síndico**

1. Logar como síndico
2. `/sindico/condominios/[id]` → coluna "Morador" mostra contador correto
3. Síndico não tem ações — só leitura

- [ ] **Step 13.7: Verificar logs Supabase**

Abrir Supabase Dashboard → Logs → últimos minutos. Esperado: nenhum erro de RLS, nenhum SQL error.

- [ ] **Step 13.8: Comparar dados**

```sql
SELECT COUNT(*) FROM moradores WHERE auth_user_id IS NOT NULL;
SELECT COUNT(*) FROM unidade_acessos;
-- Devem ser iguais (assumindo que não criou novos vínculos durante QA além dos de teste)
```

## Task 14: Stage e commit (commit 2)

- [ ] **Step 14.1: Revisar git status**

```bash
git status
```

Esperado: muitos arquivos modificados/criados. Confirmar que todos são esperados (consultar lista no início do plano).

- [ ] **Step 14.2: Stage tudo**

```bash
git add database/12_update_rls_for_acessos.sql \
    src/types/index.ts \
    src/lib/adminPreview.ts \
    src/actions/acessoActions.ts \
    src/actions/moradorActions.ts \
    src/app/app/page.tsx \
    src/app/app/enviar-leitura/page.tsx \
    src/app/app/leituras \
    src/app/app/u \
    src/components/morador/UnitDropdown.tsx \
    src/components/morador/UnitSelectorPage.tsx \
    src/components/admin/AcessosList.tsx \
    src/components/admin/AddAcessoDialog.tsx \
    src/app/admin/moradores/page.tsx \
    src/app/admin/moradores/\[id\]/page.tsx \
    src/app/sindico/condominios/\[id\]/page.tsx
```

- [ ] **Step 14.3: Commit (commit 2)**

```bash
git commit -m "$(cat <<'EOF'
Cutover to multi-vínculo: RLS, actions, URL refactor, UIs

App now uses unidade_acessos via the new get_my_unidade_ids() set-returning
function. moradores table stays in the database as backup for rollback;
will be dropped in commit 3 after production validation.

Changes:
- RLS function rewritten (set-based) and policies migrated from = to IN
- acessoActions split into createAcesso (2 modes), updatePessoa,
  updateAuthCredentials, updateAcesso (tipo), toggleAcessoAtivo,
  deleteAcesso (single vínculo), deleteUsuario (cascade)
- moradorActions: enviarLeitura now requires explicit unidade_id
- /app restructured: /app gateway → /app/u/[unidadeId]/...
  - Old /app/X URLs become 308 redirects (backward-compat)
- Admin UI: /admin/moradores/[id] now shows list of acessos with
  add/edit/disable/delete actions
- Síndico UI: counter of active acessos per unit instead of single name

Spec: docs/superpowers/specs/2026-05-11-multi-vinculo-morador-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

⚠️ **Antes de fazer push pra produção:** considerar deploy em staging primeiro se houver. RLS regression pode expor dados.

---

# FASE 3 — Commit 3: Cleanup (após validação em produção)

⚠️ **Não execute este commit imediatamente após o commit 2.** Esperar pelo menos alguns dias com o commit 2 em produção, validar tudo está ok, e SÓ ENTÃO fazer o cleanup. A vantagem do plano de 3 commits é exatamente ter `moradores` como backup vivo durante esse período.

## Task 15: Migration SQL — drop moradores

**Files:**
- Create: `database/13_drop_moradores.sql`

- [ ] **Step 15.1: Antes de criar a migration, validar contagens em produção**

No SQL Editor de produção:

```sql
-- Devem ser iguais
SELECT COUNT(*) AS moradores_validos FROM moradores WHERE auth_user_id IS NOT NULL;
SELECT COUNT(*) AS acessos FROM unidade_acessos;

-- Sanity: moradores órfãos foram revisados e podem ser descartados?
SELECT COUNT(*) AS orfaos FROM moradores WHERE auth_user_id IS NULL;
```

Se as contagens não baterem ou houver órfãos não revisados, **PARAR** e investigar. Não prosseguir com o DROP.

- [ ] **Step 15.2: Criar `database/13_drop_moradores.sql`**

```sql
-- ============================================================
-- 13_drop_moradores.sql
-- Cleanup: dropa tabela moradores (substituída por unidade_acessos)
-- e função get_my_unidade_id() (substituída por get_my_unidade_ids)
-- ============================================================

-- Drop função antiga (já não é referenciada por nenhuma policy)
DROP FUNCTION IF EXISTS get_my_unidade_id();

-- Drop tabela moradores (cascade limpa policies, índices, triggers)
DROP TABLE IF EXISTS moradores CASCADE;
```

- [ ] **Step 15.3: Aplicar em dev primeiro**

Cole no Supabase SQL Editor de dev → Run. Verificar:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'moradores';
-- Esperado: 0 linhas

SELECT * FROM pg_proc WHERE proname = 'get_my_unidade_id';
-- Esperado: 0 linhas
```

Rodar `npm run dev` e fazer um smoke test rápido (login morador, enviar leitura) pra confirmar que nada quebrou.

- [ ] **Step 15.4: NÃO aplicar em produção ainda**

Produção só recebe esse commit depois do código ser deployado E validado.

## Task 16: Remover `MoradorData` e referências legadas

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 16.1: Remover `MoradorData` de `src/types/index.ts`**

Apagar a interface inteira (incluindo o JSDoc de deprecated).

- [ ] **Step 16.2: Verificar que ninguém usa**

```bash
grep -rn "MoradorData" src/
```

Esperado: 0 resultados. Se aparecer algo, corrigir antes de prosseguir.

- [ ] **Step 16.3: Type-check + build**

```bash
npx tsc --noEmit
npm run build
```

Esperado: ambos passam.

## Task 17: Stage e commit (commit 3) + aplicar em produção

- [ ] **Step 17.1: Stage e commit**

```bash
git add database/13_drop_moradores.sql src/types/index.ts
git commit -m "$(cat <<'EOF'
Drop moradores table and MoradorData type (cleanup)

Removes the legacy 1:1 schema after validating multi-vínculo in
production. The unidade_acessos table is now the sole source of
truth for unit-user relationships.

Spec: docs/superpowers/specs/2026-05-11-multi-vinculo-morador-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 17.2: Deploy do commit 3**

Após deploy do código, aplicar `database/13_drop_moradores.sql` em produção via Supabase SQL Editor.

⚠️ **Esse é o ponto de não-volta.** Depois do DROP, `moradores` não existe mais. Garantir que tudo passou em validação antes.

- [ ] **Step 17.3: Smoke test em produção pós-cleanup**

Login como morador, admin, síndico — rapid sanity check.

---

## Self-Review

**Spec coverage:**
- ✅ Schema novo (pessoas + unidade_acessos) → Task 1
- ✅ Trigger handle_new_auth_user → Task 1
- ✅ Migração de dados → Task 1
- ✅ get_my_unidade_ids → Task 2
- ✅ Atualização de policies existentes → Task 2
- ✅ RLS pras novas tabelas → Task 1
- ✅ Storage RLS → Task 2 step 2.4
- ✅ Tipos TS (Pessoa, UnidadeAcesso, TipoAcesso) → Task 3
- ✅ resolveMoradorPortalContextPlural / resolveUnidadeContextById → Task 4
- ✅ acessoActions reescrita (7 ações) → Task 5
- ✅ moradorActions (unidade_id explícito) → Task 6
- ✅ URL refactor /app/u/[unidadeId] + layout + dropdown → Task 7
- ✅ /app gateway (0/1/2+ vínculos) → Task 8
- ✅ Backward-compat redirects → Task 9
- ✅ Admin UI (Acessos da unidade) → Task 10
- ✅ Admin lista geral com contador → Task 11
- ✅ Síndico contador → Task 12
- ✅ QA manual → Task 13
- ✅ Drop moradores + cleanup → Tasks 15-17

**Não coberto explicitamente (decisões deliberadas da spec, fora de escopo):**
- Área `/admin/usuarios` separada — fica como melhoria futura
- Auditoria/log de quem criou/desabilitou — fora de escopo
- Notificações automáticas — fora de escopo

**Placeholder scan:** Sem TBDs/TODOs. Cada step tem código concreto ou comando concreto.

**Type consistency:**
- `UnidadeAcesso` interface (Task 3) usa `tipo: TipoAcesso | null`. Task 5 usa `'proprietario' | 'locatario'` (subset, compatível). Task 10 usa `'proprietario' | 'locatario' | null`. Consistente.
- `resolveMoradorPortalContextPlural` retorna estrutura `{ vinculos: [...] }` (Task 4); Task 7, 8, 9 usam `ctx.vinculos.length` e `ctx.vinculos[0].unidadeId`. Consistente.
- `unidadeId` (camelCase) vs `unidade_id` (snake) consistentemente usado: camelCase no TS, snake no DB e nos `formData`.

**Adendos pós-spec descobertos durante o plano:**
- Spec menciona `lib/morador.ts` mas a função vive em `lib/adminPreview.ts` — plano usa o caminho real
- Spec menciona "/app/u/[id]/suporte" mas suporte é user-level, fica em `/app/suporte` (não move) — registrado em "File Structure"
- Spec não menciona `/app/senha`, plano confirma que fica em `/app/senha` (user-level, não move)
- Spec não menciona `/app/leituras/[mes]` (sub-rota do histórico) — plano move junto com `/app/leituras`
