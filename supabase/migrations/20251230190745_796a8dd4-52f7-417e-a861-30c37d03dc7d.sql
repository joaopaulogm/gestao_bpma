-- Fix function search_path for security (prevents search_path injection attacks)

-- fn_gerar_nome_cientifico_slug
CREATE OR REPLACE FUNCTION public.fn_gerar_nome_cientifico_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
begin
  if new.nome_cientifico is not null then
    new.nome_cientifico_slug :=
      regexp_replace(
        lower(
          unaccent(new.nome_cientifico)
        ),
        '[^a-z0-9]+',
        '-',
        'g'
      );
    new.nome_cientifico_slug :=
      trim(both '-' from new.nome_cientifico_slug);
  end if;
  return new;
end;
$function$;

-- sync_sheet_on_insert
CREATE OR REPLACE FUNCTION public.sync_sheet_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
begin
  perform net.http_post(
    url := 'https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/append-to-sheets',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$function$;