// Hook para gerenciamento do formulário de crimes ambientais
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crimesAmbientaisSchema, CrimesAmbientaisFormData } from '@/schemas/crimesAmbientaisSchema';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { buscarIdPorNome } from '@/services/dimensionService';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces locais para evitar import circular
interface FloraItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classe: string;
  ordem: string;
  familia: string;
  estadoConservacao: string;
  tipoPlanta: string;
  madeiraLei: string;
  imuneCote: string;
  condicao: string;
  quantidade: number;
  destinacao: string;
}

interface FaunaItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classeTaxonomica: string;
  ordemTaxonomica: string;
  tipoFauna: string;
  estadoConservacao: string;
  estadoSaudeId: string;
  estagioVidaId: string;
  atropelamento: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidadeTotal: number;
  destinacao: string;
  estagioVidaObitoId: string;
  quantidadeAdultoObito: number;
  quantidadeFilhoteObito: number;
  quantidadeTotalObito: number;
}

interface BemApreendido {
  id: string;
  itemId: string;
  categoria: string;
  item: string;
  usoIlicito: string;
  aplicacao: string;
  quantidade: number;
}

export const useCrimesAmbientaisForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [floraItems, setFloraItems] = useState<FloraItem[]>([]);
  const [faunaItems, setFaunaItems] = useState<FaunaItem[]>([]);
  const [bensApreendidos, setBensApreendidos] = useState<BemApreendido[]>([]);

  const form = useForm<CrimesAmbientaisFormData>({
    resolver: zodResolver(crimesAmbientaisSchema),
    defaultValues: {
      data: '',
      regiaoAdministrativa: '',
      tipoAreaId: '',
      latitudeOcorrencia: '',
      longitudeOcorrencia: '',
      tipoCrime: '',
      enquadramento: '',
      ocorreuApreensao: false,
      // Crime Contra a Fauna
      classeTaxonomica: '',
      especieId: '',
      estadoSaudeId: '',
      atropelamento: '',
      estagioVidaId: '',
      quantidadeAdulto: 0,
      quantidadeFilhote: 0,
      quantidadeTotal: 0,
      destinacao: '',
      // Óbito
      estagioVidaObito: '',
      quantidadeAdultoObito: 0,
      quantidadeFilhoteObito: 0,
      quantidadeTotalObito: 0,
      // Flora
      floraItems: [],
      numeroTermoEntregaFlora: '',
      // Desfecho
      desfecho: '',
      procedimentoLegal: '',
      quantidadeDetidosMaiorIdade: 0,
      quantidadeDetidosMenorIdade: 0,
      quantidadeLiberadosMaiorIdade: 0,
      quantidadeLiberadosMenorIdade: 0,
      // Novos campos - Poluição
      tipoPoluicao: '',
      descricaoSituacaoPoluicao: '',
      materialVisivel: '',
      volumeAparente: '',
      origemAparente: '',
      animalAfetado: false,
      vegetacaoAfetada: false,
      alteracaoVisual: false,
      odorForte: false,
      mortandadeAnimais: false,
      riscoImediato: '',
      intensidadePercebida: '',
      // Novos campos - Ordenamento Urbano
      tipoIntervencaoIrregular: '',
      estruturasEncontradas: '',
      quantidadeEstruturas: 0,
      danoAlteracaoPerceptivel: '',
      maquinasPresentes: false,
      materialApreendidoUrbano: false,
      descricaoMaterialUrbano: '',
      // Novos campos - Administração Ambiental
      tipoImpedimentoObstrucao: '',
      descricaoAdministracao: '',
      documentoIndicioVisual: false,
      tipoIndicio: '',
      materialApreendidoAdmin: false,
      descricaoMaterialAdmin: '',
      veiculoRelacionado: false,
      // Bens apreendidos
      bensApreendidos: []
    }
  });

  const { setValue, watch, clearErrors, formState } = form;
  const formData = watch();
  const { errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    const numericFields = [
      'quantidadeDetidosMaiorIdade',
      'quantidadeDetidosMenorIdade', 
      'quantidadeLiberadosMaiorIdade',
      'quantidadeLiberadosMenorIdade',
      'quantidadeAdulto',
      'quantidadeFilhote',
      'quantidadeTotal',
      'quantidadeAdultoObito',
      'quantidadeFilhoteObito',
      'quantidadeTotalObito'
    ];
    
    if (numericFields.includes(name)) {
      const numericValue = value === '' ? 0 : parseInt(value, 10);
      setValue(name as keyof CrimesAmbientaisFormData, numericValue);
    } else {
      setValue(name as keyof CrimesAmbientaisFormData, value);
    }
    
    if (errors[name as keyof CrimesAmbientaisFormData]) {
      clearErrors(name as keyof CrimesAmbientaisFormData);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    // Handle boolean fields
    const booleanFields = [
      'ocorreuApreensao',
      'animalAfetado',
      'vegetacaoAfetada', 
      'alteracaoVisual',
      'odorForte',
      'mortandadeAnimais',
      'maquinasPresentes',
      'materialApreendidoUrbano',
      'documentoIndicioVisual',
      'materialApreendidoAdmin',
      'veiculoRelacionado'
    ];
    
    if (booleanFields.includes(name)) {
      setValue(name as keyof CrimesAmbientaisFormData, value === 'true');
    } else if (name === 'quantidadeEstruturas') {
      setValue(name as keyof CrimesAmbientaisFormData, parseInt(value) || 0);
    } else {
      setValue(name as keyof CrimesAmbientaisFormData, value);
    }
    
    if (errors[name as keyof CrimesAmbientaisFormData]) {
      clearErrors(name as keyof CrimesAmbientaisFormData);
    }
  };

  const handleFloraItemsChange = (items: FloraItem[]) => {
    setFloraItems(items);
    setValue('floraItems', items as any);
  };

  const handleFaunaItemsChange = (items: FaunaItem[]) => {
    setFaunaItems(items);
  };

  const handleBensApreendidosChange = (bens: BemApreendido[]) => {
    setBensApreendidos(bens);
    setValue('bensApreendidos', bens as any);
  };

  const handleNumeroTermoEntregaFloraChange = (value: string) => {
    setValue('numeroTermoEntregaFlora', value);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return (errors as any)[fieldName]?.message as string | undefined;
  };

  const handleSubmit = async (data: CrimesAmbientaisFormData) => {
    setIsSubmitting(true);
    
    try {
      // Parse a data
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

      // Buscar IDs das dimensões
      const [regiaoId, tipoCrimeId, enquadramentoId] = await Promise.all([
        buscarIdPorNome('dim_regiao_administrativa', data.regiaoAdministrativa),
        buscarTipoCrimeId(data.tipoCrime),
        buscarEnquadramentoId(data.enquadramento)
      ]);

      // Dados base do registro
      const baseRecord = {
        data: dataFormatada,
        regiao_administrativa_id: regiaoId,
        tipo_area_id: data.tipoAreaId || null,
        latitude_ocorrencia: data.latitudeOcorrencia || null,
        longitude_ocorrencia: data.longitudeOcorrencia || null,
        tipo_crime_id: tipoCrimeId,
        enquadramento_id: enquadramentoId,
        ocorreu_apreensao: data.ocorreuApreensao || false,
        desfecho: data.desfecho,
        procedimento_legal: data.procedimentoLegal || null,
        quantidade_detidos_maior_idade: data.quantidadeDetidosMaiorIdade || 0,
        quantidade_detidos_menor_idade: data.quantidadeDetidosMenorIdade || 0,
        quantidade_liberados_maior_idade: data.quantidadeLiberadosMaiorIdade || 0,
        quantidade_liberados_menor_idade: data.quantidadeLiberadosMenorIdade || 0
      };

      // Verificar tipo de crime - usar includes para match parcial
      const isCrimeContraFauna = data.tipoCrime?.toLowerCase().includes('fauna');
      const isCrimeContraFlora = data.tipoCrime?.toLowerCase().includes('flora');

      // Se for crime contra fauna, criar registros para cada fauna item
      if (isCrimeContraFauna && faunaItems.length > 0) {
        for (const item of faunaItems) {
          const faunaRecord = {
            ...baseRecord,
            tipo_registro: 'fauna',
            especie_fauna_id: item.especieId || null,
            nome_popular_fauna: item.nomePopular || null,
            nome_cientifico_fauna: item.nomeCientifico || null,
            classe_taxonomica: item.classeTaxonomica || null,
            ordem_taxonomica: item.ordemTaxonomica || null,
            tipo_fauna: item.tipoFauna || null,
            estado_conservacao_fauna: item.estadoConservacao || null,
            estado_saude_id: item.estadoSaudeId || null,
            estagio_vida_id: item.estagioVidaId || null,
            atropelamento: item.atropelamento || null,
            quantidade_adulto: item.quantidadeAdulto || 0,
            quantidade_filhote: item.quantidadeFilhote || 0,
            quantidade_total: item.quantidadeTotal || 0,
            destinacao_fauna: item.destinacao || null,
            estagio_vida_obito_id: item.estagioVidaObitoId || null,
            quantidade_adulto_obito: item.quantidadeAdultoObito || 0,
            quantidade_filhote_obito: item.quantidadeFilhoteObito || 0,
            quantidade_total_obito: item.quantidadeTotalObito || 0
          };

          const { error } = await supabase
            .from('fat_registros_de_crime')
            .insert(faunaRecord);

          if (error) throw error;
        }
      }
      // Se for crime contra flora, criar registros para cada flora item
      else if (isCrimeContraFlora && floraItems.length > 0) {
        for (const item of floraItems) {
          const floraRecord = {
            ...baseRecord,
            tipo_registro: 'flora',
            especie_flora_id: item.especieId || null,
            nome_popular_flora: item.nomePopular || null,
            nome_cientifico_flora: item.nomeCientifico || null,
            classe_flora: item.classe || null,
            ordem_flora: item.ordem || null,
            familia_flora: item.familia || null,
            estado_conservacao_flora: item.estadoConservacao || null,
            tipo_planta: item.tipoPlanta || null,
            madeira_lei: item.madeiraLei || null,
            imune_corte: item.imuneCote || null,
            condicao_flora: item.condicao || null,
            quantidade_flora: item.quantidade || 1,
            destinacao_flora: item.destinacao || null,
            numero_termo_entrega: data.numeroTermoEntregaFlora || null
          };

          const { error } = await supabase
            .from('fat_registros_de_crime')
            .insert(floraRecord);

          if (error) throw error;
        }
      }
      // Outros tipos de crime (sem espécie)
      else {
        const otherRecord = {
          ...baseRecord,
          tipo_registro: 'outro'
        };

        const { error } = await supabase
          .from('fat_registros_de_crime')
          .insert(otherRecord);

        if (error) throw error;
      }
      
      toast.success('Ocorrência de crime ambiental registrada com sucesso!');
      
      // Reset form
      form.reset();
      setFloraItems([]);
      setFaunaItems([]);
      
    } catch (error) {
      console.error('Erro ao salvar crime ambiental:', error);
      toast.error('Erro ao registrar ocorrência. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    getFieldError,
    errors,
    floraItems,
    handleFloraItemsChange,
    faunaItems,
    handleFaunaItemsChange,
    handleNumeroTermoEntregaFloraChange,
    bensApreendidos,
    handleBensApreendidosChange
  };
};

// Funções auxiliares para buscar IDs
async function buscarTipoCrimeId(tipoCrime: string): Promise<string | null> {
  if (!tipoCrime) return null;
  
  const { data } = await supabase
    .from('dim_tipo_de_crime')
    .select('id_tipo_de_crime')
    .ilike('Tipo de Crime', `%${tipoCrime}%`)
    .maybeSingle();
  
  return data?.id_tipo_de_crime || null;
}

async function buscarEnquadramentoId(enquadramento: string): Promise<string | null> {
  if (!enquadramento) return null;
  
  const { data } = await supabase
    .from('dim_enquadramento')
    .select('id_enquadramento')
    .eq('Enquadramento', enquadramento)
    .maybeSingle();
  
  return data?.id_enquadramento || null;
}
