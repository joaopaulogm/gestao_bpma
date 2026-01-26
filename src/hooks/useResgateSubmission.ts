
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { type ResgateFormData } from '@/schemas/resgateSchema';
import { buscarIdPorNome } from '@/services/dimensionService';
import { buscarEspeciePorId } from '@/services/especieService';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EspecieItem } from '@/components/resgate/EspeciesMultiplasSection';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;

/**
 * Determina qual tabela usar baseado na data do registro
 * - A partir de 01/01/2026: fat_registros_de_resgate
 * - 2025: fat_resgates_diarios_2025
 * - 2024: fat_resgates_diarios_2024
 * - 2023: fat_resgates_diarios_2023
 * - 2022: fat_resgates_diarios_2022
 * - 2021: fat_resgates_diarios_2021
 * - 2020: fat_resgates_diarios_2020
 */
const getTabelaPorData = (dataFormatada: string): string => {
  const dataObj = new Date(dataFormatada);
  const ano = dataObj.getFullYear();
  const dataLimite2026 = new Date('2026-01-01');
  
  // A partir de 01/01/2026, usar fat_registros_de_resgate
  if (dataObj >= dataLimite2026) {
    return 'fat_registros_de_resgate';
  }
  
  // Para anos anteriores, usar a tabela específica do ano
  if (ano >= 2020 && ano <= 2025) {
    return `fat_resgates_diarios_${ano}`;
  }
  
  // Fallback: se o ano for muito antigo ou futuro, usar fat_registros_de_resgate
  return 'fat_registros_de_resgate';
};

/**
 * Verifica se a tabela é histórica (2020-2024)
 */
const isTabelaHistorica = (tabela: string): boolean => {
  return /^fat_resgates_diarios_202[0-4]$/.test(tabela);
};

/**
 * Prepara os dados para inserção baseado no tipo de tabela
 * Tabelas históricas (2020-2024) têm estrutura diferente
 */
const prepararDadosParaInsercao = async (
  tabela: string,
  dataFormatada: string,
  especie: EspecieItem,
  especieDetalhes: any,
  data: ResgateFormData,
  regiaoId: string | null,
  origemId: string | null,
  estadoSaudeId: string | null,
  estagioVidaId: string | null,
  destinacaoId: string | null,
  desfechoId: string | null
): Promise<any> => {
  // Se for tabela histórica (2020-2024), usar estrutura diferente
  if (isTabelaHistorica(tabela)) {
    const dataObj = new Date(dataFormatada);
    const mes = format(dataObj, 'MMMM', { locale: ptBR });
    
    // Mapear destinação para quantidade_solturas
    let quantidadeSolturas = 0;
    let quantidadeObitos = 0;
    let quantidadeFeridos = 0;
    
    if (destinacaoId) {
      // Buscar nome da destinação para determinar o tipo
      const { data: destinacaoData } = await supabase
        .from('dim_destinacao')
        .select('nome')
        .eq('id', destinacaoId)
        .single();
      
      if (destinacaoData?.nome === 'Soltura') {
        quantidadeSolturas = especie.quantidadeTotal || 0;
      } else if (destinacaoData?.nome === 'Óbito') {
        quantidadeObitos = especie.quantidadeTotal || 0;
      }
    }
    
    // Mapear estado de saúde para quantidade_feridos
    if (estadoSaudeId) {
      const { data: estadoSaudeData } = await supabase
        .from('dim_estado_saude')
        .select('nome')
        .eq('id', estadoSaudeId)
        .single();
      
      if (estadoSaudeData?.nome?.toLowerCase().includes('ferido')) {
        quantidadeFeridos = especie.quantidadeTotal || 0;
      }
    }
    
    return {
      data_ocorrencia: dataFormatada,
      nome_popular: especieDetalhes?.nome_popular || null,
      nome_cientifico: especieDetalhes?.nome_cientifico || null,
      classe_taxonomica: especieDetalhes?.classe_taxonomica || null,
      ordem_taxonomica: especieDetalhes?.ordem_taxonomica || null,
      tipo_de_fauna: especieDetalhes?.tipo_de_fauna || null,
      estado_de_conservacao: especieDetalhes?.estado_de_conservacao || null,
      quantidade_resgates: especie.quantidadeTotal || 0,
      quantidade_solturas: quantidadeSolturas,
      quantidade_obitos: quantidadeObitos,
      quantidade_feridos: quantidadeFeridos,
      quantidade_filhotes: especie.quantidadeFilhote || 0,
      mes: mes,
      especie_id: especie.especieId || null
    };
  }
  
  // Tabelas modernas (2025+ e fat_registros_de_resgate)
  return {
    data: dataFormatada,
    horario_acionamento: data.horarioAcionamento || null,
    horario_termino: data.horarioTermino || null,
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
    quantidade_adulto: especie.quantidadeAdulto || 0,
    quantidade_filhote: especie.quantidadeFilhote || 0,
    "quantidade Jovem": especie.quantidadeJovem || 0,
    quantidade_total: especie.quantidadeTotal || 0,
    numero_termo_entrega: especie.numeroTermoEntrega || null,
    hora_guarda_ceapa: especie.horaGuardaCEAPA || null,
    motivo_entrega_ceapa: especie.motivoEntregaCEAPA || null,
    latitude_soltura: especie.latitudeSoltura || null,
    longitude_soltura: especie.longitudeSoltura || null,
    outro_destinacao: especie.outroDestinacao || null
  };
};

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
          ? buscarIdPorNome('dim_desfecho_crime_ambientais', data.desfechoApreensao)
          : data.desfechoResgate 
            ? buscarIdPorNome('dim_desfecho_resgates', data.desfechoResgate)
            : Promise.resolve(null)
      ]);

      // Determinar qual tabela usar baseado na data
      const tabelaDestino = getTabelaPorData(dataFormatada);
      const isHistorica = isTabelaHistorica(tabelaDestino);
      console.log(`Usando tabela: ${tabelaDestino} para data: ${dataFormatada} (histórica: ${isHistorica})`);

      // Criar um registro para cada espécie
      const registrosInseridos: string[] = [];

      for (const especie of especies) {
        // Buscar detalhes da espécie se for tabela histórica
        let especieDetalhes: any = null;
        if (isHistorica && especie.especieId) {
          especieDetalhes = await buscarEspeciePorId(especie.especieId);
        }

        // Buscar IDs das dimensões específicas da espécie (incluindo destinação e desfecho)
        // Se a espécie tiver um desfechoResgate definido, usar esse; caso contrário, usar o do registro principal
        const especieDesfechoId = especie.desfechoResgate 
          ? await buscarIdPorNome('dim_desfecho_resgates', especie.desfechoResgate)
          : desfechoId;

        const [estadoSaudeId, estagioVidaId, destinacaoId] = await Promise.all([
          buscarIdPorNome('dim_estado_saude', especie.estadoSaude),
          buscarIdPorNome('dim_estagio_vida', especie.estagioVida),
          buscarIdPorNome('dim_destinacao', especie.destinacao)
        ]);

        // Preparar dados baseado no tipo de tabela
        const dadosInsercao = await prepararDadosParaInsercao(
          tabelaDestino,
          dataFormatada,
          especie,
          especieDetalhes,
          data,
          regiaoId,
          origemId,
          estadoSaudeId,
          estagioVidaId,
          destinacaoId,
          especieDesfechoId
        );

        const { data: insertedRecord, error } = await supabaseAny
          .from(tabelaDestino)
          .insert(dadosInsercao)
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


