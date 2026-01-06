"""
Corrigir duplicatas nas partes da Migration 2
Remove duplicatas mantendo apenas o último valor encontrado
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
    
    # Dividir em comandos INSERT
    insert_commands = re.split(r'(INSERT INTO[^;]+;)', content)
    
    new_content = []
    i = 0
    while i < len(insert_commands):
        if insert_commands[i].strip().startswith('INSERT INTO'):
            # Processar comando INSERT
            insert_cmd = insert_commands[i]
            
            # Extrair valores
            values_match = re.search(r'VALUES\s*(.*?)\s*ON CONFLICT', insert_cmd, re.DOTALL)
            if values_match:
                values_text = values_match.group(1)
                
                # Extrair cada tupla (tempo_id, indicador_id, valor)
                tuples = re.findall(r'\((\d+),\'([^\']+)\',([^)]+)\)', values_text)
                
                # Remover duplicatas mantendo o último valor
                seen = OrderedDict()
                for tempo_id, indicador_id, valor in tuples:
                    key = (tempo_id, indicador_id)
                    seen[key] = valor
                
                # Reconstruir valores sem duplicatas
                new_values = ',\n'.join([f"({t},'{i}',{v})" for (t, i), v in seen.items()])
                
                # Reconstruir comando
                new_insert = re.sub(
                    r'VALUES\s*.*?\s*ON CONFLICT',
                    f'VALUES\n{new_values}\nON CONFLICT',
                    insert_cmd,
                    flags=re.DOTALL
                )
                
                new_content.append(new_insert)
            else:
                new_content.append(insert_cmd)
        else:
            # Comentários e espaços
            if insert_commands[i].strip():
                new_content.append(insert_commands[i])
        
        i += 1
    
    # Salvar arquivo corrigido
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(''.join(new_content))
    
    print(f"  Corrigido: {filename}")

print("\nArquivos corrigidos!")

