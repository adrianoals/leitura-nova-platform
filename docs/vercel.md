# Deploy na Vercel

## Pré-requisito

```bash
npm i -g vercel
```

## Deploy

```bash
vercel login
vercel deploy
```

Na primeira vez o CLI pergunta nome do projeto e diretório — aceite os padrões.

## Variáveis de ambiente

Configure no dashboard da Vercel (Settings → Environment Variables) ou via CLI:

```bash
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## Deploy em produção

```bash
vercel --prod
```

<!-- Global -->
 git config --global user.email "novo-email@exemplo.com"
<!-- Só desse projeto -->
 git config user.email "novo-email@exemplo.com" 

<!-- Global -->
git config --global user.email
<!-- Só desse projeto -->
git config user.email