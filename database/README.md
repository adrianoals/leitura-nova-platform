# Database — Leitura Nova

Scripts SQL para criar e configurar o banco de dados no Supabase.

## Pré-requisitos

- Projeto Supabase criado ([supabase.com](https://supabase.com))
- Variáveis configuradas no `.env.local` (veja `.env.example`)

## Ordem de Execução

Execute os scripts **na ordem** no **SQL Editor** do Supabase Dashboard:

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `01_tables.sql` | Tabelas, índices e triggers |
| 2 | `02_rls_policies.sql` | Row Level Security (segurança) |
| 3 | `03_storage.sql` | Bucket de fotos + policies |
| 4 | `04_seed.sql` | Dados de teste (⚠️ só dev) |
| 5 | `05_reading_window.sql` | **Descontinuada** (mantida como no-op) |
| 6 | `06_unique_access_per_unit.sql` | Regra de 1 acesso por unidade |
| 7 | `07_fix_storage_policy_unit_owner.sql` | Corrige leitura de fotos por unidade |
| 8 | `08_add_morador_email.sql` | Adiciona email redundante em moradores |
| 9 | `09_monthly_closure.sql` | Fechamento mensal por condomínio + visibilidade controlada para morador |
| 10 | `10_add_consumo_to_leituras.sql` | Adiciona coluna `consumo` e trigger de recálculo automático |

## Modelo de Dados

```
condominios (1) ──→ (N) unidades (1) ──→ (1) moradores
      │                    │
      ├──→ (N) sindicos    └──→ (N) leituras_mensais (1) ──→ (N) fotos_leitura
      └──→ (N) fechamentos_mensais

auth.users ──→ moradores.auth_user_id
           ──→ sindicos.auth_user_id
           ──→ admin_users.auth_user_id
```

## Tipos de Medição

| Tipo | Quando usar |
|------|-------------|
| `agua` | Condomínio com **1 hidrômetro** por unidade |
| `agua_fria` | Condomínio com **2 hidrômetros** (fria + quente) |
| `agua_quente` | Condomínio com **2 hidrômetros** (fria + quente) |
| `gas` | Medição de gás |

### Configuração no condomínio:

| Campo | Valor | Resultado |
|-------|-------|-----------|
| `tem_agua = true, tem_agua_quente = false` | 1 hidrômetro | Tipo: `agua` |
| `tem_agua = true, tem_agua_quente = true` | 2 hidrômetros | Tipos: `agua_fria` + `agua_quente` |
| `tem_gas = true` | Medidor de gás | Tipo: `gas` |

## Roles (3 níveis)

| Role | Tabela | Acesso |
|------|--------|--------|
| **Admin** | `admin_users` | CRUD total em tudo |
| **Síndico** | `sindicos` | Leitura total do(s) seu(s) condomínio(s) |
| **Morador** | `moradores` | Leitura da própria unidade (12 meses) |

### Fluxo de login:
```
auth.uid() existe em admin_users?  → /admin
auth.uid() existe em sindicos?     → /sindico (futuro)
auth.uid() existe em moradores?    → /app
Nenhum?                            → Acesso negado
```

## Configurar Admin

1. No Supabase Dashboard: **Authentication > Users > Add User**
2. Crie o usuário admin com email/senha
3. Copie o UUID gerado
4. No `04_seed.sql`, descomente o INSERT e substitua pelo UUID

## Ambientes

| Ambiente | Supabase Project | Quando usar |
|----------|-----------------|-------------|
| **Dev** | Projeto separado | Desenvolvimento e testes |
| **Prod** | Projeto separado | Produção (dados reais) |

> ⚠️ **Nunca execute `04_seed.sql` em produção!**
