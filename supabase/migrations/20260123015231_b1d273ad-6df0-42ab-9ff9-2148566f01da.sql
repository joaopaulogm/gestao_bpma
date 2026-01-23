-- ============================================
-- CONSOLIDAR TODAS AS TABELAS EM user_roles
-- ============================================

-- PARTE 1: REMOVER FOREIGN KEY E EXPANDIR user_roles
-- ============================================

-- 1. Remover a foreign key de user_id para auth.users
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- 2. Permitir user_id NULL (para usuários que ainda não fizeram login)
ALTER TABLE public.user_roles ALTER COLUMN user_id DROP NOT NULL;

-- 3. Adicionar todas as colunas necessárias
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS efetivo_id uuid REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS login text,
  ADD COLUMN IF NOT EXISTS senha text,
  ADD COLUMN IF NOT EXISTS nome text,
  ADD COLUMN IF NOT EXISTS nome_guerra text,
  ADD COLUMN IF NOT EXISTS matricula text,
  ADD COLUMN IF NOT EXISTS cpf bigint,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS idade integer,
  ADD COLUMN IF NOT EXISTS sexo text,
  ADD COLUMN IF NOT EXISTS contato text,
  ADD COLUMN IF NOT EXISTS post_grad text,
  ADD COLUMN IF NOT EXISTS quadro text,
  ADD COLUMN IF NOT EXISTS lotacao text,
  ADD COLUMN IF NOT EXISTS porte_arma text,
  ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_inclusao date,
  ADD COLUMN IF NOT EXISTS vinculado_em timestamp with time zone;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_efetivo_id ON public.user_roles(efetivo_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_login ON public.user_roles(login);
CREATE INDEX IF NOT EXISTS idx_user_roles_matricula ON public.user_roles(matricula);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_cpf ON public.user_roles(cpf);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_login_unique ON public.user_roles(login) WHERE login IS NOT NULL;

-- ============================================
-- PARTE 2: MIGRAR DADOS
-- ============================================

-- 5. Migrar dados de dim_efetivo + efetivo_roles para user_roles
INSERT INTO public.user_roles (
  user_id,
  role,
  efetivo_id,
  matricula,
  nome,
  nome_guerra,
  sexo,
  lotacao,
  ativo
)
SELECT 
  NULL::uuid as user_id,
  COALESCE(er.role, 'operador'::app_role) as role,
  de.id as efetivo_id,
  de.matricula,
  de.nome,
  de.nome_guerra,
  de.sexo,
  de.lotacao,
  true as ativo
FROM public.dim_efetivo de
LEFT JOIN LATERAL (
  SELECT role
  FROM public.efetivo_roles
  WHERE efetivo_id = de.id
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
) er ON true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = de.id
)
ON CONFLICT DO NOTHING;

-- 6. Atualizar user_roles com dados de usuarios_por_login
UPDATE public.user_roles ur
SET 
  login = upl.login,
  senha = upl.senha::text,
  cpf = upl.cpf,
  email = COALESCE(ur.email, upl.email),
  data_nascimento = upl.data_nascimento,
  idade = upl.idade::integer,
  contato = upl.contato,
  post_grad = upl.post_grad,
  quadro = upl.quadro,
  porte_arma = upl.porte_arma,
  data_inclusao = upl.data_inclusao,
  vinculado_em = upl.vinculado_em,
  user_id = upl.auth_user_id,
  ativo = COALESCE(upl.ativo, ur.ativo, true)
FROM public.usuarios_por_login upl
WHERE ur.matricula = upl.matricula
  AND upl.matricula IS NOT NULL;

-- 7. Criar login para registros que não têm (baseado em nome)
UPDATE public.user_roles
SET login = LOWER(
  REGEXP_REPLACE(SPLIT_PART(nome, ' ', 1), '[^a-zA-Z]', '', 'g') || '.' || 
  REGEXP_REPLACE(SPLIT_PART(nome, ' ', array_length(string_to_array(nome, ' '), 1)), '[^a-zA-Z]', '', 'g')
)
WHERE login IS NULL
  AND nome IS NOT NULL;

-- 8. Criar senha (CPF ou matrícula) para registros que não têm
UPDATE public.user_roles
SET senha = COALESCE(cpf::text, matricula)
WHERE senha IS NULL;

-- ============================================
-- PARTE 3: GARANTIR EMAILS ADMIN
-- ============================================

UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE email IN ('soi.bpma@gmail.com', 'joaopaulogm@gmail.com');

-- ============================================
-- PARTE 4: FUNÇÃO RPC PARA LOGIN
-- ============================================

CREATE OR REPLACE FUNCTION public.get_usuario_by_login_senha(
  p_login text,
  p_senha text
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  efetivo_id uuid,
  nome text,
  login text,
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
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_login_lower text;
  v_senha_limpa text;
BEGIN
  v_login_lower := LOWER(TRIM(p_login));
  v_senha_limpa := REGEXP_REPLACE(p_senha, '[^0-9]', '', 'g');
  
  RETURN QUERY
  SELECT 
    ur.id,
    ur.user_id,
    ur.efetivo_id,
    ur.nome,
    ur.login,
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
  WHERE (LOWER(ur.login) = v_login_lower OR ur.matricula = v_login_lower)
    AND (ur.senha = v_senha_limpa OR ur.cpf::text = v_senha_limpa OR ur.matricula = v_senha_limpa)
    AND ur.ativo = true
  LIMIT 1;
END;
$$;

-- ============================================
-- PARTE 5: ATUALIZAR RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.user_id = auth.uid() 
    AND ur2.role = 'admin'::app_role
  )
);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.user_id = auth.uid() 
    AND ur2.role = 'admin'::app_role
  )
);

DROP POLICY IF EXISTS "Allow anonymous login check" ON public.user_roles;
CREATE POLICY "Allow anonymous login check"
ON public.user_roles
FOR SELECT
TO anon
USING (true);

-- ============================================
-- PARTE 6: COMENTÁRIOS
-- ============================================

COMMENT ON TABLE public.user_roles IS 'Tabela consolidada contendo todos os dados de usuários, roles e efetivo';
COMMENT ON COLUMN public.user_roles.efetivo_id IS 'Referência ao dim_efetivo';
COMMENT ON COLUMN public.user_roles.user_id IS 'Referência ao auth.users (NULL até primeiro login)';
COMMENT ON COLUMN public.user_roles.login IS 'Login no formato primeiro_nome.ultimo_nome';
COMMENT ON COLUMN public.user_roles.senha IS 'CPF ou matrícula como string';