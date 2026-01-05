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

async function removeSpecies() {
  try {
    console.log('Buscando espécie Anilius scytale...\n');
    
    // Primeiro, verificar se a espécie existe
    const { data: existing, error: checkError } = await supabase
      .from('dim_especies_fauna')
      .select('id, nome_popular, nome_cientifico')
      .ilike('nome_cientifico', 'Anilius scytale%');
    
    if (checkError) {
      console.error('Erro ao buscar espécie:', checkError);
      process.exit(1);
    }
    
    if (!existing || existing.length === 0) {
      console.log('✓ Espécie Anilius scytale não encontrada na tabela.');
      return;
    }
    
    console.log(`Encontrada(s) ${existing.length} ocorrência(s):`);
    existing.forEach(e => {
      console.log(`  - ${e.nome_popular} (${e.nome_cientifico}) - ID: ${e.id}`);
    });
    
    console.log('\nRemovendo espécie...');
    
    // Remover a espécie
    const { data, error } = await supabase
      .from('dim_especies_fauna')
      .delete()
      .ilike('nome_cientifico', 'Anilius scytale%')
      .select();
    
    if (error) {
      console.error('Erro ao remover espécie:', error);
      process.exit(1);
    }
    
    console.log(`✓ Espécie removida com sucesso!`);
    console.log(`✓ ${data?.length || 0} registro(s) removido(s)`);
    
    // Verificar se ainda existe
    const { data: remaining, error: verifyError } = await supabase
      .from('dim_especies_fauna')
      .select('id')
      .ilike('nome_cientifico', 'Anilius scytale%');
    
    if (verifyError) {
      console.warn('Aviso: Não foi possível verificar se a espécie foi removida');
    } else if (remaining && remaining.length > 0) {
      console.warn(`⚠️  Ainda existem ${remaining.length} registro(s) com Anilius scytale`);
    } else {
      console.log('✓ Confirmação: Espécie Anilius scytale não existe mais na tabela.');
    }
    
  } catch (error) {
    console.error('Erro ao remover espécie:', error);
    process.exit(1);
  }
}

removeSpecies();

