
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { buscarEspeciePorNomeCientifico } from '@/services/especieService';

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
      const registroFromState = location.state?.registro as Registro | undefined;
      
      if (registroFromState) {
        setOriginalRegistro(registroFromState);
        populateFormWithRegistro(registroFromState);
        setIsEditing(true);
      } else {
        fetchRegistro(editingId);
      }
    }
  }, [editingId, location.state]);
  
  const fetchRegistro = async (id: string) => {
    try {
      setFetchError(null);
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setOriginalRegistro(data);
        populateFormWithRegistro(data);
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
    const formatDateForForm = (dateString: string) => {
      try {
        if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date for form:', error, dateString);
        return dateString;
      }
    };
    
    form.reset({
      regiaoAdministrativa: registro.regiao_administrativa,
      data: formatDateForForm(registro.data),
      origem: registro.origem,
      latitudeOrigem: registro.latitude_origem,
      longitudeOrigem: registro.longitude_origem,
      desfechoApreensao: registro.desfecho_apreensao || '',
      numeroTCO: registro.numero_tco || '',
      outroDesfecho: registro.outro_desfecho || '',
      classeTaxonomica: registro.classe_taxonomica,
      especieId: '',
      estadoSaude: registro.estado_saude,
      atropelamento: registro.atropelamento,
      estagioVida: registro.estagio_vida,
      quantidade: registro.quantidade,
      destinacao: registro.destinacao,
      numeroTermoEntrega: registro.numero_termo_entrega || '',
      horaGuardaCEAPA: registro.hora_guarda_ceapa || '',
      motivoEntregaCEAPA: registro.motivo_entrega_ceapa || '',
      latitudeSoltura: registro.latitude_soltura || '',
      longitudeSoltura: registro.longitude_soltura || '',
      outroDestinacao: registro.outro_destinacao || ''
    });
    
    fetchEspecieByNomeCientifico(registro.nome_cientifico);
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
