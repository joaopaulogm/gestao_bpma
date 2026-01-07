-- Tabela para tipos penais (crimes comuns)
CREATE TABLE public.dim_tipo_penal (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dim_tipo_penal ENABLE ROW LEVEL SECURITY;

-- Policy for reading
CREATE POLICY "Tipos penais são visíveis para todos autenticados"
ON public.dim_tipo_penal FOR SELECT
USING (auth.role() = 'authenticated');

-- Tabela para desfechos de crimes comuns
CREATE TABLE public.dim_desfecho_crime_comum (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dim_desfecho_crime_comum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Desfechos de crimes comuns são visíveis para todos autenticados"
ON public.dim_desfecho_crime_comum FOR SELECT
USING (auth.role() = 'authenticated');

-- Tabela para tipos de atividades de prevenção
CREATE TABLE public.dim_tipo_atividade_prevencao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria text NOT NULL, -- 'Prevenção', 'Policiamento Comunitário', 'Teatro Lobo Guará', 'Guardiões Ambientais', 'Saber Cerrado'
    nome text NOT NULL,
    ordem integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(categoria, nome)
);

ALTER TABLE public.dim_tipo_atividade_prevencao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tipos de atividades de prevenção são visíveis para todos autenticados"
ON public.dim_tipo_atividade_prevencao FOR SELECT
USING (auth.role() = 'authenticated');

-- Tabela de fatos para crimes comuns
CREATE TABLE public.fat_crimes_comuns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    tipo_penal_id uuid REFERENCES public.dim_tipo_penal(id),
    regiao_administrativa_id uuid REFERENCES public.dim_regiao_administrativa(id),
    tipo_area_id uuid REFERENCES public.dim_tipo_de_area(id),
    latitude text NOT NULL,
    longitude text NOT NULL,
    desfecho_id uuid REFERENCES public.dim_desfecho_crime_comum(id),
    situacao_autor text, -- 'Detido' ou 'Liberado'
    qtd_detidos_maior integer DEFAULT 0,
    qtd_detidos_menor integer DEFAULT 0,
    qtd_liberados_maior integer DEFAULT 0,
    qtd_liberados_menor integer DEFAULT 0,
    observacoes text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fat_crimes_comuns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crimes comuns são visíveis para todos autenticados"
ON public.fat_crimes_comuns FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Crimes comuns podem ser inseridos por autenticados"
ON public.fat_crimes_comuns FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Crimes comuns podem ser atualizados por autenticados"
ON public.fat_crimes_comuns FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Crimes comuns podem ser excluídos por autenticados"
ON public.fat_crimes_comuns FOR DELETE
USING (auth.role() = 'authenticated');

-- Tabela de fatos para atividades de prevenção
CREATE TABLE public.fat_atividades_prevencao (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    tipo_atividade_id uuid REFERENCES public.dim_tipo_atividade_prevencao(id),
    regiao_administrativa_id uuid REFERENCES public.dim_regiao_administrativa(id),
    latitude text,
    longitude text,
    quantidade_publico integer DEFAULT 0,
    observacoes text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fat_atividades_prevencao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atividades de prevenção são visíveis para todos autenticados"
ON public.fat_atividades_prevencao FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Atividades de prevenção podem ser inseridas por autenticados"
ON public.fat_atividades_prevencao FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Atividades de prevenção podem ser atualizadas por autenticados"
ON public.fat_atividades_prevencao FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Atividades de prevenção podem ser excluídas por autenticados"
ON public.fat_atividades_prevencao FOR DELETE
USING (auth.role() = 'authenticated');

-- Inserir desfechos de crimes comuns
INSERT INTO public.dim_desfecho_crime_comum (nome) VALUES
    ('Averiguado e nada constatado'),
    ('Resolvido no local'),
    ('Em Apuração'),
    ('Flagrante TCO-PMDF'),
    ('Flagrante TCO-PCDF'),
    ('Flagrante APF-PCDF');

-- Inserir tipos de atividades de prevenção
INSERT INTO public.dim_tipo_atividade_prevencao (categoria, nome, ordem) VALUES
    -- Prevenção
    ('Prevenção', 'Prevenção em Zoológico', 1),
    ('Prevenção', 'Prevenção em Áreas Ambientais', 2),
    ('Prevenção', 'Prevenção a Incêndios Florestais', 3),
    ('Prevenção', 'Prevenção no Lago', 4),
    -- Policiamento Comunitário
    ('Policiamento Comunitário', 'PREALG', 1),
    -- Teatro Lobo Guará
    ('Teatro Lobo Guará', 'Apresentação Teatral', 1),
    ('Teatro Lobo Guará', 'Presença do Personagem em Eventos', 2),
    -- Guardiões Ambientais
    ('Guardiões Ambientais', 'Encontro 1: Apresentação', 1),
    ('Guardiões Ambientais', 'Encontro 2: Biodiversidade', 2),
    ('Guardiões Ambientais', 'Encontro 3: Cerrado', 3),
    ('Guardiões Ambientais', 'Encontro 4: Cadeia Alimentar', 4),
    ('Guardiões Ambientais', 'Encontro 5: Fauna', 5),
    ('Guardiões Ambientais', 'Encontro 6: Flora', 6),
    ('Guardiões Ambientais', 'Encontro 7: Água', 7),
    ('Guardiões Ambientais', 'Encontro 8: Lixo', 8),
    ('Guardiões Ambientais', 'Encontro 9: Prática / Redação', 9),
    ('Guardiões Ambientais', 'Encontro 10: Apresentação do Teatro', 10),
    ('Guardiões Ambientais', 'Formatura Guardiões Ambientais', 11),
    -- Saber Cerrado
    ('Saber Cerrado', 'Palestras', 1),
    ('Saber Cerrado', 'Exposições e Eventos', 2);