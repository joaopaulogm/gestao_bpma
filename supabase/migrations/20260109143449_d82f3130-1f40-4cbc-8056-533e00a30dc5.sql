
-- Atualizar dados de 2020 - por mês
UPDATE fat_resgates_diarios_2020 SET 
  quantidade_solturas = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 54.0 / 282)
    WHEN 2 THEN ROUND(quantidade_resgates * 50.0 / 263)
    WHEN 3 THEN ROUND(quantidade_resgates * 48.0 / 253)
    WHEN 4 THEN ROUND(quantidade_resgates * 39.0 / 208)
    WHEN 5 THEN ROUND(quantidade_resgates * 56.0 / 295)
    WHEN 6 THEN ROUND(quantidade_resgates * 43.0 / 226)
    WHEN 7 THEN ROUND(quantidade_resgates * 52.0 / 276)
    WHEN 8 THEN ROUND(quantidade_resgates * 46.0 / 246)
    WHEN 9 THEN ROUND(quantidade_resgates * 58.0 / 306)
    WHEN 10 THEN ROUND(quantidade_resgates * 76.0 / 403)
    WHEN 11 THEN ROUND(quantidade_resgates * 65.0 / 344)
    WHEN 12 THEN ROUND(quantidade_resgates * 55.0 / 298)
    ELSE 0
  END,
  quantidade_feridos = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 31.0 / 282)
    WHEN 2 THEN ROUND(quantidade_resgates * 29.0 / 263)
    WHEN 3 THEN ROUND(quantidade_resgates * 27.0 / 253)
    WHEN 4 THEN ROUND(quantidade_resgates * 23.0 / 208)
    WHEN 5 THEN ROUND(quantidade_resgates * 32.0 / 295)
    WHEN 6 THEN ROUND(quantidade_resgates * 25.0 / 226)
    WHEN 7 THEN ROUND(quantidade_resgates * 30.0 / 276)
    WHEN 8 THEN ROUND(quantidade_resgates * 27.0 / 246)
    WHEN 9 THEN ROUND(quantidade_resgates * 33.0 / 306)
    WHEN 10 THEN ROUND(quantidade_resgates * 44.0 / 403)
    WHEN 11 THEN ROUND(quantidade_resgates * 37.0 / 344)
    WHEN 12 THEN ROUND(quantidade_resgates * 32.0 / 298)
    ELSE 0
  END;

-- Atualizar dados de 2021
UPDATE fat_resgates_diarios_2021 SET 
  quantidade_solturas = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 117.0 / 399)
    WHEN 2 THEN ROUND(quantidade_resgates * 89.0 / 302)
    WHEN 3 THEN ROUND(quantidade_resgates * 97.0 / 329)
    WHEN 4 THEN ROUND(quantidade_resgates * 60.0 / 203)
    WHEN 5 THEN ROUND(quantidade_resgates * 56.0 / 189)
    WHEN 6 THEN ROUND(quantidade_resgates * 47.0 / 161)
    WHEN 7 THEN ROUND(quantidade_resgates * 42.0 / 144)
    WHEN 8 THEN ROUND(quantidade_resgates * 76.0 / 260)
    WHEN 9 THEN ROUND(quantidade_resgates * 99.0 / 337)
    WHEN 10 THEN ROUND(quantidade_resgates * 117.0 / 399)
    WHEN 11 THEN ROUND(quantidade_resgates * 143.0 / 486)
    WHEN 12 THEN ROUND(quantidade_resgates * 122.0 / 414)
    ELSE 0
  END,
  quantidade_feridos = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 4.0 / 399)
    WHEN 2 THEN ROUND(quantidade_resgates * 5.0 / 302)
    WHEN 3 THEN 0
    WHEN 4 THEN 0
    WHEN 5 THEN ROUND(quantidade_resgates * 4.0 / 189)
    WHEN 6 THEN ROUND(quantidade_resgates * 1.0 / 161)
    WHEN 7 THEN ROUND(quantidade_resgates * 3.0 / 144)
    WHEN 8 THEN 0
    WHEN 9 THEN 0
    WHEN 10 THEN ROUND(quantidade_resgates * 34.0 / 399)
    WHEN 11 THEN ROUND(quantidade_resgates * 91.0 / 486)
    WHEN 12 THEN ROUND(quantidade_resgates * 78.0 / 414)
    ELSE 0
  END;

-- Atualizar dados de 2022
UPDATE fat_resgates_diarios_2022 SET 
  quantidade_solturas = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 137.0 / 466)
    WHEN 2 THEN ROUND(quantidade_resgates * 104.0 / 353)
    WHEN 3 THEN ROUND(quantidade_resgates * 87.0 / 295)
    WHEN 4 THEN ROUND(quantidade_resgates * 93.0 / 316)
    WHEN 5 THEN ROUND(quantidade_resgates * 65.0 / 220)
    WHEN 6 THEN ROUND(quantidade_resgates * 66.0 / 226)
    WHEN 7 THEN ROUND(quantidade_resgates * 50.0 / 169)
    WHEN 8 THEN ROUND(quantidade_resgates * 42.0 / 143)
    WHEN 9 THEN ROUND(quantidade_resgates * 62.0 / 210)
    WHEN 10 THEN ROUND(quantidade_resgates * 63.0 / 213)
    WHEN 11 THEN ROUND(quantidade_resgates * 62.0 / 211)
    WHEN 12 THEN ROUND(quantidade_resgates * 89.0 / 309)
    ELSE 0
  END,
  quantidade_feridos = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 24.0 / 466)
    WHEN 2 THEN ROUND(quantidade_resgates * 45.0 / 353)
    WHEN 3 THEN ROUND(quantidade_resgates * 19.0 / 295)
    WHEN 4 THEN ROUND(quantidade_resgates * 22.0 / 316)
    WHEN 5 THEN ROUND(quantidade_resgates * 36.0 / 220)
    WHEN 6 THEN ROUND(quantidade_resgates * 42.0 / 226)
    WHEN 7 THEN ROUND(quantidade_resgates * 38.0 / 169)
    WHEN 8 THEN ROUND(quantidade_resgates * 38.0 / 143)
    WHEN 9 THEN ROUND(quantidade_resgates * 57.0 / 210)
    WHEN 10 THEN ROUND(quantidade_resgates * 56.0 / 213)
    WHEN 11 THEN ROUND(quantidade_resgates * 56.0 / 211)
    WHEN 12 THEN ROUND(quantidade_resgates * 56.0 / 309)
    ELSE 0
  END;

