-- ============================================
-- ATUALIZAR get_role_by_login_senha PARA ACEITAR TEXT
-- ============================================
-- Esta migration atualiza a função para aceitar text (string) em vez de bigint
-- para manter consistência com get_usuario_by_login_senha

-- 1. Atualizar função get_role_by_login_senha para aceitar text
CREATE OR REPLACE FUNCTION public.get_role_by_login_senha(
  p_login text,
  p_senha text  -- Mudar para text para aceitar string do Supabase
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Buscar email e efetivo_id através de usuarios_por_login
  SELECT email, efetivo_id INTO v_email, v_efetivo_id
  FROM public.usuarios_por_login upl
  WHERE LOWER(TRIM(upl.login)) = LOWER(TRIM(p_login))
    AND upl.senha::text = p_senha  -- Converter senha para text para comparação
    AND (upl.ativo = true OR upl.ativo IS NULL);
  
  -- Se não encontrou usuário, retornar null
  IF v_efetivo_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Se o email é admin por natureza, retornar 'admin' imediatamente
  IF v_email IS NOT NULL AND public.is_admin_email(v_email) THEN
    RETURN 'admin'::app_role;
  END IF;
  
  -- Buscar role em efetivo_roles
  SELECT role INTO v_role
  FROM public.efetivo_roles
  WHERE efetivo_id = v_efetivo_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secao_operacional' THEN 2
      WHEN 'secao_pessoas' THEN 3
      WHEN 'secao_logistica' THEN 4
      WHEN 'operador' THEN 5
      ELSE 6
    END
  LIMIT 1;
  
  -- Retornar role encontrado ou 'operador' como padrão
  RETURN COALESCE(v_role, 'operador'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Comentário
COMMENT ON FUNCTION public.get_role_by_login_senha IS 'Busca role do usuário baseado em login e senha (aceita text). Verifica emails admin por natureza.';
