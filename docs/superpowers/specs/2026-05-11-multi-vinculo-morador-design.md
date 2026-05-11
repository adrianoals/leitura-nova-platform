# Multi-vínculo Morador ↔ Unidade — Design

**Data:** 2026-05-11
**Status:** Aprovado pelo usuário, pronto para plano de implementação
**Escopo:** Schema, RLS, server actions, URL structure do portal morador, e UIs de admin/morador/síndico

---

## 1. Contexto e problema

### Modelo atual (1:1)

A tabela `moradores` (`database/01_tables.sql:50-58`) impõe duas constraints UNIQUE que criam uma relação rígida 1:1:

- `moradores.unidade_id UNIQUE` — uma unidade tem no máximo 1 morador
- `moradores.auth_user_id UNIQUE` — um auth user corresponde a no máximo 1 morador (logo, 1 unidade)

Reforçado pela migration `06_unique_access_per_unit.sql` (constraint nomeada `moradores_unidade_unique`) com o comentário literal: *"Garante a regra: 1 unidade = 1 acesso (morador/proprietário)"*.

A função RLS `get_my_unidade_id()` (`02_rls_policies.sql:57`) consolida essa premissa retornando um único UUID.

### Cenários que o modelo atual não suporta

1. **Múltiplos usuários por apartamento** — proprietário + locatário coexistindo, ambos com acesso pra enviar leitura.
2. **Um usuário com múltiplas unidades** — proprietário com vários apartamentos no mesmo (ou em diferentes) condomínio(s).

### Regras de negócio aprovadas

| Regra | Decisão |
|---|---|
| Tipos de vínculo | `proprietario` e `locatario` (apenas) |
| Tipo "vazio" (sem rótulo) | Aceito — `tipo IS NULL` |
| Permissões por tipo | Idênticas — qualquer vínculo ativo envia leitura E vê leituras da unidade |
| Restrição de cardinalidade por tipo | **Sem restrição** — locatário pode ter N vínculos, proprietário pode ter N, mistos permitidos |
| Vigência do vínculo | Sem datas. Admin desabilita (soft) ou exclui (hard) |
| Histórico ao trocar locatário | Leituras ficam vinculadas à unidade, não à pessoa. Vínculo pode ser desabilitado preservando registro |
| `envio_leitura_morador_habilitado` | Continua por condomínio (sem mudança) |
| Síndico | Vê todos os vínculos da unidade (não apenas "o morador") |
| Migração dos moradores existentes | Viram vínculos com `tipo = NULL` (admin define depois) |
| Mesmo email = mesmo auth user | Não duplica conta; um auth user pode ter N vínculos |

---

## 2. Modelo de dados novo

### Tabela `pessoas` (nova)

Espelha `auth.users` no schema `public` para permitir leitura relacional do nome via RLS-safe joins.

```sql
CREATE TABLE pessoas (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome         TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_auth_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.pessoas (id, nome)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nome');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

CREATE TRIGGER trg_pessoas_updated_at BEFORE UPDATE ON pessoas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Por quê esta tabela:** `auth.users` no Supabase é um schema protegido que não pode ser facilmente joinado a partir de queries do client. Ter `pessoas` em `public` permite `SELECT ..., pessoas(nome)` em listagens, com RLS controlando visibilidade.

### Tabela `unidade_acessos` (nova; substitui `moradores`)

```sql
CREATE TABLE unidade_acessos (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id   UUID NOT NULL REFERENCES unidades(id)   ON DELETE CASCADE,
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo         TEXT CHECK (tipo IS NULL OR tipo IN ('proprietario', 'locatario')),
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(unidade_id, auth_user_id)
);

CREATE INDEX idx_acessos_unidade ON unidade_acessos(unidade_id);
CREATE INDEX idx_acessos_auth ON unidade_acessos(auth_user_id);
CREATE INDEX idx_acessos_unidade_ativo ON unidade_acessos(unidade_id) WHERE ativo;

