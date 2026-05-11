# Site Header de Navegação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar header de navegação fixo na home (`/`) com links para as seções, botão primário "Acesso do Morador" (→ `/login`) e link secundário "Sou Síndico" (→ `/login/sindico`). Estado transparente sobre o Hero, vira branco/sólido ao rolar. Mobile com botão Morador sempre visível e hambúrguer pros demais itens.

**Architecture:** Dois componentes client novos em `src/components/site/layout/` — `Header.tsx` (com listener de scroll e estado do drawer) e `MobileDrawer.tsx` (slide-in da direita com nav e CTAs). Renderizado apenas em `src/app/(site)/page.tsx` antes do `<Hero />`. Logo do Hero é removido para evitar duplicação.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, `react-icons/fa` (já em uso).

**Project context:**
- Não há framework de teste configurado. Verificação = `npm run lint` + `npm run build` (type-check) + checagem visual em `npm run dev`.
- Cores: tokens `vscode-blue`, `vscode-blue-dark`, `vscode-blue-light` definidos em `src/app/globals.css`.
- Logo único em `/public/images/logoleituranova-hero.jpg` (versão colorida). Para usar em fundo escuro/transparente, aplicar Tailwind `brightness-0 invert` (mesma técnica usada em `Footer.tsx`).
- O Tailwind no projeto não tem `scroll-smooth` aplicado em lugar nenhum hoje. Vamos adicionar no `<html>` em `src/app/layout.tsx`.

---

## File Structure

### Criar

| Arquivo | Responsabilidade |
|---|---|
| `src/components/site/layout/Header.tsx` | Header fixo: logo, nav desktop, área direita (Síndico link + Morador botão), área mobile (Morador mini + hambúrguer), listener de scroll, controle do drawer |
| `src/components/site/layout/MobileDrawer.tsx` | Drawer lateral mobile: overlay, slide-in, links, CTAs Morador/Síndico, gerenciamento de foco e scroll lock |

### Modificar

| Arquivo | Mudança |
|---|---|
| `src/app/layout.tsx` | Adicionar `className="scroll-smooth"` em `<html>` para smooth scroll global |
| `src/app/(site)/page.tsx` | Importar e renderizar `<Header />` antes do `<Hero />` |
| `src/components/site/sections/Hero.tsx` | Remover `<Image>` do logo (linhas 23-31). Adicionar `pt-16 md:pt-20` no `<section>` para compensar header fixo. |
| `src/components/site/sections/About.tsx` | Adicionar `scroll-mt-20` na `<section>` para offset de âncora |
| `src/components/site/sections/Services.tsx` | Adicionar `scroll-mt-20` na `<section>` |
| `src/components/site/sections/Differentiators.tsx` | Adicionar `scroll-mt-20` na `<section>` |
| `src/components/site/sections/Contact.tsx` | Adicionar `scroll-mt-20` na `<section>` |

### NÃO modificar

- `src/app/layout.tsx` (root) — header não é renderizado aqui (não deve aparecer em `/login`, `/admin`, etc.)
- `src/proxy.ts` (middleware) — sem mudança de auth
- `src/components/shared/ui/Button.tsx` — botões do header têm estilo próprio (não cabe nas variantes existentes que assumem `px-8 py-4` + ícone obrigatório)

---

## Task 1: Adicionar scroll-smooth e scroll-mt nas seções

**Why first:** Pequena mudança de base que não tem efeito visual sozinha, mas garante que quando o header rolar até uma âncora o título da seção não fique escondido atrás do header fixo.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/site/sections/About.tsx`
- Modify: `src/components/site/sections/Services.tsx`
- Modify: `src/components/site/sections/Differentiators.tsx`
- Modify: `src/components/site/sections/Contact.tsx`

- [ ] **Step 1.1: Adicionar `scroll-smooth` ao `<html>` no root layout**

Em `src/app/layout.tsx`, mudar a linha 58:

```tsx
// Antes:
<html lang="pt-br">

// Depois:
<html lang="pt-br" className="scroll-smooth">
```

- [ ] **Step 1.2: Adicionar `scroll-mt-20` na `<section>` de cada seção do menu**

Para cada um dos 4 arquivos de seção, adicionar `scroll-mt-20` à classe da `<section>`:

`src/components/site/sections/About.tsx` — linha 5:
```tsx
// Antes:
<section id="sobre" className="bg-white py-20 sm:py-32">

