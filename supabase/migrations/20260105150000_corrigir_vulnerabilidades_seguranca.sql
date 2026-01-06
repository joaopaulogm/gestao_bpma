-- ============================================
-- CORRIGIR VULNERABILIDADES DE SEGURANÇA
-- ============================================
-- Esta migration corrige os problemas críticos identificados pelo scan de segurança

-- ============================================
-- 1. CORRIGIR ACESSO A DADOS DE FUNCIONÁRIOS
-- ============================================

-- Remover política permissiva de dim_efetivo
DROP POLICY IF EXISTS "Anyone can view dim_efetivo" ON public.dim_efetivo;

-- Criar política restritiva para dim_efetivo (apenas autenticados)
CREATE POLICY "Authenticated users can view dim_efetivo"
ON public.dim_efetivo
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. CORRIGIR ACESSO A REGISTROS MÉDICOS
-- ============================================

-- Remover políticas permissivas de fat_licencas_medicas
DROP POLICY IF EXISTS "Anyone can view fat_licencas_medicas" ON public.fat_licencas_medicas;

-- Criar política restritiva para fat_licencas_medicas (apenas autenticados)
-- Nota: Se precisar restringir apenas para HR, adicione verificação de role
CREATE POLICY "Authenticated users can view fat_licencas_medicas"
ON public.fat_licencas_medicas
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 3. CORRIGIR ACESSO A FÉRIAS E RESTRIÇÕES
-- ============================================

-- Remover políticas permissivas de fat_ferias
DROP POLICY IF EXISTS "Anyone can view fat_ferias" ON public.fat_ferias;

-- Criar política restritiva para fat_ferias
CREATE POLICY "Authenticated users can view fat_ferias"
ON public.fat_ferias
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Remover políticas permissivas de fat_restricoes
DROP POLICY IF EXISTS "Anyone can view fat_restricoes" ON public.fat_restricoes;

-- Criar política restritiva para fat_restricoes
CREATE POLICY "Authenticated users can view fat_restricoes"
ON public.fat_restricoes
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. CORRIGIR FUNÇÕES SECURITY DEFINER
-- ============================================
-- Adicionar SET search_path = public para prevenir bypass de RLS

-- Corrigir sync_fauna_from_dimension
CREATE OR REPLACE FUNCTION public.sync_fauna_from_dimension()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update fauna records that reference this dimension
  UPDATE public.fauna
  SET 
    nome_popular = NEW.nome_popular,
    nome_cientifico = NEW.nome_cientifico,
    nome_popular_slug = public.slugify_pt(NEW.nome_popular),
    classe_taxonomica = NEW.classe_taxonomica,
    ordem_taxonomica = NEW.ordem_taxonomica,
    tipo_fauna = NEW.tipo_de_fauna,
    estado_conservacao = NEW.estado_de_conservacao,
    updated_at = now()
  WHERE id_dim_especie_fauna = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Corrigir sync_flora_from_dimension
CREATE OR REPLACE FUNCTION public.sync_flora_from_dimension()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update flora records that reference this dimension
  UPDATE public.flora
  SET 
    nome_popular = NEW."Nome Popular",
    nome_cientifico = NEW."Nome Científico",
    nome_popular_slug = public.slugify_pt(COALESCE(NEW."Nome Popular", '')),
    classe = NEW."Classe",
    ordem = NEW."Ordem",
    familia = NEW."Família",
    estado_conservacao = NEW."Estado de Conservação",
    tipo_planta = NEW."Tipo de Planta",
    madeira_lei = (NEW."Madeira de Lei" = 'Sim'),
    imune_ao_corte = (NEW."Imune ao Corte" = 'Sim'),
    updated_at = now()
  WHERE id_dim_especie_flora = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Verificar e corrigir outras funções SECURITY DEFINER
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT 
      p.proname as function_name,
      pg_get_functiondef(p.oid) as function_def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND pg_get_functiondef(p.oid) NOT LIKE '%SET search_path = public%'
  LOOP
    RAISE NOTICE 'Função SECURITY DEFINER sem search_path fixado: %', func_record.function_name;
    -- Nota: Funções específicas precisam ser corrigidas individualmente
  END LOOP;
END $$;

-- ============================================
-- 5. VERIFICAR TABELAS COM RLS SEM POLÍTICAS
-- ============================================

-- Verificar tabelas com RLS habilitado mas sem políticas
DO $$
DECLARE
  table_record RECORD;
  policy_count INTEGER;
BEGIN
  FOR table_record IN
    SELECT 
      schemaname,
      tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
  LOOP
    -- Verificar se RLS está habilitado
    IF EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = table_record.schemaname
        AND c.relname = table_record.tablename
        AND c.relrowsecurity = true
    ) THEN
      -- Contar políticas
      SELECT COUNT(*) INTO policy_count
      FROM pg_policies
      WHERE schemaname = table_record.schemaname
        AND tablename = table_record.tablename;
      
      IF policy_count = 0 THEN
        RAISE NOTICE 'Tabela com RLS habilitado mas sem políticas: %.%', 
          table_record.schemaname, table_record.tablename;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 6. GARANTIR POLÍTICAS PARA TABELAS CRÍTICAS
-- ============================================

-- Verificar e criar políticas para tabelas que podem estar sem políticas
DO $$
BEGIN
  -- fat_abono
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fat_abono') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_abono'
    ) THEN
      CREATE POLICY "Authenticated users can manage fat_abono"
      ON public.fat_abono
      FOR ALL
      TO authenticated
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
  END IF;
  
  -- Adicionar outras tabelas conforme necessário
END $$;

-- ============================================
-- 7. COMENTÁRIOS SOBRE CONFIGURAÇÕES
-- ============================================

COMMENT ON POLICY "Authenticated users can view dim_efetivo" ON public.dim_efetivo IS 
'Restringe acesso a dados de funcionários apenas para usuários autenticados';

COMMENT ON POLICY "Authenticated users can view fat_licencas_medicas" ON public.fat_licencas_medicas IS 
'Restringe acesso a registros médicos apenas para usuários autenticados';
