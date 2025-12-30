-- Fix usuarios_permitidos: Ensure all access requires authentication
DROP POLICY IF EXISTS "Users can view their own data" ON public.usuarios_permitidos;

-- Recreate self-access policy with explicit authentication requirement
CREATE POLICY "Authenticated users can view their own data"
ON public.usuarios_permitidos
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    LOWER(auth.email()) = LOWER("Email 1") 
    OR LOWER(auth.email()) = LOWER("Email 2")
  )
);