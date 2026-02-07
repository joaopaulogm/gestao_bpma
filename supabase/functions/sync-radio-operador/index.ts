import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SPREADSHEET_ID = '16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfI';

// ── Google Auth ──
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
    exp: now + 3600, iat: now,
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

// ── Helpers ──
function normalizeText(v: unknown): string {
  if (v == null) return '';
  return String(v).trim().toUpperCase();
}

function parseDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function parseTime(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}:${m[3] || '00'}`;
  return null;
}

function parseInterval(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s.length <= 5 ? s + ':00' : s;
  return null;
}

// ── Dimension lookup with find-or-create ──
type DimCache = Map<string, string>;

async function findOrCreate(
  supabase: any,
  table: string,
  nameField: string,
  value: string,
  cache: DimCache
): Promise<string | null> {
  if (!value || value === '-' || value === '--' || value === '---') return null;
  const key = value.toUpperCase().trim();
  if (cache.has(key)) return cache.get(key)!;

  // Try to find
  const { data } = await supabase.from(table).select('id').ilike(nameField, key).limit(1).single();
  if (data) {
    cache.set(key, data.id);
    return data.id;
  }

  // Create new
  const { data: created, error } = await supabase.from(table).insert({ [nameField]: value.trim() }).select('id').single();
  if (error) {
    console.error(`[findOrCreate] ${table} "${value}":`, error.message);
    return null;
  }
  cache.set(key, created.id);
  return created.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const token = await getAccessToken();
    console.log('[sync-radio-operador] Got access token, fetching sheets...');

    // Get sheet names
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!metaRes.ok) throw new Error(`Sheet meta error: ${await metaRes.text()}`);
    const meta = await metaRes.json();
    const sheetNames: string[] = (meta.sheets || []).map((s: any) => s?.properties?.title).filter(Boolean);
    console.log('[sync-radio-operador] Sheets found:', sheetNames);

    if (sheetNames.length < 1) {
      return new Response(JSON.stringify({ success: true, message: 'No sheets found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Pre-load dimension caches
    const equipeCache: DimCache = new Map();
    const localCache: DimCache = new Map();
    const grupamentoCache: DimCache = new Map();
    const desfechoCache: DimCache = new Map();
    const destinacaoCache: DimCache = new Map();

    // Load existing dimensions
    for (const [table, field, cache] of [
      ['dim_equipe', 'nome', equipeCache],
      ['dim_local', 'nome', localCache],
      ['dim_grupamento', 'nome', grupamentoCache],
      ['dim_desfecho', 'nome', desfechoCache],
      ['dim_destinacao', 'nome', destinacaoCache],
    ] as [string, string, DimCache][]) {
      const { data } = await supabase.from(table).select(`id,${field}`);
      if (data) {
        for (const row of data) {
          cache.set(String(row[field]).toUpperCase().trim(), row.id);
        }
      }
    }
    console.log('[sync-radio-operador] Dimension caches loaded');

    const results: any[] = [];

    // ── Sheet 1: Resgates de Fauna ──
    if (sheetNames.length >= 1) {
      const sheetName = sheetNames[0];
      const range = encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!A:Z`);
      const dataRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dataRes.ok) throw new Error(`Sheet data error: ${await dataRes.text()}`);
      const allRows: any[][] = (await dataRes.json()).values || [];
      console.log(`[sync-radio-operador] Sheet "${sheetName}" total rows: ${allRows.length}`);

      // Row 0 = title, Row 1 = headers, Row 2+ = data
      const headers = (allRows[1] || []).map((h: any) => normalizeText(h));
      console.log(`[sync-radio-operador] Resgate headers: ${headers.join(' | ')}`);

      // Map header positions by pattern matching
      const colIdx = (patterns: string[]) => headers.findIndex(h => patterns.some(p => h.includes(p)));

      const iData = colIdx(['DATA']);
      const iEquipe = colIdx(['EQUIPE']);
      const iCopom = colIdx(['COPOM', 'OCORRÊNCIA']);
      const iFauna = colIdx(['FAUNA']);
      const iHCadastro = colIdx(['CADASTRO']);
      const iHRecebido = colIdx(['RECEBIDO', 'COPOM']);
      const iHDespacho = colIdx(['DESPACHO']);
      const iHFinal = colIdx(['FINALIZAÇÃO', 'FINALIZACAO']);
      const iTelefone = colIdx(['TELEFONE']);
      const iLocal = colIdx(['LOCAL']);
      const iPrefixo = colIdx(['PREFIXO']);
      const iGrupamento = colIdx(['GRUPAMENTO']);
      const iCmtVtr = colIdx(['CMT']);
      const iDesfecho = colIdx(['DESFECHO']);
      const iDestinacao = colIdx(['DESTINAÇÃO', 'DESTINACAO']);
      const iRap = colIdx(['RAP']);
      const iDur1 = colIdx(['190']);
      const iDur2 = headers.findIndex((h, idx) => idx > (iDur1 >= 0 ? iDur1 : 0) && h.includes('DURAÇÃO'));

      console.log(`[sync-radio-operador] Resgate column mapping: data=${iData} equipe=${iEquipe} copom=${iCopom} fauna=${iFauna} local=${iLocal} desfecho=${iDesfecho} destinacao=${iDestinacao}`);

      // Delete existing resgate data
      const { error: delErr } = await supabase.from('fat_controle_ocorrencias_resgate_2026').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) console.error('[sync-radio-operador] Delete resgate error:', delErr.message);

      const resgateRows: any[] = [];
      let skipped = 0;

      for (let i = 2; i < allRows.length; i++) {
        const row = allRows[i] || [];
        const data = parseDate(row[iData]);
        if (!data) { skipped++; continue; }

        const equipeText = normalizeText(row[iEquipe]);
        const localText = String(row[iLocal] || '').trim();
        const grupText = normalizeText(row[iGrupamento]);
        const desfText = normalizeText(row[iDesfecho]);
        const destText = normalizeText(row[iDestinacao]);

        const equipe_id = equipeText ? await findOrCreate(supabase, 'dim_equipe', 'nome', equipeText, equipeCache) : null;
        const local_id = localText ? await findOrCreate(supabase, 'dim_local', 'nome', localText, localCache) : null;
        const grupamento_id = grupText ? await findOrCreate(supabase, 'dim_grupamento', 'nome', grupText, grupamentoCache) : null;
        const desfecho_id = desfText ? await findOrCreate(supabase, 'dim_desfecho', 'nome', desfText, desfechoCache) : null;
        const destinacao_id = destText ? await findOrCreate(supabase, 'dim_destinacao', 'nome', destText, destinacaoCache) : null;

        resgateRows.push({
          data,
          equipe_id,
          ocorrencia_copom: String(row[iCopom] || '').trim() || null,
          fauna: String(row[iFauna] || '').trim() || null,
          hora_cadastro_ocorrencia: parseTime(row[iHCadastro]),
          hora_recebido_copom_central: parseTime(row[iHRecebido >= 0 ? iHRecebido : -1]),
          hora_despacho_ro: parseTime(row[iHDespacho]),
          hora_finalizacao_ocorrencia: parseTime(row[iHFinal]),
          telefone: String(row[iTelefone] || '').trim() || null,
          local_id,
          prefixo: String(row[iPrefixo] || '').trim() || null,
          grupamento_id,
          cmt_vtr: String(row[iCmtVtr] || '').trim() || null,
          desfecho_id,
          destinacao_id,
          numero_rap: String(row[iRap] || '').trim() || null,
          duracao_cadastro_190_encaminhamento_copom: parseInterval(row[iDur1 >= 0 ? iDur1 : -1]),
          duracao_despacho_finalizacao: parseInterval(row[iDur2 >= 0 ? iDur2 : -1]),
        });
      }

      // Batch insert in chunks of 50
      let inserted = 0;
      for (let i = 0; i < resgateRows.length; i += 50) {
        const chunk = resgateRows.slice(i, i + 50);
        const { error } = await supabase.from('fat_controle_ocorrencias_resgate_2026').insert(chunk);
        if (error) {
          console.error(`[sync-radio-operador] Resgate insert chunk ${i} error:`, error.message);
        } else {
          inserted += chunk.length;
        }
      }

      results.push({ sheet: sheetName, type: 'resgate', total_rows: allRows.length - 2, inserted, skipped });
      console.log(`[sync-radio-operador] Resgate: inserted=${inserted}, skipped=${skipped}`);
    }

    // ── Sheet 2: Crimes Ambientais ──
    if (sheetNames.length >= 2) {
      const sheetName = sheetNames[1];
      const range = encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!A:Z`);
      const dataRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dataRes.ok) throw new Error(`Sheet data error: ${await dataRes.text()}`);
      const allRows: any[][] = (await dataRes.json()).values || [];
      console.log(`[sync-radio-operador] Sheet "${sheetName}" total rows: ${allRows.length}`);

      const headers = (allRows[1] || []).map((h: any) => normalizeText(h));
      console.log(`[sync-radio-operador] Crimes headers: ${headers.join(' | ')}`);

      const colIdx = (patterns: string[]) => headers.findIndex(h => patterns.some(p => h.includes(p)));

      const iData = colIdx(['DATA']);
      const iEquipe = colIdx(['EQUIPE']);
      const iCopom = colIdx(['COPOM', 'OCORRÊNCIA']);
      const iCrime = colIdx(['CRIME']);
      const iHCadastro = colIdx(['CADASTRO']);
      const iHRecebido = colIdx(['RECEBIDO', 'COPOM']);
      const iHDespacho = colIdx(['DESPACHO']);
      const iHFinal = colIdx(['FINALIZAÇÃO', 'FINALIZACAO']);
      const iTelefone = colIdx(['TELEFONE']);
      const iLocal = colIdx(['LOCAL']);
      const iPrefixo = colIdx(['PREFIXO']);
      const iGrupamento = colIdx(['GRUPAMENTO']);
      const iCmtVtr = colIdx(['CMT']);
      const iDesfecho = colIdx(['DESFECHO']);
      const iDestinacao = colIdx(['DESTINAÇÃO', 'DESTINACAO']);
      const iRap = colIdx(['RAP']);
      const iTco = colIdx(['TCO']);
      const iDur1 = colIdx(['190']);
      const iDur2 = headers.findIndex((h, idx) => idx > (iDur1 >= 0 ? iDur1 : 0) && h.includes('DURAÇÃO'));

      console.log(`[sync-radio-operador] Crimes column mapping: data=${iData} crime=${iCrime} tco=${iTco}`);

      // Delete existing crime data
      const { error: delErr } = await supabase.from('fat_controle_ocorrencias_crime_ambientais_2026').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) console.error('[sync-radio-operador] Delete crimes error:', delErr.message);

      const crimeRows: any[] = [];
      let skipped = 0;

      for (let i = 2; i < allRows.length; i++) {
        const row = allRows[i] || [];
        const data = parseDate(row[iData]);
        if (!data) { skipped++; continue; }

        const equipeText = normalizeText(row[iEquipe]);
        const localText = String(row[iLocal] || '').trim();
        const grupText = normalizeText(row[iGrupamento]);
        const desfText = normalizeText(row[iDesfecho]);
        const destText = normalizeText(row[iDestinacao]);

        const equipe_id = equipeText ? await findOrCreate(supabase, 'dim_equipe', 'nome', equipeText, equipeCache) : null;
        const local_id = localText ? await findOrCreate(supabase, 'dim_local', 'nome', localText, localCache) : null;
        const grupamento_id = grupText ? await findOrCreate(supabase, 'dim_grupamento', 'nome', grupText, grupamentoCache) : null;
        const desfecho_id = desfText ? await findOrCreate(supabase, 'dim_desfecho', 'nome', desfText, desfechoCache) : null;
        const destinacao_id = destText ? await findOrCreate(supabase, 'dim_destinacao', 'nome', destText, destinacaoCache) : null;

        crimeRows.push({
          data,
          equipe_id,
          ocorrencia_copom: String(row[iCopom] || '').trim() || null,
          crime: String(row[iCrime >= 0 ? iCrime : -1] || '').trim() || null,
          hora_cadastro_ocorrencia: parseTime(row[iHCadastro]),
          hora_recebido_copom_central: parseTime(row[iHRecebido >= 0 ? iHRecebido : -1]),
          hora_despacho_ro: parseTime(row[iHDespacho]),
          hora_finalizacao_ocorrencia: parseTime(row[iHFinal]),
          telefone: String(row[iTelefone] || '').trim() || null,
          local_id,
          prefixo: String(row[iPrefixo] || '').trim() || null,
          grupamento_id,
          cmt_vtr: String(row[iCmtVtr] || '').trim() || null,
          desfecho_id,
          destinacao_id,
          numero_rap: String(row[iRap] || '').trim() || null,
          numero_tco_pmdf_ou_tco_apf_pcdf: String(row[iTco >= 0 ? iTco : -1] || '').trim() || null,
          duracao_cadastro_190_encaminhamento_copom: parseInterval(row[iDur1 >= 0 ? iDur1 : -1]),
          duracao_despacho_finalizacao: parseInterval(row[iDur2 >= 0 ? iDur2 : -1]),
        });
      }

      // Batch insert
      let inserted = 0;
      for (let i = 0; i < crimeRows.length; i += 50) {
        const chunk = crimeRows.slice(i, i + 50);
        const { error } = await supabase.from('fat_controle_ocorrencias_crime_ambientais_2026').insert(chunk);
        if (error) {
          console.error(`[sync-radio-operador] Crimes insert chunk ${i} error:`, error.message);
        } else {
          inserted += chunk.length;
        }
      }

      results.push({ sheet: sheetName, type: 'crimes', total_rows: allRows.length - 2, inserted, skipped });
      console.log(`[sync-radio-operador] Crimes: inserted=${inserted}, skipped=${skipped}`);
    }

    const response = { success: true, synced_at: new Date().toISOString(), results };
    console.log('[sync-radio-operador] Done:', JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[sync-radio-operador] Error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    });
  }
});
