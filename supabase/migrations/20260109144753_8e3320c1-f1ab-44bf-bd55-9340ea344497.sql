-- Inserir dados de 2025 na tabela de resumo mensal
-- Por enquanto, usar dados zerados até a planilha ser importada corretamente
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos)
SELECT 2025, m.mes, 0, 0, 0, 0, 0, 0
FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS m(mes)
WHERE NOT EXISTS (SELECT 1 FROM fact_resumo_mensal_historico WHERE ano = 2025 AND mes = m.mes);