
-- ============================================
-- CORREÇÃO COMPLETA DE SEGURANÇA
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TABELAS EXPOSTAS
-- ============================================

-- fat_ferias_parcelas: dados de férias com datas e nomes
ALTER TABLE public.fat_ferias_parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas para fat_ferias_parcelas (acesso via fat_ferias)
CREATE POLICY "HR and admins can manage vacation installments"
ON public.fat_ferias_parcelas
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

-- stg_ferias_2026_pracas: dados de staging de férias - RESTRITO
ALTER TABLE public.stg_ferias_2026_pracas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access staging vacation data"
ON public.stg_ferias_2026_pracas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- stg_dm_xlsx: dados médicos de staging - CRÍTICO
ALTER TABLE public.stg_dm_xlsx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access staging medical data"
ON public.stg_dm_xlsx
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 2. CORRIGIR POLÍTICA PERMISSIVA EM efetivo_roles
-- ============================================

-- Remover política permissiva que permite qualquer um ver roles
DROP POLICY IF EXISTS "Anyone can read efetivo_roles" ON public.efetivo_roles;

-- Criar função helper para verificar se o efetivo_id pertence ao usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_efetivo_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT up.id 
  FROM public.usuarios_por_login up 
  WHERE up.auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Criar política restritiva: apenas ver próprias roles ou ser admin
CREATE POLICY "Users can view own roles or admins view all"
ON public.efetivo_roles
FOR SELECT
TO authenticated
USING (
  efetivo_id = public.get_current_user_efetivo_id()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- 3. CORRIGIR FUNÇÕES COM search_path MUTÁVEL
-- ============================================

-- sync_imagens_fauna
CREATE OR REPLACE FUNCTION public.sync_imagens_fauna()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  update public.dim_especies_fauna f
  set imagens = coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'bucket', o.bucket_id,
               'path', o.name,
               'legenda', f.nome_cientifico,
               'mime', o.metadata->>'mimetype',
               'updated_at', o.updated_at
             )
             order by o.name
           )
    from storage.objects o
    where o.bucket_id = 'especies-fauna'
      and o.name like public.fn_nome_cientifico_prefix(f.nome_cientifico) || '\_%' escape '\'
  ), '[]'::jsonb);
end;
$function$;

-- sync_imagens_flora
CREATE OR REPLACE FUNCTION public.sync_imagens_flora()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  update public.dim_especies_flora f
  set imagens = coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'bucket', o.bucket_id,
               'path', o.name,
               'legenda', f.nome_cientifico,
               'mime', o.metadata->>'mimetype',
               'updated_at', o.updated_at
             )
             order by o.name
           )
    from storage.objects o
    where o.bucket_id = 'especies-flora'
      and o.name like public.fn_nome_cientifico_prefix(f.nome_cientifico) || '\_%' escape '\'
  ), '[]'::jsonb);
end;
$function$;

-- trg_sync_imagens_fauna_one
CREATE OR REPLACE FUNCTION public.trg_sync_imagens_fauna_one()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  update public.dim_especies_fauna f
  set imagens = coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'bucket', o.bucket_id,
               'path', o.name,
               'legenda', f.nome_cientifico,
               'mime', o.metadata->>'mimetype',
               'updated_at', o.updated_at
             )
             order by o.name
           )
    from storage.objects o
    where o.bucket_id = 'especies-fauna'
      and o.name like public.fn_nome_cientifico_prefix(f.nome_cientifico) || '\_%' escape '\'
  ), '[]'::jsonb)
  where f.id = new.id;
  return new;
end;
$function$;

-- trg_sync_imagens_flora_one
CREATE OR REPLACE FUNCTION public.trg_sync_imagens_flora_one()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  update public.dim_especies_flora f
  set imagens = coalesce((
    select jsonb_agg(
             jsonb_build_object(
               'bucket', o.bucket_id,
               'path', o.name,
               'legenda', f.nome_cientifico,
               'mime', o.metadata->>'mimetype',
               'updated_at', o.updated_at
             )
             order by o.name
           )
    from storage.objects o
    where o.bucket_id = 'especies-flora'
      and o.name like public.fn_nome_cientifico_prefix(f.nome_cientifico) || '\_%' escape '\'
  ), '[]'::jsonb)
  where f.id = new.id;
  return new;
end;
$function$;

-- exec_sql - CRÍTICO: deve ter search_path definido
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  EXECUTE sql_query;
END;
$function$;

