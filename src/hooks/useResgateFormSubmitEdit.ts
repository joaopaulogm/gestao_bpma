import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UseFormReturn, SubmitHandler } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Registro } from '@/types/hotspots';
import { Especie, buscarEspeciePorId } from '@/services/especieService';
import { buscarIdPorNome } from '@/services/dimensionService';
import { parse, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
 * Prepara os dados para atualização baseado no tipo de tabela
 * Tabelas históricas (2020-2024) têm estrutura diferente
 */
const prepararDadosParaAtualizacao = async (
  tabela: string,
  dataFormatada: string,
  especieSelecionada: Especie | null,
  originalRegistro: Registro,
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
        quantidadeSolturas = data.quantidade || 0;
      } else if (destinacaoData?.nome === 'Óbito') {
        quantidadeObitos = data.quantidade || 0;
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
        quantidadeFeridos = data.quantidade || 0;
      }
    }
    
    return {
      data_ocorrencia: dataFormatada,
      nome_popular: especieSelecionada?.nome_popular || null,
      nome_cientifico: especieSelecionada?.nome_cientifico || null,
      classe_taxonomica: especieSelecionada?.classe_taxonomica || null,
      ordem_taxonomica: especieSelecionada?.ordem_taxonomica || null,
      tipo_de_fauna: especieSelecionada?.tipo_de_fauna || null,
      estado_de_conservacao: especieSelecionada?.estado_de_conservacao || null,
      quantidade_resgates: data.quantidade || 0,
      quantidade_solturas: quantidadeSolturas,
      quantidade_obitos: quantidadeObitos,
      quantidade_feridos: quantidadeFeridos,
      quantidade_filhotes: data.quantidadeFilhote || 0,
      mes: mes,
      especie_id: especieSelecionada?.id || originalRegistro.especie_id
    };
  }
  
  // Tabelas modernas (2025+ e fat_registros_de_resgate)
  return {
    data: dataFormatada,
    especie_id: especieSelecionada?.id || originalRegistro.especie_id,
    regiao_administrativa_id: regiaoId,
    origem_id: origemId,
    estado_saude_id: estadoSaudeId,
    estagio_vida_id: estagioVidaId,
    destinacao_id: destinacaoId,
    desfecho_id: desfechoId,
    tipo_area_id: data.tipoAreaId || null,
    latitude_origem: data.latitudeOrigem,
    longitude_origem: data.longitudeOrigem,
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
  };
};

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
      
      // Determinar qual tabela usar baseado na data
      const tabelaDestino = getTabelaPorData(dataFormatada);
      const isHistorica = isTabelaHistorica(tabelaDestino);
      
      // Determinar tabela original baseado na data original do registro
      const dataOriginalFormatada = originalRegistro.data.includes('/') 
        ? format(parse(originalRegistro.data, 'dd/MM/yyyy', new Date(), { locale: ptBR }), 'yyyy-MM-dd')
        : originalRegistro.data.split('T')[0];
      const tabelaOrigem = getTabelaPorData(dataOriginalFormatada);
      
      console.log(`Tabela origem: ${tabelaOrigem}, Tabela destino: ${tabelaDestino}`);
      
      // O trigger no banco de dados atualizará quantidade_total automaticamente
      // Find dimension IDs
      const [regiaoId, origemId, estadoSaudeId, estagioVidaId, destinacaoId, desfechoId] = await Promise.all([
        buscarIdPorNome('dim_regiao_administrativa', data.regiaoAdministrativa),
        buscarIdPorNome('dim_origem', data.origem),
        buscarIdPorNome('dim_estado_saude', data.estadoSaude),
        buscarIdPorNome('dim_estagio_vida', data.estagioVida),
        buscarIdPorNome('dim_destinacao', data.destinacao),
        data.desfechoApreensao 
          ? buscarIdPorNome('dim_desfecho_crime_ambientais', data.desfechoApreensao)
          : data.desfechoResgate 
            ? buscarIdPorNome('dim_desfecho_resgates', data.desfechoResgate)
            : Promise.resolve(null)
      ]);

      // Preparar dados baseado no tipo de tabela
      const dadosAtualizacao = await prepararDadosParaAtualizacao(
        tabelaDestino,
        dataFormatada,
        especieSelecionada,
        originalRegistro,
        data,
        regiaoId,
        origemId,
        estadoSaudeId,
        estagioVidaId,
        destinacaoId,
        desfechoId
      );

      // Se a tabela mudou, mover o registro (deletar do antigo e inserir no novo)
      if (tabelaOrigem !== tabelaDestino) {
        console.log(`Movendo registro da tabela ${tabelaOrigem} para ${tabelaDestino}`);
        
        // Buscar membros da equipe antes de deletar
        const { data: equipeData } = await supabase
          .from('fat_equipe_resgate')
          .select('efetivo_id')
          .eq('registro_id', editingId);
        
        // Deletar da tabela original
        const { error: deleteError } = await supabaseAny
          .from(tabelaOrigem)
          .delete()
          .eq('id', editingId);
        
        if (deleteError) {
          throw new Error(`Erro ao remover registro da tabela original: ${deleteError.message}`);
        }
        
        // Deletar referências antigas da equipe
        if (equipeData && equipeData.length > 0) {
          await supabase
            .from('fat_equipe_resgate')
            .delete()
            .eq('registro_id', editingId);
        }
        
        // Inserir na nova tabela
        const { data: insertedRecord, error: insertError } = await supabaseAny
          .from(tabelaDestino)
          .insert(dadosAtualizacao)
          .select('id')
          .single();
        
        if (insertError) {
          throw new Error(`Erro ao inserir registro na nova tabela: ${insertError.message}`);
        }
        
        // Inserir referências da equipe na nova tabela se houver
        if (equipeData && equipeData.length > 0 && insertedRecord) {
          const equipeRecords = equipeData.map(e => ({
            registro_id: insertedRecord.id,
            efetivo_id: e.efetivo_id
          }));
          
          const { error: equipeError } = await supabase
            .from('fat_equipe_resgate')
            .insert(equipeRecords);
          
          if (equipeError) {
            console.warn('Erro ao atualizar equipe após mover registro:', equipeError);
            toast.warning('Registro movido, mas houve erro ao atualizar a equipe');
          }
        }
        
        toast.success('Registro atualizado e movido para a tabela correta!');
      } else {
        // Atualizar na mesma tabela
        const { error } = await supabaseAny
          .from(tabelaDestino)
          .update(dadosAtualizacao)
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast.success('Registro atualizado com sucesso!');
      }
      
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
