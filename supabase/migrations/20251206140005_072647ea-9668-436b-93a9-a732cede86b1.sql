-- Atualizar política de dim_enquadramento para permitir leitura pública
DROP POLICY IF EXISTS "Authenticated users can view dim_enquadramento" ON public.dim_enquadramento;

CREATE POLICY "Anyone can view dim_enquadramento" 
ON public.dim_enquadramento 
FOR SELECT 
USING (true);