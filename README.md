# Leitura Nova — Water & Gas Meter Reading Platform

**Full-stack web application built for Leitura Nova**

🇧🇷 [Leia em Português](README.pt-br.md)

🔗 **Live:** [leituranova.com.br](https://leituranova.com.br)

A modern platform developed for **Leitura Nova**, a Brazilian company specializing in condominium utility reading management. The system supports water and gas meter readings across multiple condominiums, featuring a multi-role architecture where residents submit meter photos, syndics monitor their units, and administrators manage the entire operation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Auth** | Supabase Auth (multi-role: admin, syndic, resident) |
| **Storage** | Supabase Storage (meter photos) |
| **Deploy** | Vercel (auto-deploy + CDN) |

## Features

- **Multi-role system** (admin, syndic, resident) with dedicated dashboards
- Residents upload meter reading photos from their phones
- Admin panel for managing condominiums, units, and reading windows
- Syndic area for monitoring units under their responsibility
- Monthly reading closure workflow
- Row Level Security ensuring data isolation between users
- Responsive mobile-first design
- SEO optimized with sitemap and robots.txt

## Database Architecture

SQL migrations are versioned in the `/database` directory, covering:

- Table definitions and relationships
- Row Level Security (RLS) policies
- Storage policies for meter photos
- Seed data
- Reading window configuration
- Monthly closure logic

## Project Structure

```
src/
├── app/
│   ├── (site)/        # Public landing page
│   ├── (sistema)/     # System layout wrapper
│   ├── admin/         # Admin dashboard
│   ├── app/           # Resident (morador) portal
│   ├── sindico/       # Syndic dashboard
│   ├── login/         # Login pages (morador, admin, sindico)
│   └── auth/          # OAuth callback
├── actions/           # Server Actions (mutations)
├── components/        # UI components (admin, morador, sindico, shared, site)
├── lib/               # Supabase clients, utilities, helpers
├── types/             # TypeScript type definitions
└── utils/             # General utilities
database/              # SQL migration files (01–10)
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/leitura-nova-platform.git
   cd leitura-nova-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure the Supabase variables in `.env.local` with your project credentials.

5. Run the SQL migrations in order on the [Supabase Dashboard](https://supabase.com/dashboard) SQL Editor.

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO, sitemap, Open Graph) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server-only**) |
