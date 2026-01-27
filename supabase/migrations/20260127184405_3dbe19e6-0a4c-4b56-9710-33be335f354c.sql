-- =====================================================
-- SIMPLIFICAR RLS: Todos autenticados acessam tudo
-- Controle de páginas é feito no frontend (ProtectedRoute)
-- =====================================================

-- Função auxiliar para verificar se está autenticado
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- =====================================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- =====================================================
-- CRIAR POLÍTICAS SIMPLES: authenticated = acesso total
-- =====================================================

-- Lista de todas as tabelas principais
DO $$
DECLARE
  tbl TEXT;
  tables_list TEXT[] := ARRAY[
    'dim_area_protegida', 'dim_desfecho_crime_ambientais', 'dim_desfecho_crime_comum',
    'dim_desfecho_resgates', 'dim_destinacao', 'dim_efetivo', 'dim_enquadramento',
    'dim_equipes', 'dim_equipes_campanha', 'dim_especies_fauna', 'dim_especies_flora',
    'dim_estado_saude', 'dim_estagio_vida', 'dim_frota', 'dim_frota_historico',
    'dim_indicador_bpma', 'dim_itens_apreensao', 'dim_origem', 'dim_regiao_administrativa',
    'dim_tempo', 'dim_tgrl', 'dim_tipo_atividade_prevencao', 'dim_tipo_de_area',
    'dim_tipo_de_crime', 'dim_tipo_penal',
    'fat_abono', 'fat_atividades_prevencao', 'fat_campanha_alteracoes', 
    'fat_campanha_config', 'fat_campanha_membros', 'fat_crime_fauna', 'fat_crime_flora',
    'fat_crimes_comuns', 'fat_equipe_membros', 'fat_ferias', 'fat_ferias_parcelas',
    'fat_licencas_medicas', 'fat_registros_de_crime', 'fat_registros_de_resgate',
    'fat_restricoes',
    'fact_indicador_mensal_bpma', 'fact_recordes_apreensao', 
    'fact_resgate_fauna_especie_mensal', 'fact_resumo_mensal_historico',
    'efetivo_roles', 'user_roles', 'notificacoes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_list
  LOOP
    -- Habilitar RLS
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl);
    
    -- Política SELECT para autenticados
    EXECUTE format('
      CREATE POLICY "Authenticated users can select %1$s"
      ON public.%1$I FOR SELECT TO authenticated
      USING (true)
    ', tbl);
    
    -- Política INSERT para autenticados
    EXECUTE format('
      CREATE POLICY "Authenticated users can insert %1$s"
      ON public.%1$I FOR INSERT TO authenticated
      WITH CHECK (true)
    ', tbl);
    
    -- Política UPDATE para autenticados
    EXECUTE format('
      CREATE POLICY "Authenticated users can update %1$s"
      ON public.%1$I FOR UPDATE TO authenticated
      USING (true) WITH CHECK (true)
    ', tbl);
    
    -- Política DELETE para autenticados
    EXECUTE format('
      CREATE POLICY "Authenticated users can delete %1$s"
      ON public.%1$I FOR DELETE TO authenticated
      USING (true)
    ', tbl);
  END LOOP;
END $$;

-- =====================================================
-- POLÍTICAS PÚBLICAS PARA DASHBOARD (fact_* tables)
-- Usuários não logados só veem dados do dashboard público
-- =====================================================

CREATE POLICY "Public can view fact_indicador_mensal_bpma"
ON public.fact_indicador_mensal_bpma FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view fact_recordes_apreensao"
ON public.fact_recordes_apreensao FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view fact_resgate_fauna_especie_mensal"
ON public.fact_resgate_fauna_especie_mensal FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view fact_resumo_mensal_historico"
ON public.fact_resumo_mensal_historico FOR SELECT TO anon
USING (true);

-- Dimensões públicas necessárias para o dashboard
CREATE POLICY "Public can view dim_tempo"
ON public.dim_tempo FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view dim_especies_fauna"
ON public.dim_especies_fauna FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view dim_regiao_administrativa"
ON public.dim_regiao_administrativa FOR SELECT TO anon
USING (true);

CREATE POLICY "Public can view dim_indicador_bpma"
ON public.dim_indicador_bpma FOR SELECT TO anon
USING (true);