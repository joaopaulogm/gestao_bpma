import pandas as pd
import sys
import os

excel_path = r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx'

if not os.path.exists(excel_path):
    print(f"Arquivo não encontrado: {excel_path}")
    sys.exit(1)

try:
    xls = pd.ExcelFile(excel_path)
    print(f"Abas encontradas: {xls.sheet_names}\n")
    
    # Analisar uma aba completa para entender a estrutura
    sheet = '2025'
    print(f"\n{'='*80}")
    print(f"ANÁLISE COMPLETA DA ABA: {sheet}")
    print(f"{'='*80}")
    
    df = pd.read_excel(xls, sheet_name=sheet, header=None)
    print(f"\nTotal de linhas: {len(df)}")
    print(f"Total de colunas: {len(df.columns)}")
    
    # Procurar por linhas com dados relevantes
    print("\nPrimeiras 30 linhas:")
    for i in range(min(30, len(df))):
        row_data = [str(val)[:50] if pd.notna(val) else 'NaN' for val in df.iloc[i].values[:10]]
        print(f"Linha {i}: {' | '.join(row_data)}")
    
    # Procurar por padrões de espécies ou regiões
    print("\n\nProcurando por padrões de espécies ou regiões administrativas...")
    for i in range(len(df)):
        row_str = ' '.join([str(val) for val in df.iloc[i].values if pd.notna(val)])
        if any(keyword in row_str.upper() for keyword in ['ESPÉCIE', 'ESPECIE', 'REGIAO', 'REGIÃO', 'FAUNA', 'ANIMAL']):
            print(f"\nLinha {i} (possível cabeçalho de dados):")
            print(df.iloc[i].values[:15])
            if i < len(df) - 1:
                print(f"Linha {i+1} (primeira linha de dados):")
                print(df.iloc[i+1].values[:15])
            break
    
except Exception as e:
    print(f"Erro ao ler Excel: {e}")
    import traceback
    traceback.print_exc()

