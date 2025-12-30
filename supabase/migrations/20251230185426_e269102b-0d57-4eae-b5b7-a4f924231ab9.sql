-- Fix 1: usuarios_permitidos - Drop overly permissive policy and add proper RLS
-- The table already has RLS enabled but the policy is too permissive
DROP POLICY IF EXISTS "Enable read access for all users" ON public.usuarios_permitidos;

-- Create admin-only management policy
CREATE POLICY "Admins can manage usuarios_permitidos"
ON public.usuarios_permitidos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow users to view their own data based on their email
CREATE POLICY "Users can view their own data"
ON public.usuarios_permitidos
FOR SELECT
TO authenticated
USING (
  LOWER(auth.email()) = LOWER("Email 1") 
  OR LOWER(auth.email()) = LOWER("Email 2")
);

-- Fix 2: fat_licencas_medicas - Replace overly permissive policy
DROP POLICY IF EXISTS "Anyone can view fat_licencas_medicas" ON public.fat_licencas_medicas;

-- Create restricted HR admin access policy
CREATE POLICY "HR admins can view medical licenses"
ON public.fat_licencas_medicas
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR public.has_role(auth.uid(), 'secao_pessoas'::app_role)
);

-- Keep the existing management policy for authenticated users but make it admin/HR only
DROP POLICY IF EXISTS "Authenticated users can manage fat_licencas_medicas" ON public.fat_licencas_medicas;

CREATE POLICY "HR admins can manage medical licenses"
ON public.fat_licencas_medicas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR public.has_role(auth.uid(), 'secao_pessoas'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR public.has_role(auth.uid(), 'secao_pessoas'::app_role)
);