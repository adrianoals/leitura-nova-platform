-- ============================================================
-- 08_add_morador_email.sql
-- Adiciona email redundante em moradores para facilitar gestão no admin
-- ============================================================

ALTER TABLE public.moradores
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN public.moradores.email IS 'Email de login do morador (redundante com auth.users para facilitar gestão)';

CREATE INDEX IF NOT EXISTS idx_moradores_email ON public.moradores(email);

-- Backfill com email atual do auth.users quando houver vínculo
UPDATE public.moradores m
SET email = au.email
FROM auth.users au
WHERE m.auth_user_id = au.id
  AND (m.email IS NULL OR m.email = '');
