import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crimesAmbientaisSchema, CrimesAmbientaisFormData } from '@/schemas/crimesAmbientaisSchema';
import { FloraItem } from '@/components/crimes/FloraSection';
import { useState } from 'react';
import { toast } from 'sonner';

export const useCrimesAmbientaisForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [floraItems, setFloraItems] = useState<FloraItem[]>([]);

  const form = useForm<CrimesAmbientaisFormData>({
    resolver: zodResolver(crimesAmbientaisSchema),
    defaultValues: {
      data: '',
      regiaoAdministrativa: '',
      latitudeOcorrencia: '',
      longitudeOcorrencia: '',
      tipoCrime: '',
      enquadramento: '',
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
    setValue(name as keyof CrimesAmbientaisFormData, value);
    
    if (errors[name as keyof CrimesAmbientaisFormData]) {
      clearErrors(name as keyof CrimesAmbientaisFormData);
    }
  };

  const handleFloraItemsChange = (items: FloraItem[]) => {
    setFloraItems(items);
    setValue('floraItems', items as any);
  };

  const handleNumeroTermoEntregaFloraChange = (value: string) => {
    setValue('numeroTermoEntregaFlora', value);
  };

  const getFieldError = (fieldName: keyof CrimesAmbientaisFormData): string | undefined => {
    return errors[fieldName]?.message as string | undefined;
  };

  const handleSubmit = async (data: CrimesAmbientaisFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implementar a integração com Supabase
      console.log('Dados do crime ambiental:', data);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Ocorrência de crime ambiental registrada com sucesso!');
      
      // Reset form
      form.reset();
      setFloraItems([]);
      
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
    handleNumeroTermoEntregaFloraChange
  };
};