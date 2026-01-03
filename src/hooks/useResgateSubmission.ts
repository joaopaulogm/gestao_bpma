
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type ResgateFormData } from '@/schemas/resgateSchema';
import { buscarIdPorNome } from '@/services/dimensionService';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EspecieItem } from '@/components/resgate/EspeciesMultiplasSection';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;

export interface MembroEquipeSubmit {
  efetivo_id: string;
}

export const useResgateSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const salvarRegistroNoBanco = async (
    data: ResgateFormData, 
    especies: EspecieItem[],
    membrosEquipe?: MembroEquipeSubmit[]
  ) => {
    // Validar que tem pelo menos uma espécie (a menos que seja evadido)
    const isEvadido = data.desfechoResgate === "Evadido";
    if (!isEvadido && especies.length === 0) {
      setSubmissionError("É necessário adicionar pelo menos uma espécie");
      toast.error("É necessário adicionar pelo menos uma espécie");
      return false;
    }

    setSubmissionError(null);
    
    try {
      // Parse the date from DD/MM/YYYY format to Date object
      let dataObj: Date;
      
      if (data.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        dataObj = parse(data.data, 'dd/MM/yyyy', new Date(), { locale: ptBR });
      } else {
        dataObj = new Date(data.data);
      }
      
      if (isNaN(dataObj.getTime())) {
        throw new Error('Data inválida');
      }
      
      const dataFormatada = format(dataObj, 'yyyy-MM-dd');
      
      console.log('Saving date to database:', dataFormatada);
      console.log('Espécies a salvar:', especies.length);
      
      // Find dimension IDs (apenas os que não são por espécie)
      const [regiaoId, origemId, desfechoId] = await Promise.all([
        buscarIdPorNome('dim_regiao_administrativa', data.regiaoAdministrativa),
        buscarIdPorNome('dim_origem', data.origem),
        data.desfechoApreensao 
          ? buscarIdPorNome('dim_desfecho', data.desfechoApreensao)
          : data.desfechoResgate 
            ? buscarIdPorNome('dim_desfecho', data.desfechoResgate)
            : Promise.resolve(null)
      ]);

      // Criar um registro para cada espécie
      const registrosInseridos: string[] = [];

      for (const especie of especies) {
        // Buscar IDs das dimensões específicas da espécie (incluindo destinação)
        const [estadoSaudeId, estagioVidaId, destinacaoId] = await Promise.all([
          buscarIdPorNome('dim_estado_saude', especie.estadoSaude),
          buscarIdPorNome('dim_estagio_vida', especie.estagioVida),
          buscarIdPorNome('dim_destinacao', especie.destinacao)
        ]);

        const { data: insertedRecord, error } = await supabaseAny
          .from('fat_resgates_diarios_2025')
          .insert({
            data: dataFormatada,
            especie_id: especie.especieId || null,
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
            atropelamento: especie.atropelamento,
            quantidade: especie.quantidadeTotal,
            quantidade_adulto: especie.quantidadeAdulto,
            quantidade_filhote: especie.quantidadeFilhote,
            numero_termo_entrega: especie.numeroTermoEntrega || null,
            hora_guarda_ceapa: especie.horaGuardaCEAPA || null,
            motivo_entrega_ceapa: especie.motivoEntregaCEAPA || null,
            latitude_soltura: especie.latitudeSoltura || null,
            longitude_soltura: especie.longitudeSoltura || null,
            outro_destinacao: especie.outroDestinacao || null
          })
          .select('id')
          .single();

        if (error) {
          console.error("Erro ao salvar registro:", error);
          toast.error("Erro ao salvar registro: " + error.message);
          continue;
        }

        if (insertedRecord) {
          registrosInseridos.push(insertedRecord.id);

          // Salvar membros da equipe para cada registro
          if (membrosEquipe && membrosEquipe.length > 0) {
            const equipeRecords = membrosEquipe.map(m => ({
              registro_id: insertedRecord.id,
              efetivo_id: m.efetivo_id
            }));

            const { error: equipeError } = await supabase
              .from('fat_equipe_resgate')
              .insert(equipeRecords);

            if (equipeError) {
              console.error("Erro ao salvar equipe:", equipeError);
            }
          }
        }
      }

      if (registrosInseridos.length === 0) {
        setSubmissionError("Nenhum registro foi salvo");
        toast.error("Nenhum registro foi salvo");
        return false;
      }

      console.log(`${registrosInseridos.length} registro(s) salvo(s) com sucesso!`);
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


