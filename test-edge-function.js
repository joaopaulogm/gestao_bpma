/**
 * Script de teste para Edge Function admin-pessoas
 * 
 * Uso:
 * 1. Configure as variáveis abaixo com suas credenciais
 * 2. Execute: node test-edge-function.js
 * 
 * Requer: npm install node-fetch (ou use fetch nativo no Node 18+)
 */

const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-pessoas`;

// Substitua pelo token de um usuário ADMIN
const ADMIN_TOKEN = 'SEU_TOKEN_ADMIN_AQUI';

// Substitua pelo token de um usuário NÃO-ADMIN (opcional)
const NON_ADMIN_TOKEN = 'SEU_TOKEN_NAO_ADMIN_AQUI';

// Função auxiliar para fazer requisições
async function testAction(action, payload, token, description) {
  console.log(`\n🧪 Testando: ${description}`);
  console.log(`   Action: ${action}`);
  console.log(`   Payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Resultado:`, JSON.stringify(result, null, 2));

    if (response.ok && result.ok) {
      console.log(`   ✅ SUCESSO`);
      return true;
    } else {
      console.log(`   ❌ FALHA`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERRO:`, error.message);
    return false;
  }
}

// Testes principais
async function runTests() {
  console.log('🚀 Iniciando testes da Edge Function admin-pessoas\n');
  console.log('='.repeat(60));

  // Teste 1: Verificar autenticação (sem token)
  console.log('\n📋 TESTE 1: Verificar autenticação (sem token)');
  await testAction(
    'abono_upsert',
    { efetivo_id: 'test', ano: 2026, mes: 1 },
    '',
    'Sem token - deve falhar'
  );

  // Teste 2: Verificar acesso não-admin
  if (NON_ADMIN_TOKEN && NON_ADMIN_TOKEN !== 'SEU_TOKEN_NAO_ADMIN_AQUI') {
    console.log('\n📋 TESTE 2: Verificar acesso não-admin');
    await testAction(
      'abono_upsert',
      { efetivo_id: 'test', ano: 2026, mes: 1 },
      NON_ADMIN_TOKEN,
      'Usuário não-admin - deve retornar 403'
    );
  }

  // Teste 3: Verificar acesso admin (deve funcionar)
  if (ADMIN_TOKEN && ADMIN_TOKEN !== 'SEU_TOKEN_ADMIN_AQUI') {
    console.log('\n📋 TESTE 3: Verificar acesso admin');
    
    // Nota: Estes testes podem falhar se os dados não existirem
    // Ajuste os UUIDs conforme necessário
    
    console.log('\n⚠️  NOTA: Os testes abaixo podem falhar se os dados não existirem.');
    console.log('   Ajuste os UUIDs e dados conforme necessário.\n');

    // Teste 3.1: Abono upsert (ajuste o efetivo_id)
    await testAction(
      'abono_upsert',
      {
        // efetivo_id: 'uuid-do-efetivo-aqui',
        matricula: 'TESTE123', // ou use efetivo_id
        ano: 2026,
        mes: 1,
        observacao: 'Teste via script'
      },
      ADMIN_TOKEN,
      'Admin - Abono upsert'
    );

    // Teste 3.2: Verificar função (sem operação de banco)
    console.log('\n📋 TESTE 4: Verificar estrutura da função');
    const testResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`   CORS Preflight Status: ${testResponse.status}`);
    if (testResponse.status === 200) {
      console.log(`   ✅ CORS configurado corretamente`);
    }
  } else {
    console.log('\n⚠️  Configure ADMIN_TOKEN para testar operações de admin');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testes concluídos!');
  console.log('\n💡 Dica: Verifique os logs da Edge Function no Supabase Dashboard');
  console.log('   para mais detalhes sobre as requisições.');
}

// Executar testes
if (typeof fetch === 'undefined') {
  console.error('❌ Este script requer fetch. Use Node.js 18+ ou instale node-fetch:');
  console.error('   npm install node-fetch');
  console.error('   E adicione: import fetch from "node-fetch";');
  process.exit(1);
}

runTests().catch(console.error);
