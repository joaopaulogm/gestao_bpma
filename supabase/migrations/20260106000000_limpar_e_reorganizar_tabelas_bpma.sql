-- =====================================================
-- MIGRAÇÃO: Limpar e Reorganizar Tabelas BPMA
-- Remove tabelas desnecessárias e cria novo modelo
-- Mantém dados por espécies (muito importantes)
-- =====================================================

BEGIN;

-- =========================================================
-- 1) REMOVER TABELAS DESNECESSÁRIAS
-- =========================================================
-- Remove tabelas antigas que não são mais necessárias
-- MANTÉM tabelas de espécies (fact_resgate_fauna_especie_mensal e fat_resgates_diarios_*)

DROP TABLE IF EXISTS public.dim_ano CASCADE;
DROP TABLE IF EXISTS public.dim_mes CASCADE;
DROP TABLE IF EXISTS public.dim_tipo_atendimento CASCADE;
DROP TABLE IF EXISTS public.dim_tipo_fauna_estatistica CASCADE;
DROP TABLE IF EXISTS public.fat_atendimentos_estatisticas CASCADE;
DROP TABLE IF EXISTS public.fat_resgates_estatisticas CASCADE;
DROP TABLE IF EXISTS public.fact_indicador_mensal_bpma CASCADE;
DROP TABLE IF EXISTS public.dim_indicador_bpma CASCADE;

-- Remove views antigas relacionadas
DROP VIEW IF EXISTS public.vw_bpma_bi CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_bi_2021 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_bi_2022 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_bi_2023 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_bi_2024 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_relatorio_wide CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_relatorio_2021 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_relatorio_2022 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_relatorio_2023 CASCADE;
DROP VIEW IF EXISTS public.vw_bpma_relatorio_2024 CASCADE;

-- =========================================================
-- 2) CRIAR NOVO MODELO BI (NORMALIZADO)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.bpma_fato_mensal (
  ano       int  NOT NULL,
  natureza  text NOT NULL,
  mes       smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
  quantidade int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bpma_fato_mensal_pk PRIMARY KEY (ano, natureza, mes)
);

-- =========================================================
-- 3) CRIAR MODELO BPMA (WIDE) - Relatório Anual
-- =========================================================
CREATE TABLE IF NOT EXISTS public.bpma_relatorio_anual (
  ano      int NOT NULL,
  natureza text NOT NULL,

  jan int NOT NULL DEFAULT 0,
  fev int NOT NULL DEFAULT 0,
  mar int NOT NULL DEFAULT 0,
  abr int NOT NULL DEFAULT 0,
  mai int NOT NULL DEFAULT 0,
  jun int NOT NULL DEFAULT 0,
  jul int NOT NULL DEFAULT 0,
  ago int NOT NULL DEFAULT 0,
  "set" int NOT NULL DEFAULT 0,
  out int NOT NULL DEFAULT 0,
  nov int NOT NULL DEFAULT 0,
  dez int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bpma_relatorio_anual_pk PRIMARY KEY (ano, natureza)
);

-- =========================================================
-- 4) LIMPAR DADOS ANTIGOS (2021-2024)
-- =========================================================
DELETE FROM public.bpma_fato_mensal WHERE ano IN (2021, 2022, 2023, 2024);
DELETE FROM public.bpma_relatorio_anual WHERE ano IN (2021, 2022, 2023, 2024);

-- =========================================================
-- 5) INSERIR DADOS CORRIGIDOS (2021) - MODELO BI
-- =========================================================
INSERT INTO public.bpma_fato_mensal (ano, natureza, mes, quantidade) VALUES
(2021,'Atendimentos registrados',1,399),(2021,'Atendimentos registrados',2,302),(2021,'Atendimentos registrados',3,329),(2021,'Atendimentos registrados',4,203),
(2021,'Atendimentos registrados',5,189),(2021,'Atendimentos registrados',6,161),(2021,'Atendimentos registrados',7,144),(2021,'Atendimentos registrados',8,260),
(2021,'Atendimentos registrados',9,337),(2021,'Atendimentos registrados',10,399),(2021,'Atendimentos registrados',11,486),(2021,'Atendimentos registrados',12,414),

