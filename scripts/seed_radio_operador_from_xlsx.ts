/**
 * Importa as linhas a partir da linha 2 de cada aba do xlsx (ou CSV) para radio_operador_data.
 * Uso: npx tsx scripts/seed_radio_operador_from_xlsx.ts [caminho]
 * Ex.: npx tsx scripts/seed_radio_operador_from_xlsx.ts "public/2026 - CONTROLE DE OCORRÊNCIAS - BPMA.xlsx"
 *      npx tsx scripts/seed_radio_operador_from_xlsx.ts "public/2026 - CONTROLE DE OCORRÊNCIAS - BPMA.xlsx.csv"
 *
 * Requer: migration 20260207130000_radio_operador_import_sheet_function.sql aplicada.
 * Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
 */

import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env da raiz do projeto (tsx não carrega automaticamente)
try {
  const envPath = join(process.cwd(), '.env');
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
} catch {
  // .env opcional
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_*) no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Só importar estas abas (ignora "Página2" e outras). */
const SHEETS_TO_IMPORT = ['Resgates de Fauna', 'Crimes Ambientais'];

/** Limite de linhas de dados por aba (o xlsx pode ter linhas a mais). Crimes Ambientais = 11. */
const SHEET_ROW_LIMITS: Record<string, number> = {
  'Crimes Ambientais': 11,
};

function trimHeader(h: unknown): string {
  if (h == null) return '';
  return String(h).replace(/\s+/g, ' ').trim();
}

function trimCell(c: unknown): string | null {
  if (c == null) return null;
  const s = String(c).trim();
  return s === '' ? null : s;
}

function sheetToHeadersAndRows(sheet: XLSX.WorkSheet): { headers: string[]; rows: Record<string, unknown>[] } {
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as unknown[][];
  if (!aoa.length) return { headers: [], rows: [] };

  const rawHeaders = (aoa[0] ?? []).map(trimHeader);
  const headers = rawHeaders.map((h, i) => (h || `Coluna ${i + 1}`));
  const dataRows = aoa.slice(1) as unknown[][];

  const rows: Record<string, unknown>[] = [];
  for (const row of dataRows) {
    const hasAny = row.some((c) => c != null && String(c).trim() !== '');
    if (!hasAny) continue;
    const obj: Record<string, unknown> = {};
    headers.forEach((key, i) => {
      const v = trimCell(row[i]);
      if (v !== null) obj[key] = v;
    });
    rows.push(obj);
  }
  return { headers, rows };
}

async function main() {
  const relPath = process.argv[2] ?? 'public/2026 - CONTROLE DE OCORRÊNCIAS - BPMA.xlsx';
  const absPath = join(process.cwd(), relPath);

  let workbook: XLSX.WorkBook;
  try {
    const buf = readFileSync(absPath);
    if (relPath.toLowerCase().endsWith('.csv')) {
      const csv = buf.toString('utf8');
      // CSV do projeto usa ";" como separador
      workbook = XLSX.read(csv, { type: 'string', raw: true, codepage: 65001, FS: ';' });
    } else {
      workbook = XLSX.read(buf, { type: 'buffer', raw: true });
    }
  } catch (e) {
    console.error('Erro ao ler ficheiro:', absPath, e);
    process.exit(1);
  }

  const allSheetNames = workbook.SheetNames.filter(Boolean);
  const sheetNames = allSheetNames.filter((name) => SHEETS_TO_IMPORT.includes(name));
  if (!sheetNames.length) {
    console.error('Nenhuma das abas esperadas encontrada:', SHEETS_TO_IMPORT.join(', '));
    if (allSheetNames.length) console.error('Abas no ficheiro:', allSheetNames.join(', '));
    process.exit(1);
  }

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    let { headers, rows } = sheetToHeadersAndRows(sheet);
    const limit = SHEET_ROW_LIMITS[sheetName];
    if (limit != null && rows.length > limit) {
      rows = rows.slice(0, limit);
    }
    if (headers.length === 0) {
      console.log(`Aba "${sheetName}": sem cabeçalhos, ignorada.`);
      continue;
    }

    const { data, error } = await supabase.rpc('radio_operador_import_sheet', {
      p_sheet_name: sheetName,
      p_headers: headers,
      p_rows: rows,
    });

    if (error) {
      console.error(`Aba "${sheetName}":`, error.message);
      continue;
    }

    const inserted = (data as { inserted_rows?: number }[])?.[0]?.inserted_rows ?? rows.length;
    console.log(`Aba "${sheetName}": ${headers.length} colunas, ${inserted} linhas de dados importadas.`);
  }

  for (const extra of allSheetNames.filter((n) => !SHEETS_TO_IMPORT.includes(n))) {
    const { error: delError } = await supabase.from('radio_operador_data').delete().eq('sheet_name', extra);
    if (delError) console.warn(`Aviso: não foi possível remover aba "${extra}":`, delError.message);
  }

  console.log('Concluído. Execute no SQL: SELECT * FROM public.popula_fat_radio_operador(); para popular as tabelas fato.');
}

main();
