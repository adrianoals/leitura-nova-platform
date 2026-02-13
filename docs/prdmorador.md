Perfeito — editei o PRD **do login do morador** exatamente com o que você falou (sem “por enquanto” nas coisas que você decidiu que **não vão existir**).

---

# PRD — Área do Morador (Login por Apartamento) — Versão Ajustada

## 1) Visão geral

Área logada para o morador acessar **apenas informações** da sua unidade (apartamento).
Cada acesso é **por unidade** (não existe login que enxergue múltiplos apartamentos/condomínios).

O portal exibe somente:

* **Data da leitura**
* **Medição**
* **Valor**
* (Opcional) **Link para inserção de leitura**, apenas quando o condomínio/unidade estiver habilitado para isso.

---

## 2) Premissas e regras

### Regra A — Tudo é inserido pelo Admin

**Todas as informações exibidas no portal do morador** (leituras, valores, fotos e configurações) **são cadastradas pelo usuário Admin** no painel administrativo.

O morador **não edita nada** no portal.

### Regra B — Leituras mensais e simples

Cada registro de leitura é **mensal** e deve exibir somente:

* **Tipo:** Água e/ou Gás (se habilitado)
* **Data da leitura**
* **Medição**
* **Valor**

> Não exibir hora.

### Regra C — Mês atual + histórico limitado a 12 meses

* O morador pode ver o **mês atual** (se já existir leitura cadastrada pelo admin).
* Pode ver também um histórico limitado aos **últimos 12 meses**.
* Leituras anteriores a isso **não ficam disponíveis**.

### Regra D — Mês atual pode estar “não atualizado”

Se ainda não existir leitura do mês atual, exibir um aviso claro, exemplo:

* “Leitura do mês ainda não está atualizada.”

### Regra E — Link de inserção (condicional e sem confundir o usuário)

* Se o condomínio/unidade **tiver a opção de inserir medição via link habilitada**, o portal mostra um botão/link (ex.: “Informar medição”).
* Se **não tiver habilitado**, **não aparece nada** (o usuário não deve ver opção desabilitada, nem placeholder, nem aviso).

### Regra F — Tipos habilitados (água/gás)

* Se a unidade tiver **somente água**, mostrar apenas água.
* Se tiver **somente gás**, mostrar apenas gás.
* Se tiver **ambos**, mostrar os dois.

---

## 3) Escopo

### Dentro do escopo (o que terá)

* **/login** (login do morador)
* **/app** (dashboard da unidade) — apenas visualização
* Listagem de leituras: **mês atual + últimos 12 meses**
* Exibição de **fotos** vinculadas às leituras (quando existirem)
* Exibição condicional do **link de inserção** (quando habilitado)

### Fora do escopo (não terá)

* Visualizar histórico além de 12 meses
* **Pagamento, boleto, 2ª via, financeiro** (não entra no produto)
* **Alteração de dados cadastrais** (não terá; privacidade/irrelevante para o portal)
* Funcionalidades administrativas (admin é outro painel, separado)

### Exceção (permitido)

* Área simples para **trocar senha** no portal do morador (apenas isso).

---

## 4) Telas

### 4.1 /login — Login do morador

* Identificador (definir depois: e-mail/CPF/código) + senha
* “Esqueci minha senha”
* Estados: carregando / erro / sucesso

### 4.2 /app — Dashboard da unidade (somente informações)

**Cabeçalho:**

* Identificação da unidade (ex.: Condomínio • Torre/Bloco • Apto)

**Seções:**

* Água (se habilitado)
* Gás (se habilitado)

**Em cada seção (água/gás):**

* Mês atual:

  * Se existir: **data da leitura + medição + valor**
  * Se não existir: “Leitura do mês ainda não está atualizada.”
* Acesso ao histórico: “Ver últimos 12 meses”
* (Opcional) botão “Ver fotos” (se existirem)

**Link de inserção:**

* Exibir somente se a unidade/condomínio estiver habilitado
* Se não estiver habilitado: não aparece

### 4.3 /leituras — Histórico (últimos 12 meses)

* Lista limitada aos últimos 12 meses
* Cada item:

  * Tipo (água/gás)
  * Data da leitura
  * Medição
  * Valor
  * “Detalhes / Fotos” (se aplicável)

### 4.4 /leituras/[mes] — Detalhe do mês

* Tipo (água/gás)
* Data da leitura
* Medição
* Valor
* Fotos (galeria), se houver

### 4.5 /senha (ou /settings) — Trocar senha

* Trocar senha (única configuração do morador)

---

## 5) Configurações controladas pelo Admin (que impactam o morador)

* Unidade tem **água**? (sim/não)
* Unidade tem **gás**? (sim/não)
* Unidade/condomínio tem **link de inserção**? (sim/não)
* URL do link (se habilitado)
* Cadastro mensal de:

  * data da leitura
  * medição
  * valor
  * fotos (opcional)

---

Se estiver ok, no próximo passo a gente faz o **PRD do Admin** (painel separado), descrevendo exatamente como o admin vai cadastrar: condomínios, unidades, habilitações (água/gás/link) e inserir as leituras mensais.
