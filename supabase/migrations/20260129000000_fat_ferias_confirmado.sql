-- ============================================
-- ADICIONAR COLUNA CONFIRMADO À TABELA FAT_FERIAS
-- ============================================
-- Férias confirmadas (ON) aparecem na minuta; apenas com processo SEI e datas confirmadas.
-- ============================================

BEGIN;

ALTER TABLE public.fat_ferias
ADD COLUMN IF NOT EXISTS confirmado boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.fat_ferias.confirmado IS 'Férias confirmadas: só entram na minuta quando ON e com processo SEI';

COMMIT;
