-- ============================================
-- ATUALIZAR REGISTROS DE RESGATE PARA RAs ESPECÍFICAS DO PLANO PILOTO
-- ============================================
-- Esta migration atualiza os registros em fat_registros_de_resgate
-- e fat_resgates_diarios_YYYY que têm regiao_administrativa_id apontando 
-- para "Plano Piloto (RA I)" para usar as novas RAs específicas 
-- (Asa Sul ou Asa Norte) baseado nas coordenadas
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
  ano integer;
  tabela_nome text;
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

    -- Atualizar registros em fat_registros_de_resgate baseado nas coordenadas
    -- Asa Sul: latitude < -15.8 (aproximadamente)
    -- Asa Norte: latitude >= -15.8 (aproximadamente)
    -- Nota: A divisão entre Asa Sul e Asa Norte no Plano Piloto é aproximadamente na latitude -15.8
    
    -- Atualizar fat_registros_de_resgate para Asa Sul
    UPDATE public.fat_registros_de_resgate
    SET regiao_administrativa_id = ra_asa_sul_id
    WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      AND latitude_origem IS NOT NULL
      AND latitude_origem != ''
      AND CAST(latitude_origem AS numeric) < -15.8;
    
    GET DIAGNOSTICS registros_atualizados_sul = ROW_COUNT;
    
    -- Atualizar fat_registros_de_resgate para Asa Norte
    UPDATE public.fat_registros_de_resgate
    SET regiao_administrativa_id = ra_asa_norte_id
    WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      AND (
        (latitude_origem IS NOT NULL AND latitude_origem != '' AND CAST(latitude_origem AS numeric) >= -15.8)
        OR latitude_origem IS NULL
        OR latitude_origem = ''
      );
    
    GET DIAGNOSTICS registros_atualizados_norte = ROW_COUNT;
    
    -- Atualizar também as tabelas fat_resgates_diarios_YYYY (2020-2025)
    -- Como essas tabelas não têm coordenadas, vamos distribuir igualmente ou usar uma estratégia diferente
    -- Por padrão, vamos atualizar para Asa Norte (mais conservador)
    FOR ano IN 2020..2025 LOOP
      tabela_nome := 'fat_resgates_diarios_' || ano;
      
      -- Verificar se a tabela existe e tem a coluna regiao_administrativa_id
      IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = tabela_nome
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tabela_nome
        AND column_name = 'regiao_administrativa_id'
      ) THEN
        -- Atualizar para Asa Norte (sem coordenadas, usamos padrão conservador)
        BEGIN
          EXECUTE format('UPDATE %I.%I SET regiao_administrativa_id = $1 WHERE regiao_administrativa_id = $2', 
            'public', tabela_nome) 
          USING ra_asa_norte_id, ra_plano_piloto_antiga_id;
          
          RAISE NOTICE 'Tabela public.% atualizada', tabela_nome;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE WARNING 'Erro ao atualizar tabela public.%: %', tabela_nome, SQLERRM;
        END;
      ELSE
        RAISE NOTICE 'Tabela public.% não existe ou não tem coluna regiao_administrativa_id, pulando...', tabela_nome;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Registros atualizados para Asa Sul: %', registros_atualizados_sul;
    RAISE NOTICE 'Registros atualizados para Asa Norte: %', registros_atualizados_norte;
    
    -- Verificar se ainda há registros com a RA antiga
    IF EXISTS (
      SELECT 1 FROM public.fat_registros_de_resgate 
      WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
    ) THEN
      RAISE WARNING 'Ainda existem registros em fat_registros_de_resgate com a RA antiga após atualização!';
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
    -- Verificar se ainda há referências nas tabelas principais
    -- Verificar todas as tabelas que podem referenciar regiao_administrativa_id
    DECLARE
      tem_referencias boolean := false;
      ano integer;
      tabela_nome text;
    BEGIN
      -- Verificar fat_registros_de_resgate
      IF EXISTS (
        SELECT 1 FROM public.fat_registros_de_resgate 
        WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      ) THEN
        tem_referencias := true;
      END IF;
      
      -- Verificar fat_atividades_prevencao
      IF NOT tem_referencias AND EXISTS (
        SELECT 1 FROM public.fat_atividades_prevencao 
        WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      ) THEN
        tem_referencias := true;
      END IF;
      
      -- Verificar fat_crimes_comuns
      IF NOT tem_referencias AND EXISTS (
        SELECT 1 FROM public.fat_crimes_comuns 
        WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      ) THEN
        tem_referencias := true;
      END IF;
      
      -- Verificar fat_registros_de_crimes_ambientais
      IF NOT tem_referencias AND EXISTS (
        SELECT 1 FROM public.fat_registros_de_crimes_ambientais 
        WHERE regiao_administrativa_id = ra_plano_piloto_antiga_id
      ) THEN
        tem_referencias := true;
      END IF;
      
      -- Verificar fat_resgates_diarios_YYYY (2020-2025)
      IF NOT tem_referencias THEN
        FOR ano IN 2020..2025 LOOP
          tabela_nome := 'fat_resgates_diarios_' || ano;
          
          IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tabela_nome
          ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = tabela_nome
            AND column_name = 'regiao_administrativa_id'
          ) THEN
            BEGIN
              EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I.%I WHERE regiao_administrativa_id = $1)', 
                'public', tabela_nome)
              INTO tem_referencias
              USING ra_plano_piloto_antiga_id;
              
              IF tem_referencias THEN
                EXIT;
              END IF;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE WARNING 'Erro ao verificar tabela public.%: %', tabela_nome, SQLERRM;
            END;
          END IF;
        END LOOP;
      END IF;
      
      IF NOT tem_referencias THEN
        -- Deletar a RA antiga apenas se não houver referências
        DELETE FROM public.dim_regiao_administrativa
        WHERE id = ra_plano_piloto_antiga_id;
        
        RAISE NOTICE 'RA antiga "Plano Piloto" deletada com sucesso';
      ELSE
        RAISE WARNING 'RA antiga ainda possui referências nas tabelas principais. Não foi deletada.';
      END IF;
    END;
  END IF;
END $$;

COMMIT;
