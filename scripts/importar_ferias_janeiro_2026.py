"""
Importa datas de inicio e termino de ferias planejadas
e atualiza fat_ferias e fat_ferias_parcelas.
"""
import os
import sys
from datetime import datetime
import unicodedata

import pandas as pd
from dotenv import load_dotenv
import requests

# Carregar variaveis de ambiente
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("VITE_SUPABASE_ANON_KEY")
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERRO: Variaveis de ambiente do Supabase nao encontradas.")
    print("Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env")
    sys.exit(1)

POSTGREST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def supabase_query(table, method="GET", filters=None, data=None):
    url = f"{POSTGREST_URL}/{table}"
    timeout = 20
    if method == "GET":
        params = filters or {}
        response = requests.get(url, headers=HEADERS, params=params, timeout=timeout)
    elif method == "POST":
        response = requests.post(url, headers=HEADERS, json=data, timeout=timeout)
    elif method == "PATCH":
        params = filters or {}
        response = requests.patch(url, headers=HEADERS, params=params, json=data, timeout=timeout)
    else:
        raise ValueError(f"Metodo HTTP nao suportado: {method}")

    if response.status_code >= 400:
        raise Exception(f"Erro {response.status_code}: {response.text}")
    return response.json() if response.text else []


def normalize_text(value):
    if value is None:
        return ""
    text = str(value).strip().upper()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in text)
    text = " ".join(text.split())
    return text


