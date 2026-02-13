Segue um **PRD do Painel Admin** (separado do login do morador), com as funções que você descreveu.

---

# PRD — Painel do Administrador (Admin)

## 1) Visão geral

O Painel Admin é o sistema interno para a equipe da Leitura Nova (administradores) gerenciarem:

* Condomínios
* Unidades (apartamentos)
* Moradores (cadastro/vínculo com unidade)
* Leituras mensais (água/gás), valores e fotos
* Habilitações por condomínio/unidade (água, gás, link de inserção)
* Modo “visualizar como morador” (impersonation)

O morador apenas consulta informações; **tudo é cadastrado pelo admin**.

---

## 2) Objetivo

Permitir que o admin mantenha o sistema atualizado com o mínimo de fricção:

* Cadastrar estrutura (condomínio → unidades → moradores)
* Registrar leituras mensais e anexar fotos
* Controlar quais recursos aparecem para o morador (água/gás/link)
* Auditar/validar o que o morador está vendo, através do “visualizar como”

---

## 3) Personas

* **Admin (operacional):** cadastra condomínios, unidades, moradores, leituras e fotos.
* **Admin (suporte):** acessa unidade de morador (visualizar como) para tirar dúvidas.

---

## 4) Escopo

### Dentro do escopo (o que terá)

* Login admin em **/login/admin**
* Dashboard do admin
* CRUD de Condomínios
* Cadastro em massa ou manual de Unidades (apartamentos)
* Cadastro em massa ou manual de Moradores (e vínculo com unidade)
* Inserção de Leituras Mensais por unidade (água/gás), com **data, medição, valor**
* Upload e vinculação de Fotos à leitura
* Configurações:

  * habilitar água/gás
  * habilitar link de inserção (e definir URL)
* “Visualizar como morador” por unidade

### Fora do escopo (por enquanto / ou não mencionado)

* Financeiro avançado (regras de cobrança, repasses, etc.)
* Integrações externas (import automático, leitura via IoT)
* Permissões complexas (múltiplos níveis de admin) — pode entrar depois se você quiser

---

## 5) Módulos e telas

### 5.1 /login/admin — Login do administrador

* Campos: usuário + senha
* Estados: erro/ok/loading
* (Opcional) recuperar senha

---

### 5.2 /admin — Dashboard (visão geral)

**Objetivo:** acesso rápido às operações do dia a dia.

* Resumo:

  * Total de condomínios
  * Total de unidades
  * Leituras pendentes do mês (mês atual sem leitura cadastrada)
* Atalhos:

  * Criar condomínio
  * Importar/cadastrar unidades
  * Inserir leituras
  * Buscar unidade/morador
  * Visualizar como morador

---

### 5.3 Condomínios — Listar / Criar / Editar

**Listar**

* Tabela com condomínios
* Busca por nome
* Ações: ver / editar / entrar no condomínio

**Criar/Editar condomínio**

* Nome do condomínio
* Configurações do condomínio:

  * Link de inserção habilitado? (sim/não)
  * URL do link (se habilitado)
* (Opcional) observações internas

> Observação: se você preferir, “água/gás” pode ser por condomínio **ou** por unidade. Como você falou “habilitar água e gás”, vou colocar como configuração que pode existir no condomínio e/ou unidade (você define depois).

---

### 5.4 Unidades (Apartamentos) — Cadastrar / Listar / Editar

**Objetivo:** criar a lista de apartamentos por condomínio.

* Campos sugeridos:

  * Condomínio
  * Identificador da unidade (ex.: Apto 123, Torre A / Bloco B)
  * Água habilitada? (sim/não)
  * Gás habilitado? (sim/não)
* Ações:

  * Criar unidade
  * Edição em massa (opcional)
  * Importação via planilha (opcional, mas normalmente ajuda muito)

---

### 5.5 Moradores — Cadastrar / Listar / Vincular à unidade

**Objetivo:** criar lista de moradores e vincular a um apartamento.