// Depois:
<section id="sobre" className="scroll-mt-20 bg-white py-20 sm:py-32">
```

`src/components/site/sections/Services.tsx` — linha 19:
```tsx
// Antes:
<section id="servicos" className="bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light py-20 sm:py-32 text-white relative overflow-hidden">

// Depois:
<section id="servicos" className="scroll-mt-20 bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light py-20 sm:py-32 text-white relative overflow-hidden">
```

`src/components/site/sections/Differentiators.tsx` — linha 22:
```tsx
// Antes:
<section id="diferenciais" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/80">

// Depois:
<section id="diferenciais" className="scroll-mt-20 py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/80">
```

`src/components/site/sections/Contact.tsx` — linha 10:
```tsx
// Antes:
<section id="contato" className="py-20 px-4 text-center bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light text-white relative overflow-hidden">

// Depois:
<section id="contato" className="scroll-mt-20 py-20 px-4 text-center bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light text-white relative overflow-hidden">
```

- [ ] **Step 1.3: Verificar lint passa**

Run: `npm run lint`
Expected: sem erros novos. (Pode haver warnings pré-existentes — só não pode haver novos.)

- [ ] **Step 1.4: Commit**

```bash
git add src/app/layout.tsx src/components/site/sections/About.tsx src/components/site/sections/Services.tsx src/components/site/sections/Differentiators.tsx src/components/site/sections/Contact.tsx
git commit -m "Add scroll-smooth and scroll-mt utilities for fixed header offset"
```

---

## Task 2: Criar componente MobileDrawer

**Why next:** É dependência do Header (Header importa MobileDrawer). Construir bottom-up garante que cada peça é montável.

**Files:**
- Create: `src/components/site/layout/MobileDrawer.tsx`

- [ ] **Step 2.1: Criar `MobileDrawer.tsx` com o conteúdo abaixo**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileDrawer({ open, onClose, navLinks }: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusables = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4 border-b border-slate-200">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-2 text-slate-700 hover:text-vscode-blue rounded-md focus:outline-none focus:ring-2 focus:ring-vscode-blue"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col p-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-3 text-base font-medium text-slate-700 hover:text-vscode-blue"
            >
              {link.label}
            </a>
          ))}
          <hr className="my-4 border-slate-200" />
          <Link
            href="/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-vscode-blue text-white text-sm font-semibold hover:bg-vscode-blue-dark transition-colors"
          >
            Acesso do Morador
          </Link>
          <Link
            href="/login/sindico"
            onClick={onClose}
            className="mt-2 w-full inline-flex items-center justify-center px-4 py-3 rounded-md border border-vscode-blue text-vscode-blue text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Acesso do Síndico
          </Link>
        </nav>
      </div>
    </>
  );
}
```

- [ ] **Step 2.2: Verificar build/type-check passa**

Run: `npm run build`
Expected: build completa sem erros TypeScript. (O componente novo ainda não é usado em nenhum lugar — esse build verifica que o arquivo está sintaticamente correto e tipado.)

Se a build for muito lenta no contexto do plano, pode usar `npx tsc --noEmit` em vez disso.

- [ ] **Step 2.3: Verificar lint passa**

Run: `npm run lint`
Expected: sem erros novos.

- [ ] **Step 2.4: Commit**

```bash
git add src/components/site/layout/MobileDrawer.tsx
git commit -m "Add MobileDrawer component for site header"
```

---

## Task 3: Criar componente Header

**Files:**
- Create: `src/components/site/layout/Header.tsx`

- [ ] **Step 3.1: Criar `Header.tsx` com o conteúdo abaixo**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa';
import MobileDrawer from './MobileDrawer';

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Contato', href: '#contato' },
];

