-- ============================================
-- VINCULAR usuarios_por_login COM efetivo_roles
-- ============================================
-- Esta migration vincula usuarios_por_login com dim_efetivo através da matrícula
-- e permite buscar roles de efetivo_roles baseado em login/senha

-- 1. Adicionar coluna efetivo_id em usuarios_por_login
ALTER TABLE public.usuarios_por_login 
ADD COLUMN IF NOT EXISTS efetivo_id uuid REFERENCES public.dim_efetivo(id) ON DELETE SET NULL;

-- 2. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_usuarios_por_login_efetivo_id 
ON public.usuarios_por_login(efetivo_id);

-- 3. Vincular usuarios_por_login com dim_efetivo através da matrícula
UPDATE public.usuarios_por_login upl
SET efetivo_id = de.id
FROM public.dim_efetivo de
WHERE upl.matricula = de.matricula
  AND upl.efetivo_id IS NULL;

-- 4. Criar função para buscar role baseado em login e senha
CREATE OR REPLACE FUNCTION public.get_role_by_login_senha(
  p_login text,
  p_senha bigint
)
RETURNS app_role AS $$
DECLARE
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Buscar efetivo_id através de usuarios_por_login
  SELECT efetivo_id INTO v_efetivo_id
  FROM public.usuarios_por_login
  WHERE login = LOWER(TRIM(p_login))
    AND senha = p_senha
    AND ativo = true;
  
  -- Se não encontrou usuário, retornar null
  IF v_efetivo_id IS NULL THEN
    RETURN NULL;
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

-- 5. Criar função para buscar role baseado em auth_user_id (para usuários vinculados)
CREATE OR REPLACE FUNCTION public.get_role_by_auth_user_id(
  p_auth_user_id uuid
)
RETURNS app_role AS $$
DECLARE
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Buscar efetivo_id através de usuarios_por_login usando auth_user_id
  SELECT efetivo_id INTO v_efetivo_id
  FROM public.usuarios_por_login
  WHERE auth_user_id = p_auth_user_id
    AND ativo = true;
  
  -- Se não encontrou usuário, retornar null
  IF v_efetivo_id IS NULL THEN
    RETURN NULL;
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

-- 6. Criar view para facilitar consultas de usuários com roles
CREATE OR REPLACE VIEW public.vw_usuarios_com_roles AS
SELECT 
  upl.id,
  upl.login,
  upl.nome,
  upl.nome_guerra,
  upl.matricula,
  upl.email,
  upl.cpf,
  upl.ativo,
  upl.auth_user_id,
  upl.efetivo_id,
  de.posto_graduacao,
  de.quadro,
  er.role,
  er.id as role_id
FROM public.usuarios_por_login upl
LEFT JOIN public.dim_efetivo de ON upl.efetivo_id = de.id
LEFT JOIN LATERAL (
  SELECT role, id
  FROM public.efetivo_roles
  WHERE efetivo_id = upl.efetivo_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secao_operacional' THEN 2
      WHEN 'secao_pessoas' THEN 3
      WHEN 'secao_logistica' THEN 4
      WHEN 'operador' THEN 5
      ELSE 6
    END
  LIMIT 1
) er ON true;

-- 7. Comentários
COMMENT ON FUNCTION public.get_role_by_login_senha IS 'Busca role do usuário baseado em login e senha (CPF)';
COMMENT ON FUNCTION public.get_role_by_auth_user_id IS 'Busca role do usuário baseado em auth_user_id do Supabase';
COMMENT ON VIEW public.vw_usuarios_com_roles IS 'View que une usuarios_por_login com dim_efetivo e efetivo_roles';
COMMENT ON COLUMN public.usuarios_por_login.efetivo_id IS 'Referência ao dim_efetivo através da matrícula';

-- 8. Habilitar RLS na view (herda das tabelas base)
-- A view não precisa de RLS própria, mas podemos criar políticas se necessário
