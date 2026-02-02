-- =============================================================
-- Corrigir dim_efetivo conforme tabela nova (fonte da verdade).
-- Uma linha por matrícula; quem não está na tabela nova não faz mais parte do batalhão.
-- Fonte: dim_efetivo_upsert.sql (atualizar dim_efetivo.xlsx)
-- =============================================================

-- 1) Tabela temporária com os dados da tabela nova
CREATE TEMP TABLE _staging_dim_efetivo_nova (
  antiguidade text,
  posto_graduacao text,
  quadro text,
  quadro_sigla text,
  nome_guerra text,
  nome text,
  matricula text,
  sexo text,
  lotacao text,
  ativo boolean,
  cpf text,
  data_nascimento date,
  data_inclusao date,
  idade text,
  contato text,
  email text,
  telefone text,
  telefone_2 text,
  email_2 text,
  porte_arma text,
  logradouro text
);

INSERT INTO _staging_dim_efetivo_nova (
  antiguidade, posto_graduacao, quadro, quadro_sigla, nome_guerra, nome, matricula,
  sexo, lotacao, ativo, cpf, data_nascimento, data_inclusao, idade, contato,
  email, telefone, telefone_2, email_2, porte_arma, logradouro
) VALUES
  ('1', 'TC QOPM', 'Oficiais', 'QOPM', 'ADELINO', 'ADELINO JOSE DE OLIVEIRA JUNIOR', '00505838', 'Masculino', 'BPMA', true, '63534223187', '1974-10-10', '1996-03-08', '51', '(61)98200-1166', 'adelino.junior@pm.df.gov.br', '(61)98200-1166', null, null, 'Ativo', 'Quadra 3 Conjunto 3'),
  ('2', 'MAJ QOPM', 'Oficiais', 'QOPM', 'EMERSON ARAUJO', 'EMERSON ROBERTO ARAÚJO MELÃO', '00508578', 'Masculino', 'BPMA', true, '98361090134', '1983-06-02', '2005-03-28', '42', '(61)99686-6231', 'emerson.melao@pm.df.gov.br', '(61)99686-6231', null, 'emersonroberto44@hotmail.com', 'Ativo', 'Rua Aroeira (St Hab Pte Terra)'),
  ('3', 'CAP QOPMA', 'Oficiais', 'QOPMA', 'CLAUBERT', 'CLAUBERT NEVES SA ABREU', '00215635', 'Masculino', 'BPMA', true, '77832256168', '1974-09-08', '1996-05-15', '51', '(61)99618-0577', 'claubertabreu@yahoo.com.br', '(61)99618-0577', null, 'claubert.abreu@pm.df.gov.br', 'Ativo', 'SHA'),
  ('4', '1º TEN QOPM', 'Oficiais', 'QOPM', 'LAZARI', 'JOAO FLAVIO LAZARI GOMES', '07349165', 'Masculino', 'BPMA', true, '35292785806', '1991-04-05', '2018-04-30', '34', '(18)99608-1694', 'joaoflaviolazari@gmail.com', '(18)99608-1694', null, 'joao.lazari@pm.df.gov.br', 'Ativo', 'QI 08 Bloco P'),
  ('5', '1º TEN QOPM', 'Oficiais', 'QOPM', 'DAVI CUNHA', 'DAVI CUNHA LEITAO', '07348479', 'Masculino', 'BPMA', true, '947529152', '1986-03-12', '2018-04-30', '39', '(61)98330-3719', 'davicunha86@gmail.com', '(61)98330-3719', null, 'davi.leitao@pm.df.gov.br', 'Ativo', 'SQNW 107 Bl A'),
  ('6', '1º TEN QOPM', 'Oficiais', 'QOPM', 'ANDRE LUIZ', 'ANDRE LUIZ PEREIRA ARAUJO', '07348908', 'Masculino', 'BPMA', true, '1209730146', '1993-02-08', '2018-04-30', '32', '(61)99965-2746', 'andreluizp.araujo@gmail.com', '(61)99965-2746', null, '21107348908@pm.df.gov.br', 'Ativo', 'SGCV Lote 11'),
  ('7', '1º TEN QOPM', 'Oficiais', 'QOPM', 'CAVALCANTE', 'ALISSON MONTEIRO CAVALCANTE', '07352387', 'Masculino', 'BPMA', true, '3710555124', '1992-05-12', '2019-02-25', '33', '(61)99902-6828', 'alisson.m.cavalcante@gmail.com', '(61)99902-6828', null, '21107352387@pm.df.gov.br', 'Ativo', 'Rua 18'),
  ('8', '2º TEN QOPM', 'Oficiais', 'QOPM', 'PEDRO HENRIQUE', 'PEDRO HENRIQUE ROSA BELLO', '07387563', 'Masculino', 'BPMA', true, '5895248799', '1990-05-21', '2022-02-01', '35', '(61)98247-7314', 'pedrohenrique_spm@hotmail.com', '(61)98247-7314', null, 'pedro.bello@pm.df.gov.br', 'Ativo', 'QI 01 Bloco H'),
  ('9', '2º TEN QOPMA', 'Oficiais', 'QOPMA', 'LEANDRO JOSE', 'LEANDRO JOSE DE LIMA', '00224707', 'Masculino', 'BPMA', true, '60548754187', '1974-07-22', '1997-03-10', '51', '(61)3359-0515', 'leandro.lima309@gmail.com', '(61)3359-0515', '(61)99522-1827', 'leandro.lima@pm.df.gov.br', 'Ativo', 'QR 309 Conjunto 03'),
  ('10', '2º TEN QOPM', 'Oficiais', 'QOPM', 'BUENO', 'HUGGO DE ALCANTARA BARROS BUENO', '07330154', 'Masculino', 'BPMA', true, '3425735195', '1989-09-25', '2014-10-01', '36', '(61)99200-0121', 'hbcfo25@gmail.com', '(61)99200-0121', null, null, 'Ativo', 'QI 23 Lote 02/06 Ed. Guará Nobre'),
  ('11', '2º TEN QOPM', 'Oficiais', 'QOPM', 'CASAS NOVAS', 'PEDRO LUCAS CARDOSO CASAS NOVAS', '07357036', 'Masculino', 'BPMA', true, '1793516138', '1992-12-10', '2019-06-03', '33', '(61)99971-0999', 'plucas.casasnovas@gmail.com', '(61)99971-0999', null, 'pedro.novas@pm.df.gov.br', 'Ativo', 'Alameda das Acácias Quadra 107'),
  ('12', '2º TEN QOPM', 'Oficiais', 'QOPM', 'THAYS', 'THAYS DOS SANTOS GONÇALVES', '07363494', 'Feminino', 'BPMA', true, '4163381198', '1992-11-10', '2020-02-10', '33', '(61)98628-1485', 'thays_s.g@hotmail.com', '(61)98628-1485', null, 'thays.santos@pm.df.gov.br', 'Suspenso', 'QNM 40'),
  ('13', '2º TEN QOPM', 'Oficiais', 'QOPM', 'GUTIERRE', 'GUTIERRE SANTOS MORAIS', '07363729', 'Masculino', 'BPMA', true, '3919918177', '1990-01-13', '2020-02-10', '36', '(61)98438-4198', 'gutierresantos@hotmail.com', '(61)98438-4198', null, 'gutierre.santos@pm.df.gov.br', 'Ativo', 'Rua 25'),
  ('14', 'ST QPPMC', 'Praças', 'QPPMC', 'RODNEI', 'RODNEI TAVARES BARBOSA', '00239453', 'Masculino', 'BPMA', true, '89456025187', '1978-01-24', '1999-10-01', '48', '(61)99557-2927', 'rodneibarbosa@gmail.com', '(61)99557-2927', null, 'rodnei.barbosa@pm.df.gov.br', 'Ativo', 'SMT'),
  ('15', 'ST QPPMC', 'Praças', 'QPPMC', 'LEAL', 'LEONARDO MELO LEAL', '00237221', 'Masculino', 'BPMA', true, '84467002120', '1979-07-28', '1999-10-01', '46', '(61)98637-5843', 'leonardoleal19@gmail.com', '(61)98637-5843', null, 'leonardo.leal@pm.df.gov.br', 'Ativo', 'Quadra 002'),
  ('16', 'ST QPPMC', 'Praças', 'QPPMC', 'VITORINO SOARES', 'ISRAEL VITORINO SOARES VIEIRA', '00236411', 'Masculino', 'BPMA', true, '60667346104', '1975-05-22', '1999-10-01', '50', '(61)98131-5166', 'vitorinosv@hotmail.com', '(61)98131-5166', null, 'israel.vieira@pm.df.gov.br', 'Ativo', 'Quadra 101'),
  ('17', 'ST QPPMC', 'Praças', 'QPPMC', 'LUICIANO', 'LUICIANO LUIZ DE ANDRADE', '00237485', 'Masculino', 'BPMA', true, '70876690100', '1980-09-30', '1999-10-01', '45', '(61)98317-7170', 'llandradefilho@hotmail.com', '(61)98317-7170', '(61)99656-1717', 'luiciano.andrade@pm.df.gov.br', 'Ativo', 'QNG 35'),
  ('18', 'ST QPPMC', 'Praças', 'QPPMC', 'ADALBERTO ARAUJO', 'ADALBERTO ARAUJO', '00183008', 'Masculino', 'BPMA', true, '35919949104', '1969-09-12', '1991-07-01', '56', '(61)99367-2021', 'adalberto120969@gmail.com', '(61)99367-2021', null, 'adalberto.araujo@pm.df.gov.br', 'Ativo', 'QMS 45 Conjunto D'),
  ('19', '1º SGT QPPMC', 'Praças', 'QPPMC', 'CASSIO NASCIMENTO', 'CASSIO BARBOSA NASCIMENTO', '00728632', 'Masculino', 'BPMA', true, '69746982168', '1978-10-12', '2002-06-24', '47', '(61)99239-6114', 'cassiobn@gmail.com', '(61)99239-6114', null, 'cassio.nascimento@pm.df.gov.br', 'Ativo', 'Quadra 01'),
  ('20', '1º SGT QPPMC', 'Praças', 'QPPMC', 'HERMANO', 'HERMANO ARAUJO DOS SANTOS', '00728039', 'Masculino', 'BPMA', true, '70776334115', '1980-08-23', '2002-06-24', '45', '(61)99292-5421', 'hermanoaraujo@gmail.com', '(61)99292-5421', null, 'hermano.santos@pm.df.gov.br', 'Ativo', 'Avenida Pau Brasil'),
  ('21', '1º SGT QPPMC', 'Praças', 'QPPMC', 'RONALD TEIXEIRA', 'RONALD DA SILVA TEIXEIRA', '00730629', 'Masculino', 'BPMA', true, '80604285191', '1977-03-22', '2002-06-24', '48', '(61)3386-1786', 'ronald.teixeira@pm.df.gov.br', '(61)3386-1786', '(61)98211-8989', null, 'Ativo', 'Área Especial'),
  ('22', '1º SGT QPPMC', 'Praças', 'QPPMC', 'ANA ALVES', 'ANA PAULA ALVES RIBEIRO', '00732397', 'Feminino', 'BPMA', true, '62078313149', '1975-01-02', '2002-06-24', '51', '(61)99302-5952', 'regret.ap@hotmail.com', '(61)99302-5952', null, 'ana.ribeiro@pm.df.gov.br', 'Ativo', 'Col. Agríc. Samambaia'),
  ('23', '1º SGT QPPMC', 'Praças', 'QPPMC', 'ARAUJO ANDRADE', 'SÉRGIO FÁBIO DE ARAÚJO ANDRADE', '00729396', 'Masculino', 'BPMA', true, '87963647187', '1977-04-12', '2002-06-24', '48', '(61)99656-7031', 'araujoandradecpma@hotmail.com', '(61)99656-7031', '(61)99644-7702', 'sergio.andrade@pm.df.gov.br', 'Ativo', 'QRC 14'),
  ('24', '1º SGT QPPMC', 'Praças', 'QPPMC', 'F. NASCIMENTO', 'FERNANDO APARECIDO DO NASCIMENTO LELES', '00737402', 'Masculino', 'BPMA', true, '82527059104', '1977-11-07', '2003-04-01', '48', '(61)99919-3119', 'fernando.nascimento@pm.df.gov.br', '(61)99919-3119', '(61)3526-3667', 'fernando.alpha19@gmail.com', 'Ativo', 'QNM 36 Conjunto F'),
  ('25', '1º SGT QPPMC', 'Praças', 'QPPMC', 'GILMAR ALVES', 'GILMAR ALVES DOS SANTOS', '00221430', 'Masculino', 'BPMA', true, '44278489234', '1973-11-15', '1996-08-12', '52', '(61)3378-1920', 'galvesdossantos615@gmail.com', '(61)3378-1920', '(61)98256-3494', 'alves.gilmar@pm.df.gov.br', 'Ativo', 'QNP 10 Conjunto F'),
  ('26', '1º SGT QPPMC', 'Praças', 'QPPMC', 'ROBERTO GONCALVES', 'ROBERTO PEREIRA GONCALVES', '00213985', 'Masculino', 'BPMA', true, '80300367104', '1976-05-16', '1996-05-15', '49', '(61)98201-6840', 'robertoasi@gmail.com', '(61)98201-6840', null, 'pereira.goncalves@pm.df.gov.br', 'Ativo', 'Quadra 001'),
  ('27', '1º SGT QPPMC', 'Praças', 'QPPMC', 'ELTON NERI', 'ELTON NERI DA CONCEICAO', '00217999', 'Masculino', 'BPMA', true, '57941726149', '1972-10-24', '1996-08-12', '53', '(61)99912-2179', 'neri1opl@gmail.com', '(61)99912-2179', '(61)3190-5190', 'neri1opl@hotmail.com', 'Ativo', 'Quadra 031'),
  ('28', '1º SGT QPPMC', 'Praças', 'QPPMC', 'NERO', 'CLAUDIO NERO FERNANDES DA NÓBREGA', '00219487', 'Masculino', 'BPMA', true, '131982460', '1975-06-09', '1996-08-12', '50', '(61)98309-8149', 'nerocantoroficial@gmail.com', '(61)98309-8149', null, 'claudio.nobrega@pm.df.gov.br', 'Ativo', 'Rua 37'),
  ('29', '1º SGT QPPMC', 'Praças', 'QPPMC', 'M. ALEXANDRE', 'MARCIO ALEXANDRE FONSECA ARAUJO', '00221074', 'Masculino', 'BPMA', true, '47749199268', '1974-05-01', '1996-08-12', '51', '(61)99835-4412', 'mshme4@gmail.com', '(61)99835-4412', null, 'marcio.araujo@pm.df.gov.br', 'Ativo', 'EQNP 16/20 Bloco G'),
  ('30', '1º SGT QPPMC', 'Praças', 'QPPMC', 'WELINGTON CAMELO', 'WELINGTON JEAN RICARDO CAMELO SOUSA', '0021759', 'Masculino', 'BPMA', true, '63478226104', '1971-04-13', '1996-08-12', '54', '(61)98417-5195', 'welingtoncamelo@gmail.com', '(61)98417-5195', null, 'welington.sousa@pm.df.gov.br', 'Ativo', 'Área Especial'),
  ('31', '1º SGT QPPMC', 'Praças', 'QPPMC', 'ROBERVAL CASTRO', 'ROBERVAL PAULO DE CASTRO', '00222925', 'Masculino', 'BPMA', true, '82708762168', '1977-01-04', '1997-03-10', '49', '(61)98406-0104', 'robervalcastro09@gmail.com', '(61)98406-0104', '(61)98319-1441', 'roberval.castro@pm.df.gov.br', 'Ativo', 'Q. 107'),
  ('32', '1º SGT QPPMC', 'Praças', 'QPPMC', 'W.LUCAS', 'WELLINGTON LUCAS DA MOTA', '00229180', 'Masculino', 'BPMA', true, '422994626', '1974-10-23', '1998-06-01', '51', '(61)99992-2998', 'wellingtonlucas1947@gmail.com', '(61)99992-2998', '(61)99684-2596', 'wellington.mota@pm.df.gov.br', 'Ativo', 'QR 421'),
  ('33', '1º SGT QPPMC', 'Praças', 'QPPMC', 'EDMILSON SILVA', 'EDMILSON SILVA DOS SANTOS', '00230790', 'Masculino', 'BPMA', true, '64570614191', '1974-06-09', '1998-06-01', '51', '(61)98200-5206', 'edmilsonucb@gmail.com', '(61)98200-5206', '(61)98282-5259', 'silva.edmilson@pm.df.gov.br', 'Ativo', 'QN 12C Conjunto 3'),
  ('34', '1º SGT QPPMC', 'Praças', 'QPPMC', 'MOTTA', 'ISMAEL MOTTA', '00228915', 'Masculino', 'BPMA', true, '49457489187', '1971-05-27', '1998-06-01', '54', '(61)98425-7927', 'motta27@hotmail.com', '(61)98425-7927', null, 'ismael.motta@pm.df.gov.br', 'Ativo', 'Rua Copaíba 1'),
  ('35', '1º SGT QPPMC', 'Praças', 'QPPMC', 'EMERSON SILVA', 'EMERSON FRANCISCO DA SILVA', '00229113', 'Masculino', 'BPMA', true, '58475907172', '1975-08-18', '1998-06-01', '50', '(61)98416-2057', 'emerson2adm@yahoo.com.br', '(61)98416-2057', null, 'emerson.francisco@pm.df.gov.br', 'Ativo', 'SHA'),
  ('36', '1º SGT QPPMC', 'Praças', 'QPPMC', 'DENIS MOURA', 'ANTONIO DENIS MOURA DOS SANTOS', '0023267', 'Masculino', 'BPMA', true, '84836067120', '1978-04-18', '1999-10-01', '47', '(61)99615-1574', 'dennyzmoura@gmail.com', '(61)99615-1574', '(61)3561-2088', 'antonio.denis@pm.df.gov.br', 'Ativo', 'Quadra 210'),
  ('37', '1º SGT QPPMC', 'Praças', 'QPPMC', 'SILVANO', 'GILBERTO SILVANO RODRIGUES', '00235989', 'Masculino', 'BPMA', true, '69602786191', '1978-05-04', '1999-10-01', '47', '(61)2194-8749', 'gilberto.rodrigues@pm.df.gov.br', '(61)2194-8749', '(61)98406-9318', 'gilsilvano@hotmail.com', 'Ativo', 'Quadra 018'),
  ('38', '1º SGT QPPMC', 'Praças', 'QPPMC', 'LUIZ REZENDE', 'LUIZ GERALDO REZENDE', '00244082', 'Masculino', 'BPMA', true, '49173219134', '1971-07-17', '1999-10-01', '54', '(61)99816-0838', 'luiz.rezende@pm.df.gov.br', '(61)99816-0838', null, null, 'Ativo', 'QR 408 Conjunto 04'),
  ('39', '1º SGT QPPMC', 'Praças', 'QPPMC', 'VILELA DIAS', 'LEONARDO CUNHA VILELA DIAS', '00237132', 'Masculino', 'BPMA', true, '84504684187', '1980-02-04', '1999-10-01', '45', '(61)3397-6474', 'leoqna2@gmail.com', '(61)3397-6474', '(61)98404-2848', 'leonardo.dias@pm.df.gov.br', 'Ativo', 'RUA 04'),
  ('40', '1º SGT QPPMC', 'Praças', 'QPPMC', 'UZIEL FERNANDES', 'UZIEL DE SA FERNANDES', '00240257', 'Masculino', 'BPMA', true, '58502289187', '1971-01-27', '1999-10-01', '55', '(61)92004-5292', 'uziel.fernandes@pm.df.gov.br', '(61)92004-5292', '(61)99640-5184', 'uzielsfernandes@gmail.com', 'Suspenso', 'QR 05 Conjunto E'),
  ('41', '1º SGT QPPMC', 'Praças', 'QPPMC', 'GONZAGA', 'FABIO GONZAGA DE BRITO', '00244007', 'Masculino', 'BPMA', true, '81228988153', '1977-04-28', '1999-10-01', '48', '(61)99975-2828', 'fabiobritus@gmail.com', '(61)99975-2828', null, 'fabio.brito@pm.df.gov.br', 'Ativo', 'QNN 22 Conjunto F'),
  ('42', '1º SGT QPPMC', 'Praças', 'QPPMC', 'LEOMAR SILVA', 'LEOMAR PEDRO DA SILVA', '00242624', 'Masculino', 'BPMA', true, '61815039191', '1973-08-16', '1999-10-01', '52', '(61)99685-8449', 'leomar16pedro@gmail.com', '(61)99685-8449', null, 'leomar.silva@pm.df.gov.br', 'Ativo', 'QRI 17'),
  ('43', '1º SGT QPPMC', 'Praças', 'QPPMC', 'JESSE CLEITON', 'JESSE CLEITON SANTANA DE OLIVEIRA', '00241334', 'Masculino', 'BPMA', true, '79362486172', '1975-08-28', '1999-10-01', '50', '(61)99135-8228', 'jessecleiton.ucb@gmail.com', '(61)99135-8228', '(61)98457-9050', 'jesse.oliveira@pm.df.gov.br', 'Suspenso', 'QR 02 Conjunto E'),
  ('44', '1º SGT QPPMC', 'Praças', 'QPPMC', 'LIVIO', 'LIVIO ALESSANDRO GOMES ALVES', '00237442', 'Masculino', 'BPMA', true, '86385879100', '1979-12-16', '1999-10-01', '46', '(61)98410-7586', 'livioalessandro@gmail.com', '(61)98410-7586', '(61)98138-0740', 'livio.alves@pm.df.gov.br', 'Ativo', 'Rua das Pitangueiras'),
  ('45', '1º SGT QPPMC', 'Praças', 'QPPMC', 'BERNARDO', 'ALLAN BERNARDO DE PAIVA SOUZA LIMA', '00231975', 'Masculino', 'BPMA', true, '57978735168', '1974-09-11', '1999-10-01', '51', '(61)99955-5510', 'allanbernardo2008@hotmail.com', '(61)99955-5510', '(61)99955-5910', 'allan.lima@pm.df.gov.br', 'Ativo', 'Quadra 103'),
  ('46', '1º SGT QPPMC', 'Praças', 'QPPMC', 'F. CORREIA', 'MAURO FERNANDO CORREIA', '00242942', 'Masculino', 'BPMA', true, '69784035120', '1978-04-27', '1999-10-01', '47', '(61)99801-9297', 'maurofernando01@gmail.com', '(61)99801-9297', null, 'mauro.correia@pm.df.gov.br', 'Ativo', 'Módulo B Lote'),
  ('47', '1º SGT QPPMC', 'Praças', 'QPPMC', 'LUIZ CEZAR', 'ANDRE LUIZ BARBOSA CEZAR', '00232475', 'Masculino', 'BPMA', true, '81601441134', '1977-05-24', '1999-10-01', '48', '(61)99325-3052', 'albcezar@gmail.com', '(61)99325-3052', null, 'andre.cezar@pm.df.gov.br', 'Ativo', 'QI 14 Conjunto Z'),
  ('48', '1º SGT QPPMC', 'Praças', 'QPPMC', 'JOSE CARVALHO', 'EVANIMAR JOSE MARQUES CARVALHO', '00730289', 'Masculino', 'BPMA', true, '88842843172', '1976-05-17', '2002-06-24', '49', '(61)98355-0051', 'carvalhopmdf@gmail.com', '(61)98355-0051', null, 'evanimar.carvalho@pm.df.gov.br', 'Ativo', 'Rodovia DF-001 Km 1'),
  ('49', '1º SGT QPPMC', 'Praças', 'QPPMC', 'PAULO BOMFIM', 'PAULO ROBERTO FERREIRA BOMFIM', '00728012', 'Masculino', 'BPMA', true, '84984910100', '1980-07-07', '2002-06-24', '45', '(61)99209-1667', 'paulo.bomfim@pm.df.gov.br', '(61)99209-1667', '(61)99998-5335', 'plrbomfim@gmail.com', 'Ativo', 'Condomínio Estância Quintas da Alvorada'),
  ('50', '1º SGT QPPMC', 'Praças', 'QPPMC', 'MARCELO MELO', 'MARCELO FERREIRA DE MELO', '00730858', 'Masculino', 'BPMA', true, '69957363115', '1981-03-17', '2002-06-24', '44', '(61)98511-6676', 'marcelod20@gmail.com', '(61)98511-6676', null, 'ferreira.melo@pm.df.gov.br', 'Ativo', 'SQN 404 Bloco E'),
  ('51', '1º SGT QPPMC', 'Praças', 'QPPMC', 'R. RIBEIRO', 'RENATO PEREIRA RIBEIRO', '02153866', 'Masculino', 'BPMA', true, '70670145149', '1978-11-30', '2010-12-15', '47', '(61)99266-1592', 'renato.ribeiro@pm.df.gov.br', '(61)99266-1592', null, 'renato.ted.elaine@gmail.com', 'Ativo', 'Rua 6 Chácara 265'),
  ('52', '2º SGT QPPMC', 'Praças', 'QPPMC', 'BRICIO ALVES', 'BRICIO HERBERT ALVES TEIXEIRA', '07322631', 'Masculino', 'BPMA', true, '98523317104', '1986-05-17', '2014-04-01', '39', '(61)98565-5269', 'bricio.herbert@gmail.com', '(61)98565-5269', null, null, 'Suspenso', 'QNN 27 Módulo C'),
  ('53', '2º SGT QPPMC', 'Praças', 'QPPMC', 'IGOR', 'IGOR SANTOS NUNES', '07313993', 'Masculino', 'BPMA', true, '817987509', '1983-02-18', '2014-03-14', '42', '(61)99979-4150', 'igorsannes@gmail.com', '(61)99979-4150', null, 'igor.nunes@pm.df.gov.br', 'Ativo', 'CSG 03'),
  ('54', '2º SGT QPPMC', 'Praças', 'QPPMC', 'PAULO PINHEIRO', 'RODOLFO MEDEIROS DE PAULO PINHEIRO', '07320582', 'Masculino', 'BPMA', true, '916914194', '1985-03-24', '2014-03-14', '40', '(61)98155-1410', 'rodolfompp@gmail.com', '(61)98155-1410', null, 'rodolfo.pinheiro@pm.df.gov.br', 'Ativo', 'Quadra QC 7 Rua G'),
  ('55', '2º SGT QPPMC', 'Praças', 'QPPMC', 'SIRQUEIRA DIAS', 'DANIEL ANTONIO SIRQUEIRA DIAS', '07318960', 'Masculino', 'BPMA', true, '3097549170', '1989-11-16', '2014-03-14', '36', '(61)98596-6050', 'danielsirqueira@hotmail.com', '(61)98596-6050', null, 'daniel.sirqueira@pm.df.gov.br', 'Ativo', 'QNE 19'),
  ('56', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ECHAMENDE', 'FERNANDA DOS SANTOS ECHAMENDE', '07315902', 'Feminino', 'BPMA', true, '701197161', '1983-11-13', '2014-03-14', '42', '(61)3963-2891', 'fernandaechamende@hotmail.com', '(61)3963-2891', '(61)98267-0026', 'fernanda.echamende@pm.df.gov.br', 'Ativo', 'SQN 102 Bloco A'),
  ('57', '2º SGT QPPMC', 'Praças', 'QPPMC', 'HINGREDY', 'MARCIA HINGREDY ATAIDES DE SOUZA', '07313012', 'Feminino', 'BPMA', true, '1715929136', '1988-01-11', '2014-03-14', '38', '(61)99802-5358', 'marciahingredy@gmail.com', '(61)99802-5358', null, 'marcia.ataides@pm.df.gov.br', 'Ativo', 'Rua 25'),
  ('58', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MARTINS BARBOSA', 'RODRIGO MARTINS DO NASCIMENTO BARBOSA', '07315910', 'Masculino', 'BPMA', true, '3300284139', '1989-04-14', '2014-03-14', '36', '(61)98117-7980', 'rmnb20@yahoo.com.br', '(61)98117-7980', null, 'rodrigo.barbosa@pm.df.gov.br', 'Ativo', 'SHA Conjunto 5 Chácara 22'),
  ('59', '2º SGT QPPMC', 'Praças', 'QPPMC', 'VITOR DANTAS', 'VITOR GABRIEL LIMA DANTAS', '07316771', 'Masculino', 'BPMA', true, '2853791190', '1992-02-21', '2014-03-14', '33', '(61)98507-6375', 'vitor210292@hotmail.com', '(61)98507-6375', null, 'vitor.dantas@pm.df.gov.br', 'Ativo', 'QI 18 Bloco T'),
  ('60', '2º SGT QPPMC', 'Praças', 'QPPMC', 'W. COUTINHO', 'WESLEY COUTINHO DE LIMA', '07316844', 'Masculino', 'BPMA', true, '99445760182', '1983-05-20', '2014-03-14', '42', '(61)3380-1231', 'wesley.clima@hotmail.com', '(61)3380-1231', '(61)99331-1589', 'wesley.coutinho@pm.df.gov.br', 'Ativo', 'Núcleo Rural Vargem Bonita'),
  ('61', '2º SGT QPPMC', 'Praças', 'QPPMC', 'LUCAS ALVES', 'LUCAS ALVES MIRANDA', '0731471', 'Masculino', 'BPMA', true, '641599145', '1985-05-25', '2014-03-14', '40', '(62)9363-0464', 'lucas.miranda@pm.df.gov.br', '(62)9363-0464', '(62)99159-8396', null, 'Ativo', 'Rua 9'),
  ('62', '2º SGT QPPMC', 'Praças', 'QPPMC', 'M. VIEIRA', 'MARCILIO CARNEIRO ALVES VIEIRA', '07321317', 'Masculino', 'BPMA', true, '1206371110', '1987-03-13', '2014-03-14', '38', '(61)98510-0275', 'marciliohb_04@hotmail.com', '(61)98510-0275', null, 'marcilio.vieira@pm.df.gov.br', 'Ativo', 'Rua Copaíba'),
  ('63', '2º SGT QPPMC', 'Praças', 'QPPMC', 'D. BRAGA', 'DENISSON DE SOUZA BRAGA', '07320191', 'Masculino', 'BPMA', true, '70116695153', '1982-06-21', '2014-03-14', '43', '(61)99252-1220', 'denisson.b@gmail.com', '(61)99252-1220', null, 'denisson.braga@pm.df.gov.br', 'Ativo', 'Rua 22'),
  ('64', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ALVES SILVA', 'THIAGO ALVES DA SILVA', '07315090', 'Masculino', 'BPMA', true, '1920378111', '1986-04-10', '2014-03-14', '39', '(61)98513-3833', 'thiagoalvesgama@hotmail.com', '(61)98513-3833', null, 'alves.thiago@pm.df.gov.br', 'Ativo', 'Avenida Jequitibá'),
  ('65', '2º SGT QPPMC', 'Praças', 'QPPMC', 'TOLEDO RAMOS', 'RAFAEL TOLEDO RAMOS', '07316518', 'Masculino', 'BPMA', true, '123630142', '1988-11-17', '2014-03-14', '37', '(62)3702-0916', 'rafaeltoledoramos@gmail.com', '(62)3702-0916', '(62)99179-6488', 'rafael.ramos@pm.df.gov.br', 'Ativo', 'Rua T. Bastos'),
  ('66', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ERICK NUNES', 'WELYSSON ERICK MACHADO NUNES', '07317921', 'Masculino', 'BPMA', true, '1789553105', '1986-12-30', '2014-03-14', '39', '(61)99183-4546', 'welysson@hotmail.com', '(61)99183-4546', null, 'welysson.nunes@pm.df.gov.br', 'Ativo', 'QS 06'),
  ('67', '2º SGT QPPMC', 'Praças', 'QPPMC', 'WELITON SANTOS', 'WELITON WAGNER DOS SANTOS', '07322569', 'Masculino', 'BPMA', true, '5958260677', '1983-04-17', '2014-03-14', '42', '(61)98129-0751', 'welitonfisio@gmail.com', '(61)98129-0751', null, 'weliton.santos@pm.df.gov.br', 'Ativo', 'Quadra 206'),
  ('68', '2º SGT QPPMC', 'Praças', 'QPPMC', 'JULIO OGAWA', 'JULIO CEZAR GABRIEL OGAWA', '07314876', 'Masculino', 'BPMA', true, '3428655109', '1988-12-29', '2014-03-14', '37', '(61)99149-7860', 'jc_ogawa@hotmail.com', '(61)99149-7860', null, 'julio.ogawa@pm.df.gov.br', 'Ativo', 'C 01'),
  ('69', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MARANHAO', 'RAFAEL MARANHAO COSTA E SILVA', '07318553', 'Masculino', 'BPMA', true, '1267940140', '1985-10-12', '2014-03-14', '40', '(61)99553-8255', 'rafael.maranhao@pm.df.gov.br', '(61)99553-8255', null, 'rafama1985@gmail.com', 'Ativo', 'Avenida Parque Águas Claras'),
  ('70', '2º SGT QPPMC', 'Praças', 'QPPMC', 'RENATO ROSA', 'RENATO MARQUES ROSA DE OLIVEIRA', '07323859', 'Masculino', 'BPMA', true, '69422575168', '1987-08-05', '2014-04-10', '38', '(61)99648-9228', 'renatomro@hotmail.com', '(61)99648-9228', null, 'renato.rosa@pm.df.gov.br', 'Ativo', 'Rua 3B Chácara 38'),
  ('71', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ROGERIO PORTELA', 'ROGERIO XIMENES PORTELA', '07315139', 'Masculino', 'BPMA', true, '614684102', '1986-01-17', '2014-03-14', '40', '(61)3359-3462', 'rogerioxp17@gmail.com', '(61)3359-3462', '(61)98207-2778', 'rogerio.portela@pm.df.gov.br', 'Ativo', 'QR 405 Conjunto 19'),
  ('72', '2º SGT QPPMC', 'Praças', 'QPPMC', 'SAULO COSTA', 'SAULO ELEUTERIO COSTA', '07319126', 'Masculino', 'BPMA', true, '72945761149', '1986-10-14', '2014-03-14', '39', '(61)3340-4276', 'eleuteriocosta@gmail.com', '(61)3340-4276', '(61)99972-1498', 'saulo.costa@pm.df.gov.br', 'Ativo', 'Rua 1 Chácara 25'),
  ('73', '2º SGT QPPMC', 'Praças', 'QPPMC', 'GREICY', 'GREICY ERNESTINA DA SILVA', '0731549', 'Feminino', 'BPMA', true, '92995330168', '1982-10-15', '2014-03-14', '43', '(62)99974-2831', 'greicy_bio@hotmail.com', '(62)99974-2831', '(62)9974-2831', 'greicy.silva@pm.df.gov.br', 'Ativo', 'Rua Ecocatu'),
  ('74', '2º SGT QPPMC', 'Praças', 'QPPMC', 'RONIE SOUSA', 'RONIE VON FONSECA DE SOUSA', '02184583', 'Masculino', 'BPMA', true, '4712041617', '1982-07-31', '2011-10-10', '43', '(61)98327-4470', 'ronisousapm@gmail.com', '(61)98327-4470', '(61)98606-1955', 'ronie.sousa@iscp.edu.br', 'Ativo', 'QNN 27 Módulo C'),
  ('75', '2º SGT QPPMC', 'Praças', 'QPPMC', 'M. CHIARINI', 'MARCELO NOGUEIRA CHIARINI', '07320973', 'Masculino', 'BPMA', true, '70842051104', '1980-12-17', '2014-03-24', '45', '(61)99211-0633', 'marcelonch@gmail.com', '(61)99211-0633', null, 'marcelo.chiarini@pm.df.gov.br', 'Ativo', 'SHIN QI 16 Conjunto 02'),
  ('76', '2º SGT QPPMC', 'Praças', 'QPPMC', 'E. MEIRA', 'EDIMILSON MEIRA DOS SANTOS', '07318561', 'Masculino', 'BPMA', true, '758974159', '1982-11-23', '2014-03-14', '43', '(61)99939-1219', 'edimilson.meira@pm.df.gov.br', '(61)99939-1219', null, 'edimilson.meira@gmail.com', 'Ativo', 'QS 101'),
  ('77', '2º SGT QPPMC', 'Praças', 'QPPMC', 'F. BUENO', 'FABRICIO BUENO MAGALHÃES', '07318138', 'Masculino', 'BPMA', true, '72305568134', '1984-02-03', '2014-03-14', '41', '(61)99936-2103', 'fabricio.buenomagalhaes@gmail.com', '(61)99936-2103', '(61)9936-2103', 'fabricio.magalhaes@pm.df.gov.br', 'Ativo', 'Rua 5 Chácara 102'),
  ('78', '2º SGT QPPMC', 'Praças', 'QPPMC', 'FLAVIO', 'FLAVIO PEREIRA MACEDO', '07314051', 'Masculino', 'BPMA', true, '6829648670', '1983-02-18', '2014-03-14', '42', '(61)98288-9815', 'flaviogeografia@gmail.com', '(61)98288-9815', null, 'pereira.macedo@pm.df.gov.br', 'Ativo', 'Área Especial Módulo 04 Módulo B'),
  ('79', '2º SGT QPPMC', 'Praças', 'QPPMC', 'CADETE', 'WESLEY DE GODOY CADETE', '00740365', 'Masculino', 'BPMA', true, '70504938134', '1981-10-17', '2003-04-01', '44', '(61)98537-4305', 'wesley.cadete@pm.df.gov.br', '(61)98537-4305', null, 'wgcadete@gmail.com', 'Ativo', 'SMPW Quadra 06 Conjunto 02'),
  ('80', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MARCEL FERNANDES', 'MARCEL LARA FERNANDES', '00738549', 'Masculino', 'BPMA', true, '86104667104', '1979-04-06', '2003-04-01', '46', '(61)99268-5587', 'marcellara@gmail.com', '(61)99268-5587', null, 'marcel.fernandes@pm.df.gov.br', 'Ativo', 'SQS 115 Bloco A'),
  ('81', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MOURA CAMPOS', 'PAULO HENRIQUE DE MOURA CAMPOS', '07320604', 'Masculino', 'BPMA', true, '3306414174', '1990-08-21', '2014-03-14', '35', '(61)3308-3010', 'paulodemoura7@gmail.com', '(61)3308-3010', '(61)99318-0748', 'henrique.campos@pm.df.gov.br', 'Ativo', 'Quadra 24 Conjunto K'),
  ('82', '2º SGT QPPMC', 'Praças', 'QPPMC', 'LEONARDO SALLES', 'LEONARDO DE SALLES', '00237388', 'Masculino', 'BPMA', true, '63581140187', '1977-11-22', '1999-10-01', '48', '(61)99997-1040', 'leonardo.salles@pm.df.gov.br', '(61)99997-1040', null, 'sallespatamo@gmail.com', 'Ativo', 'SHA'),
  ('83', '2º SGT QPPMC', 'Praças', 'QPPMC', 'FALCAO BRITO', 'DEIVID RODRIGUES FALCAO DE BRITO', '07316100', 'Masculino', 'BPMA', true, '2113667142', '1988-04-29', '2014-03-14', '37', '(61)98400-5913', 'fbdeivid@gmail.com', '(61)98400-5913', null, 'deivid.brito@pm.df.gov.br', 'Ativo', 'AC 02'),
  ('84', '2º SGT QPPMC', 'Praças', 'QPPMC', 'R. AQUINO', 'YURY RIBEIRO DE AQUINO', '07316054', 'Masculino', 'BPMA', true, '2496263147', '1987-12-27', '2014-03-14', '38', '(61)98123-5757', 'yurybsb@hotmail.com', '(61)98123-5757', null, 'yury.aquino@pm.df.gov.br', 'Ativo', 'Rua Copaíba'),
  ('85', '2º SGT QPPMC', 'Praças', 'QPPMC', 'SEM GOMES', 'SEM OLIVEIRA GOMES', '00740195', 'Masculino', 'BPMA', true, '95760598104', '1982-11-13', '2003-04-01', '43', '(61)3025-6735', 'semoliveira@bol.com.br', '(61)3025-6735', '(61)99627-0933', 'sem.gomes@pm.df.gov.br', 'Ativo', 'Quadra 41-45'),
  ('86', '2º SGT QPPMC', 'Praças', 'QPPMC', 'C. MEDEIROS', 'CARLOS EDUARDO MEDEIROS', '00740934', 'Masculino', 'BPMA', true, '72699884120', '1982-06-07', '2003-04-01', '43', '(61)98493-3181', 'caledu82@hotmail.com', '(61)98493-3181', null, 'eduardo.medeiros@pm.df.gov.br', 'Ativo', 'SHA Conjunto 4 Chácara 58B'),
  ('87', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MAENDLI', 'MAENDLI TENIS DA HORA JUNIOR', '0073876', 'Masculino', 'BPMA', true, '85317705134', '1979-01-16', '2003-04-01', '47', '(61)98111-0991', 'maendlidahora@gmail.com', '(61)98111-0991', null, 'maendli.junior@pm.df.gov.br', 'Ativo', 'QNN 12'),
  ('88', '2º SGT QPPMC', 'Praças', 'QPPMC', 'AUCEMI', 'AUCEMI DA SILVA LIMA', '00739820', 'Masculino', 'BPMA', true, '52479196100', '1973-03-04', '2003-04-01', '52', '(61)98447-5445', 'aucemi.lima@pm.df.gov.br', '(61)98447-5445', '(54)45744-8961', null, 'Ativo', 'QR 04 Conjunto A'),
  ('89', '2º SGT QPPMC', 'Praças', 'QPPMC', 'PAULO BRAGA', 'PAULO EDUARDO DE PAIVA BRAGA', '00741566', 'Masculino', 'BPMA', true, '89631110168', '1980-10-31', '2003-04-01', '45', '(61)98254-0080', 'paulopaivabraga@gmail.com', '(61)98254-0080', null, 'paulo.braga@pm.df.gov.br', 'Ativo', 'Condomínio Solar de Brasília'),
  ('90', '2º SGT QPPMC', 'Praças', 'QPPMC', 'D. DAMASCENO', 'DANIEL BORGES DAMASCENO', '00736538', 'Masculino', 'BPMA', true, '94213798100', '1981-12-08', '2003-04-01', '44', '(61)98175-5441', 'danielbdamasceno@gmail.com', '(61)98175-5441', null, 'daniel.damasceno@pm.df.gov.br', 'Ativo', 'Avenida Central Bloco 1485'),
  ('91', '2º SGT QPPMC', 'Praças', 'QPPMC', 'PAULO CELIO', 'PAULO CELIO VIEIRA', '0073943', 'Masculino', 'BPMA', true, '65899547120', '1977-01-26', '2003-04-01', '49', '(61)99978-1371', 'celioovieiraa@gmail.com', '(61)99978-1371', null, 'celio.vieira@pm.df.gov.br', 'Ativo', 'Quadra 5'),
  ('92', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MARCUS BARREIRA', 'MARCUS VINICIUS RODRIGUES BARREIRA', '0073909', 'Masculino', 'BPMA', true, '86783696120', '1976-03-28', '2003-04-01', '49', '(61)99562-6428', 'facanacaveirabarreira@gmail.com', '(61)99562-6428', null, 'marcus.barreira@pm.df.gov.br', 'Ativo', 'Rua 37'),
  ('93', '2º SGT QPPMC', 'Praças', 'QPPMC', 'BRUNO CUNHA', 'BRUNO LIMA DA CUNHA', '01954695', 'Masculino', 'BPMA', true, '70497141191', '1984-02-09', '2010-09-20', '41', '(61)98186-8589', 'bruno.cunha@pm.df.gov.br', '(61)98186-8589', null, 'brunolima1954695@gmail.com', 'Ativo', 'Rua 3 Chácara 46A'),
  ('94', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ALLAN LOPES', 'ALLAN ROGERIO FARIAS LOPES', '01959573', 'Masculino', 'BPMA', true, '70376115149', '1980-01-17', '2010-09-20', '46', '(61)98488-6667', 'allanrogerio@yahoo.com.br', '(61)98488-6667', null, 'allan.lopes@pm.df.gov.br', 'Suspenso', 'SMPW Quadra 22 Conjunto 01'),
  ('95', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MASSAMI', 'CARLOS MASSAMI DE MACEDO ENDO', '01955306', 'Masculino', 'BPMA', true, '1688001107', '1986-10-27', '2010-09-20', '39', '(61)98535-9694', 'massamicarlos@gmail.com', '(61)98535-9694', null, 'carlos.endo@pm.df.gov.br', 'Ativo', 'QR 01-A Conjunto M'),
  ('96', '2º SGT QPPMC', 'Praças', 'QPPMC', 'HOLANDA', 'FLAVIO ALVES DE HOLANDA', '0195976', 'Masculino', 'BPMA', true, '69916209120', '1979-04-11', '2010-09-20', '46', '(61)98191-9920', 'flavio.holanda@pm.df.gov.br', '(61)98191-9920', '(06)19819-1992', null, 'Ativo', 'QNM 34 Conjunto L'),
  ('97', '2º SGT QPPMC', 'Praças', 'QPPMC', 'P. MACHADO', 'PAULO ROBERTO BATISTA MACHADO', '01955411', 'Masculino', 'BPMA', true, '68860374120', '1981-09-28', '2010-09-20', '44', '(61)98103-1573', 'beto.df1@gmail.com', '(61)98103-1573', null, 'batista.paulo@pm.df.gov.br', 'Ativo', 'SQN 416 Bloco C'),
  ('98', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ALVES COSTA', 'LUCAS ALVES COSTA DA SILVA', '01962477', 'Masculino', 'BPMA', true, '4484112612', '1978-07-08', '2010-09-20', '47', '(61)3208-5811', 'securelucas@protonmail.ch', '(61)3208-5811', '(61)98214-7715', 'lucas.silva@pm.df.gov.br', 'Ativo', 'Quadra 203'),
  ('99', '2º SGT QPPMC', 'Praças', 'QPPMC', 'GIULLIANO', 'GIULLIANO DE SOUZA CAMPOS', '01963074', 'Masculino', 'BPMA', true, '2247276130', '1987-10-01', '2010-09-20', '38', '(62)98431-3493', 'giullianosi@gmail.com', '(62)98431-3493', null, 'giullianopmdf@gmail.com', 'Ativo', 'Rua Domingos Garcia Rosa'),
  ('100', '2º SGT QPPMC', 'Praças', 'QPPMC', 'JORGE', 'JORGE PEREIRA DE MELO', '01966774', 'Masculino', 'BPMA', true, '86463110159', '1979-12-03', '2010-10-15', '46', '(61)99873-1818', 'jorgemelooficial@gmail.com', '(61)99873-1818', null, 'jorge.melo@pm.df.gov.br', 'Suspenso', 'Quadra 043'),
  ('101', '2º SGT QPPMC', 'Praças', 'QPPMC', 'N', 'GIL N HENRIQUE LOPES DOS SANTOS', '02149419', 'Masculino', 'BPMA', true, '72942274115', '1983-03-30', '2010-12-15', '42', '(61)98453-4001', 'losatohenrique@gmail.com', '(61)98453-4001', null, 'gil.santos@pm.df.gov.br', 'Ativo', 'QNJ 06'),
  ('102', '2º SGT QPPMC', 'Praças', 'QPPMC', 'SHIKASHO', 'LUIS EDUARDO SHIKASHO', '02149397', 'Masculino', 'BPMA', true, '22305792824', '1982-04-24', '2010-12-15', '43', '(61)99968-6455', 'luiseduardobsb@gmail.com', '(61)99968-6455', null, 'luis.shikasho@pm.df.gov.br', 'Ativo', 'QR 108 Conjunto 07-B'),
  ('103', '2º SGT QPPMC', 'Praças', 'QPPMC', 'V. FERREIRA', 'RAPHAEL VINICIUS DE OLIVEIRA FERREIRA', '02149621', 'Masculino', 'BPMA', true, '328993190', '1983-10-20', '2010-12-15', '42', '(61)98471-6951', 'raphaelvof@gmail.com', '(61)98471-6951', null, 'raphael.ferreira@pm.df.gov.br', 'Ativo', 'SHA'),
  ('104', '2º SGT QPPMC', 'Praças', 'QPPMC', 'E. TAVARES', 'EULER TAVARES DA COSTA', '02151189', 'Masculino', 'BPMA', true, '4537465603', '1980-04-01', '2010-12-15', '45', '(61)98242-8028', 'eullertavares@gmail.com', '(61)98242-8028', '(61)3225-7712', 'euller.costa@pm.df.gov.br', 'Ativo', 'Rua 4 Chácara 26'),
  ('105', '2º SGT QPPMC', 'Praças', 'QPPMC', 'WESLEN SILVA', 'WESLEN COSTA DA SILVA', '0215093', 'Masculino', 'BPMA', true, '95933999172', '1982-01-18', '2010-12-15', '44', '(61)98537-3555', 'weslen.new@hotmail.com', '(61)98537-3555', '(61)8537-3555', 'weslen.silva@pm.df.gov.br', 'Ativo', 'SQS 414 Bloco J'),
  ('106', '2º SGT QPPMC', 'Praças', 'QPPMC', 'MIKHAIL', 'FERNANDO MIKHAIL DE ALBUQUERQUE PINHEIRO', '02154250', 'Masculino', 'BPMA', true, '67924794204', '1981-09-12', '2010-12-15', '44', '(61)98202-0888', 'fernandomikhail@gmail.com', '(61)98202-0888', null, 'fernando.pinheiro@pm.df.gov.br', 'Ativo', 'Rua 25'),
  ('107', '2º SGT QPPMC', 'Praças', 'QPPMC', 'ELVIS SOARES', 'ELVIS ROBERTO DA CONCEICAO SOARES', '02156180', 'Masculino', 'BPMA', true, '714641154', '1984-08-31', '2010-12-22', '41', '(61)3222-5421', 'elvisroberto58@gmail.com', '(61)3222-5421', '(61)99699-9826', 'elvis.conceicao@pm.df.gov.br', 'Ativo', 'Rua 3'),
  ('108', '2º SGT QPPMC', 'Praças', 'QPPMC', 'C. NUNES', 'THIAGO ROBERTO CASTRO NUNES', '02155990', 'Masculino', 'BPMA', true, '527168130', '1984-01-20', '2011-01-03', '42', '(61)98196-6662', 'thiago_trcn@hotmail.com', '(61)98196-6662', '(61)98422-3514', 'thiago.nunes@pm.df.gov.br', 'Ativo', 'Habitacional IAPI Chácara 7'),
  ('109', '2º SGT QPPMC', 'Praças', 'QPPMC', 'LAGO', 'FABIO FRANCISCO LAGO PEREIRA', '01999176', 'Masculino', 'BPMA', true, '917479106', '1986-06-09', '2010-12-15', '39', '(61)98457-5886', 'fabio.lago@ymail.com', '(61)98457-5886', null, 'fabio.lago@pm.df.gov.br', 'Ativo', 'Rua 6 Chácara 267'),
  ('110', '2º SGT QPPMC', 'Praças', 'QPPMC', 'RAUL MEIRA', 'RAUL ERNESTO MEIRA MAGALHAES', '02149648', 'Masculino', 'BPMA', true, '58422641100', '1986-11-25', '2010-12-15', '39', '(61)3244-8491', 'raul.magalhaes@pm.df.gov.br', '(61)3244-8491', '(61)98141-2525', null, 'Ativo', 'SHIS QI 11 Conjunto 01'),
  ('111', '2º SGT QPPMC', 'Praças', 'QPPMC', 'BRENO', 'BRENO DOS SANTOS SILVA', '01998560', 'Masculino', 'BPMA', true, '45083193', '1982-08-25', '2010-12-15', '43', '(61)3551-1876', 'sanvasiltos@gmail.com', '(61)3551-1876', '(61)98580-2771', 'breno.santos@pm.df.gov.br', 'Ativo', 'Rua 25'),
  ('112', '3º SGT QPPMC', 'Praças', 'QPPMC', 'H. LASMAR', 'KAYO HENRIQUE LASMAR BARBOSA VIEIRA', '07323980', 'Masculino', 'BPMA', true, '73392669172', '1987-03-05', '2014-04-10', '38', '(61)8154-7527', 'kayo_lasmar@hotmail.com', '(61)8154-7527', '(61)98154-7527', 'kayo.vieira@pm.df.gov.br', 'Ativo', 'Terceira Avenida Área Especial 12 (Mercado Núcleo Bandeirante)'),
  ('113', '3º SGT QPPMC', 'Praças', 'QPPMC', 'P. CAETANO', 'PEDRO HELIO CAETANO RIBAS', '07320213', 'Masculino', 'BPMA', true, '898699150', '1992-07-14', '2014-03-14', '33', '(61)98332-4801', 'pedrocaetano144@gmail.com', '(61)98332-4801', null, 'pedro.ribas@pm.df.gov.br', 'Ativo', 'Rua 22'),
  ('114', '3º SGT QPPMC', 'Praças', 'QPPMC', 'T. CARVALHO', 'THIAGO DE OLIVEIRA CARVALHO', '07318545', 'Masculino', 'BPMA', true, '647626101', '1985-11-02', '2014-03-14', '40', '(61)3254-4275', 'thiagocarvalho.pmdf@gmail.com', '(61)3254-4275', '(61)99942-9007', 'thiago.carvalho@pm.df.gov.br', 'Ativo', 'Quadra 2 Conjunto D-13'),
  ('115', '3º SGT QPPMC', 'Praças', 'QPPMC', 'FILIPE LIRA', 'FILIPE XAVIER DE LIRA SILVA', '07321422', 'Masculino', 'BPMA', true, '72434627153', '1982-07-26', '2014-03-14', '43', '(61)3546-6086', 'filipexavier3@gmail.com', '(61)3546-6086', '(61)99286-1908', 'filipe.lira@pm.df.gov.br', 'Ativo', 'SQSW 101 Bloco I'),
  ('116', '3º SGT QPPMC', 'Praças', 'QPPMC', 'EDUARDO RIBEIRO', 'EDUARDO RIBEIRO PIMENTEL', '07322143', 'Masculino', 'BPMA', true, '72347228153', '1982-05-25', '2014-03-14', '43', '(61)98469-1133', 'eduardo.pimentel@pm.df.gov.br', '(61)98469-1133', null, 'dudurpi@gmail.com', 'Ativo', 'AC 02'),
  ('117', '3º SGT QPPMC', 'Praças', 'QPPMC', 'NATAN', 'NATAN MANOEL BARBOSA E SILVA DAS CHAGAS', '0731812', 'Masculino', 'BPMA', true, '3749970122', '1990-08-11', '2014-03-14', '35', '(61)3488-3821', 'natanmanoel@gmail.com', '(61)3488-3821', '(61)99219-5171', 'natan.chagas@pm.df.gov.br', 'Ativo', 'Condomínio Mestre D''Armas'),
  ('118', '3º SGT QPPMC', 'Praças', 'QPPMC', 'HENRIQUE CRUZ', 'CARLOS HENRIQUE CRUZ DE QUEIROZ', '0732040', 'Masculino', 'BPMA', true, '1521317100', '1988-06-04', '2014-03-14', '37', '(61)3551-1424', 'henrique.queiroooz@gmail.com', '(61)3551-1424', '(61)99567-1529', 'henrique.queiroz@pm.df.gov.br', 'Ativo', 'EQ 22/26'),
  ('119', '3º SGT QPPMC', 'Praças', 'QPPMC', 'BONFIM', 'DENIS DE SOUZA BONFIM', '07329393', 'Masculino', 'BPMA', true, '1128482142', '1988-01-23', '2014-10-01', '38', '(61)99293-0021', 'denis.bonfim@pm.df.gov.br', '(61)99293-0021', null, 'denis.bonfim@gmail.com', 'Ativo', 'EPTG-QE 01 Conjunto E'),
  ('120', '3º SGT QPPMC', 'Praças', 'QPPMC', 'L. OLIVEIRA', 'LUCAS OLIVEIRA SANTOS', '07328486', 'Masculino', 'BPMA', true, '1272694100', '1987-02-17', '2014-10-01', '38', '(61)98342-1670', 'lucas.op180@gmail.com', '(61)98342-1670', null, 'oliveira.lucas@pm.df.gov.br', 'Ativo', 'Rua 30'),
  ('121', '3º SGT QPPMC', 'Praças', 'QPPMC', 'MILAGRE', 'GUILHERME MILAGRE NETO GUIMARAES', '07325770', 'Masculino', 'BPMA', true, '3679862130', '1990-02-23', '2014-10-01', '35', '(61)3361-8938', 'oct6_guilherme@hotmail.com', '(61)3361-8938', '(61)98642-0952', 'guilherme.neto@pm.df.gov.br', 'Ativo', 'AOS 06 Bloco D'),
  ('122', '3º SGT QPPMC', 'Praças', 'QPPMC', 'L. TEIXEIRA', 'LEONARDO TEIXEIRA VIEIRA', '07329350', 'Masculino', 'BPMA', true, '73585688187', '1990-01-19', '2014-10-01', '36', '(61)3485-8519', 'leonardo-vieira@hotmail.com.br', '(61)3485-8519', '(61)99671-5218', 'leonardo.vieira@pm.df.gov.br', 'Ativo', 'Rodovia DF-425'),
  ('123', '3º SGT QPPMC', 'Praças', 'QPPMC', 'S. ESTEVES', 'LEANDRO MONTEIRO ZEIN SAMMOUR ESTEVES', '07325967', 'Masculino', 'BPMA', true, '72736704134', '1983-07-22', '2014-10-01', '42', '(61)98173-4280', 'leandro.zein@gmail.com', '(61)98173-4280', null, 'leandro.esteves@pm.df.gov.br', 'Ativo', 'QNB 15'),
  ('124', '3º SGT QPPMC', 'Praças', 'QPPMC', 'E. MACHADO', 'EVELIZE DE BRITO MACHADO', '07327013', 'Feminino', 'BPMA', true, '4393542185', '1991-06-27', '2014-10-01', '34', '(61)98206-3608', 'evelize.bmachado@gmail.com', '(61)98206-3608', null, 'evelize.machado@pm.df.gov.br', 'Ativo', 'Quadra 003'),
  ('125', '3º SGT QPPMC', 'Praças', 'QPPMC', 'BRUNO CABRAL', 'BRUNO CABRAL DOS SANTOS', '07330677', 'Masculino', 'BPMA', true, '178176176', '1985-03-06', '2014-10-01', '40', '(61)99315-2443', 'cabralsky@gmail.com', '(61)99315-2443', '(61)98120-1885', 'bruno.cabral@pm.df.gov.br', 'Ativo', 'QR 516 Conjunto 02'),
  ('126', '3º SGT QPPMC', 'Praças', 'QPPMC', 'JOAO MACIEL', 'JOAO PAULO GONCALVES MACIEL', '07329539', 'Masculino', 'BPMA', true, '155141104', '1985-10-05', '2014-10-01', '40', '(61)98402-2188', 'joaopaulogm@gmail.com', '(61)98402-2188', null, 'joao.maciel@pm.df.gov.br', 'Ativo', 'Quadra 29'),
  ('127', 'CB QPPMC', 'Praças', 'QPPMC', 'E. FREITAS', 'EDUARDO VICTOR DE MORAES FREITAS', '0734578', 'Masculino', 'BPMA', true, '2932216180', '1990-03-05', '2017-08-28', '35', '(61)99952-6142', 'eduardov.dmf@gmail.com', '(61)99952-6142', null, 'eduardo.freitas@pm.df.gov.br', 'Ativo', 'Rua 17 (Quadra 03,04,14,15,25,26)'),
  ('128', 'CB QPPMC', 'Praças', 'QPPMC', 'COELHO', 'RAFAEL ALVES COELHO', '07356410', 'Masculino', 'BPMA', true, '5722267139', '1997-03-01', '2019-06-03', '28', '(61)98316-7667', 'alvescoelhorafael32@gmail.com', '(61)98316-7667', null, 'alves.coelho@pm.df.gov.br', 'Ativo', 'SHA Conjunto 5 Chácara 8'),
  ('129', 'CB QPPMC', 'Praças', 'QPPMC', 'SPAVIER', 'RENAN DE MELLO SANTOS SPAVIER', '07355297', 'Masculino', 'BPMA', true, '13214126733', '1990-09-21', '2019-06-03', '35', '(61)98130-7519', 'renan.spavier@pm.df.gov.br', '(61)98130-7519', '(61)98132-6331', 'renan.pc07@gmail.com', 'Ativo', 'QI 20 Bloco T'),
  ('130', 'CB QPPMC', 'Praças', 'QPPMC', 'ANA BARRETO', 'ANA GABRIELA DE ARAUJO BARRETO', '07355459', 'Feminino', 'BPMA', true, '1869539176', '1994-04-14', '2019-06-03', '31', '(61)98473-2919', 'anagaaaabi@gmail.com', '(61)98473-2919', null, 'anagabriela.barreto@pm.df.gov.br', 'Ativo', 'Quadra 7 Conjunto C'),
  ('131', 'CB QPPMC', 'Praças', 'QPPMC', 'H. SILVA', 'PAULO HENRIQUE DA SILVA RIBEIRO', '07358555', 'Masculino', 'BPMA', true, '4232481117', '1992-11-08', '2019-06-03', '33', '(61)3356-4383', 'henrique.ribeiro@pm.df.gov.br', '(61)3356-4383', '(61)98631-6005', 'ribeiro.pauloribeiro450@gmail.com', 'Ativo', 'QS 05 Rua 450'),
  ('132', 'CB QPPMC', 'Praças', 'QPPMC', 'P. CRUZ', 'PEDRO HENRIQUE DA CRUZ SILVA', '07361173', 'Masculino', 'BPMA', true, '73765228168', '1988-07-13', '2019-06-03', '37', '(61)3485-7162', 'silva.phc@gmail.com', '(61)3485-7162', null, 'pedro.dacruz@pm.df.gov.br', 'Ativo', 'Quadra 2 Conjunto C-08'),
  ('133', 'CB QPPMC', 'Praças', 'QPPMC', 'PEIXOTO', 'LUCAS PEIXOTO ARAUJO', '07359969', 'Masculino', 'BPMA', true, '3946191100', '1993-04-22', '2019-06-03', '32', '(61)98329-6924', 'lucaspeixoto22@gmail.com', '(61)98329-6924', null, 'peixoto.araujo@pm.df.gov.br', 'Ativo', 'SM-SE Conjunto 09'),
  ('134', 'CB QPPMC', 'Praças', 'QPPMC', 'PALHA', 'HIGOR GOMES PALHA BESSA', '0735892', 'Masculino', 'BPMA', true, '5295551156', '1996-02-14', '2019-06-05', '29', '(61)99233-4759', 'higorgomesph@gmail.com', '(61)99233-4759', null, 'higor.bessa@pm.df.gov.br', 'Ativo', 'QNO 01 Conjunto D'),
  ('135', 'CB QPPMC', 'Praças', 'QPPMC', 'BISPO', 'LEONARDO BISPO LEMES', '07359233', 'Masculino', 'BPMA', true, '4944705182', '1995-06-24', '2019-06-03', '30', '(61)98344-7436', 'leonardobispo01@outlook.com', '(61)98344-7436', null, 'leonardo.lemes@pm.df.gov.br', 'Ativo', 'QR 1-A Conjunto RS'),
  ('136', 'CB QPPMC', 'Praças', 'QPPMC', 'V. BARBOZA', 'VITOR SOUZA BARBOZA', '07360940', 'Masculino', 'BPMA', true, '6423171190', '1998-04-23', '2019-06-03', '27', '(61)98462-3361', 'vitinhog34@hotmail.com', '(61)98462-3361', null, 'vitor.barbozaszz@outlook.com', 'Ativo', 'QNG 03'),
  ('137', 'CB QPPMC', 'Praças', 'QPPMC', 'RAFAEL PAZ', 'RAFAEL FERNANDES PAZ', '07361580', 'Masculino', 'BPMA', true, '3411756179', '1991-02-04', '2019-06-10', '34', '(61)99559-9575', 'rafaelfernandespaz@hotmail.com', '(61)99559-9575', null, 'rafael.paz@pm.df.gov.br', 'Ativo', 'EPTG-QE 02 Bloco A-4'),
  ('138', 'SD QPPMC', 'Praças', 'QPPMC', 'A. MENDONCA', 'AMANDA FERREIRA MENDONÇA', '34284672', 'Feminino', 'BPMA', true, '5526935108', '1996-12-07', '2024-09-05', '29', '(61)98232-0222', 'amanda-f-m@hotmail.com', '(61)98232-0222', null, null, 'Ativo', 'Não Consta'),
  ('139', 'SD QPPMC', 'Praças', 'QPPMC', 'BRAYON', 'BRAYON PABLO DA SILVA BIANGULO', '34286756', 'Masculino', 'BPMA', true, '4016382190', '1996-11-27', '2024-09-05', '29', '(61)98434-5542', 'brayonpablo27@gmail.com', '(61)98434-5542', null, null, 'Ativo', 'Não Consta'),
  ('140', 'SD QPPMC', 'Praças', 'QPPMC', 'C. PALHARES', 'CAIO ANDRE PACHECO PALHARES', '19294654', 'Masculino', 'BPMA', true, '5161675101', '1996-01-31', '2024-09-05', '30', '(61)99570-9097', 'caiopacheco2012@hotmail.com', '(61)99570-9097', null, null, 'Ativo', 'Não Consta'),
  ('141', 'SD QPPMC', 'Praças', 'QPPMC', 'MESSIAS', 'Ederson Messias de Oliveira Silva', '34281991', 'Masculino', 'BPMA', true, '6005018175', '1996-12-24', '2024-09-05', '29', null, null, null, null, null, 'Ativo', 'Não Consta'),
  ('142', 'SD QPPMC', 'Praças', 'QPPMC', 'NEVES', 'EDUARDO FERREIRA NEVES RODRIGUES', '34278516', 'Masculino', 'BPMA', true, '4778133137', '1994-07-18', '2024-09-05', '31', '(61)99849-3431', 'eduneo10@gmail.com', '(61)99849-3431', null, null, 'Ativo', 'Não Consta'),
  ('143', 'SD QPPMC', 'Praças', 'QPPMC', 'DONINI', 'GABRIEL JAYME AMANCIO DONINI', '34280227', 'Masculino', 'BPMA', true, '5696897169', '1998-12-02', '2024-09-05', '27', '(61)98494-6697', 'bieldonini@gmail.com', '(61)98494-6697', null, null, 'Ativo', 'Não Consta'),
  ('144', 'SD QPPMC', 'Praças', 'QPPMC', 'ARAUJO', 'Gabriel Lara De Araujo', '34287507', 'Masculino', 'BPMA', true, '7415542169', '2000-09-29', '2024-09-05', '25', '(61)98275-0002', 'gabriellaradearaujo@gmail.com', '(61)98275-0002', null, null, 'Ativo', 'Não Consta'),
  ('145', 'SD QPPMC', 'Praças', 'QPPMC', 'MARQUES SANTOS', 'GABRIEL RODRIGUES MARQUES DOS SANTOS', '34284753', 'Masculino', 'BPMA', true, '6686299162', '1998-11-10', '2024-09-05', '27', '(61)99647-3377', 'gabrielrmarques@gmail.com', '(61)99647-3377', null, null, 'Ativo', 'Não Consta'),
  ('146', 'SD QPPMC', 'Praças', 'QPPMC', 'DILAN', 'GUILHERME DILAN PEREIRA DA SILVA', '34287655', 'Masculino', 'BPMA', true, '5615427167', '2001-03-21', '2024-09-05', '24', '(61)99251-9568', 'guilherme.dilan@outlook.com', '(61)99251-9568', null, 'guilhermedbotafogo@gmail.com', 'Ativo', 'Não Consta'),
  ('147', 'SD QPPMC', 'Praças', 'QPPMC', 'MALVEIRA', 'GUILHERME MALVEIRA DE MENEZES', '34282653', 'Masculino', 'BPMA', true, '5468464160', '1996-11-14', '2024-09-05', '29', '(61)99809-9847', 'guigo886@gmail.com', '(61)99809-9847', null, null, 'Ativo', 'Não Consta'),
  ('148', 'SD QPPMC', 'Praças', 'QPPMC', 'J. CARVALHO', 'JAIR CARVALHO FERNANDES PAIVA', '34280464', 'Masculino', 'BPMA', true, '5548198130', '2002-02-19', '2024-09-05', '23', '(86)98119-0873', 'jaircarvalhoufpi@gmail.com', '(86)98119-0873', null, 'jaircarvalhodf@gmail.com', 'Ativo', 'Não Consta'),
  ('149', 'SD QPPMC', 'Praças', 'QPPMC', 'J. FABRICIO', 'JEFERSON FABRICIO SOUZA', '34283544', 'Masculino', 'BPMA', true, '13415048675', '1996-06-30', '2024-09-05', '29', '(11)94725-0788', 'jefersonfs716@gmail.com', '(11)94725-0788', null, null, 'Ativo', 'Não Consta'),
  ('150', 'SD QPPMC', 'Praças', 'QPPMC', 'L. FREITAS', 'LEONARDO NASCIMENTO FREITAS', '34288481', 'Masculino', 'BPMA', true, '7876412513', '1997-07-28', '2024-09-05', '28', '(91)98989-3677', 'leonardofreitas502@gmail.com', '(91)98989-3677', null, null, 'Ativo', 'Não Consta'),
  ('151', 'SD QPPMC', 'Praças', 'QPPMC', 'L. DURAN', 'LUCAS DURAN DA SILVA', '34278729', 'Masculino', 'BPMA', true, '3246859124', '1998-04-07', '2024-09-05', '27', '(61)98311-9534', 'duranlucass@hotmail.com', '(61)98311-9534', null, null, 'Ativo', 'Não Consta'),
  ('152', 'SD QPPMC', 'Praças', 'QPPMC', 'LUCAS JESUS', 'LUCAS GONCALVES DE JESUS', '34284788', 'Masculino', 'BPMA', true, '70019083122', '2001-01-02', '2024-09-05', '25', '(62)99204-7545', 'lucasdejesus1910@gmail.com', '(62)99204-7545', null, null, 'Ativo', 'Não Consta'),
  ('153', 'SD QPPMC', 'Praças', 'QPPMC', 'M. BARROZO', 'MAICON BARROZO DO NASCIMENTO', '32579527', 'Masculino', 'BPMA', true, '14790657736', '1993-05-15', '2024-09-05', '32', '(61)98377-8685', 'maikenascimento@hotmail.com', '(61)98377-8685', null, null, 'Ativo', 'Não Consta'),
  ('154', 'SD QPPMC', 'Praças', 'QPPMC', 'M. CANTUARIO', 'MAIKY BARBOSA LOBO CANTUARIO', '34281861', 'Masculino', 'BPMA', true, '70132711109', '1996-09-04', '2024-09-05', '29', '(62)99971-1230', 'maikycantuariolobo@gmail.com', '(62)99971-1230', null, null, 'Ativo', 'Não Consta'),
  ('155', 'SD QPPMC', 'Praças', 'QPPMC', 'MIKAEL SANTOS', 'MIKAEL PEREIRA DOS SANTOS', '34291271', 'Masculino', 'BPMA', true, '6386854519', '1998-06-28', '2024-09-05', '27', '(77)99939-3594', 'pereiramikael.santos@outlook.com', '(77)99939-3594', null, null, 'Ativo', 'Não Consta'),
  ('156', 'SD QPPMC', 'Praças', 'QPPMC', 'P. DUARTE', 'PAULO EDUARDO DUARTE MATEUS', '34279091', 'Masculino', 'BPMA', true, '7434543167', '1999-08-25', '2024-09-05', '26', '(61)98155-2599', 'pauloeduardoduartemateus@gmail.com', '(61)98155-2599', null, null, 'Ativo', 'Não Consta'),
  ('157', 'SD QPPMC', 'Praças', 'QPPMC', 'H. SOUZA', 'PEDRO HENRIQUE ALVES DE SOUZA', '34280367', 'Masculino', 'BPMA', true, '3638746151', '1993-06-30', '2024-09-05', '32', '(65)99958-3560', 'drokph@gmail.com', '(65)99958-3560', null, null, 'Ativo', 'Não Consta'),
  ('158', 'SD QPPMC', 'Praças', 'QPPMC', 'FURTADO', 'ROBSON SILVA FURTADO', '34279741', 'Masculino', 'BPMA', true, '2638308102', '2003-09-11', '2024-09-05', '22', '(61)98543-8426', 'robsonfur@hotmail.com', '(61)98543-8426', null, null, 'Ativo', 'Não Consta'),
  ('159', 'SD QPPMC', 'Praças', 'QPPMC', 'SUSAN', 'SUSAN HELLEN LIMA DOS SANTOS', '34289437', 'Feminino', 'BPMA', true, '4257579196', '1996-06-13', '2024-09-05', '29', '(61)98409-2275', 'susan.hellen.civil@gmail.com', '(61)98409-2275', null, null, 'Ativo', 'Não Consta'),
  ('160', 'SD QPPMC', 'Praças', 'QPPMC', 'VERONICA', 'VERONICA MARIA ESTELLITA LINS MACIEL', '34283569', 'Feminino', 'BPMA', true, '4535975132', '1995-02-12', '2024-09-05', '30', '(61)99952-5179', 'vevestellita90@gmail.com', '(61)99952-5179', null, null, 'Ativo', 'Não Consta'),
  ('161', 'SD QPPMC', 'Praças', 'QPPMC', 'V. LOPES', 'VIVIANE LOPES ALBANIZA REBOUÇAS', '21071993', 'Feminino', 'BPMA', true, '4758736103', '1994-12-14', '2024-09-05', '31', '(61)99593-9449', 'vivianny.7@gmail.com', '(61)99593-9449', null, null, 'Ativo', 'Não Consta'),
  ('162', 'SD QPPMC', 'Praças', 'QPPMC', 'GUSTAVO', 'GUSTAVO RODRIGUES BARROSO VIDAL', '07369964', 'Masculino', 'BPMA', true, '3721149114', '1992-01-01', '2020-12-28', '34', '(61)98230-8895', 'gustavovidalbra@gmail.com', '(61)98230-8895', null, 'gustavo.vidal@pm.df.gov.br', 'Ativo', 'SQN 105 Bloco F'),
  ('163', 'SD QPPMC', 'Praças', 'QPPMC', 'D. NASCIMENTO', 'DANILO DA SILVA NASCIMENTO', '07371209', 'Masculino', 'BPMA', true, '73614017168', '1988-03-29', '2020-12-28', '37', '(61)99379-9947', 'danilovoluntariocivil@gmail.com', '(61)99379-9947', null, 'danilo.nascimento@pm.df.gov.br', 'Ativo', 'QR 503 Conjunto 09-A'),
  ('164', 'SD QPPMC', 'Praças', 'QPPMC', 'MARILIA', 'MARÍLIA COSTA RIBEIRO FRANCO', '07371977', 'Feminino', 'BPMA', true, '4684569101', '1995-12-04', '2020-12-28', '30', '(61)98278-5660', 'mary.c.ribeiro1@gmail.com', '(61)98278-5660', null, 'marilia.ribeiro@pm.df.gov.br', 'Ativo', 'SMPW Quadra 25 Conjunto 03'),
  ('165', 'SD QPPMC', 'Praças', 'QPPMC', 'FIDELIS', 'WANDERLEY FIDELIS DA SILVA JUNIOR', '07368844', 'Masculino', 'BPMA', true, '2470744113', '1988-03-08', '2020-12-28', '37', '(61)99901-8279', 'wfidelis.16@gmail.com', '(61)99901-8279', null, 'wanderley.fidelis@pm.df.gov.br', 'Ativo', 'QNM 01 Conjunto F'),
  ('166', 'SD QPPMC', 'Praças', 'QPPMC', 'W. TAVARES', 'WILLIAN MOUTINHO TAVARES', '07368968', 'Masculino', 'BPMA', true, '3503848193', '1993-01-21', '2020-12-28', '33', '(61)98173-9405', 'willian.ttavares@outlook.com', '(61)98173-9405', null, 'willian.tavares@pm.df.gov.br', 'Ativo', 'Área Especial Módulo 02 Módulo F'),
  ('167', 'SD QPPMC', 'Praças', 'QPPMC', 'TIAGO RODRIGUES', 'TIAGO RODRIGUES FERREIRA', '07381735', 'Masculino', 'BPMA', true, '4662730104', '1992-11-04', '2021-12-27', '33', '(62)98281-3269', 'rodriguestiago4@gmail.com', '(62)98281-3269', '(62)98142-4289', 'tiago.rodrigues@pm.df.gov.br', 'Ativo', 'Rua 1'),
  ('168', 'SD QPPMC', 'Praças', 'QPPMC', 'RAMON LIRA', 'RAMON LIRA DOS ANJOS', '07384033', 'Masculino', 'BPMA', true, '2601829150', '1990-10-21', '2021-12-27', '35', '(61)99810-5323', 'ramon.liranjos@gmail.com', '(61)99810-5323', null, 'ramon.anjos@pm.df.gov.br', 'Ativo', 'Engenho Velho Quadra 14'),
  ('169', 'SD QPPMC', 'Praças', 'QPPMC', 'HOTE', 'CARLOS ALBERTO HOTE MACHADO FILHO', '07381956', 'Masculino', 'BPMA', true, '9468805654', '1992-06-06', '2021-12-27', '33', '(33)98439-7891', 'hots_f@hotmail.com', '(33)98439-7891', null, 'carlos.afilho@pm.df.gov.br', 'Ativo', 'QI 24'),
  ('170', 'SD QPPMC', 'Praças', 'QPPMC', 'SENA', 'LUCAS DE SOUSA SENA', '07387369', 'Masculino', 'BPMA', true, '3505717169', '1996-09-27', '2021-12-27', '29', '(61)99811-2222', 'lucas.ssena96@gmail.com', '(61)99811-2222', null, 'lucas.sena@pm.df.gov.br', 'Ativo', 'SQN 203 Bloco J'),
  ('171', 'SD QPPMC', 'Praças', 'QPPMC', 'CRISTINA', 'DEBORAH CRISTINA AZEVEDO GOMES', '07381565', 'Feminino', 'BPMA', true, '3948912106', '1993-01-30', '2021-12-27', '33', '(61)99631-9710', 'deborahgomess@gmail.com', '(61)99631-9710', null, 'deborah.gomes@pm.df.gov.br', 'Ativo', 'QE 15 Conjunto H'),
  ('172', 'SD QPPMC', 'Praças', 'QPPMC', 'T. QUEIROZ', 'THIAGO QUEIROZ SANTOS', '07379536', 'Masculino', 'BPMA', true, '2784495140', '1990-09-22', '2021-12-27', '35', '(38)99937-7972', 'tgok19@gmail.com', '(38)99937-7972', '(61)99873-5541', 'thiago.queiroz@pm.df.gov.br', 'Ativo', 'Quadra 2 Rua A'),
  ('173', 'SD QPPMC', 'Praças', 'QPPMC', 'DIAN', 'DIAN FRANCHESCO DE MOURA LUCCA', '07379544', 'Masculino', 'BPMA', true, '552884219', '1991-02-05', '2021-12-27', '34', '(61)99883-5452', 'franchescodian@gmail.com', '(61)99883-5452', null, 'dian.lucca@pm.df.gov.br', 'Ativo', 'Rua 12 Chácara 307'),
  ('174', 'SD QPPMC', 'Praças', 'QPPMC', 'B. VILELA', 'BRUNO VILELA DA SILVA', '07381905', 'Masculino', 'BPMA', true, '190835133', '1987-03-25', '2021-12-27', '38', '(61)99627-0307', 'vilelabvs@gmail.com', '(61)99627-0307', null, 'bruno.vilela@pm.df.gov.br', 'Ativo', 'Avenida Buritis'),
  ('175', 'SD QPPMC', 'Praças', 'QPPMC', 'VINICIUS FREITAS', 'VINICIUS DE FREITAS BEZERRA', '07386486', 'Masculino', 'BPMA', true, '4476633137', '1994-02-26', '2021-12-27', '31', '(61)3567-0760', 'viniciusdefreitasbezerra@gmail.com', '(61)3567-0760', '(61)99677-5956', 'vinicius.bezerra@pm.df.gov.br', 'Ativo', 'QI 08 Conjunto B'),
  ('176', 'SD QPPMC', 'Praças', 'QPPMC', 'R. ROCHA', 'CRISTIANO RODRIGUES DA ROCHA', '07382677', 'Masculino', 'BPMA', true, '73325538134', '1988-01-17', '2021-12-27', '38', '(61)98487-1241', 'crisrrocha17@gmail.com', '(61)98487-1241', null, 'cristiano.rodrigues@pm.df.gov.br', 'Ativo', 'QS 14 Conjunto 01B'),
  ('177', 'SD QPPMC', 'Praças', 'QPPMC', 'CAMYLA TAVARES', 'CAMYLA TAVARES ALVES SOUZA', '07383746', 'Feminino', 'BPMA', true, '4852786186', '1996-07-17', '2021-12-27', '29', '(61)98333-3077', 'camylafacu@gmail.com', '(61)98333-3077', null, 'camyla.souza@pm.df.gov.br', 'Ativo', 'EQNP 26/30 Bloco D'),
  ('178', 'SD QPPMC', 'Praças', 'QPPMC', 'MELITO', 'JOAO GUSMAO MELITO', '07383738', 'Masculino', 'BPMA', true, '4310876102', '1992-11-03', '2021-12-27', '33', '(61)98345-9482', 'jonymelito@hotmail.com', '(61)98345-9482', null, 'joao.gusmao@pm.df.gov.br', 'Ativo', 'QN 05 Conjunto 10'),
  ('179', 'SD QPPMC', 'Praças', 'QPPMC', 'CIBELE', 'CIBELE CARMO DA SILVA', '07384637', 'Feminino', 'BPMA', true, '3657561137', '1990-07-19', '2021-12-27', '35', '(61)98147-6453', 'c.carmodasilva1990@gmail.com', '(61)98147-6453', null, 'cibele.silva@pm.df.gov.br', 'Ativo', 'Rua 12 Chácara 307'),
  ('180', 'SD QPPMC', 'Praças', 'QPPMC', 'L. CASTRO', 'LEANDRO RODRIGUES DE CASTRO', '07383371', 'Masculino', 'BPMA', true, '4682715119', '1992-03-01', '2021-12-27', '33', '(61)99696-1766', 'leandrosoh@hotmail.com', '(61)99696-1766', null, null, 'Ativo', 'QUADRA 104, LOTE 05'),
  ('181', 'SD QPPMC', 'Praças', 'QPPMC', 'BRUNO NUNES', 'BRUNO FERREIRA NUNES', '07387385', 'Masculino', 'BPMA', true, '271581107', '1988-08-03', '2022-01-10', '37', '(61)99917-9919', 'br.ferreiraa@gmail.com', '(61)99917-9919', null, 'nunes.bruno@pm.df.gov.br', 'Ativo', 'QE 17 Conjunto M'),
  ('182', 'SD QPPMC', 'Praças', 'QPPMC', 'SANDERSON', 'SANDERSON MELO BRITO', '07389728', 'Masculino', 'BPMA', true, '3611723380', '1990-03-15', '2022-06-13', '35', '(61)99119-4973', 'sandersssonmelo@gmail.com', '(61)99119-4973', '(61)99292-0013', 'sanderson.brito@pm.df.gov.br', 'Ativo', 'QN 05 Conjunto 21'),
  ('183', 'SD QPPMC', 'Praças', 'QPPMC', 'FELIPE', 'FELIPE NUNES SOARES', '07391994', 'Masculino', 'BPMA', true, '2434325181', '1991-07-25', '2022-06-13', '34', '(61)99993-3787', 'velkanbite@gmail.com', '(61)99993-3787', null, 'felipe.nunes@pm.df.gov.br', 'Ativo', 'QI 31 Lote 01'),
  ('184', 'SD QPPMC', 'Praças', 'QPPMC', 'J. SANTOS', 'JOAO VICTOR RODRIGUES SANTOS', '07389612', 'Masculino', 'BPMA', true, '5628182192', '1997-02-13', '2022-06-13', '28', '(61)98259-4027', 'joaovictorrodrigues.jvrs@gmail.com', '(61)98259-4027', null, 'rodrigues.joao@pm.df.gov.br', 'Ativo', 'Quadra 11 Conjunto P'),
  ('185', 'SD QPPMC', 'Praças', 'QPPMC', 'L. PAIVA', 'LUIS FERNANDO MOREIRA DE PAIVA', '07392834', 'Masculino', 'BPMA', true, '3578423165', '1992-11-30', '2022-06-13', '33', '(61)99522-3333', 'luis.paiva.cr@hotmail.com', '(61)99522-3333', '(61)3475-3036', 'fernando.paiva@pm.df.gov.br', 'Ativo', 'QNL 30 Via 29'),
  ('186', 'SD QPPMC', 'Praças', 'QPPMC', 'ZEIDAN', 'JOÃO FELIPE FERREIRA ZEIDAN', '07396082', 'Masculino', 'BPMA', true, '5465156147', '1996-08-19', '2023-04-10', '29', '(61)98327-3812', 'joaofelipezeidan@hotmail.com', '(61)98327-3812', null, 'joao.zeidan@pm.df.gov.br', 'Suspenso', 'QI 08 Bloco P'),
  ('187', 'SD QPPMC', 'Praças', 'QPPMC', 'ARIADNE', 'ARIADNE DE LIMA LUCAS', '0739621', 'Feminino', 'BPMA', true, '90888553234', '1994-01-12', '2023-04-10', '32', '(61)98255-1540', 'ariadnedelimalucas@gmail.com', '(61)98255-1540', null, 'ariadne.lucas@pm.df.gov.br', 'Ativo', 'EPTG-QE 04 Bloco B-10');

-- 2) Normalizar matrícula na staging para 8 dígitos (para comparação)
UPDATE _staging_dim_efetivo_nova
SET matricula = lpad(regexp_replace(trim(COALESCE(matricula, '')), '[^0-9]', '', 'g'), 8, '0')
WHERE trim(COALESCE(matricula, '')) <> '';

-- 2b) Remover duplicatas na staging (uma linha por matrícula; após normalização podem colidir)
DELETE FROM _staging_dim_efetivo_nova a
USING _staging_dim_efetivo_nova b
WHERE a.matricula = b.matricula
  AND trim(COALESCE(a.matricula, '')) <> ''
  AND a.ctid > b.ctid;

-- 3) Remover duplicatas em dim_efetivo ANTES de normalizar (por matrícula normalizada; senão duas linhas 0731549 e 731549 viram 00731549 e violam UNIQUE)
DELETE FROM public.dim_efetivo de
WHERE de.id IN (
  SELECT t.id FROM (
    SELECT de2.id,
      ROW_NUMBER() OVER (
        PARTITION BY lpad(regexp_replace(trim(COALESCE(de2.matricula, '')), '[^0-9]', '', 'g'), 8, '0')
        ORDER BY (SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = de2.id LIMIT 1) DESC NULLS LAST,
                 de2.id
      ) AS rn
    FROM public.dim_efetivo de2
    WHERE trim(COALESCE(de2.matricula, '')) <> ''
  ) t
  WHERE t.rn > 1
);

-- 4) Só então normalizar matrícula em dim_efetivo para 8 dígitos (já sem duplicatas por matrícula normalizada)
UPDATE public.dim_efetivo
SET matricula = lpad(regexp_replace(trim(COALESCE(matricula, '')), '[^0-9]', '', 'g'), 8, '0')
WHERE trim(COALESCE(matricula, '')) <> '';

-- 5) Índice único em matrícula (para upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_dim_efetivo_matricula_unique
  ON public.dim_efetivo (matricula)
  WHERE trim(COALESCE(matricula, '')) <> '';

-- 5b) Tabela temporária com os id de dim_efetivo que saem (não estão na tabela nova)
CREATE TEMP TABLE _dim_efetivo_ids_sair (id_remover uuid PRIMARY KEY);
INSERT INTO _dim_efetivo_ids_sair (id_remover)
SELECT de.id
FROM public.dim_efetivo de
WHERE lpad(regexp_replace(trim(COALESCE(de.matricula, '')), '[^0-9]', '', 'g'), 8, '0')
      NOT IN (SELECT matricula FROM _staging_dim_efetivo_nova WHERE trim(COALESCE(matricula, '')) <> '');

-- 5c) Limpar referências antes de excluir (quem não está na lista nova não faz mais parte do batalhão)
UPDATE public.usuarios_por_login upl
SET efetivo_id = NULL
FROM _dim_efetivo_ids_sair ir
WHERE upl.efetivo_id = ir.id_remover;

DELETE FROM public.fat_equipe_membros fem
WHERE fem.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);

DELETE FROM public.fat_campanha_membros fcm
WHERE fcm.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);

-- fat_equipe_atividades_prevencao tem ON DELETE CASCADE; será apagado ao deletar dim_efetivo

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dim_os') THEN
    UPDATE public.dim_os d SET comandante_id = NULL FROM _dim_efetivo_ids_sair ir WHERE d.comandante_id = ir.id_remover;
    UPDATE public.dim_os d SET chefe_operacoes_id = NULL FROM _dim_efetivo_ids_sair ir WHERE d.chefe_operacoes_id = ir.id_remover;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_os_efetivo') THEN
    DELETE FROM public.fat_os_efetivo foe WHERE foe.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_crime_comum') THEN
    DELETE FROM public.fat_equipe_crime_comum fecc WHERE fecc.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_resgate') THEN
    DELETE FROM public.fat_equipe_resgate fer WHERE fer.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_crime') THEN
    DELETE FROM public.fat_equipe_crime fec WHERE fec.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_abono') THEN
    DELETE FROM public.fat_abono fa WHERE fa.efetivo_id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);
  END IF;
END $$;

-- user_roles: ON DELETE CASCADE na FK → serão apagados ao deletar dim_efetivo; opcionalmente desativar antes
UPDATE public.user_roles ur
SET ativo = false
FROM _dim_efetivo_ids_sair ir
WHERE ur.efetivo_id = ir.id_remover;

-- 6) Remover quem não está na tabela nova (não faz mais parte do batalhão)
DELETE FROM public.dim_efetivo
WHERE id IN (SELECT id_remover FROM _dim_efetivo_ids_sair);

-- 7) Atualizar existentes e inserir novos (evita ON CONFLICT que pode falhar com constraint dim_efetivo_matricula_key)
WITH s AS (
  SELECT DISTINCT ON (matricula) *
  FROM _staging_dim_efetivo_nova
  WHERE trim(COALESCE(matricula, '')) <> ''
  ORDER BY matricula, antiguidade::integer
)
UPDATE public.dim_efetivo de
SET
  antiguidade = s.antiguidade::integer,
  posto_graduacao = s.posto_graduacao,
  quadro = s.quadro,
  quadro_sigla = s.quadro_sigla,
  nome_guerra = s.nome_guerra,
  nome = s.nome,
  sexo = s.sexo,
  lotacao = s.lotacao,
  ativo = s.ativo,
  cpf = s.cpf::bigint,
  data_nascimento = s.data_nascimento,
  data_inclusao = s.data_inclusao::date,
  idade = s.idade::integer,
  contato = s.contato,
  email = s.email,
  telefone = s.telefone,
  telefone_2 = s.telefone_2,
  email_2 = s.email_2,
  porte_arma = s.porte_arma,
  logradouro = s.logradouro
FROM s
WHERE de.matricula = s.matricula;

-- 8) Inserir apenas matrículas que ainda não existem em dim_efetivo
INSERT INTO public.dim_efetivo (
  antiguidade, posto_graduacao, quadro, quadro_sigla, nome_guerra, nome, matricula,
  sexo, lotacao, ativo, cpf, data_nascimento, data_inclusao, idade, contato,
  email, telefone, telefone_2, email_2, porte_arma, logradouro
)
SELECT
  s.antiguidade::integer, s.posto_graduacao, s.quadro, s.quadro_sigla, s.nome_guerra, s.nome, s.matricula,
  s.sexo, s.lotacao, s.ativo, s.cpf::bigint, s.data_nascimento, s.data_inclusao::date, s.idade::integer, s.contato,
  s.email, s.telefone, s.telefone_2, s.email_2, s.porte_arma, s.logradouro
FROM (
  SELECT DISTINCT ON (matricula) *
  FROM _staging_dim_efetivo_nova
  WHERE trim(COALESCE(matricula, '')) <> ''
  ORDER BY matricula, antiguidade::integer
) s
WHERE NOT EXISTS (
  SELECT 1 FROM public.dim_efetivo de WHERE de.matricula = s.matricula
);
