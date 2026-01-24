#!/usr/bin/env tsx
/**
 * Script para configurar automaticamente os secrets do Google OAuth no Supabase
 * 
 * Uso:
 *   npm run configurar-secrets-google
 * 
 * Requisitos:
 * 1. Ter o arquivo credentials.json no caminho: "Meu Drive/JP/app BPMA/Nova pasta/"
 * 2. (Opcional) Ter SUPABASE_ACCESS_TOKEN configurado para usar API
 */

import * as fs from 'fs';
import * as path from 'path';

interface GoogleCredentials {
  web: {
    client_id: string;
    client_secret: string;
    project_id?: string;
    auth_uri?: string;
    token_uri?: string;
    redirect_uris?: string[];
    javascript_origins?: string[];
  };
}

// Caminhos possíveis dos arquivos de credenciais
function getCredentialsPaths(): string[] {
  const paths: string[] = [];
  
  // Caminho fornecido pelo usuário (G:\Meu Drive\...)
  const userDrivePath = process.argv[2] || 'g:\\Meu Drive\\JP\\app BPMA\\Nova pasta';
  
  // Tentar múltiplos caminhos
  const possibleBases = [
    userDrivePath,
    path.join(process.env.USERPROFILE || '', 'Meu Drive', 'JP', 'app BPMA', 'Nova pasta'),
    path.join('G:', 'Meu Drive', 'JP', 'app BPMA', 'Nova pasta'),
    path.join('g:', 'Meu Drive', 'JP', 'app BPMA', 'Nova pasta'),
  ];
  
  for (const base of possibleBases) {
    paths.push(path.join(base, 'credentials.json'));
    paths.push(path.join(base, 'chave secreta auth plataform.json'));
  }
  
  return paths;
}

