-- Atualizar fact_resumo_mensal_historico com dados corretos de 2025
UPDATE fact_resumo_mensal_historico SET resgates = 198, solturas = 59, obitos = 0, feridos = 32, atropelamentos = 0, filhotes = 8 WHERE ano = 2025 AND mes = 1;
UPDATE fact_resumo_mensal_historico SET resgates = 195, solturas = 63, obitos = 1, feridos = 51, atropelamentos = 0, filhotes = 19 WHERE ano = 2025 AND mes = 2;
UPDATE fact_resumo_mensal_historico SET resgates = 124, solturas = 27, obitos = 0, feridos = 62, atropelamentos = 0, filhotes = 0 WHERE ano = 2025 AND mes = 3;
UPDATE fact_resumo_mensal_historico SET resgates = 117, solturas = 34, obitos = 0, feridos = 21, atropelamentos = 0, filhotes = 11 WHERE ano = 2025 AND mes = 4;
UPDATE fact_resumo_mensal_historico SET resgates = 135, solturas = 34, obitos = 0, feridos = 70, atropelamentos = 0, filhotes = 0 WHERE ano = 2025 AND mes = 5;
UPDATE fact_resumo_mensal_historico SET resgates = 114, solturas = 21, obitos = 1, feridos = 20, atropelamentos = 0, filhotes = 11 WHERE ano = 2025 AND mes = 6;
UPDATE fact_resumo_mensal_historico SET resgates = 168, solturas = 33, obitos = 5, feridos = 21, atropelamentos = 1, filhotes = 0 WHERE ano = 2025 AND mes = 7;
UPDATE fact_resumo_mensal_historico SET resgates = 165, solturas = 40, obitos = 0, feridos = 32, atropelamentos = 0, filhotes = 14 WHERE ano = 2025 AND mes = 8;
UPDATE fact_resumo_mensal_historico SET resgates = 209, solturas = 32, obitos = 0, feridos = 20, atropelamentos = 0, filhotes = 60 WHERE ano = 2025 AND mes = 9;
UPDATE fact_resumo_mensal_historico SET resgates = 373, solturas = 72, obitos = 4, feridos = 107, atropelamentos = 0, filhotes = 37 WHERE ano = 2025 AND mes = 10;
UPDATE fact_resumo_mensal_historico SET resgates = 362, solturas = 185, obitos = 5, feridos = 11, atropelamentos = 0, filhotes = 41 WHERE ano = 2025 AND mes = 11;
UPDATE fact_resumo_mensal_historico SET resgates = 327, solturas = 139, obitos = 1, feridos = 93, atropelamentos = 0, filhotes = 22 WHERE ano = 2025 AND mes = 12;

-- Inserir indicadores operacionais para 2025 em fact_indicador_mensal_bpma
-- Limpar dados existentes de 2025 primeiro
DELETE FROM fact_indicador_mensal_bpma WHERE tempo_id BETWEEN 202501 AND 202512;

-- Atendimentos registrados
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('atendimentos_registrados', 202501, 310),
('atendimentos_registrados', 202502, 384),
('atendimentos_registrados', 202503, 272),
('atendimentos_registrados', 202504, 328),
('atendimentos_registrados', 202505, 320),
('atendimentos_registrados', 202506, 289),
('atendimentos_registrados', 202507, 357),
('atendimentos_registrados', 202508, 367),
('atendimentos_registrados', 202509, 424),
('atendimentos_registrados', 202510, 512),
('atendimentos_registrados', 202511, 496),
('atendimentos_registrados', 202512, 564);

-- Termos Circunstanciados de Ocorrência - PMDF
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('termos_circunstanciados_de_ocorrencia_pmdf', 202501, 7),
('termos_circunstanciados_de_ocorrencia_pmdf', 202502, 14),
('termos_circunstanciados_de_ocorrencia_pmdf', 202503, 13),
('termos_circunstanciados_de_ocorrencia_pmdf', 202504, 7),
('termos_circunstanciados_de_ocorrencia_pmdf', 202505, 7),
('termos_circunstanciados_de_ocorrencia_pmdf', 202506, 12),
('termos_circunstanciados_de_ocorrencia_pmdf', 202507, 9),
('termos_circunstanciados_de_ocorrencia_pmdf', 202508, 7),
('termos_circunstanciados_de_ocorrencia_pmdf', 202509, 9),
('termos_circunstanciados_de_ocorrencia_pmdf', 202510, 8),
('termos_circunstanciados_de_ocorrencia_pmdf', 202511, 5),
('termos_circunstanciados_de_ocorrencia_pmdf', 202512, 6);

