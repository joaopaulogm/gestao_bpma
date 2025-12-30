import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  
  return allowedOrigins[0]; // Default to main domain
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN environment variable not set');
      throw new Error('Mapbox token not configured')
    }

    console.log('Successfully retrieved Mapbox token');
    
    return new Response(
      JSON.stringify({ token: mapboxToken }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in get-mapbox-token:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})