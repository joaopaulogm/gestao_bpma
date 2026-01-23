import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Restrict CORS to known origins for security
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    'https://lovable.dev',
    'https://preview--gestao-bpma.lovable.app',
    'https://gestao-bpma.lovable.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (requestOrigin && allowedOrigins.some(origin => requestOrigin.startsWith(origin.replace(/\/$/, '')))) {
    return requestOrigin;
  }
  
  // Fallback for Lovable preview domains
  if (requestOrigin && requestOrigin.includes('.lovable.app')) {
    return requestOrigin;
  }
  
  return allowedOrigins[0];
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    const { year, month } = await req.json();
    const monthNumber = month === undefined || month === null ? null : Number(month);
    const hasValidMonth = monthNumber !== null &&
      Number.isInteger(monthNumber) && monthNumber >= 0 && monthNumber <= 11;

    if (month !== undefined && month !== null && !hasValidMonth) {
      return new Response(
        JSON.stringify({ error: 'Invalid month. Use 0-11.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch data from the registros table (RLS will apply based on user)
    let query = supabase
      .from('fat_registros_de_resgate')
      .select('*')
      
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('data', startDate).lte('data', endDate)
      
      if (hasValidMonth && monthNumber !== null) {
        const monthStart = `${year}-${String(monthNumber + 1).padStart(2, '0')}-01`
        const nextMonth = monthNumber === 11 
          ? `${year + 1}-01-01`
          : `${year}-${String(monthNumber + 2).padStart(2, '0')}-01`
        
        query = query.gte('data', monthStart).lt('data', nextMonth)
      }
    }

    const { data: registros, error } = await query

    if (error) throw error

    // R API integration
    const R_API_URL = Deno.env.get('R_API_URL') ?? 'http://your-r-api-server/analyze-dashboard'
    
    let r_analysis = null
    try {
      console.log("Sending data to R API for analysis...")
      const r_response = await fetch(R_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          year: year,
          month: hasValidMonth ? monthNumber : null,
          data: registros 
        })
      })
      
      if (!r_response.ok) {
        throw new Error(`R API responded with status: ${r_response.status}`)
      }
      
      r_analysis = await r_response.json()
      console.log("R analysis complete")
    } catch (r_error) {
      console.error("Error connecting to R API:", r_error)
      r_analysis = null
    }
    
    const processedData = r_analysis ? r_analysis : processDataInDeno(registros)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: registros,
        analysis: processedData
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Error in analyze-data function:", errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    )
  }
})

// Fallback data processing function if R API is unavailable
function processDataInDeno(registros: any[]) {
  const totalResgates = registros.filter(r => r.origem === "Resgate").length
  const totalApreensoes = registros.filter(r => r.origem === "Apreensão").length
  
  const classeMap = new Map()
  registros.forEach(r => {
    classeMap.set(r.classe_taxonomica, (classeMap.get(r.classe_taxonomica) || 0) + 1)
  })
  
  const distribuicaoPorClasse = Array.from(classeMap.entries()).map(([name, value]) => ({
    name,
    value
  }))
  
  const destinosMap = new Map()
  registros.forEach(r => {
    destinosMap.set(r.destinacao, (destinosMap.get(r.destinacao) || 0) + 1)
  })
  
  const destinos = Array.from(destinosMap.entries()).map(([name, value]) => ({
    name,
    value
  }))
  
  const apreensoes = registros.filter(r => r.origem === "Apreensão")
  const desfechosMap = new Map()
  apreensoes.forEach(r => {
    if (r.desfecho_apreensao) {
      desfechosMap.set(r.desfecho_apreensao, (desfechosMap.get(r.desfecho_apreensao) || 0) + 1)
    }
  })
  
  const desfechos = Array.from(desfechosMap.entries()).map(([name, value]) => ({
    name,
    value
  }))
  
  const resgates = registros.filter(r => r.origem === "Resgate")
  const especiesResgatesMap = new Map()
  resgates.forEach(r => {
    especiesResgatesMap.set(r.nome_popular, (especiesResgatesMap.get(r.nome_popular) || 0) + r.quantidade)
  })
  
  const especiesMaisResgatadas = Array.from(especiesResgatesMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  
  const especiesApreensõesMap = new Map()
  apreensoes.forEach(r => {
    especiesApreensõesMap.set(r.nome_popular, (especiesApreensõesMap.get(r.nome_popular) || 0) + r.quantidade)
  })
  
  const especiesMaisApreendidas = Array.from(especiesApreensõesMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  
  const atropelamentosMap = new Map()
  const atropelados = registros.filter(r => r.atropelamento === "Sim")
  atropelados.forEach(r => {
    atropelamentosMap.set(r.nome_popular, (atropelamentosMap.get(r.nome_popular) || 0) + r.quantidade)
  })
  
  const atropelamentos = Array.from(atropelamentosMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  
  return {
    totalResgates,
    totalApreensoes,
    distribuicaoPorClasse,
    destinos,
    desfechos,
    especiesMaisResgatadas,
    especiesMaisApreendidas,
    atropelamentos
  }
}
