import re

with open('supabase/migrations/20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Extrair todos os IDs do INSERT de dim_indicador_bpma
pattern = r"\('([^']+)',"
matches = re.findall(pattern, content)

# Encontrar duplicatas
from collections import Counter
counter = Counter(matches)
duplicatas = {id: count for id, count in counter.items() if count > 1}

if duplicatas:
    print(f"IDs duplicados encontrados: {len(duplicatas)}")
    for id, count in sorted(duplicatas.items()):
        print(f"  - '{id}': {count} vezes")
else:
    print("Nenhuma duplicata encontrada!")

