-- Add RLS policies to tables that have RLS enabled but no policies

-- fat_resgates_diarios_2020a2024 - Historical rescue data (read-only for authenticated users)
CREATE POLICY "Authenticated users can view fat_resgates_diarios_2020a2024"
ON public.fat_resgates_diarios_2020a2024
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- usuarios_por_login - User login data (admin only for security)
ALTER TABLE public.usuarios_por_login ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage usuarios_por_login"
ON public.usuarios_por_login
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));