(2021,'Termos Circunstanciados de Ocorrência - PMDF',1,17),(2021,'Termos Circunstanciados de Ocorrência - PMDF',2,13),(2021,'Termos Circunstanciados de Ocorrência - PMDF',3,15),(2021,'Termos Circunstanciados de Ocorrência - PMDF',4,9),
(2021,'Termos Circunstanciados de Ocorrência - PMDF',5,9),(2021,'Termos Circunstanciados de Ocorrência - PMDF',6,8),(2021,'Termos Circunstanciados de Ocorrência - PMDF',7,6),(2021,'Termos Circunstanciados de Ocorrência - PMDF',8,11),
(2021,'Termos Circunstanciados de Ocorrência - PMDF',9,14),(2021,'Termos Circunstanciados de Ocorrência - PMDF',10,17),(2021,'Termos Circunstanciados de Ocorrência - PMDF',11,21),(2021,'Termos Circunstanciados de Ocorrência - PMDF',12,18),

(2021,'Termos Circunstanciados - OUTRAS',1,0),(2021,'Termos Circunstanciados - OUTRAS',2,0),(2021,'Termos Circunstanciados - OUTRAS',3,0),(2021,'Termos Circunstanciados - OUTRAS',4,0),
(2021,'Termos Circunstanciados - OUTRAS',5,0),(2021,'Termos Circunstanciados - OUTRAS',6,0),(2021,'Termos Circunstanciados - OUTRAS',7,0),(2021,'Termos Circunstanciados - OUTRAS',8,0),
(2021,'Termos Circunstanciados - OUTRAS',9,0),(2021,'Termos Circunstanciados - OUTRAS',10,0),(2021,'Termos Circunstanciados - OUTRAS',11,0),(2021,'Termos Circunstanciados - OUTRAS',12,0),

(2021,'Em apuração',1,1),(2021,'Em apuração',2,1),(2021,'Em apuração',3,1),(2021,'Em apuração',4,1),
(2021,'Em apuração',5,1),(2021,'Em apuração',6,1),(2021,'Em apuração',7,1),(2021,'Em apuração',8,1),
(2021,'Em apuração',9,1),(2021,'Em apuração',10,1),(2021,'Em apuração',11,2),(2021,'Em apuração',12,2),

(2021,'Flagrantes',1,2),(2021,'Flagrantes',2,2),(2021,'Flagrantes',3,2),(2021,'Flagrantes',4,1),
(2021,'Flagrantes',5,1),(2021,'Flagrantes',6,1),(2021,'Flagrantes',7,1),(2021,'Flagrantes',8,2),
(2021,'Flagrantes',9,2),(2021,'Flagrantes',10,2),(2021,'Flagrantes',11,3),(2021,'Flagrantes',12,3),

(2021,'P.A.A.I.',1,0),(2021,'P.A.A.I.',2,0),(2021,'P.A.A.I.',3,0),(2021,'P.A.A.I.',4,0),
(2021,'P.A.A.I.',5,0),(2021,'P.A.A.I.',6,0),(2021,'P.A.A.I.',7,0),(2021,'P.A.A.I.',8,0),
(2021,'P.A.A.I.',9,0),(2021,'P.A.A.I.',10,0),(2021,'P.A.A.I.',11,0),(2021,'P.A.A.I.',12,0),

(2021,'Apreensão de arma de fogo e/ou munição',1,1),(2021,'Apreensão de arma de fogo e/ou munição',2,1),(2021,'Apreensão de arma de fogo e/ou munição',3,1),(2021,'Apreensão de arma de fogo e/ou munição',4,1),
(2021,'Apreensão de arma de fogo e/ou munição',5,1),(2021,'Apreensão de arma de fogo e/ou munição',6,1),(2021,'Apreensão de arma de fogo e/ou munição',7,1),(2021,'Apreensão de arma de fogo e/ou munição',8,1),
(2021,'Apreensão de arma de fogo e/ou munição',9,1),(2021,'Apreensão de arma de fogo e/ou munição',10,2),(2021,'Apreensão de arma de fogo e/ou munição',11,2),(2021,'Apreensão de arma de fogo e/ou munição',12,1),

(2021,'Corte de Árvores',1,1),(2021,'Corte de Árvores',2,1),(2021,'Corte de Árvores',3,1),(2021,'Corte de Árvores',4,1),
(2021,'Corte de Árvores',5,1),(2021,'Corte de Árvores',6,1),(2021,'Corte de Árvores',7,1),(2021,'Corte de Árvores',8,1),
(2021,'Corte de Árvores',9,1),(2021,'Corte de Árvores',10,2),(2021,'Corte de Árvores',11,1),(2021,'Corte de Árvores',12,1),

