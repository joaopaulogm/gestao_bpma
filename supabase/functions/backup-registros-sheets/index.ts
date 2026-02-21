// supabase/functions/backup-registros-sheets/index.ts
// Exports all 5 record types from Supabase to Google Sheets (one tab each)
// Resolves all foreign keys manually (no FK constraints in DB)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPREADSHEET_ID = "1eB5YZ2tRRYXy_KcSfPdjQkh9MRK2GobDUbt1gIfpvss";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Google Auth ──
async function getAccessToken(): Promise<string> {
  const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!saJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const b64url = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now,
  };
  const signingInput = `${b64url(header)}.${b64url(claimSet)}`;
  const pem = String(sa.private_key || "");
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const binaryKey = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signingInput}.${sigB64}`,
  });
  if (!res.ok) throw new Error(`Token error: ${await res.text()}`);
  return (await res.json()).access_token;
}

// ── Sheets helpers ──
async function getExistingSheets(token: string) {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties(title,sheetId)`,
    { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`getSheets: ${await res.text()}`);
  const data = await res.json();
  return (data.sheets || []).map((s: any) => ({ title: s.properties.title, sheetId: s.properties.sheetId }));
}

async function batchUpdate(token: string, requests: any[]) {
  if (!requests.length) return;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!res.ok) throw new Error(`batchUpdate: ${await res.text()}`);
}

async function writeSheet(token: string, name: string, rows: any[][]) {
  const range = encodeURIComponent(`'${name.replace(/'/g, "''")}'!A1`);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ range: `'${name}'!A1`, majorDimension: "ROWS", values: rows }),
  });
  if (!res.ok) throw new Error(`writeSheet(${name}): ${await res.text()}`);
}

