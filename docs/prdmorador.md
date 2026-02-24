# PRD - Portal do Morador

## 1. Objetivo

Entregar uma area logada para o morador visualizar e, quando permitido, enviar leitura da **propria unidade**.

O portal deve ser simples, direto e consistente com as regras do painel admin ja implementado.

## 2. Regras de negocio

1. Cada unidade possui apenas 1 morador proprietario (acesso unico).
2. O morador enxerga apenas dados da propria unidade.
3. Leituras visiveis ao morador:
   1. apenas meses fechados/publicados;
   2. limite de historico de 12 meses.
4. Envio de leitura pelo morador so aparece se:
   1. `condominios.envio_leitura_morador_habilitado = true`;
   2. mes atual nao estiver fechado em `fechamentos_mensais`.
5. Tipos de leitura dependem da configuracao do condominio:
   1. `tem_agua=true` e `tem_agua_quente=false` -> tipo `agua`;
   2. `tem_agua=true` e `tem_agua_quente=true` -> tipos `agua_fria` e `agua_quente`;
   3. `tem_gas=true` -> tipo `gas`.
6. Morador pode alterar a propria senha no portal.

## 3. Escopo

### 3.1 Dentro do escopo

1. Login do morador (`/login`).
2. Dashboard (`/app`) com resumo da unidade.
3. Historico (`/app/leituras`) limitado aos ultimos 12 meses.
4. Detalhe mensal (`/app/leituras/[mes]`) com leituras e fotos.
5. Envio de leitura (`/app/enviar-leitura`) com medicao e fotos.
6. Troca de senha (`/app/senha`).

### 3.2 Fora do escopo

1. Boletos, pagamentos e financeiro.
2. Edicao de cadastro pessoal.
3. Visualizacao de outras unidades/condominios.
4. Funcionalidades administrativas.

## 4. Experiencia esperada por tela

### 4.1 Dashboard (`/app`)

1. Exibir condominio, bloco e apartamento.
2. Cards por tipo de leitura habilitado:
   1. data;
   2. medicao;
   3. valor.
3. Quando nao houver leitura do mes atual, exibir mensagem clara de nao atualizado.
4. Atalhos para:
   1. historico;
   2. enviar leitura (apenas se permitido).

### 4.2 Historico (`/app/leituras`)

1. Listar meses com leitura disponivel (maximo 12 meses).
2. Cada linha exibe resumo por tipo e link para detalhe.
3. Se nao houver dados, exibir estado vazio com orientacao.

### 4.3 Detalhe mensal (`/app/leituras/[mes]`)

1. Exibir todas as leituras do mes selecionado para os tipos habilitados.
2. Exibir data, medicao e valor por leitura.
3. Exibir galeria de fotos quando houver.

### 4.4 Enviar leitura (`/app/enviar-leitura`)

1. Exibir formulario somente se envio estiver habilitado e mes aberto.
2. Campos:
   1. tipo;
   2. medicao;
   3. fotos.
3. Validacoes:
   1. medicao > 0;
   2. pelo menos 1 foto.
4. Salvar leitura com `criado_por_morador=true`.
5. Exibir feedback claro de sucesso/erro.

### 4.5 Trocar senha (`/app/senha`)

1. Solicitar senha atual, nova senha e confirmacao.
2. Validar senha minima e confirmacao.
3. Atualizar senha no Supabase Auth.

## 5. Fonte de dados

1. `moradores` (vinculo do usuario logado com unidade).
2. `unidades` e `condominios` (contexto da unidade e tipos habilitados).
3. `leituras_mensais` (leituras mensais por tipo).
4. `fotos_leitura` + Storage bucket `leitura-fotos` (fotos da leitura).
5. `fechamentos_mensais` (controle de publicacao e bloqueio de envio).

## 6. Criterios de aceite

1. Usuario nao autenticado deve ser redirecionado para `/login`.
2. Morador sem unidade vinculada deve ver mensagem de estado sem quebrar tela.
3. Historico deve respeitar limite de 12 meses.
4. Mes nao fechado nao pode aparecer para consulta do morador.
5. Envio de leitura deve falhar com mensagem amigavel quando o mes estiver fechado.
6. Troca de senha deve funcionar com feedback de sucesso e erro.
7. Navegacao deve manter o mesmo padrao visual do admin ja aprovado.

