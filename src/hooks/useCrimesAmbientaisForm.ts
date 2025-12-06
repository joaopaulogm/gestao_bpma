import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crimesAmbientaisSchema, CrimesAmbientaisFormData } from '@/schemas/crimesAmbientaisSchema';
import { FloraItem } from '@/components/crimes/FloraSection';
import { FaunaItem } from '@/components/crimes/FaunaSection';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { buscarIdPorNome } from '@/services/dimensionService';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useCrimesAmbientaisForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [floraItems, setFloraItems] = useState<FloraItem[]>([]);
  const [faunaItems, setFaunaItems] = useState<FaunaItem[]>([]);

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
      quantidadeLiberadosMenorIdade: 0
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
    // Handle boolean field for ocorreuApreensao
    if (name === 'ocorreuApreensao') {
      setValue(name as keyof CrimesAmbientaisFormData, value === 'true');
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

      // Se for crime contra fauna, criar registros para cada fauna item
      if (data.tipoCrime === 'Crime Contra a Fauna' && faunaItems.length > 0) {
        for (const item of faunaItems) {
          const faunaRecord = {
            ...baseRecord,
            tipo_registro: 'fauna',
            especie_fauna_id: item.especieId || null,
            nome_popular_fauna: item.nomePopular,
            nome_cientifico_fauna: item.nomeCientifico,
            classe_taxonomica: item.classeTaxonomica,
            ordem_taxonomica: item.ordemTaxonomica,
            tipo_fauna: item.tipoFauna,
            estado_conservacao_fauna: item.estadoConservacao,
            estado_saude_id: item.estadoSaudeId || null,
            estagio_vida_id: item.estagioVidaId || null,
            atropelamento: item.atropelamento,
            quantidade_adulto: item.quantidadeAdulto,
            quantidade_filhote: item.quantidadeFilhote,
            quantidade_total: item.quantidadeTotal,
            destinacao_fauna: item.destinacao,
            estagio_vida_obito_id: item.estagioVidaObitoId || null,
            quantidade_adulto_obito: item.quantidadeAdultoObito,
            quantidade_filhote_obito: item.quantidadeFilhoteObito,
            quantidade_total_obito: item.quantidadeTotalObito
          };

          const { error } = await supabase
            .from('fat_registros_de_crime')
            .insert(faunaRecord);

          if (error) throw error;
        }
      }
      // Se for crime contra flora, criar registros para cada flora item
      else if (data.tipoCrime === 'Crime Contra a Flora' && floraItems.length > 0) {
        for (const item of floraItems) {
          const floraRecord = {
            ...baseRecord,
            tipo_registro: 'flora',
            especie_flora_id: item.especieId || null,
            nome_popular_flora: item.nomePopular,
            nome_cientifico_flora: item.nomeCientifico,
            classe_flora: item.classe,
            ordem_flora: item.ordem,
            familia_flora: item.familia,
            estado_conservacao_flora: item.estadoConservacao,
            tipo_planta: item.tipoPlanta,
            madeira_lei: item.madeiraLei,
            imune_corte: item.imuneCote,
            condicao_flora: item.condicao,
            quantidade_flora: item.quantidade,
            destinacao_flora: item.destinacao,
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
    handleNumeroTermoEntregaFloraChange
  };
};

// Funções auxiliares para buscar IDs
async function buscarTipoCrimeId(tipoCrime: string): Promise<string | null> {
  const { data } = await supabase
    .from('dim_tipo_de_crime')
    .select('id_tipo_de_crime')
    .ilike('Tipo de Crime', `%${tipoCrime}%`)
    .maybeSingle();
  
  return data?.id_tipo_de_crime || null;
}

async function buscarEnquadramentoId(enquadramento: string): Promise<string | null> {
  const { data } = await supabase
    .from('dim_enquadramento')
    .select('id_enquadramento')
    .eq('Enquadramento', enquadramento)
    .maybeSingle();
  
  return data?.id_enquadramento || null;
}
