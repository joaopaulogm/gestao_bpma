-- ============================================
-- CORRIGIR get_role_by_auth_user_id PARA VERIFICAR EMAIL ADMIN PRIMEIRO
-- ============================================
-- Garantir que emails admin sempre retornem 'admin' imediatamente

-- Atualizar função get_role_by_auth_user_id para verificar email admin PRIMEIRO
CREATE OR REPLACE FUNCTION public.get_role_by_auth_user_id(
  p_auth_user_id uuid
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_role app_role;
BEGIN
  -- PRIMEIRO: Verificar se o email do usuário é admin por natureza
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_auth_user_id;
  
  -- Se o email é admin por natureza, retornar 'admin' IMEDIATAMENTE
  IF v_email IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_email') THEN
      IF public.is_admin_email(v_email) THEN
        RETURN 'admin'::app_role;
      END IF;
    ELSE
      -- Fallback: verificação direta se função não existe
      IF LOWER(TRIM(v_email)) IN ('soi.bpma@gmail.com', 'joaopaulogm@gmail.com') THEN
        RETURN 'admin'::app_role;
      END IF;
    END IF;
  END IF;
  
  -- SEGUNDO: Buscar role diretamente de user_roles (nova estrutura consolidada)
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = p_auth_user_id
    AND (ativo = true OR ativo IS NULL)
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

-- Garantir que emails admin tenham role 'admin' em user_roles
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE email IN ('soi.bpma@gmail.com', 'joaopaulogm@gmail.com')
  AND role != 'admin'::app_role;

-- Se não existe registro em user_roles para esses emails, criar
INSERT INTO public.user_roles (user_id, role, email)
SELECT 
  au.id,
  'admin'::app_role,
  au.email
FROM auth.users au
WHERE au.email IN ('soi.bpma@gmail.com', 'joaopaulogm@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id
  );

-- Comentário
COMMENT ON FUNCTION public.get_role_by_auth_user_id IS 'Busca role por auth_user_id. Verifica emails admin por natureza PRIMEIRO, depois busca em user_roles (nova estrutura consolidada)';
