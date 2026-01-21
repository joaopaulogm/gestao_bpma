-- Adicionar colunas faltantes na tabela fat_registros_de_resgate
ALTER TABLE public.fat_registros_de_resgate 
ADD COLUMN IF NOT EXISTS horario_acionamento TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS horario_termino TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS numero_tco TEXT;

-- Adicionar colunas faltantes na tabela fat_resgates_diarios_2025
ALTER TABLE public.fat_resgates_diarios_2025 
ADD COLUMN IF NOT EXISTS horario_acionamento TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS horario_termino TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS numero_tco TEXT;

-- Adicionar comentários às colunas
COMMENT ON COLUMN public.fat_registros_de_resgate.horario_acionamento IS 'Horário de acionamento da ocorrência';
COMMENT ON COLUMN public.fat_registros_de_resgate.horario_termino IS 'Horário de término da ocorrência';
COMMENT ON COLUMN public.fat_registros_de_resgate.numero_tco IS 'Número do TCO quando aplicável para apreensões';

COMMENT ON COLUMN public.fat_resgates_diarios_2025.horario_acionamento IS 'Horário de acionamento da ocorrência';
COMMENT ON COLUMN public.fat_resgates_diarios_2025.horario_termino IS 'Horário de término da ocorrência';
COMMENT ON COLUMN public.fat_resgates_diarios_2025.numero_tco IS 'Número do TCO quando aplicável para apreensões';