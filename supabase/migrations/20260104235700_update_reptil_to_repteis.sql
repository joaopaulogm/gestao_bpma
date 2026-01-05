-- Atualizar todas as ocorrências de 'REPTIL' para 'RÉPTEIS' na tabela dim_especies_fauna
-- Padronizar a nomenclatura da classe taxonômica

UPDATE public.dim_especies_fauna
SET classe_taxonomica = 'RÉPTEIS'
WHERE classe_taxonomica = 'REPTIL'
   OR classe_taxonomica = 'Réptil'
   OR classe_taxonomica = 'réptil'
   OR classe_taxonomica = 'REPTEIS'
   OR classe_taxonomica = 'Repteis'
   OR classe_taxonomica = 'repteis'
   OR classe_taxonomica = 'RÉPTIL';

-- Verificar quantos registros foram atualizados
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Registros atualizados: %', updated_count;
END $$;

