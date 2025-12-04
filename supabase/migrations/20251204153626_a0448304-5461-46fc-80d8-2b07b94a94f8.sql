-- Remover políticas RLS existentes da tabela registros
DROP POLICY IF EXISTS "Authenticated users can view registros" ON public.registros;
DROP POLICY IF EXISTS "Authenticated users can insert registros" ON public.registros;
DROP POLICY IF EXISTS "Authenticated users can update registros" ON public.registros;
DROP POLICY IF EXISTS "Authenticated users can delete registros" ON public.registros;

-- Criar novas políticas RLS que verificam autenticação corretamente
-- Política de SELECT - apenas usuários autenticados
CREATE POLICY "Authenticated users can view registros"
ON public.registros
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Política de INSERT - apenas usuários autenticados
CREATE POLICY "Authenticated users can insert registros"
ON public.registros
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Política de UPDATE - apenas usuários autenticados
CREATE POLICY "Authenticated users can update registros"
ON public.registros
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Política de DELETE - apenas usuários autenticados
CREATE POLICY "Authenticated users can delete registros"
ON public.registros
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Também corrigir a tabela dim_enquadramento que não tem políticas
CREATE POLICY "Authenticated users can view dim_enquadramento"
ON public.dim_enquadramento
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage dim_enquadramento"
ON public.dim_enquadramento
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);