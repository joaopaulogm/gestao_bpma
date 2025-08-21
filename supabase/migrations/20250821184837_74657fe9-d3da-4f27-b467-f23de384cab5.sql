-- Critical Security Fixes: Enable RLS and create proper policies

-- 1. Enable RLS on all tables that need it
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especies_fauna ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly permissive policies on registros
DROP POLICY IF EXISTS "Enable insert for all users" ON public.registros;
DROP POLICY IF EXISTS "Enable select for all users" ON public.registros;

-- 3. Create proper RLS policies for registros (wildlife data - should be authenticated only)
CREATE POLICY "Authenticated users can view registros" 
ON public.registros 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert registros" 
ON public.registros 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update registros" 
ON public.registros 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete registros" 
ON public.registros 
FOR DELETE 
TO authenticated
USING (true);

-- 4. Create RLS policies for especies_fauna (reference data - can be public read)
CREATE POLICY "Anyone can view especies_fauna" 
ON public.especies_fauna 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage especies_fauna" 
ON public.especies_fauna 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_quantidade_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.quantidade_total := COALESCE(NEW.quantidade_adulto, 0) + COALESCE(NEW.quantidade_filhote, 0);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.format_date_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Store the date in standard format but display in DD/MM/YYYY
  NEW.data = NEW.data; -- This will preserve the date value
  RETURN NEW;
END;
$$;