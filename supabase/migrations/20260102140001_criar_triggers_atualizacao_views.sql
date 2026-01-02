-- ============================================
-- SISTEMA DE ATUALIZAÇÃO DE VIEWS MATERIALIZADAS
-- ============================================
-- Como views materializadas não podem ser atualizadas em triggers,
-- criamos uma tabela de controle e função para atualização manual/agendada

-- Tabela de controle para marcar quando views precisam ser atualizadas
CREATE TABLE IF NOT EXISTS public.view_refresh_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_name text NOT NULL,
  needs_refresh boolean DEFAULT true,
  last_refreshed timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_view_refresh_queue_needs_refresh ON public.view_refresh_queue(needs_refresh) WHERE needs_refresh = true;

-- Função para marcar views que precisam ser atualizadas
CREATE OR REPLACE FUNCTION public.mark_views_for_refresh()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar todas as views relacionadas para atualização
  INSERT INTO public.view_refresh_queue (view_name, needs_refresh)
  VALUES 
    ('mv_estatisticas_resgates', true),
    ('mv_estatisticas_periodo', true),
    ('mv_top_especies_resgatadas', true),
    ('mv_distribuicao_classe', true),
    ('mv_estatisticas_regiao', true),
    ('mv_estatisticas_destinacao', true),
    ('mv_estatisticas_atropelamentos', true),
    ('mv_estatisticas_equipes', true)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar views de crimes
CREATE OR REPLACE FUNCTION public.mark_views_crimes_for_refresh()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.view_refresh_queue (view_name, needs_refresh)
  VALUES 
    ('mv_estatisticas_crimes', true),
    ('mv_estatisticas_apreensoes', true),
    ('mv_estatisticas_equipes', true)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar views de apreensões
CREATE OR REPLACE FUNCTION public.mark_views_apreensoes_for_refresh()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.view_refresh_queue (view_name, needs_refresh)
  VALUES 
    ('mv_estatisticas_apreensoes', true),
    ('mv_estatisticas_crimes', true)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar views de equipes
CREATE OR REPLACE FUNCTION public.mark_views_equipes_for_refresh()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.view_refresh_queue (view_name, needs_refresh)
  VALUES ('mv_estatisticas_equipes', true)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar views marcadas (chamada manualmente ou por cron)
CREATE OR REPLACE FUNCTION public.refresh_pending_views()
RETURNS void AS $$
DECLARE
  view_record RECORD;
BEGIN
  -- Atualizar views únicas que precisam de refresh
  FOR view_record IN 
    SELECT DISTINCT view_name 
    FROM public.view_refresh_queue 
    WHERE needs_refresh = true
  LOOP
    BEGIN
      EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY %I', view_record.view_name);
      
      -- Marcar como atualizada
      UPDATE public.view_refresh_queue
      SET needs_refresh = false,
          last_refreshed = now()
      WHERE view_name = view_record.view_name AND needs_refresh = true;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log erro mas continue
        RAISE WARNING 'Erro ao atualizar view %: %', view_record.view_name, SQLERRM;
    END;
  END LOOP;
  
  -- Limpar registros antigos (mais de 1 dia)
  DELETE FROM public.view_refresh_queue
  WHERE last_refreshed IS NOT NULL 
    AND last_refreshed < now() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar views de crimes
CREATE OR REPLACE FUNCTION public.refresh_views_crimes()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar views relacionadas a crimes
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_crimes;
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_apreensoes;
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_equipes;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar views de apreensões
CREATE OR REPLACE FUNCTION public.refresh_views_apreensoes()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar views relacionadas a apreensões
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_apreensoes;
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_crimes;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar views de equipes
CREATE OR REPLACE FUNCTION public.refresh_views_equipes()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar views relacionadas a equipes
  REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS public.mv_estatisticas_equipes;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para fat_registros_de_resgate
CREATE TRIGGER trigger_mark_views_resgate_insert
AFTER INSERT ON public.fat_registros_de_resgate
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_for_refresh();

CREATE TRIGGER trigger_mark_views_resgate_update
AFTER UPDATE ON public.fat_registros_de_resgate
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_for_refresh();

CREATE TRIGGER trigger_mark_views_resgate_delete
AFTER DELETE ON public.fat_registros_de_resgate
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_for_refresh();

-- Triggers para fat_registros_de_crime
CREATE TRIGGER trigger_mark_views_crime_insert
AFTER INSERT ON public.fat_registros_de_crime
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_update
AFTER UPDATE ON public.fat_registros_de_crime
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_delete
AFTER DELETE ON public.fat_registros_de_crime
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

-- Triggers para fat_ocorrencia_apreensao
CREATE TRIGGER trigger_mark_views_apreensao_insert
AFTER INSERT ON public.fat_ocorrencia_apreensao
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_apreensoes_for_refresh();

CREATE TRIGGER trigger_mark_views_apreensao_update
AFTER UPDATE ON public.fat_ocorrencia_apreensao
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_apreensoes_for_refresh();

CREATE TRIGGER trigger_mark_views_apreensao_delete
AFTER DELETE ON public.fat_ocorrencia_apreensao
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_apreensoes_for_refresh();

-- Triggers para fat_equipe_resgate
CREATE TRIGGER trigger_mark_views_equipe_resgate_insert
AFTER INSERT ON public.fat_equipe_resgate
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_equipes_for_refresh();

CREATE TRIGGER trigger_mark_views_equipe_resgate_delete
AFTER DELETE ON public.fat_equipe_resgate
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_equipes_for_refresh();

-- Triggers para fat_equipe_crime
CREATE TRIGGER trigger_mark_views_equipe_crime_insert
AFTER INSERT ON public.fat_equipe_crime
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_equipes_for_refresh();

CREATE TRIGGER trigger_mark_views_equipe_crime_delete
AFTER DELETE ON public.fat_equipe_crime
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_equipes_for_refresh();

-- Triggers para fat_crime_fauna
CREATE TRIGGER trigger_mark_views_crime_fauna_insert
AFTER INSERT ON public.fat_crime_fauna
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_fauna_update
AFTER UPDATE ON public.fat_crime_fauna
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_fauna_delete
AFTER DELETE ON public.fat_crime_fauna
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

-- Triggers para fat_crime_flora
CREATE TRIGGER trigger_mark_views_crime_flora_insert
AFTER INSERT ON public.fat_crime_flora
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_flora_update
AFTER UPDATE ON public.fat_crime_flora
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

CREATE TRIGGER trigger_mark_views_crime_flora_delete
AFTER DELETE ON public.fat_crime_flora
FOR EACH ROW
EXECUTE FUNCTION public.mark_views_crimes_for_refresh();

-- Comentários
COMMENT ON TABLE public.view_refresh_queue IS 'Fila de views materializadas que precisam ser atualizadas';
COMMENT ON FUNCTION public.mark_views_for_refresh() IS 'Marca views de resgates para atualização';
COMMENT ON FUNCTION public.mark_views_crimes_for_refresh() IS 'Marca views de crimes para atualização';
COMMENT ON FUNCTION public.mark_views_apreensoes_for_refresh() IS 'Marca views de apreensões para atualização';
COMMENT ON FUNCTION public.mark_views_equipes_for_refresh() IS 'Marca views de equipes para atualização';
COMMENT ON FUNCTION public.refresh_pending_views() IS 'Atualiza todas as views materializadas marcadas para refresh';

