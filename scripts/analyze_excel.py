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
    
    for sheet in xls.sheet_names:
        print(f"\n{'='*80}")
        print(f"ABA: {sheet}")
        print(f"{'='*80}")
        df = pd.read_excel(xls, sheet_name=sheet, nrows=10)
        print(f"\nColunas ({len(df.columns)}):")
        for i, col in enumerate(df.columns, 1):
            print(f"  {i}. {col}")
        print(f"\nPrimeiras 5 linhas:")
        print(df.to_string())
        print(f"\nTipos de dados:")
        print(df.dtypes)
        print(f"\nValores únicos nas primeiras colunas:")
        for col in df.columns[:5]:
            unique_vals = df[col].dropna().unique()[:10]
            print(f"  {col}: {len(unique_vals)} valores únicos - {list(unique_vals)}")
        
except Exception as e:
    print(f"Erro ao ler Excel: {e}")
    import traceback
    traceback.print_exc()

