-- ============================================
-- ADICIONAR CAMPO PROCESSO SEI À TABELA FAT_FERIAS
-- ============================================
-- Adiciona campo para armazenar o número do processo SEI-GDF
-- que parcelou ou reprogramou as férias
-- ============================================

BEGIN;

-- Adicionar coluna numero_processo_sei à tabela fat_ferias
ALTER TABLE public.fat_ferias
ADD COLUMN IF NOT EXISTS numero_processo_sei text;

-- Comentário para documentação
COMMENT ON COLUMN public.fat_ferias.numero_processo_sei IS 'Número do processo eletrônico SEI-GDF que parcelou ou reprogramou as férias';

COMMIT;