-- Atualizar dados de 2023
UPDATE fat_resgates_diarios_2023 SET 
  quantidade_solturas = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 48.0 / 162)
    WHEN 2 THEN ROUND(quantidade_resgates * 66.0 / 223)
    WHEN 3 THEN ROUND(quantidade_resgates * 50.0 / 170)
    WHEN 4 THEN ROUND(quantidade_resgates * 36.0 / 124)
    WHEN 5 THEN ROUND(quantidade_resgates * 33.0 / 112)
    WHEN 6 THEN ROUND(quantidade_resgates * 11.0 / 38)
    WHEN 7 THEN ROUND(quantidade_resgates * 12.0 / 42)
    WHEN 8 THEN ROUND(quantidade_resgates * 23.0 / 78)
    WHEN 9 THEN ROUND(quantidade_resgates * 18.0 / 61)
    WHEN 10 THEN ROUND(quantidade_resgates * 46.0 / 155)
    WHEN 11 THEN ROUND(quantidade_resgates * 72.0 / 245)
    WHEN 12 THEN ROUND(quantidade_resgates * 20.0 / 70)
    ELSE 0
  END,
  quantidade_feridos = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 44.0 / 162)
    WHEN 2 THEN ROUND(quantidade_resgates * 35.0 / 223)
    WHEN 3 THEN ROUND(quantidade_resgates * 35.0 / 170)
    WHEN 4 THEN ROUND(quantidade_resgates * 28.0 / 124)
    WHEN 5 THEN ROUND(quantidade_resgates * 22.0 / 112)
    WHEN 6 THEN ROUND(quantidade_resgates * 11.0 / 38)
    WHEN 7 THEN ROUND(quantidade_resgates * 6.0 / 42)
    WHEN 8 THEN ROUND(quantidade_resgates * 13.0 / 78)
    WHEN 9 THEN ROUND(quantidade_resgates * 18.0 / 61)
    WHEN 10 THEN ROUND(quantidade_resgates * 49.0 / 155)
    WHEN 11 THEN ROUND(quantidade_resgates * 42.0 / 245)
    WHEN 12 THEN ROUND(quantidade_resgates * 25.0 / 70)
    ELSE 0
  END;

-- Atualizar dados de 2024
UPDATE fat_resgates_diarios_2024 SET 
  quantidade_solturas = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 70.0 / 319)
    WHEN 2 THEN ROUND(quantidade_resgates * 94.0 / 480)
    WHEN 3 THEN ROUND(quantidade_resgates * 117.0 / 515)
    WHEN 4 THEN ROUND(quantidade_resgates * 50.0 / 121)
    WHEN 5 THEN ROUND(quantidade_resgates * 44.0 / 212)
    WHEN 6 THEN ROUND(quantidade_resgates * 45.0 / 122)
    WHEN 7 THEN ROUND(quantidade_resgates * 59.0 / 157)
    WHEN 8 THEN ROUND(quantidade_resgates * 30.0 / 126)
    WHEN 9 THEN ROUND(quantidade_resgates * 10.0 / 41)
    WHEN 10 THEN ROUND(quantidade_resgates * 55.0 / 186)
    WHEN 11 THEN ROUND(quantidade_resgates * 38.0 / 187)
    WHEN 12 THEN ROUND(quantidade_resgates * 34.0 / 108)
    ELSE 0
  END,
  quantidade_feridos = CASE EXTRACT(MONTH FROM data_ocorrencia::date)
    WHEN 1 THEN ROUND(quantidade_resgates * 38.0 / 319)
    WHEN 2 THEN ROUND(quantidade_resgates * 44.0 / 480)
    WHEN 3 THEN ROUND(quantidade_resgates * 42.0 / 515)
    WHEN 4 THEN ROUND(quantidade_resgates * 24.0 / 121)
    WHEN 5 THEN ROUND(quantidade_resgates * 24.0 / 212)
    WHEN 6 THEN ROUND(quantidade_resgates * 31.0 / 122)
    WHEN 7 THEN ROUND(quantidade_resgates * 23.0 / 157)
    WHEN 8 THEN ROUND(quantidade_resgates * 29.0 / 126)
    WHEN 9 THEN ROUND(quantidade_resgates * 13.0 / 41)
    WHEN 10 THEN ROUND(quantidade_resgates * 47.0 / 186)
    WHEN 11 THEN ROUND(quantidade_resgates * 30.0 / 187)
    WHEN 12 THEN ROUND(quantidade_resgates * 25.0 / 108)
    ELSE 0
  END;
