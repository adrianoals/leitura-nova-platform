Segue um **PRD do Síndico** (papel intermediário entre Morador e Admin), alinhado com o que você descreveu.

---

# PRD — Painel do Síndico (Visão do Condomínio)

## 1) Visão geral

O Painel do Síndico é uma área logada onde o síndico acessa **apenas o condomínio dele** e consegue:

* Ver **todas as unidades** em forma de lista
* Acompanhar **comparativos de consumo do condomínio** (água/gás)
* Clicar em uma unidade para **visualizar o painel do morador daquela unidade** (modo somente leitura)

O síndico **não administra cadastros** (isso é do Admin) e **não edita leituras** (as leituras são inseridas pelo Admin; e, quando habilitado, pelo próprio morador via envio).

---

## 2) Objetivos

* Dar visibilidade do consumo do condomínio sem precisar pedir relatórios ao admin
* Facilitar suporte do síndico ao morador (“deixa eu ver o que aparece pra você”)
* Permitir comparações simples entre unidades e ao longo do tempo (últimos 12 meses)

---

## 3) Personas

* **Síndico:** quer acompanhar consumo, identificar unidades fora do padrão e conferir informações por unidade.
* (Secundário) **Conselheiro/Administrador do condomínio:** pode usar o mesmo perfil se você quiser futuramente.

---

## 4) Escopo

### Dentro do escopo (MVP)

* Login do síndico (rota própria ou mesma rota com papel “síndico”)
* Acesso a **um único condomínio**
* Lista de unidades com resumo de consumo e status
* Filtros e ordenação (ex.: maior consumo, unidade sem leitura no mês)
* Visão comparativa do condomínio (agregado)
* Visualizar unidade em modo “painel do morador” (read-only)

### Fora do escopo (não terá)

* Criar/editar condomínio, unidades, moradores (isso é Admin)
* Inserir/editar leituras e fotos (Admin e/ou Morador quando habilitado)
* Financeiro, boletos, pagamentos
* Exportações complexas (PDF/Excel) *(se quiser, pode virar fase 2)*

---

## 5) Regras e premissas

* O síndico só enxerga **o condomínio dele**
* As informações seguem a mesma regra do sistema:

  * **mês atual** (pode estar “não atualizado”)
  * histórico limitado aos **últimos 12 meses**
* Água/gás são habilitados por condomínio:

  * se o condomínio não tiver gás, nada de gás aparece
* Ao visualizar uma unidade, o síndico vê **exatamente a mesma tela do morador**, porém em modo “síndico” (sem ações de envio/edição, se você quiser manter bem claro).

---

## 6) Telas e funcionalidades

### 6.1 /login/sindico (ou /login com role)

**Objetivo:** autenticar síndico e direcionar ao condomínio.

* Campos: e-mail/identificador + senha
* “Esqueci a senha”
* Redireciona para o painel do condomínio

### 6.2 /sindico — Dashboard do condomínio

**Objetivo:** visão geral e comparativos.

Componentes:

* Identificação do condomínio
* Resumo:

  * consumo total (água/gás) do mês atual (se houver)
  * consumo total dos últimos 12 meses (visão histórica)
  * unidades sem leitura no mês (contador)
* Comparativos:

  * ranking de unidades por consumo no mês (top 5)
  * gráfico do consumo do condomínio nos últimos 12 meses (água/gás)

### 6.3 /sindico/unidades — Lista de unidades

**Objetivo:** tabela/lista com todas as unidades.

Colunas sugeridas:

* Unidade (identificador)
* Status mês atual: Atualizado / Não atualizado
* Consumo mês atual (água e/ou gás)
* Valor mês atual (água e/ou gás)
* Ação: “Ver unidade”

Filtros/ordenação:

* Ordenar por maior consumo
* Filtrar “sem leitura no mês”
* Buscar por número do apto / torre / bloco

### 6.4 /sindico/unidades/[id] — Visualizar unidade (modo morador)

**Objetivo:** abrir o painel igual ao do morador, mas para aquela unidade.

* Exibir “Você está visualizando como Síndico: Unidade X”
* Mostrar:

  * mês atual (data, medição, valor) ou “não atualizado”
  * histórico últimos 12 meses
  * fotos das leituras
* Sem permissão para editar
* (Opcional decisão): se envio de leitura estiver habilitado para moradores, o síndico **não** deve enviar (para evitar confusão). Ele só visualiza.

---

## 7) Fluxos principais

### Fluxo A — Acompanhar consumo geral

Login → Dashboard condomínio → ver gráfico/indicadores → abrir lista de unidades

### Fluxo B — Investigar unidade específica

Lista de unidades → ordenar por maior consumo → clicar na unidade → ver painel da unidade (modo morador)

### Fluxo C — Verificar unidades pendentes

Dashboard/lista → filtrar “não atualizado” → conferir quais unidades estão sem leitura

---

## 8) Requisitos funcionais (RF)

* RF01: Síndico autentica e acessa somente seu condomínio
* RF02: Síndico visualiza lista de todas as unidades com resumo
* RF03: Síndico visualiza comparativo de consumo do condomínio (últimos 12 meses)
* RF04: Síndico filtra/ordena unidades por consumo e status
* RF05: Síndico acessa painel de uma unidade com visão idêntica ao morador (read-only)

---

## 9) Requisitos não funcionais (RNF)

* Resposta rápida na lista (paginação se necessário)
* Segurança via RLS: síndico só acessa unidades do seu condomínio
* UI clara indicando modo síndico vs modo morador
* Mobile OK, mas foco principal em desktop

---

## 10) Modelo de dados (alto nível)

Além das tabelas já existentes, precisa de um vínculo do síndico ao condomínio:

**sindicos**

* `id`
* `auth_user_id`
* `condominio_id`
* `nome` (opcional)

Regras de acesso:

* `SELECT` em unidades/leitura/fotos permitido se `unidade.condominio_id` == `sindico.condominio_id`

---

Se você quiser, eu adapto esse PRD para bater exatamente com as rotas que você quer (ex.: `/login/sindico` e `/sindico`), e também já descrevo **as permissões (RLS) específicas do síndico** de um jeito bem direto.
