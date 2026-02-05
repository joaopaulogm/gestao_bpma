-- Recreate policy with correct role names
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