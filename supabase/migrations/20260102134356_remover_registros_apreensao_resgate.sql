-- Remover registros de apreensão da tabela fat_registros_de_resgate
-- Esta migration exclui todos os registros que são de apreensão (não de resgate)

-- Primeiro, excluir registros relacionados na tabela fat_equipe_resgate
-- para registros de apreensão
DELETE FROM public.fat_equipe_resgate
WHERE registro_id IN (
  SELECT r.id
  FROM public.fat_registros_de_resgate r
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
  )
);

-- Agora excluir os registros de apreensão da tabela fat_registros_de_resgate
DELETE FROM public.fat_registros_de_resgate
WHERE (
  -- Verificar se o desfecho é do tipo 'apreensao'
  desfecho_id IN (
    SELECT id FROM public.dim_desfecho WHERE tipo = 'apreensao'
  )
  OR
  -- Verificar se a origem é 'Apreensão' ou 'Ação Policial' (renomeado)
  origem_id IN (
    SELECT id FROM public.dim_origem WHERE nome IN ('Apreensão', 'Ação Policial')
  )
);

-- Log da operação (comentário)
-- Esta migration remove todos os registros de apreensão que foram incorretamente
-- inseridos na tabela fat_registros_de_resgate. Registros de apreensão devem
-- estar apenas em fat_registros_de_crime ou fat_ocorrencia_apreensao.

