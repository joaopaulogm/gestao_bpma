-- Create RLS policy to allow authenticated users to read radio_operador_data
CREATE POLICY "Authenticated users can read radio_operador_data"
ON public.radio_operador_data
FOR SELECT
TO authenticated
USING (true);