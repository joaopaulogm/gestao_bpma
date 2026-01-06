"""
Script para processar Excel de Estatísticas BPMA e gerar tabelas dim e fat no Supabase
"""
import pandas as pd
import sys
import os
from datetime import datetime
import re

excel_path = r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx'

# Mapeamento de meses
MESES = {
    'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
    'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
}

def limpar_nome_cientifico(nome):
    """Limpa e normaliza nome científico"""
    if pd.isna(nome) or nome == '':
        return None
    nome = str(nome).strip()
    # Remove espaços extras
    nome = re.sub(r'\s+', ' ', nome)
    return nome

def limpar_nome_popular(nome):
    """Limpa e normaliza nome popular"""
    if pd.isna(nome) or nome == '':
        return None
    nome = str(nome).strip()
    return nome

def processar_aba_atendimentos(df, ano):
    """Processa dados de atendimentos agregados"""
    dados = []
    
    # Encontrar linha de cabeçalho (NATUREZA / MESES)
    header_row = None
    for i in range(len(df)):
        row_str = ' '.join([str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values])
        if 'NATUREZA' in row_str and 'MESES' in row_str:
            header_row = i
            break
    
    if header_row is None:
        return dados
    
    # Ler cabeçalho de meses
    meses_cols = {}
    for col_idx in range(len(df.columns)):
        val = df.iloc[header_row, col_idx]
        if pd.notna(val):
            mes_str = str(val).strip().upper()
            if mes_str in MESES:
                meses_cols[col_idx] = MESES[mes_str]
    
    # Processar linhas de dados (começando da linha seguinte ao cabeçalho)
    for i in range(header_row + 1, len(df)):
        natureza = df.iloc[i, 0]
        if pd.isna(natureza) or str(natureza).strip() == '':
            continue
        
        natureza = str(natureza).strip()
        
        # Processar valores por mês
        for col_idx, mes_num in meses_cols.items():
            valor = df.iloc[i, col_idx]
            if pd.notna(valor):
                try:
                    quantidade = int(float(valor))
                    if quantidade > 0:
                        dados.append({
                            'ano': ano,
                            'mes': mes_num,
                            'natureza': natureza,
                            'quantidade': quantidade
                        })
                except (ValueError, TypeError):
                    pass
    
    return dados

def processar_aba_resgates(df, ano):
    """Processa dados de resgate por espécie"""
    dados = []
    
    # Procurar seções de espécies (AVES, MAMÍFEROS, RÉPTEIS)
    tipo_fauna = None
    i = 0
    
    while i < len(df):
        row_values = [str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values]
        row_str = ' '.join(row_values)
        
        # Detectar tipo de fauna
        if 'AVES' in row_str and len([x for x in row_values if x.strip()]) <= 2:
            tipo_fauna = 'AVES'
            i += 1
            continue
        elif ('MAMÍFEROS' in row_str or 'MAMIFEROS' in row_str) and len([x for x in row_values if x.strip()]) <= 2:
            tipo_fauna = 'MAMÍFEROS'
            i += 1
            continue
        elif ('RÉPTEIS' in row_str or 'REPTEIS' in row_str or 'RÉPTIL' in row_str or 'REPTIL' in row_str) and len([x for x in row_values if x.strip()]) <= 2:
            tipo_fauna = 'RÉPTEIS'
            i += 1
            continue
        
        # Procurar linha de cabeçalho com NOME POPULAR, NOME CIENTÍFICO (com ou sem acento)
        # Verificar se a primeira coluna tem "NOME POPULAR" e segunda tem algo com "CIENT"
        col0 = str(df.iloc[i, 0]).upper() if pd.notna(df.iloc[i, 0]) and len(df.columns) > 0 else ''
        col1 = str(df.iloc[i, 1]).upper() if pd.notna(df.iloc[i, 1]) and len(df.columns) > 1 else ''
        
        if 'NOME POPULAR' in col0 and 'CIENT' in col1:
            # Esta é a linha de cabeçalho
            header_row = i
            
            # Os meses estão na linha anterior (onde está o tipo de fauna)
            meses_row = i - 1
            meses_cols = {}
            for col_idx in range(3, min(16, len(df.columns))):  # Começar da coluna 3
                val = df.iloc[meses_row, col_idx]
                if pd.notna(val):
                    mes_str = str(val).strip().upper()
                    if mes_str in MESES:
                        meses_cols[col_idx] = MESES[mes_str]
            
            # Processar linhas de espécies (começando da linha seguinte)
            i += 1
            while i < len(df):
                nome_popular = df.iloc[i, 0] if len(df.columns) > 0 else None
                
                # Verificar se é uma linha válida de espécie
                if pd.isna(nome_popular) or str(nome_popular).strip() == '':
                    # Verificar se encontrou outra seção
                    row_check = ' '.join([str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values])
                    if any(x in row_check for x in ['AVES', 'MAMÍFEROS', 'MAMIFEROS', 'RÉPTEIS', 'REPTEIS', 'NOME POPULAR', 'RESGATE']):
                        break
                    i += 1
                    continue
                
                # Filtrar linha de cabeçalho
                nome_popular_upper = str(nome_popular).upper().strip()
                if nome_popular_upper in ['NOME POPULAR', 'NOME CIENTÍFICO', 'NOME CIENTIFICO', 'ORDEM']:
                    i += 1
                    continue
                
                nome_popular = limpar_nome_popular(nome_popular)
                nome_cientifico = df.iloc[i, 1] if len(df.columns) > 1 else None
                nome_cientifico = limpar_nome_cientifico(nome_cientifico)
                ordem = df.iloc[i, 2] if len(df.columns) > 2 else None
                ordem = str(ordem).strip() if pd.notna(ordem) else None
                
                # Processar valores por mês
                for col_idx, mes_num in meses_cols.items():
                    if col_idx < len(df.columns):
                        valor = df.iloc[i, col_idx]
                        if pd.notna(valor):
                            try:
                                quantidade = int(float(valor))
                                if quantidade > 0:
                                    dados.append({
                                        'ano': ano,
                                        'mes': mes_num,
                                        'tipo_fauna': tipo_fauna,
                                        'nome_popular': nome_popular,
                                        'nome_cientifico': nome_cientifico,
                                        'ordem': ordem,
                                        'quantidade': quantidade
                                    })
                            except (ValueError, TypeError):
                                pass
                
                i += 1
        
        i += 1
    
    return dados

