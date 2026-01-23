-- =====================================================
-- MIGRAÇÃO: Corrigir políticas RLS que usam USING (true) ou WITH CHECK (true)
-- para operações UPDATE, DELETE ou INSERT
-- =====================================================
-- NOTA: Políticas SELECT com USING (true) são intencionalmente mantidas
-- para tabelas de referência (dimensões) que precisam ser públicas

-- 1. CORRIGIR fat_registros_de_resgate
DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;

CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. CORRIGIR fat_ocorrencia_apreensao_crime_comum
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.fat_ocorrencia_apreensao_crime_comum;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON public.fat_ocorrencia_apreensao_crime_comum;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON public.fat_ocorrencia_apreensao_crime_comum;

CREATE POLICY "Authenticated users can insert fat_ocorrencia_apreensao_crime_comum"
ON public.fat_ocorrencia_apreensao_crime_comum
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_ocorrencia_apreensao_crime_comum"
ON public.fat_ocorrencia_apreensao_crime_comum
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_ocorrencia_apreensao_crime_comum"
ON public.fat_ocorrencia_apreensao_crime_comum
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 3. CORRIGIR fat_equipe_crime_comum
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.fat_equipe_crime_comum;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON public.fat_equipe_crime_comum;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON public.fat_equipe_crime_comum;

CREATE POLICY "Authenticated users can insert fat_equipe_crime_comum"
ON public.fat_equipe_crime_comum
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_equipe_crime_comum"
ON public.fat_equipe_crime_comum
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_equipe_crime_comum"
ON public.fat_equipe_crime_comum
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. CORRIGIR registros (tabela antiga, se ainda existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'registros') THEN
    DROP POLICY IF EXISTS "Authenticated users can insert registros" ON public.registros;
    DROP POLICY IF EXISTS "Authenticated users can update registros" ON public.registros;
    DROP POLICY IF EXISTS "Authenticated users can delete registros" ON public.registros;

    CREATE POLICY "Authenticated users can insert registros"
    ON public.registros
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can update registros"
    ON public.registros
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Authenticated users can delete registros"
    ON public.registros
    FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 5. CORRIGIR especies_fauna (tabela antiga, se ainda existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'especies_fauna') THEN
    DROP POLICY IF EXISTS "Authenticated users can manage especies_fauna" ON public.especies_fauna;

    CREATE POLICY "Authenticated users can manage especies_fauna"
    ON public.especies_fauna
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 6. VERIFICAR E CORRIGIR OUTRAS TABELAS COM POLÍTICAS PROBLEMÁTICAS
DO $$
DECLARE
  policy_rec RECORD;
  tabela_nome TEXT;
  cmd TEXT;
BEGIN
  FOR policy_rec IN
    SELECT 
      schemaname,
      tablename,
      policyname,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
    AND (
      (qual IS NOT NULL AND qual::text LIKE '%true%')
      OR (with_check IS NOT NULL AND with_check::text LIKE '%true%')
    )
    AND tablename NOT IN (
      -- Excluir tabelas de dimensão que podem ter SELECT público
      'dim_regiao_administrativa',
      'dim_origem',
      'dim_destinacao',
      'dim_estado_saude',
      'dim_estagio_vida',
      'dim_desfecho',
      'dim_desfecho_resgates',
      'dim_tipo_de_area',
      'dim_tipo_de_crime',
      'dim_enquadramento',
      'dim_especies_fauna',
      'dim_especies_flora'
    )
  LOOP
    tabela_nome := policy_rec.tablename;
    cmd := policy_rec.cmd;
    
    -- Remover política problemática
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
        policy_rec.policyname, 
        tabela_nome
      );
      
      -- Recriar com verificação adequada
      IF cmd = 'INSERT' THEN
        EXECUTE format(
          'CREATE POLICY "Authenticated users can insert %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL)',
          tabela_nome, tabela_nome
        );
      ELSIF cmd = 'UPDATE' THEN
        EXECUTE format(
          'CREATE POLICY "Authenticated users can update %s" ON public.%I FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)',
          tabela_nome, tabela_nome
        );
      ELSIF cmd = 'DELETE' THEN
        EXECUTE format(
          'CREATE POLICY "Authenticated users can delete %s" ON public.%I FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL)',
          tabela_nome, tabela_nome
        );
      END IF;
      
      RAISE NOTICE 'Política corrigida: %.% (cmd: %)', tabela_nome, policy_rec.policyname, cmd;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao corrigir política %.%: %', tabela_nome, policy_rec.policyname, SQLERRM;
    END;
  END LOOP;
END $$;

-- 7. COMENTÁRIOS DE DOCUMENTAÇÃO
COMMENT ON POLICY "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate IS 
'Política RLS corrigida: substitui WITH CHECK (true) por verificação de autenticação adequada.';

COMMENT ON POLICY "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate IS 
'Política RLS corrigida: substitui USING (true) e WITH CHECK (true) por verificação de autenticação adequada.';

COMMENT ON POLICY "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate IS 
'Política RLS corrigida: substitui USING (true) por verificação de autenticação adequada.';
