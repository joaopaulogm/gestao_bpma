-- =====================================================
-- MIGRAÇÃO: Corrigir políticas RLS para dados sensíveis
-- Remove acesso público a dados que podem ser explorados
-- =====================================================

-- 1. CORRIGIR dim_especies_fauna
-- Remover política pública e exigir autenticação
DROP POLICY IF EXISTS "Anyone can view dim_especies_fauna" ON public.dim_especies_fauna;

CREATE POLICY "Authenticated users can view dim_especies_fauna"
ON public.dim_especies_fauna
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. CORRIGIR dim_especies_flora
-- Remover política pública e exigir autenticação
DROP POLICY IF EXISTS "Anyone can view dim_especies_flora" ON public.dim_especies_flora;

CREATE POLICY "Authenticated users can view dim_especies_flora"
ON public.dim_especies_flora
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 3. CORRIGIR fact_resumo_mensal_historico
-- Remover política pública e exigir autenticação
DROP POLICY IF EXISTS "Dados de resumo mensal são públicos para leitura" ON public.fact_resumo_mensal_historico;

CREATE POLICY "Authenticated users can view fact_resumo_mensal_historico"
ON public.fact_resumo_mensal_historico
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. CORRIGIR fact_recordes_apreensao
-- Remover política pública e exigir autenticação
DROP POLICY IF EXISTS "Recordes de apreensão são públicos" ON public.fact_recordes_apreensao;

CREATE POLICY "Authenticated users can view fact_recordes_apreensao"
ON public.fact_recordes_apreensao
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 5. REVISAR TABELAS DE REFERÊNCIA
-- Manter acesso público apenas para tabelas que realmente precisam (valores de consulta não sensíveis)
-- As tabelas dim_destinacao, dim_origem, dim_estado_saude, dim_estagio_vida, dim_desfecho_resgates, 
-- dim_tipo_de_area, dim_tipo_de_crime são valores de referência e podem permanecer públicas
-- mas vamos adicionar políticas explícitas para garantir controle

-- Verificar e criar políticas para tabelas de referência se não existirem
DO $$
BEGIN
  -- dim_destinacao
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_destinacao') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_destinacao' AND policyname = 'Public read access for dim_destinacao') THEN
      ALTER TABLE public.dim_destinacao ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_destinacao"
      ON public.dim_destinacao
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_origem
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_origem') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_origem' AND policyname = 'Public read access for dim_origem') THEN
      ALTER TABLE public.dim_origem ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_origem"
      ON public.dim_origem
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_estado_saude
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_estado_saude') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_estado_saude' AND policyname = 'Public read access for dim_estado_saude') THEN
      ALTER TABLE public.dim_estado_saude ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_estado_saude"
      ON public.dim_estado_saude
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_estagio_vida
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_estagio_vida') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_estagio_vida' AND policyname = 'Public read access for dim_estagio_vida') THEN
      ALTER TABLE public.dim_estagio_vida ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_estagio_vida"
      ON public.dim_estagio_vida
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_desfecho_resgates
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_desfecho_resgates') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_desfecho_resgates' AND policyname = 'Public read access for dim_desfecho_resgates') THEN
      ALTER TABLE public.dim_desfecho_resgates ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_desfecho_resgates"
      ON public.dim_desfecho_resgates
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_tipo_de_area
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_tipo_de_area') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_tipo_de_area' AND policyname = 'Public read access for dim_tipo_de_area') THEN
      ALTER TABLE public.dim_tipo_de_area ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_tipo_de_area"
      ON public.dim_tipo_de_area
      FOR SELECT
      USING (true);
    END IF;
  END IF;

  -- dim_tipo_de_crime
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dim_tipo_de_crime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dim_tipo_de_crime' AND policyname = 'Public read access for dim_tipo_de_crime') THEN
      ALTER TABLE public.dim_tipo_de_crime ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public read access for dim_tipo_de_crime"
      ON public.dim_tipo_de_crime
      FOR SELECT
      USING (true);
    END IF;
  END IF;
END $$;

-- 6. COMENTÁRIOS DE DOCUMENTAÇÃO
COMMENT ON POLICY "Authenticated users can view dim_especies_fauna" ON public.dim_especies_fauna IS 
'Protege dados sensíveis de espécies selvagens contra exploração por caçadores furtivos. Exige autenticação para visualização.';

COMMENT ON POLICY "Authenticated users can view fact_resumo_mensal_historico" ON public.fact_resumo_mensal_historico IS 
'Protege estatísticas históricas de resgates que revelam padrões operacionais. Exige autenticação para visualização.';

COMMENT ON POLICY "Authenticated users can view fact_recordes_apreensao" ON public.fact_recordes_apreensao IS 
'Protege registros de apreensões que podem revelar padrões de investigação. Exige autenticação para visualização.';
