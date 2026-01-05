-- ============================================
-- FORÇAR POLÍTICAS RLS PARA fat_registros_de_resgate
-- ============================================
-- Esta migration garante que as políticas RLS estejam corretas
-- e funcionando para permitir inserções de usuários autenticados

-- Remover TODAS as políticas existentes (para garantir limpeza)
DO $$
BEGIN
  -- Remover todas as políticas de SELECT
  DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Anyone can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Users can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  
  -- Remover todas as políticas de INSERT
  DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Anyone can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  
  -- Remover todas as políticas de UPDATE
  DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Anyone can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  
  -- Remover todas as políticas de DELETE
  DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Anyone can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
  DROP POLICY IF EXISTS "Users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
END $$;

-- Garantir que RLS está habilitado
ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;

-- Criar políticas de SELECT (visualização)
CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR SELECT
TO authenticated
USING (true);

-- Criar políticas de INSERT (inserção) - CRÍTICO PARA O ERRO
CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar políticas de UPDATE (atualização)
CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar políticas de DELETE (exclusão)
CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR DELETE
TO authenticated
USING (true);

-- Verificar se as políticas foram criadas corretamente
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'fat_registros_de_resgate';
  
  IF policy_count < 4 THEN
    RAISE EXCEPTION 'Erro: Apenas % políticas foram criadas. Esperado: 4', policy_count;
  ELSE
    RAISE NOTICE 'Sucesso: % políticas RLS criadas para fat_registros_de_resgate', policy_count;
  END IF;
END $$;

-- Verificar se RLS está habilitado
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname = 'fat_registros_de_resgate';
  
  IF NOT rls_enabled THEN
    RAISE EXCEPTION 'Erro: RLS não está habilitado na tabela fat_registros_de_resgate';
  ELSE
    RAISE NOTICE 'Sucesso: RLS está habilitado na tabela fat_registros_de_resgate';
  END IF;
END $$;
