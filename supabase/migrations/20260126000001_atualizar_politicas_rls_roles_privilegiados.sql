-- ============================================
-- ATUALIZAR POLÍTICAS RLS PARA ROLES PRIVILEGIADOS
-- ============================================
-- Esta migration atualiza todas as políticas RLS para permitir
-- acesso completo (SELECT, INSERT, UPDATE, DELETE) aos seguintes roles:
-- - admin (administrador)
-- - secao_operacional
-- - secao_pessoas
-- 
-- As tabelas permanecem privadas (RLS habilitado), mas esses roles
-- específicos têm acesso total a todos os dados.
-- ============================================

BEGIN;

-- ============================================
-- 1. CRIAR FUNÇÃO HELPER PARA VERIFICAR ROLES PRIVILEGIADOS
-- ============================================

CREATE OR REPLACE FUNCTION public.has_privileged_role(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verificar se o usuário tem um dos roles privilegiados
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'secao_operacional'::app_role, 'secao_pessoas'::app_role)
      AND (ativo = true OR ativo IS NULL)
  );
END;
$$;

-- ============================================
-- 2. ATUALIZAR TODAS AS TABELAS COM RLS
-- ============================================

DO $$
DECLARE
  tabela_record RECORD;
  policy_name TEXT;
BEGIN
  -- Iterar sobre todas as tabelas que têm RLS habilitado
  FOR tabela_record IN
    SELECT 
      schemaname,
      tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = schemaname
          AND c.relname = tablename
          AND c.relrowsecurity = true
      )
    ORDER BY tablename
  LOOP
    -- Remover todas as políticas existentes da tabela
    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = tabela_record.schemaname
        AND tablename = tabela_record.tablename
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I.%I',
        policy_name,
        tabela_record.schemaname,
        tabela_record.tablename
      );
    END LOOP;
    
    -- Criar políticas para SELECT (leitura)
    EXECUTE format(
      'CREATE POLICY "privileged_roles_select_%s"
      ON %I.%I
      FOR SELECT
      TO authenticated
      USING (public.has_privileged_role(auth.uid()))',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- Criar políticas para INSERT (inserção)
    EXECUTE format(
      'CREATE POLICY "privileged_roles_insert_%s"
      ON %I.%I
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_privileged_role(auth.uid()))',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- Criar políticas para UPDATE (atualização)
    EXECUTE format(
      'CREATE POLICY "privileged_roles_update_%s"
      ON %I.%I
      FOR UPDATE
      TO authenticated
      USING (public.has_privileged_role(auth.uid()))
      WITH CHECK (public.has_privileged_role(auth.uid()))',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- Criar políticas para DELETE (exclusão)
    EXECUTE format(
      'CREATE POLICY "privileged_roles_delete_%s"
      ON %I.%I
      FOR DELETE
      TO authenticated
      USING (public.has_privileged_role(auth.uid()))',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    RAISE NOTICE 'Políticas RLS atualizadas para tabela: %', tabela_record.tablename;
  END LOOP;
END $$;

-- ============================================
-- 3. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  tabela_record RECORD;
  policy_count INTEGER;
  total_tabelas INTEGER := 0;
  total_politicas INTEGER := 0;
BEGIN
  FOR tabela_record IN
    SELECT 
      schemaname,
      tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = schemaname
          AND c.relname = tablename
          AND c.relrowsecurity = true
      )
    ORDER BY tablename
  LOOP
    total_tabelas := total_tabelas + 1;
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = tabela_record.schemaname
      AND tablename = tabela_record.tablename
      AND policyname LIKE 'privileged_roles_%';
    
    total_politicas := total_politicas + policy_count;
    
    IF policy_count < 4 THEN
      RAISE WARNING 'Atenção: % tem apenas % políticas privileged_roles. Esperado: 4', 
        tabela_record.tablename, policy_count;
    ELSE
      RAISE NOTICE 'Sucesso: % tem % políticas privileged_roles', 
        tabela_record.tablename, policy_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Resumo: % tabelas processadas, % políticas criadas', 
    total_tabelas, total_politicas;
  RAISE NOTICE '========================================';
END $$;

COMMIT;
