
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

    // For now, we'll return the processed data.
    // In the future, this is where we would integrate with R
    // through a microservice or API that runs R analysis
    return new Response(
      JSON.stringify({ 
        success: true,
        data: registros 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    )
  }
})
