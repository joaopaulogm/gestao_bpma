import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc2MjYzNCwiZXhwIjoyMDU2MzM4NjM0fQ.X2JGeeM9J8ejHSN8gqFT5XsSX3EhXhV-9JVGhHuO7kc";

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    console.log('📄 Lendo arquivo de migration...');
    const migrationPath = join(process.cwd(), 'supabase/migrations/20260125000005_forcar_sincronizacao_completa_user_roles.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Executando migration...');
    console.log('   Arquivo: 20260125000005_forcar_sincronizacao_completa_user_roles.sql');
    
    // Dividir em comandos (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`   Total de comandos: ${commands.length}`);
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      
      // Pular comentários e blocos DO $$
      if (cmd.startsWith('--') || cmd.startsWith('DO $$')) {
        // Processar blocos DO $$ completos
        if (cmd.includes('DO $$')) {
          // Tentar executar o bloco completo
          try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: cmd + ';' });
            if (error) {
              // Se exec_sql não existir, tentar executar diretamente
              const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPABASE_SERVICE_KEY,
                  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({ sql_query: cmd + ';' })
              });
              
              if (!response.ok) {
                console.warn(`   ⚠️  Comando ${i + 1} pode precisar ser executado manualmente (bloco DO $$)`);
                continue;
              }
            }
            success++;
          } catch (err: any) {
            console.warn(`   ⚠️  Comando ${i + 1}: ${err.message.substring(0, 80)}`);
            errors++;
          }
        }
        continue;
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: cmd + ';' });
        
        if (error) {
          // Se exec_sql não existir, informar
          if (error.message.includes('function exec_sql') || error.code === '42883') {
            console.error('\n❌ Função exec_sql não encontrada!');
            console.error('\nExecute primeiro no Supabase Dashboard SQL Editor:');
            console.error('   Arquivo: scripts/criar-funcao-exec-sql.sql\n');
            process.exit(1);
          }
          
          errors++;
          if (errors <= 5) {
            console.error(`   ❌ Erro ${i + 1}: ${error.message.substring(0, 100)}`);
          }
        } else {
          success++;
          if ((i + 1) % 10 === 0) {
            process.stdout.write(`\r   Progresso: ${i + 1}/${commands.length} (${Math.round((i + 1)/commands.length*100)}%)`);
          }
        }
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.error(`   ❌ Erro ${i + 1}: ${err.message.substring(0, 100)}`);
        }
      }
    }
    
    console.log(`\n\n✅ Comandos executados: ${success}`);
    if (errors > 0) {
      console.log(`   ⚠️  Erros: ${errors}`);
    }
    
    // Executar a função de sincronização
    console.log('\n🔄 Executando sincronização...');
    const { data: syncResult, error: syncError } = await supabase.rpc('forcar_sincronizacao_user_roles');
    
    if (syncError) {
      console.error('❌ Erro ao executar sincronização:', syncError.message);
    } else if (syncResult && syncResult.length > 0) {
      const result = syncResult[0];
      console.log('\n📊 Resultado da Sincronização:');
      console.log(`   ✅ Usuários processados: ${result.usuarios_processados}`);
      console.log(`   ✅ Roles criados: ${result.roles_criados}`);
      console.log(`   ✅ Roles atualizados: ${result.roles_atualizados}`);
      console.log(`   ⚠️  Usuários sem auth_user_id: ${result.usuarios_sem_auth_user_id}`);
      console.log(`   ⚠️  Usuários sem efetivo_id: ${result.usuarios_sem_efetivo_id}`);
      console.log(`   ⚠️  Usuários sem matrícula: ${result.usuarios_sem_matricula}`);
      
      if (result.detalhes_erros && result.detalhes_erros.length > 0) {
        console.log('\n📋 Detalhes dos problemas:');
        result.detalhes_erros.forEach((erro: any, index: number) => {
          console.log(`   ${index + 1}. ${erro.tipo}: ${erro.nome} (${erro.login}) - ${erro.mensagem}`);
        });
      }
    }
    
    // Verificar cobertura
    console.log('\n🔍 Verificando cobertura...');
    const { data: coverage, error: coverageError } = await supabase.rpc('verificar_cobertura_user_roles');
    
    if (coverageError) {
      console.error('❌ Erro ao verificar cobertura:', coverageError.message);
    } else if (coverage && coverage.length > 0) {
      const cov = coverage[0];
      console.log('\n📈 Cobertura de user_roles:');
      console.log(`   Total de policiais em efetivo_roles: ${cov.total_efetivo_roles}`);
      console.log(`   ✅ Com user_roles: ${cov.total_com_user_roles}`);
      console.log(`   ⚠️  Sem user_roles: ${cov.total_sem_user_roles}`);
      
      if (cov.total_sem_user_roles > 0) {
        console.log('\n⚠️  Policiais sem user_roles:');
        if (cov.policiais_sem_user_roles && cov.policiais_sem_user_roles.length > 0) {
          cov.policiais_sem_user_roles.forEach((p: any, index: number) => {
            console.log(`   ${index + 1}. ${p.nome} (${p.matricula}) - ${p.tem_auth_user_id ? 'Tem auth_user_id' : 'Sem auth_user_id'}`);
          });
        }
      }
    }
    
    console.log('\n✅ Sincronização concluída!');
    
  } catch (error: any) {
    console.error('❌ Erro ao executar migration:', error.message);
    process.exit(1);
  }
}

executeMigration();