CREATE TRIGGER trg_acessos_updated_at BEFORE UPDATE ON unidade_acessos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Decisões importantes:**

- `auth_user_id NOT NULL` (mais estrito que o atual `moradores`). Vínculo sem auth user é meaningless.
- `ON DELETE CASCADE` em ambas FKs: deletar uma unidade ou um auth user limpa os vínculos automaticamente — sem órfãos.
- `UNIQUE(unidade_id, auth_user_id)` impede duplicação do mesmo user na mesma unidade. Pra mudar tipo, edita a linha existente.
- `tipo` nullable, com CHECK que aceita NULL ou os 2 valores. Nada de string vazia.
- `ativo` controla soft-disable. Índice parcial `WHERE ativo` otimiza queries de RLS.

### Migração de dados

Sequência durante o **commit 1** (schema-safe, app continua usando `moradores`):

```sql
-- Popular pessoas a partir dos auth.users que têm morador linkado
INSERT INTO pessoas (id, nome)
SELECT auth_user_id, nome FROM moradores
WHERE auth_user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Popular unidade_acessos a partir dos moradores válidos
INSERT INTO unidade_acessos (unidade_id, auth_user_id, tipo, ativo)
SELECT unidade_id, auth_user_id, NULL, TRUE FROM moradores
WHERE auth_user_id IS NOT NULL;
```

Linhas órfãs (`moradores` com `auth_user_id IS NULL`) **não migram**. Antes da migração, gerar relatório com `SELECT id, unidade_id, nome, email FROM moradores WHERE auth_user_id IS NULL` para revisão manual; é esperado que sejam descartadas (são acessos sem login funcional).

A tabela `moradores` permanece intacta após o commit 1 — funciona como backup vivo. Só é dropada no commit 3 (cleanup).

---

## 3. RLS (Row Level Security)

### Função helper

```sql
-- ANTES (singular):
CREATE OR REPLACE FUNCTION get_my_unidade_id()
RETURNS UUID AS $$ ... LIMIT 1 $$;

-- DEPOIS (plural; filtra por ativo):
CREATE OR REPLACE FUNCTION get_my_unidade_ids()
RETURNS SETOF UUID
LANGUAGE SQL SECURITY DEFINER STABLE AS $$
    SELECT unidade_id FROM unidade_acessos
    WHERE auth_user_id = auth.uid() AND ativo = TRUE
$$;
```

### Migração mecânica das policies

Toda referência a `get_my_unidade_id()` muda de `=` para `IN`:

```sql
-- Antes:
USING (id = get_my_unidade_id())
USING (unidade_id = get_my_unidade_id())

-- Depois:
USING (id IN (SELECT get_my_unidade_ids()))
USING (unidade_id IN (SELECT get_my_unidade_ids()))
```

**Lugares afetados** (mapeados em `database/02_rls_policies.sql`):

- `unidades` SELECT pro morador (linha 104)
- `leituras_mensais` SELECT/INSERT/UPDATE (linhas 159, 166, 198, 207)
- `fotos_leitura` policies derivadas
- Storage RLS (`07_fix_storage_policy_unit_owner.sql`) — mesmo padrão

### Policies novas

**`pessoas`:**
```sql
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_pessoas_all ON pessoas
    FOR ALL USING (EXISTS (
        SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY pessoa_self_select ON pessoas
    FOR SELECT USING (id = auth.uid());

CREATE POLICY sindico_pessoas_select ON pessoas
    FOR SELECT USING (id IN (
        SELECT ua.auth_user_id
        FROM unidade_acessos ua
        JOIN unidades u ON u.id = ua.unidade_id
        JOIN sindicos s ON s.condominio_id = u.condominio_id
        WHERE s.auth_user_id = auth.uid()
    ));
```

