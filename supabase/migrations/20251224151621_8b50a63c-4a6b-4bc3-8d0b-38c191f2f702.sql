-- Create foreign key relationship between fat_registros_de_resgate and dim_especies_fauna
ALTER TABLE public.fat_registros_de_resgate
ADD CONSTRAINT fk_registros_especie
FOREIGN KEY (especie_id)
REFERENCES public.dim_especies_fauna(id)
ON DELETE SET NULL;