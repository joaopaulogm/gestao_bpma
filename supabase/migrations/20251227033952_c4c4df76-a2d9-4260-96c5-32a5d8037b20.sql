-- Tabela para Férias
CREATE TABLE public.fat_ferias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  efetivo_id UUID REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL DEFAULT 2025,
  mes_inicio INTEGER NOT NULL,
  mes_fim INTEGER,
  dias INTEGER DEFAULT 30,
  tipo TEXT DEFAULT 'INTEGRAL',
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para Licenças Médicas
CREATE TABLE public.fat_licencas_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  efetivo_id UUID REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL DEFAULT 2025,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  dias INTEGER,
  tipo TEXT DEFAULT 'LICENÇA MÉDICA',
  cid TEXT,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para Restrições
CREATE TABLE public.fat_restricoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  efetivo_id UUID REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL DEFAULT 2025,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tipo_restricao TEXT NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fat_ferias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_licencas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_restricoes ENABLE ROW LEVEL SECURITY;

-- Políticas para Férias
CREATE POLICY "Anyone can view fat_ferias" ON public.fat_ferias
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_ferias" ON public.fat_ferias
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para Licenças Médicas
CREATE POLICY "Anyone can view fat_licencas_medicas" ON public.fat_licencas_medicas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_licencas_medicas" ON public.fat_licencas_medicas
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para Restrições
CREATE POLICY "Anyone can view fat_restricoes" ON public.fat_restricoes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_restricoes" ON public.fat_restricoes
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers para updated_at
CREATE TRIGGER update_fat_ferias_updated_at
  BEFORE UPDATE ON public.fat_ferias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_fat_licencas_medicas_updated_at
  BEFORE UPDATE ON public.fat_licencas_medicas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_fat_restricoes_updated_at
  BEFORE UPDATE ON public.fat_restricoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();