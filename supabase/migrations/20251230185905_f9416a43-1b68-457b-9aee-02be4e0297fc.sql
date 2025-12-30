-- Enable RLS on all tables that are missing it

-- 1. dim_especies_fauna - Species catalog, can be read by anyone but managed by authenticated users
ALTER TABLE public.dim_especies_fauna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_especies_fauna"
ON public.dim_especies_fauna
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage dim_especies_fauna"
ON public.dim_especies_fauna
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. dim_especies_flora - Species catalog, can be read by anyone but managed by authenticated users
ALTER TABLE public.dim_especies_flora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dim_especies_flora"
ON public.dim_especies_flora
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage dim_especies_flora"
ON public.dim_especies_flora
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. fila_imagens_especies - Internal image queue, restrict to authenticated users
ALTER TABLE public.fila_imagens_especies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fila_imagens_especies"
ON public.fila_imagens_especies
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fila_imagens_especies"
ON public.fila_imagens_especies
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. log_importacao_imagens - Internal logs, restrict to authenticated users
ALTER TABLE public.log_importacao_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view log_importacao_imagens"
ON public.log_importacao_imagens
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage log_importacao_imagens"
ON public.log_importacao_imagens
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);