#!/usr/bin/env python3
"""Gera migration SQL que corrige dim_efetivo a partir do arquivo dim_efetivo_upsert.sql.
Lê o arquivo em Downloads e gera a migration em supabase/migrations/.
"""
import re
import sys
from pathlib import Path

# Caminho do arquivo de entrada (Downloads)
INPUT = Path(r"c:\Users\joao.maciel\Downloads\dim_efetivo_upsert.sql")
# Caminho da migration de saída
OUTPUT = Path(__file__).resolve().parent.parent / "supabase" / "migrations" / "20260203170000_dim_efetivo_corrigir_conforme_tabela_nova.sql"

def main():
    if not INPUT.exists():
        print(f"Arquivo não encontrado: {INPUT}")
        sys.exit(1)

    text = INPUT.read_text(encoding="utf-8", errors="replace")

    # Extrair blocos VALUES (linhas que começam com   ('... )
    values_lines = []
    in_values = False
    for line in text.splitlines():
        if ") VALUES" in line or (in_values and line.strip().startswith("(")):
            in_values = True
        if in_values and line.strip().startswith("("):
            values_lines.append(line.strip().rstrip(","))
        if in_values and "ON CONFLICT" in line:
            break

    if not values_lines:
        print("Nenhum VALUES encontrado.")
        sys.exit(1)

    values_block = ",\n  ".join(values_lines)

    migration = f"""-- =============================================================
-- Corrigir dim_efetivo conforme tabela nova (fonte da verdade).
-- Uma linha por matrícula; quem não está na tabela nova não faz mais parte do batalhão.
-- Fonte: dim_efetivo_upsert.sql (atualizar dim_efetivo.xlsx)
-- =============================================================

-- 1) Tabela temporária com os dados da tabela nova
CREATE TEMP TABLE _staging_dim_efetivo_nova (
  antiguidade text,
  posto_graduacao text,
  quadro text,
  quadro_sigla text,
  nome_guerra text,
  nome text,
  matricula text,
  sexo text,
  lotacao text,
  ativo boolean,
  cpf text,
  data_nascimento date,
  data_inclusao date,
  idade text,
  contato text,
  email text,
  telefone text,
  telefone_2 text,
  email_2 text,
  porte_arma text,
  logradouro text
);

INSERT INTO _staging_dim_efetivo_nova (
  antiguidade, posto_graduacao, quadro, quadro_sigla, nome_guerra, nome, matricula,
  sexo, lotacao, ativo, cpf, data_nascimento, data_inclusao, idade, contato,
  email, telefone, telefone_2, email_2, porte_arma, logradouro
) VALUES
  {values_block};

-- 2) Normalizar matrícula na staging para 8 dígitos (para comparação)
UPDATE _staging_dim_efetivo_nova
SET matricula = lpad(regexp_replace(trim(COALESCE(matricula, '')), '[^0-9]', '', 'g'), 8, '0')
WHERE trim(COALESCE(matricula, '')) <> '';

-- 3) Normalizar matrícula em dim_efetivo para 8 dígitos
UPDATE public.dim_efetivo
SET matricula = lpad(regexp_replace(trim(COALESCE(matricula, '')), '[^0-9]', '', 'g'), 8, '0')
WHERE trim(COALESCE(matricula, '')) <> '';

-- 4) Remover duplicatas em dim_efetivo (manter uma linha por matrícula; preferir a que tem user_roles)
DELETE FROM public.dim_efetivo de
WHERE de.id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY matricula
        ORDER BY (SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = dim_efetivo.id LIMIT 1) DESC NULLS LAST,
                 id
      ) AS rn
    FROM public.dim_efetivo
  ) t
  WHERE t.rn > 1
);

-- 5) Índice único em matrícula (para upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_dim_efetivo_matricula_unique
  ON public.dim_efetivo (matricula)
  WHERE trim(COALESCE(matricula, '')) <> '';

-- 6) Remover quem não está na tabela nova (não faz mais parte do batalhão)
DELETE FROM public.dim_efetivo
WHERE lpad(regexp_replace(trim(COALESCE(matricula, '')), '[^0-9]', '', 'g'), 8, '0')
      NOT IN (SELECT matricula FROM _staging_dim_efetivo_nova WHERE trim(COALESCE(matricula, '')) <> '');

-- 7) Upsert: inserir ou atualizar a partir da tabela nova
INSERT INTO public.dim_efetivo (
  antiguidade, posto_graduacao, quadro, quadro_sigla, nome_guerra, nome, matricula,
  sexo, lotacao, ativo, cpf, data_nascimento, data_inclusao, idade, contato,
  email, telefone, telefone_2, email_2, porte_arma, logradouro
)
SELECT
  s.antiguidade, s.posto_graduacao, s.quadro, s.quadro_sigla, s.nome_guerra, s.nome, s.matricula,
  s.sexo, s.lotacao, s.ativo, s.cpf::bigint, s.data_nascimento, s.data_inclusao::date, s.idade, s.contato,
  s.email, s.telefone, s.telefone_2, s.email_2, s.porte_arma, s.logradouro
FROM _staging_dim_efetivo_nova s
WHERE trim(COALESCE(s.matricula, '')) <> ''
ON CONFLICT (matricula) DO UPDATE SET
  antiguidade = EXCLUDED.antiguidade,
  posto_graduacao = EXCLUDED.posto_graduacao,
  quadro = EXCLUDED.quadro,
  quadro_sigla = EXCLUDED.quadro_sigla,
  nome_guerra = EXCLUDED.nome_guerra,
  nome = EXCLUDED.nome,
  sexo = EXCLUDED.sexo,
  lotacao = EXCLUDED.lotacao,
  ativo = EXCLUDED.ativo,
  cpf = EXCLUDED.cpf,
  data_nascimento = EXCLUDED.data_nascimento,
  data_inclusao = EXCLUDED.data_inclusao,
  idade = EXCLUDED.idade,
  contato = EXCLUDED.contato,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  telefone_2 = EXCLUDED.telefone_2,
  email_2 = EXCLUDED.email_2,
  porte_arma = EXCLUDED.porte_arma,
  logradouro = EXCLUDED.logradouro;
"""

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(migration, encoding="utf-8")
    print(f"Migration gerada: {OUTPUT} ({len(values_lines)} linhas)")

if __name__ == "__main__":
    main()