* Cadastro do morador:

  * Nome (opcional, se quiser privacidade pode ser “apelido” ou “responsável”)
  * Identificador de login (definir: e-mail/CPF/código)
  * Senha / reset de senha
  * Unidade vinculada (obrigatório)
* Regras:

  * 1 login → 1 unidade

---

### 5.6 Leituras Mensais — Inserir / Editar

**Objetivo:** inserir mensalmente as leituras de cada unidade.

**Dados por leitura (por tipo):**

* Unidade
* Tipo: Água ou Gás
* Mês de referência
* Data da leitura (somente data)
* Medição
* Valor
* Fotos (0..N)

**Fluxos possíveis:**

* Inserir leitura unitária (uma unidade por vez)
* Inserção em lote (opcional: por condomínio/mês)

**Validações:**

* Não permitir duplicar leitura do mesmo tipo no mesmo mês para a mesma unidade (regra sugerida)
* Se unidade não tem gás habilitado, não mostrar opção de gás, etc.

---

### 5.7 Fotos — Upload e gestão

**Objetivo:** anexar fotos a uma leitura.

* Upload múltiplo
* Preview
* Remover foto
* Fotos sempre vinculadas a uma leitura específica

---

### 5.8 Visualizar como morador (Impersonation)

**Objetivo:** admin escolher uma unidade e abrir a visão do morador, para suporte/conferência.

* Admin seleciona:

  * Condomínio
  * Unidade
* Abre a interface do morador como “modo visualização”
* Deve existir um indicador claro:

  * “Você está visualizando como: Unidade X (modo Admin)”
* Ação para sair do modo visualização

---

## 6) Fluxos principais

### Fluxo A — Onboarding de condomínio

Criar condomínio → cadastrar unidades → cadastrar moradores → (opcional) configurar link → pronto para uso

### Fluxo B — Rotina mensal

Seleciona condomínio/mês → insere leituras (água/gás) → adiciona fotos → valida → morador passa a ver no portal

### Fluxo C — Suporte

Buscar morador/unidade → visualizar como morador → conferir o que ele está vendo → orientar

---

## 7) Requisitos funcionais (RF)

* RF01: Admin faz login em /login/admin
* RF02: Admin cria e gerencia condomínios
* RF03: Admin cria e gerencia unidades
* RF04: Admin cria e gerencia moradores vinculados a unidades
* RF05: Admin cadastra leituras mensais com data, medição e valor
* RF06: Admin adiciona fotos por leitura
* RF07: Admin habilita água/gás e link de inserção conforme regras do condomínio/unidade
* RF08: Admin consegue “visualizar como morador” por unidade

---

## 8) Requisitos não funcionais (RNF)

* Interface rápida para uso operacional (evitar muitos cliques)
* Upload de imagens com boa performance
* Auditabilidade básica (quem inseriu/alterou leitura) — recomendado
* Responsivo (uso em desktop principalmente, mas funcionar no mobile)

---

## 9) Modelo de dados (alto nível)

* Condomínio

  * nome
  * link_insercao_habilitado
  * link_insercao_url
* Unidade

  * condominio_id
  * identificador (torre/bloco/apto)
  * agua_habilitada
  * gas_habilitado
* Morador (login)

  * unidade_id
  * identificador_login (email/cpf/codigo)
  * senha_hash (backend)
* LeituraMensal

  * unidade_id
  * tipo (agua/gas)
  * mes_referencia
  * data_leitura
  * medicao
  * valor
  * criado_por_admin_id (recomendado)
* FotoLeitura

  * leitura_id
  * url

---

Se você quiser ajustar agora, os dois pontos que normalmente precisam decisão rápida são:

1. **Água/Gás é habilitado por condomínio, por unidade, ou os dois?**
2. O “link de inserção” é por **condomínio** mesmo (como você falou) ou pode ser por unidade?

Mas mesmo sem decidir isso, o PRD acima já dá pra começar o front do admin.
