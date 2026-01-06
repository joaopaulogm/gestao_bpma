import pandas as pd

excel_path = r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx'
xls = pd.ExcelFile(excel_path)

df = pd.read_excel(xls, sheet_name='2025', header=None)

# Verificar linha 58
print("Linha 58:")
print(df.iloc[58].values[:15])
print("\nValores individuais:")
for i in range(min(15, len(df.columns))):
    val = df.iloc[58, i]
    print(f"  Col {i}: {repr(val)} (type: {type(val).__name__})")

# Verificar linhas próximas
print("\n\nLinha 57:")
print(df.iloc[57].values[:15])

print("\n\nLinha 59 (primeira espécie):")
print(df.iloc[59].values[:15])

# Verificar se há "AVES" antes
print("\n\nProcurando 'AVES' antes da linha 58:")
for i in range(50, 59):
    row_str = ' '.join([str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values[:5]])
    if 'AVES' in row_str:
        print(f"Linha {i}: {row_str}")

