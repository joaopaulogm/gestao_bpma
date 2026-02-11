// supabase/functions/sync-radio-operador/index.ts
// Edge Function: Sync Google Sheets (gid-based) -> Supabase facts + dimensions
// - Header is ALWAYS on row 2 in both sheets (Google Sheets row numbering), i.e. allRows[1]
// - Data starts on row 3, i.e. allRows[2]
// - Resgate sheet is selected by gid=0 (sheetId=0) by default
// - Crimes sheet can be selected by CRIMES_GID env var (recommended). Fallback: title contains "CRIMES"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPREADSHEET_ID =
  Deno.env.get("SPREADSHEET_ID") ??
  "16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfI";

// gid=0 = primeira aba (Resgate). Ajuste RESGATE_GID/CRIMES_GID via env se necessário.
const RESGATE_GID = Number(Deno.env.get("RESGATE_GID") ?? 0);
// gid da aba Crimes Ambientais (ex: 646142210 na planilha 2026 - CONTROLE DE OCORRÊNCIAS - BPMA)
const CRIMES_GID_ENV = Deno.env.get("CRIMES_GID");
const CRIMES_GID = CRIMES_GID_ENV != null && CRIMES_GID_ENV !== ""
  ? Number(CRIMES_GID_ENV)
  : 646142210;

// Google Sheets layout: row 2 is header in both tabs
const HEADER_ROW_INDEX = 1; // line 2
const DATA_START_INDEX = 2; // line 3

// ── Google Auth ──
async function getAccessToken(): Promise<string> {
  const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!saJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
  const sa = JSON.parse(saJson);

  const now = Math.floor(Date.now() / 1000);

  const b64url = (o: object) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const signingInput = `${b64url(header)}.${b64url(claimSet)}`;

  // PEM -> DER bytes
  const pem = String(sa.private_key || "");
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binaryKey = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const assertion = `${signingInput}.${sigB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`,
  });

  if (!res.ok) throw new Error(`Token error: ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

// ── Helpers ──
function normalizeText(v: unknown): string {
  if (v == null) return "";
  return String(v).trim().toUpperCase();
}

function getCell(row: any[], idx: number): unknown {
  if (idx == null || idx < 0) return null;
  return row[idx];
}

function parseDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();

  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  return null;
}

function parseTime(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  return `${m[1].padStart(2, "0")}:${m[2]}:${m[3] || "00"}`;
}

function parseInterval(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s.length <= 5 ? `${s}:00` : s;
  return null;
}

function normalizePhone(v: unknown): string | null {
  if (!v) return null;
  let s = String(v).trim();
  const digits = s.replace(/\D/g, "");
  // If pure digits 11 -> format
  if (digits.length === 11) {
    s = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  // Accept only (XX) XXXXX-XXXX
  if (/^\(\d{2}\)\s?\d{5}-\d{4}$/.test(s)) return s;
  return null;
}

// ── Dimension lookup with cache + find-or-create ──
type DimCache = Map<string, string>;

async function findOrCreate(
  supabase: any,
  table: string,
  nameField: string,
  value: string,
  cache: DimCache,
): Promise<string | null> {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || raw === "-" || raw === "--" || raw === "---") return null;

  const key = raw.toUpperCase();

  if (cache.has(key)) return cache.get(key)!;

  // Try exact match first (fast, deterministic)
  const { data: found, error: findErr } = await supabase
    .from(table)
    .select("id")
    .eq(nameField, raw)
    .limit(1)
    .maybeSingle();

  if (findErr) {
    console.error(`[findOrCreate] find ${table} err:`, findErr.message);
  }
  if (found?.id) {
    cache.set(key, found.id);
    return found.id;
  }

  // Create new
  const { data: created, error: insErr } = await supabase
    .from(table)
    .insert({ [nameField]: raw })
    .select("id")
    .single();

  if (insErr) {
    console.error(`[findOrCreate] insert ${table} "${raw}":`, insErr.message);
    return null;
  }

  cache.set(key, created.id);
  return created.id;
}

async function loadDimCache(
  supabase: any,
  table: string,
  field: string,
): Promise<DimCache> {
  const cache: DimCache = new Map();
  const { data, error } = await supabase.from(table).select(`id,${field}`);
  if (error) console.error(`[loadDimCache] ${table}:`, error.message);
  if (data) {
    for (const row of data) {
      const k = String(row[field] ?? "").toUpperCase().trim();
      if (k) cache.set(k, row.id);
    }
  }
  return cache;
}

function ensureHeaderOk(headers: string[], sheetName: string) {
  if (!headers.length) {
    throw new Error(
      `Cabeçalho vazio na aba "${sheetName}". Esperado na linha 2.`,
    );
  }
  if (!headers.some((h) => h.includes("DATA"))) {
    throw new Error(
      `Coluna DATA não encontrada no cabeçalho da aba "${sheetName}" (linha 2).`,
    );
  }
}

function colIdx(headers: string[], patterns: string[]) {
  return headers.findIndex((h) => patterns.some((p) => h.includes(p)));
}

function findSecondDuracao(headers: string[], afterIdx: number) {
  if (afterIdx < 0) return headers.findIndex((h) => h.includes("DURAÇÃO"));
  return headers.findIndex(
    (h, idx) => idx > afterIdx && h.includes("DURAÇÃO"),
  );
}

// ── Sheet selection (gid-based) ──
type SheetMeta = { title: string; sheetId: number };

async function fetchSheetMetas(token: string): Promise<SheetMeta[]> {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties(title,sheetId)`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!metaRes.ok) {
    const body = await metaRes.text();
    if (metaRes.status === 404) {
      throw new Error(
        `Planilha não encontrada (404). Verifique: 1) SPREADSHEET_ID correto na URL (ex: docs.google.com/spreadsheets/d/ID/edit); 2) Planilha compartilhada com o e-mail da Service Account (editor ou visualizador). ID usado: ${SPREADSHEET_ID}. Detalhe: ${body}`,
      );
    }
    throw new Error(`Sheet meta error: ${body}`);
  }
  const meta = await metaRes.json();
  const metas: SheetMeta[] = (meta.sheets || [])
    .map((s: any) => s?.properties)
    .filter((p: any) => p?.title != null && p?.sheetId != null)
    .map((p: any) => ({ title: String(p.title), sheetId: Number(p.sheetId) }));
  return metas;
}

