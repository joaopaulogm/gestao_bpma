-- ANÁLISE PERICIAL DE FÉRIAS 2025 - CORREÇÃO COMPLETA
-- Limpa os dados antigos e insere os dados corretos da planilha

-- 1. Remove todas as férias de 2025 para reinserir corretamente
DELETE FROM fat_ferias WHERE ano = 2025;

-- 2. Insere os dados corretos conforme planilha analisada

-- JANEIRO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '730629'; -- RONALD TEIXEIRA

-- FEVEREIRO - Nenhum policial com 1ª parcela em FEV

-- MARÇO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: FEV(5d), 3ª: MAR(20d)' FROM dim_efetivo WHERE matricula = '732040X'; -- CARLOS HENRIQUE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'PARCELADA', '1ª: DEZ/24(13d), 2ª: MAR(17d)' FROM dim_efetivo WHERE matricula = '222925'; -- ROBERVAL PAULO

-- ABRIL
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7330677'; -- BRUNO CABRAL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(13d), 2ª: ABR(17d)' FROM dim_efetivo WHERE matricula = '7379536'; -- THIAGO QUEIROZ

-- MAIO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 10, 'PARCELADA', '1ª: MAI(10d)' FROM dim_efetivo WHERE matricula = '7396082'; -- JOÃO FELIPE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: MAI(21d)' FROM dim_efetivo WHERE matricula = '739621X'; -- ARIADNE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(25d), 2ª: MAI(5d)' FROM dim_efetivo WHERE matricula = '2154250'; -- FERNANDO MIKHAIL (férias 2025)

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7381565'; -- DEBORAH

-- JUNHO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(10d), 2ª: FEV(10d), 3ª: JUN(10d)' FROM dim_efetivo WHERE matricula = '237388'; -- LEONARDO DE SALLES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '240257'; -- UZIEL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '730289'; -- EVANIMAR

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7313993'; -- IGOR NUNES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(13d), 2ª: JUN(17d)' FROM dim_efetivo WHERE matricula = '7323859'; -- RENATO MARQUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(15d), 2ª: JUN(15d)' FROM dim_efetivo WHERE matricula = '21759X'; -- WELINGTON JEAN

-- JULHO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(10d), 2ª: ABR(5d), 3ª: JUL(15d)' FROM dim_efetivo WHERE matricula = '7387369'; -- LUCAS SENA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7313217'; -- THIAGO TEIXEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7381204'; -- GUSTAVO LEMOS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: MAI(5d), 3ª: JUL(16d)' FROM dim_efetivo WHERE matricula = '244082'; -- LUIZ GERALDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(9d), 2ª: ABR(5d), 3ª: JUL(16d)' FROM dim_efetivo WHERE matricula = '73943X'; -- PAULO CELIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: MAI(14d), 3ª: JUL(7d)' FROM dim_efetivo WHERE matricula = '7318960'; -- DANIEL SIRQUEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(9d), 2ª: JUL(21d)' FROM dim_efetivo WHERE matricula = '7381735'; -- TIAGO RODRIGUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(15d), 2ª: JUL(15d)' FROM dim_efetivo WHERE matricula = '170089'; -- LEÔNIDAS BORGES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(9d), 2ª: JUL(21d)' FROM dim_efetivo WHERE matricula = '228915'; -- ISMAEL MOTTA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: JUL(21d)' FROM dim_efetivo WHERE matricula = '7318561'; -- EDIMILSON MEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(5d), 2ª: JUL(25d)' FROM dim_efetivo WHERE matricula = '235989'; -- GILBERTO SILVANO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(10d), 2ª: JUL(20d)' FROM dim_efetivo WHERE matricula = '728632'; -- CASSIO BARBOSA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(13d), 2ª: JUL(17d)' FROM dim_efetivo WHERE matricula = '219487'; -- CLÁUDIO NERO

-- AGOSTO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(5d), 2ª: AGO(25d)' FROM dim_efetivo WHERE matricula = '73909X'; -- MARCUS VINICIUS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(9d), 2ª: AGO(21d)' FROM dim_efetivo WHERE matricula = '7384033'; -- RAMON LIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: AGO(21d)' FROM dim_efetivo WHERE matricula = '1963074'; -- GIULLIANO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(17d), 2ª: AGO(13d)' FROM dim_efetivo WHERE matricula = '728039'; -- HERMANO ARAUJO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(5d), 2ª: JUN(9d), 3ª: AGO(16d)' FROM dim_efetivo WHERE matricula = '2149419'; -- GIL HENRIQUE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '240613'; -- WALLACE VIDAL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(5d), 2ª: AGO(25d)' FROM dim_efetivo WHERE matricula = '731549X'; -- GREICY ERNESTINA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(20d), 2ª: AGO(10d)' FROM dim_efetivo WHERE matricula = '121258'; -- ISRAEL LAURINDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(15d), 2ª: AGO(15d)' FROM dim_efetivo WHERE matricula = '232475'; -- ANDRE LUIZ CEZAR

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(13d), 2ª: JUL(5d), 3ª: AGO(12d)' FROM dim_efetivo WHERE matricula = '1955411'; -- PAULO ROBERTO MACHADO

