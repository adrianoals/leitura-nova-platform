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

## Ambientes

| Ambiente | Supabase Project | Quando usar |
|----------|-----------------|-------------|
| **Dev** | Projeto separado | Desenvolvimento e testes |
| **Prod** | Projeto separado | Produção (dados reais) |

> ⚠️ **Nunca execute `04_seed.sql` em produção!**

## Configurar Admin

1. No Supabase Dashboard: **Authentication > Users > Add User**
2. Crie o usuário admin com email/senha
3. Copie o UUID gerado
4. No `04_seed.sql`, descomente o INSERT e substitua `'SEU_AUTH_USER_ID_ADMIN'` pelo UUID

## Modelo de Dados

```
condominios (1) ──→ (N) unidades (1) ──→ (N) moradores
                         │
                         └──→ (N) leituras_mensais (1) ──→ (N) fotos_leitura
```

## Segurança (RLS)

- **Morador**: SELECT apenas da própria unidade (últimos 12 meses)
- **Morador**: INSERT leitura/foto somente se `envio_leitura_morador_habilitado = true`
- **Admin**: CRUD total em todas as tabelas
- **Storage**: Fotos organizadas por `{condominio_id}/{unidade_id}/{mes}/{tipo}/`
