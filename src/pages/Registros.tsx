import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Registro } from '@/types/hotspots';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import RegistrosActions from '@/components/registros/RegistrosActions';
import RegistrosFilters from '@/components/registros/RegistrosFilters';
import RegistrosTable from '@/components/registros/RegistrosTable';
import RegistrosSummary from '@/components/registros/RegistrosSummary';
import RegistrosLoading from '@/components/registros/RegistrosLoading';
import { useRegistroDelete } from '@/hooks/useRegistroDelete';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { handleSupabaseError } from '@/utils/errorHandler';

const Registros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterDestinacao, setFilterDestinacao] = useState('all');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterData, setFilterData] = useState<Date | undefined>(undefined);
  const [filterAno, setFilterAno] = useState('all');
  const [filterMes, setFilterMes] = useState('all');
  const [filterEspecie, setFilterEspecie] = useState('all');
  const [filterNomeCientifico, setFilterNomeCientifico] = useState('');
  const [filterEstagio, setFilterEstagio] = useState('all');
  const [filterQuantidadeMin, setFilterQuantidadeMin] = useState('');
  const [filterQuantidadeMax, setFilterQuantidadeMax] = useState('');
  const [filterRegiao, setFilterRegiao] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensionCache, setDimensionCache] = useState<{
    regioes: Map<string, any>;
    origens: Map<string, any>;
    destinacoes: Map<string, any>;
    estadosSaude: Map<string, any>;
    estagiosVida: Map<string, any>;
    desfechos: Map<string, any>;
    especies: Map<string, any>;
  } | null>(null);
  const navigate = useNavigate();
  
  const { 
    isDeleteDialogOpen, 
    registroToDelete, 
    isDeleting,
    handleDeleteClick, 
    handleDeleteConfirm, 
    handleDeleteCancel 
  } = useRegistroDelete((deletedId) => {
    setRegistros(prevRegistros => prevRegistros.filter(r => r.id !== deletedId));
  });
  
  // Carregar cache de dimensões uma vez
  useEffect(() => {
    loadDimensionCache();
  }, []);
  
  // Carregar registros quando cache estiver pronto ou quando filtros mudarem
  useEffect(() => {
    if (dimensionCache) {
      fetchRegistros();
    }
  }, [dimensionCache, filterAno]);
  
  const loadDimensionCache = async () => {
    try {
      console.log('🔄 Carregando cache de dimensões...');
      const [regioesRes, origensRes, destinacoesRes, estadosSaudeRes, estagiosVidaRes, desfechosRes, especiesRes] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome'),
        supabase.from('dim_origem').select('id, nome'),
        supabase.from('dim_destinacao').select('id, nome'),
        supabase.from('dim_estado_saude').select('id, nome'),
        supabase.from('dim_estagio_vida').select('id, nome'),
        supabase.from('dim_desfecho').select('id, nome, tipo'),
        supabase.from('dim_especies_fauna').select('*')
      ]);
      
      // Verificar erros
      const errors = [
        regioesRes.error && `Regiões: ${regioesRes.error.message}`,
        origensRes.error && `Origens: ${origensRes.error.message}`,
        destinacoesRes.error && `Destinações: ${destinacoesRes.error.message}`,
        estadosSaudeRes.error && `Estados de Saúde: ${estadosSaudeRes.error.message}`,
        estagiosVidaRes.error && `Estágios de Vida: ${estagiosVidaRes.error.message}`,
        desfechosRes.error && `Desfechos: ${desfechosRes.error.message}`,
        especiesRes.error && `Espécies: ${especiesRes.error.message}`
      ].filter(Boolean);
      
      if (errors.length > 0) {
        console.error('❌ Erros ao carregar dimensões:', errors);
        toast.error(`Erro ao carregar algumas dimensões: ${errors.join(', ')}`);
      }
      
      setDimensionCache({
        regioes: new Map((regioesRes.data || []).map(r => [r.id, r])),
        origens: new Map((origensRes.data || []).map(r => [r.id, r])),
        destinacoes: new Map((destinacoesRes.data || []).map(r => [r.id, r])),
        estadosSaude: new Map((estadosSaudeRes.data || []).map(r => [r.id, r])),
        estagiosVida: new Map((estagiosVidaRes.data || []).map(r => [r.id, r])),
        desfechos: new Map((desfechosRes.data || []).map(r => [r.id, r])),
        especies: new Map((especiesRes.data || []).map(e => [e.id, e]))
      });
      
      console.log('✅ Cache de dimensões carregado:', {
        regioes: regioesRes.data?.length || 0,
        origens: origensRes.data?.length || 0,
        destinacoes: destinacoesRes.data?.length || 0,
        estadosSaude: estadosSaudeRes.data?.length || 0,
        estagiosVida: estagiosVidaRes.data?.length || 0,
        desfechos: desfechosRes.data?.length || 0,
        especies: especiesRes.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar cache de dimensões:', error);
      toast.error('Erro ao carregar dados de dimensões. Verifique o console para mais detalhes.');
    }
  };
  
  const fetchRegistros = async () => {
    if (!dimensionCache) {
      console.log('⏳ Aguardando cache de dimensões...');
      return;
    }
    
    setIsLoading(true);
    console.log('🔄 Buscando registros...', { filterAno });
    
    try {
      const allRegistros: Registro[] = [];
      
      // Determinar quais tabelas buscar baseado no filtro de ano
      let tabelas: string[] = [];
      
      if (filterAno === 'all') {
        // Se não há filtro de ano, carregar apenas as mais recentes (2024 e 2025) inicialmente
        tabelas = ['fat_registros_de_resgate', 'fat_resgates_diarios_2025', 'fat_resgates_diarios_2024'];
      } else {
        const ano = parseInt(filterAno);
        // Carregar apenas a tabela do ano selecionado
        if (ano === 2025) {
          tabelas = ['fat_registros_de_resgate', 'fat_resgates_diarios_2025'];
        } else if (ano >= 2020 && ano <= 2024) {
          tabelas = [`fat_resgates_diarios_${ano}`];
        } else if (ano >= 2026) {
          // Para 2026 ou anos futuros, buscar apenas em fat_registros_de_resgate
          tabelas = ['fat_registros_de_resgate'];
        } else {
          tabelas = ['fat_registros_de_resgate'];
        }
      }
      
      console.log('📊 Tabelas a buscar:', tabelas);
      
      // Buscar dados de todas as tabelas em paralelo com limite inicial
      const promises = tabelas.map(async (tabela) => {
        try {
          console.log(`🔍 Buscando de ${tabela}...`);
          
          // Para fat_registros_de_resgate e 2025, usar joins otimizados
          if (tabela === 'fat_registros_de_resgate' || tabela === 'fat_resgates_diarios_2025') {
            let query = supabaseAny
              .from(tabela)
              .select(`
                id,
                data,
                regiao_administrativa_id,
                origem_id,
                destinacao_id,
                estado_saude_id,
                estagio_vida_id,
                desfecho_id,
                especie_id,
                quantidade,
                quantidade_total,
                quantidade_adulto,
                quantidade_filhote,
                latitude_origem,
                longitude_origem,
                atropelamento,
                regiao_administrativa:dim_regiao_administrativa(nome),
                origem:dim_origem(nome),
                destinacao:dim_destinacao(nome),
                estado_saude:dim_estado_saude(nome),
                estagio_vida:dim_estagio_vida(nome),
                desfecho:dim_desfecho(nome, tipo),
                especie:dim_especies_fauna(id, nome_popular, nome_cientifico, classe_taxonomica)
              `)
              .order('data', { ascending: false })
              .limit(1000); // Limite inicial para performance
            
            // Aplicar filtro de ano se especificado
            if (filterAno !== 'all') {
              const ano = parseInt(filterAno);
              const startDate = `${ano}-01-01`;
              const endDate = `${ano}-12-31`;
              // Aplicar filtro de data corretamente
              query = query.gte('data', startDate).lte('data', endDate);
              console.log(`🔍 Aplicando filtro de ano ${ano}: ${startDate} a ${endDate}`);
            }
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ Erro ao buscar de ${tabela}:`, error);
              toast.error(`Erro ao buscar de ${tabela}: ${error.message}`);
              return [];
            }
            
            console.log(`✅ ${tabela}: ${data?.length || 0} registros encontrados`);
            return data || [];
          } else {
            // Para tabelas históricas (2020-2024), buscar apenas campos que existem
            // Essas tabelas têm estrutura diferente: data_ocorrencia, nome_popular, nome_cientifico, etc.
            const campoData = 'data_ocorrencia';
            
            let query = supabaseAny
              .from(tabela)
              .select('id, data_ocorrencia, especie_id, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao')
              .order(campoData, { ascending: false })
              .limit(1000); // Limite inicial
            
            // Aplicar filtro de ano se especificado (para tabelas históricas)
            if (filterAno !== 'all') {
              const ano = parseInt(filterAno);
              const startDate = `${ano}-01-01`;
              const endDate = `${ano}-12-31`;
              query = query.gte(campoData, startDate).lte(campoData, endDate);
              console.log(`🔍 Aplicando filtro de ano ${ano} em ${tabela}: ${startDate} a ${endDate}`);
            }
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ Erro ao buscar de ${tabela}:`, error);
              toast.error(`Erro ao buscar de ${tabela}: ${error.message}`);
              return [];
            }
            
            console.log(`✅ ${tabela}: ${data?.length || 0} registros encontrados`);
            
            // Enriquecer dados com cache de dimensões
            if (data && data.length > 0) {
              return enrichHistoricalDataFast(data, dimensionCache);
            }
            
            return [];
          }
        } catch (err: any) {
          console.error(`❌ Erro ao buscar de ${tabela}:`, err);
          toast.error(`Erro ao buscar de ${tabela}: ${err?.message || 'Erro desconhecido'}`);
          return [];
        }
      });
      
      // Aguardar todas as queries
      const results = await Promise.all(promises);
      
      // Combinar todos os resultados
      results.forEach((registros, index) => {
        if (Array.isArray(registros)) {
          allRegistros.push(...registros);
          console.log(`📦 ${tabelas[index]}: ${registros.length} registros adicionados`);
        }
      });
      
      // Normalizar campo de data
      const normalizedRegistros = allRegistros.map((reg: any) => {
        const normalized = { ...reg };
        
        if (!normalized.data && normalized.data_ocorrencia) {
          normalized.data = normalized.data_ocorrencia;
        }
        
        return normalized;
      });
      
      // Ordenar por data (mais recente primeiro)
      normalizedRegistros.sort((a, b) => {
        const dateA = a.data ? new Date(a.data).getTime() : 0;
        const dateB = b.data ? new Date(b.data).getTime() : 0;
        return dateB - dateA;
      });
      
      setRegistros(normalizedRegistros);
      console.log(`✅ Total de registros carregados: ${normalizedRegistros.length}`);
      
      if (normalizedRegistros.length === 0) {
        console.warn('⚠️ Nenhum registro encontrado. Verifique:');
        console.warn('  1. Se as políticas RLS estão corretas');
        console.warn('  2. Se o usuário está autenticado');
        console.warn('  3. Se há dados nas tabelas');
        toast.warning('Nenhum registro encontrado. Verifique os filtros ou as políticas de acesso.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar registros:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função otimizada para enriquecer dados históricos usando cache
  const enrichHistoricalDataFast = (registros: any[], cache: typeof dimensionCache): Registro[] => {
    if (!registros || registros.length === 0 || !cache) return [];
    
    // Enriquecer cada registro usando cache
    return registros.map(reg => {
      const enriched: any = { ...reg };
      
      // Normalizar campo de data
      if (reg.data) {
        enriched.data = reg.data;
      } else if (reg.data_ocorrencia) {
        enriched.data = reg.data_ocorrencia;
      }
      
      // Para tabelas históricas, não temos IDs de dimensões, então criamos objetos básicos
      // Enriquecer espécie
      if (reg.especie_id) {
        enriched.especie = cache.especies.get(reg.especie_id) || null;
      } else if (reg.nome_cientifico) {
        // Tentar encontrar espécie pelo nome científico no cache
        const especie = Array.from(cache.especies.values()).find(
          e => e.nome_cientifico?.toLowerCase() === reg.nome_cientifico?.toLowerCase()
        );
        if (especie) {
          enriched.especie = especie;
        } else {
          // Criar objeto espécie básico se não encontrado
          enriched.especie = {
            id: null,
            nome_popular: reg.nome_popular || '',
            nome_cientifico: reg.nome_cientifico || '',
            classe_taxonomica: reg.classe_taxonomica || ''
          };
        }
      }
      
      // Para dados históricos, não temos essas dimensões, então criamos valores padrão
      enriched.regiao_administrativa = null;
      enriched.origem = { id: null, nome: 'Resgate de Fauna' };
      enriched.destinacao = null;
      enriched.estado_saude = null;
      enriched.estagio_vida = null;
      enriched.desfecho = null;
      
      // Mapear quantidade - tabelas históricas usam quantidade_resgates
      if (reg.quantidade_resgates !== undefined) {
        enriched.quantidade = Number(reg.quantidade_resgates) || 0;
        enriched.quantidade_total = Number(reg.quantidade_resgates) || 0;
        // Estimar quantidade_adulto e quantidade_filhote
        enriched.quantidade_adulto = Number(reg.quantidade_resgates) - (Number(reg.quantidade_filhotes) || 0);
        enriched.quantidade_filhote = Number(reg.quantidade_filhotes) || 0;
      } else if (!reg.quantidade) {
        enriched.quantidade = 0;
      }
      
      // Campos que não existem em tabelas históricas
      enriched.latitude_origem = null;
      enriched.longitude_origem = null;
      enriched.atropelamento = null;
      
      return enriched;
    });
  };
  
  const filteredRegistros = registros.filter(registro => {
    // Busca por texto
    const matchesSearch = searchTerm === '' || 
      registro.regiao_administrativa?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.especie?.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.especie?.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo
    const matchesTipo = filterTipo === 'all' || 
      registro.origem?.nome === filterTipo;
    
    // Filtro por estado de saúde
    const matchesEstado = filterEstado === 'all' || 
      registro.estado_saude?.nome === filterEstado;
    
    // Filtro por destinação
    const matchesDestinacao = filterDestinacao === 'all' || 
      registro.destinacao?.nome === filterDestinacao;
    
    // Filtro por classe taxonômica
    const matchesClasse = filterClasse === 'all' || 
      registro.especie?.classe_taxonomica === filterClasse;
    
    // Filtro por data específica
    const matchesData = !filterData || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return registroDate.toDateString() === filterData.toDateString();
    })();
    
    // Filtro por ano
    const matchesAno = filterAno === 'all' || (() => {
      if (!registro.data) return false;
      try {
        const registroDate = new Date(registro.data);
        if (isNaN(registroDate.getTime())) return false;
        const anoRegistro = registroDate.getFullYear();
        const anoFiltro = parseInt(filterAno);
        return anoRegistro === anoFiltro;
      } catch {
        return false;
      }
    })();
    
    // Filtro por mês
    const matchesMes = filterMes === 'all' || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return (registroDate.getMonth() + 1).toString() === filterMes;
    })();
    
    // Filtro por espécie
    const matchesEspecie = filterEspecie === 'all' || 
      registro.especie?.id === filterEspecie ||
      (registro as any).especie_id === filterEspecie;
    
    // Filtro por nome científico
    const matchesNomeCientifico = filterNomeCientifico === '' || 
      registro.especie?.nome_cientifico?.toLowerCase().includes(filterNomeCientifico.toLowerCase()) ||
      (registro as any).nome_cientifico?.toLowerCase().includes(filterNomeCientifico.toLowerCase());
    
    // Filtro por estágio de vida
    const matchesEstagio = filterEstagio === 'all' || 
      registro.estagio_vida?.id === filterEstagio ||
      (registro as any).estagio_vida_id === filterEstagio;
    
    // Filtro por quantidade
    const matchesQuantidade = (() => {
      const quantidade = Number(registro.quantidade) || 
                        Number(registro.quantidade_total) || 
                        Number((registro as any).quantidade_resgates) || 
                        0;
      
      const min = filterQuantidadeMin ? Number(filterQuantidadeMin) : 0;
      const max = filterQuantidadeMax ? Number(filterQuantidadeMax) : Infinity;
      
      return quantidade >= min && quantidade <= max;
    })();
    
    // Filtro por região
    const matchesRegiao = filterRegiao === 'all' || 
      registro.regiao_administrativa?.id === filterRegiao ||
      (registro as any).regiao_administrativa_id === filterRegiao;
    
    return matchesSearch && 
           matchesTipo && 
           matchesEstado && 
           matchesDestinacao && 
           matchesClasse &&
           matchesData &&
           matchesAno &&
           matchesMes &&
           matchesEspecie &&
           matchesNomeCientifico &&
           matchesEstagio &&
           matchesQuantidade &&
           matchesRegiao;
  });

  const handleViewDetails = (id: string) => {
    navigate(`/registro-detalhes/${id}`);
  };
  
  const handleEdit = (id: string) => {
    navigate(`/resgate-editar/${id}`);
  };
  
  const formatDateForExport = (dateString: string) => {
    try {
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date for export:', error, dateString);
      return dateString;
    }
  };
  
  const handleExportCSV = () => {
    const headers = [
      'Data', 'Região Administrativa', 'Tipo', 'Latitude', 'Longitude',
      'Classe Taxonômica', 'Nome Científico', 'Nome Popular',
      'Estado de Saúde', 'Atropelamento', 'Estágio de Vida', 'Quantidade',
      'Destinação'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => {
        const formattedDate = formatDateForExport(registro.data);
        
        return [
          formattedDate,
          `"${registro.regiao_administrativa?.nome || ''}"`,
          registro.origem?.nome || '',
          registro.latitude_origem,
          registro.longitude_origem,
          registro.especie?.classe_taxonomica || '',
          `"${registro.especie?.nome_cientifico || ''}"`,
          `"${registro.especie?.nome_popular || ''}"`,
          registro.estado_saude?.nome || '',
          registro.atropelamento,
          registro.estagio_vida?.nome || '',
          registro.quantidade,
          registro.destinacao?.nome || ''
        ].join(',');
      })
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_fauna_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Lista de Registros" showBackButton>
      <div className="space-y-4 sm:space-y-6 animate-fade-in w-full">
        <RegistrosActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExportCSV={handleExportCSV}
        />
        
        {showFilters && (
          <RegistrosFilters
            filterTipo={filterTipo}
            setFilterTipo={setFilterTipo}
            filterEstado={filterEstado}
            setFilterEstado={setFilterEstado}
            filterDestinacao={filterDestinacao}
            setFilterDestinacao={setFilterDestinacao}
            filterClasse={filterClasse}
            setFilterClasse={setFilterClasse}
            filterData={filterData}
            setFilterData={setFilterData}
            filterAno={filterAno}
            setFilterAno={setFilterAno}
            filterMes={filterMes}
            setFilterMes={setFilterMes}
            filterEspecie={filterEspecie}
            setFilterEspecie={setFilterEspecie}
            filterNomeCientifico={filterNomeCientifico}
            setFilterNomeCientifico={setFilterNomeCientifico}
            filterEstagio={filterEstagio}
            setFilterEstagio={setFilterEstagio}
            filterQuantidadeMin={filterQuantidadeMin}
            setFilterQuantidadeMin={setFilterQuantidadeMin}
            filterQuantidadeMax={filterQuantidadeMax}
            setFilterQuantidadeMax={setFilterQuantidadeMax}
            filterRegiao={filterRegiao}
            setFilterRegiao={setFilterRegiao}
          />
        )}
        
        <div className="border border-fauna-border rounded-lg shadow-sm overflow-hidden w-full">
          {isLoading ? (
            <RegistrosLoading />
          ) : (
            <RegistrosTable
              registros={filteredRegistros}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
        
        <RegistrosSummary 
          filteredCount={filteredRegistros.length} 
          totalCount={registros.length} 
        />
      </div>
      
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={registroToDelete?.nome || ''}
      />
    </Layout>
  );
};

export default Registros;
