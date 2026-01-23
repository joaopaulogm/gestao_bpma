-- Corrigir view restante com SECURITY DEFINER (vw_ferias_completo)
DROP VIEW IF EXISTS public.vw_ferias_completo CASCADE;

CREATE VIEW public.vw_ferias_completo
WITH (security_invoker = true)
AS
SELECT 
  f.id,
  f.efetivo_id,
  f.ano,
  f.mes_inicio,
  f.mes_fim,
  f.dias,
  f.tipo,
  f.observacao,
  f.created_at,
  f.updated_at,
  e.nome,
  e.nome_guerra,
  e.posto_graduacao,
  e.matricula,
  e.lotacao
FROM public.fat_ferias f
LEFT JOIN public.dim_efetivo e ON f.efetivo_id = e.id;

GRANT SELECT ON public.vw_ferias_completo TO authenticated;

-- Corrigir funções com search_path mutável
CREATE OR REPLACE FUNCTION public.fn_nome_cientifico_prefix(nome text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  select regexp_replace(lower(unaccent(coalesce(nome, ''))), '[^a-z0-9]+', '_', 'g');
$function$;

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  select trim(both '-' from regexp_replace(
    lower(unaccent(coalesce(input, ''))),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$function$;

CREATE OR REPLACE FUNCTION public.slugify_pt(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  select
    trim(both '-' from
      regexp_replace(
        lower(
          translate(coalesce(input,''),
            'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
            'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
          )
        ),
        '[^a-z0-9]+', '-', 'g'
      )
    );
$function$;

CREATE OR REPLACE FUNCTION public.make_slug(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  select regexp_replace(lower(unaccent(coalesce(txt,''))), '[^a-z0-9]+', '-', 'g')::text
$function$;

CREATE OR REPLACE FUNCTION public.norm_txt(t text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT lower(unaccent(trim(coalesce(t,''))));
$function$;

CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT 
    regexp_replace(
      regexp_replace(
        upper(
          trim(
            public.unaccent(coalesce(input_text, ''))
          )
        ),
        '[^A-Z0-9 ]', '', 'g'
      ),
      '\s+', ' ', 'g'
    );
$function$;

CREATE OR REPLACE FUNCTION public.jsonb_array_union_unique(a jsonb, b jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT coalesce(
    (
      SELECT jsonb_agg(to_jsonb(x) ORDER BY x)
      FROM (
        SELECT DISTINCT x
        FROM (
          SELECT jsonb_array_elements_text(coalesce(a, '[]'::jsonb)) AS x
          UNION ALL
          SELECT jsonb_array_elements_text(coalesce(b, '[]'::jsonb)) AS x
        ) s
        WHERE x IS NOT NULL AND btrim(x) <> ''
      ) d
    ),
    '[]'::jsonb
  );
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_normaliza_classe_taxonomica_fauna()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_norm text;
BEGIN
  IF NEW.classe_taxonomica IS NULL OR TRIM(NEW.classe_taxonomica) = '' THEN
    RETURN NEW;
  END IF;

  v_norm :=
    TRANSLATE(
      UPPER(TRIM(NEW.classe_taxonomica)),
      'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ',
      'AAAAEEEIIIOOOOUUUC'
    );

  NEW.classe_taxonomica := CASE
    WHEN v_norm IN ('AVE','AVES') THEN 'AVES'
    WHEN v_norm IN ('MAMIFERO','MAMIFEROS') THEN 'MAMÍFEROS'
    WHEN v_norm IN ('REPTIL','REPTEIS') THEN 'RÉPTEIS'
    WHEN v_norm IN ('PEIXE','PEIXES') THEN 'PEIXES'
    WHEN v_norm IN ('ANFIBIO','ANFIBIOS') THEN 'ANFÍBIOS'
    ELSE NEW.classe_taxonomica
  END;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_normaliza_classe_taxonomica_flora()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_norm text;
BEGIN
  IF NEW.classe_taxonomica IS NULL OR TRIM(NEW.classe_taxonomica) = '' THEN
    RETURN NEW;
  END IF;

  v_norm :=
    TRANSLATE(
      UPPER(TRIM(NEW.classe_taxonomica)),
      'ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ',
      'AAAAEEEIIIOOOOUUUC'
    );

  NEW.classe_taxonomica := CASE
    WHEN v_norm IN ('MAGNOLIOPSIDA','MAGNOLIOPSIDAS') THEN 'Magnoliopsida'
    WHEN v_norm IN ('LILIOPSIDA','LILIOPSIDAS') THEN 'Liliopsida'
    ELSE NEW.classe_taxonomica
  END;

  RETURN NEW;
END;
$function$;