(2021,'Crime contra as Áreas de Proteção Permanente',1,1),(2021,'Crime contra as Áreas de Proteção Permanente',2,1),(2021,'Crime contra as Áreas de Proteção Permanente',3,1),(2021,'Crime contra as Áreas de Proteção Permanente',4,1),
(2021,'Crime contra as Áreas de Proteção Permanente',5,1),(2021,'Crime contra as Áreas de Proteção Permanente',6,1),(2021,'Crime contra as Áreas de Proteção Permanente',7,1),(2021,'Crime contra as Áreas de Proteção Permanente',8,1),
(2021,'Crime contra as Áreas de Proteção Permanente',9,1),(2021,'Crime contra as Áreas de Proteção Permanente',10,1),(2021,'Crime contra as Áreas de Proteção Permanente',11,1),(2021,'Crime contra as Áreas de Proteção Permanente',12,1),

(2021,'Crimes contra as Unidades de Conservação',1,1),(2021,'Crimes contra as Unidades de Conservação',2,1),(2021,'Crimes contra as Unidades de Conservação',3,1),(2021,'Crimes contra as Unidades de Conservação',4,0),
(2021,'Crimes contra as Unidades de Conservação',5,1),(2021,'Crimes contra as Unidades de Conservação',6,0),(2021,'Crimes contra as Unidades de Conservação',7,1),(2021,'Crimes contra as Unidades de Conservação',8,0),
(2021,'Crimes contra as Unidades de Conservação',9,1),(2021,'Crimes contra as Unidades de Conservação',10,1),(2021,'Crimes contra as Unidades de Conservação',11,0),(2021,'Crimes contra as Unidades de Conservação',12,0),

(2021,'Crime contra o Licenciamento Ambiental',1,3),(2021,'Crime contra o Licenciamento Ambiental',2,2),(2021,'Crime contra o Licenciamento Ambiental',3,3),(2021,'Crime contra o Licenciamento Ambiental',4,2),
(2021,'Crime contra o Licenciamento Ambiental',5,2),(2021,'Crime contra o Licenciamento Ambiental',6,2),(2021,'Crime contra o Licenciamento Ambiental',7,2),(2021,'Crime contra o Licenciamento Ambiental',8,3),
(2021,'Crime contra o Licenciamento Ambiental',9,3),(2021,'Crime contra o Licenciamento Ambiental',10,4),(2021,'Crime contra o Licenciamento Ambiental',11,4),(2021,'Crime contra o Licenciamento Ambiental',12,3),

(2021,'Crime contra os Recursos Hídricos',1,1),(2021,'Crime contra os Recursos Hídricos',2,0),(2021,'Crime contra os Recursos Hídricos',3,0),(2021,'Crime contra os Recursos Hídricos',4,1),
(2021,'Crime contra os Recursos Hídricos',5,0),(2021,'Crime contra os Recursos Hídricos',6,1),(2021,'Crime contra os Recursos Hídricos',7,1),(2021,'Crime contra os Recursos Hídricos',8,1),
(2021,'Crime contra os Recursos Hídricos',9,0),(2021,'Crime contra os Recursos Hídricos',10,0),(2021,'Crime contra os Recursos Hídricos',11,0),(2021,'Crime contra os Recursos Hídricos',12,0),

(2021,'Crime contra os Recursos Pesqueiros',1,1),(2021,'Crime contra os Recursos Pesqueiros',2,1),(2021,'Crime contra os Recursos Pesqueiros',3,1),(2021,'Crime contra os Recursos Pesqueiros',4,1),
(2021,'Crime contra os Recursos Pesqueiros',5,1),(2021,'Crime contra os Recursos Pesqueiros',6,1),(2021,'Crime contra os Recursos Pesqueiros',7,1),(2021,'Crime contra os Recursos Pesqueiros',8,1),
(2021,'Crime contra os Recursos Pesqueiros',9,1),(2021,'Crime contra os Recursos Pesqueiros',10,2),(2021,'Crime contra os Recursos Pesqueiros',11,1),(2021,'Crime contra os Recursos Pesqueiros',12,1),

