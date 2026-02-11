-- Permitir INSERT e UPDATE nas fat_controle_* para roles do Rádio Operador
CREATE POLICY "Allowed roles can insert fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

CREATE POLICY "Allowed roles can update fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

CREATE POLICY "Allowed roles can delete fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

CREATE POLICY "Allowed roles can insert fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

CREATE POLICY "Allowed roles can update fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

CREATE POLICY "Allowed roles can delete fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);
