"""
Script para dividir a Migration 2 em partes menores e otimizadas
Agrupa múltiplos INSERTs em um único comando para melhor performance
"""
import os
import re

base_dir = os.path.dirname(os.path.dirname(__file__))
migration_path = os.path.join(base_dir, 'supabase', 'migrations', '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql')
output_dir = os.path.join(base_dir, 'supabase', 'migrations', 'migration2_partes')

os.makedirs(output_dir, exist_ok=True)

# Ler arquivo completo
with open(migration_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Separar em duas seções: fact_indicador_mensal_bpma e fact_resgate_fauna_especie_mensal
sections = content.split('-- 2. POPULAR fact_resgate_fauna_especie_mensal')

# Processar seção 1: fact_indicador_mensal_bpma
section1 = sections[0]
section2 = '-- 2. POPULAR fact_resgate_fauna_especie_mensal' + sections[1] if len(sections) > 1 else ''

# Extrair comandos INSERT da seção 1
pattern1 = r"INSERT INTO public\.fact_indicador_mensal_bpma.*?ON CONFLICT.*?;"
matches1 = re.findall(pattern1, section1, re.DOTALL)

# Extrair comandos INSERT da seção 2
pattern2 = r"INSERT INTO public\.fact_resgate_fauna_especie_mensal.*?ON CONFLICT.*?;"
matches2 = re.findall(pattern2, section2, re.DOTALL)

print(f"Comandos fact_indicador_mensal_bpma: {len(matches1)}")
print(f"Comandos fact_resgate_fauna_especie_mensal: {len(matches2)}")
print(f"\nCriando partes otimizadas...\n")

# Função para agrupar INSERTs
def agrupar_inserts(inserts, table_name, batch_size=100):
    """Agrupa múltiplos INSERTs em um único comando"""
    batches = []
    
    for i in range(0, len(inserts), batch_size):
        batch = inserts[i:i+batch_size]
        
        # Extrair valores de cada INSERT
        values_list = []
        conflict_clause = None
        
        for insert in batch:
            # Extrair VALUES
            values_match = re.search(r'VALUES\s*\((.*?)\)', insert, re.DOTALL)
            if values_match:
                values_list.append(f"({values_match.group(1).strip()})")
            
            # Extrair ON CONFLICT
            if not conflict_clause:
                conflict_match = re.search(r'ON CONFLICT.*?;', insert, re.DOTALL)
                if conflict_match:
                    conflict_clause = conflict_match.group(0).replace(';', '')
        
        if values_list:
            # Criar INSERT agrupado
            header_match = re.search(r'INSERT INTO\s+(\S+)\s*\(([^)]+)\)', batch[0])
            if header_match:
                table = header_match.group(1)
                columns = header_match.group(2)
                
                grouped_insert = f"INSERT INTO {table} ({columns}) VALUES\n"
                grouped_insert += ',\n'.join(values_list) + '\n'
                if conflict_clause:
                    grouped_insert += conflict_clause + ';'
                else:
                    grouped_insert += ';'
                
                batches.append(grouped_insert)
    
    return batches

# Agrupar INSERTs da seção 1
batches1 = agrupar_inserts(matches1, 'fact_indicador_mensal_bpma', batch_size=100)

# Agrupar INSERTs da seção 2 (menor batch para resgates que são mais complexos)
batches2 = agrupar_inserts(matches2, 'fact_resgate_fauna_especie_mensal', batch_size=50)

# Combinar e dividir em partes
all_batches = batches1 + batches2
part_size = 20  # 20 batches por parte
num_parts = (len(all_batches) + part_size - 1) // part_size

print(f"Total de batches agrupados: {len(all_batches)}")
print(f"Dividindo em {num_parts} partes de ~{part_size} batches cada...\n")

for part_num in range(num_parts):
    start_idx = part_num * part_size
    end_idx = min(start_idx + part_size, len(all_batches))
    
    part_batches = all_batches[start_idx:end_idx]
    
    # Criar arquivo da parte
    part_filename = f"20260105225747_popular_tabelas_estatisticas_bpma_adaptado_PARTE_{part_num + 1}_DE_{num_parts}.sql"
    part_path = os.path.join(output_dir, part_filename)
    
    # Adicionar cabeçalho
    part_content = f"""-- ============================================
-- POPULAR TABELAS FACT - PARTE {part_num + 1} DE {num_parts}
-- ============================================
-- Batches {start_idx + 1} a {end_idx} de {len(all_batches)}
-- Execute esta parte após a Migration 1
-- Execute as partes na ordem (Parte 1, Parte 2, ...)
-- ============================================

"""
    
    part_content += '\n\n'.join(part_batches)
    
    with open(part_path, 'w', encoding='utf-8') as f:
        f.write(part_content)
    
    size_kb = len(part_content) / 1024
    print(f"Parte {part_num + 1}/{num_parts}: {len(part_batches)} batches ({size_kb:.1f} KB) - {part_filename}")

print(f"\nArquivos criados em: {output_dir}")
print(f"\nExecute as partes na ordem (Parte 1, Parte 2, ...) no SQL Editor")