**`unidade_acessos`:**
```sql
ALTER TABLE unidade_acessos ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_acessos_all ON unidade_acessos
    FOR ALL USING (EXISTS (
        SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY acesso_self_select ON unidade_acessos
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY sindico_acessos_select ON unidade_acessos
    FOR SELECT USING (unidade_id IN (
        SELECT u.id FROM unidades u
        JOIN sindicos s ON s.condominio_id = u.condominio_id
        WHERE s.auth_user_id = auth.uid()
    ));
```

---

## 4. Server actions (`src/actions/`)

### `acessoActions.ts` — reescrito

| Ação | Comportamento |
|---|---|
| `createAcesso` | 2 modos: **(a)** "novo usuário": cria `auth.users` (com `nome` em metadata) → trigger cria `pessoas` → insere em `unidade_acessos`; **(b)** "usuário existente": busca por email, valida que existe, insere em `unidade_acessos`. Sempre recebe `unidade_id` + `tipo` (pode ser NULL) + `ativo` (default TRUE). |
| `updatePessoa` | Atualiza `pessoas.nome`. Não toca em vínculos nem em auth. |
| `updateAuthCredentials` | Atualiza `auth.users.email` e/ou senha. Operação separada. |
| `updateAcesso` | Atualiza `tipo` e/ou `ativo` de uma linha de `unidade_acessos` específica. |
| `toggleAcessoAtivo` | Atalho pra flipar `ativo`. |
| `deleteAcesso` | Apaga uma linha de `unidade_acessos` (não toca no auth user). |
| `deleteUsuario` | Apaga `auth.users` → cascade limpa `pessoas` + todos os vínculos do user. Confirmação dupla na UI. |

### `moradorActions.ts` (`enviarLeitura`)

Recebe `unidadeId` explícito (não mais "a unidade do morador logado"). Validação: confirma que existe vínculo ativo entre `auth.uid()` e `unidadeId` antes de prosseguir. RLS faria isso automaticamente, mas validação explícita produz erro mais claro.

### `lib/morador.ts` (`resolveMoradorPortalContext`)

Em vez de retornar `{ unidade, condominio }`, retorna a lista de vínculos ativos do user com seus respectivos condomínios:

```ts
type PortalContext = {
  vinculos: Array<{
    unidadeId: string;
    unidade: Unidade;
    condominio: Condominio;
    tipo: TipoAcesso | null;
  }>;
};
```

Páginas individuais resolvem qual usar via `unidadeId` da URL.

### `adminPreviewActions.ts`

Admin "preview as morador" passa a aceitar `unidadeId` específico — preview "user X na unidade Y" (não "user X" sozinho).

---

## 5. URL structure do portal morador

```
/app                              → gateway server-side:
                                       0 vínculos ativos → tela "sem acesso ativo"
                                       1 vínculo ativo  → redirect 308 → /app/u/[id]
                                       2+ vínculos      → tela seletor (cards)

/app/u/[unidadeId]                → dashboard da unidade
/app/u/[unidadeId]/enviar-leitura → form de envio
/app/u/[unidadeId]/historico      → histórico
/app/u/[unidadeId]/suporte        → suporte
```

### Backward-compat

URLs antigas (`/app/enviar-leitura`, `/app/historico`, etc.) ficam como redirects:

- 1 vínculo ativo → 308 → `/app/u/[id]/enviar-leitura`
- 2+ vínculos → 308 → `/app` (seletor; user escolhe e o dashboard mostra a página correspondente)
- 0 vínculos → tela "sem acesso"

Os redirects podem ser removidos após algumas semanas em produção.

### Layout `/app/u/[unidadeId]/layout.tsx`

Server component que:
1. Lê `unidadeId` dos params
2. Verifica RLS (busca o vínculo ativo do user com essa unidade) — se não achar, `notFound()`
3. Renderiza header com "Você está em: **[condomínio]** — Apt **[bloco/apt]**" + dropdown pra trocar de unidade (visível só se user tem 2+ vínculos ativos)

---

## 6. UI areas