function pickSheetByGid(metas: SheetMeta[], gid: number): SheetMeta | null {
  return metas.find((m) => Number(m.sheetId) === Number(gid)) ?? null;
}

function pickCrimesSheetFallback(metas: SheetMeta[]): SheetMeta | null {
  return metas.find((m) => normalizeText(m.title).includes("CRIMES")) ??
    metas.find((m) => normalizeText(m.title).includes("AMBIENT")) ??
    null;
}

async function fetchSheetValues(
  token: string,
  sheetName: string,
): Promise<any[][]> {
  const range = encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!A:Z`);
  const dataRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!dataRes.ok) throw new Error(`Sheet data error: ${await dataRes.text()}`);
  const body = await dataRes.json();
  return (body.values || []) as any[][];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Sync dim_regiao_administrativa -> dim_local (garantir que RAs existam em dim_local)
    const { data: raRows } = await supabase
      .from("dim_regiao_administrativa")
      .select("id, nome");
    if (raRows?.length) {
      for (const ra of raRows) {
        const nome = String(ra.nome ?? "").trim();
        if (!nome) continue;
        const { data: existing } = await supabase
          .from("dim_local")
          .select("id")
          .eq("nome", nome)
          .limit(1)
          .maybeSingle();
        if (!existing?.id) {
          await supabase.from("dim_local").insert({ nome });
        }
      }
      console.log("[sync-radio-operador] Synced dim_regiao_administrativa -> dim_local");
    }

    const token = await getAccessToken();
    console.log("[sync-radio-operador] Got access token");

    const metas = await fetchSheetMetas(token);
    console.log("[sync-radio-operador] Sheets:", metas);

    const resgateMeta = pickSheetByGid(metas, RESGATE_GID);
    if (!resgateMeta) {
      throw new Error(`Aba de resgate com gid=${RESGATE_GID} não encontrada.`);
    }

    const crimesMeta =
      (CRIMES_GID != null ? pickSheetByGid(metas, CRIMES_GID) : null) ??
      pickCrimesSheetFallback(metas);

    if (!crimesMeta) {
      console.warn(
        "[sync-radio-operador] Aba de crimes não encontrada (CRIMES_GID não setado e fallback por nome falhou).",
      );
    }

    // Pre-load dimension caches
    const equipeCache = await loadDimCache(supabase, "dim_equipe", "nome");
    const localCache = await loadDimCache(supabase, "dim_local", "nome");
    const grupamentoCache = await loadDimCache(
      supabase,
      "dim_grupamento",
      "nome",
    );
    const desfechoCache = await loadDimCache(supabase, "dim_desfecho", "nome");
    const destinacaoCache = await loadDimCache(
      supabase,
      "dim_destinacao",
      "nome",
    );

    const results: any[] = [];

    // ── RESGATE (gid=0 by default) ──
    {
      const sheetName = resgateMeta.title;
      const allRows = await fetchSheetValues(token, sheetName);

      console.log(
        `[sync-radio-operador] Resgate "${sheetName}" total rows: ${allRows.length}`,
      );

      const headers = (allRows[HEADER_ROW_INDEX] || []).map((h: any) =>
        normalizeText(h)
      );
      ensureHeaderOk(headers, sheetName);

      // Map header positions by pattern matching
      const iData = colIdx(headers, ["DATA"]);
      const iEquipe = colIdx(headers, ["EQUIPE"]);
      const iCopom = colIdx(headers, ["COPOM", "OCORRÊNCIA", "OCORRENCIA"]);
      const iFauna = colIdx(headers, ["FAUNA"]);
      const iHCadastro = colIdx(headers, ["CADASTRO"]);
      const iHRecebido = colIdx(headers, ["RECEBIDO", "COPOM"]);
      const iHDespacho = colIdx(headers, ["DESPACHO"]);
      const iHFinal = colIdx(headers, ["FINALIZAÇÃO", "FINALIZACAO"]);
      const iTelefone = colIdx(headers, ["TELEFONE"]);
      const iLocal = colIdx(headers, ["LOCAL"]);
      const iPrefixo = colIdx(headers, ["PREFIXO"]);
      const iGrupamento = colIdx(headers, ["GRUPAMENTO"]);
      const iCmtVtr = colIdx(headers, ["CMT"]);
      const iDesfecho = colIdx(headers, ["DESFECHO"]);
      const iDestinacao = colIdx(headers, ["DESTINAÇÃO", "DESTINACAO"]);
      const iRap = colIdx(headers, ["RAP"]);
      const iDur1 = colIdx(headers, ["190"]);
      const iDur2 = findSecondDuracao(headers, iDur1);

      // Hard guards: if these aren't found, we prefer to throw (avoids inserting null junk)
      for (const [name, idx] of Object.entries({
        DATA: iData,
        EQUIPE: iEquipe,
        LOCAL: iLocal,
      })) {
        if (idx < 0) {
          throw new Error(
            `Resgate: coluna obrigatória não encontrada: ${name}`,
          );
        }
      }

      console.log(
        "[sync-radio-operador] Resgate column mapping:",
        {
          iData,
          iEquipe,
          iCopom,
          iFauna,
          iHCadastro,
          iHRecebido,
          iHDespacho,
          iHFinal,
          iTelefone,
          iLocal,
          iPrefixo,
          iGrupamento,
          iCmtVtr,
          iDesfecho,
          iDestinacao,
          iRap,
          iDur1,
          iDur2,
        },
      );

      // Delete existing resgate data
      const { error: delErr } = await supabase
        .from("fat_controle_ocorrencias_resgate_2026")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) {
        console.error(
          "[sync-radio-operador] Delete resgate error:",
          delErr.message,
        );
      }

      const resgateRows: any[] = [];
      let skipped = 0;

      for (let i = DATA_START_INDEX; i < allRows.length; i++) {
        const row = allRows[i] || [];

        const data = parseDate(getCell(row, iData));
        if (!data) {
          skipped++;
          continue;
        }

        const equipeText = normalizeText(getCell(row, iEquipe));
        const localText = String(getCell(row, iLocal) ?? "").trim();
        const grupText = normalizeText(getCell(row, iGrupamento));
        const desfText = normalizeText(getCell(row, iDesfecho));
        const destText = normalizeText(getCell(row, iDestinacao));

        const equipe_id = equipeText
          ? await findOrCreate(
            supabase,
            "dim_equipe",
            "nome",
            equipeText,
            equipeCache,
          )
          : null;

        const local_id = localText
          ? await findOrCreate(
            supabase,
            "dim_local",
            "nome",
            localText,
            localCache,
          )
          : null;

        const grupamento_id = grupText
          ? await findOrCreate(
            supabase,
            "dim_grupamento",
            "nome",
            grupText,
            grupamentoCache,
          )
          : null;

        const desfecho_id = desfText
          ? await findOrCreate(
            supabase,
            "dim_desfecho",
            "nome",
            desfText,
            desfechoCache,
          )
          : null;

        const destinacao_id = destText
          ? await findOrCreate(
            supabase,
            "dim_destinacao",
            "nome",
            destText,
            destinacaoCache,
          )
          : null;

        resgateRows.push({
          data,
          equipe_id,
          ocorrencia_copom: String(getCell(row, iCopom) ?? "").trim() || null,
          fauna: String(getCell(row, iFauna) ?? "").trim() || null,
          hora_cadastro_ocorrencia: parseTime(getCell(row, iHCadastro)),
          hora_recebido_copom_central: parseTime(getCell(row, iHRecebido)),
          hora_despacho_ro: parseTime(getCell(row, iHDespacho)),
          hora_finalizacao_ocorrencia: parseTime(getCell(row, iHFinal)),
          telefone: normalizePhone(getCell(row, iTelefone)),
          local_id,
          prefixo: String(getCell(row, iPrefixo) ?? "").trim() || null,
          grupamento_id,
          cmt_vtr: String(getCell(row, iCmtVtr) ?? "").trim() || null,
          desfecho_id,
          destinacao_id,
          numero_rap: String(getCell(row, iRap) ?? "").trim() || null,
          duracao_cadastro_190_encaminhamento_copom: parseInterval(
            getCell(row, iDur1),
          ),
          duracao_despacho_finalizacao: parseInterval(getCell(row, iDur2)),
        });
      }

      // Batch insert in chunks of 50 (log per-chunk errors)
      let inserted = 0;
      const chunkErrors: any[] = [];

      for (let i = 0; i < resgateRows.length; i += 50) {
        const chunk = resgateRows.slice(i, i + 50);
        const { error } = await supabase
          .from("fat_controle_ocorrencias_resgate_2026")
          .insert(chunk);

        if (error) {
          console.error(
            `[sync-radio-operador] Resgate insert chunk ${i} error:`,
            error.message,
          );
          // Store first 3 sample rows to help debug constraints (e.g., phone CHECK)
          chunkErrors.push({
            at: i,
            message: error.message,
            sample: chunk.slice(0, 3),
          });
        } else {
          inserted += chunk.length;
        }
      }

      results.push({
        sheet: sheetName,
        gid: resgateMeta.sheetId,
        type: "resgate",
        total_rows: Math.max(allRows.length - DATA_START_INDEX, 0),
        inserted,
        skipped,
        chunk_errors: chunkErrors.length ? chunkErrors : undefined,
      });

      console.log(
        `[sync-radio-operador] Resgate: inserted=${inserted}, skipped=${skipped}`,
      );
    }

    // ── CRIMES (by CRIMES_GID or fallback) ──
    if (crimesMeta) {
      const sheetName = crimesMeta.title;
      const allRows = await fetchSheetValues(token, sheetName);

      console.log(
        `[sync-radio-operador] Crimes "${sheetName}" total rows: ${allRows.length}`,
      );

      const headers = (allRows[HEADER_ROW_INDEX] || []).map((h: any) =>
        normalizeText(h)
      );
      ensureHeaderOk(headers, sheetName);

      const iData = colIdx(headers, ["DATA"]);
      const iEquipe = colIdx(headers, ["EQUIPE"]);
      const iCopom = colIdx(headers, ["COPOM", "OCORRÊNCIA", "OCORRENCIA"]);
      const iCrime = colIdx(headers, ["CRIME"]);
      const iHCadastro = colIdx(headers, ["CADASTRO"]);
      const iHRecebido = colIdx(headers, ["RECEBIDO", "COPOM"]);
      const iHDespacho = colIdx(headers, ["DESPACHO"]);
      const iHFinal = colIdx(headers, ["FINALIZAÇÃO", "FINALIZACAO"]);
      const iTelefone = colIdx(headers, ["TELEFONE"]);
      const iLocal = colIdx(headers, ["LOCAL"]);
      const iPrefixo = colIdx(headers, ["PREFIXO"]);
      const iGrupamento = colIdx(headers, ["GRUPAMENTO"]);
      const iCmtVtr = colIdx(headers, ["CMT"]);
      const iDesfecho = colIdx(headers, ["DESFECHO"]);
      const iDestinacao = colIdx(headers, ["DESTINAÇÃO", "DESTINACAO"]);
      const iRap = colIdx(headers, ["RAP"]);
      const iTco = colIdx(headers, ["TCO"]);
      const iDur1 = colIdx(headers, ["190"]);
      const iDur2 = findSecondDuracao(headers, iDur1);

      if (iData < 0) {
        throw new Error(`Crimes: coluna obrigatória não encontrada: DATA`);
      }

      console.log(
        "[sync-radio-operador] Crimes column mapping:",
        { iData, iEquipe, iCopom, iCrime, iTco, iLocal, iDur1, iDur2 },
      );

      // Delete existing crimes data
      const { error: delErr } = await supabase
        .from("fat_controle_ocorrencias_crime_ambientais_2026")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) {
        console.error(
          "[sync-radio-operador] Delete crimes error:",
          delErr.message,
        );
      }

      const crimeRows: any[] = [];
      let skipped = 0;

      for (let i = DATA_START_INDEX; i < allRows.length; i++) {
        const row = allRows[i] || [];
        const data = parseDate(getCell(row, iData));
        if (!data) {
          skipped++
          continue;
        }

        const equipeText = normalizeText(getCell(row, iEquipe));
        const localText = String(getCell(row, iLocal) ?? "").trim();
        const grupText = normalizeText(getCell(row, iGrupamento));
        const desfText = normalizeText(getCell(row, iDesfecho));
        const destText = normalizeText(getCell(row, iDestinacao));

        const equipe_id = equipeText
          ? await findOrCreate(
            supabase,
            "dim_equipe",
            "nome",
            equipeText,
            equipeCache,
          )
          : null;

        const local_id = localText
          ? await findOrCreate(
            supabase,
            "dim_local",
            "nome",
            localText,
            localCache,
          )
          : null;

        const grupamento_id = grupText
          ? await findOrCreate(
            supabase,
            "dim_grupamento",
            "nome",
            grupText,
            grupamentoCache,
          )
          : null;

        const desfecho_id = desfText
          ? await findOrCreate(
            supabase,
            "dim_desfecho",
            "nome",
            desfText,
            desfechoCache,
          )
          : null;

        const destinacao_id = destText
          ? await findOrCreate(
            supabase,
            "dim_destinacao",
            "nome",
            destText,
            destinacaoCache,
          )
          : null;

        crimeRows.push({
          data,
          equipe_id,
          ocorrencia_copom: String(getCell(row, iCopom) ?? "").trim() || null,
          crime: String(getCell(row, iCrime) ?? "").trim() || null,
          hora_cadastro_ocorrencia: parseTime(getCell(row, iHCadastro)),
          hora_recebido_copom_central: parseTime(getCell(row, iHRecebido)),
          hora_despacho_ro: parseTime(getCell(row, iHDespacho)),
          hora_finalizacao_ocorrencia: parseTime(getCell(row, iHFinal)),
          telefone: normalizePhone(getCell(row, iTelefone)),
          local_id,
          prefixo: String(getCell(row, iPrefixo) ?? "").trim() || null,
          grupamento_id,
          cmt_vtr: String(getCell(row, iCmtVtr) ?? "").trim() || null,
          desfecho_id,
          destinacao_id,
          numero_rap: String(getCell(row, iRap) ?? "").trim() || null,
          numero_tco_pmdf_ou_tco_apf_pcdf:
            String(getCell(row, iTco) ?? "").trim() || null,
          duracao_cadastro_190_encaminhamento_copom: parseInterval(
            getCell(row, iDur1),
          ),
          duracao_despacho_finalizacao: parseInterval(getCell(row, iDur2)),
        });
      }

      let inserted = 0;
      const chunkErrors: any[] = [];

      for (let i = 0; i < crimeRows.length; i += 50) {
        const chunk = crimeRows.slice(i, i + 50);
        const { error } = await supabase
          .from("fat_controle_ocorrencias_crime_ambientais_2026")
          .insert(chunk);

        if (error) {
          console.error(
            `[sync-radio-operador] Crimes insert chunk ${i} error:`,
            error.message,
          );
          chunkErrors.push({
            at: i,
            message: error.message,
            sample: chunk.slice(0, 3),
          });
        } else {
          inserted += chunk.length;
        }
      }

      results.push({
        sheet: sheetName,
        gid: crimesMeta.sheetId,
        type: "crimes",
        total_rows: Math.max(allRows.length - DATA_START_INDEX, 0),
        inserted,
        skipped,
        chunk_errors: chunkErrors.length ? chunkErrors : undefined,
      });

      console.log(
        `[sync-radio-operador] Crimes: inserted=${inserted}, skipped=${skipped}`,
      );
    }

    const response = {
      success: true,
      synced_at: new Date().toISOString(),
      results,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[sync-radio-operador] Error:", errMsg, error);
    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
