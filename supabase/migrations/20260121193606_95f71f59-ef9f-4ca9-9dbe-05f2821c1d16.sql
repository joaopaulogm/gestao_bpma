-- Adicionar colunas de horário na tabela fat_registros_de_crime (Crimes Ambientais)
ALTER TABLE public.fat_registros_de_crime 
ADD COLUMN IF NOT EXISTS horario_acionamento TIME,
ADD COLUMN IF NOT EXISTS horario_desfecho TIME;

-- Adicionar colunas de horário na tabela fat_crimes_comuns (Crimes Comuns)
ALTER TABLE public.fat_crimes_comuns 
ADD COLUMN IF NOT EXISTS horario_acionamento TIME,
ADD COLUMN IF NOT EXISTS horario_desfecho TIME;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.fat_registros_de_crime.horario_acionamento IS 'Horário do acionamento/início da ocorrência (formato 24h - fuso Brasília)';
COMMENT ON COLUMN public.fat_registros_de_crime.horario_desfecho IS 'Horário do desfecho/término da ocorrência (formato 24h - fuso Brasília)';
COMMENT ON COLUMN public.fat_crimes_comuns.horario_acionamento IS 'Horário do acionamento/início da ocorrência (formato 24h - fuso Brasília)';
COMMENT ON COLUMN public.fat_crimes_comuns.horario_desfecho IS 'Horário do desfecho/término da ocorrência (formato 24h - fuso Brasília)';