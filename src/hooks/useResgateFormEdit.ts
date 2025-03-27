
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { Especie } from '@/services/especieService';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const useResgateFormEdit = (
  form: UseFormReturn<ResgateFormData>,
  editingId: string | null,
  buscarEspeciePorId: (id: string) => Promise<Especie | null>,
) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [originalRegistro, setOriginalRegistro] = useState<Registro | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [especieSelecionada, setEspecieSelecionada] = useState<Especie | null>(null);
  const [carregandoEspecie, setCarregandoEspecie] = useState<boolean>(false);
  
  // Function to fetch details about a specific species
  const onBuscarDetalhesEspecie = async (especieId: string) => {
    if (!especieId) {
      setEspecieSelecionada(null);
      return;
    }
    
    setCarregandoEspecie(true);
    
    try {
      const especie = await buscarEspeciePorId(especieId);
      setEspecieSelecionada(especie);
    } catch (error) {
      console.error('Erro ao buscar espécie:', error);
      toast.error('Não foi possível carregar os detalhes da espécie');
    } finally {
      setCarregandoEspecie(false);
    }
  };

  // Load the initial data if we're editing
  useEffect(() => {
    const fetchRegistro = async () => {
      if (!editingId) {
        setIsEditing(false);
        return;
      }
      
      setIsEditing(true);
      
      try {
        const { data, error } = await supabase
          .from('registros')
          .select('*')
          .eq('id', editingId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setFetchError('Registro não encontrado');
          return;
        }
        
        setOriginalRegistro(data);
        
        // Format date from YYYY-MM-DD to DD/MM/YYYY for the form
        const formattedDate = data.data ? format(new Date(data.data), 'dd/MM/yyyy') : '';
        
        // Look up the especie if available
        if (data.nome_cientifico) {
          const { data: especieData, error: especieError } = await supabase
            .from('especies_fauna')
            .select('*')
            .eq('nome_cientifico', data.nome_cientifico)
            .maybeSingle();
          
          if (!especieError && especieData) {
            setEspecieSelecionada(especieData);
            
            // Reset form with the data from registro and especie
            form.reset({
              data: formattedDate,
              regiaoAdministrativa: data.regiao_administrativa || '',
              origem: data.origem || '',
              latitudeOrigem: data.latitude_origem?.toString() || '',
              longitudeOrigem: data.longitude_origem?.toString() || '',
              desfechoResgate: data.desfecho_resgate || '',
              desfechoApreensao: data.desfecho_apreensao || '',
              numeroTCO: data.numero_tco || '',
              outroDesfecho: data.outro_desfecho || '',
              classeTaxonomica: data.classe_taxonomica || '',
              especieId: especieData.id || '',
              estadoSaude: data.estado_saude || '',
              atropelamento: data.atropelamento || '',
              estagioVida: data.estagio_vida || '',
              quantidade: data.quantidade || 0,
              quantidadeAdulto: data.quantidade_adulto || 0,
              quantidadeFilhote: data.quantidade_filhote || 0,
              destinacao: data.destinacao || '',
              numeroTermoEntrega: data.numero_termo_entrega || '',
              horaGuardaCEAPA: data.hora_guarda_ceapa || '',
              motivoEntregaCEAPA: data.motivo_entrega_ceapa || '',
              latitudeSoltura: data.latitude_soltura?.toString() || '',
              longitudeSoltura: data.longitude_soltura?.toString() || '',
              outroDestinacao: data.outro_destinacao || '',
            });
          } else {
            console.error('Erro ao buscar espécie:', especieError);
            
            // Reset form without an especie
            form.reset({
              data: formattedDate,
              regiaoAdministrativa: data.regiao_administrativa || '',
              origem: data.origem || '',
              latitudeOrigem: data.latitude_origem?.toString() || '',
              longitudeOrigem: data.longitude_origem?.toString() || '',
              desfechoResgate: data.desfecho_resgate || '',
              desfechoApreensao: data.desfecho_apreensao || '',
              numeroTCO: data.numero_tco || '',
              outroDesfecho: data.outro_desfecho || '',
              classeTaxonomica: data.classe_taxonomica || '',
              especieId: '',
              estadoSaude: data.estado_saude || '',
              atropelamento: data.atropelamento || '',
              estagioVida: data.estagio_vida || '',
              quantidade: data.quantidade || 0,
              quantidadeAdulto: data.quantidade_adulto || 0,
              quantidadeFilhote: data.quantidade_filhote || 0,
              destinacao: data.destinacao || '',
              numeroTermoEntrega: data.numero_termo_entrega || '',
              horaGuardaCEAPA: data.hora_guarda_ceapa || '',
              motivoEntregaCEAPA: data.motivo_entrega_ceapa || '',
              latitudeSoltura: data.latitude_soltura?.toString() || '',
              longitudeSoltura: data.longitude_soltura?.toString() || '',
              outroDestinacao: data.outro_destinacao || '',
            });
          }
        } else {
          // No especie data available, just reset the form with registro data
          form.reset({
            data: formattedDate,
            regiaoAdministrativa: data.regiao_administrativa || '',
            origem: data.origem || '',
            latitudeOrigem: data.latitude_origem?.toString() || '',
            longitudeOrigem: data.longitude_origem?.toString() || '',
            desfechoResgate: data.desfecho_resgate || '',
            desfechoApreensao: data.desfecho_apreensao || '',
            numeroTCO: data.numero_tco || '',
            outroDesfecho: data.outro_desfecho || '',
            classeTaxonomica: data.classe_taxonomica || '',
            especieId: '',
            estadoSaude: data.estado_saude || '',
            atropelamento: data.atropelamento || '',
            estagioVida: data.estagio_vida || '',
            quantidade: data.quantidade || 0,
            quantidadeAdulto: data.quantidade_adulto || 0,
            quantidadeFilhote: data.quantidade_filhote || 0,
            destinacao: data.destinacao || '',
            numeroTermoEntrega: data.numero_termo_entrega || '',
            horaGuardaCEAPA: data.hora_guarda_ceapa || '',
            motivoEntregaCEAPA: data.motivo_entrega_ceapa || '',
            latitudeSoltura: data.latitude_soltura?.toString() || '',
            longitudeSoltura: data.longitude_soltura?.toString() || '',
            outroDestinacao: data.outro_destinacao || '',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar registro para edição:', error);
        setFetchError('Erro ao carregar dados para edição');
      }
    };
    
    fetchRegistro();
  }, [editingId, form, buscarEspeciePorId]);
  
  return {
    isEditing,
    originalRegistro,
    fetchError,
    especieSelecionada,
    carregandoEspecie,
    onBuscarDetalhesEspecie
  };
};