const SCROLL_THRESHOLD = 20;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkColor = scrolled
    ? 'text-slate-700 hover:text-vscode-blue'
    : 'text-white/90 hover:text-white';

  const moradorButtonColor = scrolled
    ? 'bg-vscode-blue text-white hover:bg-vscode-blue-dark'
    : 'bg-white text-vscode-blue hover:bg-blue-50';

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
          scrolled ? 'bg-white/90 backdrop-blur shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Leitura Nova - Página inicial"
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-vscode-blue rounded"
          >
            <Image
              src="/images/logoleituranova-hero.jpg"
              alt="Leitura Nova"
              width={140}
              height={40}
              priority
              className={`h-9 w-auto transition ${scrolled ? '' : 'brightness-0 invert'}`}
            />
          </Link>

          <nav aria-label="Principal" className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${linkColor}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login/sindico"
              className={`text-sm font-medium transition-colors ${linkColor}`}
            >
              Sou Síndico
            </Link>
            <Link
              href="/login"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${moradorButtonColor}`}
            >
              Acesso do Morador
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${moradorButtonColor}`}
            >
              Morador
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className={`p-2 rounded-md transition-colors ${
                scrolled ? 'text-slate-700' : 'text-white'
              }`}
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
```

**Note on z-index:** O header usa `z-40` e o drawer usa `z-50`, então o drawer (quando aberto) fica visualmente por cima do header. Isso é intencional — evita que o header transparente apareça na frente do drawer.

- [ ] **Step 3.2: Verificar build passa**

Run: `npm run build`
Expected: completa sem erros. (Header importa MobileDrawer — importação válida.)

- [ ] **Step 3.3: Verificar lint passa**

Run: `npm run lint`
Expected: sem erros novos.

- [ ] **Step 3.4: Commit**

```bash
git add src/components/site/layout/Header.tsx
git commit -m "Add site Header component with scroll-aware styling"
```

---

## Task 4: Renderizar Header na home e remover logo do Hero

**Why together:** Renderizar o Header com o Hero ainda tendo o logo grande causa duplicação visual feia. Combinar as duas mudanças num único commit mantém o histórico visualmente coerente.

**Files:**
- Modify: `src/app/(site)/page.tsx`
- Modify: `src/components/site/sections/Hero.tsx`

- [ ] **Step 4.1: Importar e renderizar Header em `(site)/page.tsx`**

`src/app/(site)/page.tsx` — adicionar import na linha 7 e renderizar o componente como primeiro filho do `<main>`:

```tsx
// Antes (linhas 1-7):
import Hero from '@/components/site/sections/Hero';
import About from '@/components/site/sections/About';
import Services from '@/components/site/sections/Services';
import Differentiators from '@/components/site/sections/Differentiators';
import Testimonials from '@/components/site/sections/Testimonials';
import Contact from '@/components/site/sections/Contact';
import Footer from '@/components/site/layout/Footer';

// Depois:
import Hero from '@/components/site/sections/Hero';
import About from '@/components/site/sections/About';
import Services from '@/components/site/sections/Services';
import Differentiators from '@/components/site/sections/Differentiators';
import Testimonials from '@/components/site/sections/Testimonials';
import Contact from '@/components/site/sections/Contact';
import Footer from '@/components/site/layout/Footer';
import Header from '@/components/site/layout/Header';
```

E modificar o JSX (linhas 37-45) para incluir o Header como primeiro filho de `<main>`:

```tsx
// Antes:
<main className="font-sans text-gray-900">
  <Hero />
  <About />
  <Services />
  <Differentiators />
  <Testimonials />
  <Contact />
  <Footer />
</main>

// Depois:
<main className="font-sans text-gray-900">
  <Header />
  <Hero />
  <About />
  <Services />
  <Differentiators />
  <Testimonials />
  <Contact />
  <Footer />
</main>
```

- [ ] **Step 4.2: Remover `<Image>` do logo no Hero e ajustar padding**

`src/components/site/sections/Hero.tsx` — remover linhas 23-31 (o `<Image>` do logo) e adicionar `pt-16 md:pt-20` à `<section>` (linha 6) para compensar o header fixo (h-16 = 64px no mobile, ~80px no desktop com folga visual).

```tsx
// Antes (linhas 1-3):
import Image from 'next/image';
import Button from '@/components/shared/ui/Button';

// Depois (remover import do Image, agora não usado):
import Button from '@/components/shared/ui/Button';
```

```tsx
// Antes (linha 6):
<section
  className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"

// Depois:
<section
  className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-16 md:pt-20 relative overflow-hidden"
