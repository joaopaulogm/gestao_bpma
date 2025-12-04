
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type ResgateFormData } from '@/schemas/resgateSchema';
import { type Especie } from '@/services/especieService';
import { buscarIdPorNome } from '@/services/dimensionService';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useResgateSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const salvarRegistroNoBanco = async (data: ResgateFormData, especieSelecionada: Especie | null) => {
    if (!especieSelecionada) {
      setSubmissionError("É necessário selecionar uma espécie para continuar");
      toast.error("É necessário selecionar uma espécie para continuar");
      console.error("Espécie não selecionada");
      return false;
    }

    setSubmissionError(null);
    
    try {
      // Parse the date from DD/MM/YYYY format to Date object
      let dataObj: Date;
      
      // Check if data.data is in DD/MM/YYYY format
      if (data.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Parse from Brazilian date format DD/MM/YYYY
        dataObj = parse(data.data, 'dd/MM/yyyy', new Date(), { locale: ptBR });
      } else {
        // Fallback to direct Date parsing
        dataObj = new Date(data.data);
      }
      
      // Check if date is valid
      if (isNaN(dataObj.getTime())) {
        throw new Error('Data inválida');
      }
      
      // Format date as YYYY-MM-DD for PostgreSQL
      const dataFormatada = format(dataObj, 'yyyy-MM-dd');
      
      console.log('Saving date to database:', dataFormatada, 'Original value:', data.data);
      console.log('Quantidade adulto:', data.quantidadeAdulto, 'Quantidade filhote:', data.quantidadeFilhote, 'Quantidade total:', data.quantidade);
      
      // Find dimension IDs using the dimension service
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
      
      // Não precisamos calcular quantidade_total explicitamente
      // O trigger no banco de dados fará isso automaticamente
      const { error } = await supabase.from('fat_registros_de_resgate').insert({
        data: dataFormatada,
        especie_id: especieSelecionada.id,
        regiao_administrativa_id: regiaoId,
        origem_id: origemId,
        estado_saude_id: estadoSaudeId,
        estagio_vida_id: estagioVidaId,
        destinacao_id: destinacaoId,
        desfecho_id: desfechoId,
        tipo_area_id: data.tipoAreaId || null,
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
      });

      if (error) {
        setSubmissionError(`Erro ao salvar registro: ${error.message}`);
        console.error("Erro ao salvar registro:", error);
        toast.error("Erro ao salvar registro: " + error.message);
        return false;
      }

      setSubmissionError(null);
      console.log("Registro salvo com sucesso!");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setSubmissionError(`Erro ao salvar registro: ${errorMessage}`);
      console.error("Erro ao salvar registro:", error);
      toast.error(`Erro ao salvar registro no banco de dados: ${errorMessage}`);
      return false;
    }
  };

  return {
    isSubmitting,
    submissionError,
    setIsSubmitting,
    setSubmissionError,
    salvarRegistroNoBanco
  };
};
