
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, ArrowLeft } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { useRegistroDelete } from '@/hooks/useRegistroDelete';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;
import RegistroLoading from '@/components/registros/RegistroLoading';
import RegistroNotFound from '@/components/registros/RegistroNotFound';
import RegistroActionsBar from '@/components/registros/RegistroActionsBar';
import InformacoesGeraisCard from '@/components/registros/InformacoesGeraisCard';
import InformacoesEspecieCard from '@/components/registros/InformacoesEspecieCard';
import InformacoesDestinacaoCard from '@/components/registros/InformacoesDestinacaoCard';
import { Registro } from '@/types/hotspots';

const RegistroDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabelaOrigem, setTabelaOrigem] = useState<string>('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<{ id: string, nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRegistro = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Tentar buscar de todas as tabelas possíveis
        const tabelas = [
          'fat_registros_de_resgate',
          'fat_resgates_diarios_2025',
          'fat_resgates_diarios_2024',
          'fat_resgates_diarios_2023',
          'fat_resgates_diarios_2022',
          'fat_resgates_diarios_2021',
          'fat_resgates_diarios_2020'
        ];
        
        let registroEncontrado: any = null;
        let tabelaEncontrada = '';
        
        // Buscar em paralelo de todas as tabelas
        const promises = tabelas.map(async (tabela) => {
          try {
            // Para tabelas históricas, buscar sem joins
            if (tabela.startsWith('fat_resgates_diarios_202') && parseInt(tabela.slice(-4)) <= 2024) {
              const { data, error } = await supabaseAny
                .from(tabela)
                .select('*')
                .eq('id', id)
                .single();
              
              if (!error && data) {
                return { data, tabela };
              }
            } else {
              // Para tabelas atuais, buscar sem joins primeiro
              const { data, error } = await supabaseAny
                .from(tabela)
                .select('id, data, regiao_administrativa_id, origem_id, destinacao_id, estado_saude_id, estagio_vida_id, desfecho_id, especie_id, quantidade, quantidade_total, quantidade_adulto, quantidade_filhote, latitude_origem, longitude_origem, atropelamento, numero_tco, outro_desfecho, numero_termo_entrega, hora_guarda_ceapa, motivo_entrega_ceapa, latitude_soltura, longitude_soltura, outro_destinacao')
                .eq('id', id)
                .single();
              
              if (!error && data) {
                return { data, tabela };
              }
            }
          } catch (err) {
            // Ignorar erros e continuar buscando
            return null;
          }
          return null;
        });
        
        const results = await Promise.all(promises);
        const resultado = results.find(r => r !== null);
        
        if (resultado) {
          registroEncontrado = resultado.data;
          tabelaEncontrada = resultado.tabela;
          setTabelaOrigem(tabelaEncontrada);
        } else {
          throw new Error('Registro não encontrado em nenhuma tabela');
        }
        
        // Carregar dimensões para enriquecer dados
        const [regioesRes, origensRes, destinacoesRes, estadosSaudeRes, estagiosVidaRes, desfechosRes, especiesRes] = await Promise.all([
          supabase.from('dim_regiao_administrativa').select('id, nome'),
          supabase.from('dim_origem').select('id, nome'),
          supabase.from('dim_destinacao').select('id, nome'),
          supabase.from('dim_estado_saude').select('id, nome'),
          supabase.from('dim_estagio_vida').select('id, nome'),
          supabase.from('dim_desfecho_resgates').select('id, nome, tipo'),
          supabase.from('dim_especies_fauna').select('*')
        ]);
        
        const dimensionCache = {
          regioes: new Map((regioesRes.data || []).map(r => [r.id, r])),
          origens: new Map((origensRes.data || []).map(r => [r.id, r])),
          destinacoes: new Map((destinacoesRes.data || []).map(r => [r.id, r])),
          estadosSaude: new Map((estadosSaudeRes.data || []).map(r => [r.id, r])),
          estagiosVida: new Map((estagiosVidaRes.data || []).map(r => [r.id, r])),
          desfechos: new Map((desfechosRes.data || []).map(r => [r.id, r])),
          especies: new Map((especiesRes.data || []).map(e => [e.id, e]))
        };
        
        // Enriquecer dados
        const enriched: any = { ...registroEncontrado };
        
        // Normalizar data
        if (!enriched.data && enriched.data_ocorrencia) {
          enriched.data = enriched.data_ocorrencia;
        }
        
        // Enriquecer dimensões
        if (enriched.regiao_administrativa_id) {
          enriched.regiao_administrativa = dimensionCache.regioes.get(enriched.regiao_administrativa_id) || null;
        }
        if (enriched.origem_id) {
          enriched.origem = dimensionCache.origens.get(enriched.origem_id) || null;
        }
        if (enriched.destinacao_id) {
          enriched.destinacao = dimensionCache.destinacoes.get(enriched.destinacao_id) || null;
        }
        if (enriched.estado_saude_id) {
          enriched.estado_saude = dimensionCache.estadosSaude.get(enriched.estado_saude_id) || null;
        }
        if (enriched.estagio_vida_id) {
          enriched.estagio_vida = dimensionCache.estagiosVida.get(enriched.estagio_vida_id) || null;
        }
        if (enriched.desfecho_id) {
          enriched.desfecho = dimensionCache.desfechos.get(enriched.desfecho_id) || null;
        }
        if (enriched.especie_id) {
          enriched.especie = dimensionCache.especies.get(enriched.especie_id) || null;
        } else if (enriched.nome_cientifico) {
          // Para dados históricos
          const especie = Array.from(dimensionCache.especies.values()).find(
            e => e.nome_cientifico?.toLowerCase() === enriched.nome_cientifico?.toLowerCase()
          );
          if (especie) {
            enriched.especie = especie;
          } else {
            enriched.especie = {
              id: null,
              nome_popular: enriched.nome_popular || '',
              nome_cientifico: enriched.nome_cientifico || '',
              classe_taxonomica: enriched.classe_taxonomica || ''
            };
          }
        }
        
        // Mapear quantidade
        if (enriched.quantidade_resgates !== undefined) {
          enriched.quantidade = Number(enriched.quantidade_resgates) || 0;
          enriched.quantidade_total = Number(enriched.quantidade_resgates) || 0;
        } else if (!enriched.quantidade) {
          enriched.quantidade = (enriched.quantidade_adulto || 0) + (enriched.quantidade_filhote || 0);
        }
        
        setRegistro(enriched as Registro);
      } catch (error) {
        console.error('Erro ao buscar detalhes do registro:', error);
        toast.error('Erro ao carregar os detalhes do registro');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistro();
  }, [id]);

  const formatDateTime = (dateString: string) => {
    try {
      // If already in DD/MM/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // If date is in ISO format (with T)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      // If date is in YYYY-MM-DD format
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          // Ensure we're parsing in the correct format
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
      // Generic fallback
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };
  
  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  const handleEdit = () => {
    if (registro?.id) {
      navigate(`/resgate-editar/${registro.id}`);
    }
  };

  const handleDuplicate = async () => {
    if (!registro) return;
    
    try {
      // Determinar qual tabela usar baseado na data
      const dataRegistro = registro.data || registro.data_ocorrencia;
      if (!dataRegistro) {
        toast.error('Data do registro não encontrada');
        return;
      }
      
      const ano = new Date(dataRegistro).getFullYear();
      let tabelaDestino = 'fat_registros_de_resgate';
      
      if (ano >= 2020 && ano <= 2024) {
        tabelaDestino = `fat_resgates_diarios_${ano}`;
      } else if (ano >= 2025) {
        tabelaDestino = 'fat_registros_de_resgate';
      }
      
      // Preparar dados para duplicação
      const dadosDuplicacao: any = {
        data: registro.data || registro.data_ocorrencia,
        regiao_administrativa_id: registro.regiao_administrativa_id,
        origem_id: registro.origem_id,
        destinacao_id: registro.destinacao_id,
        estado_saude_id: registro.estado_saude_id,
        estagio_vida_id: registro.estagio_vida_id,
        desfecho_id: registro.desfecho_id,
        especie_id: registro.especie_id,
        quantidade: registro.quantidade || 0,
        quantidade_total: registro.quantidade_total || registro.quantidade || 0,
        quantidade_adulto: registro.quantidade_adulto || 0,
        quantidade_filhote: registro.quantidade_filhote || 0,
        latitude_origem: registro.latitude_origem,
        longitude_origem: registro.longitude_origem,
        atropelamento: registro.atropelamento,
      };
      
      // Para tabelas históricas, usar campos diferentes
      if (ano >= 2020 && ano <= 2024) {
        dadosDuplicacao.data_ocorrencia = registro.data || registro.data_ocorrencia;
        dadosDuplicacao.nome_popular = registro.especie?.nome_popular || '';
        dadosDuplicacao.nome_cientifico = registro.especie?.nome_cientifico || '';
        dadosDuplicacao.classe_taxonomica = registro.especie?.classe_taxonomica || '';
        dadosDuplicacao.quantidade_resgates = registro.quantidade || 0;
        delete dadosDuplicacao.data;
        delete dadosDuplicacao.regiao_administrativa_id;
        delete dadosDuplicacao.origem_id;
        delete dadosDuplicacao.destinacao_id;
        delete dadosDuplicacao.estado_saude_id;
        delete dadosDuplicacao.estagio_vida_id;
        delete dadosDuplicacao.desfecho_id;
        delete dadosDuplicacao.quantidade;
        delete dadosDuplicacao.quantidade_total;
        delete dadosDuplicacao.quantidade_adulto;
        delete dadosDuplicacao.quantidade_filhote;
        delete dadosDuplicacao.latitude_origem;
        delete dadosDuplicacao.longitude_origem;
        delete dadosDuplicacao.atropelamento;
      }
      
      const { data: novoRegistro, error } = await supabaseAny
        .from(tabelaDestino)
        .insert(dadosDuplicacao)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao duplicar registro:', error);
        toast.error(`Erro ao duplicar registro: ${error.message}`);
        return;
      }
      
      toast.success('Registro duplicado com sucesso!');
      navigate(`/registro-detalhes/${novoRegistro.id}`);
    } catch (error: any) {
      console.error('Erro ao duplicar registro:', error);
      toast.error(`Erro ao duplicar registro: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = () => {
    if (registro?.id && registro?.especie?.nome_popular) {
      setRegistroToDelete({ id: registro.id, nome: registro.especie.nome_popular });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setRegistroToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;
    
    setIsDeleting(true);
    try {
      // Se tiver tabelaOrigem, usar ela, senão tentar todas
      if (tabelaOrigem) {
        const { error } = await supabaseAny
          .from(tabelaOrigem)
          .delete()
          .eq('id', registroToDelete.id);
        
        if (error) throw error;
      } else {
        // Tentar excluir de todas as tabelas possíveis
        const tabelas = [
          'fat_registros_de_resgate',
          'fat_resgates_diarios_2025',
          'fat_resgates_diarios_2024',
          'fat_resgates_diarios_2023',
          'fat_resgates_diarios_2022',
          'fat_resgates_diarios_2021',
          'fat_resgates_diarios_2020'
        ];
        
        let excluido = false;
        for (const tabela of tabelas) {
          try {
            const { error } = await supabaseAny
              .from(tabela)
              .delete()
              .eq('id', registroToDelete.id);
            
            if (!error) {
              excluido = true;
              break;
            }
          } catch (err) {
            continue;
          }
        }
        
        if (!excluido) {
          throw new Error('Registro não encontrado em nenhuma tabela');
        }
      }
      
      toast.success(`Registro de "${registroToDelete.nome}" excluído com sucesso`);
      navigate('/secao-operacional/registros');
    } catch (error: any) {
      console.error('Erro ao excluir registro:', error);
      toast.error(`Erro ao excluir o registro: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setRegistroToDelete(null);
    }
  };

  if (isLoading) {
    return <RegistroLoading />;
  }

  if (!registro) {
    return <RegistroNotFound />;
  }

  return (
    <Layout title={`Detalhes do Registro: ${registro.especie?.nome_popular || 'Registro'}`} showBackButton>
      <div className="w-[75%] mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/secao-operacional/registros')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <InformacoesGeraisCard 
          data={registro.data}
          regiao_administrativa={registro.regiao_administrativa?.nome || ''}
          origem={registro.origem?.nome || ''}
          latitude_origem={registro.latitude_origem}
          longitude_origem={registro.longitude_origem}
          desfecho_apreensao={registro.desfecho?.tipo === 'apreensao' ? registro.desfecho?.nome : ''}
          numero_tco={registro.numero_tco}
          outro_desfecho={registro.outro_desfecho}
          formatDateTime={formatDateTime}
        />

        <InformacoesEspecieCard 
          classe_taxonomica={registro.especie?.classe_taxonomica || ''}
          nome_cientifico={registro.especie?.nome_cientifico || ''}
          nome_popular={registro.especie?.nome_popular || ''}
          estado_saude={registro.estado_saude?.nome || ''}
          atropelamento={registro.atropelamento}
          estagio_vida={registro.estagio_vida?.nome || ''}
          quantidade={registro.quantidade || 0}
          quantidade_adulto={registro.quantidade_adulto || 0}
          quantidade_filhote={registro.quantidade_filhote || 0}
        />

        <InformacoesDestinacaoCard 
          destinacao={registro.destinacao?.nome || ''}
          numero_termo_entrega={registro.numero_termo_entrega}
          hora_guarda_ceapa={registro.hora_guarda_ceapa}
          motivo_entrega_ceapa={registro.motivo_entrega_ceapa}
          latitude_soltura={registro.latitude_soltura}
          longitude_soltura={registro.longitude_soltura}
          outro_destinacao={registro.outro_destinacao}
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

export default RegistroDetalhes;