-- Termos Circunstanciados - OUTRAS
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('termos_circunstanciados_outras', 202501, 0),
('termos_circunstanciados_outras', 202502, 3),
('termos_circunstanciados_outras', 202503, 0),
('termos_circunstanciados_outras', 202504, 0),
('termos_circunstanciados_outras', 202505, 0),
('termos_circunstanciados_outras', 202506, 0),
('termos_circunstanciados_outras', 202507, 0),
('termos_circunstanciados_outras', 202508, 0),
('termos_circunstanciados_outras', 202509, 3),
('termos_circunstanciados_outras', 202510, 0),
('termos_circunstanciados_outras', 202511, 0),
('termos_circunstanciados_outras', 202512, 11);

-- Em apuração
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('em_apuracao', 202501, 0),
('em_apuracao', 202502, 0),
('em_apuracao', 202503, 2),
('em_apuracao', 202504, 1),
('em_apuracao', 202505, 4),
('em_apuracao', 202506, 1),
('em_apuracao', 202507, 2),
('em_apuracao', 202508, 2),
('em_apuracao', 202509, 8),
('em_apuracao', 202510, 2),
('em_apuracao', 202511, 3),
('em_apuracao', 202512, 1);

-- Flagrantes
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('flagrantes', 202501, 2),
('flagrantes', 202502, 2),
('flagrantes', 202503, 4),
('flagrantes', 202504, 3),
('flagrantes', 202505, 1),
('flagrantes', 202506, 0),
('flagrantes', 202507, 6),
('flagrantes', 202508, 2),
('flagrantes', 202509, 7),
('flagrantes', 202510, 7),
('flagrantes', 202511, 3),
('flagrantes', 202512, 13);

-- P.A.A.I.
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('paai', 202501, 2),
('paai', 202502, 2),
('paai', 202503, 4),
('paai', 202504, 3),
('paai', 202505, 0),
('paai', 202506, 0),
('paai', 202507, 0),
('paai', 202508, 0),
('paai', 202509, 0),
('paai', 202510, 0),
('paai', 202511, 0),
('paai', 202512, 1);

-- Apreensão de arma de fogo e/ou munição
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('apreensao_de_arma_de_fogo_eou_municao', 202501, 4),
('apreensao_de_arma_de_fogo_eou_municao', 202502, 0),
('apreensao_de_arma_de_fogo_eou_municao', 202503, 0),
('apreensao_de_arma_de_fogo_eou_municao', 202504, 2),
('apreensao_de_arma_de_fogo_eou_municao', 202505, 6),
('apreensao_de_arma_de_fogo_eou_municao', 202506, 1),
('apreensao_de_arma_de_fogo_eou_municao', 202507, 5),
('apreensao_de_arma_de_fogo_eou_municao', 202508, 1),
('apreensao_de_arma_de_fogo_eou_municao', 202509, 0),
('apreensao_de_arma_de_fogo_eou_municao', 202510, 0),
('apreensao_de_arma_de_fogo_eou_municao', 202511, 1),
('apreensao_de_arma_de_fogo_eou_municao', 202512, 1);

-- Corte de Árvores
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('corte_de_arvores', 202501, 0),
('corte_de_arvores', 202502, 1),
('corte_de_arvores', 202503, 0),
('corte_de_arvores', 202504, 0),
('corte_de_arvores', 202505, 0),
('corte_de_arvores', 202506, 0),
('corte_de_arvores', 202507, 0),
('corte_de_arvores', 202508, 0),
('corte_de_arvores', 202509, 0),
('corte_de_arvores', 202510, 1),
('corte_de_arvores', 202511, 1),
('corte_de_arvores', 202512, 0);

