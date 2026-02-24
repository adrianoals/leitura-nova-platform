# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Leitura Nova** is a Brazilian SaaS for condominium utility reading management (water/gas). It has three portals: a public landing page, a resident portal (morador), a syndic portal (síndico), and an admin dashboard.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4, Supabase (Postgres + Auth + Storage), Recharts, React Hook Form + Zod.

## Commands

```bash
npm run dev          # Dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

No test framework is configured. There is a smoke test script: `npm run test:delete-smoke`.

## Architecture

### Route Structure (App Router)

- `/(site)/` — Public landing page with SEO/schema.org
- `/login` — Morador login | `/login/admin` — Admin login | `/login/sindico` — Syndic login
- `/app/*` — Morador portal (protected)
- `/admin/*` — Admin dashboard (protected)
- `/sindico/*` — Syndic dashboard (protected)
- `/auth/callback` — Supabase OAuth callback

### Three-Role System

1. **Morador (Resident):** Views own unit's readings. Can submit readings + photos if `envio_leitura_morador_habilitado` is enabled on the condominium.
2. **Síndico (Syndic):** Views all units and consumption analytics for assigned condominiums.
3. **Admin:** Full CRUD on all entities (condominiums, units, residents, readings, syndics).

Role is determined by checking tables in order: `admin_users` → `sindicos` → `moradores`.

### Authentication & Middleware

- Supabase Auth with email/password, sessions stored in HTTP-only cookies.
- `src/proxy.ts` (middleware) protects `/app`, `/admin`, `/sindico` routes — redirects unauthenticated users.
- Supabase clients: `src/lib/supabase/server.ts` (server), `client.ts` (browser), `admin.ts` (service role), `middleware.ts` (session refresh).
- RLS policies enforce data isolation at the database level.

### Data Layer

- **No ORM** — direct Supabase client queries (`supabase.from('table').select(...)`)
- Server Components fetch data with `await createClient()` from `@/lib/supabase/server`
- Mutations use **Next.js Server Actions** in `src/actions/` (validated with Zod, revalidate paths after mutation)
- Database schema lives in `database/` as sequential SQL migration files (01-10)

### Key Tables

`condominios` → `unidades` → `moradores` (1 auth user per unit). `leituras_mensais` stores readings by tipo (`agua`, `agua_fria`, `agua_quente`, `gas`). `fotos_leitura` links photos. `fechamentos_mensais` tracks monthly closures. `sindicos` links syndics to condominiums.

### Type Conventions

- Database uses snake_case; frontend types in `src/types/index.ts` use camelCase.
- `src/lib/relations.ts` has helpers to flatten Supabase nested query results.
- Formatting utilities: `formatMes()`, `formatData()`, `formatValor()`, `formatMedicao()` in `src/lib/morador.ts`.

### Component Organization

- `src/components/admin/` — Admin-specific components
- `src/components/morador/` — Resident dashboard components
- `src/components/sindico/` — Syndic components
- `src/components/shared/` — Shared UI (sidebar, cards, etc.)
- `src/components/site/` — Public landing page sections
- `src/components/auth/` — Login forms

Layout components (`AdminLayout`, `AppLayout`, `SindicoLayout`) handle auth checks and sidebar navigation.

## Environment Variables

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # Server-only, never expose to client
```

## Language & Locale

All UI text is in **Brazilian Portuguese**. Variable names in code mix Portuguese (domain terms) and English (technical terms). Database columns and table names are in Portuguese.

## Deployment

Hosted on **Vercel** with preferred region `gru1` (São Paulo). Production URL: leituranova.com.br.
