import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPREADSHEET_ID = '16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfI';
const RANGE = 'A:Z';

/** Nomes das abas para exibição (aba 0 = Resgates de Fauna, aba 1 = Crimes Ambientais) */
const SHEET_LABELS: [string, string] = ['Resgates de Fauna', 'Crimes Ambientais'];

async function getServiceAccountToken(): Promise<string> {
  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!saJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
  let sa: any;
  try {
    sa = JSON.parse(saJson);
  } catch (e) {
    throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ${e}`);
  }
  if (!sa.client_email || !sa.private_key) {
    throw new Error('Service account JSON missing client_email or private_key');
  }
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const base64url = (data: object) => {
    const json = JSON.stringify(data);
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const signatureInput = `${base64url(header)}.${base64url(payload)}`;
  const pemKey = sa.private_key;
  const pemContents = pemKey.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
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

async function getSheetNames(accessToken: string): Promise<string[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Failed to get sheet names: ${await response.text()}`);
  const data = await response.json();
  const titles = (data.sheets || []).map((s: any) => s?.properties?.title).filter(Boolean);
  return titles;
}

async function readSheet(accessToken: string, sheetName: string, range: string): Promise<any[][]> {
  const escapedName = sheetName.replace(/'/g, "''");
  const fullRange = `'${escapedName}'!${range}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(fullRange)}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Failed to read sheet: ${await response.text()}`);
  const data = await response.json();
  return data.values || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const accessToken = await getServiceAccountToken();
    const sheetNames = await getSheetNames(accessToken);
    if (sheetNames.length === 0) {
      return new Response(JSON.stringify({ success: true, rows_synced: 0, message: 'Nenhuma aba encontrada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Remove todos os dados antigos
    const { error: delError } = await supabase
      .from('radio_operador_data')
      .delete()
      .gte('row_index', -1);
    if (delError) throw delError;

    const syncedAt = new Date().toISOString();
    let totalRows = 0;
    const details: { sheet: string; rows: number; headers: number }[] = [];

    // Sincronizar até as duas primeiras abas (Resgates de Fauna, Crimes Ambientais)
    const sheetsToSync = sheetNames.slice(0, 2);
    for (let s = 0; s < sheetsToSync.length; s++) {
      const sheetTitle = sheetsToSync[s];
      const sheetLabel = SHEET_LABELS[s] ?? sheetTitle;
      const rows = await readSheet(accessToken, sheetTitle, RANGE);
      if (rows.length === 0) {
        details.push({ sheet: sheetLabel, rows: 0, headers: 0 });
        continue;
      }

      // Número de colunas = maior quantidade de células em qualquer linha (como nos HTMLs exportados)
      const maxCols = Math.max(...rows.map((r: any[]) => (r || []).length), 1);
      const rawFirst = rows[0] || [];
      const headers: string[] = Array.from({ length: maxCols }, (_, idx) => {
        const v = rawFirst[idx];
        const s = v != null ? String(v).trim() : '';
        return s || `Coluna ${idx + 1}`;
      });

      const inserts: { synced_at: string; row_index: number; sheet_name: string; data: Record<string, unknown> }[] = [];

      inserts.push({
        synced_at: syncedAt,
        row_index: 0,
        sheet_name: sheetLabel,
        data: { _headers: headers },
      });

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        const obj: Record<string, unknown> = {};
        headers.forEach((h: string, colIndex: number) => {
          const val = row[colIndex];
          obj[h] = val !== undefined && val !== null && String(val).trim() !== '' ? String(val).trim() : null;
        });
        inserts.push({ synced_at: syncedAt, row_index: i, sheet_name: sheetLabel, data: obj });
      }

      if (inserts.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < inserts.length; i += batchSize) {
          const chunk = inserts.slice(i, i + batchSize);
          const { error: insError } = await supabase.from('radio_operador_data').insert(chunk);
          if (insError) throw insError;
        }
      }

      const dataRowCount = inserts.length - 1;
      totalRows += dataRowCount;
      details.push({ sheet: sheetLabel, rows: dataRowCount, headers: headers.length });
    }

    return new Response(JSON.stringify({
      success: true,
      rows_synced: totalRows,
      synced_at: syncedAt,
      sheets: details,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[sync-radio-operador]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
