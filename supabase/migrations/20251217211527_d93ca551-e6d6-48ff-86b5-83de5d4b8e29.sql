-- Create dimension table for teams
CREATE TABLE public.dim_equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  grupamento TEXT NOT NULL,
  escala TEXT,
  servico TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fact table for team members
CREATE TABLE public.fat_equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipe_id UUID NOT NULL REFERENCES public.dim_equipes(id) ON DELETE CASCADE,
  efetivo_id UUID NOT NULL REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  funcao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipe_id, efetivo_id)
);

-- Enable RLS
ALTER TABLE public.dim_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_equipe_membros ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dim_equipes
CREATE POLICY "Anyone can view dim_equipes" 
ON public.dim_equipes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage dim_equipes" 
ON public.dim_equipes 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for fat_equipe_membros
CREATE POLICY "Anyone can view fat_equipe_membros" 
ON public.fat_equipe_membros 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage fat_equipe_membros" 
ON public.fat_equipe_membros 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_dim_equipes_updated_at
BEFORE UPDATE ON public.dim_equipes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();