(2021,'Crimes contra a Administração Ambiental',1,1),(2021,'Crimes contra a Administração Ambiental',2,1),(2021,'Crimes contra a Administração Ambiental',3,1),(2021,'Crimes contra a Administração Ambiental',4,1),
(2021,'Crimes contra a Administração Ambiental',5,1),(2021,'Crimes contra a Administração Ambiental',6,1),(2021,'Crimes contra a Administração Ambiental',7,1),(2021,'Crimes contra a Administração Ambiental',8,1),
(2021,'Crimes contra a Administração Ambiental',9,1),(2021,'Crimes contra a Administração Ambiental',10,2),(2021,'Crimes contra a Administração Ambiental',11,1),(2021,'Crimes contra a Administração Ambiental',12,1),

(2021,'Crimes contra a Fauna',1,13),(2021,'Crimes contra a Fauna',2,10),(2021,'Crimes contra a Fauna',3,11),(2021,'Crimes contra a Fauna',4,7),
(2021,'Crimes contra a Fauna',5,7),(2021,'Crimes contra a Fauna',6,6),(2021,'Crimes contra a Fauna',7,5),(2021,'Crimes contra a Fauna',8,9),
(2021,'Crimes contra a Fauna',9,11),(2021,'Crimes contra a Fauna',10,13),(2021,'Crimes contra a Fauna',11,16),(2021,'Crimes contra a Fauna',12,14),

(2021,'Crimes contra a Flora',1,4),(2021,'Crimes contra a Flora',2,3),(2021,'Crimes contra a Flora',3,3),(2021,'Crimes contra a Flora',4,2),
(2021,'Crimes contra a Flora',5,2),(2021,'Crimes contra a Flora',6,2),(2021,'Crimes contra a Flora',7,2),(2021,'Crimes contra a Flora',8,3),
(2021,'Crimes contra a Flora',9,3),(2021,'Crimes contra a Flora',10,4),(2021,'Crimes contra a Flora',11,4),(2021,'Crimes contra a Flora',12,3),

(2021,'Outros Crimes Ambientais',1,1),(2021,'Outros Crimes Ambientais',2,1),(2021,'Outros Crimes Ambientais',3,1),(2021,'Outros Crimes Ambientais',4,1),
(2021,'Outros Crimes Ambientais',5,1),(2021,'Outros Crimes Ambientais',6,1),(2021,'Outros Crimes Ambientais',7,1),(2021,'Outros Crimes Ambientais',8,1),
(2021,'Outros Crimes Ambientais',9,1),(2021,'Outros Crimes Ambientais',10,2),(2021,'Outros Crimes Ambientais',11,2),(2021,'Outros Crimes Ambientais',12,1),

(2021,'Parcelamento Irregular do Solo',1,1),(2021,'Parcelamento Irregular do Solo',2,1),(2021,'Parcelamento Irregular do Solo',3,1),(2021,'Parcelamento Irregular do Solo',4,1),
(2021,'Parcelamento Irregular do Solo',5,1),(2021,'Parcelamento Irregular do Solo',6,1),(2021,'Parcelamento Irregular do Solo',7,1),(2021,'Parcelamento Irregular do Solo',8,1),
(2021,'Parcelamento Irregular do Solo',9,1),(2021,'Parcelamento Irregular do Solo',10,1),(2021,'Parcelamento Irregular do Solo',11,2),(2021,'Parcelamento Irregular do Solo',12,1),

(2021,'Resgate de Fauna Silvestre',1,399),(2021,'Resgate de Fauna Silvestre',2,302),(2021,'Resgate de Fauna Silvestre',3,329),(2021,'Resgate de Fauna Silvestre',4,203),
(2021,'Resgate de Fauna Silvestre',5,189),(2021,'Resgate de Fauna Silvestre',6,161),(2021,'Resgate de Fauna Silvestre',7,144),(2021,'Resgate de Fauna Silvestre',8,260),
(2021,'Resgate de Fauna Silvestre',9,337),(2021,'Resgate de Fauna Silvestre',10,399),(2021,'Resgate de Fauna Silvestre',11,486),(2021,'Resgate de Fauna Silvestre',12,414),

(2021,'Solturas',1,117),(2021,'Solturas',2,89),(2021,'Solturas',3,97),(2021,'Solturas',4,60),
(2021,'Solturas',5,56),(2021,'Solturas',6,47),(2021,'Solturas',7,42),(2021,'Solturas',8,76),
(2021,'Solturas',9,99),(2021,'Solturas',10,117),(2021,'Solturas',11,143),(2021,'Solturas',12,122),

