-- =============================================================
-- CORREÇÃO: Ajustar verificar_primeiro_acesso
-- O campo cpf é BIGINT, e senha ainda não é hash bcrypt no primeiro acesso
-- Primeiro acesso = senha IS NULL OU senha não começa com '$2'
-- =============================================================

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
  v_cpf_bigint BIGINT;
BEGIN
  -- Limpar matrícula (apenas números)
  v_matricula_limpa := regexp_replace(p_matricula, '[^0-9]', '', 'g');
  
  -- Limpar CPF (apenas números) e converter para BIGINT
  v_cpf_limpo := regexp_replace(p_cpf, '[^0-9]', '', 'g');
  
  -- Converter CPF para BIGINT (remove zeros à esquerda automaticamente)
  BEGIN
    v_cpf_bigint := v_cpf_limpo::BIGINT;
  EXCEPTION WHEN OTHERS THEN
    v_cpf_bigint := 0;
  END;

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
    -- Comparar CPF (como BIGINT)
    AND ur.cpf = v_cpf_bigint
  LIMIT 1;
END;
$$;

-- Atualizar função validar_login_senha para verificar se senha é hash bcrypt
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
    -- Senha deve ser um hash bcrypt (começa com $2) e validar
    AND ur.senha IS NOT NULL
    AND ur.senha LIKE '$2%'
    AND ur.senha = crypt(p_senha, ur.senha)
  LIMIT 1;
END;
$$;

-- Função auxiliar para verificar se usuário já alterou senha (senha é hash bcrypt)
CREATE OR REPLACE FUNCTION public.verificar_senha_alterada(
  p_user_role_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_senha TEXT;
BEGIN
  SELECT senha INTO v_senha FROM public.user_roles WHERE id = p_user_role_id;
  
  -- Senha alterada = começa com $2 (bcrypt hash)
  RETURN v_senha IS NOT NULL AND v_senha LIKE '$2%';
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_senha_alterada(UUID) TO anon, authenticated;