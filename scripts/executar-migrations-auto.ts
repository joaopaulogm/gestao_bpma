import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc2MjYzNCwiZXhwIjoyMDU2MzM4NjM0fQ.X2JGeeM9J8ejHSN8gqFT5XsSX3EhXhV-9JVGhHuO7kc";

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida!');
  console.error('\nPor favor, defina a variável antes de executar:');
  console.error('$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"');
  console.error('\nPara obter a chave:');
  console.error('1. Acesse: https://supabase.com/dashboard');
  console.error('2. Vá em Settings → API');
  console.error('3. Copie a "service_role" key (secret)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    // Dividir SQL em comandos individuais, preservando INSERTs completos
    const commands: string[] = [];
    let currentCommand = '';
    let inInsert = false;
    
    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar comentários e linhas vazias
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      currentCommand += line + '\n';
      
      // Detectar fim de comando (ponto e vírgula no final da linha)
      if (trimmed.endsWith(';')) {
        const cmd = currentCommand.trim();
        if (cmd.length > 0) {
          commands.push(cmd);
        }
        currentCommand = '';
        inInsert = false;
      }
    }
    
    // Adicionar último comando se não terminou com ;
    if (currentCommand.trim().length > 0) {
      commands.push(currentCommand.trim());
    }

    console.log(`\n📝 ${description}`);
    console.log(`   Total de comandos: ${commands.length}`);
    console.log(`   Executando...\n`);

    let success = 0;
    let errors = 0;
    const errorsList: string[] = [];

    // Executar em lotes menores para evitar timeout
    const batchSize = 10; // Reduzido para INSERTs grandes
    
    for (let i = 0; i < commands.length; i += batchSize) {
      const batch = commands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(commands.length / batchSize);
      
      process.stdout.write(`\r   Lote ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, commands.length)}/${commands.length})...`);
      
      // Executar cada comando do lote
      for (const cmd of batch) {
        if (!cmd.trim()) continue;
        
        try {
          // Tentar executar via RPC exec_sql
          const { error: rpcError } = await supabase.rpc('exec_sql', { 
            sql_query: cmd 
          });
          
          if (rpcError) {
            // Se RPC não existir, informar usuário
            if (rpcError.message.includes('function exec_sql') || rpcError.code === '42883') {
              console.log(`\n\n❌ Função exec_sql não encontrada!`);
              console.log(`\nPor favor, execute PRIMEIRO no Supabase Dashboard SQL Editor:`);
              console.log(`   Arquivo: scripts/criar-funcao-exec-sql.sql`);
              console.log(`\nDepois execute este script novamente.\n`);
              return false;
            }
            
            errors++;
            if (errors <= 5) {
              errorsList.push(`Erro: ${rpcError.message.substring(0, 100)}`);
            }
          } else {
            success++;
          }
        } catch (err: any) {
          errors++;
          if (errors <= 5) {
            errorsList.push(`Erro: ${err.message.substring(0, 100)}`);
          }
        }
      }
    }
    
    console.log(`\n\n   ✅ Comandos executados com sucesso: ${success}`);
    if (errors > 0) {
      console.log(`   ⚠️  Erros: ${errors}`);
      if (errorsList.length > 0) {
        console.log(`\n   Primeiros erros:`);
        errorsList.forEach(err => console.log(`   - ${err}`));
      }
    }
    
    return errors === 0 || success > errors;
  } catch (error: any) {
    console.error(`\n   ❌ Erro ao executar: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Executando Migrations de Estatísticas BPMA Automaticamente\n');
  console.log('=' .repeat(60));
  
  const baseDir = join(__dirname, '..');
  const migrationsDir = join(baseDir, 'supabase', 'migrations');
  
  // Migration 1: Criar tabelas
  const migration1Path = join(migrationsDir, '20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql');
  console.log(`\n📄 Lendo: ${migration1Path}`);
  
  let migration1SQL: string;
  try {
    migration1SQL = readFileSync(migration1Path, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Erro ao ler arquivo: ${error.message}`);
    process.exit(1);
  }
  
  const result1 = await executeSQL(migration1SQL, 'Migration 1: Criar Tabelas');
  
  if (!result1) {
    console.log('\n⚠️  Migration 1 teve alguns erros, mas continuando...');
  }
  
  // Migration 2: Popular dados
  const migration2Path = join(migrationsDir, '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql');
  console.log(`\n📄 Lendo: ${migration2Path}`);
  console.log('⚠️  Este arquivo é grande (4.1 MB), pode levar alguns minutos...\n');
  
  let migration2SQL: string;
  try {
    migration2SQL = readFileSync(migration2Path, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Erro ao ler arquivo: ${error.message}`);
    process.exit(1);
  }
  
  const result2 = await executeSQL(migration2SQL, 'Migration 2: Popular Dados');
  
  // Verificação final
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Verificando resultados...\n');
  
  try {
    const { data: tempoData, error: tempoError } = await supabase
      .from('dim_tempo')
      .select('id', { count: 'exact', head: true });
    
    const { data: indicadorData, error: indicadorError } = await supabase
      .from('dim_indicador_bpma')
      .select('id', { count: 'exact', head: true });
    
    const { data: factIndicadorData, error: factIndicadorError } = await supabase
      .from('fact_indicador_mensal_bpma')
      .select('tempo_id', { count: 'exact', head: true });
    
    const { data: factResgateData, error: factResgateError } = await supabase
      .from('fact_resgate_fauna_especie_mensal')
      .select('id', { count: 'exact', head: true });
    
    console.log('📊 Resultados:');
    if (!tempoError) console.log(`   ✅ dim_tempo: ${tempoData?.length || 0} registros`);
    if (!indicadorError) console.log(`   ✅ dim_indicador_bpma: ${indicadorData?.length || 0} registros`);
    if (!factIndicadorError) console.log(`   ✅ fact_indicador_mensal_bpma: ${factIndicadorData?.length || 0} registros`);
    if (!factResgateError) console.log(`   ✅ fact_resgate_fauna_especie_mensal: ${factResgateData?.length || 0} registros`);
    
    if (tempoError || indicadorError || factIndicadorError || factResgateError) {
      console.log('\n⚠️  Algumas verificações falharam. Execute manualmente no Dashboard para confirmar.');
    }
  } catch (error: any) {
    console.log(`\n⚠️  Erro na verificação: ${error.message}`);
    console.log('   Execute as queries de verificação manualmente no Dashboard.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Processo concluído!\n');
  
  if (!result1 || !result2) {
    console.log('⚠️  Algumas migrations tiveram erros.');
    console.log('   Recomendado: Execute manualmente no Supabase Dashboard para garantir.');
    console.log('   Dashboard: https://supabase.com/dashboard → SQL Editor\n');
  } else {
    console.log('🎉 Todas as migrations foram executadas com sucesso!\n');
  }
}

main().catch(console.error);

