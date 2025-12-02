import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { buscarEspeciePorNomeCientifico } from '@/services/especieService';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useResgateFormEdit = (
  form: UseFormReturn<ResgateFormData>,
  editingId: string | null,
  buscarDetalhesEspecie: (especieId: string) => Promise<void>
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [originalRegistro, setOriginalRegistro] = useState<Registro | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    if (editingId) {
      // Check for registro in location state
      const registroFromState = location.state?.registro as Registro | undefined;
      
      if (registroFromState) {
        console.log("Registro encontrado no estado da navegação:", registroFromState);
        console.log("Classe taxonômica do registro:", registroFromState.especie?.classe_taxonomica);
        
        // Ensure the quantidade and other properties are properly set
        const processedRegistro: Registro = {
          ...registroFromState,
          quantidade_adulto: registroFromState.quantidade_adulto || 0,
          quantidade_filhote: registroFromState.quantidade_filhote || 0,
          quantidade: (registroFromState.quantidade_adulto || 0) + (registroFromState.quantidade_filhote || 0)
        };
        
        setOriginalRegistro(processedRegistro);
        populateFormWithRegistro(processedRegistro);
        setIsEditing(true);
      } else {
        console.log("Registro não encontrado no estado, buscando do banco...");
        fetchRegistro(editingId);
      }
    }
  }, [editingId, location.state]);
  
  const fetchRegistro = async (id: string) => {
    try {
      setFetchError(null);
      const { data, error } = await supabase
        .from('registros')
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
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log("Registro obtido do banco:", data);
        console.log("Classe taxonômica do registro:", data.especie?.classe_taxonomica);
        console.log("Data original do registro:", data.data);
        
        // Ensure the quantidade and other properties are properly set
        const processedRegistro: Registro = {
          ...data,
          quantidade_adulto: data.quantidade_adulto || 0,
          quantidade_filhote: data.quantidade_filhote || 0,
          quantidade: (data.quantidade_adulto || 0) + (data.quantidade_filhote || 0)
        };
        
        setOriginalRegistro(processedRegistro);
        populateFormWithRegistro(processedRegistro);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Erro ao buscar registro para edição:', error);
      setFetchError('Não foi possível carregar o registro para edição');
      toast.error('Erro ao carregar os dados do registro');
      
      setTimeout(() => {
        navigate('/registros');
      }, 2000);
    }
  };

  const populateFormWithRegistro = async (registro: Registro) => {
    // Preserve the original date format from the database without altering it
    // We'll just convert it to DD/MM/YYYY for display
    console.log("Data do registro antes da formatação:", registro.data);
    
    let formattedDate = registro.data;
    
    // Only format if not already in DD/MM/YYYY
    if (!registro.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      try {
        if (registro.data.includes('-')) {
          // Handle YYYY-MM-DD format
          const [year, month, day] = registro.data.split('-');
          formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        } else if (registro.data.includes('T')) {
          // Handle ISO format
          const date = new Date(registro.data);
          formattedDate = format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      } catch (error) {
        console.error('Error formatting date for display:', error);
        // Keep original as fallback
        formattedDate = registro.data;
      }
    }
    
    console.log("Data formatada para exibição:", formattedDate);
    
    // Ensure quantidades are numbers, not null
    const quantidadeAdulto = registro.quantidade_adulto || 0;
    const quantidadeFilhote = registro.quantidade_filhote || 0;
    const quantidade = (registro.quantidade !== undefined) ? registro.quantidade : (quantidadeAdulto + quantidadeFilhote);
    
    form.reset({
      data: formattedDate,
      regiaoAdministrativa: registro.regiao_administrativa?.nome || '',
      origem: registro.origem?.nome || '',
      desfechoResgate: (registro.desfecho?.tipo === 'resgate' ? registro.desfecho?.nome : '') || '',
      latitudeOrigem: registro.latitude_origem,
      longitudeOrigem: registro.longitude_origem,
      desfechoApreensao: (registro.desfecho?.tipo === 'apreensao' ? registro.desfecho?.nome : '') || '',
      numeroTCO: registro.numero_tco || '',
      outroDesfecho: registro.outro_desfecho || '',
      classeTaxonomica: registro.especie?.classe_taxonomica || '',
      especieId: '',
      estadoSaude: registro.estado_saude?.nome || '',
      atropelamento: registro.atropelamento,
      estagioVida: registro.estagio_vida?.nome || '',
      quantidade,
      quantidadeAdulto,
      quantidadeFilhote,
      destinacao: registro.destinacao?.nome || '',
      numeroTermoEntrega: registro.numero_termo_entrega || '',
      horaGuardaCEAPA: registro.hora_guarda_ceapa || '',
      motivoEntregaCEAPA: registro.motivo_entrega_ceapa || '',
      latitudeSoltura: registro.latitude_soltura || '',
      longitudeSoltura: registro.longitude_soltura || '',
      outroDestinacao: registro.outro_destinacao || ''
    });
    
    // Log the form values after setting them
    console.log("Valores do formulário após reset:", form.getValues());
    
    if (registro.especie?.nome_cientifico) {
      fetchEspecieByNomeCientifico(registro.especie.nome_cientifico);
    }
  };
  
  const fetchEspecieByNomeCientifico = async (nomeCientifico: string) => {
    try {
      const especie = await buscarEspeciePorNomeCientifico(nomeCientifico);
      
      if (especie) {
        form.setValue('especieId', especie.id);
        await buscarDetalhesEspecie(especie.id);
      } else {
        console.warn(`Espécie com nome científico "${nomeCientifico}" não encontrada`);
        toast.warning("Espécie do registro original não encontrada no cadastro");
      }
    } catch (error) {
      console.error("Erro ao buscar ID da espécie:", error);
      toast.error("Erro ao carregar dados da espécie");
    }
  };

  return {
    isEditing,
    originalRegistro,
    fetchError,
    setFetchError
  };
};
