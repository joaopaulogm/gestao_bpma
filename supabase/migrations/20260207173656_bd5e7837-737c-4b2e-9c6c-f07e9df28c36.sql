-- Remove CHECK constraints de telefone que bloqueiam importação de planilha
ALTER TABLE public.fat_controle_ocorrencias_resgate_2026
  DROP CONSTRAINT IF EXISTS telefone_resgate_chk;

ALTER TABLE public.fat_controle_ocorrencias_crime_ambientais_2026
  DROP CONSTRAINT IF EXISTS telefone_crime_chk;