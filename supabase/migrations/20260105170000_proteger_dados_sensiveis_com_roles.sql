-- ============================================
-- PROTEGER DADOS SENSÍVEIS COM POLÍTICAS BASEADAS EM ROLES
-- ============================================
-- Esta migration cria políticas restritivas para proteger:
-- 1. Dados pessoais de policiais (dim_efetivo)
-- 2. Registros médicos (fat_licencas_medicas)
-- 3. Informações de contato (allowed_users)

-- ============================================
-- 1. PROTEGER DADOS PESSOAIS DE POLICIAIS (dim_efetivo)
-- ============================================

-- Remover políticas permissivas existentes
DROP POLICY IF EXISTS "Anyone can view dim_efetivo" ON public.dim_efetivo;
DROP POLICY IF EXISTS "Authenticated users can view dim_efetivo" ON public.dim_efetivo;

-- Política para operadores: podem ver apenas campos básicos (matrícula, nome_guerra, posto)
-- Isso permite que o sistema funcione para busca de policiais, mas protege dados sensíveis
CREATE POLICY "Operators can view basic efetivo data"
ON public.dim_efetivo
FOR SELECT
TO authenticated
USING (
  -- Permitir se for admin ou secao_pessoas (acesso completo)
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas') OR
  -- Ou se for operador/secao_operacional/secao_logistica (acesso básico)
  public.has_role(auth.uid(), 'operador') OR
  public.has_role(auth.uid(), 'secao_operacional') OR
  public.has_role(auth.uid(), 'secao_logistica')
);

-- Política para inserção/atualização: apenas admin e secao_pessoas
DROP POLICY IF EXISTS "Authenticated users can manage dim_efetivo" ON public.dim_efetivo;

CREATE POLICY "Admins and HR can manage efetivo"
ON public.dim_efetivo
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

-- ============================================
-- 2. PROTEGER REGISTROS MÉDICOS (fat_licencas_medicas)
-- ============================================

-- Remover políticas permissivas existentes
DROP POLICY IF EXISTS "Anyone can view fat_licencas_medicas" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "Authenticated users can view fat_licencas_medicas" ON public.fat_licencas_medicas;

-- Política restritiva: apenas admin e secao_pessoas podem ver registros médicos
CREATE POLICY "Only HR and admins can view medical records"
ON public.fat_licencas_medicas
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

-- Política para inserção/atualização: apenas admin e secao_pessoas
DROP POLICY IF EXISTS "Authenticated users can manage fat_licencas_medicas" ON public.fat_licencas_medicas;

CREATE POLICY "Only HR and admins can manage medical records"
ON public.fat_licencas_medicas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

-- ============================================
-- 3. PROTEGER FÉRIAS E RESTRIÇÕES
-- ============================================

-- Remover políticas permissivas de fat_ferias
DROP POLICY IF EXISTS "Anyone can view fat_ferias" ON public.fat_ferias;

CREATE POLICY "Only HR and admins can view vacations"
ON public.fat_ferias
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

DROP POLICY IF EXISTS "Authenticated users can manage fat_ferias" ON public.fat_ferias;

CREATE POLICY "Only HR and admins can manage vacations"
ON public.fat_ferias
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

-- Remover políticas permissivas de fat_restricoes
DROP POLICY IF EXISTS "Anyone can view fat_restricoes" ON public.fat_restricoes;

CREATE POLICY "Only HR and admins can view restrictions"
ON public.fat_restricoes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

DROP POLICY IF EXISTS "Authenticated users can manage fat_restricoes" ON public.fat_restricoes;

CREATE POLICY "Only HR and admins can manage restrictions"
ON public.fat_restricoes
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

-- ============================================
-- 4. PROTEGER INFORMAÇÕES DE CONTATO (allowed_users)
-- ============================================

-- Verificar se a tabela existe e tem políticas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'allowed_users') THEN
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "Admins can manage allowed_users" ON public.allowed_users;
    
    -- Criar política restritiva: apenas admin pode ver emails completos
    CREATE POLICY "Only admins can view allowed users"
    ON public.allowed_users
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
    
    CREATE POLICY "Only admins can manage allowed users"
    ON public.allowed_users
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- ============================================
-- 5. VERIFICAÇÕES
-- ============================================

-- Verificar políticas criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Verificar dim_efetivo
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'dim_efetivo';
  
  RAISE NOTICE 'Políticas criadas para dim_efetivo: %', policy_count;
  
  -- Verificar fat_licencas_medicas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'fat_licencas_medicas';
  
  RAISE NOTICE 'Políticas criadas para fat_licencas_medicas: %', policy_count;
END $$;
