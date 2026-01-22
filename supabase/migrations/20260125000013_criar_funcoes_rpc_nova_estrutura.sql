-- ============================================
-- CRIAR FUNÇÕES RPC PARA NOVA ESTRUTURA
-- ============================================
-- Funções atualizadas para usar user_roles consolidado
-- com dim_efetivo como referência

-- 1. Função para buscar usuário por login/senha (nova estrutura)
CREATE OR REPLACE FUNCTION public.get_usuario_by_login_senha(
  p_login text,
  p_senha text
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  efetivo_id uuid,
  login text,
  nome text,
  senha text,
  email text,
  matricula text,
  cpf bigint,
  role app_role,
  ativo boolean,
  nome_guerra text,
  post_grad text,
  quadro text,
  lotacao text,
  data_nascimento date,
  contato text,
  vinculado_em timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.efetivo_id,
    ur.login,
    ur.nome,
    ur.senha,
    ur.email,
    ur.matricula,
    ur.cpf,
    ur.role,
    ur.ativo,
    ur.nome_guerra,
    ur.post_grad,
    ur.quadro,
    ur.lotacao,
    ur.data_nascimento,
    ur.contato,
    ur.vinculado_em
  FROM public.user_roles ur
  WHERE LOWER(TRIM(ur.login)) = LOWER(TRIM(p_login))
    AND ur.senha = p_senha
    AND (ur.ativo = true OR ur.ativo IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para buscar role por login/senha (nova estrutura)
CREATE OR REPLACE FUNCTION public.get_role_by_login_senha(
  p_login text,
  p_senha text
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_role app_role;
BEGIN
  -- Buscar email e role diretamente de user_roles
  SELECT email, role INTO v_email, v_role
  FROM public.user_roles
  WHERE login = LOWER(TRIM(p_login))
    AND senha = p_senha
    AND (ativo = true OR ativo IS NULL);
  
  -- Se não encontrou usuário, retornar null
  IF v_role IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Se o email é admin por natureza, retornar 'admin' imediatamente
  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin_email'
  ) AND public.is_admin_email(v_email) THEN
    RETURN 'admin'::app_role;
  END IF;
  
  -- Retornar role encontrado
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para buscar role por auth_user_id (nova estrutura)
CREATE OR REPLACE FUNCTION public.get_role_by_auth_user_id(
  p_auth_user_id uuid
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_role app_role;
BEGIN
  -- Primeiro, verificar se o email do usuário é admin por natureza
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_auth_user_id;
  
  -- Se o email é admin por natureza, retornar 'admin' imediatamente
  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin_email'
  ) AND public.is_admin_email(v_email) THEN
    RETURN 'admin'::app_role;
  END IF;
  
  -- Buscar role diretamente de user_roles usando user_id
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

-- 4. Função para vincular user_id quando usuário faz login
CREATE OR REPLACE FUNCTION public.vincular_user_id_ao_efetivo(
  p_efetivo_id uuid,
  p_auth_user_id uuid,
  p_email text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  -- Verificar se efetivo_id existe
  SELECT COUNT(*) INTO v_count
  FROM public.user_roles
  WHERE efetivo_id = p_efetivo_id
    AND (ativo = true OR ativo IS NULL);
  
  IF v_count = 0 THEN
    RETURN false;
  END IF;
  
  -- Atualizar user_id e email se fornecido
  UPDATE public.user_roles
  SET 
    user_id = p_auth_user_id,
    email = COALESCE(p_email, email),
    vinculado_em = COALESCE(vinculado_em, NOW())
  WHERE efetivo_id = p_efetivo_id
    AND (ativo = true OR ativo IS NULL);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Comentários
COMMENT ON FUNCTION public.get_usuario_by_login_senha IS 'Busca usuário por login/senha na nova estrutura consolidada (user_roles)';
COMMENT ON FUNCTION public.get_role_by_login_senha IS 'Busca role por login/senha na nova estrutura consolidada';
COMMENT ON FUNCTION public.get_role_by_auth_user_id IS 'Busca role por auth_user_id na nova estrutura consolidada';
COMMENT ON FUNCTION public.vincular_user_id_ao_efetivo IS 'Vincula auth_user_id a um efetivo_id quando usuário faz login';
