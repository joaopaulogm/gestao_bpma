-- ============================================
-- Crimes Ambientais: FK desfecho_id deve referenciar dim_desfecho_crime_ambientais
-- ============================================
-- O formulário de Crimes Ambientais usa desfechos de dim_desfecho_crime_ambientais.
-- A FK atual aponta para dim_desfecho(id), causando violação ao inserir.
-- ============================================

BEGIN;

-- Remover a FK antiga (nome pode ser fat_registros_de_crime_desfecho_id_fkey mesmo com tabela renomeada)
ALTER TABLE public.fat_registros_de_crimes_ambientais
  DROP CONSTRAINT IF EXISTS fat_registros_de_crime_desfecho_id_fkey;

ALTER TABLE public.fat_registros_de_crimes_ambientais
  DROP CONSTRAINT IF EXISTS fat_registros_de_crimes_ambientais_desfecho_id_fkey;

-- Nova FK para dim_desfecho_crime_ambientais (tabela usada pelo formulário)
ALTER TABLE public.fat_registros_de_crimes_ambientais
  ADD CONSTRAINT fat_registros_de_crimes_ambientais_desfecho_id_fkey
  FOREIGN KEY (desfecho_id) REFERENCES public.dim_desfecho_crime_ambientais(id);

COMMIT;
