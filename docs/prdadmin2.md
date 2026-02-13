Segue a **reformulação** do documento, já com as correções que você pediu (principalmente o **Dashboard** e a forma certa de entender a aba “Moradores” como **criação de acesso**).

---

# Documentação — Painel Administrativo (Versão Reformulada)

## 1) Dashboard do Admin (o que deve aparecer)

O painel administrativo **não precisa** mostrar “Moradores” como contador/ícone no dashboard.

No dashboard, o admin deve ver apenas:

* **Condomínios** (quantidade)
* **Unidades** (quantidade)
* **Leituras concluídas** (ou “leituras finalizadas” / “leituras cadastradas”)

  > Aqui a ideia é: leituras que o admin já inseriu e concluiu por mês/condomínio.

✅ Ou seja: **sem ícone de morador** no dashboard.

---

## 2) Cadastro de Condomínios (correto como está)

Ao criar um condomínio, o admin define as configurações principais:

* **Nome do condomínio**
* **Tem água?** (sim/não)
* **Tem gás?** (sim/não)
* **Envio de leitura pelo morador habilitado?** (sim/não)
* **Quantidade de relógios de água** (ex.: 1 ou 2 — água fria/água quente)

Essas configurações controlam:

* o que aparece no portal do morador,
* o que aparece no painel do síndico,
* e o que será exigido na tela de inserção de leituras.

---

## 3) Cadastro de Unidades (apartamentos)

Depois de criar o condomínio, o admin cadastra as unidades.

Campos sugeridos:

* Condomínio
* Identificador da unidade (ex.: Torre A – Apto 123)

Regras:

* As unidades **não precisam** de “tem água/tem gás” (isso é do condomínio)
* O admin primeiro cadastra **todas as unidades**, e só depois habilita os acessos

---

## 4) Aba “Moradores” (ajuste de entendimento e descrição)

Essa aba precisa ser descrita claramente como:

### **Aba Moradores = Aba de Acessos (criar login por unidade)**

Mesmo que você chame de “Moradores” no menu, o propósito é:

* **criar o login de acesso** do morador para cada unidade.

Regras importantes:

* **Toda unidade sempre terá exatamente 1 morador (1 acesso)**
  (nem mais, nem menos).
* O fluxo correto é:

  1. Admin cria o condomínio
  2. Admin cria as unidades
  3. Admin entra na aba **Moradores/Acessos** e cria o login **para cada unidade**

Fluxo da tela (Moradores/Acessos):

1. Admin seleciona o **condomínio**
2. O sistema carrega a **lista de unidades** daquele condomínio
3. Para cada unidade, o admin cria o acesso:

   * Nome do morador (opcional/recomendado)
   * Identificador de login (e-mail/código etc.)
   * Senha (criar/resetar)

✅ Resultado: cada unidade passa a ter um usuário que consegue acessar o portal.

> Observação: o dashboard não mostra “moradores”, mas a aba existe porque é onde o admin habilita o acesso por unidade.

---

## 5) Leituras (mensal e retroativo)

Essa parte está correta e fica assim:

Fluxo:

1. Admin seleciona o **condomínio**
2. Admin escolhe o **mês de referência** (pode ser retroativo)
3. O sistema mostra a **lista de unidades**
4. Para cada unidade, o admin informa:

   * **Medição/Leitura** (valor)
   * **Valor** (se aplicável)
   * **Foto** (upload)
   * Se tiver 2 relógios de água: campos separados (água fria e água quente)

Depois disso:

* o sistema calcula o **consumo automaticamente** (diferença mês atual vs mês anterior).

---

## 6) Resumo final do fluxo do Admin (sequência correta)

1. **Criar condomínio** (com água/gás/envio pelo morador/relógios de água)
2. **Criar unidades**
3. **Criar acessos por unidade** (na aba Moradores/Acessos)
4. **Inserir leituras** por mês (inclui retroativo e fotos)
5. Sistema calcula **consumo** automaticamente

---
