"""
Script para importar dados de férias 2026 do arquivo Excel
Extrai dados da aba "02 | FÉRIAS 2026 PRAÇAS" e atualiza fat_ferias e fat_ferias_parcelas
"""
import pandas as pd
import sys
import os
from datetime import datetime
import re
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não encontradas!")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Caminho do arquivo Excel
EXCEL_PATH = r'G:\Meu Drive\JP\app BPMA\AFASTAMENTOS BPMA [2026] (1).xlsx'
ABA_NOME = '02 | FÉRIAS 2026 PRAÇAS'

# Mapeamento de meses
MESES_ABREV = {
    'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
    'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
}

def parse_date(date_str, ano_base=2026):
    """Converte string de data para objeto date"""
    if pd.isna(date_str) or date_str == '':
        return None
    
    date_str = str(date_str).strip()
    
    # Formato DD/MM ou DD/MM/YYYY
    if '/' in date_str:
        parts = date_str.split('/')
        if len(parts) == 2:
            dia, mes = int(parts[0]), int(parts[1])
            return datetime(ano_base, mes, dia).date()
        elif len(parts) == 3:
            dia, mes, ano = int(parts[0]), int(parts[1]), int(parts[2])
            return datetime(ano, mes, dia).date()
    
    # Formato apenas mês (ex: "JAN", "FEV")
    if date_str.upper() in MESES_ABREV:
        # Retorna primeiro dia do mês
        return datetime(ano_base, MESES_ABREV[date_str.upper()], 1).date()
    
    return None

def parse_mes(mes_str):
    """Converte string de mês para número"""
    if pd.isna(mes_str) or mes_str == '':
        return None
    
    mes_str = str(mes_str).strip().upper()
    
    if mes_str in MESES_ABREV:
        return MESES_ABREV[mes_str]
    
    # Tentar parsear como número
    try:
        mes_num = int(mes_str)
        if 1 <= mes_num <= 12:
            return mes_num
    except:
        pass
    
    return None

def get_efetivo_id_by_matricula(matricula):
    """Busca efetivo_id pela matrícula"""
    if pd.isna(matricula) or matricula == '':
        return None
    
    matricula = str(matricula).strip()
    
    try:
        result = supabase.table('dim_efetivo').select('id').eq('matricula', matricula).limit(1).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]['id']
    except Exception as e:
        print(f"Erro ao buscar matrícula {matricula}: {e}")
    
    return None