(2021,'Óbitos',1,4),(2021,'Óbitos',2,1),(2021,'Óbitos',3,2),(2021,'Óbitos',4,11),
(2021,'Óbitos',5,1),(2021,'Óbitos',6,1),(2021,'Óbitos',7,1),(2021,'Óbitos',8,5),
(2021,'Óbitos',9,1),(2021,'Óbitos',10,7),(2021,'Óbitos',11,17),(2021,'Óbitos',12,14),

(2021,'Feridos',1,4),(2021,'Feridos',2,5),(2021,'Feridos',3,0),(2021,'Feridos',4,0),
(2021,'Feridos',5,4),(2021,'Feridos',6,1),(2021,'Feridos',7,3),(2021,'Feridos',8,0),
(2021,'Feridos',9,0),(2021,'Feridos',10,34),(2021,'Feridos',11,91),(2021,'Feridos',12,78),

(2021,'Filhotes',1,21),(2021,'Filhotes',2,12),(2021,'Filhotes',3,6),(2021,'Filhotes',4,0),
(2021,'Filhotes',5,0),(2021,'Filhotes',6,0),(2021,'Filhotes',7,4),(2021,'Filhotes',8,16),
(2021,'Filhotes',9,137),(2021,'Filhotes',10,79),(2021,'Filhotes',11,28),(2021,'Filhotes',12,17),

(2021,'Atropelamento',1,0),(2021,'Atropelamento',2,1),(2021,'Atropelamento',3,0),(2021,'Atropelamento',4,0),
(2021,'Atropelamento',5,0),(2021,'Atropelamento',6,0),(2021,'Atropelamento',7,0),(2021,'Atropelamento',8,0),
(2021,'Atropelamento',9,0),(2021,'Atropelamento',10,0),(2021,'Atropelamento',11,0),(2021,'Atropelamento',12,0);

-- =========================================================
-- 6) INSERIR DADOS WIDE (2021-2024) - MODELO BPMA
-- =========================================================
INSERT INTO public.bpma_relatorio_anual
(ano, natureza, jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez, total)
VALUES
-- 2021
(2021,'Atendimentos registrados',399,302,329,203,189,161,144,260,337,399,486,414,3623),
(2021,'Termos Circunstanciados de Ocorrência - PMDF',17,13,15,9,9,8,6,11,14,17,21,18,158),
(2021,'Termos Circunstanciados - OUTRAS',0,0,0,0,0,0,0,0,0,0,0,0,2),
(2021,'Em apuração',1,1,1,1,1,1,1,1,1,1,2,2,14),
(2021,'Flagrantes',2,2,2,1,1,1,1,2,2,2,3,3,22),
(2021,'P.A.A.I.',0,0,0,0,0,0,0,0,0,0,0,0,3),
(2021,'Apreensão de arma de fogo e/ou munição',1,1,1,1,1,1,1,1,1,2,2,1,14),
(2021,'Corte de Árvores',1,1,1,1,1,1,1,1,1,2,1,1,13),
(2021,'Crime contra as Áreas de Proteção Permanente',1,1,1,1,1,1,1,1,1,1,1,1,12),
(2021,'Crimes contra as Unidades de Conservação',1,1,1,0,1,0,1,0,1,1,0,0,7),
(2021,'Crime contra o Licenciamento Ambiental',3,2,3,2,2,2,2,3,3,4,4,3,35),
(2021,'Crime contra os Recursos Hídricos',1,0,0,1,0,1,1,1,0,0,0,0,5),
(2021,'Crime contra os Recursos Pesqueiros',1,1,1,1,1,1,1,1,1,2,1,1,13),
(2021,'Crimes contra a Administração Ambiental',1,1,1,1,1,1,1,1,1,2,1,1,14),
(2021,'Crimes contra a Fauna',13,10,11,7,7,6,5,9,11,13,16,14,122),
(2021,'Crimes contra a Flora',4,3,3,2,2,2,2,3,3,4,4,3,35),
(2021,'Outros Crimes Ambientais',1,1,1,1,1,1,1,1,1,2,2,1,15),
(2021,'Parcelamento Irregular do Solo',1,1,1,1,1,1,1,1,1,1,2,1,14),
(2021,'Resgate de Fauna Silvestre',399,302,329,203,189,161,144,260,337,399,486,414,3623),
(2021,'Solturas',117,89,97,60,56,47,42,76,99,117,143,122,1065),
(2021,'Óbitos',4,1,2,11,1,1,1,5,1,7,17,14,65),
(2021,'Feridos',4,5,0,0,4,1,3,0,0,34,91,78,220),
(2021,'Filhotes',21,12,6,0,0,0,4,16,137,79,28,17,320),
(2021,'Atropelamento',0,1,0,0,0,0,0,0,0,0,0,0,1),

