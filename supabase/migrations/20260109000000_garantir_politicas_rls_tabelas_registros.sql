-- ============================================
-- GARANTIR POLÍTICAS RLS PARA TABELAS DE REGISTROS
-- ============================================
-- Esta migration garante que todas as tabelas de registros
-- (fat_resgates_diarios_* e fat_registros_de_resgate)
-- tenham políticas RLS adequadas para usuários autenticados
-- ============================================

BEGIN;

-- ============================================
-- 1. POLÍTICAS PARA fat_registros_de_resgate
-- ============================================

DO $$
BEGIN
  -- Garantir que RLS está habilitado
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'fat_registros_de_resgate'
  ) THEN
    ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas que possam estar bloqueando
    DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
    DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
    DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
    DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
    
    -- Criar políticas de SELECT (visualização)
    CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
    ON public.fat_registros_de_resgate
    FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);
    
    -- Criar políticas de INSERT (inserção)
    CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
    ON public.fat_registros_de_resgate
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);
    
    -- Criar políticas de UPDATE (atualização)
    CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
    ON public.fat_registros_de_resgate
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
    
    -- Criar políticas de DELETE (exclusão)
    CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
    ON public.fat_registros_de_resgate
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);
    
    RAISE NOTICE 'Políticas RLS criadas para fat_registros_de_resgate';
  END IF;
END $$;

-- ============================================
-- 2. POLÍTICAS PARA fat_resgates_diarios_2020 a 2025
-- ============================================

DO $$
DECLARE
  ano INTEGER;
  tabela_nome TEXT;
BEGIN
  FOR ano IN 2020..2025 LOOP
    tabela_nome := 'fat_resgates_diarios_' || ano;
    
    -- Verificar se a tabela existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tabela_nome
    ) THEN
      -- Garantir que RLS está habilitado
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabela_nome);
      
      -- Remover políticas antigas
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view %s" ON public.%I', tabela_nome, tabela_nome);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can insert %s" ON public.%I', tabela_nome, tabela_nome);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update %s" ON public.%I', tabela_nome, tabela_nome);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete %s" ON public.%I', tabela_nome, tabela_nome);
      
      -- Criar políticas de SELECT
      EXECUTE format(
        'CREATE POLICY "Authenticated users can view %s" ON public.%I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
        tabela_nome, tabela_nome
      );
      
      -- Criar políticas de INSERT
      EXECUTE format(
        'CREATE POLICY "Authenticated users can insert %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)',
        tabela_nome, tabela_nome
      );
      
      -- Criar políticas de UPDATE
      EXECUTE format(
        'CREATE POLICY "Authenticated users can update %s" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
        tabela_nome, tabela_nome
      );
      
      -- Criar políticas de DELETE
      EXECUTE format(
        'CREATE POLICY "Authenticated users can delete %s" ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)',
        tabela_nome, tabela_nome
      );
      
      RAISE NOTICE 'Políticas RLS criadas para %', tabela_nome;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 3. VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
  tabela_nome TEXT;
BEGIN
  -- Verificar fat_registros_de_resgate
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'fat_registros_de_resgate'
  ) THEN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'fat_registros_de_resgate';
    
    IF policy_count < 4 THEN
      RAISE WARNING 'Atenção: fat_registros_de_resgate tem apenas % políticas. Esperado: 4', policy_count;
    ELSE
      RAISE NOTICE 'Sucesso: fat_registros_de_resgate tem % políticas RLS', policy_count;
    END IF;
  END IF;
  
  -- Verificar tabelas fat_resgates_diarios_*
  FOR tabela_nome IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename LIKE 'fat_resgates_diarios_%'
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = tabela_nome;
    
    IF policy_count < 4 THEN
      RAISE WARNING 'Atenção: % tem apenas % políticas. Esperado: 4', tabela_nome, policy_count;
    ELSE
      RAISE NOTICE 'Sucesso: % tem % políticas RLS', tabela_nome, policy_count;
    END IF;
  END LOOP;
END $$;

COMMIT;
