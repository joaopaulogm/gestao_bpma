import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// CORS restrito (mantém compatibilidade com preview/published)
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    "https://lovable.dev",
    "https://preview--gestao-bpma.lovable.app",
    "https://gestao-bpma.lovable.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  if (requestOrigin && allowedOrigins.some((o) => requestOrigin.startsWith(o.replace(/\/$/, "")))) {
    return requestOrigin;
  }

  // fallback para ambientes Lovable
  // - preview/published: *.lovable.app
  // - editor sandbox: *.lovableproject.com
  if (requestOrigin) {
    const o = requestOrigin.toLowerCase();
    if (o.includes(".lovable.app") || o.includes(".lovableproject.com")) return requestOrigin;
  }
  return allowedOrigins[0];
};

type Body = {
  matricula: string;
  senha: string;
};

const json = (status: number, body: unknown, corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, corsHeaders);

  try {
    const body = (await req.json()) as Partial<Body>;
    const matricula = String(body.matricula ?? "")
      .replace(/[^0-9Xx]/g, "")
      .toUpperCase();
    const senha = String(body.senha ?? "");

    // validações simples (server-side) para evitar abuso
    if (!matricula || matricula.length > 20) {
      return json(400, { error: "matricula inválida" }, corsHeaders);
    }
    if (!senha || senha.length < 1 || senha.length > 72) {
      // 72 = limite bcrypt efetivo
      return json(400, { error: "senha inválida" }, corsHeaders);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json(500, { error: "missing supabase env" }, corsHeaders);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1) valida credenciais via RPC (fonte de verdade do BPMA)
    const { data: validData, error: validError } = await (supabase as any).rpc("validar_login_senha", {
      p_matricula: matricula,
      p_senha: senha,
    });

    if (validError) {
      console.error("RPC validar_login_senha error:", validError);
      return json(500, { error: "failed to validate credentials" }, corsHeaders);
    }

    const usuario = Array.isArray(validData) ? validData[0] : validData;
    if (!usuario || usuario.ativo === false) {
      return json(401, { error: "invalid credentials" }, corsHeaders);
    }

    const email = `${matricula.toLowerCase()}@bpma.local`;

    // 2) garante que existe/atualiza o usuário no Supabase Auth com a senha atual
    //    (necessário para emitir JWT authenticated no browser)
    const { data: usersList, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      console.error("admin.listUsers error:", listError);
      return json(500, { error: "failed to list users" }, corsHeaders);
    }

    const existing = usersList?.users?.find((u) => (u.email || "").toLowerCase() === email);

    if (!existing) {
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          matricula,
          nome: usuario.nome ?? null,
          nome_guerra: usuario.nome_guerra ?? null,
        },
      });

      if (createError) {
        console.error("admin.createUser error:", createError);
        return json(500, { error: "failed to create auth user" }, corsHeaders);
      }
    } else {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: senha,
      });

      if (updateError) {
        console.error("admin.updateUserById error:", updateError);
        return json(500, { error: "failed to update auth user" }, corsHeaders);
      }
    }

    return json(200, { success: true }, corsHeaders);
  } catch (e) {
    console.error("sync-auth-password error:", e);
    return json(500, { error: e instanceof Error ? e.message : "unknown error" }, corsHeaders);
  }
});
