-- Remover Liophis typhlus da tabela dim_especies_fauna
-- Erythrolamprus typhlus é o nome científico atualizado e deve ser mantido
-- Liophis typhlus é sinônimo antigo e deve ser removido

DELETE FROM public.dim_especies_fauna
WHERE nome_cientifico = 'Liophis typhlus'
   OR nome_cientifico ILIKE 'Liophis typhlus%';

-- Verificar quantos registros foram removidos
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Registros de Liophis typhlus removidos: %', deleted_count;
END $$;

-- Verificar se Erythrolamprus typhlus existe
DO $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM public.dim_especies_fauna
  WHERE nome_cientifico = 'Erythrolamprus typhlus'
     OR nome_cientifico ILIKE 'Erythrolamprus typhlus%';
  
  RAISE NOTICE 'Registros de Erythrolamprus typhlus encontrados: %', exists_count;
END $$;

