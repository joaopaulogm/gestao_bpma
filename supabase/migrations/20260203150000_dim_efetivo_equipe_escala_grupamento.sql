-- =============================================================
-- Link dim_efetivo (equipe, escala, grupamento) com dim_equipes
-- e dim_equipes_campanha via fat_equipe_membros e fat_campanha_membros.
-- Preenchimento automático a partir de:
--   dim_equipes + fat_equipe_membros -> equipe, escala, grupamento
--   dim_equipes_campanha + fat_campanha_membros -> equipe (quando vazio)
-- Regras:
--   - Ignorar COMISSÕES e INSTRUÇÕES E CURSO (e sua escala e equipe respectiva).
--     Esses policiais compõem outros grupamentos; esses outros grupamentos é que são válidos.
--   - Uma linha por matrícula em dim_efetivo (dedup na migration 20260203160000).
-- (Colunas equipe, escala, grupamento já existem em dim_efetivo.)
-- =============================================================

-- Grupamentos ignorados: COMISSÕES, INSTRUÇÕES E CURSO (não preencher nem manter equipe/escala/grupamento a partir deles).

-- 1) Preencher dim_efetivo a partir de dim_equipes + fat_equipe_membros
--    Apenas grupamentos válidos (não COMISSÕES nem INSTRUÇÕES E CURSO). Uma fonte por efetivo (DISTINCT ON).
UPDATE public.dim_efetivo de
SET
  equipe = src.equipe_nome,
  escala = src.escala,
  grupamento = src.grupamento
FROM (
  SELECT DISTINCT ON (fem.efetivo_id)
    fem.efetivo_id,
    eq.nome AS equipe_nome,
    eq.escala,
    eq.grupamento
  FROM public.fat_equipe_membros fem
  JOIN public.dim_equipes eq ON eq.id = fem.equipe_id
  WHERE (eq.grupamento IS NULL OR trim(upper(eq.grupamento)) NOT IN ('COMISSÕES', 'INSTRUÇÕES E CURSO'))
  ORDER BY fem.efetivo_id, eq.nome
) src
WHERE de.id = src.efetivo_id;

-- 1b) Zerar equipe/escala/grupamento quando o efetivo só tem participação em COMISSÕES ou INSTRUÇÕES E CURSO
--     (esses policiais compõem outros grupamentos; até ter vínculo em um válido, fica vazio)
UPDATE public.dim_efetivo de
SET equipe = NULL, escala = NULL, grupamento = NULL
WHERE de.id IN (
  SELECT fem.efetivo_id
  FROM public.fat_equipe_membros fem
  JOIN public.dim_equipes eq ON eq.id = fem.equipe_id
  GROUP BY fem.efetivo_id
  HAVING bool_and(trim(upper(COALESCE(eq.grupamento, ''))) IN ('COMISSÕES', 'INSTRUÇÕES E CURSO'))
);

-- 2) Se equipe ainda estiver vazio, preencher com nome da equipe de campanha (dim_equipes_campanha + fat_campanha_membros)
UPDATE public.dim_efetivo de
SET equipe = COALESCE(de.equipe, dec.nome)
FROM public.fat_campanha_membros fcm
JOIN public.dim_equipes_campanha dec ON dec.id = fcm.equipe_id
WHERE fcm.efetivo_id = de.id
  AND (de.equipe IS NULL OR trim(de.equipe) = '');

-- 3) Trigger: ao inserir/atualizar fat_equipe_membros, atualizar dim_efetivo (equipe, escala, grupamento)
--    Apenas quando a equipe NÃO for dos grupamentos COMISSÕES ou INSTRUÇÕES E CURSO.
CREATE OR REPLACE FUNCTION public.sync_dim_efetivo_from_equipe_membros()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grupamento text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Recalcular a partir das demais participações (excluindo COMISSÕES e INSTRUÇÕES E CURSO)
    UPDATE public.dim_efetivo de
    SET
      equipe = src.equipe_nome,
      escala = src.escala,
      grupamento = src.grupamento
    FROM (
      SELECT eq.nome AS equipe_nome, eq.escala, eq.grupamento
      FROM public.fat_equipe_membros f
      JOIN public.dim_equipes eq ON eq.id = f.equipe_id
      WHERE f.efetivo_id = OLD.efetivo_id
        AND (eq.grupamento IS NULL OR trim(upper(eq.grupamento)) NOT IN ('COMISSÕES', 'INSTRUÇÕES E CURSO'))
      LIMIT 1
    ) src
    WHERE de.id = OLD.efetivo_id;
    -- Se não sobrou nenhuma participação considerada, limpar equipe/escala/grupamento
    IF NOT FOUND THEN
      UPDATE public.dim_efetivo
      SET equipe = NULL, escala = NULL, grupamento = NULL
      WHERE id = OLD.efetivo_id;
    END IF;
    RETURN OLD;
  END IF;

  SELECT eq.grupamento INTO v_grupamento
  FROM public.dim_equipes eq
  WHERE eq.id = NEW.equipe_id;

  -- Só atualizar se a equipe não for COMISSÕES nem INSTRUÇÕES E CURSO
  IF v_grupamento IS NULL OR trim(upper(v_grupamento)) NOT IN ('COMISSÕES', 'INSTRUÇÕES E CURSO') THEN
    UPDATE public.dim_efetivo de
    SET
      equipe = eq.nome,
      escala = eq.escala,
      grupamento = eq.grupamento
    FROM public.dim_equipes eq
    WHERE de.id = NEW.efetivo_id
      AND eq.id = NEW.equipe_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_dim_efetivo_from_equipe_membros ON public.fat_equipe_membros;
CREATE TRIGGER trg_sync_dim_efetivo_from_equipe_membros
  AFTER INSERT OR UPDATE OF equipe_id, efetivo_id OR DELETE
  ON public.fat_equipe_membros
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_dim_efetivo_from_equipe_membros();

-- 4) Trigger: ao inserir/atualizar fat_campanha_membros, preencher equipe em dim_efetivo se estiver vazio
CREATE OR REPLACE FUNCTION public.sync_dim_efetivo_equipe_from_campanha_membros()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  UPDATE public.dim_efetivo de
  SET equipe = COALESCE(de.equipe, dec.nome)
  FROM public.dim_equipes_campanha dec
  WHERE de.id = NEW.efetivo_id
    AND dec.id = NEW.equipe_id
    AND (de.equipe IS NULL OR trim(de.equipe) = '');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_dim_efetivo_equipe_from_campanha ON public.fat_campanha_membros;
CREATE TRIGGER trg_sync_dim_efetivo_equipe_from_campanha
  AFTER INSERT OR UPDATE OF equipe_id, efetivo_id
  ON public.fat_campanha_membros
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_dim_efetivo_equipe_from_campanha_membros();

COMMENT ON COLUMN public.dim_efetivo.equipe IS 'Nome da equipe (origem: dim_equipes.nome ou dim_equipes_campanha.nome via fat_equipe_membros / fat_campanha_membros); COMISSÕES e INSTRUÇÕES E CURSO ignorados.';
COMMENT ON COLUMN public.dim_efetivo.escala IS 'Escala (origem: dim_equipes.escala via fat_equipe_membros); COMISSÕES e INSTRUÇÕES E CURSO ignorados.';
COMMENT ON COLUMN public.dim_efetivo.grupamento IS 'Grupamento (origem: dim_equipes.grupamento via fat_equipe_membros); COMISSÕES e INSTRUÇÕES E CURSO não são preenchidos.';
