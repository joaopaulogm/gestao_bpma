// Edge Function: admin-pessoas
// Descrição: Gerencia todas as operações de escrita (INSERT/UPDATE/DELETE) para o módulo Seção Pessoas
// Acesso: Apenas usuários admin podem usar esta função
// Escrita: Usa service_role para bypass RLS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActionPayload {
  action: string;
  [key: string]: unknown;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SB_URL = Deno.env.get("SB_URL") || Deno.env.get("SUPABASE_URL");
    const SB_ANON_KEY = Deno.env.get("SB_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SB_URL || !SB_ANON_KEY || !SB_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create anon client to verify user
    const anonClient = createClient(SB_URL, SB_ANON_KEY);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return new Response(
        JSON.stringify({ ok: false, error: "Access denied. Admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for writes
    const serviceClient = createClient(SB_URL, SB_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request body
    const payload: ActionPayload = await req.json();
    const { action, ...data } = payload;

    if (!action) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: unknown;

    // Handle different actions
    switch (action) {
      case "abono_upsert": {
        // Resolve efetivo_id from matricula if needed
        let efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        if (!efetivoId && data.matricula && typeof data.matricula === 'string') {
          const { data: efetivo, error: efetivoError } = await serviceClient
            .from("dim_efetivo")
            .select("id")
            .ilike("matricula", data.matricula)
            .single();
          
          if (efetivoError || !efetivo) {
            return new Response(
              JSON.stringify({ ok: false, error: `Efetivo not found: ${data.matricula}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          efetivoId = efetivo.id;
        }

        const ano = typeof data.ano === 'number' ? data.ano : undefined;
        const mes = typeof data.mes === 'number' ? data.mes : undefined;

        if (!efetivoId || !ano || !mes) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, ano, mes" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: abonoData, error: abonoError } = await serviceClient
          .from("fat_abono")
          .upsert({
            efetivo_id: efetivoId,
            ano: ano,
            mes: mes,
            observacao: (data.observacao && typeof data.observacao === 'string') ? data.observacao : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "efetivo_id,ano,mes",
          })
          .select()
          .single();

        if (abonoError) throw abonoError;
        result = abonoData;
        break;
      }

      case "restricao_upsert": {
        let efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        if (!efetivoId && data.matricula && typeof data.matricula === 'string') {
          const { data: efetivo, error: efetivoError } = await serviceClient
            .from("dim_efetivo")
            .select("id")
            .ilike("matricula", data.matricula)
            .single();
          
          if (efetivoError || !efetivo) {
            return new Response(
              JSON.stringify({ ok: false, error: `Efetivo not found: ${data.matricula}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          efetivoId = efetivo.id;
        }

        const tipoRestricao = typeof data.tipo_restricao === 'string' ? data.tipo_restricao : undefined;
        const dataInicioRaw = data.data_inicio;

        if (!efetivoId || !tipoRestricao || !dataInicioRaw) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, tipo_restricao, data_inicio" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize dates
        const dataInicioStr = typeof dataInicioRaw === 'string' ? dataInicioRaw : String(dataInicioRaw);
        const dataInicio = new Date(dataInicioStr);
        const dataFimStr = data.data_fim ? (typeof data.data_fim === 'string' ? data.data_fim : String(data.data_fim)) : null;
        let dataFim = dataFimStr ? new Date(dataFimStr) : null;
        
        // If data_fim < data_inicio, set data_fim = data_inicio
        if (dataFim && dataFim < dataInicio) {
          dataFim = dataInicio;
        }

        const ano = dataInicio.getFullYear();

        const { data: restricaoData, error: restricaoError } = await serviceClient
          .from("fat_restricoes")
          .upsert({
            efetivo_id: efetivoId,
            ano: ano,
            tipo_restricao: tipoRestricao,
            data_inicio: dataInicio.toISOString().split("T")[0],
            data_fim: dataFim ? dataFim.toISOString().split("T")[0] : null,
            observacao: (data.observacao && typeof data.observacao === 'string') ? data.observacao : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "efetivo_id,ano,tipo_restricao,data_inicio,data_fim_norm",
          })
          .select()
          .single();

        if (restricaoError) throw restricaoError;
        result = restricaoData;
        break;
      }

      case "licenca_upsert": {
        let efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        if (!efetivoId && data.matricula && typeof data.matricula === 'string') {
          const { data: efetivo, error: efetivoError } = await serviceClient
            .from("dim_efetivo")
            .select("id")
            .ilike("matricula", data.matricula)
            .single();
          
          if (efetivoError || !efetivo) {
            return new Response(
              JSON.stringify({ ok: false, error: `Efetivo not found: ${data.matricula}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          efetivoId = efetivo.id;
        }

        const dataInicioRaw = data.data_inicio;

        if (!efetivoId || !dataInicioRaw) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, data_inicio" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize dates
        const dataInicioStr = typeof dataInicioRaw === 'string' ? dataInicioRaw : String(dataInicioRaw);
        const dataInicio = new Date(dataInicioStr);
        const dataFimStr = data.data_fim ? (typeof data.data_fim === 'string' ? data.data_fim : String(data.data_fim)) : null;
        let dataFim = dataFimStr ? new Date(dataFimStr) : null;
        
        // If data_fim < data_inicio, set data_fim = data_inicio
        if (dataFim && dataFim < dataInicio) {
          dataFim = dataInicio;
        }

        const ano = dataInicio.getFullYear();

        const { data: licencaData, error: licencaError } = await serviceClient
          .from("fat_licencas_medicas")
          .upsert({
            efetivo_id: efetivoId,
            ano: ano,
            data_inicio: dataInicio.toISOString().split("T")[0],
            data_fim: dataFim ? dataFim.toISOString().split("T")[0] : null,
            dias: (data.dias && typeof data.dias === 'number') ? data.dias : null,
            tipo: (data.tipo && typeof data.tipo === 'string') ? data.tipo : "LICENÇA MÉDICA",
            cid: (data.cid && typeof data.cid === 'string') ? data.cid : null,
            observacao: (data.observacao && typeof data.observacao === 'string') ? data.observacao : null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "efetivo_id,data_inicio,data_fim_norm",
          })
          .select()
          .single();

        if (licencaError) throw licencaError;
        result = licencaData;
        break;
      }

      case "equipe_membro_upsert": {
        const equipeId = typeof data.equipe_id === 'string' ? data.equipe_id : undefined;
        if (!equipeId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: equipe_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        if (!efetivoId && data.matricula && typeof data.matricula === 'string') {
          const { data: efetivo, error: efetivoError } = await serviceClient
            .from("dim_efetivo")
            .select("id")
            .ilike("matricula", data.matricula)
            .single();
          
          if (efetivoError || !efetivo) {
            return new Response(
              JSON.stringify({ ok: false, error: `Efetivo not found: ${data.matricula}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          efetivoId = efetivo.id;
        }

        if (!efetivoId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: efetivo_id or matricula" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: membroData, error: membroError } = await serviceClient
          .from("fat_equipe_membros")
          .upsert({
            equipe_id: equipeId,
            efetivo_id: efetivoId,
            funcao: (data.funcao && typeof data.funcao === 'string') ? data.funcao : null,
          }, {
            onConflict: "equipe_id,efetivo_id",
          })
          .select()
          .single();

        if (membroError) throw membroError;
        result = membroData;
        break;
      }

      case "campanha_membro_upsert": {
        const equipeId = typeof data.equipe_id === 'string' ? data.equipe_id : undefined;
        const unidade = typeof data.unidade === 'string' ? data.unidade : undefined;
        const ano = typeof data.ano === 'number' ? data.ano : undefined;

        if (!equipeId || !unidade || !ano) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: equipe_id, unidade, ano" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        if (!efetivoId && data.matricula && typeof data.matricula === 'string') {
          const { data: efetivo, error: efetivoError } = await serviceClient
            .from("dim_efetivo")
            .select("id")
            .ilike("matricula", data.matricula)
            .single();
          
          if (efetivoError || !efetivo) {
            return new Response(
              JSON.stringify({ ok: false, error: `Efetivo not found: ${data.matricula}` }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          efetivoId = efetivo.id;
        }

        if (!efetivoId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: efetivo_id or matricula" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: membroData, error: membroError } = await serviceClient
          .from("fat_campanha_membros")
          .upsert({
            equipe_id: equipeId,
            efetivo_id: efetivoId,
            unidade: unidade,
            ano: ano,
            funcao: (data.funcao && typeof data.funcao === 'string') ? data.funcao : null,
          }, {
            onConflict: "equipe_id,efetivo_id,ano,unidade",
          })
          .select()
          .single();

        if (membroError) throw membroError;
        result = membroData;
        break;
      }

      case "campanha_alteracao_insert": {
        const dataStr = typeof data.data === 'string' ? data.data : undefined;
        const unidade = typeof data.unidade === 'string' ? data.unidade : undefined;
        const equipeNovaId = typeof data.equipe_nova_id === 'string' ? data.equipe_nova_id : undefined;

        if (!dataStr || !unidade || !equipeNovaId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: data, unidade, equipe_nova_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const equipeOriginalId = (data.equipe_original_id && typeof data.equipe_original_id === 'string') 
          ? data.equipe_original_id 
          : null;

        const { data: alteracaoData, error: alteracaoError } = await serviceClient
          .from("fat_campanha_alteracoes")
          .insert({
            data: dataStr,
            unidade: unidade,
            equipe_original_id: equipeOriginalId,
            equipe_nova_id: equipeNovaId,
            motivo: (data.motivo && typeof data.motivo === 'string') ? data.motivo : null,
            created_by: user.id,
          })
          .select()
          .single();

        if (alteracaoError) throw alteracaoError;
        result = alteracaoData;
        break;
      }

      case "abono_delete": {
        const id = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : undefined;
        const efetivoId =
          typeof data.efetivo_id === 'string' && data.efetivo_id.trim()
            ? data.efetivo_id.trim()
            : undefined;
        const ano =
          typeof data.ano === 'number' && Number.isInteger(data.ano)
            ? data.ano
            : undefined;
        const mes =
          typeof data.mes === 'number' && Number.isInteger(data.mes)
            ? data.mes
            : undefined;

        if (!id && (!efetivoId || !ano || !mes)) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: id or (efetivo_id, ano, mes)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = serviceClient.from("fat_abono").delete();
        let filterApplied = false;
        if (id) {
          query = query.eq("id", id);
          filterApplied = true;
        } else if (efetivoId && ano && mes) {
          query = query.eq("efetivo_id", efetivoId).eq("ano", ano).eq("mes", mes);
          filterApplied = true;
        }

        if (!filterApplied) {
          return new Response(
            JSON.stringify({ ok: false, error: "Invalid delete filter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "restricao_delete": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_restricoes")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "licenca_delete": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_licencas_medicas")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "ferias_delete": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_ferias")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "ferias_insert": {
        const efetivoId = typeof data.efetivo_id === 'string' ? data.efetivo_id : undefined;
        const ano = typeof data.ano === 'number' ? data.ano : undefined;
        const mesInicio = typeof data.mes_inicio === 'number' ? data.mes_inicio : undefined;
        const dias = typeof data.dias === 'number' ? data.dias : undefined;

        if (!efetivoId || !ano || !mesInicio || !dias) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id, ano, mes_inicio, dias" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: feriasData, error: feriasError } = await serviceClient
          .from("fat_ferias")
          .insert({
            efetivo_id: efetivoId,
            ano: ano,
            mes_inicio: mesInicio,
            dias: dias,
            tipo: (data.tipo && typeof data.tipo === 'string') ? data.tipo : "INTEGRAL",
            observacao: (data.observacao && typeof data.observacao === 'string') ? data.observacao : null,
          })
          .select()
          .single();

        if (feriasError) throw feriasError;
        result = feriasData;
        break;
      }

      case "ferias_update": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: {
          updated_at: string;
          mes_inicio?: number;
          dias?: number;
          tipo?: string;
          observacao?: string | null;
        } = {
          updated_at: new Date().toISOString(),
        };

        if (data.mes_inicio !== undefined && typeof data.mes_inicio === 'number') {
          updateData.mes_inicio = data.mes_inicio;
        }
        if (data.dias !== undefined && typeof data.dias === 'number') {
          updateData.dias = data.dias;
        }
        if (data.tipo !== undefined && typeof data.tipo === 'string') {
          updateData.tipo = data.tipo;
        }
        if (data.observacao !== undefined) {
          updateData.observacao = data.observacao === null ? null : String(data.observacao);
        }

        const { data: feriasData, error: feriasError } = await serviceClient
          .from("fat_ferias")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (feriasError) throw feriasError;
        result = feriasData;
        break;
      }

      case "campanha_membro_delete": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_campanha_membros")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "campanha_membro_update": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: {
          equipe_id?: string;
          funcao?: string | null;
        } = {};
        if (data.equipe_id !== undefined && typeof data.equipe_id === 'string') {
          updateData.equipe_id = data.equipe_id;
        }
        if (data.funcao !== undefined) {
          updateData.funcao = data.funcao === null ? null : String(data.funcao);
        }

        const { data: membroData, error: membroError } = await serviceClient
          .from("fat_campanha_membros")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (membroError) throw membroError;
        result = membroData;
        break;
      }

      case "campanha_alteracao_delete": {
        const dataStr = typeof data.data === 'string' ? data.data : undefined;
        const unidade = typeof data.unidade === 'string' ? data.unidade : undefined;

        if (!dataStr || !unidade) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: data, unidade" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_campanha_alteracoes")
          .delete()
          .eq("data", dataStr)
          .eq("unidade", unidade);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_insert": {
        const nome = typeof data.nome === 'string' ? data.nome : undefined;
        const grupamento = typeof data.grupamento === 'string' ? data.grupamento : undefined;

        if (!nome || !grupamento) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: nome, grupamento" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: equipeData, error: equipeError } = await serviceClient
          .from("dim_equipes")
          .insert({
            nome: nome,
            grupamento: grupamento,
            escala: (data.escala && typeof data.escala === 'string') ? data.escala : null,
            servico: (data.servico && typeof data.servico === 'string') ? data.servico : null,
          })
          .select()
          .single();

        if (equipeError) throw equipeError;
        result = equipeData;
        break;
      }

      case "equipe_update": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: {
          updated_at: string;
          nome?: string;
          grupamento?: string;
          escala?: string | null;
          servico?: string | null;
        } = {
          updated_at: new Date().toISOString(),
        };

        if (data.nome !== undefined && typeof data.nome === 'string') {
          updateData.nome = data.nome;
        }
        if (data.grupamento !== undefined && typeof data.grupamento === 'string') {
          updateData.grupamento = data.grupamento;
        }
        if (data.escala !== undefined) {
          updateData.escala = data.escala === null ? null : String(data.escala);
        }
        if (data.servico !== undefined) {
          updateData.servico = data.servico === null ? null : String(data.servico);
        }

        const { data: equipeData, error: equipeError } = await serviceClient
          .from("dim_equipes")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (equipeError) throw equipeError;
        result = equipeData;
        break;
      }

      case "equipe_delete": {
        const id = typeof data.id === 'string' ? data.id : undefined;
        if (!id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete membros first
        await serviceClient
          .from("fat_equipe_membros")
          .delete()
          .eq("equipe_id", id);

        // Then delete equipe
        const { error: deleteError } = await serviceClient
          .from("dim_equipes")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_membro_delete": {
        const id = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : undefined;
        const equipeId =
          typeof data.equipe_id === 'string' && data.equipe_id.trim()
            ? data.equipe_id.trim()
            : undefined;
        const efetivoId =
          typeof data.efetivo_id === 'string' && data.efetivo_id.trim()
            ? data.efetivo_id.trim()
            : undefined;

        if (!id && (!equipeId || !efetivoId)) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: id or (equipe_id, efetivo_id)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = serviceClient.from("fat_equipe_membros").delete();
        let filterApplied = false;
        if (id) {
          query = query.eq("id", id);
          filterApplied = true;
        } else if (equipeId && efetivoId) {
          query = query.eq("equipe_id", equipeId).eq("efetivo_id", efetivoId);
          filterApplied = true;
        }

        if (!filterApplied) {
          return new Response(
            JSON.stringify({ ok: false, error: "Invalid delete filter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_membros_bulk_delete": {
        const equipeId = typeof data.equipe_id === 'string' ? data.equipe_id : undefined;
        if (!equipeId) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: equipe_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_equipe_membros")
          .delete()
          .eq("equipe_id", equipeId);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ ok: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ ok: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in admin-pessoas function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