def is_valid_matricula(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return False
    text = str(value).strip()
    if not text:
        return False
    ignore = {
        "JANEIRO",
        "MAT",
        "MATRICULA",
        "MATRICULA ",
        "MATRICULA:",
        "NAN",
    }
    if normalize_text(text) in ignore:
        return False
    cleaned = text.replace("X", "").replace("x", "").replace("-", "").replace(".", "").replace(" ", "")
    return cleaned.isdigit() and len(cleaned) >= 4


def find_header_row(df):
    scan_rows = min(30, len(df))
    for row_idx in range(scan_rows):
        row_vals = [normalize_text(v) for v in df.iloc[row_idx].tolist()]
        if any(v.startswith("MAT") for v in row_vals):
            return row_idx, row_vals
    return None, []


def find_col_index(values, matcher):
    for idx, val in enumerate(values):
        if matcher(val):
            return idx
    return None


def find_subheader_row(df, header_row):
    scan_limit = min(header_row + 12, len(df))
    for row_idx in range(header_row + 1, scan_limit):
        row_vals = [normalize_text(v) for v in df.iloc[row_idx].tolist()]
        if any("INICIO" in v or v.startswith("INI") for v in row_vals) or any(
            "TERMINO" in v or v.startswith("TER") for v in row_vals
        ):
            return row_idx, row_vals
    return None, []


def find_date_columns_in_values(values):
    col_inicio = find_col_index(values, lambda v: "INICIO" in v or v.startswith("INI"))
    col_termino = find_col_index(values, lambda v: "TERMINO" in v or v.startswith("TERM") or v.startswith("TER"))
    return col_inicio, col_termino


def parse_date(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value.date()
    dt = pd.to_datetime(value, errors="coerce")
    return dt.date() if not pd.isna(dt) else None


def get_efetivo_id_by_matricula(matricula, cache):
    matricula = str(matricula).strip()
    if matricula in cache:
        return cache[matricula]

    formatos = list(dict.fromkeys([matricula, matricula.lstrip("0")]))
    for fmt in formatos:
        result = supabase_query(
            "dim_efetivo",
            method="GET",
            filters={"matricula": f"eq.{fmt}", "select": "id", "limit": "1"},
        )
        if result:
            efetivo_id = result[0]["id"]
            cache[matricula] = efetivo_id
            return efetivo_id

    cache[matricula] = None
    return None


def processar():
    previsao_path = r"C:\Users\joaop\supabase\gestao_bpma\docs\uploads\Previsão de Férias 2026.xlsx"
    janeiro_path = r"C:\Users\joaop\supabase\gestao_bpma\docs\uploads\MINUTA DE FÉRIAS JANEIRO 2026.xlsx"
    excel_path = os.getenv("EXCEL_PATH") or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not excel_path:
        excel_path = previsao_path if os.path.exists(previsao_path) else janeiro_path
    aba_nome = os.getenv("EXCEL_SHEET")

    if not os.path.exists(excel_path):
        print(f"ERRO: Arquivo nao encontrado: {excel_path}")
        sys.exit(1)

    print(f"Arquivo: {excel_path}", flush=True)
    print(f"Aba: {aba_nome or 'primeira aba'}", flush=True)

    df = pd.read_excel(excel_path, sheet_name=aba_nome or 0, header=None, engine="openpyxl")

    header_row, header_vals = find_header_row(df)
    if header_row is None:
        print("ERRO: Nao foi possivel localizar a linha de cabecalho (MAT).", flush=True)
        sys.exit(1)
    print(f"Cabecalho encontrado na linha {header_row + 1}", flush=True)

    subheader_row, subheader_vals = find_subheader_row(df, header_row)

    col_matricula = find_col_index(header_vals, lambda v: v.startswith("MAT"))
    col_ano = find_col_index(header_vals, lambda v: v == "ANO")
    col_sei = find_col_index(header_vals, lambda v: "SEI" in v)
    col_dias_total = find_col_index(
        header_vals,
        lambda v: "QUANTIDADDE" in v or "TOTAL DE DIAS" in v,
    )

    parcel_headers = []
    for idx, val in enumerate(header_vals):
        if "PARCELA" in val:
            if "1" in val:
                parcel_headers.append((1, idx))
            elif "2" in val:
                parcel_headers.append((2, idx))
            elif "3" in val:
                parcel_headers.append((3, idx))

    parcel_headers.sort(key=lambda x: x[1])
    parcel_columns = []
    if parcel_headers and subheader_vals:
        for i, (num, start_idx) in enumerate(parcel_headers):
            end_idx = parcel_headers[i + 1][1] - 1 if i + 1 < len(parcel_headers) else len(header_vals) - 1
            inicio_col = None
            termino_col = None
            for col in range(start_idx, end_idx + 1):
                if col < len(subheader_vals):
                    if "INICIO" in subheader_vals[col] or subheader_vals[col].startswith("INI"):
                        inicio_col = col
                    elif "TERMINO" in subheader_vals[col] or subheader_vals[col].startswith("TERM") or subheader_vals[col].startswith("TER"):
                        termino_col = col
            if inicio_col is not None and termino_col is not None:
                parcel_columns.append({"parcela_num": num, "inicio_col": inicio_col, "termino_col": termino_col})

    if not parcel_columns:
        col_inicio, col_termino = find_date_columns_in_values(subheader_vals or header_vals)
        if col_inicio is None or col_termino is None:
            print("ERRO: Nao foi possivel localizar colunas INICIO/TERMINO.", flush=True)
            sys.exit(1)
        parcel_columns = [{"parcela_num": 1, "inicio_col": col_inicio, "termino_col": col_termino}]
    print(f"Parcelas detectadas: {parcel_columns}", flush=True)

    cache = {}
    total = 0
    atualizados = 0
    erros = []

    has_subheader = bool(subheader_vals)
    data_start = (subheader_row + 1) if has_subheader else header_row + 1

    for idx in range(data_start, len(df)):
        row = df.iloc[idx]
        matricula = row.iloc[col_matricula] if col_matricula is not None else None
        if not is_valid_matricula(matricula):
            continue

        row_parcelas = []
        for parcel in parcel_columns:
            data_inicio = parse_date(row.iloc[parcel["inicio_col"]])
            data_fim = parse_date(row.iloc[parcel["termino_col"]])
            if not data_inicio or not data_fim:
                continue
            dias = (data_fim - data_inicio).days + 1
            row_parcelas.append({
                "parcela_num": parcel["parcela_num"],
                "data_inicio": data_inicio,
                "data_fim": data_fim,
                "dias": dias,
            })

        if not row_parcelas:
            continue

        ano = row.iloc[col_ano] if col_ano is not None else None
        ano = int(ano) if isinstance(ano, (int, float)) and not pd.isna(ano) else row_parcelas[0]["data_inicio"].year
        processo_sei = (
            str(row.iloc[col_sei]).strip()
            if col_sei is not None and not pd.isna(row.iloc[col_sei])
            else None
        )

        total += 1
        if total <= 5:
            print(f"Processando matricula {matricula} (linha {idx + 1})...", flush=True)
        try:
            efetivo_id = get_efetivo_id_by_matricula(matricula, cache)
            if not efetivo_id:
                continue

            existing = supabase_query(
                "fat_ferias",
                method="GET",
                filters={"efetivo_id": f"eq.{efetivo_id}", "ano": f"eq.{ano}", "select": "id", "limit": "1"},
            )

            datas_inicio = [p["data_inicio"] for p in row_parcelas]
            datas_fim = [p["data_fim"] for p in row_parcelas]
            min_inicio = min(datas_inicio)
            max_fim = max(datas_fim)
            total_dias = sum(p["dias"] for p in row_parcelas)
            tipo = "INTEGRAL" if total_dias == 30 and len(row_parcelas) == 1 else "PARCELADA"

            if existing:
                ferias_id = existing[0]["id"]
                supabase_query(
                    "fat_ferias",
                    method="PATCH",
                    filters={"id": f"eq.{ferias_id}"},
                    data={
                        "mes_inicio": min_inicio.month,
                        "minuta_data_inicio": min_inicio.isoformat(),
                        "minuta_data_fim": max_fim.isoformat(),
                        "dias": total_dias,
                        "tipo": tipo,
                        **({"numero_processo_sei": processo_sei} if processo_sei else {}),
                    },
                )
            else:
                result = supabase_query(
                    "fat_ferias",
                    method="POST",
                    data={
                        "efetivo_id": efetivo_id,
                        "ano": ano,
                        "mes_inicio": min_inicio.month,
                        "dias": total_dias,
                        "tipo": tipo,
                        "minuta_data_inicio": min_inicio.isoformat(),
                        "minuta_data_fim": max_fim.isoformat(),
                        **({"numero_processo_sei": processo_sei} if processo_sei else {}),
                    },
                )
                ferias_id = result[0]["id"] if result else None

            if not ferias_id:
                erros.append(f"Falha em fat_ferias para matricula {matricula}")
                continue

            existing_parcelas = supabase_query(
                "fat_ferias_parcelas",
                method="GET",
                filters={
                    "fat_ferias_id": f"eq.{ferias_id}",
                    "select": "parcela_num,data_inicio,data_fim,dias",
                },
            )
            existing_map = {p.get("parcela_num"): p for p in existing_parcelas if p.get("parcela_num")}
            for parcela in row_parcelas:
                parcela_num = parcela["parcela_num"]
                parcela_data = {
                    "fat_ferias_id": ferias_id,
                    "parcela_num": parcela_num,
                    "dias": parcela["dias"],
                    "data_inicio": parcela["data_inicio"].isoformat(),
                    "data_fim": parcela["data_fim"].isoformat(),
                    "mes": str(parcela["data_inicio"].month),
                    "lancado_livro": False,
                    "lancado_sgpol": False,
                    "lancado_campanha": False,
                }

                if parcela_num in existing_map:
                    supabase_query(
                        "fat_ferias_parcelas",
                        method="PATCH",
                        filters={
                            "fat_ferias_id": f"eq.{ferias_id}",
                            "parcela_num": f"eq.{parcela_num}",
                        },
                        data=parcela_data,
                    )
                else:
                    supabase_query("fat_ferias_parcelas", method="POST", data=parcela_data)

            atualizados += 1
            if total % 10 == 0:
                print(f"Processados {total} registros (atualizados: {atualizados})...", flush=True)
        except Exception as exc:
            erro_msg = f"Matricula {matricula}: {exc}"
            erros.append(erro_msg)
            print(f"ERRO: {erro_msg}", flush=True)

    print("\nProcessamento concluido.", flush=True)
    print(f"Registros processados: {total}", flush=True)
    print(f"Registros atualizados/inseridos: {atualizados}", flush=True)
    if erros:
        print("Primeiros 10 erros:", flush=True)
        for erro in erros[:10]:
            print(f"  - {erro}", flush=True)


if __name__ == "__main__":
    processar()
