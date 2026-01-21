import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spreadsheet configuration
const SPREADSHEET_ID = '1VU1YBhvFtbSbF6Y0wyWLKgvxtYBwSzic_pPAhpNxX_0';

const SHEETS_CONFIG = {
  ferias: { name: '02 | FÉRIAS 2026 PRAÇAS', range: 'A:AZ' },
  dm: { name: '01 | D. MÉDICA 2026', range: 'A:AZ' },
  abono: { name: '03 | ABONO 2026', range: 'A:AZ' },
  restricoes: { name: '06 | RESTRIÇÃO - 2025', range: 'A:AZ' },
};

// Google Service Account JWT generation
async function getServiceAccountToken(): Promise<string> {
  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!saJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
  
  let sa: any;
  try {
    sa = JSON.parse(saJson);
  } catch (e) {
    throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ${e}`);
  }
  
  // Validate required fields
  if (!sa.client_email) {
    throw new Error('Service account JSON missing client_email');
  }
  if (!sa.private_key) {
    throw new Error('Service account JSON missing private_key. Keys present: ' + Object.keys(sa).join(', '));
  }
  
  console.log('[sync-afastamentos] Service account email:', sa.client_email);
  
  // Create JWT header and payload
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Base64url encode
  const base64url = (data: object) => {
    const json = JSON.stringify(data);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const signatureInput = `${base64url(header)}.${base64url(payload)}`;
  
  // Import private key and sign
  const pemKey = sa.private_key;
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = pemKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );
  
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const jwt = `${signatureInput}.${signatureBase64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Failed to get token: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Read sheet data
async function readSheet(accessToken: string, sheetName: string, range: string): Promise<any[][]> {
  // Use single quotes around sheet name to handle special characters (Google Sheets convention)
  // Escape any single quotes in the sheet name by doubling them
  const escapedName = sheetName.replace(/'/g, "''");
  const fullRange = `'${escapedName}'!${range}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(fullRange)}`;
  
  console.log(`[sync-afastamentos] Reading sheet: ${sheetName}, Range: ${fullRange}`);
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to read sheet ${sheetName}: ${err}`);
  }

  const data = await response.json();
  return data.values || [];
}

// Get list of all sheet names in spreadsheet
async function getSheetNames(accessToken: string): Promise<string[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get sheet names: ${err}`);
  }

  const data = await response.json();
  return data.sheets?.map((s: any) => s.properties?.title).filter(Boolean) || [];
}

// Parse header row and create a mapping
function parseHeaders(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((header, index) => {
    if (header) {
      const normalized = header.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      map.set(normalized, index);
    }
  });
  return map;
}

// Helper to get cell value by header name
function getCell(row: any[], headers: Map<string, number>, ...possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const normalized = name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const idx = headers.get(normalized);
    if (idx !== undefined && row[idx] !== undefined && row[idx] !== null && row[idx] !== '') {
      return String(row[idx]).trim();
    }
  }
  return null;
}

// Parse date from various formats
function parseDate(value: string | null, defaultYear: number = 2026): string | null {
  if (!value) return null;
  
  const trimmed = value.toString().trim();
  if (!trimmed) return null;
  
  // Try DD/MM/YYYY format
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try DD/MM format (assume current/default year)
  const shortMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (shortMatch) {
    const [, day, month] = shortMatch;
    return `${defaultYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Try serial date (Excel/Sheets)
  const serial = parseFloat(trimmed);
  if (!isNaN(serial) && serial > 30000 && serial < 60000) {
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

// Parse integer
function parseInt2(value: string | null): number | null {
  if (!value) return null;
  const num = parseInt(value.replace(/[^\d-]/g, ''), 10);
  return isNaN(num) ? null : num;
}

// Parse boolean
function parseBool(value: string | null): boolean {
  if (!value) return false;
  const v = value.toLowerCase().trim();
  return v === 'sim' || v === 'true' || v === 'x' || v === '1' || v === 'yes';
}

// Parse month name to number
function parseMonth(value: string | null): number | null {
  if (!value) return null;
  const v = value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const months: Record<string, number> = {
    'janeiro': 1, 'jan': 1, '1': 1, '01': 1,
    'fevereiro': 2, 'fev': 2, '2': 2, '02': 2,
    'marco': 3, 'mar': 3, '3': 3, '03': 3,
    'abril': 4, 'abr': 4, '4': 4, '04': 4,
    'maio': 5, 'mai': 5, '5': 5, '05': 5,
    'junho': 6, 'jun': 6, '6': 6, '06': 6,
    'julho': 7, 'jul': 7, '7': 7, '07': 7,
    'agosto': 8, 'ago': 8, '8': 8, '08': 8,
    'setembro': 9, 'set': 9, '9': 9, '09': 9,
    'outubro': 10, 'out': 10, '10': 10,
    'novembro': 11, 'nov': 11, '11': 11,
    'dezembro': 12, 'dez': 12, '12': 12,
  };
  
  return months[v] || null;
}

// Process Férias sheet
function processFeriasRows(rows: any[][], sheetName: string): any[] {
  if (rows.length < 2) return [];
  
  const headers = parseHeaders(rows[0]);
  const staging: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const matricula = getCell(row, headers, 'matricula', 'mat', 'matrícula');
    
    if (!matricula) continue;
    
    staging.push({
      source_sheet: sheetName,
      source_row_number: i + 1,
      matricula,
      posto_graduacao: getCell(row, headers, 'posto/grad', 'posto', 'graduacao', 'grad'),
      nome_completo: getCell(row, headers, 'nome', 'nome completo'),
      upm: getCell(row, headers, 'upm', 'lotacao'),
      ano_referencia: parseInt2(getCell(row, headers, 'ano ref', 'ano referencia', 'ano_ref')),
      ano_gozo: parseInt2(getCell(row, headers, 'ano gozo', 'ano_gozo')) || 2026,
      sei: getCell(row, headers, 'sei', 'processo sei'),
      mes_previsto: getCell(row, headers, 'mes previsto', 'previsto'),
      mes_reprogramado: getCell(row, headers, 'mes reprogramado', 'reprogramado'),
      parc1_mes: getCell(row, headers, '1a parc mes', 'parc 1 mes', 'p1 mes'),
      parc2_mes: getCell(row, headers, '2a parc mes', 'parc 2 mes', 'p2 mes'),
      parc3_mes: getCell(row, headers, '3a parc mes', 'parc 3 mes', 'p3 mes'),
      p1_mes_num: parseMonth(getCell(row, headers, '1a parc mes', 'parc 1 mes', 'p1 mes')),
      p2_mes_num: parseMonth(getCell(row, headers, '2a parc mes', 'parc 2 mes', 'p2 mes')),
      p3_mes_num: parseMonth(getCell(row, headers, '3a parc mes', 'parc 3 mes', 'p3 mes')),
      p1_dias: parseInt2(getCell(row, headers, '1a parc dias', 'parc 1 dias', 'p1 dias')),
      p1_inicio: parseDate(getCell(row, headers, '1a parc inicio', 'parc 1 inicio', 'p1 inicio')),
      p1_fim: parseDate(getCell(row, headers, '1a parc fim', 'parc 1 fim', 'p1 fim')),
      p1_livro: parseBool(getCell(row, headers, '1a parc livro', 'p1 livro', 'livro 1')),
      p1_sgpol: parseBool(getCell(row, headers, '1a parc sgpol', 'p1 sgpol', 'sgpol 1')),
      p1_campanha: parseBool(getCell(row, headers, '1a parc campanha', 'p1 campanha', 'campanha 1')),
      p2_dias: parseInt2(getCell(row, headers, '2a parc dias', 'parc 2 dias', 'p2 dias')),
      p2_inicio: parseDate(getCell(row, headers, '2a parc inicio', 'parc 2 inicio', 'p2 inicio')),
      p2_fim: parseDate(getCell(row, headers, '2a parc fim', 'parc 2 fim', 'p2 fim')),
      p2_livro: parseBool(getCell(row, headers, '2a parc livro', 'p2 livro', 'livro 2')),
      p2_sgpol: parseBool(getCell(row, headers, '2a parc sgpol', 'p2 sgpol', 'sgpol 2')),
      p2_campanha: parseBool(getCell(row, headers, '2a parc campanha', 'p2 campanha', 'campanha 2')),
      p3_dias: parseInt2(getCell(row, headers, '3a parc dias', 'parc 3 dias', 'p3 dias')),
      p3_inicio: parseDate(getCell(row, headers, '3a parc inicio', 'parc 3 inicio', 'p3 inicio')),
      p3_fim: parseDate(getCell(row, headers, '3a parc fim', 'parc 3 fim', 'p3 fim')),
      p3_livro: parseBool(getCell(row, headers, '3a parc livro', 'p3 livro', 'livro 3')),
      p3_sgpol: parseBool(getCell(row, headers, '3a parc sgpol', 'p3 sgpol', 'sgpol 3')),
      p3_campanha: parseBool(getCell(row, headers, '3a parc campanha', 'p3 campanha', 'campanha 3')),
      total_dias: parseInt2(getCell(row, headers, 'total dias', 'dias total', 'total')),
      loaded_at: new Date().toISOString(),
    });
  }
  
  return staging;
}

// Process DM sheet
function processDMRows(rows: any[][], sheetName: string): any[] {
  if (rows.length < 2) return [];
  
  const headers = parseHeaders(rows[0]);
  const staging: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const matricula = getCell(row, headers, 'matricula', 'mat', 'matrícula');
    
    if (!matricula) continue;
    
    staging.push({
      source_sheet: sheetName,
      source_row_number: i + 1,
      matricula,
      posto_graduacao: getCell(row, headers, 'posto/grad', 'posto', 'graduacao', 'grad'),
      nome_completo: getCell(row, headers, 'nome', 'nome completo', 'policial'),
      tipo: getCell(row, headers, 'tipo', 'tipo dispensa', 'tipo dm') || 'DISPENSA MÉDICA',
      data_inicio: parseDate(getCell(row, headers, 'data inicio', 'inicio', 'data', 'de')),
      data_fim: parseDate(getCell(row, headers, 'data fim', 'fim', 'ate', 'até')),
      dias: parseInt2(getCell(row, headers, 'dias', 'qtd dias', 'quantidade dias')),
      cid: getCell(row, headers, 'cid', 'codigo cid', 'cid-10'),
      observacao: getCell(row, headers, 'obs', 'observacao', 'observacoes', 'motivo'),
      ano: 2026,
      loaded_at: new Date().toISOString(),
    });
  }
  
  return staging;
}

// Process Abono sheet - lê as 3 parcelas de abono
// Estrutura da planilha 03 | ABONO 2026 (conforme documentação do usuário):
// Coluna A (0) = Mês da 1ª Parcela
// Coluna B (1) = Mês da 2ª Parcela
// Coluna C (2) = Mês da 3ª Parcela
// Coluna K (10) = Mês de Previsão do Abono
// Coluna L (11) = Mês reprogramado
// Coluna M (12) = Matrícula
// Coluna R (17) = Ano de Gozo
// Coluna T (19) = Número do Processo SEI-GDF
// Colunas V (21) e W (22) = Início e Término da 1ª parcela
// Colunas AA (26) e AB (27) = Início e Término da 2ª parcela
// Colunas AF (31) e AG (32) = Início e Término da 3ª parcela
function processAbonoRows(rows: any[][], sheetName: string): any[] {
  if (rows.length < 2) return [];
  
  const staging: any[] = [];
  
  // Índices das colunas (0-indexed) - CORRETOS conforme usuário
  const COL_PARC1_MES = 0;       // A - Mês da 1ª Parcela
  const COL_PARC2_MES = 1;       // B - Mês da 2ª Parcela
  const COL_PARC3_MES = 2;       // C - Mês da 3ª Parcela
  const COL_MES_PREVISAO = 10;   // K - Mês de previsão do abono
  const COL_MES_REPROG = 11;     // L - Mês reprogramado
  const COL_MATRICULA = 12;      // M - Matrícula
  const COL_ANO_GOZO = 17;       // R - Ano de gozo
  const COL_SEI = 19;            // T - Número do Processo SEI-GDF
  const COL_PARCELA1_INICIO = 21; // V
  const COL_PARCELA1_FIM = 22;    // W
  const COL_PARCELA2_INICIO = 26; // AA
  const COL_PARCELA2_FIM = 27;    // AB
  const COL_PARCELA3_INICIO = 31; // AF
  const COL_PARCELA3_FIM = 32;    // AG
  
  console.log(`[processAbonoRows] Processing ${rows.length - 1} rows from ${sheetName}`);
  
  // Log primeira linha (header) para debug
  if (rows.length > 0) {
    console.log(`[processAbonoRows] Row 0 (header): cols 0-15:`, rows[0].slice(0, 16));
    console.log(`[processAbonoRows] Row 0 (header): cols 17-35:`, rows[0].slice(17, 36));
  }
  
  // Log linha 6 (header real dos dados - linha 7 no Excel)
  if (rows.length > 6) {
    console.log(`[processAbonoRows] Row 6 (data header): cols 0-15:`, rows[6].slice(0, 16));
    console.log(`[processAbonoRows] Row 6 (data header): cols 17-35:`, rows[6].slice(17, 36));
  }
  
  // Começar da linha 7 (índice 6) - dados começam após headers
  // Ajustar conforme estrutura real da planilha
  const startRow = 7; // Linha 8 no Excel (1-indexed)
  
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    
    // Ler matrícula pela coluna M (índice 12)
    const matricula = row[COL_MATRICULA]?.toString().trim();
    if (!matricula || matricula === '' || matricula.toLowerCase() === 'matrícula') continue;
    
    // Ler mês de previsão (coluna K)
    const mesPrevisaoRaw = row[COL_MES_PREVISAO];
    const mesPrevisao = parseMonth(mesPrevisaoRaw?.toString()) || parseInt2(mesPrevisaoRaw?.toString());
    
    // Ler mês reprogramado (coluna L) - se tiver, usa esse
    const mesReprogRaw = row[COL_MES_REPROG];
    const mesReprog = parseMonth(mesReprogRaw?.toString()) || parseInt2(mesReprogRaw?.toString());
    
    // Usar mês reprogramado se existir, senão usa previsão
    const mes = mesReprog || mesPrevisao;
    
    if (!mes) {
      if (i <= 10) {
        console.log(`[processAbonoRows] Row ${i}: skipped, no mes found. matricula=${matricula}, mesPrevisao=${mesPrevisaoRaw}, mesReprog=${mesReprogRaw}`);
      }
      continue;
    }
    
    // Ano de gozo (coluna R)
    const anoGozo = parseInt2(row[COL_ANO_GOZO]?.toString()) || 2026;
    
    // SEI (coluna T)
    const sei = row[COL_SEI]?.toString().trim() || null;
    
    // Log valores brutos das colunas de parcelas para debug
    if (staging.length < 3) {
      console.log(`[processAbonoRows] Row ${i} RAW parcela cols:`, {
        V: row[21],
        W: row[22],
        AA: row[26],
        AB: row[27],
        AF: row[31],
        AG: row[32],
        rowLength: row.length,
      });
    }
    
    // Ler datas das parcelas pelos índices das colunas (passando o ano para datas DD/MM)
    const parcela1Inicio = row[COL_PARCELA1_INICIO] ? parseDate(String(row[COL_PARCELA1_INICIO]), anoGozo) : null;
    const parcela1Fim = row[COL_PARCELA1_FIM] ? parseDate(String(row[COL_PARCELA1_FIM]), anoGozo) : null;
    const parcela2Inicio = row[COL_PARCELA2_INICIO] ? parseDate(String(row[COL_PARCELA2_INICIO]), anoGozo) : null;
    const parcela2Fim = row[COL_PARCELA2_FIM] ? parseDate(String(row[COL_PARCELA2_FIM]), anoGozo) : null;
    const parcela3Inicio = row[COL_PARCELA3_INICIO] ? parseDate(String(row[COL_PARCELA3_INICIO]), anoGozo) : null;
    const parcela3Fim = row[COL_PARCELA3_FIM] ? parseDate(String(row[COL_PARCELA3_FIM]), anoGozo) : null;
    
    // Log para debug das primeiras linhas com dados
    if (staging.length < 5) {
      console.log(`[processAbonoRows] Row ${i}: matricula=${matricula}, mesPrevisao=${mesPrevisao}, mesReprog=${mesReprog}, mes=${mes}`);
      console.log(`  Ano gozo=${anoGozo}, SEI=${sei}`);
      console.log(`  Parcela1: ${parcela1Inicio} - ${parcela1Fim}`);
      console.log(`  Parcela2: ${parcela2Inicio} - ${parcela2Fim}`);
      console.log(`  Parcela3: ${parcela3Inicio} - ${parcela3Fim}`);
    }
    
    staging.push({
      source_sheet: sheetName,
      source_row_number: i + 1,
      matricula,
      posto_graduacao: null, // Não temos coluna de posto definida
      nome_completo: null,   // Não temos coluna de nome definida
      mes,
      ano: anoGozo,
      observacao: sei ? `SEI: ${sei}` : null,
      parcela1_inicio: parcela1Inicio,
      parcela1_fim: parcela1Fim,
      parcela2_inicio: parcela2Inicio,
      parcela2_fim: parcela2Fim,
      parcela3_inicio: parcela3Inicio,
      parcela3_fim: parcela3Fim,
      loaded_at: new Date().toISOString(),
    });
  }
  
  console.log(`[processAbonoRows] Processed ${staging.length} valid rows`);
  return staging;
}

// Process Restricoes sheet
function processRestricoesRows(rows: any[][], sheetName: string): any[] {
  if (rows.length < 2) return [];
  
  const headers = parseHeaders(rows[0]);
  const staging: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const matricula = getCell(row, headers, 'matricula', 'mat', 'matrícula');
    
    if (!matricula) continue;
    
    staging.push({
      source_sheet: sheetName,
      source_row_number: i + 1,
      matricula,
      posto_graduacao: getCell(row, headers, 'posto/grad', 'posto', 'graduacao'),
      nome_completo: getCell(row, headers, 'nome', 'nome completo', 'policial'),
      tipo_restricao: getCell(row, headers, 'tipo', 'tipo restricao', 'restricao', 'natureza') || 'RESTRIÇÃO',
      data_inicio: parseDate(getCell(row, headers, 'data inicio', 'inicio', 'data', 'de')),
      data_fim: parseDate(getCell(row, headers, 'data fim', 'fim', 'ate', 'até', 'validade')),
      observacao: getCell(row, headers, 'obs', 'observacao', 'observacoes', 'motivo', 'descricao'),
      ano: parseInt2(getCell(row, headers, 'ano')) || 2025,
      loaded_at: new Date().toISOString(),
    });
  }
  
  return staging;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create log entry
  const { data: logEntry, error: logError } = await supabase
    .from('sync_run_logs')
    .insert({ status: 'running', started_at: new Date().toISOString() })
    .select('id')
    .single();

  const logId = logEntry?.id;
  const detalhes: Record<string, any> = {};
  let overallStatus = 'success';
  let errorMessage: string | null = null;

  try {
    console.log('[sync-afastamentos] Starting sync...');
    
    // Get Google Sheets access token
    const accessToken = await getServiceAccountToken();
    console.log('[sync-afastamentos] Got Google access token');
    
    // Get available sheet names for debugging
    try {
      const sheetNames = await getSheetNames(accessToken);
      console.log('[sync-afastamentos] Available sheets in spreadsheet:', sheetNames);
      detalhes.available_sheets = sheetNames;
    } catch (e) {
      console.warn('[sync-afastamentos] Could not get sheet names:', e);
    }

    // ========== 1. Process Férias ==========
    console.log('[sync-afastamentos] Processing Férias...');
    try {
      const feriasRows = await readSheet(accessToken, SHEETS_CONFIG.ferias.name, SHEETS_CONFIG.ferias.range);
      const feriasStaging = processFeriasRows(feriasRows, SHEETS_CONFIG.ferias.name);
      
      if (feriasStaging.length > 0) {
        const { error: upsertError } = await supabase
          .from('stg_ferias_2026_pracas')
          .upsert(feriasStaging, { onConflict: 'source_sheet,source_row_number' });
        
        if (upsertError) throw upsertError;
      }
      
      // Call RPC
      const { data: feriasResult, error: rpcError } = await supabase
        .rpc('sync_ferias_2026_from_stg', { p_source_sheet: SHEETS_CONFIG.ferias.name });
      
      if (rpcError) throw rpcError;
      
      detalhes.ferias = {
        rows_read: feriasRows.length - 1,
        staging_upserted: feriasStaging.length,
        rpc_result: feriasResult,
      };
      console.log('[sync-afastamentos] Férias done:', detalhes.ferias);
    } catch (e) {
      detalhes.ferias = { error: e instanceof Error ? e.message : String(e) };
      console.error('[sync-afastamentos] Férias error:', e);
    }

    // ========== 2. Process DM ==========
    console.log('[sync-afastamentos] Processing DM...');
    try {
      const dmRows = await readSheet(accessToken, SHEETS_CONFIG.dm.name, SHEETS_CONFIG.dm.range);
      const dmStaging = processDMRows(dmRows, SHEETS_CONFIG.dm.name);
      
      if (dmStaging.length > 0) {
        const { error: upsertError } = await supabase
          .from('stg_dm_2026')
          .upsert(dmStaging, { onConflict: 'source_sheet,source_row_number' });
        
        if (upsertError) throw upsertError;
      }
      
      // Call RPC
      const { data: dmResult, error: rpcError } = await supabase
        .rpc('sync_dm_2026_from_stg', { p_source_sheet: SHEETS_CONFIG.dm.name });
      
      if (rpcError) throw rpcError;
      
      detalhes.dm = {
        rows_read: dmRows.length - 1,
        staging_upserted: dmStaging.length,
        rpc_result: dmResult,
      };
      console.log('[sync-afastamentos] DM done:', detalhes.dm);
    } catch (e) {
      detalhes.dm = { error: e instanceof Error ? e.message : String(e) };
      console.error('[sync-afastamentos] DM error:', e);
    }

    // ========== 3. Process Abono ==========
    console.log('[sync-afastamentos] Processing Abono...');
    try {
      const abonoRows = await readSheet(accessToken, SHEETS_CONFIG.abono.name, SHEETS_CONFIG.abono.range);
      const abonoStaging = processAbonoRows(abonoRows, SHEETS_CONFIG.abono.name);
      
      if (abonoStaging.length > 0) {
        const { error: upsertError } = await supabase
          .from('stg_abono_2026')
          .upsert(abonoStaging, { onConflict: 'source_sheet,source_row_number' });
        
        if (upsertError) throw upsertError;
      }
      
      // Call RPC
      const { data: abonoResult, error: rpcError } = await supabase
        .rpc('sync_abono_2026_from_stg', { p_source_sheet: SHEETS_CONFIG.abono.name });
      
      if (rpcError) throw rpcError;
      
      detalhes.abono = {
        rows_read: abonoRows.length - 1,
        staging_upserted: abonoStaging.length,
        rpc_result: abonoResult,
      };
      console.log('[sync-afastamentos] Abono done:', detalhes.abono);
    } catch (e) {
      detalhes.abono = { error: e instanceof Error ? e.message : String(e) };
      console.error('[sync-afastamentos] Abono error:', e);
    }

    // ========== 4. Process Restrições ==========
    console.log('[sync-afastamentos] Processing Restrições...');
    try {
      const restricoesRows = await readSheet(accessToken, SHEETS_CONFIG.restricoes.name, SHEETS_CONFIG.restricoes.range);
      const restricoesStaging = processRestricoesRows(restricoesRows, SHEETS_CONFIG.restricoes.name);
      
      if (restricoesStaging.length > 0) {
        const { error: upsertError } = await supabase
          .from('stg_restricoes_2025')
          .upsert(restricoesStaging, { onConflict: 'source_sheet,source_row_number' });
        
        if (upsertError) throw upsertError;
      }
      
      // Call RPC
      const { data: restricoesResult, error: rpcError } = await supabase
        .rpc('sync_restricoes_from_stg', { p_source_sheet: SHEETS_CONFIG.restricoes.name });
      
      if (rpcError) throw rpcError;
      
      detalhes.restricoes = {
        rows_read: restricoesRows.length - 1,
        staging_upserted: restricoesStaging.length,
        rpc_result: restricoesResult,
      };
      console.log('[sync-afastamentos] Restrições done:', detalhes.restricoes);
    } catch (e) {
      detalhes.restricoes = { error: e instanceof Error ? e.message : String(e) };
      console.error('[sync-afastamentos] Restrições error:', e);
    }

    // Check if any sheet had errors
    const hasErrors = Object.values(detalhes).some((d: any) => d.error);
    if (hasErrors) {
      overallStatus = 'partial_success';
    }

  } catch (error) {
    console.error('[sync-afastamentos] Fatal error:', error);
    overallStatus = 'error';
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  // Update log entry
  if (logId) {
    await supabase
      .from('sync_run_logs')
      .update({
        finished_at: new Date().toISOString(),
        status: overallStatus,
        detalhes,
        erro: errorMessage,
      })
      .eq('id', logId);
  }

  return new Response(JSON.stringify({
    success: overallStatus !== 'error',
    status: overallStatus,
    detalhes,
    error: errorMessage,
  }), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: overallStatus === 'error' ? 500 : 200,
  });
});