-- SETEMBRO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: MAI(15d), 3ª: SET(10d)' FROM dim_efetivo WHERE matricula = '1955306'; -- CARLOS MASSAMI

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '32579527'; -- MAICON BARROZO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34287655'; -- GUILHERME DILAN

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '19294654'; -- CAIO ANDRE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34284753'; -- GABRIEL RODRIGUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(10d), 2ª: AGO(5d), 3ª: SET(15d)' FROM dim_efetivo WHERE matricula = '7320213'; -- PEDRO HELIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34278516'; -- EDUARDO FERREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(13d), 2ª: JUL(9d), 3ª: SET(8d)' FROM dim_efetivo WHERE matricula = '242942'; -- MAURO FERNANDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7318553'; -- RAFAEL MARANHAO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34286756'; -- BRAYON PABLO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(10d), 2ª: JUN(10d), 3ª: SET(10d)' FROM dim_efetivo WHERE matricula = '244007'; -- FABIO GONZAGA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(9d), 2ª: AGO(9d), 3ª: SET(12d)' FROM dim_efetivo WHERE matricula = '7325770'; -- GUILHERME MILAGRE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(10d), 2ª: SET(20d)' FROM dim_efetivo WHERE matricula = '735892X'; -- HIGOR GOMES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34279091'; -- PAULO EDUARDO D

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: SET(21d)' FROM dim_efetivo WHERE matricula = '7316771'; -- VITOR GABRIEL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(10d), 2ª: JUL(10d), 3ª: SET(10d)' FROM dim_efetivo WHERE matricula = '2149397'; -- LUIS EDUARDO S

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '231975'; -- ALLAN BERNARDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(10d), 2ª: AGO(10d), 3ª: SET(10d)' FROM dim_efetivo WHERE matricula = '7383371'; -- LEANDRO RODRIGUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(10d), 2ª: JUL(10d), 3ª: SET(10d)' FROM dim_efetivo WHERE matricula = '7322569'; -- WELITON WAGNER

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: SET(21d)' FROM dim_efetivo WHERE matricula = '7321422'; -- FILIPE XAVIER

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(12d), 2ª: SET(18d)' FROM dim_efetivo WHERE matricula = '7322631'; -- BRICIO HERBERT

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34280464'; -- JAIR CARVALHO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 20, 'PARCELADA', '1ª: SET(20d)' FROM dim_efetivo WHERE matricula = '7361173'; -- PEDRO HENRIQUE CRUZ

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(9d), 2ª: AGO(9d), 3ª: SET(12d)' FROM dim_efetivo WHERE matricula = '217999'; -- ELTON NERI

