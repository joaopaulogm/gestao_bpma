-- Create table to store team members for rescue records
CREATE TABLE public.fat_equipe_resgate (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_id uuid NOT NULL,
  efetivo_id uuid NOT NULL REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(registro_id, efetivo_id)
);

-- Create table to store team members for crime records
CREATE TABLE public.fat_equipe_crime (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_id uuid NOT NULL REFERENCES public.fat_registros_de_crime(id) ON DELETE CASCADE,
  efetivo_id uuid NOT NULL REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(registro_id, efetivo_id)
);

-- Enable RLS on both tables
ALTER TABLE public.fat_equipe_resgate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_equipe_crime ENABLE ROW LEVEL SECURITY;

-- RLS policies for fat_equipe_resgate
CREATE POLICY "Authenticated users can view fat_equipe_resgate"
ON public.fat_equipe_resgate
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_equipe_resgate"
ON public.fat_equipe_resgate
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_equipe_resgate"
ON public.fat_equipe_resgate
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_equipe_resgate"
ON public.fat_equipe_resgate
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- RLS policies for fat_equipe_crime
CREATE POLICY "Authenticated users can view fat_equipe_crime"
ON public.fat_equipe_crime
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_equipe_crime"
ON public.fat_equipe_crime
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_equipe_crime"
ON public.fat_equipe_crime
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_equipe_crime"
ON public.fat_equipe_crime
FOR DELETE
USING (auth.uid() IS NOT NULL);