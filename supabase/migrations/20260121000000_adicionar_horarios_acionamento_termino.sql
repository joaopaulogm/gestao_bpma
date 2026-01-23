-- =====================================================
-- MIGRAÇÃO: Adicionar campos de horário de acionamento e término
-- Adiciona campos para registrar horários em formato brasileiro (HH:MM)
-- =====================================================

-- 1. Adicionar campos na tabela fat_registros_de_resgate
ALTER TABLE public.fat_registros_de_resgate
ADD COLUMN IF NOT EXISTS horario_acionamento TIME,
ADD COLUMN IF NOT EXISTS horario_termino TIME;

-- Comentários para documentação
COMMENT ON COLUMN public.fat_registros_de_resgate.horario_acionamento IS 'Horário de acionamento da ocorrência no formato HH:MM (24h)';
COMMENT ON COLUMN public.fat_registros_de_resgate.horario_termino IS 'Horário de término da ocorrência no formato HH:MM (24h)';

-- 2. Adicionar campos na tabela fat_registros_de_crime
ALTER TABLE public.fat_registros_de_crime
ADD COLUMN IF NOT EXISTS horario_acionamento TIME,
ADD COLUMN IF NOT EXISTS horario_termino TIME;

-- Comentários para documentação
COMMENT ON COLUMN public.fat_registros_de_crime.horario_acionamento IS 'Horário de acionamento da ocorrência no formato HH:MM (24h)';
COMMENT ON COLUMN public.fat_registros_de_crime.horario_termino IS 'Horário de término da ocorrência no formato HH:MM (24h)';