-- Crime contra as Áreas de Proteção Permanente
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crime_contra_as_areas_de_protecao_permanente', 202501, 0),
('crime_contra_as_areas_de_protecao_permanente', 202502, 0),
('crime_contra_as_areas_de_protecao_permanente', 202503, 0),
('crime_contra_as_areas_de_protecao_permanente', 202504, 2),
('crime_contra_as_areas_de_protecao_permanente', 202505, 0),
('crime_contra_as_areas_de_protecao_permanente', 202506, 0),
('crime_contra_as_areas_de_protecao_permanente', 202507, 1),
('crime_contra_as_areas_de_protecao_permanente', 202508, 0),
('crime_contra_as_areas_de_protecao_permanente', 202509, 0),
('crime_contra_as_areas_de_protecao_permanente', 202510, 0),
('crime_contra_as_areas_de_protecao_permanente', 202511, 0),
('crime_contra_as_areas_de_protecao_permanente', 202512, 0);

-- Crimes contra as Unidades de Conservação
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crimes_contra_as_unidades_de_conservacao', 202501, 1),
('crimes_contra_as_unidades_de_conservacao', 202502, 1),
('crimes_contra_as_unidades_de_conservacao', 202503, 3),
('crimes_contra_as_unidades_de_conservacao', 202504, 2),
('crimes_contra_as_unidades_de_conservacao', 202505, 1),
('crimes_contra_as_unidades_de_conservacao', 202506, 1),
('crimes_contra_as_unidades_de_conservacao', 202507, 0),
('crimes_contra_as_unidades_de_conservacao', 202508, 0),
('crimes_contra_as_unidades_de_conservacao', 202509, 2),
('crimes_contra_as_unidades_de_conservacao', 202510, 0),
('crimes_contra_as_unidades_de_conservacao', 202511, 1),
('crimes_contra_as_unidades_de_conservacao', 202512, 2);

-- Crime contra o Licenciamento Ambiental
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crime_contra_o_licenciamento_ambiental', 202501, 2),
('crime_contra_o_licenciamento_ambiental', 202502, 7),
('crime_contra_o_licenciamento_ambiental', 202503, 6),
('crime_contra_o_licenciamento_ambiental', 202504, 1),
('crime_contra_o_licenciamento_ambiental', 202505, 0),
('crime_contra_o_licenciamento_ambiental', 202506, 1),
('crime_contra_o_licenciamento_ambiental', 202507, 2),
('crime_contra_o_licenciamento_ambiental', 202508, 0),
('crime_contra_o_licenciamento_ambiental', 202509, 0),
('crime_contra_o_licenciamento_ambiental', 202510, 4),
('crime_contra_o_licenciamento_ambiental', 202511, 4),
('crime_contra_o_licenciamento_ambiental', 202512, 0);

-- Crime contra os Recursos Hídricos
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crime_contra_os_recursos_hidricos', 202501, 2),
('crime_contra_os_recursos_hidricos', 202502, 2),
('crime_contra_os_recursos_hidricos', 202503, 0),
('crime_contra_os_recursos_hidricos', 202504, 1),
('crime_contra_os_recursos_hidricos', 202505, 0),
('crime_contra_os_recursos_hidricos', 202506, 0),
('crime_contra_os_recursos_hidricos', 202507, 1),
('crime_contra_os_recursos_hidricos', 202508, 0),
('crime_contra_os_recursos_hidricos', 202509, 0),
('crime_contra_os_recursos_hidricos', 202510, 1),
('crime_contra_os_recursos_hidricos', 202511, 1),
('crime_contra_os_recursos_hidricos', 202512, 1);

-- Crime contra os Recursos Pesqueiros
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crime_contra_os_recursos_pesqueiros', 202501, 2),
('crime_contra_os_recursos_pesqueiros', 202502, 0),
('crime_contra_os_recursos_pesqueiros', 202503, 0),
('crime_contra_os_recursos_pesqueiros', 202504, 0),
('crime_contra_os_recursos_pesqueiros', 202505, 1),
('crime_contra_os_recursos_pesqueiros', 202506, 2),
('crime_contra_os_recursos_pesqueiros', 202507, 0),
('crime_contra_os_recursos_pesqueiros', 202508, 0),
('crime_contra_os_recursos_pesqueiros', 202509, 2),
('crime_contra_os_recursos_pesqueiros', 202510, 2),
('crime_contra_os_recursos_pesqueiros', 202511, 1),
('crime_contra_os_recursos_pesqueiros', 202512, 1);