```

```tsx
// Antes (linhas 22-32):
<div className="relative z-40 max-w-5xl mx-auto">
  <Image
    src="/images/logoleituranova-hero.jpg"
    alt="Leitura Nova Logo"
    width={160}
    height={80}
    className="mx-auto mb-6 w-40 h-auto"
    draggable={false}
    priority
  />
  <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in text-white drop-shadow-lg">

// Depois:
<div className="relative z-40 max-w-5xl mx-auto">
  <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in text-white drop-shadow-lg">
```

**Resultado esperado do arquivo `Hero.tsx` final** (referência completa):

```tsx
import Button from '@/components/shared/ui/Button';

export default function Hero() {
  return (
    <section
      className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-16 md:pt-20 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/hero-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/80 via-[#5dade2]/70 to-[#85c1e9]/60 z-0"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-30"></div>
      <div className="relative z-40 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight animate-fade-in text-white drop-shadow-lg">
          Gestão Inteligente de Água e Gás para o Seu Condomínio
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-xl text-blue-50 animate-fade-in-delay drop-shadow">
          Monitoramento individual e automatizado, com tecnologia de ponta para redução de custos e total transparência.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
          <Button href="#contato">Solicitar Orçamento</Button>
          <Button href="#sobre" variant="secondary">Saiba Mais</Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4.3: Iniciar o dev server e verificar o resultado visual**

Run: `npm run dev`

Abrir `http://localhost:3000/` no navegador e verificar:

1. **Estado inicial (topo da página):** header transparente sobre o Hero. Logo branca à esquerda. Links "Sobre · Serviços · Diferenciais · Contato" em branco. À direita: link "Sou Síndico" branco + botão "Acesso do Morador →" branco com texto azul. Hero sem logo grande, com título "Gestão Inteligente..." centralizado.

2. **Rolar a página pra baixo:** ao passar de 20px, o header transita pra fundo branco translúcido com `backdrop-blur` e sombra leve. Logo vira colorida. Links viram cinza/azul ao hover. Botão Morador vira azul sólido com texto branco.

3. **Clicar em "Sobre":** rola suavemente pra seção "Sobre" sem que o título fique escondido pelo header.

4. **Clicar em "Acesso do Morador":** navega para `/login`.

5. **Clicar em "Sou Síndico":** navega para `/login/sindico`.

6. **Redimensionar para mobile (< 768px):** header mostra logo + botão "Morador" mini + ícone hambúrguer. Links e link Síndico desaparecem do header.

7. **Clicar no hambúrguer:** drawer entra deslizando da direita. Overlay escuro. Links Sobre/Serviços/Diferenciais/Contato + botão Morador (azul sólido) + botão Síndico (outline).

8. **Clicar em link/botão dentro do drawer:** drawer fecha.

9. **Pressionar Esc com drawer aberto:** drawer fecha.

10. **Clicar no overlay escuro:** drawer fecha.

11. **Verificar console do browser:** sem erros, sem warnings de hidratação.

Se algum item falhar, corrigir antes de seguir.

- [ ] **Step 4.4: Verificar build de produção passa**

Run: `npm run build`
Expected: completa sem erros TypeScript. Geração de páginas estáticas funciona.

- [ ] **Step 4.5: Verificar lint passa**

Run: `npm run lint`
Expected: sem erros novos.

- [ ] **Step 4.6: Commit**

```bash
git add src/app/\(site\)/page.tsx src/components/site/sections/Hero.tsx
git commit -m "Render Header on home and remove redundant Hero logo"
```

---

## Task 5: QA visual final e verificação de regressões

**Files:** nenhum a modificar (apenas verificação)

- [ ] **Step 5.1: Confirmar dev server rodando**

Se ainda não estiver: `npm run dev` e abrir `http://localhost:3000/`.

- [ ] **Step 5.2: Verificar páginas que NÃO devem ter o header**

Acessar:
- `http://localhost:3000/termos` — sem header
- `http://localhost:3000/privacidade` — sem header
- `http://localhost:3000/login` — sem header (tem layout próprio)
- `http://localhost:3000/login/sindico` — sem header
- `http://localhost:3000/login/admin` — sem header

Cada uma deve renderizar normalmente, sem o header novo.

- [ ] **Step 5.3: Testar todas as âncoras na home**

Voltar para `/` e clicar em cada link do header (desktop e mobile via drawer):
- Sobre → rola para `#sobre`, título "Tecnologia que Transforma..." (ou similar) visível abaixo do header
- Serviços → rola para `#servicos`, título visível
- Diferenciais → rola para `#diferenciais`, título visível
- Contato → rola para `#contato`, título visível

Em todos os casos: nenhum título deve ficar escondido atrás do header fixo.

- [ ] **Step 5.4: Testar comportamento de scroll do header**

- Rolar lentamente: transição entre transparente e branco deve ser suave (200ms)
- Rolar rapidamente até o final e voltar pro topo: header acompanha sem flicker
- Refresh da página enquanto rolado: estado inicial é "transparente", mas o useEffect com `onScroll()` deve sincronizar imediatamente para "branco" sem flash visível (pode haver 1 frame de transparência — aceitável)

- [ ] **Step 5.5: Testar comportamento mobile completo**

Em DevTools, alternar para viewport mobile (ex: iPhone 12 Pro 390x844):
- Header mostra logo + Morador mini + hambúrguer
- Hambúrguer abre drawer
- Drawer: foco vai para o X de fechar (verificar via Tab — primeira pressão deve mover pro próximo elemento)
- Tab: ciclar pelos elementos do drawer apenas
- Shift+Tab no primeiro elemento (X): foco vai pro último (botão Síndico)
- Body não rola enquanto drawer aberto (tentar rolar a página com drawer aberto)
- Esc fecha o drawer
- Foco volta para o hambúrguer ao fechar

- [ ] **Step 5.6: Verificar acessibilidade básica no DevTools**

No Chrome DevTools, abrir a aba "Accessibility" no inspetor:
- Header tem `role=banner` (default do `<header>`)
- Nav tem `aria-label="Principal"`
- Hambúrguer mostra `aria-label="Abrir menu"` e `aria-expanded`
- Drawer aberto tem `role=dialog`, `aria-modal=true`

(Opcional: rodar Lighthouse no painel "Accessibility" — score deve manter ou melhorar em relação a antes.)

- [ ] **Step 5.7: Sem mudanças se tudo passou**

Se todos os checks passaram, nada a commitar nessa task.

Se algo falhou, criar uma sub-task para corrigir, fazer fix, re-testar e commitar com mensagem `fix: <descrição>`.

---

## Self-Review

Spec coverage:
- [x] Header só na home → Task 4.1 (renderizado em `(site)/page.tsx` apenas) + Task 5.2 (verificação)
- [x] Estado transparente inicial → Task 3.1 (`bg-transparent` + texto branco)
- [x] Vira branco/sólido após scroll > 20 → Task 3.1 (`SCROLL_THRESHOLD = 20`)
- [x] Smooth scroll para âncoras → Task 1.1 (`scroll-smooth`) + Task 1.2 (`scroll-mt-20`)
- [x] Botão "Acesso do Morador" → `/login` → Task 3.1
- [x] Link "Sou Síndico" → `/login/sindico` → Task 3.1
- [x] Mobile com Morador sempre visível + hambúrguer → Task 3.1
- [x] Drawer mobile com nav + ambos CTAs → Task 2.1
- [x] Drawer fecha por hambúrguer/X/overlay/Esc → Task 2.1
- [x] Body scroll lock → Task 2.1
- [x] Logo do Hero removido → Task 4.2
- [x] Acessibilidade (aria, dialog, focus trap) → Task 2.1 (focus trap, role=dialog) + Task 3.1 (aria-label, aria-expanded)
- [x] Sem console.error/warning de hidratação → Task 4.3 step 11

Placeholder scan: Sem TBDs/TODOs. Todas as etapas têm código concreto ou comando concreto.

Type consistency: `NavLink` interface definida em `MobileDrawer.tsx` (Task 2.1). `Header.tsx` (Task 3.1) passa array de `{ label, href }` que satisfaz a mesma forma estrutural — TypeScript aceita por compatibilidade estrutural. (Se quiser ser explícito, poderia exportar `NavLink` de `MobileDrawer.tsx` e importar em `Header.tsx` — fica como melhoria opcional.)