-- upsert_ferias_com_parcelas
CREATE OR REPLACE FUNCTION public.upsert_ferias_com_parcelas(
  p_efetivo_id uuid, 
  p_ano integer, 
  p_tipo text, 
  p_observacao text DEFAULT NULL::text, 
  p_mes_inicio integer DEFAULT NULL::integer, 
  p_mes_fim integer DEFAULT NULL::integer, 
  p_dias integer DEFAULT NULL::integer, 
  p_parcelas jsonb DEFAULT '[]'::jsonb, 
  p_substituir_parcelas boolean DEFAULT true
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_fat_id uuid;
  v_nums int[];
BEGIN
  INSERT INTO public.fat_ferias (
    id, efetivo_id, ano, mes_inicio, mes_fim, dias, tipo, observacao, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), p_efetivo_id, p_ano, p_mes_inicio, p_mes_fim, p_dias, p_tipo, p_observacao, now(), now()
  )
  ON CONFLICT (efetivo_id, ano) DO UPDATE SET
    mes_inicio = COALESCE(EXCLUDED.mes_inicio, public.fat_ferias.mes_inicio),
    mes_fim    = COALESCE(EXCLUDED.mes_fim,    public.fat_ferias.mes_fim),
    dias       = COALESCE(EXCLUDED.dias,       public.fat_ferias.dias),
    tipo       = COALESCE(EXCLUDED.tipo,       public.fat_ferias.tipo),
    observacao = EXCLUDED.observacao,
    updated_at = now()
  RETURNING id INTO v_fat_id;

  SELECT COALESCE(array_agg((x->>'parcela_num')::int), ARRAY[]::int[])
  INTO v_nums
  FROM jsonb_array_elements(COALESCE(p_parcelas, '[]'::jsonb)) x
  WHERE x ? 'parcela_num';

  INSERT INTO public.fat_ferias_parcelas (
    fat_ferias_id, parcela_num, mes, dias, data_inicio, data_fim,
    lancado_livro, lancado_sgpol, lancado_campanha,
    updated_at
  )
  SELECT
    v_fat_id,
    (x->>'parcela_num')::int,
    NULLIF(x->>'mes',''),
    NULLIF(x->>'dias','')::int,
    NULLIF(x->>'data_inicio','')::date,
    NULLIF(x->>'data_fim','')::date,
    COALESCE((x->>'lancado_livro')::boolean, false),
    COALESCE((x->>'lancado_sgpol')::boolean, false),
    COALESCE((x->>'lancado_campanha')::boolean, false),
    now()
  FROM jsonb_array_elements(COALESCE(p_parcelas, '[]'::jsonb)) x
  WHERE x ? 'parcela_num'
  ON CONFLICT (fat_ferias_id, parcela_num) DO UPDATE SET
    mes = EXCLUDED.mes,
    dias = EXCLUDED.dias,
    data_inicio = EXCLUDED.data_inicio,
    data_fim = EXCLUDED.data_fim,
    lancado_livro = EXCLUDED.lancado_livro,
    lancado_sgpol = EXCLUDED.lancado_sgpol,
    lancado_campanha = EXCLUDED.lancado_campanha,
    updated_at = now();

  IF p_substituir_parcelas THEN
    IF array_length(v_nums, 1) IS NULL THEN
      DELETE FROM public.fat_ferias_parcelas
      WHERE fat_ferias_id = v_fat_id;
    ELSE
      DELETE FROM public.fat_ferias_parcelas
      WHERE fat_ferias_id = v_fat_id
        AND parcela_num <> ALL (v_nums);
    END IF;
  END IF;

  RETURN v_fat_id;
END;
$function$;

-- update_quantidade_total (trigger function)
CREATE OR REPLACE FUNCTION public.update_quantidade_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.quantidade_total := COALESCE(NEW.quantidade_adulto, 0) + COALESCE(NEW.quantidade_filhote, 0);
    RETURN NEW;
END;
$function$;

-- is_admin - já tem search_path, garantir consistência
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  );
$function$;

-- ============================================
-- 4. RECRIAR VIEWS COMO SECURITY INVOKER
-- ============================================

-- vw_ferias_completo (usada pelo sistema de férias)
DROP VIEW IF EXISTS public.vw_ferias_completo;

CREATE VIEW public.vw_ferias_completo 
WITH (security_invoker = true)
AS
SELECT f.id,
    f.efetivo_id,
    f.ano,
    f.mes_inicio,
    f.mes_fim,
    f.dias,
    f.tipo,
    f.observacao,
    f.created_at,
    f.updated_at,
    COALESCE(jsonb_agg(jsonb_build_object(
      'parcela_num', p.parcela_num, 
      'mes', p.mes, 
      'dias', p.dias, 
      'data_inicio', p.data_inicio, 
      'data_fim', p.data_fim, 
      'lancado_livro', p.lancado_livro, 
      'lancado_sgpol', p.lancado_sgpol, 
      'lancado_campanha', p.lancado_campanha, 
      'source_sheet', p.source_sheet, 
      'source_row_number', p.source_row_number, 
      'updated_at', p.updated_at
    ) ORDER BY p.parcela_num) FILTER (WHERE (p.fat_ferias_id IS NOT NULL)), '[]'::jsonb) AS parcelas
FROM public.fat_ferias f
LEFT JOIN public.fat_ferias_parcelas p ON p.fat_ferias_id = f.id
GROUP BY f.id;

-- Conceder permissões adequadas
GRANT SELECT ON public.vw_ferias_completo TO authenticated;