-- Crimes contra a Administração Ambiental
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crimes_contra_a_administracao_ambiental', 202501, 2),
('crimes_contra_a_administracao_ambiental', 202502, 0),
('crimes_contra_a_administracao_ambiental', 202503, 0),
('crimes_contra_a_administracao_ambiental', 202504, 0),
('crimes_contra_a_administracao_ambiental', 202505, 0),
('crimes_contra_a_administracao_ambiental', 202506, 0),
('crimes_contra_a_administracao_ambiental', 202507, 0),
('crimes_contra_a_administracao_ambiental', 202508, 0),
('crimes_contra_a_administracao_ambiental', 202509, 0),
('crimes_contra_a_administracao_ambiental', 202510, 0),
('crimes_contra_a_administracao_ambiental', 202511, 0),
('crimes_contra_a_administracao_ambiental', 202512, 0);

-- Crimes contra a Fauna
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crimes_contra_a_fauna', 202501, 2),
('crimes_contra_a_fauna', 202502, 1),
('crimes_contra_a_fauna', 202503, 2),
('crimes_contra_a_fauna', 202504, 1),
('crimes_contra_a_fauna', 202505, 0),
('crimes_contra_a_fauna', 202506, 4),
('crimes_contra_a_fauna', 202507, 1),
('crimes_contra_a_fauna', 202508, 0),
('crimes_contra_a_fauna', 202509, 8),
('crimes_contra_a_fauna', 202510, 1),
('crimes_contra_a_fauna', 202511, 19),
('crimes_contra_a_fauna', 202512, 12);

-- Crimes contra a Flora
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('crimes_contra_a_flora', 202501, 2),
('crimes_contra_a_flora', 202502, 2),
('crimes_contra_a_flora', 202503, 3),
('crimes_contra_a_flora', 202504, 2),
('crimes_contra_a_flora', 202505, 5),
('crimes_contra_a_flora', 202506, 2),
('crimes_contra_a_flora', 202507, 4),
('crimes_contra_a_flora', 202508, 2),
('crimes_contra_a_flora', 202509, 1),
('crimes_contra_a_flora', 202510, 1),
('crimes_contra_a_flora', 202511, 3),
('crimes_contra_a_flora', 202512, 5);

-- Outros Crimes Ambientais
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('outros_crimes_ambientais', 202501, 2),
('outros_crimes_ambientais', 202502, 8),
('outros_crimes_ambientais', 202503, 4),
('outros_crimes_ambientais', 202504, 4),
('outros_crimes_ambientais', 202505, 8),
('outros_crimes_ambientais', 202506, 9),
('outros_crimes_ambientais', 202507, 3),
('outros_crimes_ambientais', 202508, 5),
('outros_crimes_ambientais', 202509, 0),
('outros_crimes_ambientais', 202510, 4),
('outros_crimes_ambientais', 202511, 8),
('outros_crimes_ambientais', 202512, 13);

-- Parcelamento Irregular do Solo
INSERT INTO fact_indicador_mensal_bpma (indicador_id, tempo_id, valor) VALUES
('parcelamento_irregular_do_solo', 202501, 2),
('parcelamento_irregular_do_solo', 202502, 5),
('parcelamento_irregular_do_solo', 202503, 1),
('parcelamento_irregular_do_solo', 202504, 0),
('parcelamento_irregular_do_solo', 202505, 0),
('parcelamento_irregular_do_solo', 202506, 4),
('parcelamento_irregular_do_solo', 202507, 2),
('parcelamento_irregular_do_solo', 202508, 0),
('parcelamento_irregular_do_solo', 202509, 4),
('parcelamento_irregular_do_solo', 202510, 2),
('parcelamento_irregular_do_solo', 202511, 0),
('parcelamento_irregular_do_solo', 202512, 2);