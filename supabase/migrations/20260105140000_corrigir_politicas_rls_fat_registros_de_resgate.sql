-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA fat_registros_de_resgate
-- ============================================
-- Esta migration garante que as políticas RLS estejam corretas
-- e permitam operações para usuários autenticados

-- Remover políticas antigas se existirem (para evitar conflitos)
DO $$
BEGIN
  -- Remover políticas antigas de INSERT
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'fat_registros_de_resgate' 
    AND policyname = 'Authenticated users can insert fat_registros_de_resgate'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" 
    ON public.fat_registros_de_resgate;
  END IF;
  
  -- Remover políticas antigas de SELECT
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'fat_registros_de_resgate' 
    AND policyname = 'Authenticated users can view fat_registros_de_resgate'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" 
    ON public.fat_registros_de_resgate;
  END IF;
  
  -- Remover políticas antigas de UPDATE
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'fat_registros_de_resgate' 
    AND policyname = 'Authenticated users can update fat_registros_de_resgate'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" 
    ON public.fat_registros_de_resgate;
  END IF;
  
  -- Remover políticas antigas de DELETE
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'fat_registros_de_resgate' 
    AND policyname = 'Authenticated users can delete fat_registros_de_resgate'
  ) THEN
    DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" 
    ON public.fat_registros_de_resgate;
  END IF;
END $$;

-- Garantir que RLS está habilitado
ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas para SELECT
CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Criar políticas corretas para INSERT
CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar políticas corretas para UPDATE
CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar políticas corretas para DELETE
CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Verificar se as políticas foram criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'fat_registros_de_resgate';
  
  RAISE NOTICE 'Políticas RLS criadas para fat_registros_de_resgate: %', policy_count;
END $$;
