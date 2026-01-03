import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
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
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  
  useEffect(() => {
    fetchRegistros();
  }, []);
  
  const fetchRegistros = async () => {
    setIsLoading(true);
    try {
      const allRegistros: Registro[] = [];
      
      // Lista de todas as tabelas a serem consultadas
      const tabelas = [
        'fat_registros_de_resgate',
        'fat_resgates_diarios_2020',
        'fat_resgates_diarios_2021',
        'fat_resgates_diarios_2022',
        'fat_resgates_diarios_2023',
        'fat_resgates_diarios_2024',
        'fat_resgates_diarios_2025'
      ];
      
      // Buscar dados de todas as tabelas em paralelo
      const promises = tabelas.map(async (tabela) => {
        try {
          // Para fat_registros_de_resgate, usar joins
          if (tabela === 'fat_registros_de_resgate') {
            const { data, error } = await supabase
              .from(tabela)
              .select(`
                *,
                regiao_administrativa:dim_regiao_administrativa(nome),
                origem:dim_origem(nome),
                destinacao:dim_destinacao(nome),
                estado_saude:dim_estado_saude(nome),
                estagio_vida:dim_estagio_vida(nome),
                desfecho:dim_desfecho(nome, tipo),
                especie:dim_especies_fauna(*)
              `)
              .order('data', { ascending: false });
            
            if (error) {
              console.warn(`Erro ao buscar de ${tabela}:`, error);
              return [];
            }
            
            return data || [];
          } else {
            // Para tabelas fat_resgates_diarios_*, buscar sem joins primeiro
            // e depois enriquecer os dados manualmente
            // Tentar ordenar por 'data' primeiro (para 2025), se falhar, usar 'data_ocorrencia'
            let query = supabase.from(tabela).select('*');
            
            // Tentar ordenar por 'data' (2025 usa este campo)
            try {
              query = query.order('data', { ascending: false });
            } catch {
              // Se falhar, tentar 'data_ocorrencia' (2020-2024 usam este)
              query = query.order('data_ocorrencia', { ascending: false });
            }
            
            const { data, error } = await query;
            
            if (error) {
              // Se erro ao ordenar por 'data', tentar 'data_ocorrencia'
              if (error.message?.includes('data') || error.code === 'PGRST116') {
                const { data: dataRetry, error: errorRetry } = await supabase
                  .from(tabela)
                  .select('*')
                  .order('data_ocorrencia', { ascending: false });
                
                if (errorRetry) {
                  console.warn(`Erro ao buscar de ${tabela}:`, errorRetry);
                  return [];
                }
                
                // Enriquecer dados com relacionamentos
                if (dataRetry && dataRetry.length > 0) {
                  return await enrichHistoricalData(dataRetry);
                }
                return [];
              }
              
              console.warn(`Erro ao buscar de ${tabela}:`, error);
              return [];
            }
            
            // Enriquecer dados com relacionamentos
            if (data && data.length > 0) {
              return await enrichHistoricalData(data);
            }
            
            return [];
          }
        } catch (err) {
          console.warn(`Erro ao buscar de ${tabela}:`, err);
          return [];
        }
      });
      
      // Aguardar todas as queries
      const results = await Promise.all(promises);
      
      // Combinar todos os resultados
      results.forEach(registros => {
        if (Array.isArray(registros)) {
          allRegistros.push(...registros);
        }
      });
      
      // Normalizar campo de data (algumas tabelas usam 'data', outras 'data_ocorrencia')
      const normalizedRegistros = allRegistros.map(reg => {
        const normalized = { ...reg };
        
        // Se não tem 'data' mas tem 'data_ocorrencia', usar 'data_ocorrencia'
        if (!normalized.data && normalized.data_ocorrencia) {
          normalized.data = normalized.data_ocorrencia;
        }
        // Se não tem 'data_ocorrencia' mas tem 'data', manter 'data'
        else if (normalized.data && !normalized.data_ocorrencia) {
          // Já está correto, não precisa fazer nada
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
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para enriquecer dados históricos com relacionamentos
  const enrichHistoricalData = async (registros: any[]): Promise<Registro[]> => {
    if (!registros || registros.length === 0) return [];
    
    // Buscar todas as dimensões de uma vez
    const [regioesRes, origensRes, destinacoesRes, estadosSaudeRes, estagiosVidaRes, desfechosRes, especiesRes] = await Promise.all([
      supabase.from('dim_regiao_administrativa').select('id, nome'),
      supabase.from('dim_origem').select('id, nome'),
      supabase.from('dim_destinacao').select('id, nome'),
      supabase.from('dim_estado_saude').select('id, nome'),
      supabase.from('dim_estagio_vida').select('id, nome'),
      supabase.from('dim_desfecho').select('id, nome, tipo'),
      supabase.from('dim_especies_fauna').select('*')
    ]);
    
    const regioes = new Map((regioesRes.data || []).map(r => [r.id, r]));
    const origens = new Map((origensRes.data || []).map(r => [r.id, r]));
    const destinacoes = new Map((destinacoesRes.data || []).map(r => [r.id, r]));
    const estadosSaude = new Map((estadosSaudeRes.data || []).map(r => [r.id, r]));
    const estagiosVida = new Map((estagiosVidaRes.data || []).map(r => [r.id, r]));
    const desfechos = new Map((desfechosRes.data || []).map(r => [r.id, r]));
    const especies = new Map((especiesRes.data || []).map(e => [e.id, e]));
    
    // Enriquecer cada registro
    return registros.map(reg => {
      const enriched: any = { ...reg };
      
      // Normalizar campo de data (algumas tabelas usam 'data', outras 'data_ocorrencia')
      if (reg.data) {
        enriched.data = reg.data;
      } else if (reg.data_ocorrencia) {
        enriched.data = reg.data_ocorrencia;
      }
      
      // Enriquecer com relacionamentos se existirem IDs
      if (reg.regiao_administrativa_id) {
        enriched.regiao_administrativa = regioes.get(reg.regiao_administrativa_id) || null;
      }
      if (reg.origem_id) {
        enriched.origem = origens.get(reg.origem_id) || null;
      }
      if (reg.destinacao_id) {
        enriched.destinacao = destinacoes.get(reg.destinacao_id) || null;
      }
      if (reg.estado_saude_id) {
        enriched.estado_saude = estadosSaude.get(reg.estado_saude_id) || null;
      }
      if (reg.estagio_vida_id) {
        enriched.estagio_vida = estagiosVida.get(reg.estagio_vida_id) || null;
      }
      if (reg.desfecho_id) {
        enriched.desfecho = desfechos.get(reg.desfecho_id) || null;
      }
      if (reg.especie_id) {
        enriched.especie = especies.get(reg.especie_id) || null;
      } else if (reg.nome_cientifico) {
        // Tentar encontrar espécie pelo nome científico
        const especie = Array.from(especies.values()).find(
          e => e.nome_cientifico?.toLowerCase() === reg.nome_cientifico?.toLowerCase()
        );
        if (especie) {
          enriched.especie = especie;
        }
      }
      
      // Mapear quantidade se necessário
      if (reg.quantidade_resgates !== undefined && !reg.quantidade) {
        enriched.quantidade = reg.quantidade_resgates;
      }
      
      return enriched;
    });
  };
  
  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = searchTerm === '' || 
      registro.regiao_administrativa?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.especie?.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.especie?.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === 'all' || 
      registro.origem?.nome === filterTipo;
      
    const matchesEstado = filterEstado === 'all' || 
      registro.estado_saude?.nome === filterEstado;
      
    const matchesDestinacao = filterDestinacao === 'all' || 
      registro.destinacao?.nome === filterDestinacao;
      
    const matchesClasse = filterClasse === 'all' || 
      registro.especie?.classe_taxonomica === filterClasse;
    
    return matchesSearch && matchesTipo && matchesEstado && matchesDestinacao && matchesClasse;
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
