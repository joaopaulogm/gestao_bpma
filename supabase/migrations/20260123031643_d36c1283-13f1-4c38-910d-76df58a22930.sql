-- INSERIR DADOS REAIS DO TGRL (Equipamentos)
INSERT INTO public.dim_tgrl (tombamento, descricao, tipo, categoria, estado_conservacao, situacao, localizacao, observacoes, valor_aquisicao, chassi_serie) VALUES
-- Armas de fogo
('3600270886', 'Pistola CZ P-10C semiautomática cal. 9mm', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', 'DISPONÍVEL', 1513.59, 'F041968'),
('3600270871', 'Pistola CZ P-10C semiautomática cal. 9mm', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'CAUTELA', 'TEN NUNES 727660', 1513.59, 'F042948'),
('3600268634', 'Pistola CZ P-10C semiautomática cal. 9mm', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', 'DISPONÍVEL', 1513.59, 'F101468'),
('3600261760', 'Pistola CZ P-10F semiautomática cal. 9mm', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', 'Pistola do LÍVIO', 1513.59, 'F087074'),
('3600257181', 'Carabina Cal. 5.56x45mm Kale KCR 556', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', 'Uso restrito atirador designado', 9861.19, 'T0551-20V00019'),
('3600220224', 'Carabina IMBEL IA2 calibre 5.56', 'ARMAMENTO', 'ARMA DE FOGO', 'REGULAR', 'EM LAUDO TÉCNICO', 'CMBEL', 'GUIA SEI 135824203', 6575.64, 'JFA03488'),
('3600220223', 'Carabina IMBEL IA2 calibre 5.56', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 6575.64, 'JFA04973'),
('3600220219', 'Carabina IMBEL IA2 calibre 5.56', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', 'NA RESERVA DO LACUSTRE', 6575.64, 'JFA04730'),
('3600166399', 'Pistola Taurus PT24/7 cal. .40', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 1891.00, 'SDZ09334'),
('3600120615', 'Espingarda Benelli M3 calibre 12', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', 'TMBA CHOQUE 0004/2025', 4176.20, '677709'),
('200109537', 'Carabina Taurus/Famae CT40 calibre .40', 'ARMAMENTO', 'ARMA DE FOGO', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 6308.00, 'UF02532'),
-- Comunicação
('3600213116', 'Terminal radiocomunicação digital Tetra veicular Motorola', 'COMUNICAÇÃO', 'RÁDIO', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 553197', 6900.00, '16227D0112'),
('3600213121', 'Terminal radiocomunicação digital Tetra veicular Motorola', 'COMUNICAÇÃO', 'RÁDIO', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 552942', 6900.00, NULL),
('3600213122', 'Terminal radiocomunicação digital Tetra veicular Motorola', 'COMUNICAÇÃO', 'RÁDIO', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 553200', 6900.00, '16227D0118'),
('3600216401', 'Terminal radiocomunicação digital Tetra portátil STP9000', 'COMUNICAÇÃO', 'RÁDIO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 3158.00, '2PN901511G8H59X'),
('3600216433', 'Terminal radiocomunicação digital Tetra portátil STP9000', 'COMUNICAÇÃO', 'RÁDIO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 3158.00, '2PN901511G8H5EI'),
-- Kit sinalizadores
('3600231027', 'Kit sinalizador acústico visual Engesig Arjent', 'SINALIZAÇÃO', 'KIT SINALIZADOR', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 553520', 13700.00, NULL),
('3600242774', 'Kit sinalizador acústico visual', 'SINALIZAÇÃO', 'KIT SINALIZADOR', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 553556', 13700.00, NULL),
('3600247672', 'Kit sinalizador acústico visual', 'SINALIZAÇÃO', 'KIT SINALIZADOR', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 553959', 13700.00, NULL),
('3600284606', 'Kit sinalizador acústico visual', 'SINALIZAÇÃO', 'KIT SINALIZADOR', 'BOM', 'NÃO SE APLICA', 'VTR', 'Viatura 554332', 13700.00, NULL),
-- Mergulho
('200098048', 'Garrafa de ar cilíndrica para mergulho Technisub 18L', 'MERGULHO', 'CILINDRO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1800.00, NULL),
('200098049', 'Garrafa de ar cilíndrica para mergulho Technisub 18L', 'MERGULHO', 'CILINDRO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1800.00, NULL),
('200098050', 'Garrafa de ar cilíndrica para mergulho Technisub 18L', 'MERGULHO', 'CILINDRO', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1800.00, NULL),
('3600173761', 'Compressor de ar para recarga de cilindros', 'MERGULHO', 'COMPRESSOR', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 40636.00, NULL),
('3600173741', 'Cilindro de alumínio S40', 'MERGULHO', 'CILINDRO', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', NULL, 949.00, NULL),
-- Geradores
('200098363', 'Grupo Gerador portátil gasolina Branco B4T6500', 'ENERGIA', 'GERADOR', 'BOM', 'NÃO SE APLICA', 'ALMOXARIFADO', 'Consertado 18/02', 4249.18, NULL),
('200098365', 'Grupo Gerador portátil gasolina Branco B4T6500', 'ENERGIA', 'GERADOR', 'REGULAR', 'NÃO SE APLICA', 'ALMOXARIFADO', NULL, 4249.18, NULL),
-- Proteção
('200161132', 'Capacete Balístico nível II com viseira', 'PROTEÇÃO', 'CAPACETE', 'BOM', 'NÃO SE APLICA', 'GTA', NULL, 2391.87, NULL),
('200161133', 'Capacete Balístico nível II com viseira', 'PROTEÇÃO', 'CAPACETE', 'BOM', 'NÃO SE APLICA', 'GTA', NULL, 2391.87, NULL),
('200161134', 'Capacete Balístico nível II com viseira', 'PROTEÇÃO', 'CAPACETE', 'BOM', 'NÃO SE APLICA', 'GTA', NULL, 2391.87, NULL),
('3600165161', 'Colete balístico nível III-A tamanho M', 'PROTEÇÃO', 'COLETE', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 1160.00, NULL),
-- Fauna
('200189618', 'Puçá de rede', 'FAUNA', 'CAPTURA', 'BOM', 'NÃO SE APLICA', 'SVG', NULL, 40.00, NULL),
('200189596', 'Cambão metálico', 'FAUNA', 'CAPTURA', 'BOM', 'NÃO SE APLICA', 'SVG', NULL, 350.00, NULL),
('200189603', 'Gaiola para transporte de animais', 'FAUNA', 'CAPTURA', 'BOM', 'NÃO SE APLICA', 'SVG', NULL, 250.00, NULL),
('3600217294', 'Leitor de Microchip com memória universal', 'FAUNA', 'LEITOR', 'BOM', 'NÃO SE APLICA', 'SLOG', 'No gaveteiro', 840.00, NULL),
-- Tecnologia
('3600169014', 'GPS Garmin Montana 600', 'TECNOLOGIA', 'GPS', 'BOM', 'NÃO SE APLICA', 'SVG', NULL, 1800.00, NULL),
('3600169015', 'GPS Garmin Montana 600', 'TECNOLOGIA', 'GPS', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1800.00, NULL),
-- Óptica
('200128185', 'Binóculo de visão noturna ATN Night Scout', 'ÓPTICA', 'BINÓCULO', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1950.00, NULL),
-- Carretas
('200099407', 'Carreta para transporte de Jet Sky Rondon 2005', 'REBOQUE', 'CARRETA', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', 'Jet plotado 04', 2000.00, '9A9RD1C145GCR2051'),
('200099408', 'Carreta para transporte de Jet Sky Rondon 2005', 'REBOQUE', 'CARRETA', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', NULL, 2000.00, '9A9RD1C145GCR2052'),
('3600217971', 'Reboque tipo carreta 1 eixo capacidade 0,40T', 'REBOQUE', 'CARRETA', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', 'DO JET', 4370.00, '99GDMRMA1GE000021'),
-- Tendas
('3600217214', 'Tenda Piramidal Estrutura Metálica 6x6x3m', 'ALOJAMENTO', 'TENDA', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1969.00, NULL),
('3600219184', 'Tenda Piramidal Estrutura Metálica 6x6x3m', 'ALOJAMENTO', 'TENDA', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1969.00, NULL),
-- Informática
('3600226323', 'Microcomputador Positivo Master C810', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'OCIOSO', 'SLOG', NULL, 2937.77, NULL),
('3600226335', 'Microcomputador Positivo Master C810', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'NÃO SE APLICA', 'SECRIMPO/SSPROJ', NULL, 2937.77, NULL),
('3600226438', 'Microcomputador Positivo Master C810', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 2937.77, NULL),
('3600226495', 'Microcomputador Positivo Master C810', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'NÃO SE APLICA', 'SECRETARIA/SJD', NULL, 2937.77, NULL),
('3600226503', 'Microcomputador Positivo Master C810', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'NÃO SE APLICA', 'GUARDA', NULL, 2937.77, NULL),
('3600217068', 'Computador Dell Optiplex 3020 Windows 7', 'INFORMÁTICA', 'COMPUTADOR', 'BOM', 'NÃO SE APLICA', 'GUARDA', NULL, 10000.00, NULL),
-- Monitores
('3600226704', 'Monitor LED 21.5 Positivo 22MP55PY', 'INFORMÁTICA', 'MONITOR', 'BOM', 'NÃO SE APLICA', 'ALMOXARIFADO', NULL, 449.13, NULL),
('3600226839', 'Monitor LED 21.5 Positivo 22MP55PY', 'INFORMÁTICA', 'MONITOR', 'BOM', 'NÃO SE APLICA', 'SLOG', NULL, 449.13, NULL),
('3600226845', 'Monitor LED 21.5 Positivo 22MP55PY', 'INFORMÁTICA', 'MONITOR', 'BOM', 'NÃO SE APLICA', 'SOI', NULL, 449.13, NULL),
('3600226876', 'Monitor LED 21.5 Positivo 22MP55PY', 'INFORMÁTICA', 'MONITOR', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 449.13, NULL),
('3600217060', 'Monitor Touch Screen 21.5 Dell', 'INFORMÁTICA', 'MONITOR', 'BOM', 'OCIOSO', 'ALMOXARIFADO', NULL, 1300.00, NULL),
-- Telefones
('3600179485', 'Aparelho telefônico IP integrado', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'SECRETARIA/SJD', NULL, 1468.00, NULL),
('3600179486', 'Aparelho telefônico IP integrado', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'PREALG', NULL, 1468.00, NULL),
('3600179495', 'Aparelho telefônico IP integrado', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'SOI', NULL, 1468.00, NULL),
('3600179507', 'Aparelho telefônico IP integrado', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'LACUSTRE', NULL, 1468.00, NULL),
('3600181399', 'Aparelho telefone IP tipo II', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'SECRETÁRIA CMD', NULL, 1890.00, NULL),
('3600181403', 'Aparelho telefone IP tipo II', 'COMUNICAÇÃO', 'TELEFONE', 'BOM', 'NÃO SE APLICA', 'COMANDO', NULL, 1890.00, NULL),
-- Projetores
('3600231123', 'Projetor Multimídia Epson X36V11H723024', 'AUDIOVISUAL', 'PROJETOR', 'BOM', 'NÃO SE APLICA', 'PREALG', NULL, 2507.00, NULL),
-- Detectores
('200069002', 'Detector de Metal CEIA PD-140 portátil', 'DETECÇÃO', 'DETECTOR', 'REGULAR', 'NÃO SE APLICA', 'RESERVA', 'Falta pilha', 357.00, '98101951'),
('200069003', 'Detector de Metal CEIA PD-140 portátil', 'DETECÇÃO', 'DETECTOR', 'REGULAR', 'NÃO SE APLICA', 'RESERVA', 'Falta pilha', 357.00, '98101952'),
-- Algemas
('200069736', 'Algema em aço inoxidável acabamento cromado', 'CONTENÇÃO', 'ALGEMA', 'BOM', 'NÃO SE APLICA', 'CAUTELA', NULL, 79.00, NULL),
-- Iluminação
('3600182277', 'Iluminador de área tipo bazuca', 'ILUMINAÇÃO', 'ILUMINADOR', 'BOM', 'OCIOSO', 'ALMOXARIFADO', NULL, 12900.00, NULL),
-- Freezer
('200093631', 'Freezer horizontal 250L Electrolux H-300', 'REFRIGERAÇÃO', 'FREEZER', 'REGULAR', 'NÃO SE APLICA', 'LACUSTRE', 'Em manutenção', 829.00, NULL),
-- Móveis
('287228', 'Gaveteiro Volante c/03 Gavetas com Chaves em Aço', 'MOBILIÁRIO', 'GAVETEIRO', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 264.00, NULL),
('3600188710', 'Mesa delta 1400X1400X600X600X740MM Fortline', 'MOBILIÁRIO', 'MESA', 'BOM', 'NÃO SE APLICA', 'SLOG', NULL, 898.00, NULL),
('3600188711', 'Mesa delta 1400X1400X600X600X740MM Fortline', 'MOBILIÁRIO', 'MESA', 'BOM', 'NÃO SE APLICA', 'SLOG', 'Sd Cristina', 898.00, NULL),
('3600188747', 'Poltrona padrão 3 FLEXFORM', 'MOBILIÁRIO', 'POLTRONA', 'BOM', 'NÃO SE APLICA', 'SLOG', NULL, 749.00, NULL),
('3600188808', 'Poltrona Presidente FLEXFORM', 'MOBILIÁRIO', 'POLTRONA', 'BOM', 'NÃO SE APLICA', 'COMANDO', NULL, 2250.00, NULL),
('3600188809', 'Poltrona Presidente FLEXFORM', 'MOBILIÁRIO', 'POLTRONA', 'BOM', 'NÃO SE APLICA', 'SUBCMD', NULL, 2250.00, NULL),
('752385', 'Cadeira giratória estação trabalho com braços reguláveis', 'MOBILIÁRIO', 'CADEIRA', 'RUIM', 'INSERVÍVEL', 'LACUSTRE', 'Na sala de aula', 823.79, NULL),
-- Armários
('200098584', 'Armário em aço 02 portas 04 prateleiras Artmóveis', 'MOBILIÁRIO', 'ARMÁRIO', 'BOM', 'NÃO SE APLICA', 'RESERVA', NULL, 527.00, NULL),
('200098585', 'Armário em aço 02 portas 04 prateleiras Artmóveis', 'MOBILIÁRIO', 'ARMÁRIO', 'BOM', 'NÃO SE APLICA', 'MANUTENÇÃO', NULL, 527.00, NULL),
('200098586', 'Armário em aço 02 portas 04 prateleiras Artmóveis', 'MOBILIÁRIO', 'ARMÁRIO', 'BOM', 'NÃO SE APLICA', 'ALMOXARIFADO', NULL, 527.00, NULL)
ON CONFLICT (tombamento) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  tipo = EXCLUDED.tipo,
  categoria = EXCLUDED.categoria,
  estado_conservacao = EXCLUDED.estado_conservacao,
  situacao = EXCLUDED.situacao,
  localizacao = EXCLUDED.localizacao,
  observacoes = EXCLUDED.observacoes,
  valor_aquisicao = EXCLUDED.valor_aquisicao,
  chassi_serie = EXCLUDED.chassi_serie,
  updated_at = now();