-- Função para importar dados de uma aba (cabeçalho + linhas a partir da linha 2) em radio_operador_data.
-- Usada pelo script scripts/seed_radio_operador_from_xlsx.ts que lê o xlsx/CSV e chama esta função.

CREATE OR REPLACE FUNCTION public.radio_operador_import_sheet(
  p_sheet_name text,
  p_headers text[],
  p_rows jsonb[]
)
RETURNS TABLE(inserted_header boolean, inserted_rows bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i int;
  r jsonb;
BEGIN
  -- Remove dados existentes desta aba para substituir
  DELETE FROM public.radio_operador_data
  WHERE sheet_name = p_sheet_name;

  -- Linha 1: cabeçalho (igual ao sync da planilha)
  INSERT INTO public.radio_operador_data (sheet_name, row_index, data)
  VALUES (p_sheet_name, 1, jsonb_build_object('_headers', to_jsonb(p_headers)));

  -- Linhas 2 em diante: dados
  i := 2;
  FOREACH r IN ARRAY p_rows
  LOOP
    INSERT INTO public.radio_operador_data (sheet_name, row_index, data)
    VALUES (p_sheet_name, i, r);
    i := i + 1;
  END LOOP;

  RETURN QUERY SELECT true, COALESCE(array_length(p_rows, 1), 0)::bigint;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

COMMENT ON FUNCTION public.radio_operador_import_sheet(text, text[], jsonb[]) IS
  'Importa uma aba para radio_operador_data: p_headers = nomes das colunas (linha 1), p_rows = array de jsonb (linhas a partir da linha 2). Substitui todos os registros da aba.';

GRANT EXECUTE ON FUNCTION public.radio_operador_import_sheet(text, text[], jsonb[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.radio_operador_import_sheet(text, text[], jsonb[]) TO authenticated;
