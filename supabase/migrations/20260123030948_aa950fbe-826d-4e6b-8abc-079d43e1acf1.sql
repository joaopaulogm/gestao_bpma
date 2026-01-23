-- ============================================
-- TABELAS DIMENSÃO PARA SEÇÃO LOGÍSTICA
-- ============================================

-- 1. TABELA DIM_FROTA (Viaturas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dim_frota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prefixo TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'VIATURA',
    marca TEXT,
    modelo TEXT,
    ano INTEGER,
    placa TEXT,
    chassi TEXT,
    renavam TEXT,
    situacao TEXT NOT NULL DEFAULT 'Disponível',
    localizacao TEXT,
    observacoes TEXT,
    ultima_manutencao DATE,
    km_atual INTEGER DEFAULT 0,
    tipo_combustivel TEXT,
    capacidade_tanque NUMERIC(10,2),
    cor TEXT,
    numero_motor TEXT,
    data_aquisicao DATE,
    valor_aquisicao NUMERIC(15,2),
    seguro_vigencia DATE,
    ipva_ano INTEGER,
    licenciamento_ano INTEGER,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dim_frota_situacao ON public.dim_frota(situacao);
CREATE INDEX IF NOT EXISTS idx_dim_frota_tipo ON public.dim_frota(tipo);
CREATE INDEX IF NOT EXISTS idx_dim_frota_localizacao ON public.dim_frota(localizacao);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_dim_frota_updated_at ON public.dim_frota;
CREATE TRIGGER set_dim_frota_updated_at
    BEFORE UPDATE ON public.dim_frota
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Habilitar RLS
ALTER TABLE public.dim_frota ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Authenticated users can view frota" ON public.dim_frota;
CREATE POLICY "Authenticated users can view frota"
    ON public.dim_frota FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin and logistica can insert frota" ON public.dim_frota;
CREATE POLICY "Admin and logistica can insert frota"
    ON public.dim_frota FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

DROP POLICY IF EXISTS "Admin and logistica can update frota" ON public.dim_frota;
CREATE POLICY "Admin and logistica can update frota"
    ON public.dim_frota FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

DROP POLICY IF EXISTS "Admin and logistica can delete frota" ON public.dim_frota;
CREATE POLICY "Admin and logistica can delete frota"
    ON public.dim_frota FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

-- 2. TABELA DIM_FROTA_HISTORICO (Histórico de alterações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dim_frota_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frota_id UUID REFERENCES public.dim_frota(id) ON DELETE CASCADE,
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dim_frota_historico_frota ON public.dim_frota_historico(frota_id);

ALTER TABLE public.dim_frota_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view frota historico" ON public.dim_frota_historico;
CREATE POLICY "Authenticated users can view frota historico"
    ON public.dim_frota_historico FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin and logistica can insert frota historico" ON public.dim_frota_historico;
CREATE POLICY "Admin and logistica can insert frota historico"
    ON public.dim_frota_historico FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

-- 3. TABELA DIM_TGRL (Equipamentos/Materiais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.dim_tgrl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tombamento TEXT UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'EQUIPAMENTO',
    categoria TEXT,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    estado_conservacao TEXT NOT NULL DEFAULT 'BOM',
    localizacao TEXT,
    responsavel TEXT,
    data_aquisicao DATE,
    valor_aquisicao NUMERIC(15,2),
    valor_atual NUMERIC(15,2),
    nota_fiscal TEXT,
    fornecedor TEXT,
    garantia_ate DATE,
    observacoes TEXT,
    foto_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dim_tgrl_estado ON public.dim_tgrl(estado_conservacao);
CREATE INDEX IF NOT EXISTS idx_dim_tgrl_tipo ON public.dim_tgrl(tipo);
CREATE INDEX IF NOT EXISTS idx_dim_tgrl_localizacao ON public.dim_tgrl(localizacao);
CREATE INDEX IF NOT EXISTS idx_dim_tgrl_ativo ON public.dim_tgrl(ativo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_dim_tgrl_updated_at ON public.dim_tgrl;
CREATE TRIGGER set_dim_tgrl_updated_at
    BEFORE UPDATE ON public.dim_tgrl
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Habilitar RLS
ALTER TABLE public.dim_tgrl ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Authenticated users can view tgrl" ON public.dim_tgrl;
CREATE POLICY "Authenticated users can view tgrl"
    ON public.dim_tgrl FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin and logistica can insert tgrl" ON public.dim_tgrl;
CREATE POLICY "Admin and logistica can insert tgrl"
    ON public.dim_tgrl FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

DROP POLICY IF EXISTS "Admin and logistica can update tgrl" ON public.dim_tgrl;
CREATE POLICY "Admin and logistica can update tgrl"
    ON public.dim_tgrl FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

DROP POLICY IF EXISTS "Admin and logistica can delete tgrl" ON public.dim_tgrl;
CREATE POLICY "Admin and logistica can delete tgrl"
    ON public.dim_tgrl FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'secao_logistica')
        )
    );

-- 4. INSERIR DADOS DE EXEMPLO
-- ============================================

-- Viaturas exemplo
INSERT INTO public.dim_frota (prefixo, tipo, marca, modelo, ano, placa, situacao, localizacao, tipo_combustivel) VALUES
('BPMA-001', 'VIATURA', 'TOYOTA', 'HILUX', 2023, 'ABC-1234', 'Disponível', 'SEDE BPMA', 'DIESEL'),
('BPMA-002', 'VIATURA', 'FORD', 'RANGER', 2022, 'DEF-5678', 'Disponível', 'SEDE BPMA', 'DIESEL'),
('BPMA-003', 'MOTO', 'HONDA', 'XRE 300', 2023, 'GHI-9012', 'Disponível', 'SEDE BPMA', 'GASOLINA'),
('BPMA-004', 'VIATURA', 'CHEVROLET', 'S10', 2021, 'JKL-3456', 'Indisponível', 'MANUTENÇÃO', 'DIESEL'),
('BPMA-005', 'QUADRICICLO', 'POLARIS', 'SPORTSMAN', 2022, 'MNO-7890', 'Disponível', 'DESTACAMENTO NORTE', 'GASOLINA')
ON CONFLICT (prefixo) DO NOTHING;

-- Equipamentos exemplo
INSERT INTO public.dim_tgrl (tombamento, descricao, tipo, categoria, marca, modelo, estado_conservacao, localizacao) VALUES
('TGRL-0001', 'BINÓCULO PROFISSIONAL 10X50', 'EQUIPAMENTO', 'OBSERVAÇÃO', 'NIKON', 'PROSTAFF', 'BOM', 'ALMOXARIFADO'),
('TGRL-0002', 'GPS PORTÁTIL', 'EQUIPAMENTO', 'NAVEGAÇÃO', 'GARMIN', 'ETREX 30X', 'BOM', 'SEDE BPMA'),
('TGRL-0003', 'DRONE INSPEÇÃO', 'EQUIPAMENTO', 'AERONAVE', 'DJI', 'MAVIC 3', 'BOM', 'SEDE BPMA'),
('TGRL-0004', 'RÁDIO COMUNICADOR', 'EQUIPAMENTO', 'COMUNICAÇÃO', 'MOTOROLA', 'DEP450', 'REGULAR', 'VIATURA BPMA-001'),
('TGRL-0005', 'CAMERA ARMADILHA', 'EQUIPAMENTO', 'MONITORAMENTO', 'BUSHNELL', 'TROPHY CAM', 'BOM', 'CAMPO')
ON CONFLICT (tombamento) DO NOTHING;