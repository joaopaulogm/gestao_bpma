-- Corrigir função validar_login_senha para incluir schema extensions (pgcrypto)
CREATE OR REPLACE FUNCTION public.validar_login_senha(p_matricula text, p_senha text)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  efetivo_id uuid, 
  nome text, 
  nome_guerra text, 
  matricula text, 
  email text, 
  post_grad text, 
  quadro text, 
  lotacao text, 
  role text, 
  ativo boolean, 
  vinculado_em timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_matricula_limpa TEXT;
BEGIN
  -- Limpar matrícula (apenas números e X)
  v_matricula_limpa := upper(regexp_replace(p_matricula, '[^0-9Xx]', '', 'g'));

  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.efetivo_id,
    ur.nome,
    ur.nome_guerra,
    ur.matricula,
    ur.email,
    ur.post_grad,
    ur.quadro,
    ur.lotacao,
    ur.role::TEXT,
    ur.ativo,
    ur.vinculado_em
  FROM public.user_roles ur
  WHERE 
    upper(COALESCE(ur.matricula, '')) = v_matricula_limpa
    -- Senha deve ser um hash bcrypt (começa com $2) e validar
    AND ur.senha IS NOT NULL
    AND ur.senha LIKE '$2%'
    AND ur.senha = extensions.crypt(p_senha, ur.senha)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validar_login_senha(TEXT, TEXT) TO anon, authenticated;