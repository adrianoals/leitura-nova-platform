# Site Header de Navegação — Design

**Data:** 2026-05-10
**Status:** Aprovado pelo usuário, pronto para plano de implementação
**Escopo:** Landing page institucional (`/`)

## Contexto

O site institucional (`src/app/(site)/page.tsx`) hoje não tem header de navegação. O usuário rola direto do Hero pelas seções (`#sobre`, `#servicos`, `#diferenciais`, `#depoimentos`, `#contato`) sem nenhum menu visível e sem caminho explícito pra acessar os portais autenticados (morador, síndico). O acesso ao login só é descoberto pelo footer ou pela URL direta.

A plataforma tem 3 portais: morador (`/login`), síndico (`/login/sindico`) e admin (`/login/admin`). O admin é interno e **não deve ser exposto** no site público.

## Objetivo

Adicionar um header fixo na home com:
1. Navegação entre as seções da landing page.
2. Acesso explícito aos portais de morador e síndico (sem admin).
3. Comportamento responsivo apropriado para mobile.

## Decisões aprovadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Portais expostos | Morador + Síndico | Admin é interno; não vai no site público |
| Hierarquia visual dos botões | Morador primário (preenchido), Síndico secundário (link/texto) | Morador é o público de maior tráfego |
| Comportamento sobre o Hero | Transparente sobre o Hero, vira branco/sólido ao rolar | Integra ao visual do Hero (gradiente azul); ganha legibilidade após sair dele |
| Mobile | Botão "Morador" sempre visível + hambúrguer pros links e Síndico | CTA principal a 1 toque, sem precisar abrir menu |
| Escopo | Apenas na home (`/`) | Páginas legais e de login têm layouts próprios |
| Logo no Hero | Remover | Header já mostra o logo no canto; evita duplicação |

## Arquitetura

### Componentes novos

Criados em `src/components/site/layout/`:

#### `Header.tsx` (client component)

Necessita ser client component por causa de:
- `useState` pro toggle do drawer mobile
- `useEffect` pro listener de scroll que troca o estado transparente/sólido

Estrutura JSX (desktop):

```
<header fixed top-0 z-50 transition>
  <Container>
    <Logo />
    <DesktopNav>      // hidden no mobile
      Sobre · Serviços · Diferenciais · Contato
    </DesktopNav>
    <RightSide>       // hidden no mobile
      <Link>Sou Síndico</Link>
      <PrimaryButton>Acesso do Morador →</PrimaryButton>
    </RightSide>
    <MobileRightSide> // só no mobile
      <PrimaryButtonSmall>Morador</PrimaryButtonSmall>
      <HamburgerButton onClick={openDrawer} />
    </MobileRightSide>
  </Container>
  <MobileDrawer open={drawerOpen} onClose={closeDrawer} />
</header>
```

Props: nenhuma (componente standalone, configuração interna).

#### `MobileDrawer.tsx` (client component)

Drawer lateral que abre da direita. Renderiza:
- Header do drawer (botão X de fechar)
- 4 links de navegação (mesmas âncoras do desktop)
- Separador (`<hr>`)
- Botão primário "Acesso do Morador" (full-width)
- Botão outline "Acesso do Síndico" (full-width)

Props:
```ts
{
  open: boolean;
  onClose: () => void;
}
```

### Componentes modificados

#### `src/components/site/sections/Hero.tsx`
- Remover o `<Image>` do logo (linhas 23-31)
- Adicionar padding-top no container de conteúdo (`pt-24` ou similar) para compensar o header fixo e dar respiro

#### `src/app/(site)/page.tsx`
- Importar e renderizar `<Header />` antes do `<Hero />`

### Sem alterações necessárias

- `src/app/layout.tsx` — header não vive aqui (não deve aparecer em `/login`, `/admin`, etc.)
- `src/proxy.ts` (middleware) — sem mudança de auth
- Componentes de outras áreas — isolado ao `(site)`

## Comportamento detalhado

### Estados visuais do header

| Estado | Trigger | Fundo | Texto/links | Botão Morador | Logo |
|---|---|---|---|---|---|
| **Topo** | `scrollY <= 20` | `transparent` | branco | branco com texto azul | versão branca |
| **Rolado** | `scrollY > 20` | `bg-white/90 backdrop-blur` + sombra leve | `slate-700` | azul sólido (`vscode-blue`) com texto branco | versão colorida |

Transição: `transition-all duration-200`.

Threshold de 20px evita "flicker" em micro-rolagens. Pode ser ajustado.

### Smooth scroll para âncoras

Tailwind aplica `scroll-behavior: smooth` quando se adiciona `scroll-smooth` no `<html>`. Verificar se já está em `globals.css` ou no `<html>` de `src/app/layout.tsx`. Se não estiver, adicionar.

