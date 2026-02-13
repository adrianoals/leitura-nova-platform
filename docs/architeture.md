Claro — ajustei com as duas coisas:

1. Se o condomínio tiver **envio de foto pelo morador** habilitado, então o morador também precisa **informar a medição** junto com a foto (não é só upload).
2. No cadastro de morador, faz sentido ter **nome** (em vez de apelido), como opcional.

Abaixo está o conteúdo revisado (mantive o resto igual):

---

# Architecture — Leitura Nova (Portal do Morador + Painel Admin)

## 1. Visão geral

O sistema é composto por:

* **Site institucional** (público)
* **Portal do Morador** (login por unidade/apartamento, principalmente consulta)
* **Painel Admin** (gestão de condomínios, unidades, moradores, leituras e fotos)

Stack principal:

* **Frontend:** Next.js (App Router)
* **Banco:** Supabase (Postgres)
* **Auth:** Supabase Auth
* **Storage:** Supabase Storage (fotos das leituras e/ou fotos enviadas pelo morador)
* **Segurança:** RLS (Row Level Security) no Postgres

---

## 2. Objetivos de arquitetura

* Separar claramente **público** vs **área logada** (morador/admin).
* Garantir que o morador só acesse **dados da sua unidade**.
* Facilitar operação do admin (cadastro e inserção mensal).
* Manter performance boa mesmo com fotos (lazy-loading e imagens otimizadas).
* Preparar para crescimento futuro (migrar plano/infra sem reescrever tudo).

---

## 3. Estrutura de rotas (Next.js)

Sugestão de organização por grupos (App Router):

* `/` (site institucional)
* `/login` (morador)
* `/login/admin` (admin)
* `/app` (portal do morador)
* `/admin` (painel admin)

Exemplo de pastas:

* `src/app/(public)/...`
* `src/app/(auth)/login/page.tsx`
* `src/app/(auth)/login/admin/page.tsx`
* `src/app/(resident)/app/page.tsx`
* `src/app/(admin)/admin/page.tsx`

> O morador não escolhe condomínio/unidade após logar: login é **por unidade**.

---

## 4. Componentes do sistema

### 4.1 Web App (Next.js)

* Renderiza páginas públicas, portal do morador e painel admin.
* Usa `@supabase/supabase-js` para:

  * autenticação
  * leitura/escrita no Postgres (via RLS)
  * upload/leitura de imagens no Storage

### 4.2 Supabase Postgres (dados)

Armazena:

* condomínios
* unidades (apartamentos)
* moradores (login por unidade)
* leituras mensais (água/gás)
* fotos vinculadas às leituras
* configuração de **envio de leitura pelo morador** (quando habilitado)

### 4.3 Supabase Storage (fotos)

* Bucket: `leitura-fotos` (exemplo)
* Arquivos organizados por `condominio_id/unidade_id/mes_referencia/tipo/...`
* O portal do morador carrega com **lazy load** e (idealmente) imagens otimizadas.

---

## 5. Modelo de dados (alto nível)

### 5.1 Entidades

**condominios**

* `id`
* `nome`
* `tem_agua` (bool)
* `tem_gas` (bool)
* `envio_leitura_morador_habilitado` (bool)

  > Quando `true`, o portal do morador exibe uma aba/ação para o morador **enviar a foto do relógio + informar a medição** (no mesmo envio). Isso é usado quando o medidor fica dentro do apartamento.

**unidades**

* `id`
* `condominio_id` (FK)
* `identificador` (ex.: "Torre A - Apto 123")

**moradores**

* `id`
* `unidade_id` (FK, 1 login -> 1 unidade)
* `auth_user_id` (UUID do Supabase Auth)
* `nome` (text, opcional)

**leituras_mensais**

* `id`
* `unidade_id` (FK)
* `tipo` ("agua" | "gas")
* `mes_referencia` (YYYY-MM ou date representando o mês)
* `data_leitura` (date)
* `medicao` (numeric)
* `valor` (numeric)
* `criado_por_admin_auth_user_id` (uuid) (recomendado)
* `created_at`

**fotos_leitura**

* `id`
* `leitura_id` (FK)
* `storage_path` (text)
* `created_at`

> Regra importante: limitar visualização do morador aos **últimos 12 meses**.

---

## 6. Regras de negócio principais

### 6.1 Portal do morador

