-- Add foreign key relationship between flora and dim_especies_flora
ALTER TABLE public.flora
ADD CONSTRAINT fk_flora_dim_especie_flora
FOREIGN KEY (id_dim_especie_flora)
REFERENCES public.dim_especies_flora(id)
ON DELETE SET NULL;

-- Add nomes_populares array column to dim_especies_fauna for multiple popular names
ALTER TABLE public.dim_especies_fauna
ADD COLUMN IF NOT EXISTS nomes_populares text[] DEFAULT '{}';

-- Add nomes_populares array column to dim_especies_flora for multiple popular names
ALTER TABLE public.dim_especies_flora
ADD COLUMN IF NOT EXISTS nomes_populares text[] DEFAULT '{}';