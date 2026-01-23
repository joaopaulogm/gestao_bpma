-- Inserir dados agregados de Março a Dezembro 2025
-- Os dados de Janeiro e Fevereiro já existem na tabela

-- MARÇO 2025
INSERT INTO fat_resgates_diarios_2025_especies (data_ocorrencia, mes, nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
SELECT 
  '2025-03-01'::date,
  'Março',
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates),
  SUM(quantidade_solturas),
  SUM(quantidade_obitos),
  SUM(quantidade_feridos),
  SUM(quantidade_filhotes)
FROM (VALUES
  ('ARARA CANINDÉ', 'Ara ararauna', 'AVES', 3, 1, 0, 2, 0),
  ('CORUJA BURAQUEIRA', 'Athene cunicularia', 'AVES', 1, 0, 0, 1, 0),
  ('CORUJA SUINDARA', 'Tyto furcata', 'AVES', 1, 1, 0, 0, 0),
  ('CORUJINHA DA MATA', 'Megascops choliba', 'AVES', 1, 0, 0, 1, 0),
  ('PAPAGAIO VERDADEIRO', 'Amazona aestiva', 'AVES', 2, 0, 0, 0, 0),
  ('PERIQUITO DO ENCONTRO', 'Brotogeris chiriri', 'AVES', 2, 1, 0, 1, 0),
  ('URUBU', 'Coragyps atratus', 'AVES', 1, 0, 0, 1, 0),
  ('CAPIVARA', 'Hydrochoerus hydrochaeris', 'MAMÍFEROS', 1, 1, 0, 0, 0),
  ('PORCO ESPINHO', 'Coendou prehensilis', 'MAMÍFEROS', 1, 1, 0, 0, 0),
  ('SARUÊ', 'Didelphis albiventris', 'MAMÍFEROS', 7, 7, 0, 0, 0),
  ('TATU PEBA', 'Euphractus sexcinctus', 'MAMÍFEROS', 1, 0, 1, 0, 0),
  ('CÁGADO DE BARBICHA', 'Phrynops geoffroanus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('JABUTI', 'Chelonoidis carbonaria', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CASCAVEL', 'Crotalus durissus', 'RÉPTEIS', 5, 5, 0, 0, 0),
  ('SERPENTE COBRA CIPÓ', 'Chironius bicarinatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORAL FALSA', 'Anilis scytale', 'RÉPTEIS', 2, 2, 0, 0, 0),
  ('SERPENTE JARARACA VERDADEIRA', 'Bothrops jararaca', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE JIBOIA', 'Boa constrictor', 'RÉPTEIS', 4, 4, 0, 0, 0)
) AS t(nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
GROUP BY nome_popular, nome_cientifico, classe_taxonomica;

-- ABRIL 2025
INSERT INTO fat_resgates_diarios_2025_especies (data_ocorrencia, mes, nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
SELECT 
  '2025-04-01'::date,
  'Abril',
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates),
  SUM(quantidade_solturas),
  SUM(quantidade_obitos),
  SUM(quantidade_feridos),
  SUM(quantidade_filhotes)
FROM (VALUES
  ('BAIANO', 'Sporophila nigricollis', 'AVES', 5, 0, 0, 0, 0),
  ('BEIJA FLOR', 'Florisuga fusca', 'AVES', 1, 0, 0, 1, 0),
  ('BICUDO-VERDADEIRO', 'Oryzoborus maximiliani', 'AVES', 3, 0, 0, 0, 0),
  ('CANÁRIO DA TERRA', 'Sicalis flaveola', 'AVES', 10, 0, 0, 1, 0),
  ('COLEIRO', 'Sporophila caerulescens', 'AVES', 4, 0, 0, 0, 0),
  ('CORUJA BURAQUEIRA', 'Athene cunicularia', 'AVES', 1, 0, 0, 1, 0),
  ('CORUJA SUINDARA', 'Tyto furcata', 'AVES', 1, 0, 0, 1, 0),
  ('GARÇA BRANCA', 'Ardea alba', 'AVES', 1, 0, 0, 1, 0),
  ('GAVIÃO CARIJO', 'Rupornis magnirostris', 'AVES', 1, 0, 0, 1, 0),
  ('GAVIÃO QUIRI QUIRI', 'Falco sparverius', 'AVES', 1, 0, 0, 1, 0),
  ('PAPAGAIO VERDADEIRO', 'Amazona aestiva', 'AVES', 3, 1, 0, 0, 0),
  ('PICA-PAU', 'Campephilus robustus', 'AVES', 2, 0, 0, 2, 0),
  ('QUERO-QUERO', 'Vanellus chilensis', 'AVES', 1, 0, 0, 1, 0),
  ('ROLINHA CINZENTA', 'Columbina passerina', 'AVES', 2, 0, 0, 1, 1),
  ('TIZIU', 'Volatinia jacarina', 'AVES', 1, 0, 0, 0, 0),
  ('TRINCA FERRO', 'Saltator maximus', 'AVES', 1, 0, 0, 0, 0),
  ('TUCANO', 'Ramphastos toco', 'AVES', 1, 0, 0, 1, 0),
  ('URUTAU', 'Nyctibius griseus', 'AVES', 1, 0, 0, 1, 0),
  ('BICHO PREGUIÇA', 'Bradypus variegatus', 'MAMÍFEROS', 1, 1, 0, 0, 0),
  ('CAPIVARA', 'Hydrochoerus hydrochaeris', 'MAMÍFEROS', 1, 1, 0, 0, 0),
  ('MACACO SAGUI', 'Callithrix jacchus', 'MAMÍFEROS', 3, 1, 0, 2, 0),
  ('MACACO SAGUI DO TUFO PRETO', 'Callithrix pennicillata', 'MAMÍFEROS', 1, 1, 0, 0, 0),
  ('SARUÊ', 'Didelphis albiventris', 'MAMÍFEROS', 16, 14, 0, 2, 0),
  ('CÁGADO DE BARBICHA', 'Phrynops geoffroanus', 'RÉPTEIS', 1, 0, 0, 1, 0),
  ('SERPENTE BOIPEBA', 'Xenodon merremii', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CASCAVEL', 'Crotalus durissus', 'RÉPTEIS', 5, 4, 0, 0, 0),
  ('SERPENTE COBRA CIPÓ', 'Chironius bicarinatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORAL FALSA', 'Anilis scytale', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORRE CAMPO', 'Thamnodynastes pallidus', 'RÉPTEIS', 7, 4, 0, 3, 0),
  ('SERPENTE JARARACA VERDADEIRA', 'Bothrops jararaca', 'RÉPTEIS', 2, 2, 0, 0, 0),
  ('SERPENTE JIBOIA', 'Boa constrictor', 'RÉPTEIS', 2, 2, 0, 0, 0)
) AS t(nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
GROUP BY nome_popular, nome_cientifico, classe_taxonomica;

-- MAIO 2025
INSERT INTO fat_resgates_diarios_2025_especies (data_ocorrencia, mes, nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
SELECT 
  '2025-05-01'::date,
  'Maio',
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates),
  SUM(quantidade_solturas),
  SUM(quantidade_obitos),
  SUM(quantidade_feridos),
  SUM(quantidade_filhotes)
FROM (VALUES
  ('BAIANO', 'Sporophila nigricollis', 'AVES', 2, 0, 0, 0, 0),
  ('BEIJA FLOR', 'Florisuga fusca', 'AVES', 4, 0, 1, 2, 1),
  ('CORUJA BURAQUEIRA', 'Athene cunicularia', 'AVES', 2, 1, 0, 1, 0),
  ('CORUJA PRETA', 'Strix huhula', 'AVES', 1, 0, 0, 1, 0),
  ('CORUJA SUINDARA', 'Tyto furcata', 'AVES', 2, 1, 0, 1, 0),
  ('GAVIÃO CARIJO', 'Rupornis magnirostris', 'AVES', 1, 1, 0, 0, 0),
  ('GAVIÃO QUIRI QUIRI', 'Falco sparverius', 'AVES', 2, 1, 0, 1, 0),
  ('JOÃO DE BARRO', 'Furnarius rufus', 'AVES', 1, 0, 0, 1, 0),
  ('PAPAGAIO VERDADEIRO', 'Amazona aestiva', 'AVES', 2, 2, 0, 0, 0),
  ('PERIQUITO DO ENCONTRO', 'Brotogeris chiriri', 'AVES', 1, 0, 0, 1, 0),
  ('ROLINHA-ROXA', 'Columbina talpacoti', 'AVES', 1, 0, 0, 1, 0),
  ('SUIRIRI-CAVALEIRO', 'Tyrannidae', 'AVES', 1, 0, 0, 1, 0),
  ('TUCANO', 'Ramphastos toco', 'AVES', 2, 0, 0, 2, 0),
  ('CAPIVARA', 'Hydrochoerus hydrochaeris', 'MAMÍFEROS', 2, 0, 2, 0, 0),
  ('FURÃO', 'Mustela putorius furo', 'MAMÍFEROS', 1, 0, 0, 1, 0),
  ('MACACO SAGUI', 'Callithrix jacchus', 'MAMÍFEROS', 1, 0, 0, 1, 0),
  ('MACACO SAGUI DO TUFO PRETO', 'Callithrix pennicillata', 'MAMÍFEROS', 1, 0, 0, 1, 0),
  ('SARUÊ', 'Didelphis albiventris', 'MAMÍFEROS', 14, 13, 0, 1, 0),
  ('SERPENTE CANINANA', 'Spilotes pullatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CASCAVEL', 'Crotalus durissus', 'RÉPTEIS', 6, 6, 0, 0, 0),
  ('SERPENTE COBRA CIPÓ', 'Chironius bicarinatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORAL FALSA', 'Anilis scytale', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORAL VERDADEIRA', 'Micrurus lemniscatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE JARARACA VERDADEIRA', 'Bothrops jararaca', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE JIBOIA', 'Boa constrictor', 'RÉPTEIS', 3, 1, 0, 1, 0)
) AS t(nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
GROUP BY nome_popular, nome_cientifico, classe_taxonomica;

-- JUNHO 2025
INSERT INTO fat_resgates_diarios_2025_especies (data_ocorrencia, mes, nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
SELECT 
  '2025-06-01'::date,
  'Junho',
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates),
  SUM(quantidade_solturas),
  SUM(quantidade_obitos),
  SUM(quantidade_feridos),
  SUM(quantidade_filhotes)
FROM (VALUES
  ('ARARA CANINDÉ', 'Ara ararauna', 'AVES', 2, 0, 0, 0, 0),
  ('BAIANO', 'Sporophila nigricollis', 'AVES', 5, 0, 0, 0, 0),
  ('BEIJA FLOR', 'Florisuga fusca', 'AVES', 1, 0, 0, 1, 0),
  ('BIGODINHO', 'Sporophila lineola', 'AVES', 1, 0, 0, 0, 0),
  ('CORUJA BURAQUEIRA', 'Athene cunicularia', 'AVES', 2, 1, 0, 1, 0),
  ('CORUJA SUINDARA', 'Tyto furcata', 'AVES', 1, 0, 0, 1, 0),
  ('PAPAGAIO VERDADEIRO', 'Amazona aestiva', 'AVES', 2, 0, 0, 1, 0),
  ('PERIQUITO MARACANÃ', 'Psittacara leucophthalmus', 'AVES', 1, 0, 0, 1, 0),
  ('URUBU', 'Coragyps atratus', 'AVES', 1, 1, 0, 0, 0),
  ('URUTAU', 'Nyctibius griseus', 'AVES', 1, 0, 0, 1, 0),
  ('CAPIVARA', 'Hydrochoerus hydrochaeris', 'MAMÍFEROS', 2, 0, 0, 2, 0),
  ('MICO ESTRELA', 'Callithrix penicillata', 'MAMÍFEROS', 1, 0, 0, 0, 0),
  ('PORCO ESPINHO', 'Coendou prehensilis', 'MAMÍFEROS', 3, 3, 0, 0, 0),
  ('SARUÊ', 'Didelphis albiventris', 'MAMÍFEROS', 21, 9, 0, 12, 0),
  ('CÁGADO DE BARBICHA', 'Phrynops geoffroanus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CASCAVEL', 'Crotalus durissus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE COBRA CIPÓ', 'Chironius bicarinatus', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE COBRA DORMIDEIRA', 'Sibynomorphus mikanii', 'RÉPTEIS', 1, 1, 0, 0, 0),
  ('SERPENTE CORAL VERDADEIRA', 'Micrurus lemniscatus', 'RÉPTEIS', 2, 2, 0, 0, 0),
  ('SERPENTE CORRE CAMPO', 'Thamnodynastes pallidus', 'RÉPTEIS', 1, 1, 0, 0, 0)
) AS t(nome_popular, nome_cientifico, classe_taxonomica, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes)
GROUP BY nome_popular, nome_cientifico, classe_taxonomica;