-- OUTUBRO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7352387'; -- ALISSON MONTEIRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34288481'; -- LEONARDO NASCIMENTO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34283544'; -- JEFERSON FABRICIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: MAI(13d), 3ª: OUT(8d)' FROM dim_efetivo WHERE matricula = '739820'; -- AUCEMI

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34284788'; -- LUCAS GONCALVES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(21d), 2ª: OUT(9d)' FROM dim_efetivo WHERE matricula = '7359969'; -- LUCAS PEIXOTO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: OUT(25d)' FROM dim_efetivo WHERE matricula = '7322143'; -- EDUARDO RIBEIRO P

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(10d), 2ª: AGO(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '7382677'; -- CRISTIANO RODRIGUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(9d), 2ª: AGO(5d), 3ª: OUT(16d)' FROM dim_efetivo WHERE matricula = '1999974'; -- JORGE ANDRÉ B

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(10d), 2ª: AGO(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '7368844'; -- WANDERLEY FIDELIS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(9d), 2ª: AGO(9d), 3ª: OUT(12d)' FROM dim_efetivo WHERE matricula = '7320604'; -- PAULO HENRIQUE M

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(12d), 2ª: JUL(5d), 3ª: OUT(13d)' FROM dim_efetivo WHERE matricula = '7383746'; -- CAMYLA TAVARES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(9d), 2ª: SET(9d), 3ª: OUT(12d)' FROM dim_efetivo WHERE matricula = '7318138'; -- FABRICIO BUENO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(9d), 2ª: OUT(21d)' FROM dim_efetivo WHERE matricula = '7383738'; -- JOAO GUSMAO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(10d), 2ª: JUL(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '740934'; -- CARLOS EDUARDO M

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(21d), 2ª: OUT(9d)' FROM dim_efetivo WHERE matricula = '221430'; -- GILMAR ALVES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(10d), 2ª: OUT(20d)' FROM dim_efetivo WHERE matricula = '7329539'; -- JOAO PAULO G

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: JUN(20d), 3ª: OUT(5d)' FROM dim_efetivo WHERE matricula = '7381956'; -- CARLOS ALBERTO HOTE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(15d), 2ª: OUT(15d)' FROM dim_efetivo WHERE matricula = '7392834'; -- LUIS FERNANDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(15d), 2ª: OUT(15d)' FROM dim_efetivo WHERE matricula = '7389728'; -- SANDERSON MELO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(10d), 2ª: SET(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '731471X'; -- LUCAS ALVES M

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: JUL(12d), 3ª: OUT(13d)' FROM dim_efetivo WHERE matricula = '728012'; -- PAULO ROBERTO BOMFIM

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(21d), 2ª: OUT(9d)' FROM dim_efetivo WHERE matricula = '7316100'; -- DEIVID RODRIGUES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(10d), 2ª: JUL(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '7315090'; -- THIAGO ALVES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(10d), 2ª: SET(13d), 3ª: OUT(7d)' FROM dim_efetivo WHERE matricula = '195976X'; -- FLAVIO ALVES H

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(12d), 2ª: JUL(9d), 3ª: OUT(9d)' FROM dim_efetivo WHERE matricula = '7387385'; -- BRUNO FERREIRA N

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7358555'; -- PAULO HENRIQUE RIBEIRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7379544'; -- DIAN FRANCHESCO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(10d), 2ª: JUN(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '7381905'; -- BRUNO VILELA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(15d), 2ª: OUT(15d)' FROM dim_efetivo WHERE matricula = '7355297'; -- RENAN DE MELLO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(10d), 2ª: JUL(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '242624'; -- LEOMAR PEDRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(15d), 2ª: SET(10d), 3ª: OUT(5d)' FROM dim_efetivo WHERE matricula = '237485'; -- LUCIANO LUIZ

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(9d), 2ª: OUT(21d)' FROM dim_efetivo WHERE matricula = '23267x'; -- ANTONIO DENIS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(10d), 2ª: MAR(10d), 3ª: OUT(10d)' FROM dim_efetivo WHERE matricula = '7391994'; -- FELIPE NUNES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '229113'; -- EMERSON FRANCISCO

-- NOVEMBRO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(12d), 2ª: NOV(18d)' FROM dim_efetivo WHERE matricula = '1966774'; -- JORGE PEREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(10d), 2ª: OUT(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '2184583'; -- RONIE VON

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34289437'; -- SUSAN HELLEN

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34291271'; -- MIKAEL PEREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34282653'; -- GUILHERME MALVEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: ABR(12d), 3ª: NOV(9d)' FROM dim_efetivo WHERE matricula = '2151189'; -- EULER TAVARES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(5d), 2ª: SET(12d), 3ª: NOV(13d)' FROM dim_efetivo WHERE matricula = '7315139'; -- ROGERIO XIMENES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '21071993'; -- VIVIANE LOPES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(10d), 2ª: SET(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '2155990'; -- THIAGO ROBERTO C

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34284672'; -- AMANDA FERREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(21d), 2ª: NOV(9d)' FROM dim_efetivo WHERE matricula = '7360940'; -- VITOR BARBOZA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34280367'; -- PEDRO HENRIQUE A. SOUZA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34281991'; -- EDERSON MESSIAS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'PARCELADA', '1ª: OUT(9d), 2ª: NOV(21d)' FROM dim_efetivo WHERE matricula = '7319126'; -- SAULO ELEUTERIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(5d), 2ª: NOV(25d)' FROM dim_efetivo WHERE matricula = '7355459'; -- ANA GABRIELA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(10d), 2ª: NOV(20d)' FROM dim_efetivo WHERE matricula = '7329393'; -- DENIS BONFIM

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: NOV(25d)' FROM dim_efetivo WHERE matricula = '1999176'; -- FÁBIO FRANCISCO LAGO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(5d), 2ª: FEV(10d), 3ª: NOV(15d)' FROM dim_efetivo WHERE matricula = '7316054'; -- YURY RIBEIRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7316844'; -- WESLEY COUTINHO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(10d), 2ª: OUT(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '7321317'; -- MARCILIO CARNEIRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(9d), 2ª: NOV(21d)' FROM dim_efetivo WHERE matricula = '7329350'; -- LEONARDO TEIXEIRA V

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(9d), 2ª: NOV(21d)' FROM dim_efetivo WHERE matricula = '734578X'; -- EDUARDO VICTOR

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(5d), 2ª: AGO(5d), 3ª: NOV(20d)' FROM dim_efetivo WHERE matricula = '729396'; -- SERGIO FABIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34280227'; -- GABRIEL JAYME

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'PARCELADA', '1ª: FEV(5d), 2ª: SET(10d), 3ª: NOV(15d)' FROM dim_efetivo WHERE matricula = '7361580'; -- RAFAEL FERNANDES PAZ

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(13d), 2ª: NOV(17d)' FROM dim_efetivo WHERE matricula = '737402'; -- FERNANDO APARECIDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(5d), 2ª: AGO(12d), 3ª: NOV(13d)' FROM dim_efetivo WHERE matricula = '7371977'; -- MARÍLIA COSTA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(10d), 2ª: OUT(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '7320191'; -- DENISSON BRAGA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(10d), 2ª: OUT(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '7359233'; -- LEONARDO BISPO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7318545'; -- THIAGO O. CARVALHO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(5d), 2ª: SET(18d), 3ª: NOV(7d)' FROM dim_efetivo WHERE matricula = '237221'; -- LEONARDO MELO LEAL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(17d), 2ª: NOV(13d)' FROM dim_efetivo WHERE matricula = '230790'; -- EDMILSON SILVA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(12d), 2ª: NOV(18d)' FROM dim_efetivo WHERE matricula = '7348908'; -- ANDRE LUIZ PEREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(12d), 2ª: NOV(18d)' FROM dim_efetivo WHERE matricula = '7363494'; -- THAYS DOS SANTOS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(10d), 2ª: NOV(20d)' FROM dim_efetivo WHERE matricula = '7363729'; -- GUTIERRE SANTOS

-- DEZEMBRO
INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7314051'; -- FLÁVIO PEREIRA M

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 15, 'PARCELADA', '1ª: DEZ(15d)' FROM dim_efetivo WHERE matricula = '34283569'; -- VERÔNICA MARIA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: OUT(13d), 3ª: DEZ(8d)' FROM dim_efetivo WHERE matricula = '237132'; -- LEONARDO CUNHA V

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '740365'; -- WESLEY CADETE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(13d), 2ª: MAR(10d), 3ª: DEZ(7d)' FROM dim_efetivo WHERE matricula = '738549'; -- MARCEL LARA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(10d), 2ª: JUL(10d), 3ª: DEZ(10d)' FROM dim_efetivo WHERE matricula = '7386486'; -- VINICIUS FREITAS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '213985'; -- ROBERTO PEREIRA G

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34278729'; -- LUCAS DURAN

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34279741'; -- ROBSON SILVA F

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7327013'; -- EVELIZE BRITO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(12d), 2ª: DEZ(18d)' FROM dim_efetivo WHERE matricula = '7384637'; -- CIBELE CARMO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(5d), 2ª: AGO(13d), 3ª: DEZ(12d)' FROM dim_efetivo WHERE matricula = '7314876'; -- JULIO CEZAR OGAWA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(5d), 2ª: NOV(6d), 3ª: DEZ(19d)' FROM dim_efetivo WHERE matricula = '237442'; -- LIVIO ALESSANDRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(10d), 2ª: DEZ(20d)' FROM dim_efetivo WHERE matricula = '731812X'; -- NATAN MANOEL

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: SET(9d), 3ª: DEZ(12d)' FROM dim_efetivo WHERE matricula = '236411'; -- ISRAEL VITORINO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 15, 'PARCELADA', '1ª: SET(10d), 2ª: DEZ(5d)' FROM dim_efetivo WHERE matricula = '7315910'; -- RODRIGO MARTINS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(9d), 2ª: SET(10d), 3ª: DEZ(11d)' FROM dim_efetivo WHERE matricula = '7356410'; -- RAFAEL ALVES C

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(9d), 2ª: DEZ(21d)' FROM dim_efetivo WHERE matricula = '7368968'; -- WILLIAN MOUTINHO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'PARCELADA', '1ª: OUT(17d), 2ª: DEZ(13d)' FROM dim_efetivo WHERE matricula = '741566'; -- PAULO EDUARDO BRAGA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(9d), 2ª: SET(9d), 3ª: DEZ(12d)' FROM dim_efetivo WHERE matricula = '7316518'; -- RAFAEL TOLEDO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7325967'; -- LEANDRO MONTEIRO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(11d), 2ª: SET(13d), 3ª: DEZ(6d)' FROM dim_efetivo WHERE matricula = '239453'; -- RODNEI TAVARES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(12d), 2ª: NOV(5d), 3ª: DEZ(13d)' FROM dim_efetivo WHERE matricula = '215093X'; -- WESLEN COSTA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'PARCELADA', '1ª: JAN(9d), 2ª: OUT(21d)' FROM dim_efetivo WHERE matricula = '7389612'; -- JOAO VICTOR

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(9d), 2ª: DEZ(21d)' FROM dim_efetivo WHERE matricula = '7369964'; -- GUSTAVO RODRIGUES B

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '740195'; -- SEM OLIVEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '1962477'; -- LUCAS ALVES COSTA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '732397'; -- ANA PAULA ALVES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 9, 30, 'PARCELADA', '1ª: SET(7d), 2ª: DEZ(23d)' FROM dim_efetivo WHERE matricula = '183008'; -- ADALBERTO ARAÚJO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 18, 'PARCELADA', '1ª: DEZ(18d)' FROM dim_efetivo WHERE matricula = '7328486'; -- LUCAS OLIVEIRA SANTOS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7320582'; -- RODOLFO MEDEIROS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(12d), 2ª: DEZ(18d)' FROM dim_efetivo WHERE matricula = '1998560'; -- BRENO DOS SANTOS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '73876X'; -- MAENDLI TENIS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 4, 30, 'PARCELADA', '1ª: ABR(5d), 2ª: JUL(10d), 3ª: DEZ(15d)' FROM dim_efetivo WHERE matricula = '2153866'; -- RENATO PEREIRA R

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '7323980'; -- KAYO HENRIQUE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 11, 30, 'PARCELADA', '1ª: NOV(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '221074'; -- MARCIO ALEXANDRE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 7, 30, 'PARCELADA', '1ª: JUL(10d), 2ª: SET(10d), 3ª: NOV(10d)' FROM dim_efetivo WHERE matricula = '7315902'; -- FERNANDA ECHAMENDE

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: DEZ(21d)' FROM dim_efetivo WHERE matricula = '730858'; -- MARCELO FERREIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '213411'; -- MARCOS JOSÉ

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '736538'; -- DANIEL BORGES

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 10, 30, 'PARCELADA', '1ª: OUT(5d), 2ª: DEZ(25d)' FROM dim_efetivo WHERE matricula = '7317921'; -- WELYSSON ERICK

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 6, 30, 'PARCELADA', '1ª: JUN(15d), 2ª: AGO(10d), 3ª: DEZ(5d)' FROM dim_efetivo WHERE matricula = '229180'; -- WELLINGTON LUCAS M

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '2149621'; -- RAPHAEL VINICIUS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7320973'; -- MARCELO NOGUEIRA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34281861'; -- MAIKY BARBOSA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '34287507'; -- GABRIEL LARA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '224707'; -- LEANDRO JOSE LIMA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '505838'; -- ADELINO TC

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7349165'; -- JOAO FLAVIO LAZARI

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '508578'; -- EMERSON MAJ

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 8, 30, 'PARCELADA', '1ª: AGO(15d), 2ª: OUT(15d)' FROM dim_efetivo WHERE matricula = '7348479'; -- DAVI CUNHA

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 2, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7357036'; -- PEDRO LUCAS CASAS

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 1, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7330154'; -- HUGGO BUENO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 12, 30, 'INTEGRAL', NULL FROM dim_efetivo WHERE matricula = '7313012'; -- MARCIA HINGREDY

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 3, 30, 'PARCELADA', '1ª: MAR(9d), 2ª: DEZ(21d)' FROM dim_efetivo WHERE matricula = '1959573'; -- ALLAN ROGERIO

INSERT INTO fat_ferias (efetivo_id, ano, mes_inicio, dias, tipo, observacao)
SELECT id, 2025, 5, 30, 'PARCELADA', '1ª: MAI(9d), 2ª: AGO(21d)' FROM dim_efetivo WHERE matricula = '241334'; -- JESSE CLEITON