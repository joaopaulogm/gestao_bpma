import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPREADSHEET_ID = '16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfI';
const SHEET_LABELS = ['Resgates de Fauna', 'Crimes Ambientais'];

function hashRow(data: Record<string, unknown>): string {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}

async function getAccessToken(): Promise<string> {
  const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!saJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not configured');
  
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signInput = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })}`;
  
  const pemKey = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey('pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(signInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signInput}.${sigB64}`,
  });
  
  if (!res.ok) throw new Error(`Token error: ${await res.text()}`);
  return (await res.json()).access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const token = await getAccessToken();
    
    // Get sheet names
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!metaRes.ok) throw new Error(`Sheet meta error`);
    const meta = await metaRes.json();
    const sheetNames: string[] = (meta.sheets || []).map((s: any) => s?.properties?.title).filter(Boolean);
    
    if (!sheetNames.length) {
      return new Response(JSON.stringify({ success: true, rows_synced: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get existing data
    const { data: existing } = await supabase.from('radio_operador_data').select('id,row_index,sheet_name,data_hash');
    const existingMap = new Map<string, { id: string; hash: string }>();
    for (const r of (existing || []) as any[]) {
      existingMap.set(`${r.sheet_name}::${r.row_index}`, { id: r.id, hash: r.data_hash || '' });
    }
    
    const syncedAt = new Date().toISOString();
    const currentKeys = new Set<string>();
    let inserted = 0, updated = 0, deleted = 0;
    const details: any[] = [];

    // Process first 2 sheets
    for (let s = 0; s < Math.min(sheetNames.length, 2); s++) {
      const sheetName = sheetNames[s];
      const label = SHEET_LABELS[s] || sheetName;
      
      const range = encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!A:Z`);
      const dataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!dataRes.ok) continue;
      const rows: any[][] = (await dataRes.json()).values || [];
      
      if (!rows.length) { details.push({ sheet: label, inserted: 0, updated: 0 }); continue; }

      // L1 = linha 1 (index 0), L2 = linha 2 (index 1) = cabeçalho, L3+ = dados
      const headerRowIndex = 1;
      const firstDataRowIndex = 2;
      const maxCols = Math.max(...rows.map(r => r?.length || 0), 1);
      const headerSource = rows[headerRowIndex] ?? rows[0];
      const headers: string[] = [];
      for (let i = 0; i < maxCols; i++) {
        const v = headerSource?.[i];
        headers.push(v ? String(v).trim() : `Coluna ${i + 1}`);
      }

      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      // Linha de cabeçalho (L2) guardada com row_index 1
      const hKey = `${label}::${headerRowIndex}`;
      currentKeys.add(hKey);
      const hData = { _headers: headers };
      const hHash = hashRow(hData);
      const hExist = existingMap.get(hKey);
      
      if (!hExist) {
        toInsert.push({ synced_at: syncedAt, row_index: headerRowIndex, sheet_name: label, data: hData, data_hash: hHash });
      } else if (hExist.hash !== hHash) {
        toUpdate.push({ id: hExist.id, synced_at: syncedAt, data: hData, data_hash: hHash });
      }

      // Linhas de dados a partir de L3 (row_index 2, 3, ...)
      for (let i = firstDataRowIndex; i < rows.length; i++) {
        const row = rows[i] || [];
        const obj: Record<string, unknown> = {};
        for (let j = 0; j < headers.length; j++) {
          const val = row[j];
          obj[headers[j]] = val != null && String(val).trim() ? String(val).trim() : null;
        }
        
        const key = `${label}::${i}`;
        currentKeys.add(key);
        const hash = hashRow(obj);
        const exist = existingMap.get(key);
        
        if (!exist) {
          toInsert.push({ synced_at: syncedAt, row_index: i, sheet_name: label, data: obj, data_hash: hash });
        } else if (exist.hash !== hash) {
          toUpdate.push({ id: exist.id, synced_at: syncedAt, data: obj, data_hash: hash });
        }
      }

      // Batch insert
      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50);
        await supabase.from('radio_operador_data').insert(chunk);
        inserted += chunk.length;
      }

      // Update rows
      for (const u of toUpdate) {
        await supabase.from('radio_operador_data').update({ synced_at: u.synced_at, data: u.data, data_hash: u.data_hash }).eq('id', u.id);
        updated++;
      }

      details.push({ sheet: label, inserted: toInsert.length, updated: toUpdate.length, headers: headers.length });
    }

    // Delete removed rows
    for (const [key, val] of existingMap.entries()) {
      if (!currentKeys.has(key)) {
        await supabase.from('radio_operador_data').delete().eq('id', val.id);
        deleted++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      rows_inserted: inserted,
      rows_updated: updated,
      rows_deleted: deleted,
      synced_at: syncedAt,
      sheets: details,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[sync-radio-operador]', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    });
  }
});
