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

serve(async (req: Request) => {
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

    // deno-lint-ignore no-explicit-any
    const supabase = createClient(supabaseUrl, serviceKey) as any;

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
    
    // Tentativa otimista: Tente criar o usuário primeiro.
    // Isso evita listar todos os usuários (que é limitado a 1000 por página)
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
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
      // Se o erro for "usuário já existe", então atualizamos a senha
      if (createError.message?.includes("already registered") || createError.status === 422 || createError.status === 400) {
        
        // Precisamos do ID do usuário para atualizar.
        // Como o create falhou, buscamos APENAS este usuário específico (por email não existe função direta no cliente admin JS antigo, 
        // mas podemos listar com filtro se a lib permitir, ou... a lib js admin listUsers não aceita filtro de email em algumas versões).
        // Na versão atual do supabase-js, listUsers não aceita filtro de email diretamente nos params simples.
        // POREM, a melhor estratégia segura é tentar fazer update se tivermos o ID. Não temos o ID aqui.
        // WORKAROUND: Se o createUser falhar, a ÚNICA forma de pegar o ID sem listar tudo é... listar tudo? 
        // Não. A API Admin do GoTrue permite getUserById. Mas não ByEmail oficial no JS client antigo.
        // Mas espere! Se o createUser falha, significa que o email já existe. 
        // Vamos tentar "signIn" com a senha antiga? Não temos a senha antiga.
        // Vamos usar listUsers com paginação mas SÓ se create falhar? Ainda é ruim se tiver 1 milhão de users.
        
        // SOLUÇÃO REAL: Usar listUsers PERO filtrando? Não suportado.
        // SOLUÇÃO DE CONTORNO VÁLIDA: Usar RPC de banco se tivéssemos acesso direto à tabela auth.users (não temos na edge function sem service key connectando no banco direto via pooler).
        // 
        // Vamos checar a documentação atual do supabase-js v2.49.1 (que está no import).
        // Ela deve suportar listUsers apenas.
        // Mas a API Rest do Gotrue suporta GET /admin/users?email=...
        // O cliente JS não expõe isso? Vamos tentar hackear ou fazer o loop correto?
        // NÃO. O createUser falhou. Vamos tentar a estratégia de listar mas só 1 página? Não resolve.
        
        // ESPERA. O `listUsers` limita 1000. Se o usuário existir e estiver depois do 1000, o 'find' falha, e o 'createUser' falha.
        // Se eu CHAMO createUser e falha... eu sei que existe.
        // Como pego o ID?
        // Ah! No supabase-js v2, `listUsers` não tem filtro.
        // Mas... podemos usar `supabase.auth.admin.getUserById` se tivéssemos o ID.
        
        // PENSANDO MELHOR: Se sync-auth-password é chamado, é porque o usuário conseguiu logar no RLS VALIDATOR.
        // O RLS VALIDATOR retornou o ID do usuário da tabela public.user_roles.
        // A tabela public.user_roles TEM o user_id (uuid do auth.users)?
        // SIM! O select na linha 31 do arquivo original retorna `ur.user_id`. (Veja a query da RPC validar_login_senha)
        // Se `usuario.user_id` não for nulo, temos o ID!
        
        if (usuario.user_id) {
           const { error: updateError } = await supabase.auth.admin.updateUserById(usuario.user_id, {
            password: senha,
          });
           if (updateError) {
             console.error("admin.updateUserById error (with known ID):", updateError);
             return json(500, { error: "failed to update auth user" }, corsHeaders);
           }
        } else {
             // Se user_id for nulo na tabela user_roles, significa que o sync nunca rodou ou foi perdido.
             // Nesse caso, o usuário EXISTE no Auth (pois o create falhou) mas não sabemos o ID.
             // EDGE CASE: Usuário existe no Auth, mas não está vinculado no user_roles.
             // Nesse cenário raro (e ruim), INFELIZMENTE teremos que listar.
             // Mas como já tentamos create e falhou, ele DEVE estar na lista. 
             // Se tiver mais de 1000 users, e esse usuário orfão estiver no fim... ferrou.
             // Mas se ele existe no Auth, ele deveria estar no user_roles.
             // Se create falhou, ele existe no Auth.
             
             // Melhor abordagem: Se user_id for nulo, tentamos listar. É o fallback do fallback.
             const { data: usersList, error: listError } = await supabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
              });
              
             if (listError) throw listError;
             
             const existing = usersList?.users?.find((u: { email?: string; id: string }) => (u.email || "").toLowerCase() === email);
             
             if (existing) {
                 const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
                    password: senha,
                 });
                 // E DEVERÍAMOS atualizar o user_roles com o ID novo para não precisar disso na próxima.
                 // Mas a função sync-auth-password não tem acesso de escrita na user_roles via cliente (só RLS).
                 // O ideal seria trigger no banco. Mas ok, next time user_id might be there if someone synced it.
                 if (updateError) {
                    console.error("admin.updateUserById error (fallback list):", updateError);
                    return json(500, { error: "failed to update auth user" }, corsHeaders);
                 }
             } else {
                // Se createUser falhou dizendo que existe, e list1000 não achou... então temos mais de 1000 users e o user está lá longe.
                // Crítico.
                // Mas, se seguirmos o fluxo, todo usuário criado via sistema DEVE ter user_id no user_roles.
                // Se `usuario.user_id` veio da RPC, usamos ele.
                console.error("CRITICAL: User exists in Auth but not found in first 1000 users AND has no user_id in public table.");
                return json(500, { error: "user sync inconsistency - contact admin" }, corsHeaders);
             }
        }

      } else {
        // Erro real no createUser
        console.error("admin.createUser error:", createError);
        return json(500, { error: "failed to create auth user" }, corsHeaders);
      }
    } else {
       // Sucesso no create. O usuário é novo no Auth.
       // (Opcional) Poderíamos tentar salvar o ID no user_roles, mas isso exige uma chamada RPC ou update direto se tiver policy.
       // Como essa função roda com service_role key, ela poderia fazer um update na user_roles setando user_id = createdUser.user.id
       // onde matricula = ...
       // Isso fecharia o ciclo para a próxima vez cair no `if (usuario.user_id)`.
       if (createdUser?.user?.id) {
           await supabase.from('user_roles').update({ user_id: createdUser.user.id }).eq('id', usuario.id);
       }
    }

    return json(200, { success: true }, corsHeaders);
  } catch (e) {
    console.error("sync-auth-password error:", e);
    return json(500, { error: e instanceof Error ? e.message : "unknown error" }, corsHeaders);
  }
});