* Exibe apenas dados da **unidade do login**.
* Mostra:

  * mês atual (se existir leitura)
  * histórico limitado aos últimos 12 meses
* Exibe:

  * tipo (água/gás **conforme o condomínio** tiver habilitado)
  * data da leitura, medição e valor
  * fotos vinculadas à leitura

#### Envio de leitura pelo morador (condicional)

* Se `envio_leitura_morador_habilitado = true` no condomínio:

  * o portal exibe uma aba/ação para o morador **enviar a foto do relógio e informar a medição** (a medição é obrigatória no envio).
* Se `false`:

  * essa opção **não aparece** para o morador.

> Observação: não é “link externo”; é uma funcionalidade interna de envio.

### 6.2 Painel admin

* Admin pode:

  * criar/listar/editar condomínios
  * criar/listar/editar unidades
  * criar/listar/editar moradores e vincular a unidade
  * inserir leituras mensais e fotos
  * habilitar no **condomínio**: água, gás e envio de leitura pelo morador
  * “visualizar como morador” (impersonation)

---

## 7. Autenticação e autorização

### 7.1 Auth

* Supabase Auth para morador e admin.
* Diferenciação de permissões por:

  * **role/claim** no JWT (ex.: `role=admin`), ou
  * tabela de perfis (ex.: `admin_users`) validada por RLS.

### 7.2 RLS (Row Level Security)

Objetivo: garantir segurança no nível do banco.

* Morador:

  * pode `SELECT` apenas registros da sua `unidade_id`
  * não pode `INSERT/UPDATE/DELETE` em leituras oficiais
  * pode enviar leitura (foto + medição) **somente** se `envio_leitura_morador_habilitado=true` e apenas para a própria unidade
* Admin:

  * pode CRUD em todas as tabelas operacionais

Recomendação:

* Tabela `moradores` relaciona `auth_user_id -> unidade_id`
* Policies do tipo:

  * `leituras_mensais`: `SELECT` permitido se `unidade_id` pertence ao `auth.uid()`
  * `fotos_leitura`: `SELECT` permitido se a `leitura_id` pertence à unidade do `auth.uid()`

---

## 8. Estratégia para fotos (performance e custo)

* Compressão no client antes do upload (ideal):

  * largura máxima ~1200px
  * qualidade 70–80
  * preferir WebP/JPEG
* Lazy-load no portal
* Política de retenção alinhada com o produto:

  * como o morador vê só 12 meses, considerar manter fotos no app por 12 meses

---

## 9. Integração e camada de dados no Next.js

Duas opções comuns:

### Opção A — Supabase direto no client (com RLS)

* Mais simples para MVP
* Acesso controlado por RLS
* Bom para páginas com dados do próprio usuário (morador)

### Opção B — Rotas API no Next.js (server)

* Útil para lógica mais complexa
* Pode usar service role key em server (com cuidado)
* Bom para “impersonation” e ações admin mais sensíveis

Recomendação inicial:

* Morador: Opção A (direto com RLS)
* Admin: Opção B ou A dependendo do nível de controle desejado

---

## 10. Observabilidade e auditoria (mínimo recomendado)

* Logs no frontend (erros de fetch, upload)
* Em banco:

  * `created_at`
  * `criado_por_admin_auth_user_id` em leituras
* (Opcional) tabela `audit_log` para ações admin

---

## 11. Ambientes e deploy

* Ambientes:

  * `dev` (Supabase project dev)
  * `prod` (Supabase project prod)
* Variáveis:

  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * (server) `SUPABASE_SERVICE_ROLE_KEY` (se usar API routes com privilégios)

---

## 12. Principais riscos e mitigação

* **Risco:** fotos pesarem no plano free

  * Mitigação: compressão + retenção 12 meses
* **Risco:** permissões incorretas (vazamento de dados)

  * Mitigação: RLS forte + testes de policies + nunca confiar só no frontend
* **Risco:** admin inserindo dados errados

  * Mitigação: validações, bloqueio de duplicidade por mês/tipo/unidade, auditoria

---

## 13. Próximos passos sugeridos

1. Definir modelo final de auth:

   * `role=admin` via claims ou tabela `admin_users`
2. Implementar tabelas + RLS
3. Montar front do morador (12 meses, envio de leitura quando habilitado)
4. Montar front do admin (CRUD + inserção de leituras + upload fotos)
5. Implementar “visualizar como morador”

---
