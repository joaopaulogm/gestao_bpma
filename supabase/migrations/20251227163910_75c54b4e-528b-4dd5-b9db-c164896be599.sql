-- Create table for Abono (leave allowance)
CREATE TABLE IF NOT EXISTS public.fat_abono (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  efetivo_id uuid REFERENCES public.dim_efetivo(id),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano integer NOT NULL DEFAULT 2026,
  observacao text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(efetivo_id, mes, ano)
);

-- Enable RLS
ALTER TABLE public.fat_abono ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view fat_abono" 
ON public.fat_abono FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage fat_abono" 
ON public.fat_abono FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE fat_abono;

-- Insert Abono 2026 data mapping by matricula
INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 1, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('235989','241334','728632','73909X','7315910','7315139','7319126','7325967','7361580','7368968','7383746','7389612','34278516')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 2, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('219487','222925','228915','73876X','739820','73943X','2149419','7316518','7329539','7360940','7381204','7396082','34279741','34284753')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 3, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('21759X','232475','730289','237388','7322631','7313993','7318553','731812X','7356410','7386486','34287507','34278729','34286756')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 4, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('236411','237132','231975','730629','740934','741566','1959573','1955306','731471X','732040X','7358555','7381735','34291271','34287655','34281861')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 5, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('23267X','240257','240613','738956','738549','2154250','7318960','7316771','7325770','7359233','7379536','7391994','34279091','34280464')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 6, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('213985','217999','221074','736538','731549X','7320582','7315090','7313217','7323980','735892X','7371209','7387385','7389728','7387369','34283544')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 7, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('237221','242624','229113','737402','1954695','1963074','1999176','215093X','7315902','7313012','7327013','7359969','7368844','34288481','32579527','34284788','19294654')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 8, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('230790','732397','7314051','7318561','1955411','1966774','2149621','7320604','7318545','7361173','7384637','34289437','34281991','34280227','34282653')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 9, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('727660','229180','242942','2153866','7322569','7317921','7318138','7316054','195976X','7314876','7320213','7321422','7355459','7392834','739621X','34284672','21071993','34280367')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 10, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('237485','221430','730858','729396','728039','7316844','7321317','7320191','7323859','2184583','7316100','7329350','7330677','734578X','7383371','7381956','7384033','7381565','7379544')
ON CONFLICT DO NOTHING;

INSERT INTO public.fat_abono (efetivo_id, mes, ano)
SELECT e.id, 11, 2026 FROM public.dim_efetivo e WHERE e.matricula IN ('239453','244082','244007','237442','728012','740365','2149397','2151189','2155990','1998560','1962477','7322143','7329393','7355297','7369964','7371977','7381905','7382677','7383738')
ON CONFLICT DO NOTHING;