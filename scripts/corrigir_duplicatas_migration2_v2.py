"""
Corrigir duplicatas nas partes da Migration 2 - Versão 2
Remove duplicatas entre TODOS os comandos INSERT, mantendo apenas o último valor
"""
import os
import re
from collections import OrderedDict

base_dir = os.path.dirname(os.path.dirname(__file__))
partes_dir = os.path.join(base_dir, 'supabase', 'migrations', 'migration2_partes')

# Processar cada parte
for part_num in range(1, 5):
    filename = f"20260105225747_popular_tabelas_estatisticas_bpma_adaptado_PARTE_{part_num}_DE_4.sql"
    filepath = os.path.join(partes_dir, filename)
    
    if not os.path.exists(filepath):
        continue
    
    print(f"Processando {filename}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extrair cabeçalho (até primeiro INSERT)
    header_match = re.match(r'(.*?)(INSERT INTO)', content, re.DOTALL)
    header = header_match.group(1) if header_match else ''
    
    # Encontrar todos os comandos INSERT
    insert_pattern = r'INSERT INTO\s+(\S+)\s*\(([^)]+)\)\s*VALUES\s*(.*?)\s*ON CONFLICT\s*(.*?);'
    inserts = re.finditer(insert_pattern, content, re.DOTALL)
    
    # Coletar todos os valores de todos os INSERTs, removendo duplicatas
    all_values = OrderedDict()
    table_name = None
    columns = None
    conflict_clause = None
    
    for match in inserts:
        if not table_name:
            table_name = match.group(1)
            columns = match.group(2)
            conflict_clause = match.group(4)
        
        values_text = match.group(3)
        tuples = re.findall(r'\((\d+),\'([^\']+)\',([^)]+)\)', values_text)
        
        for tempo_id, indicador_id, valor in tuples:
            key = (tempo_id, indicador_id)
            all_values[key] = valor
    
    # Reconstruir arquivo
    new_content = header
    
    if all_values:
        # Agrupar valores em batches de 100
        values_list = list(all_values.items())
        batch_size = 100
        
        for i in range(0, len(values_list), batch_size):
            batch = values_list[i:i+batch_size]
            values_str = ',\n'.join([f"({t},'{i}',{v})" for (t, i), v in batch])
            
            new_content += f"INSERT INTO {table_name} ({columns}) VALUES\n{values_str}\nON CONFLICT {conflict_clause};\n\n"
    
    # Salvar arquivo corrigido
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  Corrigido: {filename} (removidas duplicatas entre comandos)")

print("\nArquivos corrigidos!")

