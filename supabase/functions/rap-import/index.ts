// Supabase Edge Function: Importador de RAPs do Google Drive
// Endpoint: POST /functions/v1/rap-import

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { parseRAP } from "./utils/parser.ts";
import { normalizeData } from "./utils/normalizer.ts";
import { validateRequiredFields, ValidationResult } from "./utils/validator.ts";
import { resolveLookups } from "./utils/lookup.ts";
import { extractTextFromPDF } from "./utils/pdf-extractor.ts";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-import-secret",
};

interface ImportRequest {
  fileId: string;
  fileName: string;
  folderId: string;
  modifiedTime: string;
  pdfBase64: string;
}

interface ImportResponse {
  status: "success" | "needs_ocr" | "missing_required_fields" | "error";
  message: string;
  logId?: string;
  insertedIds?: string[];
  missingFields?: string[];
  warnings?: string[];
}

// Helper function to get base64 size
function getBase64Size(base64String: string): number {
  try {
    return base64Decode(base64String).length;
  } catch {
    return 0;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logId: string | undefined;

  try {
    // Validar secret
    const importSecret = req.headers.get("x-import-secret");
    const expectedSecret = Deno.env.get("IMPORT_SECRET");
    
    if (!expectedSecret) {
      console.error("IMPORT_SECRET não configurado");
      return new Response(
        JSON.stringify({ status: "error", message: "Configuração do servidor inválida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (importSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ status: "error", message: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: ImportRequest = await req.json();
    const { fileId, fileName, folderId, modifiedTime, pdfBase64 } = body;

    if (!fileId || !fileName || !pdfBase64) {
      return new Response(
        JSON.stringify({ status: "error", message: "Campos obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair texto do PDF
    let pdfText: string;
    try {
      pdfText = await extractTextFromPDF(pdfBase64);
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const logEntry = await createLogEntry(supabase, {
        fileId,
        fileName,
        folderId,
        modifiedTime,
        status: "error",
        errorMessage: `Erro ao extrair texto: ${errMessage}`,
        processingTimeMs: Date.now() - startTime,
        pdfSizeBytes: getBase64Size(pdfBase64),
      });
      return new Response(
        JSON.stringify({ status: "error", message: "Erro ao processar PDF", logId: logEntry.id }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se texto está vazio (PDF escaneado)
    if (!pdfText || pdfText.trim().length === 0) {
      const logEntry = await createLogEntry(supabase, {
        fileId,
        fileName,
        folderId,
        modifiedTime,
        status: "needs_ocr",
        missingFields: ["pdf_text_empty"],
        errorMessage: "Texto não extraído do PDF (possivelmente escaneado)",
        rawExcerpt: "",
        processingTimeMs: Date.now() - startTime,
        pdfSizeBytes: getBase64Size(pdfBase64),
      });
      return new Response(
        JSON.stringify({
          status: "needs_ocr",
          message: "PDF precisa de OCR",
          logId: logEntry.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse do RAP
    const parsedData = parseRAP(pdfText);
    
    // Normalizar dados
    const normalizedData = normalizeData(parsedData);

    // Validar campos obrigatórios (gate de inserção)
    const validation = validateRequiredFields(normalizedData);

    if (!validation.isValid) {
      const logEntry = await createLogEntry(supabase, {
        fileId,
        fileName,
        folderId,
        modifiedTime,
        rapNumero: normalizedData.numero_rap,
        rapTipo: normalizedData.tipo || "resgate",
        status: "missing_required_fields",
        missingFields: validation.missingFields,
        errorMessage: `Campos obrigatórios faltando: ${validation.missingFields.join(", ")}`,
        rawExcerpt: pdfText.substring(0, 2000), // Primeiros 2000 caracteres
        processingTimeMs: Date.now() - startTime,
        pdfSizeBytes: getBase64Size(pdfBase64),
      });
      return new Response(
        JSON.stringify({
          status: "missing_required_fields",
          message: "Campos obrigatórios faltando",
          logId: logEntry.id,
          missingFields: validation.missingFields,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolver lookups (FKs)
    const resolvedData = await resolveLookups(supabase, normalizedData);

    // Preparar dados para inserção
    const insertData = prepareInsertData(resolvedData);

    // Inserir na tabela fato
    const insertedIds: string[] = [];
    const warnings: string[] = [...(resolvedData.warnings || [])];

    for (const data of insertData) {
      try {
        const { data: inserted, error } = await supabase
          .from("fat_registros_de_resgate")
          .insert(data)
          .select("id");

        if (error) {
          console.error("Erro ao inserir registro:", error);
          warnings.push(`erro_insercao: ${error.message}`);
        } else if (inserted && inserted.length > 0) {
          insertedIds.push(inserted[0].id);
        }
      } catch (error) {
        console.error("Erro ao inserir registro:", error);
        const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
        warnings.push(`erro_insercao: ${errMessage}`);
      }
    }

    // Criar log de sucesso
    const logEntry = await createLogEntry(supabase, {
      fileId,
      fileName,
      folderId,
      modifiedTime,
      rapNumero: normalizedData.numero_rap,
      rapTipo: normalizedData.tipo || "resgate",
      status: insertedIds.length > 0 ? "success" : "error",
      insertedIds: insertedIds.length > 0 ? insertedIds : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      errorMessage: insertedIds.length === 0 ? "Nenhum registro foi inserido" : undefined,
      rawExcerpt: pdfText.substring(0, 2000),
      processingTimeMs: Date.now() - startTime,
      pdfSizeBytes: getBase64Size(pdfBase64),
    });

    logId = logEntry.id;

    return new Response(
      JSON.stringify({
        status: insertedIds.length > 0 ? "success" : "error",
        message: insertedIds.length > 0
          ? `${insertedIds.length} registro(s) inserido(s) com sucesso`
          : "Nenhum registro foi inserido",
        logId,
        insertedIds,
        warnings: warnings.length > 0 ? warnings : undefined,
      } as ImportResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro geral:", error);
    const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    // Tentar criar log de erro mesmo em caso de falha crítica
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const logEntry = await createLogEntry(supabase, {
        fileId: "unknown",
        fileName: "unknown",
        status: "error",
        errorMessage: errMessage,
        processingTimeMs: Date.now() - startTime,
      });
      logId = logEntry.id;
    } catch (logError) {
      console.error("Erro ao criar log:", logError);
    }

    return new Response(
      JSON.stringify({
        status: "error",
        message: errMessage,
        logId,
      } as ImportResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface LogEntryData {
  fileId: string;
  fileName: string;
  folderId?: string;
  modifiedTime?: string;
  rapNumero?: string;
  rapTipo?: string;
  status: string;
  missingFields?: string[];
  warnings?: string[];
  errorMessage?: string;
  rawExcerpt?: string;
  insertedIds?: string[];
  processingTimeMs: number;
  pdfSizeBytes?: number;
}

async function createLogEntry(supabase: any, data: LogEntryData) {
  const { data: logEntry, error } = await supabase
    .from("rap_import_logs")
    .insert({
      file_id: data.fileId,
      file_name: data.fileName,
      folder_id: data.folderId,
      modified_time: data.modifiedTime ? new Date(data.modifiedTime).toISOString() : null,
      rap_numero: data.rapNumero,
      rap_tipo: data.rapTipo,
      status: data.status,
      missing_fields: data.missingFields || [],
      warnings: data.warnings || [],
      error_message: data.errorMessage,
      raw_excerpt: data.rawExcerpt,
      inserted_ids: data.insertedIds || [],
      processing_time_ms: data.processingTimeMs,
      pdf_size_bytes: data.pdfSizeBytes,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar log:", error);
    throw error;
  }

  return logEntry;
}

function prepareInsertData(resolvedData: any): any[] {
  // Se houver múltiplas espécies, criar um registro por espécie
  // Por enquanto, assumimos uma espécie por RAP
  const data: any = {
    data: resolvedData.data,
    latitude_origem: resolvedData.latitude_origem,
    longitude_origem: resolvedData.longitude_origem,
    atropelamento: resolvedData.atropelamento || "Não informado",
    horario_acionamento: resolvedData.horario_acionamento || null,
    horario_termino: resolvedData.horario_termino || null,
    especie_id: resolvedData.especie_id || null,
    regiao_administrativa_id: resolvedData.regiao_administrativa_id || null,
    origem_id: resolvedData.origem_id || null,
    estado_saude_id: resolvedData.estado_saude_id || null,
    estagio_vida_id: resolvedData.estagio_vida_id || null,
    destinacao_id: resolvedData.destinacao_id || null,
    desfecho_id: resolvedData.desfecho_id || null,
    tipo_area_id: resolvedData.tipo_area_id || null,
    numero_tco: resolvedData.numero_tco || null,
    outro_desfecho: resolvedData.outro_desfecho || null,
    numero_termo_entrega: resolvedData.numero_termo_entrega || null,
    hora_guarda_ceapa: resolvedData.hora_guarda_ceapa || null,
    motivo_entrega_ceapa: resolvedData.motivo_entrega_ceapa || null,
    latitude_soltura: resolvedData.latitude_soltura || null,
    longitude_soltura: resolvedData.longitude_soltura || null,
    outro_destinacao: resolvedData.outro_destinacao || null,
    quantidade_adulto: resolvedData.quantidade_adulto || 0,
    quantidade_filhote: resolvedData.quantidade_filhote || 0,
    "quantidade Jovem": resolvedData.quantidade_jovem || 0,
    quantidade_total: resolvedData.quantidade_total || 0,
  };

  return [data];
}
