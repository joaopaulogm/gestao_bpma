"""
Script de teste para verificar se a conexão com Supabase está funcionando
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
# Tentar service_role primeiro, senão usar anon_key
SUPABASE_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or 
    os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY') or 
    os.getenv('VITE_SUPABASE_ANON_KEY')
)

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

if os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY'):
    print("Usando SUPABASE_SERVICE_ROLE_KEY (acesso completo)")
else:
    print("Usando VITE_SUPABASE_ANON_KEY (pode ter limitações de RLS)")

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

# Tentar com service_role se disponível
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
if SUPABASE_SERVICE_ROLE_KEY:
    print("Usando SUPABASE_SERVICE_ROLE_KEY para busca...")
    SERVICE_HEADERS = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    test_headers = SERVICE_HEADERS
else:
    print("Usando VITE_SUPABASE_ANON_KEY (pode ter limitações de RLS)...")
    test_headers = HEADERS

url = f"{POSTGREST_URL}/dim_efetivo"
params = {
    'select': 'id,matricula',
    'limit': '20',
    'order': 'matricula'
}

try:
    response = requests.get(url, headers=test_headers, params=params)
    print(f"Status: {response.status_code}")
    print(f"Response text (primeiros 500 chars): {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nTotal de registros retornados: {len(data)}")
        if data:
            print(f"\nPrimeiras {min(20, len(data))} matrículas no banco:")
            for item in data:
                matricula = item.get('matricula')
                print(f"  Matrícula: '{matricula}' (tipo: {type(matricula).__name__}, len: {len(str(matricula))})")
            
            # Testar busca de uma matrícula específica do Excel
            print(f"\n\nTestando busca de matrículas do Excel:")
            matriculas_teste_excel = ['1999176', '739820', '7361580']
            for matricula_teste in matriculas_teste_excel:
                # Tentar busca exata
                params_exata = {
                    'matricula': f'eq.{matricula_teste}',
                    'select': 'id,matricula',
                    'limit': '1'
                }
                response_exata = requests.get(url, headers=test_headers, params=params_exata)
                if response_exata.status_code == 200:
                    data_exata = response_exata.json()
                    if data_exata:
                        print(f"  ✓ '{matricula_teste}' encontrada: {data_exata[0].get('matricula')}")
                    else:
                        print(f"  ✗ '{matricula_teste}' não encontrada (busca exata)")
                else:
                    print(f"  ✗ Erro ao buscar '{matricula_teste}': {response_exata.status_code}")
        else:
            print("Nenhum registro retornado. Pode ser problema de RLS ou tabela vazia.")
    else:
        print(f"Erro HTTP {response.status_code}: {response.text}")
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
