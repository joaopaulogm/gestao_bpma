DROP POLICY IF EXISTS "Anyone can view dim_efetivo" ON public.dim_efetivo;
DROP POLICY IF EXISTS "Authenticated users can view dim_efetivo" ON public.dim_efetivo;
DROP POLICY IF EXISTS "Authenticated users can manage dim_efetivo" ON public.dim_efetivo;

CREATE POLICY "Operators can view basic efetivo data"
ON public.dim_efetivo
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas') OR
  public.has_role(auth.uid(), 'operador') OR
  public.has_role(auth.uid(), 'secao_operacional') OR
  public.has_role(auth.uid(), 'secao_logistica')
);

CREATE POLICY "Admins and HR can manage efetivo"
ON public.dim_efetivo
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

DROP POLICY IF EXISTS "Anyone can view fat_licencas_medicas" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "Authenticated users can view fat_licencas_medicas" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "Authenticated users can manage fat_licencas_medicas" ON public.fat_licencas_medicas;

CREATE POLICY "Only HR and admins can view medical records"
ON public.fat_licencas_medicas
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

CREATE POLICY "Only HR and admins can manage medical records"
ON public.fat_licencas_medicas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

DROP POLICY IF EXISTS "Anyone can view fat_ferias" ON public.fat_ferias;
DROP POLICY IF EXISTS "Authenticated users can manage fat_ferias" ON public.fat_ferias;

CREATE POLICY "Only HR and admins can view vacations"
ON public.fat_ferias
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

CREATE POLICY "Only HR and admins can manage vacations"
ON public.fat_ferias
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

DROP POLICY IF EXISTS "Anyone can view fat_restricoes" ON public.fat_restricoes;
DROP POLICY IF EXISTS "Authenticated users can manage fat_restricoes" ON public.fat_restricoes;

CREATE POLICY "Only HR and admins can view restrictions"
ON public.fat_restricoes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);

CREATE POLICY "Only HR and admins can manage restrictions"
ON public.fat_restricoes
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'secao_pessoas')
);
