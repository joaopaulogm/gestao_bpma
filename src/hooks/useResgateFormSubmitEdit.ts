
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { Especie } from '@/services/especieService';

export const useResgateFormSubmitEdit = (
  form: UseFormReturn<ResgateFormData>,
  handleSubmit: (data: ResgateFormData) => Promise<void>
) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEditForm = async (
    data: ResgateFormData, 
    editingId: string,
    originalRegistro: Registro,
    especieSelecionada: Especie | null
  ) => {
    setIsSubmitting(true);
    
    try {
      const formatDateForDB = (dateString: string) => {
        try {
          const [year, month, day] = dateString.split('-').map(Number);
          const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return formattedDate;
        } catch (error) {
          console.error('Error formatting date for database:', error, dateString);
          throw new Error('Data inválida');
        }
      };
      
      const dataFormatada = formatDateForDB(data.data);
      console.log('Updating with date:', dataFormatada, 'Original value:', data.data);
      
      const { error } = await supabase
        .from('registros')
        .update({
          data: dataFormatada,
          classe_taxonomica: data.classeTaxonomica,
          nome_cientifico: especieSelecionada?.nome_cientifico || originalRegistro.nome_cientifico,
          nome_popular: especieSelecionada?.nome_popular || originalRegistro.nome_popular,
          regiao_administrativa: data.regiaoAdministrativa,
          origem: data.origem,
          latitude_origem: data.latitudeOrigem,
          longitude_origem: data.longitudeOrigem,
          desfecho_apreensao: data.desfechoApreensao || null,
          numero_tco: data.numeroTCO || null,
          outro_desfecho: data.outroDesfecho || null,
          estado_saude: data.estadoSaude,
          atropelamento: data.atropelamento,
          estagio_vida: data.estagioVida,
          quantidade: data.quantidade,
          destinacao: data.destinacao,
          numero_termo_entrega: data.numeroTermoEntrega || null,
          hora_guarda_ceapa: data.horaGuardaCEAPA || null,
          motivo_entrega_ceapa: data.motivoEntregaCEAPA || null,
          latitude_soltura: data.latitudeSoltura || null,
          longitude_soltura: data.longitudeSoltura || null,
          outro_destinacao: data.outroDestinacao || null
        })
        .eq('id', editingId);
      
      if (error) throw error;
      
      toast.success('Registro atualizado com sucesso!');
      navigate('/registros');
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast.error('Erro ao atualizar o registro');
      
      if (error instanceof Error) {
        form.setError('root', { 
          type: 'manual',
          message: `Erro ao atualizar: ${error.message}`
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (
    data: ResgateFormData, 
    isEditing: boolean, 
    editingId: string | null, 
    originalRegistro: Registro | null,
    especieSelecionada: Especie | null
  ) => {
    if (isEditing && editingId && originalRegistro) {
      await submitEditForm(data, editingId, originalRegistro, especieSelecionada);
    } else {
      await handleSubmit(data);
    }
  };

  return {
    handleFormSubmit,
    isSubmitting,
    setIsSubmitting
  };
};
