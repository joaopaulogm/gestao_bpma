"""
Script para gerar tabelas dim e fat e scripts SQL de inserção
"""
import pandas as pd
import os
from datetime import datetime

# Caminhos
base_dir = os.path.dirname(os.path.dirname(__file__))  # Voltar para raiz do projeto
data_dir = os.path.join(base_dir, 'data', 'processed')
output_dir = os.path.join(base_dir, 'supabase', 'migrations')

os.makedirs(output_dir, exist_ok=True)

# Ler dados processados
df_atendimentos = pd.read_csv(os.path.join(data_dir, 'atendimentos.csv'))
df_resgates = pd.read_csv(os.path.join(data_dir, 'resgates.csv'))

# Gerar timestamp para nome da migration
timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
migration_name = f"{timestamp}_criar_tabelas_estatisticas_bpma.sql"

sql_content = f"""-- ============================================
-- TABELAS DIM E FAT PARA ESTATÍSTICAS BPMA (2020-2025)
-- ============================================
-- Dados extraídos de: Resumos Estatísticas 2025 a 2020.xlsx
-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- ============================================

-- 1. TABELAS DIMENSÃO
-- ============================================

-- Dimensão: Ano
CREATE TABLE IF NOT EXISTS public.dim_ano (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ano integer NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Mês
CREATE TABLE IF NOT EXISTS public.dim_mes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mes integer NOT NULL UNIQUE CHECK (mes >= 1 AND mes <= 12),
    nome text NOT NULL,
    abreviacao text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Tipo de Atendimento
CREATE TABLE IF NOT EXISTS public.dim_tipo_atendimento (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Dimensão: Tipo de Fauna (para estatísticas)
CREATE TABLE IF NOT EXISTS public.dim_tipo_fauna_estatistica (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Popular dim_mes
INSERT INTO public.dim_mes (mes, nome, abreviacao) VALUES
    (1, 'Janeiro', 'JAN'),
    (2, 'Fevereiro', 'FEV'),
    (3, 'Março', 'MAR'),
    (4, 'Abril', 'ABR'),
    (5, 'Maio', 'MAI'),
    (6, 'Junho', 'JUN'),
    (7, 'Julho', 'JUL'),
    (8, 'Agosto', 'AGO'),
    (9, 'Setembro', 'SET'),
    (10, 'Outubro', 'OUT'),
    (11, 'Novembro', 'NOV'),
    (12, 'Dezembro', 'DEZ')
ON CONFLICT (mes) DO NOTHING;

-- Popular dim_ano
INSERT INTO public.dim_ano (ano) VALUES
    (2020), (2021), (2022), (2023), (2024), (2025)
ON CONFLICT (ano) DO NOTHING;

-- Popular dim_tipo_fauna_estatistica
INSERT INTO public.dim_tipo_fauna_estatistica (nome) VALUES
    ('AVES'),
    ('MAMÍFEROS'),
    ('RÉPTEIS')
ON CONFLICT (nome) DO NOTHING;

-- Popular dim_tipo_atendimento com dados únicos
"""

# Adicionar tipos de atendimento únicos
tipos_atendimento = df_atendimentos['natureza'].unique()
sql_content += "\n-- Tipos de atendimento extraídos dos dados\n"
for tipo in sorted(tipos_atendimento):
    if pd.notna(tipo) and str(tipo).strip():
        tipo_clean = str(tipo).strip().replace("'", "''")
        sql_content += f"INSERT INTO public.dim_tipo_atendimento (nome) VALUES ('{tipo_clean}')\n"
        sql_content += "ON CONFLICT (nome) DO NOTHING;\n"

sql_content += """
-- 2. TABELAS FATO
-- ============================================

-- Tabela fato: Atendimentos Agregados
CREATE TABLE IF NOT EXISTS public.fat_atendimentos_estatisticas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    
    ano_id uuid REFERENCES public.dim_ano(id),
    mes_id uuid REFERENCES public.dim_mes(id),
    tipo_atendimento_id uuid REFERENCES public.dim_tipo_atendimento(id),
    
    quantidade integer NOT NULL DEFAULT 0,
    
    UNIQUE(ano_id, mes_id, tipo_atendimento_id)
);

-- Tabela fato: Resgates por Espécie
CREATE TABLE IF NOT EXISTS public.fat_resgates_estatisticas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    
    ano_id uuid REFERENCES public.dim_ano(id),
    mes_id uuid REFERENCES public.dim_mes(id),
    tipo_fauna_id uuid REFERENCES public.dim_tipo_fauna_estatistica(id),
    especie_id uuid REFERENCES public.dim_especies_fauna(id),
    
    nome_popular text,
    nome_cientifico text,
    ordem_taxonomica text,
    quantidade integer NOT NULL DEFAULT 0,
    
    -- Índice para melhorar performance
    UNIQUE(ano_id, mes_id, especie_id, tipo_fauna_id)
);

-- Habilitar RLS
ALTER TABLE public.fat_atendimentos_estatisticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_estatisticas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view fat_atendimentos_estatisticas" 
    ON public.fat_atendimentos_estatisticas
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view fat_resgates_estatisticas" 
    ON public.fat_resgates_estatisticas
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage fat_atendimentos_estatisticas" 
    ON public.fat_atendimentos_estatisticas
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage fat_resgates_estatisticas" 
    ON public.fat_resgates_estatisticas
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fat_atendimentos_ano_mes 
    ON public.fat_atendimentos_estatisticas(ano_id, mes_id);

CREATE INDEX IF NOT EXISTS idx_fat_resgates_ano_mes 
    ON public.fat_resgates_estatisticas(ano_id, mes_id);

CREATE INDEX IF NOT EXISTS idx_fat_resgates_especie 
    ON public.fat_resgates_estatisticas(especie_id);

"""

# Salvar migration
migration_path = os.path.join(output_dir, migration_name)
with open(migration_path, 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f"Migration criada: {migration_path}")
print(f"Tamanho: {len(sql_content)} caracteres")

