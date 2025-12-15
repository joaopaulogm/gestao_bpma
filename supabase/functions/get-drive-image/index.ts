import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Folder IDs from Google Drive
const FOLDER_IDS = {
  fauna: '1-kLSxmSnFruTlodpIpn5NbcA-jrjUm7I',
  mamiferos: '1Q-SAKB_Lqx64495xOO1NNhe9rw7SDgTw',
  aves: '1QpBpxk_5WZwp4w4SkF_yRS2aV8GnmMOK',
  repteis: '1FHvCvDY9IKEmlgTSvxrFCdJJJz3mmaYv',
  peixes: '1FHvCvDY9IKEmlgTSvxrFCdJJJz3mmaYv',
  flora: '1SA91ahQP-doZGXToFbl7qWe_Muuu7WdK',
  fotos_especies: '1DmF5fBYj0SCOQ0Yewjur7O5Qj0Ha5tkE',
};

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Missing Google OAuth credentials:', { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret, 
      hasRefreshToken: !!refreshToken 
    });
    throw new Error('Missing Google OAuth credentials');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to refresh access token:', errorText);
    throw new Error(`Failed to refresh access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function listFilesInFolder(folderId: string, accessToken: string): Promise<any[]> {
  const query = `'${folderId}' in parents and mimeType contains 'image/'`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&pageSize=1000`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to list files:', errorText);
    throw new Error(`Failed to list files: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

async function getFileContent(fileId: string, accessToken: string): Promise<{ data: string; mimeType: string }> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get file content:', errorText);
    throw new Error(`Failed to get file content: ${errorText}`);
  }

  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  return { data: base64, mimeType };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const folderId = url.searchParams.get('folderId');
    const folderKey = url.searchParams.get('folderKey');
    const fileId = url.searchParams.get('fileId');
    const fileName = url.searchParams.get('fileName');

    console.log('Request received:', { action, folderId, folderKey, fileId, fileName });

    const accessToken = await getAccessToken();

    if (action === 'list') {
      // List files in a folder
      const targetFolderId = folderId || (folderKey ? FOLDER_IDS[folderKey as keyof typeof FOLDER_IDS] : null);
      
      if (!targetFolderId) {
        return new Response(
          JSON.stringify({ error: 'Missing folderId or folderKey parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const files = await listFilesInFolder(targetFolderId, accessToken);
      console.log(`Found ${files.length} files in folder ${targetFolderId}`);

      return new Response(
        JSON.stringify({ files }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get') {
      // Get a specific file's content as base64
      if (!fileId) {
        return new Response(
          JSON.stringify({ error: 'Missing fileId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, mimeType } = await getFileContent(fileId, accessToken);

      return new Response(
        JSON.stringify({ data, mimeType }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'search') {
      // Search for a file by name in a folder
      const targetFolderId = folderId || (folderKey ? FOLDER_IDS[folderKey as keyof typeof FOLDER_IDS] : FOLDER_IDS.fotos_especies);

      if (!fileName) {
        return new Response(
          JSON.stringify({ error: 'Missing fileName parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Search in the specified folder
      const query = `'${targetFolderId}' in parents and name contains '${fileName.replace(/'/g, "\\'")}'`;
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink)&pageSize=10`;

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to search files:', errorText);
        throw new Error(`Failed to search files: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Search for "${fileName}" found ${data.files?.length || 0} files`);

      return new Response(
        JSON.stringify({ files: data.files || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'thumbnail') {
      // Get thumbnail URL for a file
      if (!fileId) {
        return new Response(
          JSON.stringify({ error: 'Missing fileId parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,webContentLink`;
      const response = await fetch(metadataUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get file metadata:', errorText);
        throw new Error(`Failed to get file metadata: ${errorText}`);
      }

      const metadata = await response.json();

      return new Response(
        JSON.stringify({ 
          thumbnailLink: metadata.thumbnailLink,
          webContentLink: metadata.webContentLink,
          directLink: `https://drive.google.com/uc?export=view&id=${fileId}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: list, get, search, or thumbnail' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-drive-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
