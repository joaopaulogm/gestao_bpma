-- Drop the existing enum and recreate with new roles
-- First, we need to update the enum type with new values

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secao_operacional';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secao_pessoas';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secao_logistica';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'publico';