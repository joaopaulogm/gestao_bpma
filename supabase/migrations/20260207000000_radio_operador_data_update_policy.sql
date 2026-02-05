-- Permitir UPDATE em radio_operador_data para os mesmos roles que podem fazer SELECT (edição na página Rádio Operador)
CREATE POLICY "Allowed roles can update radio_operador_data"
ON public.radio_operador_data
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

GRANT UPDATE ON public.radio_operador_data TO authenticated;