def main():
    if not os.path.exists(excel_path):
        print(f"Arquivo não encontrado: {excel_path}")
        sys.exit(1)
    
    try:
        xls = pd.ExcelFile(excel_path)
        print(f"Processando abas: {xls.sheet_names}\n")
        
        todos_atendimentos = []
        todos_resgates = []
        
        for sheet_name in xls.sheet_names:
            ano = int(sheet_name)
            print(f"Processando ano {ano}...")
            
            df = pd.read_excel(xls, sheet_name=sheet_name, header=None)
            
            # Processar atendimentos
            atendimentos = processar_aba_atendimentos(df, ano)
            todos_atendimentos.extend(atendimentos)
            print(f"  - {len(atendimentos)} registros de atendimentos")
            
            # Processar resgates
            resgates = processar_aba_resgates(df, ano)
            todos_resgates.extend(resgates)
            print(f"  - {len(resgates)} registros de resgates")
        
        print(f"\nTotal de atendimentos: {len(todos_atendimentos)}")
        print(f"Total de resgates: {len(todos_resgates)}")
        
        # Salvar dados processados
        df_atendimentos = pd.DataFrame(todos_atendimentos)
        df_resgates = pd.DataFrame(todos_resgates)
        
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed')
        os.makedirs(output_dir, exist_ok=True)
        
        df_atendimentos.to_csv(os.path.join(output_dir, 'atendimentos.csv'), index=False, encoding='utf-8-sig')
        df_resgates.to_csv(os.path.join(output_dir, 'resgates.csv'), index=False, encoding='utf-8-sig')
        
        print(f"\nDados salvos em: {output_dir}")
        
        # Estatísticas
        print("\n=== ESTATÍSTICAS ===")
        print(f"\nAtendimentos por natureza:")
        print(df_atendimentos.groupby('natureza')['quantidade'].sum().sort_values(ascending=False))
        
        if len(df_resgates) > 0:
            print(f"\nResgates por tipo de fauna:")
            print(df_resgates.groupby('tipo_fauna')['quantidade'].sum().sort_values(ascending=False))
        
        if len(df_resgates) > 0:
            print(f"\nTop 10 espécies mais resgatadas:")
            top_especies = df_resgates.groupby(['nome_popular', 'nome_cientifico'])['quantidade'].sum().sort_values(ascending=False).head(10)
            print(top_especies)
        else:
            print("\nNenhum resgate encontrado. Verificando estrutura do Excel...")
            # Debug: mostrar algumas linhas da aba 2025
            df_debug = pd.read_excel(xls, sheet_name='2025', header=None)
            print("\nPrimeiras 100 linhas da aba 2025 procurando por 'NOME POPULAR':")
            for i in range(min(100, len(df_debug))):
                row_str = ' '.join([str(val).upper() if pd.notna(val) else '' for val in df_debug.iloc[i].values[:5]])
                if 'NOME POPULAR' in row_str or 'NOME CIENT' in row_str:
                    print(f"Linha {i}: {row_str}")
                    print(f"  Valores: {list(df_debug.iloc[i].values[:10])}")
        
    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