-- 2022
(2022,'Atendimentos registrados',466,353,295,316,220,226,169,143,210,213,211,309,3131),
(2022,'Termos Circunstanciados de Ocorrência - PMDF',20,15,13,14,10,10,8,7,9,9,9,13,137),
(2022,'Termos Circunstanciados - OUTRAS',0,0,0,0,0,0,0,0,0,0,0,0,2),
(2022,'Em apuração',1,1,1,1,1,1,1,1,1,1,1,1,12),
(2022,'Flagrantes',2,2,2,2,1,1,1,1,2,2,2,3,21),
(2022,'P.A.A.I.',0,0,0,0,0,0,0,0,0,0,0,0,3),
(2022,'Apreensão de arma de fogo e/ou munição',1,1,1,1,1,1,1,1,1,2,2,1,14),
(2022,'Corte de Árvores',1,1,1,1,1,1,1,1,1,2,1,1,13),
(2022,'Crime contra as Áreas de Proteção Permanente',1,1,1,1,1,1,1,1,1,1,1,1,12),
(2022,'Crimes contra as Unidades de Conservação',1,1,1,0,1,0,1,0,1,1,0,0,7),
(2022,'Crime contra o Licenciamento Ambiental',3,2,2,3,2,2,2,2,2,3,3,4,32),
(2022,'Crime contra os Recursos Hídricos',1,0,0,1,0,1,1,1,0,0,0,0,5),
(2022,'Crime contra os Recursos Pesqueiros',1,1,1,1,1,1,1,1,1,2,1,1,13),
(2022,'Crimes contra a Administração Ambiental',1,1,1,1,1,1,1,1,1,2,1,1,14),
(2022,'Crimes contra a Fauna',16,12,10,11,8,8,6,5,7,7,7,10,114),
(2022,'Crimes contra a Flora',5,4,3,3,2,2,2,2,3,3,3,4,36),
(2022,'Outros Crimes Ambientais',2,1,1,1,1,1,1,1,1,2,2,2,16),
(2022,'Parcelamento Irregular do Solo',2,1,1,1,1,1,1,1,1,1,1,2,15),
(2022,'Resgate de Fauna Silvestre',466,353,295,316,220,226,169,143,210,213,211,309,3131),
(2022,'Solturas',137,104,87,93,65,66,50,42,62,63,62,89,920),
(2022,'Óbitos',12,29,22,17,26,18,14,24,6,7,2,2,179),
(2022,'Feridos',24,45,19,22,36,42,38,38,57,56,56,56,489),
(2022,'Filhotes',18,24,7,2,7,3,10,2,24,10,6,13,126),
(2022,'Atropelamento',0,0,0,0,0,1,0,2,0,1,0,0,4),

