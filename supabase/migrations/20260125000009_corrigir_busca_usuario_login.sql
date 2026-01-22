-- ============================================
-- CORRIGIR BUSCA DE USUÁRIO NO LOGIN
-- ============================================
-- Esta migration corrige problemas na função de busca de usuário

-- 1. Recriar função com melhor tratamento de tipos e casos edge
-- Aceitar tanto bigint quanto text (string) para flexibilidade
CREATE OR REPLACE FUNCTION public.get_usuario_by_login_senha(
  p_login text,
  p_senha text  -- Mudar para text para aceitar string do Supabase
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
    AND upl.senha::text = p_senha  -- Converter senha para text para comparação
    AND (upl.ativo = true OR upl.ativo IS NULL); -- Permitir NULL como ativo
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar função de debug para verificar se usuário existe
CREATE OR REPLACE FUNCTION public.debug_buscar_usuario(
  p_login text
)
RETURNS TABLE(
  id uuid,
  login text,
  nome text,
  senha bigint,
  ativo boolean,
  matricula text,
  email text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    upl.id,
    upl.login,
    upl.nome,
    upl.senha,
    upl.ativo,
    upl.matricula,
    upl.email
  FROM public.usuarios_por_login upl
  WHERE LOWER(TRIM(upl.login)) = LOWER(TRIM(p_login))
  ORDER BY upl.ativo DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Comentários
COMMENT ON FUNCTION public.get_usuario_by_login_senha IS 'Busca usuário por login/senha para processo de login (bypassa RLS). Trata ativo NULL como ativo.';
COMMENT ON FUNCTION public.debug_buscar_usuario IS 'Função de debug para verificar se um login existe na base de dados';