// Configuração do Supabase
const SUPABASE_PROJECT_ID = 'oiwwptnqaunsyhpkwbrz';
const SUPABASE_API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}`;

function readCredentials(filePath: string): GoogleCredentials | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as GoogleCredentials;
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
    return null;
  }
}

function findCredentialsWithPaths(paths: string[]): { credentials: GoogleCredentials; filePath: string } | null {
  for (const filePath of paths) {
    const creds = readCredentials(filePath);
    if (creds && creds.web?.client_id && creds.web?.client_secret) {
      return { credentials: creds, filePath };
    }
  }
  return null;
}

function findCredentials(): { credentials: GoogleCredentials; filePath: string } | null {
  return findCredentialsWithPaths(getCredentialsPaths());
}

async function setSecretViaAPI(secretName: string, secretValue: string): Promise<boolean> {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('⚠️  SUPABASE_ACCESS_TOKEN não configurado. Pulando configuração via API.');
    return false;
  }

  try {
    const response = await fetch(`${SUPABASE_API_URL}/secrets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: secretName,
        value: secretValue,
      }),
    });

    if (response.ok) {
      console.log(`✅ Secret ${secretName} configurado com sucesso via API`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Erro ao configurar ${secretName}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro na requisição para ${secretName}:`, error);
    return false;
  }
}

function generateManualInstructions(creds: GoogleCredentials) {
  generateManualInstructionsFromValues(creds.web.client_id, creds.web.client_secret);
}

function generateManualInstructionsFromValues(clientId: string, clientSecret: string) {
  console.log('\n📋 INSTRUÇÕES MANUAIS PARA CONFIGURAR NO SUPABASE DASHBOARD:\n');
  console.log('1. Acesse: https://supabase.com/dashboard/project/oiwwptnqaunsyhpkwbrz/settings/functions');
  console.log('2. Role até a seção "Secrets"');
  console.log('3. Clique em "Add new secret" para cada um dos seguintes:\n');
  
  console.log('   Secret: GOOGLE_CLIENT_ID');
  console.log(`   Value: ${clientId}\n`);
  
  console.log('   Secret: GOOGLE_CLIENT_SECRET');
  console.log(`   Value: ${clientSecret}\n`);
  
  console.log('   Secret: GOOGLE_REFRESH_TOKEN');
  console.log('   Value: [Você precisa obter este token - veja instruções abaixo]\n');
  
  console.log('📝 NOTA: O GOOGLE_REFRESH_TOKEN precisa ser obtido separadamente.');
  console.log('   Você pode usar o OAuth 2.0 Playground do Google para obter:');
  console.log('   https://developers.google.com/oauthplayground/\n');
  
  console.log('🔗 Link direto para a página de Secrets:');
  console.log('   https://supabase.com/dashboard/project/oiwwptnqaunsyhpkwbrz/settings/functions\n');
}

async function main() {
  console.log('🔍 Procurando arquivos de credenciais...\n');
  
  // Usar função para obter caminhos dinamicamente
  const paths = getCredentialsPaths();
  const found = findCredentialsWithPaths(paths);
  
  if (!found) {
    console.error('❌ Não foi possível encontrar os arquivos de credenciais.');
    console.log('\nCaminhos procurados:');
    getCredentialsPaths().forEach(p => console.log(`  - ${p}`));
    console.log('\n💡 Dica: Você pode passar o caminho como argumento:');
    console.log('   npm run configurar-secrets-google "G:\\Meu Drive\\JP\\app BPMA\\Nova pasta"');
    console.log('\n📋 Mesmo sem os arquivos, aqui estão os valores que você precisa configurar:\n');
    console.log('   GOOGLE_CLIENT_ID: 26282009322-6l59ltfic13fipnbpqk4tlv7elfa8r8e.apps.googleusercontent.com');
    console.log('   GOOGLE_CLIENT_SECRET: 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\n');
    console.log('   (Valores extraídos do arquivo credentials.json que você mencionou)');
    generateManualInstructionsFromValues(
      '26282009322-6l59ltfic13fipnbpqk4tlv7elfa8r8e.apps.googleusercontent.com',
      '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'
    );
    process.exit(0);
  }

  const { credentials, filePath } = found;
  console.log(`✅ Credenciais encontradas em: ${filePath}`);
  console.log(`   Project ID: ${credentials.web.project_id || 'N/A'}`);
  console.log(`   Client ID: ${credentials.web.client_id}\n`);

  // Tentar configurar via API se tiver token
  const useAPI = !!process.env.SUPABASE_ACCESS_TOKEN;
  
  if (useAPI) {
    console.log('🚀 Tentando configurar via Supabase API...\n');
    
    const clientIdSet = await setSecretViaAPI('GOOGLE_CLIENT_ID', credentials.web.client_id);
    const clientSecretSet = await setSecretViaAPI('GOOGLE_CLIENT_SECRET', credentials.web.client_secret);
    
    if (clientIdSet && clientSecretSet) {
      console.log('\n✅ Todos os secrets foram configurados com sucesso!');
      console.log('⚠️  Lembre-se de configurar GOOGLE_REFRESH_TOKEN manualmente.');
      return;
    }
  }

  // Se não conseguiu via API ou não tem token, mostrar instruções manuais
  generateManualInstructions(credentials);
  
  // Gerar arquivo .env de exemplo
  const envExample = `# Exemplo de .env para desenvolvimento local (supabase/.env)
# NÃO commite este arquivo!

GOOGLE_CLIENT_ID=${credentials.web.client_id}
GOOGLE_CLIENT_SECRET=${credentials.web.client_secret}
GOOGLE_REFRESH_TOKEN=seu_refresh_token_aqui
`;

  const envPath = path.join(process.cwd(), 'supabase', '.env.example');
  fs.writeFileSync(envPath, envExample);
  console.log(`\n📄 Arquivo de exemplo criado: ${envPath}`);
  console.log('   (Você pode copiar para supabase/.env e preencher o refresh token)');
}

main().catch(console.error);