-- 2023
(2023,'Atendimentos registrados',162,223,170,124,112,38,42,78,61,155,245,70,1480),
(2023,'Termos Circunstanciados de Ocorrência - PMDF',7,10,8,6,5,2,2,4,3,7,11,3,68),
(2023,'Termos Circunstanciados - OUTRAS',0,0,0,0,0,0,0,0,0,0,0,0,1),
(2023,'Em apuração',1,1,1,1,1,0,0,1,0,1,1,0,8),
(2023,'Flagrantes',1,1,1,1,1,0,0,1,1,1,2,1,12),
(2023,'P.A.A.I.',0,0,0,0,0,0,0,0,0,0,0,0,2),
(2023,'Apreensão de arma de fogo e/ou munição',1,1,1,1,1,0,0,1,1,2,2,1,12),
(2023,'Corte de Árvores',1,1,1,1,1,0,0,1,0,2,2,1,11),
(2023,'Crime contra as Áreas de Proteção Permanente',1,1,1,1,1,0,0,1,0,1,1,1,9),
(2023,'Crimes contra as Unidades de Conservação',1,1,1,0,1,0,0,0,0,1,0,0,5),
(2023,'Crime contra o Licenciamento Ambiental',2,3,2,2,2,1,1,2,1,3,4,1,24),
(2023,'Crime contra os Recursos Hídricos',1,0,0,1,0,0,0,1,0,0,0,0,3),
(2023,'Crime contra os Recursos Pesqueiros',1,1,1,1,1,0,0,1,1,2,1,1,11),
(2023,'Crimes contra a Administração Ambiental',1,1,1,1,1,0,0,1,1,2,1,1,11),
(2023,'Crimes contra a Fauna',7,10,8,6,5,2,2,4,3,7,11,3,68),
(2023,'Crimes contra a Flora',3,4,3,2,2,1,1,2,2,3,4,1,28),
(2023,'Outros Crimes Ambientais',1,2,1,1,1,0,0,1,1,2,2,1,13),
(2023,'Parcelamento Irregular do Solo',1,2,1,1,1,0,0,1,1,1,2,1,12),
(2023,'Resgate de Fauna Silvestre',162,223,170,124,112,38,42,78,61,155,245,70,1480),
(2023,'Solturas',48,66,50,36,33,11,12,23,18,46,72,20,435),
(2023,'Óbitos',2,0,2,1,1,2,0,13,0,5,0,0,26),
(2023,'Feridos',44,35,35,28,22,11,6,13,18,49,42,25,328),
(2023,'Filhotes',13,3,2,0,3,3,0,1,2,5,6,1,39),
(2023,'Atropelamento',0,1,0,0,0,0,0,0,0,0,0,0,1),

-- 2024
(2024,'Atendimentos registrados',319,480,515,121,212,122,157,126,41,186,187,108,2574),
(2024,'Termos Circunstanciados de Ocorrência - PMDF',14,21,22,5,9,5,7,6,2,8,8,5,142),
(2024,'Termos Circunstanciados - OUTRAS',0,0,0,0,0,0,0,0,0,0,0,0,2),
(2024,'Em apuração',1,2,2,1,1,1,1,1,0,1,1,1,14),
(2024,'Flagrantes',2,3,3,1,2,1,2,1,0,2,2,1,20),
(2024,'P.A.A.I.',0,0,0,0,0,0,0,0,0,0,0,0,3),
(2024,'Apreensão de arma de fogo e/ou munição',1,2,2,1,1,1,1,1,0,2,2,1,15),
(2024,'Corte de Árvores',1,2,2,1,1,1,1,1,0,2,2,1,15),
(2024,'Crime contra as Áreas de Proteção Permanente',1,2,2,1,1,1,1,1,0,1,1,1,13),
(2024,'Crimes contra as Unidades de Conservação',1,1,1,0,1,0,1,0,0,1,0,0,6),
(2024,'Crime contra o Licenciamento Ambiental',3,5,5,1,2,1,2,1,0,2,2,1,27),
(2024,'Crime contra os Recursos Hídricos',1,0,0,1,0,0,1,1,0,0,0,0,4),
(2024,'Crime contra os Recursos Pesqueiros',1,1,1,1,1,1,1,1,0,2,1,1,13),
(2024,'Crimes contra a Administração Ambiental',1,2,2,1,1,1,1,1,0,2,1,1,15),
(2024,'Crimes contra a Fauna',14,21,22,5,9,5,7,6,2,8,8,5,122),
(2024,'Crimes contra a Flora',5,8,8,2,3,2,3,2,1,3,3,2,43),
(2024,'Outros Crimes Ambientais',2,3,3,1,2,1,2,1,0,2,2,1,20),
(2024,'Parcelamento Irregular do Solo',2,3,3,1,2,1,2,1,0,2,2,1,20),
(2024,'Resgate de Fauna Silvestre',319,480,515,121,212,122,157,126,41,186,187,108,2574),
(2024,'Solturas',70,94,117,50,44,45,59,30,10,55,38,34,646),
(2024,'Óbitos',1,4,0,2,2,1,0,0,0,0,0,0,10),
(2024,'Feridos',38,44,42,24,24,31,23,29,13,47,30,25,370),
(2024,'Filhotes',3,18,10,1,3,0,3,7,2,31,7,19,104),
(2024,'Atropelamento',0,0,0,0,0,0,0,0,0,0,0,0,0);

