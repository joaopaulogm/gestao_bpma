-- ============================================
-- INICIALIZAÇÃO DAS VIEWS MATERIALIZADAS
-- ============================================
-- Esta migration inicializa todas as views materializadas pela primeira vez

-- Inicializar todas as views
REFRESH MATERIALIZED VIEW public.mv_estatisticas_resgates;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_crimes;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_apreensoes;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_periodo;
REFRESH MATERIALIZED VIEW public.mv_top_especies_resgatadas;
REFRESH MATERIALIZED VIEW public.mv_distribuicao_classe;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_regiao;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_destinacao;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_atropelamentos;
REFRESH MATERIALIZED VIEW public.mv_estatisticas_equipes;

-- Marcar todas as views como atualizadas
DELETE FROM public.view_refresh_queue;
INSERT INTO public.view_refresh_queue (view_name, needs_refresh, last_refreshed)
VALUES 
  ('mv_estatisticas_resgates', false, now()),
  ('mv_estatisticas_crimes', false, now()),
  ('mv_estatisticas_apreensoes', false, now()),
  ('mv_estatisticas_periodo', false, now()),
  ('mv_top_especies_resgatadas', false, now()),
  ('mv_distribuicao_classe', false, now()),
  ('mv_estatisticas_regiao', false, now()),
  ('mv_estatisticas_destinacao', false, now()),
  ('mv_estatisticas_atropelamentos', false, now()),
  ('mv_estatisticas_equipes', false, now())
ON CONFLICT DO NOTHING;

