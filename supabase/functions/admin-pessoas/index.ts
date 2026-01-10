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
  [key: string]: any;
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

    let result: any;

    // Handle different actions
    switch (action) {
      case "abono_upsert": {
        // Resolve efetivo_id from matricula if needed
        let efetivoId = data.efetivo_id;
        if (!efetivoId && data.matricula) {
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

        if (!efetivoId || !data.ano || !data.mes) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, ano, mes" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: abonoData, error: abonoError } = await serviceClient
          .from("fat_abono")
          .upsert({
            efetivo_id: efetivoId,
            ano: data.ano,
            mes: data.mes,
            observacao: data.observacao || null,
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
        let efetivoId = data.efetivo_id;
        if (!efetivoId && data.matricula) {
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

        if (!efetivoId || !data.tipo_restricao || !data.data_inicio) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, tipo_restricao, data_inicio" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize dates
        let dataInicio = new Date(data.data_inicio);
        let dataFim = data.data_fim ? new Date(data.data_fim) : null;
        
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
            tipo_restricao: data.tipo_restricao,
            data_inicio: dataInicio.toISOString().split("T")[0],
            data_fim: dataFim ? dataFim.toISOString().split("T")[0] : null,
            observacao: data.observacao || null,
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
        let efetivoId = data.efetivo_id;
        if (!efetivoId && data.matricula) {
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

        if (!efetivoId || !data.data_inicio) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id/matricula, data_inicio" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Normalize dates
        let dataInicio = new Date(data.data_inicio);
        let dataFim = data.data_fim ? new Date(data.data_fim) : null;
        
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
            dias: data.dias || null,
            tipo: data.tipo || "LICENÇA MÉDICA",
            cid: data.cid || null,
            observacao: data.observacao || null,
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
        if (!data.equipe_id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: equipe_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let efetivoId = data.efetivo_id;
        if (!efetivoId && data.matricula) {
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
            equipe_id: data.equipe_id,
            efetivo_id: efetivoId,
            funcao: data.funcao || null,
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
        if (!data.equipe_id || !data.unidade || !data.ano) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: equipe_id, unidade, ano" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let efetivoId = data.efetivo_id;
        if (!efetivoId && data.matricula) {
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
            equipe_id: data.equipe_id,
            efetivo_id: efetivoId,
            unidade: data.unidade,
            ano: data.ano,
            funcao: data.funcao || null,
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
        if (!data.data || !data.unidade || !data.equipe_nova_id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: data, unidade, equipe_nova_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: alteracaoData, error: alteracaoError } = await serviceClient
          .from("fat_campanha_alteracoes")
          .insert({
            data: data.data,
            unidade: data.unidade,
            equipe_original_id: data.equipe_original_id || null,
            equipe_nova_id: data.equipe_nova_id,
            motivo: data.motivo || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (alteracaoError) throw alteracaoError;
        result = alteracaoData;
        break;
      }

      case "abono_delete": {
        if (!data.id && (!data.efetivo_id || !data.ano || !data.mes)) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: id or (efetivo_id, ano, mes)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = serviceClient.from("fat_abono").delete();
        if (data.id) {
          query = query.eq("id", data.id);
        } else {
          query = query.eq("efetivo_id", data.efetivo_id).eq("ano", data.ano).eq("mes", data.mes);
        }

        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "restricao_delete": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_restricoes")
          .delete()
          .eq("id", data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "licenca_delete": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_licencas_medicas")
          .delete()
          .eq("id", data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "ferias_delete": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_ferias")
          .delete()
          .eq("id", data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "ferias_insert": {
        if (!data.efetivo_id || !data.ano || !data.mes_inicio || !data.dias) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: efetivo_id, ano, mes_inicio, dias" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: feriasData, error: feriasError } = await serviceClient
          .from("fat_ferias")
          .insert({
            efetivo_id: data.efetivo_id,
            ano: data.ano,
            mes_inicio: data.mes_inicio,
            dias: data.dias,
            tipo: data.tipo || "INTEGRAL",
            observacao: data.observacao || null,
          })
          .select()
          .single();

        if (feriasError) throw feriasError;
        result = feriasData;
        break;
      }

      case "ferias_update": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (data.mes_inicio !== undefined) updateData.mes_inicio = data.mes_inicio;
        if (data.dias !== undefined) updateData.dias = data.dias;
        if (data.tipo !== undefined) updateData.tipo = data.tipo;
        if (data.observacao !== undefined) updateData.observacao = data.observacao;

        const { data: feriasData, error: feriasError } = await serviceClient
          .from("fat_ferias")
          .update(updateData)
          .eq("id", data.id)
          .select()
          .single();

        if (feriasError) throw feriasError;
        result = feriasData;
        break;
      }

      case "campanha_membro_delete": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_campanha_membros")
          .delete()
          .eq("id", data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "campanha_membro_update": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: any = {};
        if (data.equipe_id !== undefined) updateData.equipe_id = data.equipe_id;
        if (data.funcao !== undefined) updateData.funcao = data.funcao;

        const { data: membroData, error: membroError } = await serviceClient
          .from("fat_campanha_membros")
          .update(updateData)
          .eq("id", data.id)
          .select()
          .single();

        if (membroError) throw membroError;
        result = membroData;
        break;
      }

      case "campanha_alteracao_delete": {
        if (!data.data || !data.unidade) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: data, unidade" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_campanha_alteracoes")
          .delete()
          .eq("data", data.data)
          .eq("unidade", data.unidade);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_insert": {
        if (!data.nome || !data.grupamento) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: nome, grupamento" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: equipeData, error: equipeError } = await serviceClient
          .from("dim_equipes")
          .insert({
            nome: data.nome,
            grupamento: data.grupamento,
            escala: data.escala || null,
            servico: data.servico || null,
          })
          .select()
          .single();

        if (equipeError) throw equipeError;
        result = equipeData;
        break;
      }

      case "equipe_update": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (data.nome !== undefined) updateData.nome = data.nome;
        if (data.grupamento !== undefined) updateData.grupamento = data.grupamento;
        if (data.escala !== undefined) updateData.escala = data.escala;
        if (data.servico !== undefined) updateData.servico = data.servico;

        const { data: equipeData, error: equipeError } = await serviceClient
          .from("dim_equipes")
          .update(updateData)
          .eq("id", data.id)
          .select()
          .single();

        if (equipeError) throw equipeError;
        result = equipeData;
        break;
      }

      case "equipe_delete": {
        if (!data.id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete membros first
        await serviceClient
          .from("fat_equipe_membros")
          .delete()
          .eq("equipe_id", data.id);

        // Then delete equipe
        const { error: deleteError } = await serviceClient
          .from("dim_equipes")
          .delete()
          .eq("id", data.id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_membro_delete": {
        if (!data.id && (!data.equipe_id || !data.efetivo_id)) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required fields: id or (equipe_id, efetivo_id)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = serviceClient.from("fat_equipe_membros").delete();
        if (data.id) {
          query = query.eq("id", data.id);
        } else {
          query = query.eq("equipe_id", data.equipe_id).eq("efetivo_id", data.efetivo_id);
        }

        const { error: deleteError } = await query;
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
      }

      case "equipe_membros_bulk_delete": {
        if (!data.equipe_id) {
          return new Response(
            JSON.stringify({ ok: false, error: "Missing required field: equipe_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await serviceClient
          .from("fat_equipe_membros")
          .delete()
          .eq("equipe_id", data.equipe_id);

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
  } catch (error: any) {
    console.error("Error in admin-pessoas function:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

