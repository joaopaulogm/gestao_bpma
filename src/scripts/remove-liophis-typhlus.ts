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

async function removeLiophisTyphlus() {
  try {
    console.log('Verificando espécies Liophis typhlus e Erythrolamprus typhlus...\n');
    
    // Verificar Liophis typhlus (nome antigo - deve ser removido)
    const { data: liophis, error: liophisError } = await supabase
      .from('dim_especies_fauna')
      .select('id, nome_popular, nome_cientifico')
      .ilike('nome_cientifico', 'Liophis typhlus%');
    
    if (liophisError) {
      console.error('Erro ao buscar Liophis typhlus:', liophisError);
      process.exit(1);
    }
    
    // Verificar Erythrolamprus typhlus (nome atualizado - deve ser mantido)
    const { data: erythrolamprus, error: erythError } = await supabase
      .from('dim_especies_fauna')
      .select('id, nome_popular, nome_cientifico')
      .ilike('nome_cientifico', 'Erythrolamprus typhlus%');
    
    if (erythError) {
      console.error('Erro ao buscar Erythrolamprus typhlus:', erythError);
      process.exit(1);
    }
    
    console.log(`Liophis typhlus (nome antigo - será removido): ${liophis?.length || 0} registro(s)`);
    if (liophis && liophis.length > 0) {
      liophis.forEach(e => {
        console.log(`  - ${e.nome_popular} (${e.nome_cientifico}) - ID: ${e.id}`);
      });
    }
    
    console.log(`\nErythrolamprus typhlus (nome atualizado - será mantido): ${erythrolamprus?.length || 0} registro(s)`);
    if (erythrolamprus && erythrolamprus.length > 0) {
      erythrolamprus.forEach(e => {
        console.log(`  - ${e.nome_popular} (${e.nome_cientifico}) - ID: ${e.id}`);
      });
    }
    
    if (!liophis || liophis.length === 0) {
      console.log('\n✓ Não há registros de Liophis typhlus para remover.');
      return;
    }
    
    console.log('\nRemovendo Liophis typhlus...');
    
    // Remover Liophis typhlus
    const { data: deleted, error: deleteError } = await supabase
      .from('dim_especies_fauna')
      .delete()
      .ilike('nome_cientifico', 'Liophis typhlus%')
      .select();
    
    if (deleteError) {
      console.error('Erro ao remover Liophis typhlus:', deleteError);
      process.exit(1);
    }
    
    console.log(`✓ Liophis typhlus removido com sucesso!`);
    console.log(`✓ ${deleted?.length || 0} registro(s) removido(s)`);
    
    // Verificar se ainda existe
    const { data: remaining, error: verifyError } = await supabase
      .from('dim_especies_fauna')
      .select('id')
      .ilike('nome_cientifico', 'Liophis typhlus%');
    
    if (verifyError) {
      console.warn('Aviso: Não foi possível verificar se Liophis typhlus foi removido');
    } else if (remaining && remaining.length > 0) {
      console.warn(`⚠️  Ainda existem ${remaining.length} registro(s) com Liophis typhlus`);
    } else {
      console.log('✓ Confirmação: Liophis typhlus não existe mais na tabela.');
    }
    
    // Confirmar que Erythrolamprus typhlus ainda existe
    const { data: finalEryth, error: finalError } = await supabase
      .from('dim_especies_fauna')
      .select('id, nome_popular, nome_cientifico')
      .ilike('nome_cientifico', 'Erythrolamprus typhlus%');
    
    if (finalError) {
      console.warn('Aviso: Não foi possível verificar Erythrolamprus typhlus');
    } else if (finalEryth && finalEryth.length > 0) {
      console.log(`\n✓ Erythrolamprus typhlus mantido: ${finalEryth.length} registro(s)`);
    } else {
      console.warn('\n⚠️  Atenção: Erythrolamprus typhlus não foi encontrado na tabela.');
      console.warn('   Você pode precisar adicionar esta espécie manualmente.');
    }
    
  } catch (error) {
    console.error('Erro ao processar:', error);
    process.exit(1);
  }
}

removeLiophisTyphlus();

