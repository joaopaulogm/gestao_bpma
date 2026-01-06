"""
Script para gerar INSERTs SQL para popular as tabelas fat com dados processados
Usa as tabelas de referência dim_especies_fauna e dim_regiao_administrativa
"""
import pandas as pd
import os
from datetime import datetime

# Caminhos
base_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(base_dir, 'data', 'processed')
output_dir = os.path.join(base_dir, 'supabase', 'migrations')

os.makedirs(output_dir, exist_ok=True)

# Ler dados processados
df_atendimentos = pd.read_csv(os.path.join(data_dir, 'atendimentos.csv'))
df_resgates = pd.read_csv(os.path.join(data_dir, 'resgates.csv'))

# Gerar timestamp
timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
migration_name = f"{timestamp}_popular_tabelas_estatisticas_bpma.sql"

sql_content = f"""-- ============================================
-- POPULAR TABELAS FAT COM DADOS DE ESTATÍSTICAS BPMA
-- ============================================
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================

-- 1. POPULAR fat_atendimentos_estatisticas
-- ============================================

"""

# Processar atendimentos
print("Processando atendimentos...")
atendimentos_sql = []
for _, row in df_atendimentos.iterrows():
    ano = int(row['ano'])
    mes = int(row['mes'])
    natureza = str(row['natureza']).strip().replace("'", "''")
    quantidade = int(row['quantidade'])
    
    sql = f"""INSERT INTO public.fat_atendimentos_estatisticas (ano_id, mes_id, tipo_atendimento_id, quantidade)
SELECT 
    (SELECT id FROM public.dim_ano WHERE ano = {ano}),
    (SELECT id FROM public.dim_mes WHERE mes = {mes}),
    (SELECT id FROM public.dim_tipo_atendimento WHERE nome = '{natureza}'),
    {quantidade}
ON CONFLICT (ano_id, mes_id, tipo_atendimento_id) 
DO UPDATE SET quantidade = EXCLUDED.quantidade;

"""
    atendimentos_sql.append(sql)

sql_content += "".join(atendimentos_sql)

sql_content += """
-- 2. POPULAR fat_resgates_estatisticas
-- ============================================
-- Nota: Faz match com dim_especies_fauna usando nome_cientifico ou nome_popular
-- Se não encontrar match, insere com especie_id NULL mas mantém nome_popular e nome_cientifico

"""

# Processar resgates
print("Processando resgates...")
resgates_sql = []
resgates_processed = 0

for _, row in df_resgates.iterrows():
    ano = int(row['ano'])
    mes = int(row['mes'])
    tipo_fauna = str(row['tipo_fauna']).strip() if pd.notna(row['tipo_fauna']) else None
    nome_popular = str(row['nome_popular']).strip().replace("'", "''") if pd.notna(row['nome_popular']) else None
    nome_cientifico = str(row['nome_cientifico']).strip().replace("'", "''") if pd.notna(row['nome_cientifico']) else None
    ordem = str(row['ordem']).strip().replace("'", "''") if pd.notna(row['ordem']) else None
    quantidade = int(row['quantidade'])
    
    if not nome_popular or nome_popular == '':
        continue
    
    # Construir match com dim_especies_fauna
    # Tentar primeiro por nome_cientifico, depois por nome_popular
    match_especie = f"""
    COALESCE(
        (SELECT id FROM public.dim_especies_fauna 
         WHERE LOWER(TRIM(nome_cientifico)) = LOWER(TRIM('{nome_cientifico if nome_cientifico else ''}'))
         LIMIT 1),
        (SELECT id FROM public.dim_especies_fauna 
         WHERE LOWER(TRIM(nome_popular)) = LOWER(TRIM('{nome_popular}'))
         LIMIT 1),
        NULL
    )"""
    
    nome_popular_sql = f"'{nome_popular}'" if nome_popular else "NULL"
    nome_cientifico_sql = f"'{nome_cientifico}'" if nome_cientifico else "NULL"
    ordem_sql = f"'{ordem}'" if ordem else "NULL"
    tipo_fauna_sql = f"(SELECT id FROM public.dim_tipo_fauna_estatistica WHERE nome = '{tipo_fauna}')" if tipo_fauna else "NULL"
    
    sql = f"""INSERT INTO public.fat_resgates_estatisticas (
    ano_id, mes_id, tipo_fauna_id, especie_id, 
    nome_popular, nome_cientifico, ordem_taxonomica, quantidade
)
SELECT 
    (SELECT id FROM public.dim_ano WHERE ano = {ano}),
    (SELECT id FROM public.dim_mes WHERE mes = {mes}),
    {tipo_fauna_sql},
    {match_especie},
    {nome_popular_sql},
    {nome_cientifico_sql},
    {ordem_sql},
    {quantidade}
ON CONFLICT (ano_id, mes_id, especie_id, tipo_fauna_id) 
DO UPDATE SET quantidade = EXCLUDED.quantidade;

"""
    resgates_sql.append(sql)
    resgates_processed += 1

sql_content += "".join(resgates_sql)

sql_content += f"""
-- ============================================
-- RESUMO
-- ============================================
-- Atendimentos processados: {len(df_atendimentos)}
-- Resgates processados: {resgates_processed}
-- ============================================
"""

# Salvar migration
migration_path = os.path.join(output_dir, migration_name)
with open(migration_path, 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f"\nMigration criada: {migration_path}")
print(f"Tamanho: {len(sql_content)} caracteres")
print(f"Atendimentos: {len(df_atendimentos)}")
print(f"Resgates: {resgates_processed}")

