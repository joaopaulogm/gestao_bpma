-- ============================================
-- PERMITIR BUSCA DE USUÁRIO POR LOGIN/SENHA
-- ============================================
-- Esta migration cria uma função RPC que permite buscar usuário
-- por login/senha durante o processo de login (bypassa RLS)

-- 1. Criar função para buscar usuário por login/senha (para login)
CREATE OR REPLACE FUNCTION public.get_usuario_by_login_senha(
  p_login text,
  p_senha bigint
)
RETURNS TABLE(
  id uuid,
  login text,
  nome text,
  senha bigint,
  email text,
  matricula text,
  auth_user_id uuid,
  vinculado_em timestamp with time zone,
  ativo boolean,
  efetivo_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    upl.id,
    upl.login,
    upl.nome,
    upl.senha,
    upl.email,
    upl.matricula,
    upl.auth_user_id,
    upl.vinculado_em,
    upl.ativo,
    upl.efetivo_id
  FROM public.usuarios_por_login upl
  WHERE LOWER(TRIM(upl.login)) = LOWER(TRIM(p_login))
    AND upl.senha = p_senha
    AND upl.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Comentário
COMMENT ON FUNCTION public.get_usuario_by_login_senha IS 'Busca usuário por login/senha para processo de login (bypassa RLS)';
