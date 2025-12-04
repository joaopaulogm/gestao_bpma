import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { Especie } from '@/services/especieService';
import { buscarIdPorNome } from '@/services/dimensionService';
import { parse, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useResgateFormSubmitEdit = (
  form: UseFormReturn<ResgateFormData>,
  handleSubmit: any // Using any here as we're just passing it through
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
      // Parse the date from DD/MM/YYYY format to Date object
      let dataObj: Date | null = null;
      let dataFormatada: string = '';
      
      console.log("Data original para atualização:", data.data);
      
      // Check if data.data is in DD/MM/YYYY format
      if (data.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Parse from Brazilian date format DD/MM/YYYY to a Date object
        dataObj = parse(data.data, 'dd/MM/yyyy', new Date(), { locale: ptBR });
        
        // Format back to YYYY-MM-DD for database
        if (isValid(dataObj)) {
          dataFormatada = format(dataObj, 'yyyy-MM-dd');
        } else {
          throw new Error('Data inválida após conversão');
        }
      } else if (data.data.includes('-')) {
        // Already in YYYY-MM-DD format, keep as is
        dataFormatada = data.data;
      } else {
        // Try to parse as is
        const date = new Date(data.data);
        if (isValid(date)) {
          dataFormatada = format(date, 'yyyy-MM-dd');
        } else {
          throw new Error('Formato de data não reconhecido');
        }
      }
      
      console.log('Atualizando com a data formatada:', dataFormatada, 'Original:', data.data);
      console.log('Quantidade adulto:', data.quantidadeAdulto, 'Quantidade filhote:', data.quantidadeFilhote, 'Quantidade total:', data.quantidade);
      
      // O trigger no banco de dados atualizará quantidade_total automaticamente
      // Find dimension IDs
      const [regiaoId, origemId, estadoSaudeId, estagioVidaId, destinacaoId, desfechoId] = await Promise.all([
        buscarIdPorNome('dim_regiao_administrativa', data.regiaoAdministrativa),
        buscarIdPorNome('dim_origem', data.origem),
        buscarIdPorNome('dim_estado_saude', data.estadoSaude),
        buscarIdPorNome('dim_estagio_vida', data.estagioVida),
        buscarIdPorNome('dim_destinacao', data.destinacao),
        data.desfechoApreensao 
          ? buscarIdPorNome('dim_desfecho', data.desfechoApreensao)
          : data.desfechoResgate 
            ? buscarIdPorNome('dim_desfecho', data.desfechoResgate)
            : Promise.resolve(null)
      ]);

      const { error } = await supabase
        .from('fat_registros_de_resgate')
        .update({
          data: dataFormatada,
          especie_id: especieSelecionada?.id || originalRegistro.especie_id,
          regiao_administrativa_id: regiaoId,
          origem_id: origemId,
          estado_saude_id: estadoSaudeId,
          estagio_vida_id: estagioVidaId,
          destinacao_id: destinacaoId,
          desfecho_id: desfechoId,
          latitude_origem: data.latitudeOrigem,
          longitude_origem: data.longitudeOrigem,
          numero_tco: data.numeroTCO || null,
          outro_desfecho: data.outroDesfecho || null,
          atropelamento: data.atropelamento,
          quantidade: data.quantidade,
          quantidade_adulto: data.quantidadeAdulto,
          quantidade_filhote: data.quantidadeFilhote,
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
