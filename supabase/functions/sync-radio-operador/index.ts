import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPREADSHEET_ID = '16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfI';
const RANGE = 'A:Z';

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

async function getFirstSheetName(accessToken: string): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Failed to get sheet names: ${await response.text()}`);
  const data = await response.json();
  const first = data.sheets?.[0]?.properties?.title;
  if (!first) throw new Error('No sheets found in spreadsheet');
  return first;
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
    const sheetName = await getFirstSheetName(accessToken);
    const rows = await readSheet(accessToken, sheetName, RANGE);
    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, rows_synced: 0, message: 'Planilha vazia' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const headers = (rows[0] || []).map((h: any, idx: number) => String(h ?? '').trim() || `Coluna ${idx + 1}`);
    const syncedAt = new Date().toISOString();

    // Remove old data (all rows)
    const { error: delError } = await supabase
      .from('radio_operador_data')
      .delete()
      .gte('row_index', -1);
    if (delError) throw delError;

    // Insert header row (row_index 0)
    const { error: ins0Error } = await supabase
      .from('radio_operador_data')
      .insert({
        synced_at: syncedAt,
        row_index: 0,
        data: { _headers: headers },
      });
    if (ins0Error) throw ins0Error;

    // Insert data rows (row_index 1, 2, ...)
    const inserts: { synced_at: string; row_index: number; data: Record<string, unknown> }[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const obj: Record<string, unknown> = {};
      headers.forEach((h: string, colIndex: number) => {
        const val = row[colIndex];
        obj[h] = val !== undefined && val !== null && String(val).trim() !== '' ? String(val).trim() : null;
      });
      inserts.push({ synced_at: syncedAt, row_index: i, data: obj });
    }

    if (inserts.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < inserts.length; i += batchSize) {
        const chunk = inserts.slice(i, i + batchSize);
        const { error: insError } = await supabase.from('radio_operador_data').insert(chunk);
        if (insError) throw insError;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      rows_synced: inserts.length,
      headers_count: headers.length,
      synced_at: syncedAt,
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
