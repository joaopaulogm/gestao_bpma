-- ============================================
-- HABILITAR RLS E POLÍTICAS PARA TABELAS PRINCIPAIS
-- ============================================
-- Garantir que fat_resgates_diarios_2025 e fat_registros_de_resgate
-- tenham RLS habilitado e políticas de segurança adequadas

-- Habilitar RLS em fat_resgates_diarios_2025 se ainda não estiver habilitado
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_resgates_diarios_2025') THEN
    ALTER TABLE public.fat_resgates_diarios_2025 ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas se não existirem
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_resgates_diarios_2025' 
      AND policyname = 'Authenticated users can view fat_resgates_diarios_2025'
    ) THEN
      CREATE POLICY "Authenticated users can view fat_resgates_diarios_2025"
      ON public.fat_resgates_diarios_2025
      FOR SELECT
      TO authenticated
      USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_resgates_diarios_2025' 
      AND policyname = 'Authenticated users can insert fat_resgates_diarios_2025'
    ) THEN
      CREATE POLICY "Authenticated users can insert fat_resgates_diarios_2025"
      ON public.fat_resgates_diarios_2025
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_resgates_diarios_2025' 
      AND policyname = 'Authenticated users can update fat_resgates_diarios_2025'
    ) THEN
      CREATE POLICY "Authenticated users can update fat_resgates_diarios_2025"
      ON public.fat_resgates_diarios_2025
      FOR UPDATE
      TO authenticated
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_resgates_diarios_2025' 
      AND policyname = 'Authenticated users can delete fat_resgates_diarios_2025'
    ) THEN
      CREATE POLICY "Authenticated users can delete fat_resgates_diarios_2025"
      ON public.fat_resgates_diarios_2025
      FOR DELETE
      TO authenticated
      USING (auth.uid() IS NOT NULL);
    END IF;
  END IF;
END $$;

-- Habilitar RLS em fat_registros_de_resgate se ainda não estiver habilitado
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_registros_de_resgate') THEN
    ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas se não existirem
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_registros_de_resgate' 
      AND policyname = 'Authenticated users can view fat_registros_de_resgate'
    ) THEN
      CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
      ON public.fat_registros_de_resgate
      FOR SELECT
      TO authenticated
      USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_registros_de_resgate' 
      AND policyname = 'Authenticated users can insert fat_registros_de_resgate'
    ) THEN
      CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
      ON public.fat_registros_de_resgate
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_registros_de_resgate' 
      AND policyname = 'Authenticated users can update fat_registros_de_resgate'
    ) THEN
      CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
      ON public.fat_registros_de_resgate
      FOR UPDATE
      TO authenticated
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'fat_registros_de_resgate' 
      AND policyname = 'Authenticated users can delete fat_registros_de_resgate'
    ) THEN
      CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
      ON public.fat_registros_de_resgate
      FOR DELETE
      TO authenticated
      USING (auth.uid() IS NOT NULL);
    END IF;
  END IF;
END $$;
