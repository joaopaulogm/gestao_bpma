-- ============================================
-- PERMITIR ACESSO A TODOS OS USUÁRIOS AUTENTICADOS
-- ============================================
-- Esta migration atualiza todas as políticas RLS para permitir
-- acesso completo (SELECT, INSERT, UPDATE, DELETE) a qualquer
-- usuário autenticado. Apenas usuários não autenticados são
-- restringidos.
-- ============================================

BEGIN;

-- ============================================
-- 1. REMOVER POLÍTICAS BASEADAS EM ROLES PRIVILEGIADOS
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
    
    -- Criar políticas simples para qualquer usuário autenticado
    -- SELECT (leitura)
    EXECUTE format(
      'CREATE POLICY "authenticated_users_select_%s"
      ON %I.%I
      FOR SELECT
      TO authenticated
      USING (auth.uid() IS NOT NULL)',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- INSERT (inserção)
    EXECUTE format(
      'CREATE POLICY "authenticated_users_insert_%s"
      ON %I.%I
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL)',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- UPDATE (atualização)
    EXECUTE format(
      'CREATE POLICY "authenticated_users_update_%s"
      ON %I.%I
      FOR UPDATE
      TO authenticated
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL)',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    -- DELETE (exclusão)
    EXECUTE format(
      'CREATE POLICY "authenticated_users_delete_%s"
      ON %I.%I
      FOR DELETE
      TO authenticated
      USING (auth.uid() IS NOT NULL)',
      tabela_record.tablename,
      tabela_record.schemaname,
      tabela_record.tablename
    );
    
    RAISE NOTICE 'Políticas RLS atualizadas para tabela: %', tabela_record.tablename;
  END LOOP;
END $$;

-- ============================================
-- 2. VERIFICAÇÃO FINAL
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
      AND policyname LIKE 'authenticated_users_%';
    
    total_politicas := total_politicas + policy_count;
    
    IF policy_count < 4 THEN
      RAISE WARNING 'Atenção: % tem apenas % políticas authenticated_users. Esperado: 4', 
        tabela_record.tablename, policy_count;
    ELSE
      RAISE NOTICE 'Sucesso: % tem % políticas authenticated_users', 
        tabela_record.tablename, policy_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Resumo: % tabelas processadas, % políticas criadas', 
    total_tabelas, total_politicas;
  RAISE NOTICE '========================================';
END $$;

COMMIT;
