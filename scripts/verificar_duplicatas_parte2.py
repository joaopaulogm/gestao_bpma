"""
Verificar duplicatas na PARTE 2
"""
import re

with open('supabase/migrations/migration2_partes/20260105225747_popular_tabelas_estatisticas_bpma_adaptado_PARTE_2_DE_4.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair todos os valores (tempo_id, indicador_id)
pattern = r"\((\d+),'([^']+)',(\d+)\)"
matches = re.findall(pattern, content)

# Agrupar por (tempo_id, indicador_id)
from collections import defaultdict
grupos = defaultdict(list)

for tempo_id, indicador_id, valor in matches:
    key = (tempo_id, indicador_id)
    grupos[key].append(valor)

# Encontrar duplicatas
duplicatas = {k: v for k, v in grupos.items() if len(v) > 1}

if duplicatas:
    print(f"Duplicatas encontradas: {len(duplicatas)}")
    for (tempo_id, indicador_id), valores in list(duplicatas.items())[:10]:
        print(f"  ({tempo_id}, '{indicador_id}'): {len(valores)} vezes - valores: {valores}")
else:
    print("Nenhuma duplicata encontrada!")

