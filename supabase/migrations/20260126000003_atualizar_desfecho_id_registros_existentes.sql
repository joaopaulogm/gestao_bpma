-- ============================================
-- ATUALIZAR desfecho_id PARA REGISTROS EXISTENTES
-- ============================================
-- Esta migration atualiza todos os registros em fat_registros_de_resgate
-- que têm desfecho_id NULL para o ID de "Resgatado" na tabela dim_desfecho_resgates
-- ============================================

BEGIN;

-- Buscar o ID de "Resgatado" na tabela dim_desfecho_resgates
DO $$
DECLARE
  v_resgatado_id uuid;
  v_registros_atualizados integer;
BEGIN
  -- Buscar o ID de "Resgatado"
  SELECT id INTO v_resgatado_id
  FROM public.dim_desfecho_resgates
  WHERE nome = 'Resgatado'
  LIMIT 1;
  
  -- Se não encontrar "Resgatado", criar
  IF v_resgatado_id IS NULL THEN
    INSERT INTO public.dim_desfecho_resgates (nome, tipo)
    VALUES ('Resgatado', 'resgate')
    ON CONFLICT (nome, tipo) DO NOTHING
    RETURNING id INTO v_resgatado_id;
    
    -- Se ainda não tiver ID, buscar novamente
    IF v_resgatado_id IS NULL THEN
      SELECT id INTO v_resgatado_id
      FROM public.dim_desfecho_resgates
      WHERE nome = 'Resgatado'
      LIMIT 1;
    END IF;
  END IF;
  
  -- Atualizar registros que têm desfecho_id NULL
  IF v_resgatado_id IS NOT NULL THEN
    UPDATE public.fat_registros_de_resgate
    SET desfecho_id = v_resgatado_id
    WHERE desfecho_id IS NULL;
    
    GET DIAGNOSTICS v_registros_atualizados = ROW_COUNT;
    
    RAISE NOTICE 'Atualizados % registros com desfecho_id = Resgatado', v_registros_atualizados;
  ELSE
    RAISE WARNING 'Não foi possível encontrar ou criar o desfecho "Resgatado"';
  END IF;
END $$;

COMMIT;
