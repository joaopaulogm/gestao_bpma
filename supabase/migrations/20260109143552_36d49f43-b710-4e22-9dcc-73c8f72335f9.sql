
-- Criar tabela de resumo mensal com os dados oficiais dos relatórios
CREATE TABLE IF NOT EXISTS fact_resumo_mensal_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  resgates INTEGER NOT NULL DEFAULT 0,
  solturas INTEGER NOT NULL DEFAULT 0,
  obitos INTEGER NOT NULL DEFAULT 0,
  feridos INTEGER NOT NULL DEFAULT 0,
  filhotes INTEGER NOT NULL DEFAULT 0,
  atropelamentos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ano, mes)
);

-- Habilitar RLS
ALTER TABLE fact_resumo_mensal_historico ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (dados de dashboard)
CREATE POLICY "Dados de resumo mensal são públicos para leitura"
  ON fact_resumo_mensal_historico FOR SELECT USING (true);

-- Inserir dados oficiais de 2020
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos) VALUES
(2020, 1, 282, 54, 1, 31, 9, 0),
(2020, 2, 263, 50, 1, 29, 8, 0),
(2020, 3, 253, 48, 1, 27, 8, 0),
(2020, 4, 208, 39, 1, 23, 6, 0),
(2020, 5, 295, 56, 1, 32, 9, 0),
(2020, 6, 226, 43, 1, 25, 7, 0),
(2020, 7, 276, 52, 1, 30, 8, 0),
(2020, 8, 246, 46, 1, 27, 7, 0),
(2020, 9, 306, 58, 1, 33, 9, 0),
(2020, 10, 403, 76, 1, 44, 12, 0),
(2020, 11, 344, 65, 0, 37, 11, 0),
(2020, 12, 298, 55, 0, 32, 10, 0)
ON CONFLICT (ano, mes) DO UPDATE SET
  resgates = EXCLUDED.resgates,
  solturas = EXCLUDED.solturas,
  obitos = EXCLUDED.obitos,
  feridos = EXCLUDED.feridos,
  filhotes = EXCLUDED.filhotes,
  atropelamentos = EXCLUDED.atropelamentos;

-- Inserir dados oficiais de 2021
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos) VALUES
(2021, 1, 399, 117, 4, 4, 21, 0),
(2021, 2, 302, 89, 1, 5, 12, 1),
(2021, 3, 329, 97, 2, 0, 6, 0),
(2021, 4, 203, 60, 11, 0, 0, 0),
(2021, 5, 189, 56, 1, 4, 0, 0),
(2021, 6, 161, 47, 1, 1, 0, 0),
(2021, 7, 144, 42, 1, 3, 4, 0),
(2021, 8, 260, 76, 5, 0, 16, 0),
(2021, 9, 337, 99, 1, 0, 137, 0),
(2021, 10, 399, 117, 7, 34, 79, 0),
(2021, 11, 486, 143, 17, 91, 28, 0),
(2021, 12, 414, 122, 14, 78, 17, 0)
ON CONFLICT (ano, mes) DO UPDATE SET
  resgates = EXCLUDED.resgates,
  solturas = EXCLUDED.solturas,
  obitos = EXCLUDED.obitos,
  feridos = EXCLUDED.feridos,
  filhotes = EXCLUDED.filhotes,
  atropelamentos = EXCLUDED.atropelamentos;

-- Inserir dados oficiais de 2022
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos) VALUES
(2022, 1, 466, 137, 12, 24, 18, 0),
(2022, 2, 353, 104, 29, 45, 24, 0),
(2022, 3, 295, 87, 22, 19, 7, 0),
(2022, 4, 316, 93, 17, 22, 2, 0),
(2022, 5, 220, 65, 26, 36, 7, 0),
(2022, 6, 226, 66, 18, 42, 3, 1),
(2022, 7, 169, 50, 14, 38, 10, 0),
(2022, 8, 143, 42, 24, 38, 2, 2),
(2022, 9, 210, 62, 6, 57, 24, 0),
(2022, 10, 213, 63, 7, 56, 10, 1),
(2022, 11, 211, 62, 2, 56, 6, 0),
(2022, 12, 309, 89, 2, 56, 13, 0)
ON CONFLICT (ano, mes) DO UPDATE SET
  resgates = EXCLUDED.resgates,
  solturas = EXCLUDED.solturas,
  obitos = EXCLUDED.obitos,
  feridos = EXCLUDED.feridos,
  filhotes = EXCLUDED.filhotes,
  atropelamentos = EXCLUDED.atropelamentos;

-- Inserir dados oficiais de 2023
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos) VALUES
(2023, 1, 162, 48, 2, 44, 13, 0),
(2023, 2, 223, 66, 0, 35, 3, 1),
(2023, 3, 170, 50, 2, 35, 2, 0),
(2023, 4, 124, 36, 1, 28, 0, 0),
(2023, 5, 112, 33, 1, 22, 3, 0),
(2023, 6, 38, 11, 2, 11, 3, 0),
(2023, 7, 42, 12, 0, 6, 0, 0),
(2023, 8, 78, 23, 13, 13, 1, 0),
(2023, 9, 61, 18, 0, 18, 2, 0),
(2023, 10, 155, 46, 5, 49, 5, 0),
(2023, 11, 245, 72, 0, 42, 6, 0),
(2023, 12, 70, 20, 0, 25, 1, 0)
ON CONFLICT (ano, mes) DO UPDATE SET
  resgates = EXCLUDED.resgates,
  solturas = EXCLUDED.solturas,
  obitos = EXCLUDED.obitos,
  feridos = EXCLUDED.feridos,
  filhotes = EXCLUDED.filhotes,
  atropelamentos = EXCLUDED.atropelamentos;

-- Inserir dados oficiais de 2024
INSERT INTO fact_resumo_mensal_historico (ano, mes, resgates, solturas, obitos, feridos, filhotes, atropelamentos) VALUES
(2024, 1, 319, 70, 1, 38, 3, 0),
(2024, 2, 480, 94, 4, 44, 18, 0),
(2024, 3, 515, 117, 0, 42, 10, 0),
(2024, 4, 121, 50, 2, 24, 1, 0),
(2024, 5, 212, 44, 2, 24, 3, 0),
(2024, 6, 122, 45, 1, 31, 0, 0),
(2024, 7, 157, 59, 0, 23, 3, 0),
(2024, 8, 126, 30, 0, 29, 7, 0),
(2024, 9, 41, 10, 0, 13, 2, 0),
(2024, 10, 186, 55, 0, 47, 31, 0),
(2024, 11, 187, 38, 0, 30, 7, 0),
(2024, 12, 108, 34, 0, 25, 19, 0)
ON CONFLICT (ano, mes) DO UPDATE SET
  resgates = EXCLUDED.resgates,
  solturas = EXCLUDED.solturas,
  obitos = EXCLUDED.obitos,
  feridos = EXCLUDED.feridos,
  filhotes = EXCLUDED.filhotes,
  atropelamentos = EXCLUDED.atropelamentos;
