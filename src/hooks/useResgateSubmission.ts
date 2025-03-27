
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type ResgateFormData } from '@/schemas/resgateSchema';
import { type Especie } from '@/services/especieService';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useResgateSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const salvarRegistroNoBanco = async (data: any, especieSelecionada: Especie | null) => {
    // If we're not provided an especie and this is not an "Evadido" case, check if we need it
    const isEvadido = data.desfechoResgate === "Evadido";
    if (!isEvadido && !especieSelecionada && data.classeTaxonomica && data.especieId) {
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
      
      // Prepare record data
      let recordData: any = {
        data: dataFormatada,
        regiao_administrativa: data.regiaoAdministrativa,
        origem: data.origem,
        latitude_origem: data.latitudeOrigem,
        longitude_origem: data.longitudeOrigem,
        desfecho_apreensao: data.desfechoApreensao || null,
        desfecho_resgate: data.desfechoResgate || null,
        numero_tco: data.numeroTCO || null,
        outro_desfecho: data.outroDesfecho || null,
        estado_saude: data.estadoSaude,
        atropelamento: data.atropelamento,
        estagio_vida: data.estagioVida,
        quantidade: data.quantidade,
        quantidade_adulto: data.quantidadeAdulto,
        quantidade_filhote: data.quantidadeFilhote,
        destinacao: data.destinacao,
        numero_termo_entrega: data.numeroTermoEntrega || null,
        hora_guarda_ceapa: data.horaGuardaCEAPA || null,
        motivo_entrega_ceapa: data.motivoEntregaCEAPA || null,
        latitude_soltura: data.latitudeSoltura || null,
        longitude_soltura: data.longitudeSoltura || null,
        outro_destinacao: data.outroDestinacao || null
      };
      
      // Add especie info if available
      if (especieSelecionada) {
        recordData.classe_taxonomica = especieSelecionada.classe_taxonomica;
        recordData.nome_cientifico = especieSelecionada.nome_cientifico;
        recordData.nome_popular = especieSelecionada.nome_popular;
      } else if (data.classeTaxonomica) {
        // If we have classe_taxonomica but no especie (could be "Evadido" case)
        recordData.classe_taxonomica = data.classeTaxonomica;
        recordData.nome_cientifico = data.nomeCientifico || "Não identificado";
        recordData.nome_popular = data.nomePopular || "Não identificado";
      }

      const { error } = await supabase.from('registros').insert(recordData);

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