Considerar `scroll-mt-20` (ou similar) nas seções para que o offset do header fixo não esconda o título da seção quando o usuário clica num âncora.

### Navegação por rota

| Item | Destino |
|---|---|
| Logo | `/` (scroll to top via `<Link href="/">`) |
| Sobre | `#sobre` |
| Serviços | `#servicos` |
| Diferenciais | `#diferenciais` |
| Contato | `#contato` |
| Acesso do Morador | `/login` |
| Acesso do Síndico | `/login/sindico` |

Os IDs já existem nas seções (verificado em `src/components/site/sections/*.tsx`). Não usar `#depoimentos` (a seção existe mas não foi pedida no menu — manter o menu enxuto).

### Drawer mobile

- Abre da direita com transição `translate-x` (300ms)
- Overlay escuro (`bg-black/50`) cobre o resto da tela; clique no overlay fecha
- Tecla `Esc` fecha
- `document.body.style.overflow = 'hidden'` enquanto aberto (scroll lock); restaura ao fechar
- Foco vai pro botão de fechar quando abre; volta pro hambúrguer quando fecha
- Foco fica aprisionado dentro do drawer (Tab/Shift+Tab cicla apenas elementos do drawer)
- Ao clicar em qualquer link/botão dentro do drawer, ele fecha

### Acessibilidade

- `<header role="banner">` (default do `<header>`)
- `<nav aria-label="Principal">` no nav desktop e drawer
- Hambúrguer: `<button aria-label="Abrir menu" aria-expanded={drawerOpen} aria-controls="mobile-drawer">`
- Drawer: `<div role="dialog" aria-modal="true" aria-label="Menu de navegação" id="mobile-drawer">`
- Botão de fechar: `<button aria-label="Fechar menu">`
- Todos os links/botões alcançáveis e operáveis via teclado
- Contraste WCAG AA mantido em ambos os estados (transparente sobre Hero azul + sólido branco)

## Estilo visual

Reutilizar tokens já em uso no projeto:
- Cor primária: `vscode-blue` (já configurada no Tailwind, vista no Hero e Footer)
- Tipografia: herda do `font-sans` aplicado no `<main>` da home
- Spacing/sizing: alinhar com o padrão do Footer (`max-w-6xl mx-auto px-6`)
- Botões: idealmente reutilizar `src/components/shared/ui/Button.tsx` se a API permitir as variantes necessárias; caso contrário, criar variante específica do header

A decisão de reutilizar ou criar novo componente de botão fica para a fase de plano/implementação após inspecionar a API do `Button` existente.

## Decisões deliberadas (fora de escopo)

Removidos por YAGNI — podem entrar em iteração futura se houver demanda real:

- **Dropdown de idioma** — site é monolíngue (PT-BR)
- **Busca** — não há conteúdo pesquisável
- **Mega-menu** — 4 links rasos não justificam
- **Scroll-spy (indicador de seção ativa)** — incrementa complexidade sem ganho proporcional num primeiro release; reavaliar depois
- **Header em outras páginas** (`/termos`, `/privacidade`, telas de login) — mantém o escopo focado na home conforme decisão do usuário

## Critérios de sucesso

- [ ] Header aparece apenas na home, não em `/login`, `/termos`, `/privacidade`
- [ ] Estado inicial: transparente sobre o Hero com texto branco
- [ ] Após rolar > 20px: branco sólido com sombra
- [ ] Clicar em links de nav rola suavemente até a seção correspondente
- [ ] Botão "Acesso do Morador" leva a `/login`
- [ ] Link "Sou Síndico" leva a `/login/sindico`
- [ ] Mobile mostra logo + botão Morador mini + hambúrguer
- [ ] Drawer mobile abre/fecha por hambúrguer, X, overlay e Esc
- [ ] Body scroll bloqueia enquanto drawer está aberto
- [ ] Logo do Hero foi removido; layout do Hero continua coerente
- [ ] Sem regressões visuais nas demais seções
- [ ] Sem `console.error` ou warning de hidratação

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Header transparente com texto branco fica ilegível se o background do Hero mudar | Estado transparente vinculado a `scrollY`, não a presença do Hero. Se substituir o Hero por um claro no futuro, ajustar threshold ou estado inicial. |
| Smooth scroll pula o título da seção pelo offset do header fixo | Adicionar `scroll-mt-20` (ou similar) nas seções alvo. |
| Hidratação do client component pode causar flicker do estado inicial | Usar valor inicial de `scrolled` baseado em `useEffect` (depois do mount); aceitar que primeiro frame seja "transparente" — é o estado correto pra topo da página. |
| Reutilizar `Button` pode não acomodar todas as variantes (transparente sobre Hero, mini mobile) | Inspecionar API durante implementação; criar componente local se necessário. |
