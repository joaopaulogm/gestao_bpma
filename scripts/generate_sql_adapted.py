"""
Script para gerar SQL adaptado da estrutura melhor do arquivo fornecido
Usa dim_tempo (ID composto AAAAMM), dim_indicador_bpma e fact_* ao invés de fat_*
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
migration_name = f"{timestamp}_criar_tabelas_estatisticas_bpma_adaptado.sql"

sql_content = f"""-- ============================================
-- TABELAS DIM E FACT PARA ESTATÍSTICAS BPMA (2020-2025)
-- ============================================
-- Estrutura adaptada do arquivo bpma_dim_fat_2020_2025.sql
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELAS DIMENSÃO
-- ============================================

-- Dimensão: Tempo (ID composto AAAAMM)
CREATE TABLE IF NOT EXISTS public.dim_tempo (
  id integer PRIMARY KEY, -- formato AAAAMM
  ano smallint NOT NULL,
  mes smallint NOT NULL CHECK (mes BETWEEN 1 AND 12),
  mes_abreviacao text NOT NULL,
  inicio_mes date NOT NULL,
  UNIQUE (ano, mes)
);

-- Dimensão: Indicadores BPMA
CREATE TABLE IF NOT EXISTS public.dim_indicador_bpma (
  id text PRIMARY KEY,
  nome text NOT NULL,
  categoria text
);

-- 2. TABELAS FATO
-- ============================================

-- Fato: Indicadores Mensais BPMA
CREATE TABLE IF NOT EXISTS public.fact_indicador_mensal_bpma (
  tempo_id integer NOT NULL REFERENCES public.dim_tempo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  indicador_id text NOT NULL REFERENCES public.dim_indicador_bpma(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  valor numeric NOT NULL,
  PRIMARY KEY (tempo_id, indicador_id)
);

-- Fato: Resgate de Fauna por Espécie Mensal
CREATE TABLE IF NOT EXISTS public.fact_resgate_fauna_especie_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tempo_id integer NOT NULL REFERENCES public.dim_tempo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  id_regiao_administrativa uuid NULL REFERENCES public.dim_regiao_administrativa(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  id_especie_fauna uuid NULL REFERENCES public.dim_especies_fauna(id) ON UPDATE CASCADE ON DELETE SET NULL,
  nome_cientifico text NOT NULL,
  nome_popular text,
  quantidade integer NOT NULL,
  UNIQUE (tempo_id, nome_cientifico)
);

-- Popular dim_tempo (2020-2025)
INSERT INTO public.dim_tempo (id, ano, mes, mes_abreviacao, inicio_mes) VALUES
"""

# Gerar INSERTs para dim_tempo
anos = [2020, 2021, 2022, 2023, 2024, 2025]
meses_abrev = {
    1: 'JAN', 2: 'FEV', 3: 'MAR', 4: 'ABR', 5: 'MAI', 6: 'JUN',
    7: 'JUL', 8: 'AGO', 9: 'SET', 10: 'OUT', 11: 'NOV', 12: 'DEZ'
}

tempo_values = []
for ano in anos:
    for mes in range(1, 13):
        tempo_id = ano * 100 + mes
        mes_abrev = meses_abrev[mes]
        inicio_mes = f"{ano}-{mes:02d}-01"
        tempo_values.append(f"({tempo_id},{ano},{mes},'{mes_abrev}','{inicio_mes}')")

sql_content += ",\n".join(tempo_values)
sql_content += "\nON CONFLICT (id) DO NOTHING;\n\n"

# Popular dim_indicador_bpma com tipos únicos de atendimentos
sql_content += "-- Popular dim_indicador_bpma\n"
sql_content += "INSERT INTO public.dim_indicador_bpma (id, nome, categoria) VALUES\n"

# Função para criar ID slug
def criar_id_slug(nome):
    """Cria ID slug a partir do nome"""
    import re
    # Remove acentos e caracteres especiais
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

# Categorizar indicadores
categorias = {
    'atendimentos': ['Atendimentos registrados', 'Atendimentos registrados (RAP)'],
    'ocorrencias_ambientais': [
        'Termos Circunstanciados de Ocorrência - PMDF',
        'Termos Circunstanciados - OUTRAS',
        'Em apuração',
        'Flagrantes',
        'P.A.A.I.',
        'Apreensão de arma de fogo e/ou munição',
        'Crime contra as Áreas de Proteção Permanente',
        'Crimes contra as Unidades de Conservação',
        'Crime contra o Licenciamento Ambiental',
        'Crime contra os Recursos Hídricos',
        'Crime contra os Recursos Pesqueiros',
        'Crimes contra a Administração Ambiental',
        'Crimes contra a Fauna',
        'Crimes contra a Flora',
        'Outros Crimes Ambientais',
        'Parcelamento Irregular do Solo'
    ],
    'resgate_fauna_total': [
        'QUANTIDADE DE RESGATE',
        'QUANTIDADE DE SOLTURA',
        'QUANTIDADE DE ÓBITOS',
        'QUANTIDADE DE FERIDOS',
        'QUANTIDADE DE FILHOTES',
        'QUANTIDADE DE ATROPELAMENTO'
    ],
    'outros': [
        'Captura de animais / Busca de Animais / Recolhimento e Remoção de Animais / Remoção de Animais',
        'Corte de Árvores'
    ]
}

indicadores_values = []
tipos_processados = set()

for _, row in df_atendimentos.iterrows():
    natureza = str(row['natureza']).strip()
    if natureza and natureza not in tipos_processados:
        tipos_processados.add(natureza)
        
        # Determinar categoria
        categoria = 'outros'
        for cat, tipos in categorias.items():
            if any(tipo.lower() in natureza.lower() or natureza.lower() in tipo.lower() for tipo in tipos):
                categoria = cat
                break
        
        id_slug = criar_id_slug(natureza)
        nome_clean = natureza.replace("'", "''")
        indicadores_values.append(f"('{id_slug}','{nome_clean}','{categoria}')")

sql_content += ",\n".join(indicadores_values)
sql_content += "\nON CONFLICT (id) DO UPDATE SET nome=EXCLUDED.nome, categoria=EXCLUDED.categoria;\n\n"

# Habilitar RLS
sql_content += """
-- Habilitar RLS
ALTER TABLE public.fact_indicador_mensal_bpma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_resgate_fauna_especie_mensal ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view fact_indicador_mensal_bpma" 
    ON public.fact_indicador_mensal_bpma
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view fact_resgate_fauna_especie_mensal" 
    ON public.fact_resgate_fauna_especie_mensal
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fact_indicador_mensal_bpma" 
    ON public.fact_indicador_mensal_bpma
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fact_resgate_fauna_especie_mensal" 
    ON public.fact_resgate_fauna_especie_mensal
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_fact_indicador_tempo 
    ON public.fact_indicador_mensal_bpma(tempo_id);

CREATE INDEX IF NOT EXISTS idx_fact_resgate_tempo 
    ON public.fact_resgate_fauna_especie_mensal(tempo_id);

CREATE INDEX IF NOT EXISTS idx_fact_resgate_especie 
    ON public.fact_resgate_fauna_especie_mensal(id_especie_fauna);

"""

# Salvar migration
migration_path = os.path.join(output_dir, migration_name)
with open(migration_path, 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f"Migration criada: {migration_path}")
print(f"Tamanho: {len(sql_content)} caracteres")
print(f"Indicadores únicos: {len(tipos_processados)}")

