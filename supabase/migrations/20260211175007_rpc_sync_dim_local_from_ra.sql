-- RPC para sincronizar dim_regiao_administrativa -> dim_local (chamada ao carregar a página)
CREATE OR REPLACE FUNCTION public.sync_dim_local_from_ra()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dim_local (id, nome)
  SELECT gen_random_uuid(), ra.nome
  FROM public.dim_regiao_administrativa ra
  WHERE NOT EXISTS (SELECT 1 FROM public.dim_local dl WHERE dl.nome = ra.nome);
END;
$$;

-- Permitir chamada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.sync_dim_local_from_ra() TO authenticated;
