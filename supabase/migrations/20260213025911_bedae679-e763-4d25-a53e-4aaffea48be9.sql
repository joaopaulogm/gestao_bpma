-- Fix ref_regiao_administrativa to match dim_regiao_administrativa for Recanto das Emas
UPDATE public.ref_regiao_administrativa
SET nome = 'Recanto das Emas (RA XV)'
WHERE nome = 'Recanto das Emas (XV)';

-- Also update dim_regiao_administrativa if needed (sync both ways)
-- Check if there are any other mismatches and fix them
UPDATE public.ref_regiao_administrativa
SET nome = dim.nome
FROM public.dim_regiao_administrativa dim
WHERE SPLIT_PART(ref_regiao_administrativa.nome, ' (', 1) = SPLIT_PART(dim.nome, ' (', 1)
  AND ref_regiao_administrativa.nome != dim.nome
  AND dim.nome LIKE '%(RA %';