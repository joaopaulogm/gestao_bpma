-- ============================================
-- ATUALIZAR REGISTROS DE RESGATE PARA RAs ESPECÍFICAS DO PLANO PILOTO
-- ============================================
-- Esta migration atualiza os registros em fat_registros_de_resgate
-- que têm regiao_administrativa_id apontando para "Plano Piloto (RA I)"
-- para usar as novas RAs específicas (Asa Sul ou Asa Norte) baseado nas coordenadas
-- ============================================

BEGIN;

-- IDs das novas RAs (conforme fornecido pelo usuário)
-- Asa Sul: 0d4664d4-787f-499a-8807-7c4307bcc47f
-- Asa Norte: bf3667e5-7cd9-4fee-9d90-e20ae2084e41

-- Primeiro, encontrar o ID da RA antiga "Plano Piloto (RA I)" ou similar
DO $$
DECLARE
  ra_plano_piloto_antiga_id uuid;
  ra_asa_sul_id uuid := '0d4664d4-787f-499a-8807-7c4307bcc47f';
  ra_asa_norte_id uuid := 'bf3667e5-7cd9-4fee-9d90-e20ae2084e41';
  registros_atualizados_sul integer := 0;
  registros_atualizados_norte integer := 0;
  registros_sem_coordenadas integer := 0;
BEGIN
  -- Buscar ID da RA antiga "Plano Piloto"
  SELECT id INTO ra_plano_piloto_antiga_id
  FROM public.dim_regiao_administrativa
  WHERE nome ILIKE '%Plano Piloto%'
    AND nome NOT ILIKE '%Asa Sul%'
    AND nome NOT ILIKE '%Asa Norte%'
  LIMIT 1;

  IF ra_plano_piloto_antiga_id IS NULL THEN
    RAISE NOTICE 'RA antiga "Plano Piloto" não encontrada. Nada a atualizar.';
  ELSE
    RAISE NOTICE 'RA antiga encontrada: %', ra_plano_piloto_antiga_id;

    -- Atualizar registros baseado nas coordenadas
    -- Asa Sul: latitude < -15.8 (aproximadamente)
    -- Asa Norte: latitude >= -15.8 (aproximadamente)
    -- Nota: A divisão entre Asa Sul e Asa Norte no Plano Piloto é aproximadamente na latitude -15.8
    
    -- Atualizar para Asa Sul (coordenadas mais ao sul)
    UPDATE public.fat_registros_de_resgate
    SET regiao_administrativa_id = ra_asa_sul_id
    WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      AND latitude_origem IS NOT NULL
      AND latitude_origem != ''
      AND CAST(latitude_origem AS numeric) < -15.8;
    
    GET DIAGNOSTICS registros_atualizados_sul = ROW_COUNT;
    
    -- Atualizar para Asa Norte (coordenadas mais ao norte ou sem coordenadas válidas)
    UPDATE public.fat_registros_de_resgate
    SET regiao_administrativa_id = ra_asa_norte_id
    WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      AND (
        (latitude_origem IS NOT NULL AND latitude_origem != '' AND CAST(latitude_origem AS numeric) >= -15.8)
        OR latitude_origem IS NULL
        OR latitude_origem = ''
      );
    
    GET DIAGNOSTICS registros_atualizados_norte = ROW_COUNT;
    
    -- Contar registros sem coordenadas válidas
    SELECT COUNT(*) INTO registros_sem_coordenadas
    FROM public.fat_registros_de_resgate
    WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      AND (latitude_origem IS NULL OR latitude_origem = '' OR latitude_origem !~ '^-?[0-9]+\.?[0-9]*$');
    
    RAISE NOTICE 'Registros atualizados para Asa Sul: %', registros_atualizados_sul;
    RAISE NOTICE 'Registros atualizados para Asa Norte: %', registros_atualizados_norte;
    RAISE NOTICE 'Registros sem coordenadas válidas (atualizados para Asa Norte): %', registros_sem_coordenadas;
    
    -- Verificar se ainda há registros com a RA antiga
    IF EXISTS (
      SELECT 1 FROM public.fat_registros_de_resgate 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
    ) THEN
      RAISE WARNING 'Ainda existem registros com a RA antiga após atualização!';
    END IF;
  END IF;
END $$;

-- Deletar a RA antiga "Plano Piloto" se não houver mais referências
DO $$
DECLARE
  ra_plano_piloto_antiga_id uuid;
BEGIN
  -- Buscar ID da RA antiga
  SELECT id INTO ra_plano_piloto_antiga_id
  FROM public.dim_regiao_administrativa
  WHERE nome ILIKE '%Plano Piloto%'
    AND nome NOT ILIKE '%Asa Sul%'
    AND nome NOT ILIKE '%Asa Norte%'
  LIMIT 1;

  IF ra_plano_piloto_antiga_id IS NOT NULL THEN
    -- Verificar se ainda há referências
    IF NOT EXISTS (
      SELECT 1 FROM public.fat_registros_de_resgate 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      UNION
      SELECT 1 FROM public.fat_atividades_prevencao 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      UNION
      SELECT 1 FROM public.fat_crimes_comuns 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      UNION
      SELECT 1 FROM public.fat_registros_de_crime 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
    ) THEN
      -- Deletar a RA antiga
      DELETE FROM public.dim_regiao_administrativa
      WHERE id = ra_plano_piloto_antiga_id;
      
      RAISE NOTICE 'RA antiga "Plano Piloto" deletada com sucesso';
    ELSE
      RAISE WARNING 'RA antiga ainda possui referências. Não foi deletada.';
    END IF;
  END IF;
END $$;

COMMIT;
