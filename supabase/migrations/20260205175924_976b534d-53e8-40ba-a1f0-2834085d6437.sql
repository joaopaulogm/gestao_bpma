-- Remove all existing SELECT policies on radio_operador_data
DROP POLICY IF EXISTS "Authenticated users can read radio_operador_data" ON public.radio_operador_data;
DROP POLICY IF EXISTS "radio_operador_data_select" ON public.radio_operador_data;
DROP POLICY IF EXISTS "Allowed roles can read radio_operador_data" ON public.radio_operador_data;

-- Create single correct policy
CREATE POLICY "Allowed roles can read radio_operador_data" 
ON public.radio_operador_data 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);