-- Adicionar coluna situacao ao dim_tgrl
ALTER TABLE public.dim_tgrl ADD COLUMN IF NOT EXISTS situacao TEXT DEFAULT 'NÃO SE APLICA';