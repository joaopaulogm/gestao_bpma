-- ============================================
-- CONTROLE DE ORDENS DE SERVIÇO
-- ============================================

-- Tabela principal de Ordens de Serviço
CREATE TABLE public.fat_ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação
  numero_os TEXT NOT NULL UNIQUE, -- Ex: 2026.00707.0000012
  numero_evento TEXT, -- Ex: 190.31212.2026
  referencia_sei TEXT, -- Referência do SEI
  
  -- Data e Horário
  data_evento DATE NOT NULL,
  horario_inicio TIME,
  horario_termino TIME,
  
  -- Localização
  local_evento TEXT,
  regiao_administrativa_id UUID REFERENCES public.dim_regiao_administrativa(id),
  endereco TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- Tipo e Classificação
  tipo_servico TEXT, -- POLICIAMENTO ORDINÁRIO, OPERAÇÃO ESPECIAL, etc.
  uniforme_equipamento TEXT,
  missao_policiamento TEXT,
  situacao TEXT DEFAULT 'ATIVA', -- ATIVA, CONCLUÍDA, CANCELADA
  
  -- Prescrições por seção
  prescricoes_s1 TEXT,
  prescricoes_s2 TEXT,
  prescricoes_s3 TEXT,
  prescricoes_s4 TEXT,
  prescricoes_demais TEXT,
  
  -- Responsáveis
  comandante_id UUID REFERENCES public.dim_efetivo(id),
  chefe_operacoes_id UUID REFERENCES public.dim_efetivo(id),
  
  -- Metadados de importação
  drive_file_id TEXT,
  drive_file_name TEXT,
  drive_folder_path TEXT,
  extracted_data JSONB,
  confidence_score NUMERIC(4, 2),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  origem_registro TEXT DEFAULT 'manual'
);

-- Tabela de efetivo designado para cada OS
CREATE TABLE public.fat_os_efetivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.fat_ordens_servico(id) ON DELETE CASCADE,
  efetivo_id UUID NOT NULL REFERENCES public.dim_efetivo(id),
  funcao TEXT, -- COMANDANTE, MOTORISTA, PATRULHEIRO, etc.
  viatura TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(os_id, efetivo_id)
);

-- Tabela de controle de processamento de arquivos
CREATE TABLE public.os_processadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_file_id TEXT NOT NULL UNIQUE,
  drive_file_name TEXT NOT NULL,
  drive_folder_path TEXT,
  numero_os TEXT,
  extracted_data JSONB,
  confidence_score NUMERIC(4, 2),
  status TEXT DEFAULT 'processed', -- processed, error, skipped
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_fat_ordens_servico_data ON public.fat_ordens_servico(data_evento);
CREATE INDEX idx_fat_ordens_servico_numero ON public.fat_ordens_servico(numero_os);
CREATE INDEX idx_fat_ordens_servico_situacao ON public.fat_ordens_servico(situacao);
CREATE INDEX idx_fat_ordens_servico_tipo ON public.fat_ordens_servico(tipo_servico);
CREATE INDEX idx_fat_ordens_servico_drive ON public.fat_ordens_servico(drive_file_id);
CREATE INDEX idx_os_processadas_drive ON public.os_processadas(drive_file_id);
CREATE INDEX idx_os_processadas_numero ON public.os_processadas(numero_os);
CREATE INDEX idx_fat_os_efetivo_os ON public.fat_os_efetivo(os_id);
CREATE INDEX idx_fat_os_efetivo_efetivo ON public.fat_os_efetivo(efetivo_id);

-- Trigger para updated_at
CREATE TRIGGER update_fat_ordens_servico_updated_at
  BEFORE UPDATE ON public.fat_ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.fat_ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_os_efetivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_processadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver OS"
  ON public.fat_ordens_servico
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir OS"
  ON public.fat_ordens_servico
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar OS"
  ON public.fat_ordens_servico
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar OS"
  ON public.fat_ordens_servico
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Políticas para fat_os_efetivo
CREATE POLICY "Usuários autenticados podem ver efetivo de OS"
  ON public.fat_os_efetivo
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir efetivo de OS"
  ON public.fat_os_efetivo
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar efetivo de OS"
  ON public.fat_os_efetivo
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem deletar efetivo de OS"
  ON public.fat_os_efetivo
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Políticas para os_processadas
CREATE POLICY "Usuários autenticados podem ver OS processadas"
  ON public.os_processadas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir OS processadas"
  ON public.os_processadas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar OS processadas"
  ON public.os_processadas
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para service role (edge functions)
CREATE POLICY "Service role tem acesso total a OS"
  ON public.fat_ordens_servico
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role tem acesso total a efetivo de OS"
  ON public.fat_os_efetivo
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role tem acesso total a OS processadas"
  ON public.os_processadas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);