### Admin

**`/admin/moradores/[unidadeId]`** (atual: 1 morador por unidade) → vira **"Acessos da unidade"**:

- Lista N vínculos com colunas: nome (de `pessoas`), tipo (select editável), ativo (toggle), data de criação, ações
- Botão "Adicionar acesso" abre dialog com 2 modos:
  - **Novo usuário:** form com nome + email + senha + tipo
  - **Usuário existente:** input de email + autocomplete (lista users sem vínculo nessa unidade) + tipo
- Cada linha: editar tipo inline, toggle "Desabilitar/Ativar", botão "Excluir vínculo" (com confirmação)

**`/admin/moradores`** (lista geral por condomínio) — coluna "Morador" vira **"Acessos"** com contador (ex: *"2 ativos"*); link entra no detalhe da unidade.

**Edição de user (nome/email/senha)** — mantém o fluxo atual: aparece dentro do detalhe da unidade, ao lado de cada acesso. Pra esta fase **não criamos** uma área `/admin/usuarios` separada (fica como melhoria futura quando demandar).

### Morador

Descrita na seção 5 (URL structure + layout). Resumo:
- 1 vínculo: experiência idêntica a hoje (URL refator é transparente)
- 2+ vínculos: tela `/app` com seletor; depois de escolher, navega normal dentro de `/app/u/[id]`
- Trocar de unidade: dropdown no header em qualquer página

### Síndico

**`/sindico/condominios/[id]`** — coluna "Morador" vira **"Acessos"**:
- Renderiza badge com contador (*"3 ativos"*) e tooltip/expand listando os nomes
- Clique opcional pra ver detalhe (somente leitura)
- Síndico continua sem permissão de ação — só leitura

---

## 7. Tipos (`src/types/index.ts`)

```ts
export interface Pessoa {
  id: string;          // = auth.users.id
  nome: string | null;
}

export type TipoAcesso = 'proprietario' | 'locatario';

export interface UnidadeAcesso {
  id: string;
  unidadeId: string;
  authUserId: string;
  tipo: TipoAcesso | null;
  ativo: boolean;
  pessoa?: Pessoa;     // join opcional
  unidade?: Unidade;
}

// MoradorData fica deprecated, removido após o refactor completo (commit 3)
```

---

## 8. Rollout

### Estratégia: 3 commits coordenados

```
COMMIT 1 — schema-safe (app continua usando moradores)
  ├─ Cria pessoas + unidade_acessos + trigger handle_new_auth_user
  ├─ Migra dados de moradores → pessoas + unidade_acessos
  ├─ Tabela moradores intacta (backup vivo)
  └─ Deploy. Nada quebra.

COMMIT 2 — cutover do app
  ├─ Refactor de RLS (get_my_unidade_ids + policies novas)
  ├─ Refactor de actions (acessoActions, moradorActions, lib/morador, adminPreviewActions)
  ├─ URLs novas /app/u/[id] + redirects de /app/X
  ├─ UIs novas (admin "Acessos da unidade", morador seletor, síndico contador)
  └─ Deploy. App passa a usar unidade_acessos.

COMMIT 3 — cleanup (dias depois, após validar em produção)
  ├─ DROP TABLE moradores
  ├─ Remove tipos/helpers legados (MoradorData, etc.)
  └─ Deploy.
```

A skill writing-plans vai quebrar isso em ~5-6 tasks executáveis (schema, RLS, actions, URLs/morador, admin UI, síndico UI, cleanup).

### Validação pós-commit 2

Antes de prosseguir pro commit 3, checar em produção:

