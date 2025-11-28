-- ============================================
-- MODELO DIMENSIONAL PARA POWER BI
-- ============================================

-- 1. Criar tabelas dimensão
-- ============================================

-- Dimensão: Região Administrativa
CREATE TABLE public.dim_regiao_administrativa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Origem
CREATE TABLE public.dim_origem (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Destinação
CREATE TABLE public.dim_destinacao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Estado de Saúde
CREATE TABLE public.dim_estado_saude (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Estágio de Vida
CREATE TABLE public.dim_estagio_vida (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Desfecho
CREATE TABLE public.dim_desfecho (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('resgate', 'apreensao')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(nome, tipo)
);

-- 2. Renomear especies_fauna para dim_especies (dimensão)
-- ============================================
ALTER TABLE public.especies_fauna RENAME TO dim_especies;

-- 3. Popular as tabelas dimensão com dados únicos de registros
-- ============================================

-- Popular dim_regiao_administrativa
INSERT INTO public.dim_regiao_administrativa (nome)
SELECT DISTINCT regiao_administrativa 
FROM public.registros 
WHERE regiao_administrativa IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_origem
INSERT INTO public.dim_origem (nome)
SELECT DISTINCT origem 
FROM public.registros 
WHERE origem IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_destinacao
INSERT INTO public.dim_destinacao (nome)
SELECT DISTINCT destinacao 
FROM public.registros 
WHERE destinacao IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_estado_saude
INSERT INTO public.dim_estado_saude (nome)
SELECT DISTINCT estado_saude 
FROM public.registros 
WHERE estado_saude IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_estagio_vida
INSERT INTO public.dim_estagio_vida (nome)
SELECT DISTINCT estagio_vida 
FROM public.registros 
WHERE estagio_vida IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_desfecho (resgates)
INSERT INTO public.dim_desfecho (nome, tipo)
SELECT DISTINCT desfecho_resgate, 'resgate'
FROM public.registros 
WHERE desfecho_resgate IS NOT NULL
ON CONFLICT (nome, tipo) DO NOTHING;

-- Popular dim_desfecho (apreensões)
INSERT INTO public.dim_desfecho (nome, tipo)
SELECT DISTINCT desfecho_apreensao, 'apreensao'
FROM public.registros 
WHERE desfecho_apreensao IS NOT NULL
ON CONFLICT (nome, tipo) DO NOTHING;

-- 4. Adicionar colunas FK na tabela fato (registros)
-- ============================================

ALTER TABLE public.registros 
ADD COLUMN especie_id uuid,
ADD COLUMN regiao_administrativa_id uuid,
ADD COLUMN origem_id uuid,
ADD COLUMN destinacao_id uuid,
ADD COLUMN estado_saude_id uuid,
ADD COLUMN estagio_vida_id uuid,
ADD COLUMN desfecho_id uuid;

-- 5. Popular as FKs com base nos dados existentes
-- ============================================

-- FK para dim_especies (baseado em nome_cientifico)
UPDATE public.registros r
SET especie_id = d.id
FROM public.dim_especies d
WHERE r.nome_cientifico = d.nome_cientifico;

-- FK para dim_regiao_administrativa
UPDATE public.registros r
SET regiao_administrativa_id = d.id
FROM public.dim_regiao_administrativa d
WHERE r.regiao_administrativa = d.nome;

-- FK para dim_origem
UPDATE public.registros r
SET origem_id = d.id
FROM public.dim_origem d
WHERE r.origem = d.nome;

-- FK para dim_destinacao
UPDATE public.registros r
SET destinacao_id = d.id
FROM public.dim_destinacao d
WHERE r.destinacao = d.nome;

-- FK para dim_estado_saude
UPDATE public.registros r
SET estado_saude_id = d.id
FROM public.dim_estado_saude d
WHERE r.estado_saude = d.nome;

-- FK para dim_estagio_vida
UPDATE public.registros r
SET estagio_vida_id = d.id
FROM public.dim_estagio_vida d
WHERE r.estagio_vida = d.nome;

-- FK para dim_desfecho (resgate)
UPDATE public.registros r
SET desfecho_id = d.id
FROM public.dim_desfecho d
WHERE r.desfecho_resgate = d.nome 
AND d.tipo = 'resgate'
AND r.origem = 'Resgate de Fauna';

-- FK para dim_desfecho (apreensão)
UPDATE public.registros r
SET desfecho_id = d.id
FROM public.dim_desfecho d
WHERE r.desfecho_apreensao = d.nome 
AND d.tipo = 'apreensao'
AND r.origem = 'Apreensão';

-- 6. Adicionar constraints de FK
-- ============================================

ALTER TABLE public.registros
ADD CONSTRAINT fk_registros_especie 
    FOREIGN KEY (especie_id) REFERENCES public.dim_especies(id),
ADD CONSTRAINT fk_registros_regiao 
    FOREIGN KEY (regiao_administrativa_id) REFERENCES public.dim_regiao_administrativa(id),
ADD CONSTRAINT fk_registros_origem 
    FOREIGN KEY (origem_id) REFERENCES public.dim_origem(id),
ADD CONSTRAINT fk_registros_destinacao 
    FOREIGN KEY (destinacao_id) REFERENCES public.dim_destinacao(id),
ADD CONSTRAINT fk_registros_estado_saude 
    FOREIGN KEY (estado_saude_id) REFERENCES public.dim_estado_saude(id),
ADD CONSTRAINT fk_registros_estagio_vida 
    FOREIGN KEY (estagio_vida_id) REFERENCES public.dim_estagio_vida(id),
ADD CONSTRAINT fk_registros_desfecho 
    FOREIGN KEY (desfecho_id) REFERENCES public.dim_desfecho(id);

-- 7. Remover campos redundantes da tabela fato
-- ============================================

ALTER TABLE public.registros
DROP COLUMN nome_cientifico,
DROP COLUMN nome_popular,
DROP COLUMN classe_taxonomica,
DROP COLUMN regiao_administrativa,
DROP COLUMN origem,
DROP COLUMN destinacao,
DROP COLUMN estado_saude,
DROP COLUMN estagio_vida,
DROP COLUMN desfecho_resgate,
DROP COLUMN desfecho_apreensao;

-- 8. Criar índices para otimizar joins no Power BI
-- ============================================

CREATE INDEX idx_registros_especie ON public.registros(especie_id);
CREATE INDEX idx_registros_regiao ON public.registros(regiao_administrativa_id);
CREATE INDEX idx_registros_origem ON public.registros(origem_id);
CREATE INDEX idx_registros_destinacao ON public.registros(destinacao_id);
CREATE INDEX idx_registros_estado_saude ON public.registros(estado_saude_id);
CREATE INDEX idx_registros_estagio_vida ON public.registros(estagio_vida_id);
CREATE INDEX idx_registros_desfecho ON public.registros(desfecho_id);
CREATE INDEX idx_registros_data ON public.registros(data);

-- 9. Habilitar RLS nas novas tabelas dimensão
-- ============================================

ALTER TABLE public.dim_regiao_administrativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_origem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_destinacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_estado_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_estagio_vida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_desfecho ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura pública
CREATE POLICY "Anyone can view dim_regiao_administrativa"
ON public.dim_regiao_administrativa FOR SELECT USING (true);

CREATE POLICY "Anyone can view dim_origem"
ON public.dim_origem FOR SELECT USING (true);

CREATE POLICY "Anyone can view dim_destinacao"
ON public.dim_destinacao FOR SELECT USING (true);

CREATE POLICY "Anyone can view dim_estado_saude"
ON public.dim_estado_saude FOR SELECT USING (true);

CREATE POLICY "Anyone can view dim_estagio_vida"
ON public.dim_estagio_vida FOR SELECT USING (true);

CREATE POLICY "Anyone can view dim_desfecho"
ON public.dim_desfecho FOR SELECT USING (true);

-- Políticas para autenticados gerenciarem dimensões
CREATE POLICY "Authenticated users can manage dim_regiao_administrativa"
ON public.dim_regiao_administrativa FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage dim_origem"
ON public.dim_origem FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage dim_destinacao"
ON public.dim_destinacao FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage dim_estado_saude"
ON public.dim_estado_saude FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage dim_estagio_vida"
ON public.dim_estagio_vida FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage dim_desfecho"
ON public.dim_desfecho FOR ALL USING (true) WITH CHECK (true);