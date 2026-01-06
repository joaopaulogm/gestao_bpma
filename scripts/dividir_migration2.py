"""
Script para dividir a Migration 2 em partes menores que podem ser executadas no SQL Editor
"""
import os

base_dir = os.path.dirname(os.path.dirname(__file__))
migration_path = os.path.join(base_dir, 'supabase', 'migrations', '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql')
output_dir = os.path.join(base_dir, 'supabase', 'migrations', 'migration2_partes')

os.makedirs(output_dir, exist_ok=True)

# Ler arquivo completo
with open(migration_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Dividir em comandos INSERT individuais
commands = []
current_command = ''

for line in content.split('\n'):
    current_command += line + '\n'
    
    # Se a linha termina com ; e não é comentário, é um comando completo
    if line.strip().endswith(';') and not line.strip().startswith('--'):
        if current_command.strip():
            commands.append(current_command.strip())
        current_command = ''

# Adicionar último comando se houver
if current_command.strip():
    commands.append(current_command.strip())

print(f"Total de comandos: {len(commands)}")
print(f"Dividindo em partes de ~500 comandos cada...\n")

# Dividir em partes de 500 comandos
part_size = 500
num_parts = (len(commands) + part_size - 1) // part_size

for part_num in range(num_parts):
    start_idx = part_num * part_size
    end_idx = min(start_idx + part_size, len(commands))
    
    part_commands = commands[start_idx:end_idx]
    
    # Criar arquivo da parte
    part_filename = f"20260105225747_popular_tabelas_estatisticas_bpma_adaptado_PARTE_{part_num + 1}_DE_{num_parts}.sql"
    part_path = os.path.join(output_dir, part_filename)
    
    # Adicionar cabeçalho
    part_content = f"""-- ============================================
-- POPULAR TABELAS FACT - PARTE {part_num + 1} DE {num_parts}
-- ============================================
-- Comandos {start_idx + 1} a {end_idx} de {len(commands)}
-- Execute esta parte após a Migration 1
-- ============================================

"""
    
    part_content += '\n\n'.join(part_commands)
    
    with open(part_path, 'w', encoding='utf-8') as f:
        f.write(part_content)
    
    size_kb = len(part_content) / 1024
    print(f"Parte {part_num + 1}/{num_parts}: {len(part_commands)} comandos ({size_kb:.1f} KB) - {part_filename}")

print(f"\nArquivos criados em: {output_dir}")
print(f"\nExecute as partes na ordem (Parte 1, Parte 2, ...)")

