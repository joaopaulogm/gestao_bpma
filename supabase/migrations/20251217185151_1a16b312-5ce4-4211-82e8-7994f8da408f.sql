-- Add photo validation columns to dim_especies_fauna
ALTER TABLE public.dim_especies_fauna 
ADD COLUMN IF NOT EXISTS foto_principal_path text,
ADD COLUMN IF NOT EXISTS fotos_paths jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS foto_status text DEFAULT 'pendente' CHECK (foto_status IN ('validada', 'pendente', 'rejeitada')),
ADD COLUMN IF NOT EXISTS foto_fonte_validacao text,
ADD COLUMN IF NOT EXISTS foto_validada_em timestamp with time zone;

-- Add photo validation columns to dim_especies_flora
ALTER TABLE public.dim_especies_flora 
ADD COLUMN IF NOT EXISTS foto_principal_path text,
ADD COLUMN IF NOT EXISTS fotos_paths jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS foto_status text DEFAULT 'pendente' CHECK (foto_status IN ('validada', 'pendente', 'rejeitada')),
ADD COLUMN IF NOT EXISTS foto_fonte_validacao text,
ADD COLUMN IF NOT EXISTS foto_validada_em timestamp with time zone;

-- Add FK columns to fauna table
ALTER TABLE public.fauna 
ADD COLUMN IF NOT EXISTS id_dim_especie_fauna uuid REFERENCES public.dim_especies_fauna(id);

-- Add FK columns to flora table
ALTER TABLE public.flora 
ADD COLUMN IF NOT EXISTS id_dim_especie_flora uuid REFERENCES public.dim_especies_flora(id);

-- Create sync_logs table for tracking synchronization
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  tipo text NOT NULL CHECK (tipo IN ('fauna', 'flora')),
  especie_nome text NOT NULL,
  especie_id uuid,
  acao text NOT NULL,
  fotos_encontradas integer DEFAULT 0,
  status_final text,
  erro text,
  detalhes jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies for sync_logs - only admins can insert, authenticated can view
CREATE POLICY "Admins can manage sync_logs" ON public.sync_logs
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view sync_logs" ON public.sync_logs
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fauna_dim_especie ON public.fauna(id_dim_especie_fauna);
CREATE INDEX IF NOT EXISTS idx_flora_dim_especie ON public.flora(id_dim_especie_flora);
CREATE INDEX IF NOT EXISTS idx_sync_logs_tipo ON public.sync_logs(tipo);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- Function to sync fauna from dimension updates
CREATE OR REPLACE FUNCTION public.sync_fauna_from_dimension()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update fauna records that reference this dimension
  UPDATE public.fauna
  SET 
    nome_popular = NEW.nome_popular,
    nome_cientifico = NEW.nome_cientifico,
    nome_popular_slug = public.slugify_pt(NEW.nome_popular),
    classe_taxonomica = NEW.classe_taxonomica,
    ordem_taxonomica = NEW.ordem_taxonomica,
    tipo_fauna = NEW.tipo_de_fauna,
    estado_conservacao = NEW.estado_de_conservacao,
    updated_at = now()
  WHERE id_dim_especie_fauna = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Function to sync flora from dimension updates
CREATE OR REPLACE FUNCTION public.sync_flora_from_dimension()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update flora records that reference this dimension
  UPDATE public.flora
  SET 
    nome_popular = NEW."Nome Popular",
    nome_cientifico = NEW."Nome Científico",
    nome_popular_slug = public.slugify_pt(COALESCE(NEW."Nome Popular", '')),
    classe = NEW."Classe",
    ordem = NEW."Ordem",
    familia = NEW."Família",
    estado_conservacao = NEW."Estado de Conservação",
    tipo_planta = NEW."Tipo de Planta",
    madeira_lei = (NEW."Madeira de Lei" = 'Sim'),
    imune_ao_corte = (NEW."Imune ao Corte" = 'Sim'),
    updated_at = now()
  WHERE id_dim_especie_flora = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create triggers for bidirectional sync
DROP TRIGGER IF EXISTS trigger_sync_fauna_from_dimension ON public.dim_especies_fauna;
CREATE TRIGGER trigger_sync_fauna_from_dimension
AFTER UPDATE ON public.dim_especies_fauna
FOR EACH ROW
EXECUTE FUNCTION public.sync_fauna_from_dimension();

DROP TRIGGER IF EXISTS trigger_sync_flora_from_dimension ON public.dim_especies_flora;
CREATE TRIGGER trigger_sync_flora_from_dimension
AFTER UPDATE ON public.dim_especies_flora
FOR EACH ROW
EXECUTE FUNCTION public.sync_flora_from_dimension();