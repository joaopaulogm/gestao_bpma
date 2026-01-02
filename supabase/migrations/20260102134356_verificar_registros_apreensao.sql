-- Script de verificação: contar quantos registros de apreensão existem
-- Execute este script ANTES da migration de exclusão para verificar o impacto

-- Contar registros de apreensão que serão excluídos
SELECT 
  COUNT(*) as total_registros_apreensao,
  COUNT(DISTINCT r.id) as registros_unicos,
  COUNT(DISTINCT e.registro_id) as registros_com_equipe
FROM public.fat_registros_de_resgate r
LEFT JOIN public.fat_equipe_resgate e ON e.registro_id = r.id
WHERE (
  -- Verificar se o desfecho é do tipo 'apreensao'
  r.desfecho_id IN (
    SELECT id FROM public.dim_desfecho WHERE tipo = 'apreensao'
  )
  OR
  -- Verificar se a origem é 'Apreensão' ou 'Ação Policial' (renomeado)
  r.origem_id IN (
    SELECT id FROM public.dim_origem WHERE nome IN ('Apreensão', 'Ação Policial')
  )
);

-- Mostrar alguns exemplos dos registros que serão excluídos
SELECT 
  r.id,
  r.data,
  r.created_at,
  o.nome as origem,
  d.nome as desfecho,
  d.tipo as tipo_desfecho,
  e.nome as especie
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_origem o ON o.id = r.origem_id
LEFT JOIN public.dim_desfecho d ON d.id = r.desfecho_id
LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
WHERE (
  r.desfecho_id IN (
    SELECT id FROM public.dim_desfecho WHERE tipo = 'apreensao'
  )
  OR
  r.origem_id IN (
    SELECT id FROM public.dim_origem WHERE nome IN ('Apreensão', 'Ação Policial')
  )
)
ORDER BY r.created_at DESC
LIMIT 10;

