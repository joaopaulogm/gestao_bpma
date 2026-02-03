import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL) {
  console.error('ERRO: A variável de ambiente SUPABASE_URL não está definida!');
  console.error('Ex.: $env:SUPABASE_URL="https://xxx.supabase.co"');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida!');
  console.error('Ex.: $env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(filePath: string, description: string) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Executando: ${description}`);
    console.log(`Arquivo: ${filePath}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const sql = readFileSync(filePath, 'utf-8');
    
    // Dividir em comandos menores se necessário (para arquivos grandes)
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`Total de comandos: ${commands.length}`);
    console.log('Executando...\n');
    
    let executed = 0;
    let errors = 0;
    
    // Executar em lotes para evitar timeout
    const batchSize = 100;
    for (let i = 0; i < commands.length; i += batchSize) {
      const batch = commands.slice(i, i + batchSize);
      const batchSql = batch.join(';') + ';';
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: batchSql });
        
        if (error) {
          // Se a função exec_sql não existir, tentar executar diretamente via REST
          console.log('Tentando método alternativo...');
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ sql_query: batchSql })
          });
          
          if (!response.ok) {
            // Método final: executar via query direta (limitado)
            console.log('Executando comandos individuais...');
            for (const cmd of batch) {
              if (cmd.trim()) {
                try {
                  // Para comandos DDL, usar execução direta
                  const { error: cmdError } = await supabase
                    .from('_migrations')
                    .select('*')
                    .limit(0); // Apenas para testar conexão
                  
                  // Executar via SQL direto usando PostgREST
                  const sqlCmd = cmd.trim() + ';';
                  const { error: sqlError } = await supabase.rpc('exec_sql', { 
                    sql_query: sqlCmd 
                  });
                  
                  if (sqlError) {
                    console.error(`Erro no comando ${executed + 1}:`, sqlError.message);
                    errors++;
                  } else {
                    executed++;
                    if (executed % 50 === 0) {
                      process.stdout.write(`\rExecutados: ${executed}/${commands.length}`);
                    }
                  }
                } catch (err: unknown) {
                  console.error(`Erro: ${err instanceof Error ? err.message : String(err)}`);
                  errors++;
                }
              }
            }
          } else {
            executed += batch.length;
            process.stdout.write(`\rExecutados: ${executed}/${commands.length}`);
          }
        } else {
          executed += batch.length;
          process.stdout.write(`\rExecutados: ${executed}/${commands.length}`);
        }
      } catch (err: unknown) {
        console.error(`\nErro no lote ${i / batchSize + 1}:`, err instanceof Error ? err.message : err);
        errors++;
      }
    }
    
    console.log(`\n\n✓ Migração concluída!`);
    console.log(`✓ Comandos executados: ${executed}`);
    if (errors > 0) {
      console.log(`⚠ Erros: ${errors}`);
    }
    
  } catch (error: unknown) {
    console.error(`\n✗ Erro ao executar migração:`, error instanceof Error ? error.message : error);
    console.error('\nNota: Para arquivos grandes, você pode precisar executar manualmente no Supabase Dashboard SQL Editor');
    process.exit(1);
  }
}

async function main() {
  const baseDir = join(__dirname, '..');
  const migrationsDir = join(baseDir, 'supabase', 'migrations');
  
  console.log('\n🚀 Executando Migrations de Estatísticas BPMA\n');
  
  // Migration 1: Criar tabelas
  const migration1 = join(migrationsDir, '20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql');
  await runMigration(migration1, 'Criar Tabelas (dim_tempo, dim_indicador_bpma, fact_*)');
  
  // Migration 2: Popular dados
  const migration2 = join(migrationsDir, '20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql');
  console.log('\n⚠️  ATENÇÃO: A segunda migration é muito grande (4.1 MB)');
  console.log('⚠️  Recomendado executar manualmente no Supabase Dashboard SQL Editor');
  console.log(`⚠️  Arquivo: ${migration2}\n`);
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Deseja tentar executar mesmo assim? (s/N): ', async (answer: string) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      await runMigration(migration2, 'Popular Dados (6.239 atendimentos + 3.520 resgates)');
    } else {
      console.log('\n✓ Pulando segunda migration. Execute manualmente no Supabase Dashboard.');
    }
    
    rl.close();
    console.log('\n✅ Processo concluído!\n');
  });
}

main().catch(console.error);

