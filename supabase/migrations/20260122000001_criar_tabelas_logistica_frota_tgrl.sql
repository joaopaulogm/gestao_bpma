-- =====================================================
-- MIGRAÇÃO: Criar tabelas para Seção de Logística
-- Tabelas para gerenciar Frota (Veículos) e TGRL (Equipamentos)
-- =====================================================

-- 1. Criar tabela de Frota (Veículos - VTR)
CREATE TABLE IF NOT EXISTS public.dim_frota (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Identificação
  prefixo text NOT NULL UNIQUE,
  tombamento text,
  placa text,
  chassi text,
  
  -- Características do Veículo
  tipo text, -- CAMINHÃO, ÔNIBUS E VANS, TRATOR, EMBARCAÇÃO, etc.
  emprego text, -- OPERACIONAL, ADMINISTRATIVO
  marca text,
  modelo text,
  ano_fabricacao text,
  
  -- Localização e Status
  localizacao text, -- SEDE BPMA, LACUSTRE, etc.
  situacao text, -- Disponível, Indisponível, Baixada, Descarga, etc.
  motivo_baixa text,
  
  -- Quilometragem e Manutenção
  km_hm_atual numeric,
  km_proxima_troca_pneu numeric,
  km_hm_proxima_revisao numeric,
  data_ultima_troca_pneu date,
  modelo_pneu text,
  
  -- Equipamentos
  tombamento_kit_sinalizador text,
  tombamento_radio text,
  numero_serie_radio text,
  
  -- Responsabilidade
  responsavel text,
  
  -- Observações
  observacoes text
);

-- Comentários
COMMENT ON TABLE public.dim_frota IS 'Cadastro de veículos da frota BPMA';
COMMENT ON COLUMN public.dim_frota.prefixo IS 'Prefixo único do veículo (ex: 33548, 55411)';
COMMENT ON COLUMN public.dim_frota.tipo IS 'Tipo de veículo: CAMINHÃO, ÔNIBUS E VANS, TRATOR, EMBARCAÇÃO, etc.';
COMMENT ON COLUMN public.dim_frota.emprego IS 'Uso do veículo: OPERACIONAL ou ADMINISTRATIVO';
COMMENT ON COLUMN public.dim_frota.situacao IS 'Situação atual: Disponível, Indisponível, Baixada, Descarga, etc.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_frota_prefixo ON public.dim_frota(prefixo);
CREATE INDEX IF NOT EXISTS idx_frota_tombamento ON public.dim_frota(tombamento);
CREATE INDEX IF NOT EXISTS idx_frota_situacao ON public.dim_frota(situacao);
CREATE INDEX IF NOT EXISTS idx_frota_localizacao ON public.dim_frota(localizacao);
CREATE INDEX IF NOT EXISTS idx_frota_tipo ON public.dim_frota(tipo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dim_frota_updated_at BEFORE UPDATE ON public.dim_frota
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.dim_frota ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view dim_frota" ON public.dim_frota
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with secao_logistica role can insert dim_frota" ON public.dim_frota
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

CREATE POLICY "Users with secao_logistica role can update dim_frota" ON public.dim_frota
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

CREATE POLICY "Users with secao_logistica role can delete dim_frota" ON public.dim_frota
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

-- 2. Criar tabela de TGRL (Termo de Guarda, Responsabilidade e Localização)
CREATE TABLE IF NOT EXISTS public.dim_tgrl (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Identificação
  tombamento text NOT NULL UNIQUE,
  subitem text, -- Código do subitem (ex: 42, 10)
  
  -- Descrição do Bem
  especificacao_bem text NOT NULL,
  chassi_serie text,
  
  -- Valor e Estado
  valor numeric,
  estado_conservacao text, -- BOM, REGULAR, RUIM, etc.
  
  -- Localização e Situação
  localizacao text,
  situacao text, -- NÃO SE APLICA, etc.
  
  -- Observações
  observacoes text
);

-- Comentários
COMMENT ON TABLE public.dim_tgrl IS 'Termo de Guarda, Responsabilidade e Localização - Equipamentos e Materiais Permanentes';
COMMENT ON COLUMN public.dim_tgrl.tombamento IS 'Número de tombamento único do bem';
COMMENT ON COLUMN public.dim_tgrl.subitem IS 'Código do subitem conforme classificação de equipamentos';
COMMENT ON COLUMN public.dim_tgrl.especificacao_bem IS 'Descrição detalhada do equipamento/material';
COMMENT ON COLUMN public.dim_tgrl.estado_conservacao IS 'Estado de conservação: BOM, REGULAR, RUIM, etc.';

-- Índices
CREATE INDEX IF NOT EXISTS idx_tgrl_tombamento ON public.dim_tgrl(tombamento);
CREATE INDEX IF NOT EXISTS idx_tgrl_subitem ON public.dim_tgrl(subitem);
CREATE INDEX IF NOT EXISTS idx_tgrl_localizacao ON public.dim_tgrl(localizacao);
CREATE INDEX IF NOT EXISTS idx_tgrl_estado_conservacao ON public.dim_tgrl(estado_conservacao);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_dim_tgrl_updated_at BEFORE UPDATE ON public.dim_tgrl
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.dim_tgrl ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view dim_tgrl" ON public.dim_tgrl
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with secao_logistica role can insert dim_tgrl" ON public.dim_tgrl
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

CREATE POLICY "Users with secao_logistica role can update dim_tgrl" ON public.dim_tgrl
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

CREATE POLICY "Users with secao_logistica role can delete dim_tgrl" ON public.dim_tgrl
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );

-- 3. Criar tabela de histórico de atualizações da Frota (para rastreamento de mudanças)
CREATE TABLE IF NOT EXISTS public.fat_frota_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  frota_id uuid REFERENCES public.dim_frota(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  usuario_id uuid REFERENCES auth.users(id),
  
  -- Campos que podem ser atualizados
  km_hm_atual numeric,
  situacao text,
  motivo_baixa text,
  localizacao text,
  responsavel text,
  km_proxima_troca_pneu numeric,
  km_hm_proxima_revisao numeric,
  data_ultima_troca_pneu date,
  observacoes text,
  
  -- Metadados
  tipo_atualizacao text, -- 'km', 'situacao', 'localizacao', 'manutencao', etc.
  observacao_mudanca text
);

-- Comentários
COMMENT ON TABLE public.fat_frota_historico IS 'Histórico de atualizações dos veículos da frota';

-- Índices
CREATE INDEX IF NOT EXISTS idx_frota_historico_frota_id ON public.fat_frota_historico(frota_id);
CREATE INDEX IF NOT EXISTS idx_frota_historico_created_at ON public.fat_frota_historico(created_at);

-- Habilitar RLS
ALTER TABLE public.fat_frota_historico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_frota_historico" ON public.fat_frota_historico
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with secao_logistica role can insert fat_frota_historico" ON public.fat_frota_historico
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'secao_logistica'
    )
  );
