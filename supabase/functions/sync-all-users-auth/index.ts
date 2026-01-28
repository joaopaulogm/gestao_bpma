import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ matricula: string; error: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const specificMatricula = body.matricula;
    const specificEfetivoId = body.efetivo_id;

    console.log("Iniciando sincronização de usuários com Supabase Auth...");

    // Buscar todos os usuários de user_roles (que já tem efetivo_id, role e cpf)
    let query = supabase
      .from("user_roles")
      .select("*")
      .eq("ativo", true);

    if (specificEfetivoId) {
      query = query.eq("efetivo_id", specificEfetivoId);
    }

    if (specificMatricula) {
      query = query.eq("matricula", specificMatricula);
    }

    const { data: userRoles, error: fetchError } = await query;

    if (fetchError) {
      console.error("Erro ao buscar user_roles:", fetchError);
      throw new Error(`Erro ao buscar user_roles: ${fetchError.message}`);
    }

    if (!userRoles || userRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum usuário encontrado para sincronizar" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processando ${userRoles.length} usuários...`);

    const result: SyncResult = {
      total: userRoles.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    // Buscar usuários existentes no Auth
    const { data: authUsersList, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      console.error("Erro ao listar usuários do Auth:", listError);
      throw new Error(`Erro ao listar usuários: ${listError.message}`);
    }

    const existingAuthUsers = new Map(
      authUsersList?.users?.map((u) => [u.email?.toLowerCase(), u]) || []
    );

    for (const ur of userRoles) {
      if (!ur.matricula) {
        result.skipped++;
        continue;
      }

      const matricula = ur.matricula.toString().toUpperCase();
      const email = `${matricula.toLowerCase()}@bpma.local`;
      const role = ur.role || "operador";

      try {
        const existingUser = existingAuthUsers.get(email);

        if (existingUser) {
          // Usuário já existe no Auth - atualizar metadata
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                matricula,
                nome: ur.nome,
                nome_guerra: ur.nome_guerra,
                role,
              },
            }
          );

          if (updateError) {
            console.error(`Erro ao atualizar ${matricula}:`, updateError);
            result.errors.push({ matricula, error: updateError.message });
            continue;
          }

          // Atualizar user_roles com o user_id se ainda não estiver vinculado
          if (!ur.user_id || ur.user_id !== existingUser.id) {
            const { error: updateRoleError } = await supabase
              .from("user_roles")
              .update({ user_id: existingUser.id })
              .eq("id", ur.id);

            if (updateRoleError) {
              console.warn(`Aviso ao vincular user_roles para ${matricula}:`, updateRoleError);
            }
          }

          result.updated++;
          console.log(`✅ Atualizado: ${matricula} (${ur.nome}) - Role: ${role}`);
        } else {
          // Criar novo usuário no Auth
          // Senha padrão é o CPF (11 dígitos) ou a matrícula
          const cpfStr = ur.cpf ? ur.cpf.toString().padStart(11, "0") : null;
          const defaultPassword = cpfStr || matricula;

          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: defaultPassword,
            email_confirm: true,
            user_metadata: {
              matricula,
              nome: ur.nome,
              nome_guerra: ur.nome_guerra,
              role,
            },
          });

          if (createError) {
            console.error(`Erro ao criar ${matricula}:`, createError);
            result.errors.push({ matricula, error: createError.message });
            continue;
          }

          if (newUser?.user) {
            // Atualizar user_roles com o user_id
            const { error: updateRoleError } = await supabase
              .from("user_roles")
              .update({ user_id: newUser.user.id })
              .eq("id", ur.id);

            if (updateRoleError) {
              console.warn(`Aviso ao vincular user_roles para ${matricula}:`, updateRoleError);
            }
          }

          result.created++;
          console.log(`✅ Criado: ${matricula} (${ur.nome}) - Role: ${role}`);
        }
      } catch (err: any) {
        console.error(`Erro processando ${matricula}:`, err);
        result.errors.push({ matricula, error: err.message || "Erro desconhecido" });
      }
    }

    console.log("\n=== Resumo da Sincronização ===");
    console.log(`Total processados: ${result.total}`);
    console.log(`Criados: ${result.created}`);
    console.log(`Atualizados: ${result.updated}`);
    console.log(`Pulados: ${result.skipped}`);
    console.log(`Erros: ${result.errors.length}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na sincronização:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
