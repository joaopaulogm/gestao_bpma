-- Novo valor do enum app_role: Operador de Rádio
-- Deve rodar em migration separada para poder ser usado nas policies (PostgreSQL exige commit do novo valor antes do uso).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operador_radio';