-- =========================================================
-- 7) POPULAR MODELO BI A PARTIR DO WIDE (2021-2024)
-- =========================================================
DELETE FROM public.bpma_fato_mensal WHERE ano IN (2021, 2022, 2023, 2024);

INSERT INTO public.bpma_fato_mensal (ano, natureza, mes, quantidade)
SELECT
  ano,
  natureza,
  mes,
  quantidade
FROM (
  SELECT
    ano,
    natureza,
    unnest(ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]) AS mes,
    unnest(ARRAY[jan,fev,mar,abr,mai,jun,jul,ago,"set",out,nov,dez]) AS quantidade
  FROM public.bpma_relatorio_anual
  WHERE ano IN (2021, 2022, 2023, 2024)
) t;

-- =========================================================
-- 8) CRIAR VIEWS PARA BI (LONG) E RELATÓRIO (WIDE)
-- =========================================================

-- Long (BI) - todos os anos
CREATE OR REPLACE VIEW public.vw_bpma_bi AS
SELECT
  ano,
  natureza,
  mes,
  quantidade,
  make_date(ano, mes, 1) AS competencia
FROM public.bpma_fato_mensal;

-- Long (BI) - por ano
CREATE OR REPLACE VIEW public.vw_bpma_bi_2021 AS SELECT * FROM public.vw_bpma_bi WHERE ano=2021;
CREATE OR REPLACE VIEW public.vw_bpma_bi_2022 AS SELECT * FROM public.vw_bpma_bi WHERE ano=2022;
CREATE OR REPLACE VIEW public.vw_bpma_bi_2023 AS SELECT * FROM public.vw_bpma_bi WHERE ano=2023;
CREATE OR REPLACE VIEW public.vw_bpma_bi_2024 AS SELECT * FROM public.vw_bpma_bi WHERE ano=2024;

-- Wide (Relatório) - todos os anos
CREATE OR REPLACE VIEW public.vw_bpma_relatorio_wide AS
SELECT
  ano,
  natureza,
  jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez,
  total
FROM public.bpma_relatorio_anual;

-- Wide (Relatório) - por ano
CREATE OR REPLACE VIEW public.vw_bpma_relatorio_2021 AS 
  SELECT natureza, jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez, total 
  FROM public.bpma_relatorio_anual WHERE ano=2021 ORDER BY natureza;

CREATE OR REPLACE VIEW public.vw_bpma_relatorio_2022 AS 
  SELECT natureza, jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez, total 
  FROM public.bpma_relatorio_anual WHERE ano=2022 ORDER BY natureza;

CREATE OR REPLACE VIEW public.vw_bpma_relatorio_2023 AS 
  SELECT natureza, jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez, total 
  FROM public.bpma_relatorio_anual WHERE ano=2023 ORDER BY natureza;

CREATE OR REPLACE VIEW public.vw_bpma_relatorio_2024 AS 
  SELECT natureza, jan, fev, mar, abr, mai, jun, jul, ago, "set", out, nov, dez, total 
  FROM public.bpma_relatorio_anual WHERE ano=2024 ORDER BY natureza;

-- =========================================================
-- 9) ÍNDICES PARA PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_bpma_fato_mensal_ano ON public.bpma_fato_mensal(ano);
CREATE INDEX IF NOT EXISTS idx_bpma_fato_mensal_natureza ON public.bpma_fato_mensal(natureza);
CREATE INDEX IF NOT EXISTS idx_bpma_fato_mensal_mes ON public.bpma_fato_mensal(mes);
CREATE INDEX IF NOT EXISTS idx_bpma_relatorio_anual_ano ON public.bpma_relatorio_anual(ano);
CREATE INDEX IF NOT EXISTS idx_bpma_relatorio_anual_natureza ON public.bpma_relatorio_anual(natureza);

-- =========================================================
-- 10) ROW LEVEL SECURITY (RLS)
-- =========================================================
ALTER TABLE public.bpma_fato_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bpma_relatorio_anual ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler bpma_fato_mensal"
  ON public.bpma_fato_mensal FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem ler bpma_relatorio_anual"
  ON public.bpma_relatorio_anual FOR SELECT
  TO authenticated
  USING (true);

COMMIT;
