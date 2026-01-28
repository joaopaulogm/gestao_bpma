"""
Script de teste para verificar se a conexão com Supabase está funcionando
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERRO: Variáveis de ambiente não encontradas!")
    exit(1)

POSTGREST_URL = f"{SUPABASE_URL}/rest/v1"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Testar busca de algumas matrículas
matriculas_teste = ['1999176', '739820', '7361580']

print(f"Testando conexão com Supabase...")
print(f"URL: {POSTGREST_URL}")
print(f"\nTestando busca de matrículas:")

for matricula in matriculas_teste:
    print(f"\nMatrícula: {matricula}")
    
    # Tentar formato original
    url = f"{POSTGREST_URL}/dim_efetivo"
    params = {
        'matricula': f'eq.{matricula}',
        'select': 'id,matricula',
        'limit': '1'
    }
    
    try:
        response = requests.get(url, headers=HEADERS, params=params)
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"  [ENCONTRADO] ID: {data[0].get('id')}, Matrícula: {data[0].get('matricula')}")
            else:
                print(f"  [NAO ENCONTRADO] Nenhum resultado")
    except Exception as e:
        print(f"  [ERRO] {e}")

# Testar buscar algumas matrículas que existem no banco
print(f"\n\nBuscando algumas matrículas do banco para ver o formato...")
url = f"{POSTGREST_URL}/dim_efetivo"
params = {
    'select': 'id,matricula',
    'limit': '10',
    'order': 'matricula'
}

try:
    response = requests.get(url, headers=HEADERS, params=params)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response text (primeiros 500 chars): {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nTotal de registros retornados: {len(data)}")
        if data:
            print(f"Primeiras {min(10, len(data))} matrículas no banco:")
            for item in data:
                print(f"  ID: {item.get('id')}, Matrícula: '{item.get('matricula')}'")
        else:
            print("Nenhum registro retornado. Pode ser problema de RLS ou tabela vazia.")
    else:
        print(f"Erro HTTP {response.status_code}: {response.text}")
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