1. Login como morador 1-vínculo: redirect direto pra `/app/u/[id]`, envia leitura, vê histórico
2. Login como morador 2-vínculos (criar caso teste manual): vê seletor, troca entre unidades, envia leitura em ambas
3. Login como síndico: vê acessos das unidades dos seus condos com contadores corretos
4. Login como admin: lista vínculos de uma unidade, adiciona novo acesso (modos "novo user" e "user existente"), edita tipo, desabilita, exclui vínculo, exclui usuário inteiro
5. Sem warnings de RLS no log do Supabase
6. URL antiga `/app/enviar-leitura` redireciona corretamente (todos os 3 cenários: 0/1/2+ vínculos)
7. Comparação: `SELECT COUNT(*) FROM moradores WHERE auth_user_id IS NOT NULL` deve igualar `SELECT COUNT(*) FROM unidade_acessos`

---

## 9. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| RLS regression (usuário vê o que não devia) | Alta | Testar manualmente com 4 perfis (admin, síndico, morador 1-vínculo, morador N-vínculos). Revisar cada policy linha-a-linha contra a antiga. |
| Data loss durante migração | Baixa | `moradores` permanece por 2 commits. Validar `COUNT(*)` antes do DROP. |
| Moradores órfãos (`auth_user_id IS NULL`) | Média | Relatório antes da migração. Decidir caso-a-caso (esperado: descartar). |
| Sessões ativas durante migração | Média | Deploy em horário de baixo tráfego. RLS nova começa a valer no próximo refresh do token. |
| Trigger `on_auth_user_created` não dispara pra users existentes | Certa (esperado) | Não é problema: INSERT manual no commit 1 popula `pessoas` pra todos os existentes. Trigger é só pra users novos. |
| FK quebrada (unidade ou user deletado em produção) | Baixa | `ON DELETE CASCADE` em ambas FKs limpa vínculos automaticamente. |
| Bookmarks antigos do morador | Média | Redirects 308 em todas as URLs antigas. |

---

## 10. Critérios de sucesso

- [ ] Schema novo aplicado: `pessoas` e `unidade_acessos` existem com constraints corretas
- [ ] Trigger `on_auth_user_created` cria automaticamente `pessoas` pra novos auth users
- [ ] Função `get_my_unidade_ids()` retorna SETOF UUID e filtra por `ativo = TRUE`
- [ ] Todas as policies migradas de `=` para `IN (SELECT get_my_unidade_ids())`
- [ ] `pessoas` e `unidade_acessos` têm RLS habilitada com policies corretas (admin/síndico/morador)
- [ ] `acessoActions` cria/edita/exclui vínculos via UI (modos novo user e user existente)
- [ ] Admin desabilita/reativa vínculo via toggle
- [ ] Admin exclui vínculo individual sem afetar outros vínculos do mesmo user
- [ ] Admin exclui user inteiro (cascade limpa pessoas + todos vínculos)
- [ ] Portal morador `/app` redireciona corretamente (0/1/2+ vínculos)
- [ ] Morador com 2+ vínculos consegue trocar entre unidades via dropdown no header
- [ ] URLs antigas (`/app/enviar-leitura` etc.) redirecionam pra estrutura nova
- [ ] Síndico vê contador de acessos por unidade
- [ ] `npm run build` passa sem erros
- [ ] Nenhum warning de RLS no Supabase logs
- [ ] `moradores` dropada com sucesso após validação em produção (commit 3)

---

## 11. Decisões deliberadas (fora de escopo)

Removidos por YAGNI; podem entrar em iteração futura se houver demanda real:

- **Área `/admin/usuarios` separada** pra gestão centralizada de users — admin continua editando user a partir do detalhe da unidade
- **Datas de início/fim de vínculo** — admin gerencia manualmente via desabilitar/excluir
- **Histórico de vínculos passados** — vínculos desabilitados ficam invisíveis pro morador/síndico mas continuam no banco; sem UI dedicada pra "ver histórico"
- **Restrição por tipo na cardinalidade** (ex: locatário só pode ter 1 vínculo) — admin julga
- **Notificações automáticas** ao criar/desabilitar vínculo — admin comunica externamente
- **Auditoria** (quem criou/desabilitou cada vínculo) — pode entrar em fase futura via tabela de log
