-- Create table for police officers (efetivo)
CREATE TABLE public.dim_efetivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  antiguidade INTEGER,
  posto_graduacao TEXT NOT NULL,
  quadro TEXT NOT NULL,
  quadro_sigla TEXT NOT NULL,
  nome_guerra TEXT NOT NULL,
  nome TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  sexo TEXT NOT NULL,
  lotacao TEXT NOT NULL DEFAULT 'BPMA',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dim_efetivo ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view dim_efetivo" 
ON public.dim_efetivo 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage dim_efetivo" 
ON public.dim_efetivo 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster searches
CREATE INDEX idx_efetivo_nome ON public.dim_efetivo(nome);
CREATE INDEX idx_efetivo_matricula ON public.dim_efetivo(matricula);