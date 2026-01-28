"""
Script de teste para verificar conexão e leitura do arquivo Excel
"""
import pandas as pd
import sys
import os
from dotenv import load_dotenv
import requests

# Carregar variáveis de ambiente
load_dotenv()

print("=" * 60)
print("TESTE DE CONEXÃO E LEITURA")
print("=" * 60)

# Teste 1: Verificar variáveis de ambiente
print("\n1. Verificando variáveis de ambiente...")
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or 
    os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY') or 
    os.getenv('VITE_SUPABASE_ANON_KEY')
)

if SUPABASE_URL:
    print(f"  [OK] VITE_SUPABASE_URL: {SUPABASE_URL[:30]}...")
else:
    print("  [ERRO] VITE_SUPABASE_URL nao encontrada")

if SUPABASE_KEY:
    print(f"  [OK] SUPABASE_KEY: {SUPABASE_KEY[:30]}...")
    if SUPABASE_KEY.count('.') >= 2:
        print("  [OK] Chave parece completa (tem 3 partes JWT)")
    else:
        print("  [AVISO] Chave pode estar incompleta")
else:
    print("  [ERRO] SUPABASE_KEY nao encontrada")

# Teste 2: Verificar arquivo Excel
print("\n2. Verificando arquivo Excel...")
EXCEL_PATH = r'G:\Meu Drive\JP\app BPMA\AFASTAMENTOS BPMA [2026] (1).xlsx'
if os.path.exists(EXCEL_PATH):
    print(f"  [OK] Arquivo encontrado: {EXCEL_PATH}")
    file_size = os.path.getsize(EXCEL_PATH)
    print(f"  [OK] Tamanho: {file_size / 1024 / 1024:.2f} MB")
else:
    print(f"  [ERRO] Arquivo nao encontrado: {EXCEL_PATH}")
    sys.exit(1)

# Teste 3: Tentar ler arquivo Excel (com timeout)
print("\n3. Tentando ler arquivo Excel...")
try:
    print("  Lendo arquivo (pode demorar alguns segundos)...")
    df = pd.read_excel(EXCEL_PATH, sheet_name='02 | FÉRIAS 2026 PRAÇAS', header=None, nrows=10)
    print(f"  [OK] Arquivo lido com sucesso!")
    print(f"  [OK] Dimensoes (primeiras 10 linhas): {df.shape}")
except Exception as e:
    print(f"  [ERRO] Erro ao ler arquivo: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 4: Testar conexão com Supabase
print("\n4. Testando conexão com Supabase...")
if SUPABASE_URL and SUPABASE_KEY:
    POSTGREST_URL = f"{SUPABASE_URL}/rest/v1"
    HEADERS = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    
    try:
        print("  Fazendo requisição de teste...")
        response = requests.get(
            f"{POSTGREST_URL}/dim_efetivo",
            headers=HEADERS,
            params={'select': 'id', 'limit': '1'},
            timeout=10
        )
        print(f"  Status HTTP: {response.status_code}")
        if response.status_code == 200:
            print("  [OK] Conexao com Supabase OK")
        elif response.status_code == 401:
            print("  [ERRO] Erro de autenticacao (chave invalida)")
            print(f"  Resposta: {response.text[:200]}")
        else:
            print(f"  [AVISO] Status inesperado: {response.status_code}")
            print(f"  Resposta: {response.text[:200]}")
    except requests.exceptions.Timeout:
        print("  [ERRO] Timeout ao conectar com Supabase")
    except Exception as e:
        print(f"  [ERRO] Erro ao conectar: {e}")
else:
    print("  [AVISO] Pulando teste de conexao (variaveis nao configuradas)")

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)
