-- Adicionar coluna para identificar se o animal foi identificado
ALTER TABLE fat_registros_de_resgate ADD COLUMN IF NOT EXISTS animal_identificado boolean DEFAULT true;