def processar_ferias_excel():
    """Processa o arquivo Excel e importa dados de férias"""
    
    print(f"Lendo arquivo Excel: {EXCEL_PATH}")
    print(f"Aba: {ABA_NOME}")
    
    try:
        # Ler a aba específica
        df = pd.read_excel(EXCEL_PATH, sheet_name=ABA_NOME, header=None)
        print(f"Arquivo lido com sucesso. Dimensões: {df.shape}")
        
        # Encontrar linha de cabeçalho (procurar por "MATRÍCULA" ou "MATRICULA")
        header_row = None
        for i in range(min(20, len(df))):
            row_str = ' '.join([str(val).upper() if pd.notna(val) else '' for val in df.iloc[i].values])
            if 'MATR' in row_str or 'Q' in row_str:
                header_row = i
                break
        
        if header_row is None:
            print("ERRO: Não foi possível encontrar a linha de cabeçalho!")
            return
        
        print(f"Linha de cabeçalho encontrada: {header_row + 1}")
        
        # Mapear colunas conforme legenda fornecida
        # Coluna Q = Matrícula (índice 16, 0-based)
        # Coluna R = Graduação/Posto (índice 17)
        # Coluna T = Nome Completo (índice 19)
        # Coluna V = UPM (índice 21)
        # Coluna W = Ano de referência (índice 22)
        # Coluna X = Ano a ser gozada (índice 23)
        # Coluna Y = Número do processo SEI (índice 24)
        
        # Parcelas:
        # 1ª parcela: Z (dias), AA (início), AB (término), AC (livro), AD (SGPOL), AE (Campanha)
        # 2ª parcela: AF (dias), AG (início), AH (término), AI (livro), AJ (SGPOL), AK (Campanha)
        # 3ª parcela: AL (dias), AM (início), AN (término), AO (livro), AP (SGPOL), AQ (Campanha)
        
        COL_MATRICULA = 16  # Q
        COL_POSTO = 17      # R
        COL_NOME = 19       # T
        COL_UPM = 21        # V
        COL_ANO_REF = 22    # W
        COL_ANO_GOZADA = 23 # X
        COL_PROCESSO_SEI = 24 # Y
        
        # 1ª parcela
        COL_P1_DIAS = 25    # Z
        COL_P1_INICIO = 26  # AA
        COL_P1_TERMINO = 27 # AB
        COL_P1_LIVRO = 28   # AC
        COL_P1_SGPOL = 29   # AD
        COL_P1_CAMPANHA = 30 # AE
        
        # 2ª parcela
        COL_P2_DIAS = 31    # AF
        COL_P2_INICIO = 32  # AG
        COL_P2_TERMINO = 33 # AH
        COL_P2_LIVRO = 34   # AI
        COL_P2_SGPOL = 35   # AJ
        COL_P2_CAMPANHA = 36 # AK
        
        # 3ª parcela
        COL_P3_DIAS = 37    # AL
        COL_P3_INICIO = 38  # AM
        COL_P3_TERMINO = 39 # AN
        COL_P3_LIVRO = 40   # AO
        COL_P3_SGPOL = 41   # AP
        COL_P3_CAMPANHA = 42 # AQ
        
        registros_processados = 0
        registros_inseridos = 0
        erros = []
        
        # Processar cada linha de dados (começar após o cabeçalho)
        for idx in range(header_row + 1, len(df)):
            row = df.iloc[idx]
            
            # Verificar se há matrícula (coluna Q)
            matricula = row.iloc[COL_MATRICULA] if COL_MATRICULA < len(row) else None
            
            if pd.isna(matricula) or str(matricula).strip() == '':
                continue
            
            matricula = str(matricula).strip()
            
            # Buscar efetivo_id
            efetivo_id = get_efetivo_id_by_matricula(matricula)
            if not efetivo_id:
                erros.append(f"Matrícula {matricula} não encontrada no banco")
                continue
            
            # Ler dados básicos
            ano_gozada = int(row.iloc[COL_ANO_GOZADA]) if COL_ANO_GOZADA < len(row) and not pd.isna(row.iloc[COL_ANO_GOZADA]) else 2026
            processo_sei = str(row.iloc[COL_PROCESSO_SEI]).strip() if COL_PROCESSO_SEI < len(row) and not pd.isna(row.iloc[COL_PROCESSO_SEI]) else None
            
            # Processar parcelas
            parcelas = []
            
            # 1ª parcela
            p1_dias = row.iloc[COL_P1_DIAS] if COL_P1_DIAS < len(row) and not pd.isna(row.iloc[COL_P1_DIAS]) else None
            if p1_dias and p1_dias > 0:
                p1_inicio = parse_date(row.iloc[COL_P1_INICIO] if COL_P1_INICIO < len(row) else None, ano_gozada)
                p1_termino = parse_date(row.iloc[COL_P1_TERMINO] if COL_P1_TERMINO < len(row) else None, ano_gozada)
                p1_mes = parse_mes(row.iloc[COL_P1_INICIO] if COL_P1_INICIO < len(row) else None)
                
                parcelas.append({
                    'parcela_num': 1,
                    'dias': int(p1_dias),
                    'data_inicio': p1_inicio.isoformat() if p1_inicio else None,
                    'data_fim': p1_termino.isoformat() if p1_termino else None,
                    'mes': p1_mes,
                    'lancado_livro': bool(row.iloc[COL_P1_LIVRO] if COL_P1_LIVRO < len(row) and not pd.isna(row.iloc[COL_P1_LIVRO]) else False),
                    'lancado_sgpol': bool(row.iloc[COL_P1_SGPOL] if COL_P1_SGPOL < len(row) and not pd.isna(row.iloc[COL_P1_SGPOL]) else False),
                    'lancado_campanha': bool(row.iloc[COL_P1_CAMPANHA] if COL_P1_CAMPANHA < len(row) and not pd.isna(row.iloc[COL_P1_CAMPANHA]) else False)
                })
            
            # 2ª parcela
            p2_dias = row.iloc[COL_P2_DIAS] if COL_P2_DIAS < len(row) and not pd.isna(row.iloc[COL_P2_DIAS]) else None
            if p2_dias and p2_dias > 0:
                p2_inicio = parse_date(row.iloc[COL_P2_INICIO] if COL_P2_INICIO < len(row) else None, ano_gozada)
                p2_termino = parse_date(row.iloc[COL_P2_TERMINO] if COL_P2_TERMINO < len(row) else None, ano_gozada)
                p2_mes = parse_mes(row.iloc[COL_P2_INICIO] if COL_P2_INICIO < len(row) else None)
                
                parcelas.append({
                    'parcela_num': 2,
                    'dias': int(p2_dias),
                    'data_inicio': p2_inicio.isoformat() if p2_inicio else None,
                    'data_fim': p2_termino.isoformat() if p2_termino else None,
                    'mes': p2_mes,
                    'lancado_livro': bool(row.iloc[COL_P2_LIVRO] if COL_P2_LIVRO < len(row) and not pd.isna(row.iloc[COL_P2_LIVRO]) else False),
                    'lancado_sgpol': bool(row.iloc[COL_P2_SGPOL] if COL_P2_SGPOL < len(row) and not pd.isna(row.iloc[COL_P2_SGPOL]) else False),
                    'lancado_campanha': bool(row.iloc[COL_P2_CAMPANHA] if COL_P2_CAMPANHA < len(row) and not pd.isna(row.iloc[COL_P2_CAMPANHA]) else False)
                })
            
            # 3ª parcela
            p3_dias = row.iloc[COL_P3_DIAS] if COL_P3_DIAS < len(row) and not pd.isna(row.iloc[COL_P3_DIAS]) else None
            if p3_dias and p3_dias > 0:
                p3_inicio = parse_date(row.iloc[COL_P3_INICIO] if COL_P3_INICIO < len(row) else None, ano_gozada)
                p3_termino = parse_date(row.iloc[COL_P3_TERMINO] if COL_P3_TERMINO < len(row) else None, ano_gozada)
                p3_mes = parse_mes(row.iloc[COL_P3_INICIO] if COL_P3_INICIO < len(row) else None)
                
                parcelas.append({
                    'parcela_num': 3,
                    'dias': int(p3_dias),
                    'data_inicio': p3_inicio.isoformat() if p3_inicio else None,
                    'data_fim': p3_termino.isoformat() if p3_termino else None,
                    'mes': p3_mes,
                    'lancado_livro': bool(row.iloc[COL_P3_LIVRO] if COL_P3_LIVRO < len(row) and not pd.isna(row.iloc[COL_P3_LIVRO]) else False),
                    'lancado_sgpol': bool(row.iloc[COL_P3_SGPOL] if COL_P3_SGPOL < len(row) and not pd.isna(row.iloc[COL_P3_SGPOL]) else False),
                    'lancado_campanha': bool(row.iloc[COL_P3_CAMPANHA] if COL_P3_CAMPANHA < len(row) and not pd.isna(row.iloc[COL_P3_CAMPANHA]) else False)
                })
            
            if not parcelas:
                continue
            
            # Calcular totais
            total_dias = sum(p['dias'] for p in parcelas)
            tipo = 'INTEGRAL' if len(parcelas) == 1 and total_dias == 30 else 'PARCELADA'
            
            # Determinar mes_inicio (primeira parcela)
            mes_inicio = parcelas[0]['mes'] if parcelas[0]['mes'] else None
            if not mes_inicio and parcelas[0]['data_inicio']:
                mes_inicio = datetime.fromisoformat(parcelas[0]['data_inicio']).month
            
            # Inserir/atualizar fat_ferias
            try:
                # Verificar se já existe registro para este efetivo e ano
                existing = supabase.table('fat_ferias').select('id').eq('efetivo_id', efetivo_id).eq('ano', ano_gozada).limit(1).execute()
                
                if existing.data and len(existing.data) > 0:
                    ferias_id = existing.data[0]['id']
                    # Atualizar
                    update_data = {
                        'mes_inicio': mes_inicio,
                        'dias': total_dias,
                        'tipo': tipo,
                        'minuta_data_inicio': parcelas[0]['data_inicio'],
                        'minuta_data_fim': parcelas[-1]['data_fim']
                    }
                    if processo_sei:
                        update_data['numero_processo_sei'] = processo_sei
                    
                    supabase.table('fat_ferias').update(update_data).eq('id', ferias_id).execute()
                else:
                    # Inserir novo
                    insert_data = {
                        'efetivo_id': efetivo_id,
                        'ano': ano_gozada,
                        'mes_inicio': mes_inicio,
                        'dias': total_dias,
                        'tipo': tipo,
                        'minuta_data_inicio': parcelas[0]['data_inicio'],
                        'minuta_data_fim': parcelas[-1]['data_fim']
                    }
                    if processo_sei:
                        insert_data['numero_processo_sei'] = processo_sei
                    
                    result = supabase.table('fat_ferias').insert(insert_data).execute()
                    ferias_id = result.data[0]['id'] if result.data else None
                
                if not ferias_id:
                    erros.append(f"Erro ao inserir/atualizar férias para matrícula {matricula}")
                    continue
                
                # Inserir/atualizar parcelas
                for parcela in parcelas:
                    parcela_data = {
                        'fat_ferias_id': ferias_id,
                        'parcela_num': parcela['parcela_num'],
                        'dias': parcela['dias'],
                        'data_inicio': parcela['data_inicio'],
                        'data_fim': parcela['data_fim'],
                        'mes': str(parcela['mes']) if parcela['mes'] else None,
                        'lancado_livro': parcela['lancado_livro'],
                        'lancado_sgpol': parcela['lancado_sgpol'],
                        'lancado_campanha': parcela['lancado_campanha']
                    }
                    
                    # Verificar se parcela já existe
                    existing_parcela = supabase.table('fat_ferias_parcelas').select('fat_ferias_id').eq('fat_ferias_id', ferias_id).eq('parcela_num', parcela['parcela_num']).limit(1).execute()
                    
                    if existing_parcela.data and len(existing_parcela.data) > 0:
                        supabase.table('fat_ferias_parcelas').update(parcela_data).eq('fat_ferias_id', ferias_id).eq('parcela_num', parcela['parcela_num']).execute()
                    else:
                        supabase.table('fat_ferias_parcelas').insert(parcela_data).execute()
                
                registros_inseridos += 1
                registros_processados += 1
                
                if registros_processados % 10 == 0:
                    print(f"Processados {registros_processados} registros...")
                    
            except Exception as e:
                erros.append(f"Erro ao processar matrícula {matricula}: {str(e)}")
                print(f"ERRO ao processar {matricula}: {e}")
        
        print(f"\n{'='*60}")
        print(f"Processamento concluído!")
        print(f"Registros processados: {registros_processados}")
        print(f"Registros inseridos/atualizados: {registros_inseridos}")
        print(f"Erros: {len(erros)}")
        
        if erros:
            print(f"\nPrimeiros 10 erros:")
            for erro in erros[:10]:
                print(f"  - {erro}")
        
    except Exception as e:
        print(f"ERRO ao processar arquivo Excel: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    processar_ferias_excel()
