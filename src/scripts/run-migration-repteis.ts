import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida!');
  console.error('Por favor, defina a variável antes de executar o script:');
  console.error('$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('Executando migração para atualizar REPTIL -> RÉPTEIS...\n');
    
    // Executar o UPDATE diretamente usando o cliente Supabase
    const { data, error } = await supabase
      .from('dim_especies_fauna')
      .update({ classe_taxonomica: 'RÉPTEIS' })
      .in('classe_taxonomica', ['REPTIL', 'Réptil', 'réptil', 'REPTEIS', 'Repteis', 'repteis', 'RÉPTIL'])
      .select();
    
    if (error) {
      console.error('Erro ao executar migração:', error);
      process.exit(1);
    }
    
    console.log(`✓ Migração executada com sucesso!`);
    console.log(`✓ ${data?.length || 0} registros atualizados de REPTIL para RÉPTEIS`);
    
    // Verificar se ainda há registros com REPTIL
    const { data: remaining, error: checkError } = await supabase
      .from('dim_especies_fauna')
      .select('id, nome_popular, classe_taxonomica')
      .in('classe_taxonomica', ['REPTIL', 'Réptil', 'réptil', 'REPTEIS', 'Repteis', 'repteis', 'RÉPTIL'])
      .neq('classe_taxonomica', 'RÉPTEIS');
    
    if (checkError) {
      console.warn('Aviso: Não foi possível verificar registros restantes');
    } else if (remaining && remaining.length > 0) {
      console.warn(`⚠️  Ainda existem ${remaining.length} registros com variações de REPTIL:`);
      remaining.forEach(r => {
        console.warn(`  - ${r.nome_popular}: ${r.classe_taxonomica}`);
      });
    } else {
      console.log('✓ Todos os registros foram atualizados com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  }
}

runMigration();
