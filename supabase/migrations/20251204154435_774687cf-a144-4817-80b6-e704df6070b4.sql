-- Adicionar políticas RLS para dim_especies_flora (tabela sem RLS)
ALTER TABLE public.dim_especies_flora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_especies_flora"
ON public.dim_especies_flora
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage dim_especies_flora"
ON public.dim_especies_flora
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Adicionar políticas RLS para dim_itens_apreensao (tabela sem RLS)
ALTER TABLE public.dim_itens_apreensao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_itens_apreensao"
ON public.dim_itens_apreensao
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage dim_itens_apreensao"
ON public.dim_itens_apreensao
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Adicionar políticas RLS para dim_tipo_de_area (tabela sem RLS)
ALTER TABLE public.dim_tipo_de_area ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_tipo_de_area"
ON public.dim_tipo_de_area
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage dim_tipo_de_area"
ON public.dim_tipo_de_area
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Adicionar políticas RLS para dim_tipo_de_crime (tabela sem RLS)
ALTER TABLE public.dim_tipo_de_crime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_tipo_de_crime"
ON public.dim_tipo_de_crime
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can manage dim_tipo_de_crime"
ON public.dim_tipo_de_crime
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);