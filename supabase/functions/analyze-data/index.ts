
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { year, month } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // Fetch data from the registros table
    let query = supabase
      .from('registros')
      .select('*')
      
    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query.gte('data', startDate).lte('data', endDate)
      
      if (month !== null) {
        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const nextMonth = month === 11 
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 2).padStart(2, '0')}-01`
        
        query = query.gte('data', monthStart).lt('data', nextMonth)
      }
    }

    const { data: registros, error } = await query

    if (error) throw error

    // R API integration
    // Replace with your actual R API URL
    const R_API_URL = Deno.env.get('R_API_URL') ?? 'http://your-r-api-server/analyze-dashboard'
    
    let r_analysis = null
    try {
      // Send data to R API for analysis
      console.log("Sending data to R API for analysis...")
      const r_response = await fetch(R_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          year: year,
          month: month,
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
      // Fall back to basic analysis if R API fails
      r_analysis = null
    }
    
    // Process the data in Deno if R analysis fails
    // This is our fallback data processing logic
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
    console.error("Error in analyze-data function:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    )
  }
})

// Fallback data processing function if R API is unavailable
function processDataInDeno(registros: any[]) {
  // Basic analysis without R
  const totalResgates = registros.filter(r => r.origem === "Resgate").length
  const totalApreensoes = registros.filter(r => r.origem === "Apreensão").length
  
  // Group by classe_taxonomica
  const classeMap = new Map()
  registros.forEach(r => {
    classeMap.set(r.classe_taxonomica, (classeMap.get(r.classe_taxonomica) || 0) + 1)
  })
  
  const distribuicaoPorClasse = Array.from(classeMap.entries()).map(([name, value]) => ({
    name,
    value
  }))
  
  // Process destinos
  const destinosMap = new Map()
  registros.forEach(r => {
    destinosMap.set(r.destinacao, (destinosMap.get(r.destinacao) || 0) + 1)
  })
  
  const destinos = Array.from(destinosMap.entries()).map(([name, value]) => ({
    name,
    value
  }))
  
  // Process desfechos for apreensões
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
  
  // Count species for resgates
  const resgates = registros.filter(r => r.origem === "Resgate")
  const especiesResgatesMap = new Map()
  resgates.forEach(r => {
    especiesResgatesMap.set(r.nome_popular, (especiesResgatesMap.get(r.nome_popular) || 0) + r.quantidade)
  })
  
  const especiesMaisResgatadas = Array.from(especiesResgatesMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  
  // Count species for apreensões
  const especiesApreensõesMap = new Map()
  apreensoes.forEach(r => {
    especiesApreensõesMap.set(r.nome_popular, (especiesApreensõesMap.get(r.nome_popular) || 0) + r.quantidade)
  })
  
  const especiesMaisApreendidas = Array.from(especiesApreensõesMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  
  // Count atropelamentos
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
