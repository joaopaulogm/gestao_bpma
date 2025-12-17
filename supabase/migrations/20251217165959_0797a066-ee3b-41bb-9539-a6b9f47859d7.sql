-- Add imagens column to dim_especies_fauna table
ALTER TABLE public.dim_especies_fauna 
ADD COLUMN IF NOT EXISTS imagens text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.dim_especies_fauna.imagens IS 'Array of image filenames stored in imagens-fauna bucket';