import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crimesAmbientaisSchema, CrimesAmbientaisFormData } from '@/schemas/crimesAmbientaisSchema';
import { useState } from 'react';
import { toast } from 'sonner';

export const useCrimesAmbientaisForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CrimesAmbientaisFormData>({
    resolver: zodResolver(crimesAmbientaisSchema),
    defaultValues: {
      data: '',
      regiaoAdministrativa: '',
      localizacaoOcorrencia: '',
      tipoCrime: '',
      enquadramento: '',
      desfecho: '',
      procedimentoLegal: ''
    }
  });

  const { setValue, watch, clearErrors, formState } = form;
  const formData = watch();
  const { errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as keyof CrimesAmbientaisFormData, value);
    
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
    errors
  };
};