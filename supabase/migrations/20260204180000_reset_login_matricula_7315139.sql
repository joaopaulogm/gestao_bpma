-- Reset do login do policial de matrícula 7315139
-- Desvincula a conta (user_id/auth_user_id) e limpa senha para permitir novo primeiro acesso.

-- 1) user_roles: desvincular auth e limpar senha (matrícula 7315139 ou 07315139)
UPDATE public.user_roles
SET user_id = NULL,
    vinculado_em = NULL,
    senha = NULL
WHERE ltrim(regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g'), '0') = '7315139';

-- 2) usuarios_por_login: desvincular auth
UPDATE public.usuarios_por_login
SET auth_user_id = NULL,
    vinculado_em = NULL
WHERE ltrim(regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g'), '0') = '7315139';
