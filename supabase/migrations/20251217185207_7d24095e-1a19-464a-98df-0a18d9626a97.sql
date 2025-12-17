-- Enable RLS on fauna table
ALTER TABLE public.fauna ENABLE ROW LEVEL SECURITY;

-- Policies for fauna
CREATE POLICY "Anyone can view fauna" ON public.fauna
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fauna" ON public.fauna
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on flora table
ALTER TABLE public.flora ENABLE ROW LEVEL SECURITY;

-- Policies for flora
CREATE POLICY "Anyone can view flora" ON public.flora
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage flora" ON public.flora
FOR ALL USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);