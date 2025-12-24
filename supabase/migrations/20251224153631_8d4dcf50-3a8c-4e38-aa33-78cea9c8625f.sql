-- Add foreign key relationship between fauna and dim_especies_fauna
ALTER TABLE public.fauna
ADD CONSTRAINT fk_fauna_dim_especie_fauna
FOREIGN KEY (id_dim_especie_fauna)
REFERENCES public.dim_especies_fauna(id)
ON DELETE SET NULL;