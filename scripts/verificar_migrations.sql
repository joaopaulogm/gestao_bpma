-- ============================================
-- VERIFICAÇÃO DAS MIGRATIONS EXECUTADAS
-- ============================================
-- Execute estas queries no SQL Editor para verificar

-- 1. Verificar dim_tempo (deve retornar 72 registros)
SELECT COUNT(*) as total_tempo FROM dim_tempo;
-- Esperado: 72 (6 anos × 12 meses)

-- 2. Verificar dim_indicador_bpma (deve retornar ~234 registros)
SELECT COUNT(*) as total_indicadores FROM dim_indicador_bpma;
-- Esperado: ~234

-- 3. Verificar fact_indicador_mensal_bpma (deve retornar ~6.239 registros)
SELECT COUNT(*) as total_fact_indicador FROM fact_indicador_mensal_bpma;
-- Esperado: ~6.239

-- 4. Verificar fact_resgate_fauna_especie_mensal (deve retornar ~3.520 registros)
SELECT COUNT(*) as total_fact_resgate FROM fact_resgate_fauna_especie_mensal;
-- Esperado: ~3.520

-- 5. Verificar alguns dados de exemplo
SELECT 
    dt.ano,
    dt.mes_abreviacao,
    dib.nome,
    fib.valor
FROM fact_indicador_mensal_bpma fib
JOIN dim_tempo dt ON fib.tempo_id = dt.id
JOIN dim_indicador_bpma dib ON fib.indicador_id = dib.id
WHERE dib.id = 'quantidade_de_resgate'
ORDER BY dt.ano DESC, dt.mes DESC
LIMIT 10;

-- 6. Verificar resgates de fauna
SELECT 
    dt.ano,
    dt.mes_abreviacao,
    frf.nome_cientifico,
    frf.nome_popular,
    frf.quantidade
FROM fact_resgate_fauna_especie_mensal frf
JOIN dim_tempo dt ON frf.tempo_id = dt.id
ORDER BY dt.ano DESC, dt.mes DESC, frf.quantidade DESC
LIMIT 10;

