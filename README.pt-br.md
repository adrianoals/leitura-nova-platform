# Leitura Nova — Plataforma de Leitura de Hidrômetros de Água e Gás

**Aplicação web full-stack desenvolvida para a Leitura Nova**

🇺🇸 [Read in English](README.md)

🔗 **Acesse:** [leituranova.com.br](https://leituranova.com.br)

Uma plataforma moderna desenvolvida para a **Leitura Nova**, empresa brasileira especializada em gestão de leituras de utilidades condominiais. O sistema suporta leituras de medidores de água e gás em múltiplos condomínios, com uma arquitetura multi-perfil onde moradores enviam fotos dos medidores, síndicos acompanham suas unidades e administradores gerenciam toda a operação.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Banco de Dados** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Autenticação** | Supabase Auth (multi-perfil: admin, síndico, morador) |
| **Armazenamento** | Supabase Storage (fotos dos medidores) |
| **Deploy** | Vercel (deploy automático + CDN) |

## Funcionalidades

- **Sistema multi-perfil** (admin, síndico, morador) com dashboards dedicados
- Moradores enviam fotos das leituras dos medidores pelo celular
- Painel administrativo para gerenciar condomínios, unidades e janelas de leitura
- Área do síndico para acompanhar as unidades sob sua responsabilidade
- Fluxo de fechamento mensal de leituras
- Row Level Security garantindo isolamento de dados entre usuários
- Design responsivo mobile-first
- SEO otimizado com sitemap e robots.txt

## Arquitetura do Banco de Dados

As migrations SQL são versionadas no diretório `/database`, cobrindo:

- Definições de tabelas e relacionamentos
- Políticas de Row Level Security (RLS)
- Políticas de armazenamento para fotos dos medidores
- Dados de seed
- Configuração de janelas de leitura
- Lógica de fechamento mensal

## Estrutura do Projeto

```
src/
├── app/
│   ├── (site)/        # Landing page pública
│   ├── (sistema)/     # Wrapper de layout do sistema
│   ├── admin/         # Dashboard administrativo
│   ├── app/           # Portal do morador
│   ├── sindico/       # Dashboard do síndico
│   ├── login/         # Páginas de login (morador, admin, síndico)
│   └── auth/          # Callback OAuth
├── actions/           # Server Actions (mutações)
├── components/        # Componentes UI (admin, morador, sindico, shared, site)
├── lib/               # Clientes Supabase, utilitários, helpers
├── types/             # Definições de tipos TypeScript
└── utils/             # Utilitários gerais
database/              # Arquivos de migration SQL (01–10)
```

## Como Começar

1. Clone o repositório:
   ```bash
   git clone https://github.com/your-username/leitura-nova-platform.git
   cd leitura-nova-platform
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```

4. Preencha as variáveis do Supabase no `.env.local` com as credenciais do seu projeto.

5. Execute as migrations SQL em ordem no Editor SQL do [Supabase Dashboard](https://supabase.com/dashboard).

6. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Variáveis de Ambiente

Consulte o [`.env.example`](.env.example) para todas as variáveis necessárias:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (SEO, sitemap, Open Graph) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/pública do Supabase (segura para o client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role do Supabase (**apenas servidor**) |
