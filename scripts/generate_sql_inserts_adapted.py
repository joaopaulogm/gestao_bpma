"""
Script para gerar INSERTs SQL usando a estrutura adaptada (dim_tempo, fact_*)
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

# Função para criar ID slug
def criar_id_slug(nome):
    """Cria ID slug a partir do nome"""
    import re
    slug = nome.lower()
    slug = re.sub(r'[àáâãäå]', 'a', slug)
    slug = re.sub(r'[èéêë]', 'e', slug)
    slug = re.sub(r'[ìíîï]', 'i', slug)
    slug = re.sub(r'[òóôõö]', 'o', slug)
    slug = re.sub(r'[ùúûü]', 'u', slug)
    slug = re.sub(r'[ç]', 'c', slug)
    slug = re.sub(r'[ñ]', 'n', slug)
    slug = re.sub(r'[^a-z0-9\s]', '', slug)
    slug = re.sub(r'\s+', '_', slug)
    slug = slug.strip('_')
    return slug

# Gerar timestamp
timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
migration_name = f"{timestamp}_popular_tabelas_estatisticas_bpma_adaptado.sql"

sql_content = f"""-- ============================================
-- POPULAR TABELAS FACT COM DADOS DE ESTATÍSTICAS BPMA
-- ============================================
-- Estrutura adaptada: dim_tempo (ID AAAAMM), fact_*
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================

-- 1. POPULAR fact_indicador_mensal_bpma
-- ============================================

"""

# Processar atendimentos
print("Processando atendimentos...")
atendimentos_sql = []
for _, row in df_atendimentos.iterrows():
    ano = int(row['ano'])
    mes = int(row['mes'])
    tempo_id = ano * 100 + mes
    natureza = str(row['natureza']).strip().replace("'", "''")
    quantidade = int(row['quantidade'])
    
    indicador_id = criar_id_slug(natureza)
    
    sql = f"INSERT INTO public.fact_indicador_mensal_bpma (tempo_id, indicador_id, valor) VALUES\n"
    sql += f"({tempo_id},'{indicador_id}',{quantidade})\n"
    sql += "ON CONFLICT (tempo_id, indicador_id) DO UPDATE SET valor=EXCLUDED.valor;\n\n"
    
    atendimentos_sql.append(sql)

sql_content += "".join(atendimentos_sql)

sql_content += """
-- 2. POPULAR fact_resgate_fauna_especie_mensal
-- ============================================
-- Nota: Faz match com dim_especies_fauna usando nome_cientifico ou nome_popular
-- Se não encontrar match, insere com id_especie_fauna NULL mas mantém nome_popular e nome_cientifico

"""

# Processar resgates
print("Processando resgates...")
resgates_sql = []
resgates_processed = 0

for _, row in df_resgates.iterrows():
    ano = int(row['ano'])
    mes = int(row['mes'])
    tempo_id = ano * 100 + mes
    nome_popular = str(row['nome_popular']).strip().replace("'", "''") if pd.notna(row['nome_popular']) else None
    nome_cientifico = str(row['nome_cientifico']).strip().replace("'", "''") if pd.notna(row['nome_cientifico']) else None
    quantidade = int(row['quantidade'])
    
    if not nome_popular or nome_popular == '' or not nome_cientifico or nome_cientifico == '':
        continue
    
    # Construir match com dim_especies_fauna
    match_especie = f"""
    COALESCE(
        (SELECT id FROM public.dim_especies_fauna 
         WHERE LOWER(TRIM(nome_cientifico)) = LOWER(TRIM('{nome_cientifico}'))
         LIMIT 1),
        (SELECT id FROM public.dim_especies_fauna 
         WHERE LOWER(TRIM(nome_popular)) = LOWER(TRIM('{nome_popular}'))
         LIMIT 1),
        NULL
    )"""
    
    nome_popular_sql = f"'{nome_popular}'" if nome_popular else "NULL"
    nome_cientifico_sql = f"'{nome_cientifico}'" if nome_cientifico else "NULL"
    
    sql = f"""INSERT INTO public.fact_resgate_fauna_especie_mensal (
    tempo_id, id_regiao_administrativa, id_especie_fauna, 
    nome_cientifico, nome_popular, quantidade
)
SELECT 
    {tempo_id},
    NULL,
    {match_especie},
    {nome_cientifico_sql},
    {nome_popular_sql},
    {quantidade}
ON CONFLICT (tempo_id, nome_cientifico) 
DO UPDATE SET 
    quantidade=EXCLUDED.quantidade, 
    nome_popular=EXCLUDED.nome_popular, 
    id_especie_fauna=COALESCE(EXCLUDED.id_especie_fauna, fact_resgate_fauna_especie_mensal.id_especie_fauna);

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

