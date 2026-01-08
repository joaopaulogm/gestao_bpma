
-- Corrigir logins duplicados (adicionar segundo nome para diferenciar)
UPDATE public.usuarios_por_login 
SET login = 'lucas.alves.silva' 
WHERE id = '075b0d90-ac44-49ca-a68e-c3967e731729';

UPDATE public.usuarios_por_login 
SET login = 'lucas.duran.silva' 
WHERE id = '512c131d-80c0-48aa-89f6-9682a2ea6548';

-- Adicionar coluna para vincular ao Supabase Auth
ALTER TABLE public.usuarios_por_login 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vinculado_em timestamp with time zone;

-- Criar índice para busca por auth_user_id
CREATE INDEX IF NOT EXISTS idx_usuarios_por_login_auth_user_id 
ON public.usuarios_por_login(auth_user_id);

-- Criar índice único para login
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_por_login_login_unique 
ON public.usuarios_por_login(login);
