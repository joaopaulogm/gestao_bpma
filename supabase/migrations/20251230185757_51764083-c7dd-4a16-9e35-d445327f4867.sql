-- Fix dim_efetivo: Remove public read access and restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view dim_efetivo" ON public.dim_efetivo;

-- Create authenticated-only read policy
CREATE POLICY "Authenticated users can view dim_efetivo"
ON public.dim_efetivo
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);