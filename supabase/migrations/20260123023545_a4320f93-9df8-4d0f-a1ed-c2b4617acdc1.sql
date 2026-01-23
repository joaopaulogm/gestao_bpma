-- =============================================================
-- MIGRAÇÃO: Refazer Primeiro Login usando user_roles
-- Login = matrícula (apenas números)
-- Senha = CPF (11 dígitos, apenas números)
-- Após 1º login → troca de senha obrigatória (hash bcrypt)
-- Vínculo Google opcional
-- =============================================================

-- Habilita extensão pgcrypto para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para verificar primeiro acesso (matrícula + CPF)
-- SECURITY DEFINER para bypassar RLS
CREATE OR REPLACE FUNCTION public.verificar_primeiro_acesso(
  p_matricula TEXT,
  p_cpf TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  efetivo_id UUID,
  nome TEXT,
  nome_guerra TEXT,
  matricula TEXT,
  cpf BIGINT,
  email TEXT,
  post_grad TEXT,
  quadro TEXT,
  lotacao TEXT,
  role TEXT,
  ativo BOOLEAN,
  senha TEXT,
  vinculado_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_limpa TEXT;
  v_cpf_limpo TEXT;
  v_cpf_11 TEXT;
BEGIN
  -- Limpar matrícula (apenas números)
  v_matricula_limpa := regexp_replace(p_matricula, '[^0-9]', '', 'g');
  
  -- Limpar CPF (apenas números)
  v_cpf_limpo := regexp_replace(p_cpf, '[^0-9]', '', 'g');
  
  -- Garantir que CPF tenha 11 dígitos (com zeros à esquerda se necessário)
  v_cpf_11 := lpad(v_cpf_limpo, 11, '0');

  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.efetivo_id,
    ur.nome,
    ur.nome_guerra,
    ur.matricula,
    ur.cpf,
    ur.email,
    ur.post_grad,
    ur.quadro,
    ur.lotacao,
    ur.role::TEXT,
    ur.ativo,
    ur.senha,
    ur.vinculado_em
  FROM public.user_roles ur
  WHERE 
    -- Comparar matrícula (apenas números)
    regexp_replace(COALESCE(ur.matricula, ''), '[^0-9]', '', 'g') = v_matricula_limpa
    AND (
      -- CPF exato
      ur.cpf::TEXT = v_cpf_limpo
      -- Ou CPF com 11 dígitos (zeros à esquerda)
      OR lpad(ur.cpf::TEXT, 11, '0') = v_cpf_11
    )
  LIMIT 1;
END;
$$;

-- Função para atualizar senha com hash bcrypt
CREATE OR REPLACE FUNCTION public.atualizar_senha_user_roles(
  p_user_role_id UUID,
  p_nova_senha TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  -- Gerar hash bcrypt da nova senha
  v_hash := crypt(p_nova_senha, gen_salt('bf', 10));
  
  -- Atualizar senha na tabela user_roles
  UPDATE public.user_roles
  SET senha = v_hash
  WHERE id = p_user_role_id;
  
  RETURN FOUND;
END;
$$;

-- Função para validar login com senha (hash bcrypt)
CREATE OR REPLACE FUNCTION public.validar_login_senha(
  p_matricula TEXT,
  p_senha TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  efetivo_id UUID,
  nome TEXT,
  nome_guerra TEXT,
  matricula TEXT,
  email TEXT,
  post_grad TEXT,
  quadro TEXT,
  lotacao TEXT,
  role TEXT,
  ativo BOOLEAN,
  vinculado_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_limpa TEXT;
BEGIN
  -- Limpar matrícula (apenas números)
  v_matricula_limpa := regexp_replace(p_matricula, '[^0-9]', '', 'g');

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
    regexp_replace(COALESCE(ur.matricula, ''), '[^0-9]', '', 'g') = v_matricula_limpa
    AND ur.senha IS NOT NULL
    AND ur.senha = crypt(p_senha, ur.senha)
  LIMIT 1;
END;
$$;

-- Função para vincular user_id do Google OAuth
CREATE OR REPLACE FUNCTION public.vincular_google_user_roles(
  p_user_role_id UUID,
  p_auth_user_id UUID,
  p_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET 
    user_id = p_auth_user_id,
    email = COALESCE(p_email, email),
    vinculado_em = NOW()
  WHERE id = p_user_role_id;
  
  RETURN FOUND;
END;
$$;

-- Conceder permissões para anon e authenticated
GRANT EXECUTE ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atualizar_senha_user_roles(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validar_login_senha(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vincular_google_user_roles(UUID, UUID, TEXT) TO anon, authenticated;

-- Comentários
COMMENT ON FUNCTION public.verificar_primeiro_acesso IS 'Valida primeiro acesso: matrícula (números) + CPF (11 dígitos)';
COMMENT ON FUNCTION public.atualizar_senha_user_roles IS 'Atualiza senha com hash bcrypt na user_roles';
COMMENT ON FUNCTION public.validar_login_senha IS 'Valida login com matrícula + senha (hash bcrypt)';
COMMENT ON FUNCTION public.vincular_google_user_roles IS 'Vincula auth.users.id à user_roles para login Google';