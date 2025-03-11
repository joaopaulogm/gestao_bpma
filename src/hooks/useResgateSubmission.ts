
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type ResgateFormData } from '@/schemas/resgateSchema';
import { type Especie } from '@/services/especieService';

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
      // Converter a data para formato ISO string para o banco de dados
      const dataFormatada = new Date(data.data);
      
      const { error } = await supabase.from('registros').insert({
        data: dataFormatada.toISOString(),
        classe_taxonomica: data.classeTaxonomica,
        nome_cientifico: especieSelecionada.nome_cientifico,
        nome_popular: especieSelecionada.nome_popular,
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