async function clearSheet(token: string, name: string) {
  const range = encodeURIComponent(`'${name.replace(/'/g, "''")}'`);
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:clear`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
}

// ── Fetch all rows (handles 1000 limit) ──
async function fetchAll(sb: any, table: string, select: string, order?: string) {
  const all: any[] = [];
  let from = 0;
  while (true) {
    let q = sb.from(table).select(select);
    if (order) q = q.order(order, { ascending: false });
    const { data, error } = await q.range(from, from + 999);
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

// ── Build lookup map { id -> record } ──
function buildMap(rows: any[]): Record<string, any> {
  const m: Record<string, any> = {};
  for (const r of rows) m[r.id ?? r.id_tipo_de_crime ?? r.id_enquadramento] = r;
  return m;
}

// ── Formatters ──
const fmt = (v: any) => (v == null || v === "" ? "" : String(v));
const fmtDate = (v: any) => {
  if (!v) return "";
  try { const d = new Date(v); return isNaN(d.getTime()) ? String(v) : `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; } catch { return String(v); }
};
const fmtTime = (v: any) => v ? String(v).substring(0, 5) : "";
const fmtBool = (v: any) => v === true ? "Sim" : v === false ? "Não" : "";
const fmtDT = (v: any) => {
  if (!v) return "";
  try { const d = new Date(v); return isNaN(d.getTime()) ? String(v) : `${fmtDate(v)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; } catch { return String(v); }
};

// ── Main ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = await getAccessToken();
    console.log("[backup-registros] Starting...");

    // ── Fetch all dimension tables in parallel ──
    const [
      dimRA, dimOrigem, dimEspecies, dimEstadoSaude, dimEstagioVida,
      dimDestinacao, dimDesfechoResgates, dimTipoArea, dimGrupServ,
      dimTipoCrime, dimEnquadramento, dimDesfechoCrimeAmb,
      dimTipoPenal, dimDesfechoCrimeComum,
      dimTipoAtivPrev, dimAreaProtegida,
      dimItens,
    ] = await Promise.all([
      fetchAll(sb, "dim_regiao_administrativa", "*"),
      fetchAll(sb, "dim_origem", "*"),
      fetchAll(sb, "dim_especies_fauna", "id, nome_popular, nome_cientifico, classe_taxonomica"),
      fetchAll(sb, "dim_estado_saude", "*"),
      fetchAll(sb, "dim_estagio_vida", "*"),
      fetchAll(sb, "dim_destinacao", "*"),
      fetchAll(sb, "dim_desfecho_resgates", "*"),
      fetchAll(sb, "dim_tipo_de_area", '*'),
      fetchAll(sb, "dim_grupamento_servico", "*"),
      fetchAll(sb, "dim_tipo_de_crime", "*"),
      fetchAll(sb, "dim_enquadramento", "*"),
      fetchAll(sb, "dim_desfecho_crime_ambientais", "*"),
      fetchAll(sb, "dim_tipo_penal", "*"),
      fetchAll(sb, "dim_desfecho_crime_comum", "*"),
      fetchAll(sb, "dim_tipo_atividade_prevencao", "*"),
      fetchAll(sb, "dim_area_especialmente_protegida", "*"),
      fetchAll(sb, "dim_itens_apreensao", "*"),
    ]);

    // Build lookup maps
    const mRA = buildMap(dimRA);
    const mOrigem = buildMap(dimOrigem);
    const mEspecies = buildMap(dimEspecies);
    const mEstSaude = buildMap(dimEstadoSaude);
    const mEstVida = buildMap(dimEstagioVida);
    const mDest = buildMap(dimDestinacao);
    const mDesfResgate = buildMap(dimDesfechoResgates);
    const mTipoArea: Record<string, any> = {};
    for (const r of dimTipoArea) mTipoArea[r.id] = r;
    const mGrupServ = buildMap(dimGrupServ);
    const mTipoCrime: Record<string, any> = {};
    for (const r of dimTipoCrime) mTipoCrime[r.id_tipo_de_crime] = r;
    const mEnquad: Record<string, any> = {};
    for (const r of dimEnquadramento) mEnquad[r.id_enquadramento] = r;
    const mDesfCrimeAmb = buildMap(dimDesfechoCrimeAmb);
    const mTipoPenal = buildMap(dimTipoPenal);
    const mDesfCrimeComum = buildMap(dimDesfechoCrimeComum);
    const mTipoAtiv = buildMap(dimTipoAtivPrev);
    const mAreaProt = buildMap(dimAreaProtegida);
    const mItens = buildMap(dimItens);

    // ── Fetch fact tables ──
    const [fauna, ambientais, crimesComuns, prevencao, aprCrime, aprCrimeComum] = await Promise.all([
      fetchAll(sb, "fat_registros_de_resgate", "*", "data"),
      fetchAll(sb, "fat_registros_de_crimes_ambientais", "*", "data"),
      fetchAll(sb, "fat_crimes_comuns", "*", "data"),
      fetchAll(sb, "fat_atividades_prevencao", "*", "data"),
      fetchAll(sb, "fat_ocorrencia_apreensao", "*", "created_at"),
      fetchAll(sb, "fat_ocorrencia_apreensao_crime_comum", "*", "created_at"),
    ]);

    console.log(`[backup-registros] Fauna:${fauna.length} Amb:${ambientais.length} Crime:${crimesComuns.length} Prev:${prevencao.length} Apr:${aprCrime.length+aprCrimeComum.length}`);

    // ── Lookup helper ──
    const L = (map: Record<string, any>, id: any, field = "nome") => {
      if (!id) return "";
      const r = map[id];
      return r ? fmt(r[field]) : "";
    };

    // ── FAUNA rows ──
    const faunaRows: any[][] = [[
      "Data", "Horário Acionamento", "Horário Término", "Região Administrativa",
      "Origem", "Espécie (Popular)", "Espécie (Científica)", "Classe Taxonômica",
      "Estado de Saúde", "Estágio de Vida", "Atropelamento", "Animal Identificado",
      "Qtd Adulto", "Qtd Filhote", "Qtd Total",
      "Destinação", "Desfecho", "Nº TCO", "Outro Desfecho",
      "Nº Termo Entrega", "Hora Guarda CEAPA", "Motivo Entrega CEAPA",
      "Outro Destinação", "Tipo de Área", "Grupamento/Serviço",
      "Lat Origem", "Lng Origem", "Lat Soltura", "Lng Soltura", "Criado em",
    ]];
    for (const r of fauna) {
      const esp = mEspecies[r.especie_id];
      faunaRows.push([
        fmtDate(r.data), fmtTime(r.horario_acionamento), fmtTime(r.horario_termino),
        L(mRA, r.regiao_administrativa_id), L(mOrigem, r.origem_id),
        esp?.nome_popular || "", esp?.nome_cientifico || "", esp?.classe_taxonomica || "",
        L(mEstSaude, r.estado_saude_id), L(mEstVida, r.estagio_vida_id),
        fmt(r.atropelamento), fmtBool(r.animal_identificado),
        fmt(r.quantidade_adulto), fmt(r.quantidade_filhote), fmt(r.quantidade_total),
        L(mDest, r.destinacao_id), L(mDesfResgate, r.desfecho_id),
        fmt(r.numero_tco), fmt(r.outro_desfecho),
        fmt(r.numero_termo_entrega), fmt(r.hora_guarda_ceapa), fmt(r.motivo_entrega_ceapa),
        fmt(r.outro_destinacao),
        L(mTipoArea, r.tipo_area_id, "Tipo de Área"),
        L(mGrupServ, r.grupamento_servico_id),
        fmt(r.latitude_origem), fmt(r.longitude_origem),
        fmt(r.latitude_soltura), fmt(r.longitude_soltura),
        fmtDT(r.created_at),
      ]);
    }

    // ── AMBIENTAIS rows ──
    const ambRows: any[][] = [[
      "Data", "Horário Acionamento", "Horário Desfecho",
      "Região Administrativa", "Tipo de Área", "Grupamento/Serviço",
      "Tipo de Crime", "Enquadramento",
      "Área Protegida", "Lat", "Lng", "Ocorreu Apreensão",
      "Desfecho", "Procedimento Legal",
      "Detidos (Maior)", "Detidos (Menor)", "Liberados (Maior)", "Liberados (Menor)",
      "Tipo Poluição", "Desc Poluição", "Tipo Intervenção",
      "Estruturas", "Qtd Estruturas", "Tipo Impedimento",
      "Desc Adm Ambiental", "Criado em",
    ]];
    for (const r of ambientais) {
      ambRows.push([
        fmtDate(r.data), fmtTime(r.horario_acionamento), fmtTime(r.horario_desfecho),
        L(mRA, r.regiao_administrativa_id),
        L(mTipoArea, r.tipo_area_id, "Tipo de Área"),
        L(mGrupServ, r.grupamento_servico_id),
        L(mTipoCrime, r.tipo_crime_id, "Tipo de Crime"),
        L(mEnquad, r.enquadramento_id, "Enquadramento"),
        fmtBool(r.area_protegida), fmt(r.latitude), fmt(r.longitude),
        fmtBool(r.ocorreu_apreensao),
        L(mDesfCrimeAmb, r.desfecho_id),
        fmt(r.procedimento_legal),
        fmt(r.qtd_detidos_maior), fmt(r.qtd_detidos_menor),
        fmt(r.qtd_liberados_maior), fmt(r.qtd_liberados_menor),
        fmt(r.tipo_poluicao), fmt(r.descricao_poluicao), fmt(r.tipo_intervencao),
        fmt(r.estruturas_encontradas), fmt(r.qtd_estruturas), fmt(r.tipo_impedimento),
        fmt(r.descricao_adm_ambiental), fmtDT(r.created_at),
      ]);
    }

    // ── CRIMES COMUNS rows ──
    const crimeRows: any[][] = [[
      "Data", "Horário Acionamento", "Horário Desfecho",
      "Região Administrativa", "Tipo de Área", "Grupamento/Serviço",
      "Tipo Penal", "Natureza Crime", "Enquadramento Legal",
      "Situação Autor", "Descrição Ocorrência", "Local Específico",
      "Lat", "Lng", "Ocorreu Apreensão",
      "Desfecho", "Procedimento Legal",
      "Detidos (Maior)", "Detidos (Menor)", "Liberados (Maior)", "Liberados (Menor)",
      "Vítimas", "Suspeitos", "Arma", "Tipo Arma",
      "Material Apreendido", "Desc Material",
      "Veículo", "Tipo Veículo", "Placa", "Observações", "Criado em",
    ]];
    for (const r of crimesComuns) {
      crimeRows.push([
        fmtDate(r.data), fmtTime(r.horario_acionamento), fmtTime(r.horario_desfecho),
        L(mRA, r.regiao_administrativa_id),
        L(mTipoArea, r.tipo_area_id, "Tipo de Área"),
        L(mGrupServ, r.grupamento_servico_id),
        L(mTipoPenal, r.tipo_penal_id),
        fmt(r.natureza_crime), fmt(r.enquadramento_legal), fmt(r.situacao_autor),
        fmt(r.descricao_ocorrencia), fmt(r.local_especifico),
        fmt(r.latitude), fmt(r.longitude), fmtBool(r.ocorreu_apreensao),
        L(mDesfCrimeComum, r.desfecho_id),
        fmt(r.procedimento_legal),
        fmt(r.qtd_detidos_maior), fmt(r.qtd_detidos_menor),
        fmt(r.qtd_liberados_maior), fmt(r.qtd_liberados_menor),
        fmt(r.vitimas_envolvidas), fmt(r.suspeitos_envolvidos),
        fmtBool(r.arma_utilizada), fmt(r.tipo_arma),
        fmtBool(r.material_apreendido), fmt(r.descricao_material),
        fmtBool(r.veiculo_envolvido), fmt(r.tipo_veiculo), fmt(r.placa_veiculo),
        fmt(r.observacoes), fmtDT(r.created_at),
      ]);
    }

    // ── PREVENÇÃO rows ──
    const prevRows: any[][] = [[
      "Data", "Horário Início", "Horário Término",
      "Região Administrativa", "Tipo de Atividade", "Grupamento/Serviço",
      "Missão", "Nº OS", "Qtd Público",
      "Em Área Protegida", "Área Protegida",
      "Lat", "Lng", "Observações", "Criado em",
    ]];
    for (const r of prevencao) {
      prevRows.push([
        fmtDate(r.data), fmtTime(r.horario_inicio), fmtTime(r.horario_termino),
        L(mRA, r.regiao_administrativa_id),
        L(mTipoAtiv, r.tipo_atividade_id),
        L(mGrupServ, r.grupamento_servico_id),
        fmt(r.missao), fmt(r.numero_os), fmt(r.quantidade_publico),
        fmtBool(r.em_area_protegida),
        L(mAreaProt, r.area_protegida_id),
        fmt(r.latitude), fmt(r.longitude),
        fmt(r.observacoes), fmtDT(r.created_at),
      ]);
    }

    // ── APREENSÕES rows ──
    // Build date lookup from ambientais and crimes comuns
    const ambDateMap: Record<string, string> = {};
    for (const a of ambientais) ambDateMap[a.id] = a.data;
    const crDateMap: Record<string, string> = {};
    for (const c of crimesComuns) crDateMap[c.id] = c.data;

    const aprRows: any[][] = [[
      "Tipo Ocorrência", "Data Ocorrência", "Item Apreendido",
      "Tipo de Crime", "Bem Apreendido", "Uso Ilícito", "Quantidade", "Criado em",
    ]];
    for (const r of aprCrime) {
      const item = mItens[r.id_item_apreendido];
      aprRows.push([
        "Crime Ambiental", fmtDate(ambDateMap[r.id_ocorrencia] || ""),
        item?.Item || "", item?.["Tipo de Crime"] || "", item?.["Bem Apreendido"] || "", item?.["Uso Ilicito"] || "",
        fmt(r.quantidade), fmtDT(r.created_at),
      ]);
    }
    for (const r of aprCrimeComum) {
      const item = mItens[r.id_item_apreendido];
      aprRows.push([
        "Crime Comum", fmtDate(crDateMap[r.id_ocorrencia] || ""),
        item?.Item || "", item?.["Tipo de Crime"] || "", item?.["Bem Apreendido"] || "", item?.["Uso Ilicito"] || "",
        fmt(r.quantidade), fmtDT(r.created_at),
      ]);
    }

    // ── Ensure tabs exist ──
    const TAB_NAMES = ["Fauna", "Ambientais", "Crimes Comuns", "Prevenção", "Apreensões"];
    const existing = await getExistingSheets(token);
    const existingNames = new Set(existing.map((s: any) => s.title));
    const addReqs: any[] = [];
    for (const name of TAB_NAMES) {
      if (!existingNames.has(name)) addReqs.push({ addSheet: { properties: { title: name } } });
    }
    if (addReqs.length) await batchUpdate(token, addReqs);

    // ── Write tabs ──
    const tabData: [string, any[][]][] = [
      ["Fauna", faunaRows], ["Ambientais", ambRows], ["Crimes Comuns", crimeRows],
      ["Prevenção", prevRows], ["Apreensões", aprRows],
    ];
    for (const [name, rows] of tabData) {
      await clearSheet(token, name);
      if (rows.length > 0) await writeSheet(token, name, rows);
      console.log(`[backup-registros] ${name}: ${rows.length - 1} registros`);
    }

    // ── Format headers ──
    const updatedSheets = await getExistingSheets(token);
    const fmtReqs: any[] = [];
    for (const name of TAB_NAMES) {
      const sheet = updatedSheets.find((s: any) => s.title === name);
      if (!sheet) continue;
      fmtReqs.push(
        { repeatCell: { range: { sheetId: sheet.sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red:1, green:1, blue:1 } },
            backgroundColor: { red: 0.15, green: 0.35, blue: 0.6 } } },
          fields: "userEnteredFormat(textFormat,backgroundColor)" } },
        { updateSheetProperties: { properties: { sheetId: sheet.sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: "gridProperties.frozenRowCount" } },
      );
    }
    if (fmtReqs.length) await batchUpdate(token, fmtReqs);

    const summary = {
      success: true, timestamp: new Date().toISOString(),
      counts: { fauna: fauna.length, ambientais: ambientais.length, crimes_comuns: crimesComuns.length,
        prevencao: prevencao.length, apreensoes: aprCrime.length + aprCrimeComum.length },
    };
    console.log("[backup-registros] Done!", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[backup-registros] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
