-- ============================================
-- ADICIONAR COLUNAS FALTANTES E IMPORTAR DADOS
-- ============================================

-- 1. Adicionar coluna responsavel
ALTER TABLE public.dim_frota 
ADD COLUMN IF NOT EXISTS tombamento TEXT,
ADD COLUMN IF NOT EXISTS emprego TEXT,
ADD COLUMN IF NOT EXISTS motivo_baixa TEXT,
ADD COLUMN IF NOT EXISTS tombamento_kit_sinalizador TEXT,
ADD COLUMN IF NOT EXISTS tombamento_radio TEXT,
ADD COLUMN IF NOT EXISTS numero_serie_radio TEXT,
ADD COLUMN IF NOT EXISTS modelo_pneu TEXT,
ADD COLUMN IF NOT EXISTS data_troca_pneu DATE,
ADD COLUMN IF NOT EXISTS km_proxima_troca_pneu INTEGER,
ADD COLUMN IF NOT EXISTS km_proxima_revisao INTEGER,
ADD COLUMN IF NOT EXISTS responsavel TEXT;

-- 2. Atualizar estrutura dim_tgrl para refletir planilha
ALTER TABLE public.dim_tgrl
ADD COLUMN IF NOT EXISTS subitem TEXT,
ADD COLUMN IF NOT EXISTS chassi_serie TEXT;

-- Remover coluna numero_serie se existir e adicionar chassi_serie
ALTER TABLE public.dim_tgrl DROP COLUMN IF EXISTS numero_serie;

-- 3. LIMPAR DADOS DE EXEMPLO
DELETE FROM public.dim_frota WHERE prefixo LIKE 'BPMA-%';
DELETE FROM public.dim_tgrl WHERE tombamento LIKE 'TGRL-%';