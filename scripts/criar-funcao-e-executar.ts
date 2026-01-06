import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não definida!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function criarFuncaoHelper(): Promise<boolean> {
  console.log('\n📝 Criando função helper exec_sql...\n');
  
  const sqlFuncao = `
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
  
  try {
    // Tentar executar via REST API diretamente
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql_query: sqlFuncao })
    });
    
    if (!response.ok) {
      // Se não funcionar, usar método alternativo via psql ou instruir usuário
      console.log('⚠️  Não foi possível criar a função automaticamente.');
      console.log('\n📋 Por favor, execute PRIMEIRO no Supabase Dashboard SQL Editor:');
      console.log('   Arquivo: scripts/criar-funcao-exec-sql.sql\n');
      return false;
    }
    
    console.log('✅ Função exec_sql criada com sucesso!\n');
    return true;
  } catch (error: any) {
    console.log('⚠️  Não foi possível criar a função automaticamente.');
    console.log('\n📋 Por favor, execute PRIMEIRO no Supabase Dashboard SQL Editor:');
    console.log('   Arquivo: scripts/criar-funcao-exec-sql.sql\n');
    return false;
  }
}

async function executarSQL(sql: string, descricao: string): Promise<boolean> {
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`📝 ${descricao}`);
  console.log(`   Total: ${commands.length} comandos\n`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < commands.length; i++) {
    if (i % 100 === 0 && i > 0) {
      process.stdout.write(`\r   Progresso: ${i}/${commands.length} (${Math.round(i/commands.length*100)}%)`);
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: commands[i] + ';' });
      if (error) {
        errors++;
        if (errors <= 3) console.log(`\n   ⚠️  Erro ${i+1}: ${error.message.substring(0, 80)}`);
      } else {
        success++;
      }
    } catch (err: any) {
      errors++;
    }
  }
  
  console.log(`\n\n   ✅ Sucesso: ${success} | ⚠️  Erros: ${errors}\n`);
  return errors === 0 || success > errors * 10; // Tolerar até 10% de erros
}

async function main() {
  console.log('\n🚀 Executando Migrations de Estatísticas BPMA\n');
  console.log('='.repeat(60));
  
  // Tentar criar função helper
  const funcaoCriada = await criarFuncaoHelper();
  
  if (!funcaoCriada) {
    console.log('❌ É necessário criar a função helper primeiro.');
    console.log('   Execute: scripts/criar-funcao-exec-sql.sql no Dashboard\n');
    process.exit(1);
  }
  
  const baseDir = join(__dirname, '..');
  const migrationsDir = join(baseDir, 'supabase', 'migrations');
  
  // Migration 1
  const migration1Path = join(migrationsDir, '20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql');
  const migration1SQL = readFileSync(migration1Path, 'utf-8');
  await executarSQL(migration1SQL, 'Migration 1: Criar Tabelas');
  
  // Migration 2
  const migration2Path = join(migrationsDir, '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql');
  console.log('📄 Migration 2 é grande (4.1 MB), pode levar alguns minutos...\n');
  const migration2SQL = readFileSync(migration2Path, 'utf-8');
  await executarSQL(migration2SQL, 'Migration 2: Popular Dados');
  
  // Verificação
  console.log('🔍 Verificando resultados...\n');
  const { count: tempoCount } = await supabase.from('dim_tempo').select('*', { count: 'exact', head: true });
  const { count: indicadorCount } = await supabase.from('dim_indicador_bpma').select('*', { count: 'exact', head: true });
  const { count: factIndicadorCount } = await supabase.from('fact_indicador_mensal_bpma').select('*', { count: 'exact', head: true });
  const { count: factResgateCount } = await supabase.from('fact_resgate_fauna_especie_mensal').select('*', { count: 'exact', head: true });
  
  console.log('📊 Resultados:');
  console.log(`   dim_tempo: ${tempoCount || 0} registros`);
  console.log(`   dim_indicador_bpma: ${indicadorCount || 0} registros`);
  console.log(`   fact_indicador_mensal_bpma: ${factIndicadorCount || 0} registros`);
  console.log(`   fact_resgate_fauna_especie_mensal: ${factResgateCount || 0} registros\n`);
  
  console.log('✅ Processo concluído!\n');
}

main().catch(console.error);

