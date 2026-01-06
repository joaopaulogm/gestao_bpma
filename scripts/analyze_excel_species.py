import pandas as pd
import sys
import os

excel_path = r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx'

if not os.path.exists(excel_path):
    print(f"Arquivo não encontrado: {excel_path}")
    sys.exit(1)

try:
    xls = pd.ExcelFile(excel_path)
    
    # Analisar a aba 2025 completamente
    sheet = '2025'
    print(f"\n{'='*80}")
    print(f"ANÁLISE COMPLETA DA ABA: {sheet}")
    print(f"{'='*80}")
    
    df = pd.read_excel(xls, sheet_name=sheet, header=None)
    
    # Procurar seções específicas
    print("\nProcurando seções de dados...")
    
    # Procurar por "ESPÉCIE" ou "REGIÃO"
    for i in range(len(df)):
        row_values = [str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values]
        row_str = ' '.join(row_values)
        
        if any(keyword in row_str for keyword in ['ESPÉCIE', 'ESPECIE', 'REGIÃO', 'REGIAO', 'ADMINISTRATIVA', 'NOME CIENTÍFICO', 'NOME CIENTIFICO']):
            print(f"\n{'='*60}")
            print(f"SEÇÃO ENCONTRADA na linha {i}:")
            print(f"{'='*60}")
            # Mostrar 20 linhas a partir desta
            for j in range(i, min(i+20, len(df))):
                row_data = [str(val)[:40] if pd.notna(val) else '' for val in df.iloc[j].values[:12]]
                print(f"Linha {j}: {' | '.join(row_data)}")
            print()
    
    # Mostrar todas as linhas não vazias para entender a estrutura
    print("\n\nTodas as linhas não vazias (primeiras 100):")
    count = 0
    for i in range(len(df)):
        row_values = [val for val in df.iloc[i].values if pd.notna(val)]
        if row_values:
            row_data = [str(val)[:50] if pd.notna(val) else '' for val in df.iloc[i].values[:10]]
            print(f"Linha {i}: {' | '.join(row_data)}")
            count += 1
            if count >= 100:
                break
    
except Exception as e:
    print(f"Erro ao ler Excel: {e}")
    import traceback
    traceback.print_exc()

