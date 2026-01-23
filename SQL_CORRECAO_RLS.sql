DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Anyone can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Anyone can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;

ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR DELETE
TO authenticated
USING (true);
