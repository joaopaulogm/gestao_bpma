-- Add minuta date and observation fields to fat_ferias
ALTER TABLE public.fat_ferias 
ADD COLUMN IF NOT EXISTS minuta_data_inicio date,
ADD COLUMN IF NOT EXISTS minuta_data_fim date,
ADD COLUMN IF NOT EXISTS minuta_observacao text;

-- Add minuta date and observation fields to fat_abono
ALTER TABLE public.fat_abono 
ADD COLUMN IF NOT EXISTS data_inicio date,
ADD COLUMN IF NOT EXISTS data_fim date,
ADD COLUMN IF NOT EXISTS minuta_observacao text;

-- Add comments for documentation
COMMENT ON COLUMN public.fat_ferias.minuta_data_inicio IS 'Data de início das férias definida na minuta';
COMMENT ON COLUMN public.fat_ferias.minuta_data_fim IS 'Data de término das férias definida na minuta';
COMMENT ON COLUMN public.fat_ferias.minuta_observacao IS 'Observações/justificativa para a minuta de férias';

COMMENT ON COLUMN public.fat_abono.data_inicio IS 'Data de início do abono definida na minuta';
COMMENT ON COLUMN public.fat_abono.data_fim IS 'Data de término do abono definida na minuta';
COMMENT ON COLUMN public.fat_abono.minuta_observacao IS 'Observações/justificativa para a minuta de abono';