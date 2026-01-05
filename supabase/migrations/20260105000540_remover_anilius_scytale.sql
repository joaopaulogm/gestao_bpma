-- Remover a espécie Anilius scytale da tabela dim_especies_fauna
-- Esta espécie não ocorre na região

DELETE FROM public.dim_especies_fauna
WHERE nome_cientifico = 'Anilius scytale'
   OR nome_cientifico ILIKE 'Anilius scytale%';

-- Verificar quantos registros foram removidos
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Registros removidos: %', deleted_count;
END $$;

