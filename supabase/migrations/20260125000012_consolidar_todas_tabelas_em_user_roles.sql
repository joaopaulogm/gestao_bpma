-- ============================================
-- CONSOLIDAR TODAS AS TABELAS EM user_roles
-- ============================================
-- Esta migration consolida:
-- - user_roles + usuarios_por_login + usuarios_permitidos + efetivo_roles
-- Em uma única tabela: user_roles
-- Usando dim_efetivo como referência principal

-- ============================================
-- PARTE 1: EXPANDIR user_roles COM TODAS AS COLUNAS
-- ============================================

-- 1. Adicionar todas as colunas de usuarios_por_login (exceto as que já existem)
ALTER TABLE public.user_roles
  -- Referência ao efetivo (chave principal)
  ADD COLUMN IF NOT EXISTS efetivo_id uuid REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  
  -- Dados de login
  ADD COLUMN IF NOT EXISTS login text,
  ADD COLUMN IF NOT EXISTS senha text, -- CPF como string
  
  -- Dados pessoais (de usuarios_por_login e usuarios_permitidos)
  ADD COLUMN IF NOT EXISTS nome text,
  ADD COLUMN IF NOT EXISTS nome_guerra text,
  ADD COLUMN IF NOT EXISTS matricula text,
  ADD COLUMN IF NOT EXISTS cpf bigint,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS idade integer,
  ADD COLUMN IF NOT EXISTS sexo text,
  ADD COLUMN IF NOT EXISTS contato text,
  
  -- Dados profissionais
  ADD COLUMN IF NOT EXISTS post_grad text,
  ADD COLUMN IF NOT EXISTS quadro text,
  ADD COLUMN IF NOT EXISTS lotacao text,
  ADD COLUMN IF NOT EXISTS porte_arma text,
  
  -- Dados de controle
  ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_inclusao date,
  ADD COLUMN IF NOT EXISTS vinculado_em timestamp with time zone,
  
  -- Dados de usuarios_permitidos (se não existirem)
  ADD COLUMN IF NOT EXISTS "Email 2" text,
  ADD COLUMN IF NOT EXISTS "Telefone 2" text;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_efetivo_id ON public.user_roles(efetivo_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_login ON public.user_roles(login);
CREATE INDEX IF NOT EXISTS idx_user_roles_matricula ON public.user_roles(matricula);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_cpf ON public.user_roles(cpf);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_login_unique ON public.user_roles(login) WHERE login IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_matricula_unique ON public.user_roles(matricula) WHERE matricula IS NOT NULL;

-- ============================================
-- PARTE 2: CRIAR user_id (auth.users) PARA TODO EFETIVO
-- ============================================

-- Função auxiliar para criar usuário auth se não existir
CREATE OR REPLACE FUNCTION public.ensure_auth_user_for_efetivo(
  p_efetivo_id uuid,
  p_email text,
  p_nome text
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_email_clean text;
  v_nome_clean text;
BEGIN
  -- Limpar email
  v_email_clean := LOWER(TRIM(COALESCE(p_email, '')));
  
  -- Se não tem email, criar um baseado no nome e matrícula
  IF v_email_clean = '' OR v_email_clean IS NULL THEN
    SELECT matricula INTO v_nome_clean FROM public.dim_efetivo WHERE id = p_efetivo_id;
    v_email_clean := LOWER(REGEXP_REPLACE(COALESCE(p_nome, 'usuario'), '[^a-z0-9]', '', 'g')) || '.' || COALESCE(v_nome_clean, '') || '@bpma.temp';
  END IF;
  
  -- Verificar se já existe auth.user com este email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email_clean;
  
  -- Se não existe, criar (usando Supabase Admin API seria ideal, mas aqui fazemos o possível)
  -- Nota: Não podemos criar auth.users diretamente via SQL, então vamos marcar para criação posterior
  -- Por enquanto, retornamos NULL e o sistema criará quando o usuário fizer login
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTE 3: MIGRAR DADOS DE TODAS AS TABELAS
-- ============================================

-- 3. Migrar dados de dim_efetivo + efetivo_roles para user_roles
-- Usando dim_efetivo como base e juntando com efetivo_roles
INSERT INTO public.user_roles (
  user_id,  -- Será NULL inicialmente, será preenchido quando usuário fizer login
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
  NULL::uuid as user_id,  -- Será criado quando usuário fizer login
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

-- 4. Atualizar user_roles com dados de usuarios_por_login (quando existir vínculo)
UPDATE public.user_roles ur
SET 
  login = upl.login,
  senha = upl.senha::text,
  cpf = upl.cpf,
  email = COALESCE(ur.email, upl.email),
  data_nascimento = upl.data_nascimento,
  idade = upl.idade,
  contato = upl.contato,
  post_grad = upl.post_grad,
  quadro = upl.quadro,
  porte_arma = upl.porte_arma,
  data_inclusao = upl.data_inclusao,
  vinculado_em = upl.vinculado_em,
  user_id = upl.auth_user_id,  -- Usar auth_user_id se existir
  ativo = COALESCE(upl.ativo, ur.ativo, true)
FROM public.usuarios_por_login upl
WHERE ur.efetivo_id = upl.efetivo_id
  AND upl.efetivo_id IS NOT NULL;

-- 5. Atualizar user_roles com dados de usuarios_permitidos (quando existir)
UPDATE public.user_roles ur
SET 
  nome = COALESCE(ur.nome, up."Nome"),
  nome_guerra = COALESCE(ur.nome_guerra, up."Nome Guerra"),
  matricula = COALESCE(ur.matricula, up."Matrícula"),
  email = COALESCE(ur.email, up."Email 1"),
  "Email 2" = up."Email 2",
  cpf = COALESCE(ur.cpf, up."CPF"::bigint),
  data_nascimento = COALESCE(ur.data_nascimento, up."Data Nascimento"::date),
  sexo = COALESCE(ur.sexo, up."Sexo"),
  contato = COALESCE(ur.contato, up."Telefone 1"),
  "Telefone 2" = up."Telefone 2",
  post_grad = COALESCE(ur.post_grad, up."Post_Grad"),
  quadro = COALESCE(ur.quadro, up."Quadro"),
  lotacao = COALESCE(ur.lotacao, up."Lotação")
FROM public.usuarios_permitidos up
INNER JOIN public.dim_efetivo de ON de.matricula = up."Matrícula"
WHERE ur.efetivo_id = de.id
  AND ur.efetivo_id IS NOT NULL;

-- 6. Criar login para registros que não têm (baseado em nome)
UPDATE public.user_roles
SET login = LOWER(
  REGEXP_REPLACE(SPLIT_PART(nome, ' ', 1), '[^a-zA-Z]', '', 'g') || '.' || 
  REGEXP_REPLACE(SPLIT_PART(nome, ' ', array_length(string_to_array(nome, ' '), 1)), '[^a-zA-Z]', '', 'g')
)
WHERE login IS NULL
  AND nome IS NOT NULL;

-- 7. Criar senha (CPF) para registros que não têm
UPDATE public.user_roles
SET senha = cpf::text
WHERE senha IS NULL
  AND cpf IS NOT NULL;

-- ============================================
-- PARTE 4: VINCULAR user_id EXISTENTES
-- ============================================

-- 8. Vincular user_id de usuarios_por_login que já têm auth_user_id
UPDATE public.user_roles ur
SET user_id = upl.auth_user_id,
    vinculado_em = COALESCE(ur.vinculado_em, upl.vinculado_em, NOW())
FROM public.usuarios_por_login upl
WHERE ur.efetivo_id = upl.efetivo_id
  AND upl.auth_user_id IS NOT NULL
  AND ur.user_id IS NULL;

-- 9. Vincular user_id por email (se email existir em auth.users)
UPDATE public.user_roles ur
SET user_id = au.id,
    vinculado_em = COALESCE(ur.vinculado_em, NOW())
FROM auth.users au
WHERE LOWER(TRIM(ur.email)) = LOWER(TRIM(au.email))
  AND ur.user_id IS NULL
  AND ur.email IS NOT NULL;

-- ============================================
-- PARTE 5: GARANTIR EMAILS ADMIN
-- ============================================

-- 10. Garantir que emails admin tenham role 'admin'
UPDATE public.user_roles
SET role = 'admin'::app_role
WHERE email IN ('soi.bpma@gmail.com', 'joaopaulogm@gmail.com')
  AND role != 'admin'::app_role;

-- ============================================
-- PARTE 6: ATUALIZAR CONSTRAINTS E POLÍTICAS
-- ============================================

-- 11. Remover constraint UNIQUE antiga de user_id, role (agora pode ter múltiplos roles por efetivo)
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- 12. Adicionar constraint: um efetivo_id pode ter apenas um registro ativo
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_efetivo_id_ativo_unique 
ON public.user_roles(efetivo_id) 
WHERE ativo = true;

-- 13. Atualizar RLS policies para incluir efetivo_id
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.efetivo_id = user_roles.efetivo_id 
    AND ur2.user_id = auth.uid()
  )
);

-- ============================================
-- PARTE 7: COMENTÁRIOS
-- ============================================

COMMENT ON TABLE public.user_roles IS 'Tabela consolidada contendo todos os dados de usuários, roles e efetivo. Referência principal: dim_efetivo';
COMMENT ON COLUMN public.user_roles.efetivo_id IS 'Referência ao dim_efetivo (chave principal)';
COMMENT ON COLUMN public.user_roles.user_id IS 'Referência ao auth.users (criado quando usuário faz login)';
COMMENT ON COLUMN public.user_roles.login IS 'Login no formato primeiro_nome.ultimo_nome';
COMMENT ON COLUMN public.user_roles.senha IS 'CPF como string (usado para login inicial)';
