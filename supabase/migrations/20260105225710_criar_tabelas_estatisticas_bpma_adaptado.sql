-- ============================================
-- TABELAS DIM E FACT PARA ESTATÍSTICAS BPMA (2020-2025)
-- ============================================
-- Estrutura adaptada do arquivo bpma_dim_fat_2020_2025.sql
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: 2026-01-05 22:57:10
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELAS DIMENSÃO
-- ============================================

-- Dimensão: Tempo (ID composto AAAAMM)
CREATE TABLE IF NOT EXISTS public.dim_tempo (
  id integer PRIMARY KEY, -- formato AAAAMM
  ano smallint NOT NULL,
  mes smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
  mes_abreviacao text NOT NULL,
  inicio_mes date NOT NULL,
  UNIQUE (ano, mes)
);

-- Dimensão: Indicadores BPMA
CREATE TABLE IF NOT EXISTS public.dim_indicador_bpma (
  id text PRIMARY KEY,
  nome text NOT NULL,
  categoria text
);

-- 2. TABELAS FATO
-- ============================================

-- Fato: Indicadores Mensais BPMA
CREATE TABLE IF NOT EXISTS public.fact_indicador_mensal_bpma (
  tempo_id integer NOT NULL REFERENCES public.dim_tempo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  indicador_id text NOT NULL REFERENCES public.dim_indicador_bpma(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  valor numeric NOT NULL,
  PRIMARY KEY (tempo_id, indicador_id)
);

-- Fato: Resgate de Fauna por Espécie Mensal
CREATE TABLE IF NOT EXISTS public.fact_resgate_fauna_especie_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tempo_id integer NOT NULL REFERENCES public.dim_tempo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  id_regiao_administrativa uuid NULL REFERENCES public.dim_regiao_administrativa(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  id_especie_fauna uuid NULL REFERENCES public.dim_especies_fauna(id) ON UPDATE CASCADE ON DELETE SET NULL,
  nome_cientifico text NOT NULL,
  nome_popular text,
  quantidade integer NOT NULL,
  UNIQUE (tempo_id, nome_cientifico)
);

-- Popular dim_tempo (2020-2025)
INSERT INTO public.dim_tempo (id, ano, mes, mes_abreviacao, inicio_mes) VALUES
(202001,2020,1,'JAN','2020-01-01'),
(202002,2020,2,'FEV','2020-02-01'),
(202003,2020,3,'MAR','2020-03-01'),
(202004,2020,4,'ABR','2020-04-01'),
(202005,2020,5,'MAI','2020-05-01'),
(202006,2020,6,'JUN','2020-06-01'),
(202007,2020,7,'JUL','2020-07-01'),
(202008,2020,8,'AGO','2020-08-01'),
(202009,2020,9,'SET','2020-09-01'),
(202010,2020,10,'OUT','2020-10-01'),
(202011,2020,11,'NOV','2020-11-01'),
(202012,2020,12,'DEZ','2020-12-01'),
(202101,2021,1,'JAN','2021-01-01'),
(202102,2021,2,'FEV','2021-02-01'),
(202103,2021,3,'MAR','2021-03-01'),
(202104,2021,4,'ABR','2021-04-01'),
(202105,2021,5,'MAI','2021-05-01'),
(202106,2021,6,'JUN','2021-06-01'),
(202107,2021,7,'JUL','2021-07-01'),
(202108,2021,8,'AGO','2021-08-01'),
(202109,2021,9,'SET','2021-09-01'),
(202110,2021,10,'OUT','2021-10-01'),
(202111,2021,11,'NOV','2021-11-01'),
(202112,2021,12,'DEZ','2021-12-01'),
(202201,2022,1,'JAN','2022-01-01'),
(202202,2022,2,'FEV','2022-02-01'),
(202203,2022,3,'MAR','2022-03-01'),
(202204,2022,4,'ABR','2022-04-01'),
(202205,2022,5,'MAI','2022-05-01'),
(202206,2022,6,'JUN','2022-06-01'),
(202207,2022,7,'JUL','2022-07-01'),
(202208,2022,8,'AGO','2022-08-01'),
(202209,2022,9,'SET','2022-09-01'),
(202210,2022,10,'OUT','2022-10-01'),
(202211,2022,11,'NOV','2022-11-01'),
(202212,2022,12,'DEZ','2022-12-01'),
(202301,2023,1,'JAN','2023-01-01'),
(202302,2023,2,'FEV','2023-02-01'),
(202303,2023,3,'MAR','2023-03-01'),
(202304,2023,4,'ABR','2023-04-01'),
(202305,2023,5,'MAI','2023-05-01'),
(202306,2023,6,'JUN','2023-06-01'),
(202307,2023,7,'JUL','2023-07-01'),
(202308,2023,8,'AGO','2023-08-01'),
(202309,2023,9,'SET','2023-09-01'),
(202310,2023,10,'OUT','2023-10-01'),
(202311,2023,11,'NOV','2023-11-01'),
(202312,2023,12,'DEZ','2023-12-01'),
(202401,2024,1,'JAN','2024-01-01'),
(202402,2024,2,'FEV','2024-02-01'),
(202403,2024,3,'MAR','2024-03-01'),
(202404,2024,4,'ABR','2024-04-01'),
(202405,2024,5,'MAI','2024-05-01'),
(202406,2024,6,'JUN','2024-06-01'),
(202407,2024,7,'JUL','2024-07-01'),
(202408,2024,8,'AGO','2024-08-01'),
(202409,2024,9,'SET','2024-09-01'),
(202410,2024,10,'OUT','2024-10-01'),
(202411,2024,11,'NOV','2024-11-01'),
(202412,2024,12,'DEZ','2024-12-01'),
(202501,2025,1,'JAN','2025-01-01'),
(202502,2025,2,'FEV','2025-02-01'),
(202503,2025,3,'MAR','2025-03-01'),
(202504,2025,4,'ABR','2025-04-01'),
(202505,2025,5,'MAI','2025-05-01'),
(202506,2025,6,'JUN','2025-06-01'),
(202507,2025,7,'JUL','2025-07-01'),
(202508,2025,8,'AGO','2025-08-01'),
(202509,2025,9,'SET','2025-09-01'),
(202510,2025,10,'OUT','2025-10-01'),
(202511,2025,11,'NOV','2025-11-01'),
(202512,2025,12,'DEZ','2025-12-01')
ON CONFLICT (id) DO NOTHING;

-- Popular dim_indicador_bpma
INSERT INTO public.dim_indicador_bpma (id, nome, categoria) VALUES
('atendimentos_registrados_rap','Atendimentos registrados (RAP)','atendimentos'),
('termos_circunstanciados_de_ocorrencia_pmdf','Termos Circunstanciados de Ocorrência - PMDF','ocorrencias_ambientais'),
('termos_circunstanciados_outras','Termos Circunstanciados - OUTRAS','ocorrencias_ambientais'),
('em_apuracao','Em apuração','ocorrencias_ambientais'),
('flagrantes','Flagrantes','ocorrencias_ambientais'),
('paai','P.A.A.I.','ocorrencias_ambientais'),
('apreensao_de_arma_de_fogo_eou_municao','Apreensão de arma de fogo e/ou munição','ocorrencias_ambientais'),
('captura_de_animais_busca_de_animais_recolhimento_e_remocao_de_animais_remocao_de_animais','Captura de animais / Busca de Animais / Recolhimento e Remoção de Animais / Remoção de Animais','outros'),
('corte_de_arvores','Corte de Árvores','outros'),
('crime_contra_as_areas_de_protecao_permanente','Crime contra as Áreas de Proteção Permanente','ocorrencias_ambientais'),
('crimes_contra_as_unidades_de_conservacao','Crimes contra as Unidades de Conservação','ocorrencias_ambientais'),
('crime_contra_o_licenciamento_ambiental','Crime contra o Licenciamento Ambiental','ocorrencias_ambientais'),
('crime_contra_os_recursos_hidricos','Crime contra os Recursos Hídricos','ocorrencias_ambientais'),
('crime_contra_os_recursos_pesqueiros','Crime contra os Recursos Pesqueiros','ocorrencias_ambientais'),
('crimes_contra_a_administracao_ambiental','Crimes contra a Administração Ambiental','ocorrencias_ambientais'),
('crimes_contra_a_fauna','Crimes contra a Fauna','ocorrencias_ambientais'),
('crimes_contra_a_flora','Crimes contra a Flora','ocorrencias_ambientais'),
('outros_crimes_ambientais','Outros Crimes Ambientais','ocorrencias_ambientais'),
('parcelamento_irregular_do_solo','Parcelamento Irregular do Solo','ocorrencias_ambientais'),
('quantidade_de_resgate','QUANTIDADE DE RESGATE','resgate_fauna_total'),
('quantidade_de_soltura','QUANTIDADE DE SOLTURA','resgate_fauna_total'),
('quantidade_de_obitos','QUANTIDADE DE ÓBITOS','resgate_fauna_total'),
('quantidade_de_feridos','QUANTIDADE DE FERIDOS','resgate_fauna_total'),
('quantidade_de_atropelamento','QUANTIDADE DE ATROPELAMENTO','resgate_fauna_total'),
('quantidade_de_filhotes','QUANTIDADE DE FILHOTES','resgate_fauna_total'),
('baiano','BAIANO','outros'),
('periquito_do_encontro','PERIQUITO DO ENCONTRO','outros'),
('canario_da_terra','CANÁRIO DA TERRA','outros'),
('coruja_buraqueira','CORUJA BURAQUEIRA','outros'),
('coleiro','COLEIRO','outros'),
('sarue','SARUÊ','outros'),
('macaco_sagui','MACACO SAGUI','outros'),
('macaco_prego','MACACO PREGO','outros'),
('bicho_preguica','BICHO PREGUIÇA','outros'),
('tatu_galinha','TATU GALINHA','outros'),
('serpente_jiboia','SERPENTE JIBOIA','outros'),
('serpente_cascavel','SERPENTE CASCAVEL','outros'),
('serpente_cobra_cipo','SERPENTE COBRA CIPÓ','outros'),
('serpente_corre_campo','SERPENTE CORRE CAMPO','outros'),
('serpente_coral_falsa','SERPENTE CORAL FALSA','outros'),
('nome_popular','NOME POPULAR','outros'),
('alma_de_gato','ALMA DE GATO','outros'),
('andorinha','ANDORINHA','outros'),
('anu_branco','ANU BRANCO','outros'),
('anu_preto','ANU PRETO','outros'),
('arara_caninde','ARARA CANINDÉ','outros'),
('arara_maracana','ARARA MARACANÃ','outros'),
('azulao','AZULÃO','outros'),
('bacurau','BACURAU','outros'),
('beija_flor','BEIJA FLOR','outros'),
('bemtevi','BEM-TE-VI','outros'),
('bico_de_pimenta','BICO DE PIMENTA','outros'),
('bicudoverdadeiro','BICUDO-VERDADEIRO','outros'),
('bigodinho','BIGODINHO','outros'),
('caboclinho','CABOCLINHO','outros'),
('carcara','CARCARÁ','outros'),
('cardealdonordeste','CARDEAL-DO-NORDESTE','outros'),
('corrupiao','CORRUPIÃO','outros'),
('coruja_cabure','CORUJA CABURÉ','outros'),
('coruja_orelhuda','CORUJA ORELHUDA','outros'),
('coruja_preta','CORUJA PRETA','outros'),
('coruja_suindara','CORUJA SUINDARA','outros'),
('corujinha_da_mata','CORUJINHA DA MATA','outros'),
('curiango','CURIANGO','outros'),
('curicaca','CURICACA','outros'),
('curio','CURIÓ','outros'),
('frango_dagua','FRANGO D''ÁGUA','outros'),
('garca_branca','GARÇA BRANCA','outros'),
('gaviao_carijo','GAVIÃO CARIJO','outros'),
('gaviao_quiri_quiri','GAVIÃO QUIRI QUIRI','outros'),
('iraunagrande','IRAÚNA-GRANDE','outros'),
('irere','IRERÊ','outros'),
('jandaia','JANDAIA','outros'),
('joao_de_barro','JOÃO DE BARRO','outros'),
('juruva','JURUVA','outros'),
('maria_faceira','MARIA FACEIRA','outros'),
('marreco','MARRECO','outros'),
('mutum','MUTUM','outros'),
('papa_lagarta','PAPA LAGARTA','outros'),
('papagaio_do_mangue','PAPAGAIO DO MANGUE','outros'),
('papagaio_galego','PAPAGAIO GALEGO','outros'),
('papagaio_verdadeiro','PAPAGAIO VERDADEIRO','outros'),
('paturi','PATURI','outros'),
('perdiz','PERDIZ','outros'),
('periquito_maracana','PERIQUITO MARACANÃ','outros'),
('periquito_rei','PERIQUITO REI','outros'),
('periquito_rico','PERIQUITO RICO','outros'),
('picapau','PICA-PAU','outros'),
('pintassilgo','PINTASSILGO','outros'),
('pomba_do_bando','POMBA DO BANDO','outros'),
('pomba_verdadeira','POMBA VERDADEIRA','outros'),
('queroquero','QUERO-QUERO','outros'),
('rolinha_cinzenta','ROLINHA CINZENTA','outros'),
('rouxinol_do_encontro','ROUXINOL DO ENCONTRO','outros'),
('sabiabarranco','SABIÁ-BARRANCO','outros'),
('sabiadocampo','SABIÁ-DO-CAMPO','outros'),
('saira_amarela','SAIRA AMARELA','outros'),
('sanhaco_coqueiro','SANHAÇO COQUEIRO','outros'),
('saracura','SARACURA','outros'),
('soco','SOCO','outros'),
('tesourinha','TESOURINHA','outros'),
('tico_tico_rei','TICO TICO REI','outros'),
('tiziu','TIZIU','outros'),
('trinca_ferro','TRINCA FERRO','outros'),
('tuim','TUIM','outros'),
('urubu','URUBU','outros'),
('urutau','URUTAU','outros'),
('xexeu','XEXÉU','outros'),
('cachorro_do_mato','CACHORRO DO MATO','outros'),
('capivara','CAPIVARA','outros'),
('cuica_verdadeiro','CUICA VERDADEIRO','outros'),
('cutia','CUTIA','outros'),
('furao','FURÃO','outros'),
('jaguatirica','JAGUATIRICA','outros'),
('lobo_guara','LOBO GUARA','outros'),
('macaco_bugioguariba','MACACO BUGIO/GUARIBA','outros'),
('macaco_do_tufo_preto','MACACO DO TUFO PRETO','outros'),
('mico_estrela','MICO ESTRELA','outros'),
('porco_espinho','PORCO ESPINHO','outros'),
('quati','QUATI','outros'),
('raposa','RAPOSA','outros'),
('tamandua_bandeira','TAMANDUÁ BANDEIRA','outros'),
('tamandua_mirim','TAMANDUÁ MIRIM','outros'),
('tatu_peba','TATU PEBA','outros'),
('veado_campeiro','VEADO CAMPEIRO','outros'),
('cagado_comum','CÁGADO COMUM','outros'),
('cagado_de_barbicha','CÁGADO DE BARBICHA','outros'),
('calango','CALANGO','outros'),
('iguana','IGUANA','outros'),
('jabuti','JABUTI','outros'),
('minhocucu','MINHOCUÇU','outros'),
('serpente_boipeba','SERPENTE BOIPEBA','outros'),
('serpente_caninana','SERPENTE CANINANA','outros'),
('serpente_cobra_cega_cecilia','SERPENTE COBRA CEGA / CECÍLIA','outros'),
('serpente_cobra_cega_de_duas_cabecas','SERPENTE COBRA CEGA / DE DUAS CABEÇAS','outros'),
('serpente_cobra_dagua','SERPENTE COBRA D''ÁGUA','outros'),
('serpente_cobra_dormideira','SERPENTE COBRA DORMIDEIRA','outros'),
('serpente_cobraverde','SERPENTE COBRA-VERDE','outros'),
('serpente_coral_verdadeira','SERPENTE CORAL VERDADEIRA','outros'),
('serpente_jararaca_verdadeira','SERPENTE JARARACA VERDADEIRA','outros'),
('serpente_jararacucu','SERPENTE JARARACUÇU','outros'),
('serpente_jiboia_arco_iris','SERPENTE JIBOIA ARCO ÍRIS','outros'),
('serpente_mucurana','SERPENTE MUÇURANA','outros'),
('tartaruga','TARTARUGA','outros'),
('tartaruga_tigre_dagua','TARTARUGA TIGRE D''ÁGUA','outros'),
('teiu','TEIÚ','outros'),
('atendimentos_registrados','Atendimentos registrados','atendimentos'),
('aguas_claras','ÁGUAS CLARAS','outros'),
('brasilia','BRASÍLIA','outros'),
('brazlandia','BRAZLÂNDIA','outros'),
('candangolandia','CANDANGOLÂNDIA','outros'),
('ceilandia','CEILÂNDIA','outros'),
('cruzeiro','CRUZEIRO','outros'),
('fercal','FERCAL','outros'),
('gama','GAMA','outros'),
('guara','GUARÁ','outros'),
('itapoa','ITAPOÃ','outros'),
('jardim_botanico_a','JARDIM BOTÂNICO A','outros'),
('jardim_botanico_b','JARDIM BOTÂNICO B','outros'),
('lago_norte','LAGO NORTE','outros'),
('lago_sul','LAGO SUL','outros'),
('nucleo_bandeirante','NUCLEO BANDEIRANTE','outros'),
('paranoa','PARANOÁ','outros'),
('park_way_a','PARK WAY A','outros'),
('park_way_b','PARK WAY B','outros'),
('planaltina','PLANALTINA','outros'),
('recanto_das_emas','RECANTO DAS EMAS','outros'),
('riacho_fundo','RIACHO FUNDO','outros'),
('riacho_fundo_ii','RIACHO FUNDO II','outros'),
('samambaia','SAMAMBAIA','outros'),
('santa_maria','SANTA MARIA','outros'),
('sao_sebastiao','SÃO SEBASTIÃO','outros'),
('sciaestrutural','SCIA/ESTRUTURAL','outros'),
('sia','SIA','outros'),
('sobradinho','SOBRADINHO','outros'),
('sobradinho_ii','SOBRADINHO II','outros'),
('sudoesteoctagonal','SUDOESTE/OCTAGONAL','outros'),
('taguatinga','TAGUATINGA','outros'),
('varjao','VARJÃO','outros'),
('vicente_pires','VICENTE PIRES','outros'),
('canario','CANÁRIO','outros'),
('gaturamo_verdadeiro','GATURAMO VERDADEIRO','outros'),
('golinho','GOLINHO','outros'),
('martim_pescador','MARTIM PESCADOR','outros'),
('papa_capim','PAPA CAPIM','outros'),
('sanhaco_cinzento','SANHAÇO CINZENTO','outros'),
('tucano','TUCANO','outros'),
('anta','ANTA','outros'),
('catitu','CATITU','outros'),
('lontra','LONTRA','outros'),
('sucuarana','SUÇUARANA','outros'),
('serpente_corn_snake_exotica','SERPENTE CORN SNAKE (EXÓTICA)','outros'),
('serpente_jararaca_cruzeira','SERPENTE JARARACA CRUZEIRA','outros'),
('patativa','PATATIVA','outros'),
('rolinharoxa','ROLINHA-ROXA','outros'),
('sabialaranjeira','SABIÁ-LARANJEIRA','outros'),
('seriema','SERIEMA','outros'),
('melro','MELRO','outros'),
('pato','PATO','outros'),
('gralha_canca','GRALHA - CANCÃ','outros'),
('suiriricavaleiro','SUIRIRI-CAVALEIRO','outros'),
('tatu_bola','TATU BOLA','outros'),
('jacaretinga','JACARETINGA','outros'),
('jacare_do_papo_amarelo','JACARE DO PAPO AMARELO','outros'),
('serpente_boa_imperator_exotica','SERPENTE BOA IMPERATOR (EXÓTICA)','outros'),
('busca_de_animais','Busca de Animais','outros'),
('captura_de_animais','Captura de Animais','outros'),
('recolhimentoremocao_de_animais','Recolhimento/Remoção de Animais','outros'),
('remocao_de_animais','Remoção de Animais','outros'),
('bico_de_lacre','BICO DE LACRE','outros'),
('bicudo','BICUDO','outros'),
('garibaldi','GARIBALDI','outros'),
('gaviaozinho','GAVIÃOZINHO','outros'),
('maritaca','MARITACA','outros'),
('cangamba','CANGAMBÁ','outros'),
('gato_do_mato','GATO DO MATO','outros'),
('macaco_sagui_do_tufo_preto','MACACO SAGUI DO TUFO PRETO','outros'),
('serpente_python','SERPENTE PYTHON','outros'),
('quantotidade_de_atropelamentos','QUANTOTIDADE DE ATROPELAMENTOS','outros'),
('bigua','BIGUÁ','outros'),
('guaxinim','GUAXINIM','outros'),
('tatu_canastra','TATU CANASTRA','outros'),
('tatu_de_rabo_mole','TATU DE RABO MOLE','outros'),
('serpente_cobradecapim','SERPENTE COBRA-DE-CAPIM','outros'),
('serpente_cobrapapagaio_exotica','SERPENTE COBRA-PAPAGAIO (EXÓTICA)','outros'),
('serpente_king_snake_nigritos_exotica','SERPENTE KING SNAKE NIGRITOS (EXÓTICA)','outros'),
('aracari_castanho','ARAÇARI CASTANHO','outros'),
('cardealdosul','CARDEAL-DO-SUL','outros'),
('cachorro_domestico','CACHORRO DOMÉSTICO','outros'),
('jaguarundi','JAGUARUNDI','outros'),
('gecoleopardo_exotico','GECO-LEOPARDO (EXÓTICO)','outros'),
('jacare_acu','JACARÉ AÇU','outros'),
('serpente_periquitamboia','SERPENTE PERIQUITAMBOIA','outros')
ON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, categoria=EXCLUDED.categoria;


-- Habilitar RLS
ALTER TABLE public.fact_indicador_mensal_bpma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_resgate_fauna_especie_mensal ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view fact_indicador_mensal_bpma" 
    ON public.fact_indicador_mensal_bpma
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view fact_resgate_fauna_especie_mensal" 
    ON public.fact_resgate_fauna_especie_mensal
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fact_indicador_mensal_bpma" 
    ON public.fact_indicador_mensal_bpma
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fact_resgate_fauna_especie_mensal" 
    ON public.fact_resgate_fauna_especie_mensal
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_fact_indicador_tempo 
    ON public.fact_indicador_mensal_bpma(tempo_id);

CREATE INDEX IF NOT EXISTS idx_fact_resgate_tempo 
    ON public.fact_resgate_fauna_especie_mensal(tempo_id);

CREATE INDEX IF NOT EXISTS idx_fact_resgate_especie 
    ON public.fact_resgate_fauna_especie_mensal(id_especie_fauna);

