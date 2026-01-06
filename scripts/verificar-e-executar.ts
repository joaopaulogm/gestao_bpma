import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc2MjYzNCwiZXhwIjoyMDU2MzM4NjM0fQ.X2JGeeM9J8ejHSN8gqFT5XsSX3EhXhV-9JVGhHuO7kc";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verificarOuCriarFuncao() {
  console.log('\n🔍 Verificando se a função exec_sql existe...\n');
  
  try {
    // Tentar executar a função para ver se existe
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: 'SELECT 1;' 
    });
    
    if (error && (error.message.includes('function exec_sql') || error.code === '42883')) {
      console.log('⚠️  Função exec_sql não encontrada. Criando...\n');
      
      const funcaoSql = readFileSync(join(__dirname, 'criar-funcao-exec-sql.sql'), 'utf-8');
      
      // Executar via query direta usando pg_* functions
      // Como não podemos executar DDL via API, vamos tentar criar via uma query especial
      const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
`;
      
      // Tentar criar via uma abordagem alternativa
      // Infelizmente, Supabase não permite executar DDL via REST API diretamente
      console.log('❌ Não é possível criar a função automaticamente via API.');
      console.log('\n📝 Por favor, execute manualmente no Supabase Dashboard SQL Editor:');
      console.log('   1. Abra: scripts/criar-funcao-exec-sql.sql');
      console.log('   2. Copie e execute no SQL Editor');
      console.log('   3. Depois execute este script novamente\n');
      
      return false;
    } else if (error) {
      console.log('⚠️  Erro ao verificar função:', error.message);
      return false;
    } else {
      console.log('✅ Função exec_sql encontrada!\n');
      return true;
    }
  } catch (err: any) {
    console.log('⚠️  Erro:', err.message);
    return false;
  }
}

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    // Dividir SQL em comandos, preservando INSERTs completos
    const commands: string[] = [];
    let currentCommand = '';
    
    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      currentCommand += line + '\n';
      
      if (trimmed.endsWith(';')) {
        const cmd = currentCommand.trim();
        if (cmd.length > 0) {
          commands.push(cmd);
        }
        currentCommand = '';
      }
    }
    
    if (currentCommand.trim().length > 0) {
      commands.push(currentCommand.trim());
    }

    console.log(`\n📝 ${description}`);
    console.log(`   Total de comandos: ${commands.length}`);
    console.log(`   Executando...\n`);

    let success = 0;
    let errors = 0;
    const errorsList: string[] = [];
    const batchSize = 10;
    
    for (let i = 0; i < commands.length; i += batchSize) {
      const batch = commands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(commands.length / batchSize);
      
      process.stdout.write(`\r   Lote ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, commands.length)}/${commands.length})...`);
      
      for (const cmd of batch) {
        if (!cmd.trim()) continue;
        
        try {
          const { error: rpcError } = await supabase.rpc('exec_sql', { 
            sql_query: cmd 
          });
          
          if (rpcError) {
            if (rpcError.message.includes('function exec_sql') || rpcError.code === '42883') {
              console.log(`\n\n❌ Função exec_sql não encontrada!`);
              console.log(`\nExecute primeiro: scripts/criar-funcao-exec-sql.sql no Dashboard\n`);
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
    
    console.log(`\n\n   ✅ Comandos executados: ${success}`);
    if (errors > 0) {
      console.log(`   ⚠️  Erros: ${errors}`);
      if (errorsList.length > 0 && errors <= 10) {
        console.log(`\n   Erros:`);
        errorsList.forEach(err => console.log(`   - ${err}`));
      }
    }
    
    return errors === 0 || success > errors;
  } catch (error: any) {
    console.error(`\n   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Executando Migrations de Estatísticas BPMA');
  console.log('='.repeat(60));
  
  // Verificar ou criar função
  const funcaoExiste = await verificarOuCriarFuncao();
  if (!funcaoExiste) {
    console.log('\n⏸️  Aguardando criação da função...');
    console.log('   Execute o arquivo criar-funcao-exec-sql.sql no Dashboard e tente novamente.\n');
    process.exit(1);
  }
  
  const baseDir = join(__dirname, '..');
  const migrationsDir = join(baseDir, 'supabase', 'migrations');
  
  // Migration 1
  const migration1Path = join(migrationsDir, '20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql');
  console.log(`\n📄 Migration 1: ${migration1Path}`);
  
  let migration1SQL: string;
  try {
    migration1SQL = readFileSync(migration1Path, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Erro ao ler: ${error.message}`);
    process.exit(1);
  }
  
  const result1 = await executeSQL(migration1SQL, 'Migration 1: Criar Tabelas');
  
  if (!result1) {
    console.log('\n⚠️  Migration 1 teve erros, mas continuando...');
  }
  
  // Migration 2
  const migration2Path = join(migrationsDir, '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql');
  console.log(`\n📄 Migration 2: ${migration2Path}`);
  console.log('⚠️  Arquivo grande (4.1 MB), pode levar alguns minutos...\n');
  
  let migration2SQL: string;
  try {
    migration2SQL = readFileSync(migration2Path, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Erro ao ler: ${error.message}`);
    process.exit(1);
  }
  
  const result2 = await executeSQL(migration2SQL, 'Migration 2: Popular Dados');
  
  // Verificação
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 Verificando resultados...\n');
  
  try {
    const { count: tempoCount } = await supabase
      .from('dim_tempo')
      .select('*', { count: 'exact', head: true });
    
    const { count: indicadorCount } = await supabase
      .from('dim_indicador_bpma')
      .select('*', { count: 'exact', head: true });
    
    const { count: factIndicadorCount } = await supabase
      .from('fact_indicador_mensal_bpma')
      .select('*', { count: 'exact', head: true });
    
    const { count: factResgateCount } = await supabase
      .from('fact_resgate_fauna_especie_mensal')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Resultados:');
    console.log(`   ✅ dim_tempo: ${tempoCount || 0} registros`);
    console.log(`   ✅ dim_indicador_bpma: ${indicadorCount || 0} registros`);
    console.log(`   ✅ fact_indicador_mensal_bpma: ${factIndicadorCount || 0} registros`);
    console.log(`   ✅ fact_resgate_fauna_especie_mensal: ${factResgateCount || 0} registros`);
    
  } catch (error: any) {
    console.log(`⚠️  Erro na verificação: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (result1 && result2) {
    console.log('\n🎉 Todas as migrations foram executadas com sucesso!\n');
  } else {
    console.log('\n⚠️  Algumas migrations tiveram erros.');
    console.log('   Verifique os logs acima e execute manualmente se necessário.\n');
  }
}

main().catch(console.error);

