-- ============================================
-- TABELAS DIM E FAT PARA ESTATÍSTICAS BPMA (2020-2025)
-- ============================================
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: 2026-01-05 22:53:02
-- ============================================

-- 1. TABELAS DIMENSÃO
-- ============================================

-- Dimensão: Ano
CREATE TABLE IF NOT EXISTS public.dim_ano (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ano integer NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Mês
CREATE TABLE IF NOT EXISTS public.dim_mes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mes integer NOT NULL UNIQUE CHECK (mes >= 1 AND mes <= 12),
    nome text NOT NULL,
    abreviacao text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Tipo de Atendimento
CREATE TABLE IF NOT EXISTS public.dim_tipo_atendimento (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Tipo de Fauna (para estatísticas)
CREATE TABLE IF NOT EXISTS public.dim_tipo_fauna_estatistica (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Popular dim_mes
INSERT INTO public.dim_mes (mes, nome, abreviacao) VALUES
    (1, 'Janeiro', 'JAN'),
    (2, 'Fevereiro', 'FEV'),
    (3, 'Março', 'MAR'),
    (4, 'Abril', 'ABR'),
    (5, 'Maio', 'MAI'),
    (6, 'Junho', 'JUN'),
    (7, 'Julho', 'JUL'),
    (8, 'Agosto', 'AGO'),
    (9, 'Setembro', 'SET'),
    (10, 'Outubro', 'OUT'),
    (11, 'Novembro', 'NOV'),
    (12, 'Dezembro', 'DEZ')
ON CONFLICT (mes) DO NOTHING;

-- Popular dim_ano
INSERT INTO public.dim_ano (ano) VALUES
    (2020), (2021), (2022), (2023), (2024), (2025)
ON CONFLICT (ano) DO NOTHING;

-- Popular dim_tipo_fauna_estatistica
INSERT INTO public.dim_tipo_fauna_estatistica (nome) VALUES
    ('AVES'),
    ('MAMÍFEROS'),
    ('RÉPTEIS')
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_tipo_atendimento com dados únicos

-- Tipos de atendimento extraídos dos dados
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ALMA DE GATO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ANDORINHA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ANTA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ANU BRANCO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ANU PRETO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ARARA CANINDÉ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ARARA MARACANÃ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ARAÇARI CASTANHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('AZULÃO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Apreensão de arma de fogo e/ou munição')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Atendimentos registrados')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Atendimentos registrados (RAP)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BACURAU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BAIANO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BEIJA FLOR')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BEM-TE-VI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BICHO PREGUIÇA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BICO DE LACRE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BICO DE PIMENTA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BICUDO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BICUDO-VERDADEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BIGODINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BIGUÁ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BRASÍLIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('BRAZLÂNDIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Busca de Animais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CABOCLINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CACHORRO DO MATO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CACHORRO DOMÉSTICO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CALANGO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CANDANGOLÂNDIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CANGAMBÁ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CANÁRIO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CANÁRIO DA TERRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CAPIVARA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CARCARÁ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CARDEAL-DO-NORDESTE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CARDEAL-DO-SUL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CATITU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CEILÂNDIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('COLEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORRUPIÃO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJA BURAQUEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJA CABURÉ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJA ORELHUDA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJA PRETA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJA SUINDARA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CORUJINHA DA MATA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CRUZEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CUICA VERDADEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CURIANGO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CURICACA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CURIÓ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CUTIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Captura de Animais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Captura de animais / Busca de Animais / Recolhimento e Remoção de Animais / Remoção de Animais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Corte de Árvores')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crime contra as Áreas de Proteção Permanente')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crime contra o Licenciamento Ambiental')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crime contra os Recursos Hídricos')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crime contra os Recursos Pesqueiros')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crimes contra a Administração Ambiental')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crimes contra a Fauna')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crimes contra a Flora')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Crimes contra as Unidades de Conservação')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CÁGADO COMUM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('CÁGADO DE BARBICHA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Em apuração')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('FERCAL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('FRANGO D''ÁGUA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('FURÃO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Flagrantes')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GAMA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GARIBALDI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GARÇA BRANCA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GATO DO MATO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GATURAMO VERDADEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GAVIÃO CARIJO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GAVIÃO QUIRI QUIRI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GAVIÃOZINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GECO-LEOPARDO (EXÓTICO)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GOLINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GRALHA - CANCÃ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GUARÁ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('GUAXINIM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('IGUANA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('IRAÚNA-GRANDE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('IRERÊ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ITAPOÃ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JABUTI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JACARE DO PAPO AMARELO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JACARETINGA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JACARÉ AÇU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JACARÉ DO PAPO AMARELO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JAGUARUNDI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JAGUATIRICA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JANDAIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JARDIM BOTÂNICO A')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JARDIM BOTÂNICO B')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JOÃO DE BARRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('JURUVA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('LAGO NORTE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('LAGO SUL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('LOBO GUARA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('LONTRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MACACO BUGIO/GUARIBA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MACACO DO TUFO PRETO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MACACO PREGO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MACACO SAGUI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MACACO SAGUI DO TUFO PRETO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MARIA FACEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MARITACA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MARRECO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MARTIM PESCADOR')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MELRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MICO ESTRELA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MINHOCUÇU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('MUTUM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('NOME POPULAR')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('NUCLEO BANDEIRANTE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Outros Crimes Ambientais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('P.A.A.I.')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PAPA CAPIM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PAPA LAGARTA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PAPAGAIO DO MANGUE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PAPAGAIO GALEGO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PAPAGAIO VERDADEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PARANOÁ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PARK WAY A')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PARK WAY B')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PATATIVA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PATO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PATURI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PERDIZ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PERIQUITO DO ENCONTRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PERIQUITO MARACANÃ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PERIQUITO REI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PERIQUITO RICO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PICA-PAU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PINTASSILGO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PLANALTINA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('POMBA DO BANDO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('POMBA VERDADEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('PORCO ESPINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Parcelamento Irregular do Solo')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE ATROPELAMENTO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE FERIDOS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE FILHOTES')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE RESGATE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE SOLTURA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTIDADE DE ÓBITOS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUANTOTIDADE DE ATROPELAMENTOS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUATI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('QUERO-QUERO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('RAPOSA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('RECANTO DAS EMAS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('RIACHO FUNDO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('RIACHO FUNDO II')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ROLINHA CINZENTA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ROLINHA-ROXA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ROUXINOL DO ENCONTRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Recolhimento/Remoção de Animais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Remoção de Animais')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SABIÁ-BARRANCO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SABIÁ-DO-CAMPO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SABIÁ-LARANJEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SAIRA AMARELA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SAMAMBAIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SANHAÇO CINZENTO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SANHAÇO COQUEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SANTA MARIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SARACURA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SARUÊ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SCIA/ESTRUTURAL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERIEMA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE BOA IMPERATOR (EXÓTICA)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE BOIPEBA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CANINANA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CASCAVEL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA CEGA / CECÍLIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA CEGA / DE DUAS CABEÇAS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA CIPÓ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA D''ÁGUA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA DORMIDEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA-DE-CAPIM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA-PAPAGAIO (EXÓTICA)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE COBRA-VERDE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CORAL FALSA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CORAL VERDADEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CORN SNAKE (EXÓTICA)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE CORRE CAMPO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE JARARACA CRUZEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE JARARACA VERDADEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE JARARACUÇU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE JIBOIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE JIBOIA ARCO ÍRIS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE KING SNAKE NIGRITOS (EXÓTICA)')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE MUÇURANA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE PERIQUITAMBOIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SERPENTE PYTHON')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SIA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SOBRADINHO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SOBRADINHO II')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SOCO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SUDOESTE/OCTAGONAL')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SUIRIRI-CAVALEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SUÇUARANA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('SÃO SEBASTIÃO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TAGUATINGA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TAMANDUÁ BANDEIRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TAMANDUÁ MIRIM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TARTARUGA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TARTARUGA TIGRE D''ÁGUA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TATU BOLA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TATU CANASTRA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TATU DE RABO MOLE')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TATU GALINHA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TATU PEBA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TEIÚ')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TESOURINHA')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TICO TICO REI')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TIZIU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TRINCA FERRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TUCANO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('TUIM')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Termos Circunstanciados - OUTRAS')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('Termos Circunstanciados de Ocorrência - PMDF')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('URUBU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('URUTAU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('VARJÃO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('VEADO CAMPEIRO')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('VICENTE PIRES')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('XEXÉU')
ON CONFLICT (nome) DO NOTHING;
INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('ÁGUAS CLARAS')
ON CONFLICT (nome) DO NOTHING;

-- 2. TABELAS FATO
-- ============================================

-- Tabela fato: Atendimentos Agregados
CREATE TABLE IF NOT EXISTS public.fat_atendimentos_estatisticas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    
    ano_id uuid REFERENCES public.dim_ano(id),
    mes_id uuid REFERENCES public.dim_mes(id),
    tipo_atendimento_id uuid REFERENCES public.dim_tipo_atendimento(id),
    
    quantidade integer NOT NULL DEFAULT 0,
    
    UNIQUE(ano_id, mes_id, tipo_atendimento_id)
);

-- Tabela fato: Resgates por Espécie
CREATE TABLE IF NOT EXISTS public.fat_resgates_estatisticas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    
    ano_id uuid REFERENCES public.dim_ano(id),
    mes_id uuid REFERENCES public.dim_mes(id),
    tipo_fauna_id uuid REFERENCES public.dim_tipo_fauna_estatistica(id),
    especie_id uuid REFERENCES public.dim_especies_fauna(id),
    
    nome_popular text,
    nome_cientifico text,
    ordem_taxonomica text,
    quantidade integer NOT NULL DEFAULT 0,
    
    -- Índice para melhorar performance
    UNIQUE(ano_id, mes_id, especie_id, tipo_fauna_id)
);

-- Habilitar RLS
ALTER TABLE public.fat_atendimentos_estatisticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_estatisticas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view fat_atendimentos_estatisticas" 
    ON public.fat_atendimentos_estatisticas
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view fat_resgates_estatisticas" 
    ON public.fat_resgates_estatisticas
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_atendimentos_estatisticas" 
    ON public.fat_atendimentos_estatisticas
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fat_resgates_estatisticas" 
    ON public.fat_resgates_estatisticas
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fat_atendimentos_ano_mes 
    ON public.fat_atendimentos_estatisticas(ano_id, mes_id);

CREATE INDEX IF NOT EXISTS idx_fat_resgates_ano_mes 
    ON public.fat_resgates_estatisticas(ano_id, mes_id);

CREATE INDEX IF NOT EXISTS idx_fat_resgates_especie 
    ON public.fat_resgates_estatisticas(especie_id);

