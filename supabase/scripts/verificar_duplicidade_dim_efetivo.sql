-- =============================================================
-- Verificar duplicidade de linhas em dim_efetivo (por matrícula)
-- Execute no SQL Editor do Supabase para inspecionar duplicatas.
-- =============================================================

-- 1) Contar duplicatas por matrícula normalizada (apenas dígitos)
SELECT
  regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g') AS matricula_norm,
  COUNT(*) AS qtd_linhas,
  array_agg(id ORDER BY id) AS ids,
  array_agg(matricula ORDER BY id) AS matriculas_originais,
  array_agg(nome_guerra ORDER BY id) AS nomes_guerra
FROM public.dim_efetivo
WHERE trim(COALESCE(matricula, '')) <> ''
GROUP BY regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g')
HAVING COUNT(*) > 1
ORDER BY qtd_linhas DESC;

-- 2) Resumo: total de matrículas duplicadas e total de linhas a remover
SELECT
  COUNT(*) AS matricula_com_duplicata,
  SUM(qtd_linhas - 1) AS total_linhas_duplicadas_a_remover
FROM (
  SELECT regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g') AS mat_norm,
         COUNT(*) AS qtd_linhas
  FROM public.dim_efetivo
  WHERE trim(COALESCE(matricula, '')) <> ''
  GROUP BY regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g')
  HAVING COUNT(*) > 1
) t;

-- 3) Listar todas as linhas que são duplicata (para revisão)
WITH duplicatas AS (
  SELECT regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g') AS mat_norm
  FROM public.dim_efetivo
  WHERE trim(COALESCE(matricula, '')) <> ''
  GROUP BY regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g')
  HAVING COUNT(*) > 1
)
SELECT de.id, de.matricula, de.nome_guerra, de.nome, de.equipe, de.escala, de.grupamento
FROM public.dim_efetivo de
JOIN duplicatas d ON regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g') = d.mat_norm
ORDER BY regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g'), de.id;

-- =============================================================
-- GENÉRICO: verificar duplicidade em qualquer tabela por coluna(s)
-- Substitua schema.tabela e coluna(s) conforme necessário.
-- =============================================================

-- Exemplo: duplicatas por uma coluna (ex.: email)
-- SELECT coluna, COUNT(*) AS qtd
-- FROM schema.tabela
-- GROUP BY coluna
-- HAVING COUNT(*) > 1;

-- Exemplo: duplicatas por várias colunas (ex.: matricula + ano)
-- SELECT col1, col2, COUNT(*) AS qtd, array_agg(id) AS ids
-- FROM schema.tabela
-- GROUP BY col1, col2
-- HAVING COUNT(*) > 1;
