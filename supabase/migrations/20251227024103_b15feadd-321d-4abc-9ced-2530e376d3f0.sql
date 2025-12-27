-- Tabela para armazenar configurações de equipes por unidade
CREATE TABLE public.dim_equipes_campanha (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL, -- Alfa, Bravo, Charlie, Delta
    created_at timestamp with time zone DEFAULT now()
);

-- Inserir as 4 equipes
INSERT INTO public.dim_equipes_campanha (nome) VALUES 
    ('Alfa'), ('Bravo'), ('Charlie'), ('Delta');

-- Tabela para configurar qual equipe inicia em qual unidade/data
CREATE TABLE public.fat_campanha_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade text NOT NULL, -- Guarda, Armeiro, RP Ambiental, GOC, Lacustre, GTA
    equipe_inicial_id uuid REFERENCES public.dim_equipes_campanha(id),
    data_inicio date NOT NULL DEFAULT '2026-01-01',
    ano integer NOT NULL DEFAULT 2026,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(unidade, ano)
);

-- Tabela para trocas/alterações manuais de escala
CREATE TABLE public.fat_campanha_alteracoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    unidade text NOT NULL,
    equipe_original_id uuid REFERENCES public.dim_equipes_campanha(id),
    equipe_nova_id uuid REFERENCES public.dim_equipes_campanha(id) NOT NULL,
    motivo text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE(data, unidade)
);

-- Tabela para membros de equipes na campanha (associação policial <-> equipe)
CREATE TABLE public.fat_campanha_membros (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id uuid REFERENCES public.dim_equipes_campanha(id) NOT NULL,
    efetivo_id uuid REFERENCES public.dim_efetivo(id) NOT NULL,
    unidade text NOT NULL, -- Guarda, Armeiro, RP Ambiental, GOC, Lacustre, GTA
    ano integer NOT NULL DEFAULT 2026,
    funcao text, -- Comandante, Motorista, etc.
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(efetivo_id, unidade, ano)
);

-- Enable RLS
ALTER TABLE public.dim_equipes_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_alteracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_membros ENABLE ROW LEVEL SECURITY;

-- Policies para dim_equipes_campanha
CREATE POLICY "Anyone can view dim_equipes_campanha" 
ON public.dim_equipes_campanha FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage dim_equipes_campanha" 
ON public.dim_equipes_campanha FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policies para fat_campanha_config
CREATE POLICY "Anyone can view fat_campanha_config" 
ON public.fat_campanha_config FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_campanha_config" 
ON public.fat_campanha_config FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policies para fat_campanha_alteracoes
CREATE POLICY "Anyone can view fat_campanha_alteracoes" 
ON public.fat_campanha_alteracoes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_campanha_alteracoes" 
ON public.fat_campanha_alteracoes FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policies para fat_campanha_membros
CREATE POLICY "Anyone can view fat_campanha_membros" 
ON public.fat_campanha_membros FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_campanha_membros" 
ON public.fat_campanha_membros FOR ALL 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at_fat_campanha_config
    BEFORE UPDATE ON public.fat_campanha_config
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();