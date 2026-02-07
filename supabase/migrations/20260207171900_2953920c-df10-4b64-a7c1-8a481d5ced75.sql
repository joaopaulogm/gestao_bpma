
-- Corrigir FK desfecho_id: apontar para dim_desfecho_crime_ambientais em vez de dim_desfecho_resgates
ALTER TABLE public.fat_registros_de_crimes_ambientais
  DROP CONSTRAINT IF EXISTS fat_registros_de_crime_desfecho_id_fkey;

ALTER TABLE public.fat_registros_de_crimes_ambientais
  ADD CONSTRAINT fat_registros_de_crimes_ambientais_desfecho_id_fkey
  FOREIGN KEY (desfecho_id) REFERENCES public.dim_desfecho_crime_ambientais(id);
