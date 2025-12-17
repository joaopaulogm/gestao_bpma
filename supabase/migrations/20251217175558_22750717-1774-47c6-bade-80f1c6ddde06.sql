-- Add imagens column to dim_especies_flora table
ALTER TABLE public.dim_especies_flora 
ADD COLUMN IF NOT EXISTS imagens text[] DEFAULT '{}';