
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { useResgateSubmission, MembroEquipeSubmit } from './useResgateSubmission';
import { useResgateFormFields } from './useResgateFormFields';
import { MembroEquipe } from '@/components/resgate/EquipeSection';
import { EspecieItem } from '@/components/resgate/EspeciesMultiplasSection';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { reset, formState } = form;
  const { errors } = formState;
  
  const { 
    isSubmitting, 
    setIsSubmitting, 
    salvarRegistroNoBanco 
  } = useResgateSubmission();
  
  const { 
    formData, 
    handleChange, 
    handleSelectChange, 
    handleQuantidadeChange 
  } = useResgateFormFields(form);

  const handleSubmitWithData = async (data: ResgateFormData, membrosEquipe?: MembroEquipe[], especies?: EspecieItem[]) => {
    console.log('Form submitted:', data);
    console.log('Espécies:', especies);
    
    setIsSubmitting(true);
    try {
      // Convert MembroEquipe to MembroEquipeSubmit
      const membrosSubmit: MembroEquipeSubmit[] | undefined = membrosEquipe?.map(m => ({
        efetivo_id: m.efetivo_id
      }));
      
      const sucesso = await salvarRegistroNoBanco(data, especies || [], membrosSubmit);
      
      if (sucesso) {
        toast.success('Registro de resgate cadastrado com sucesso!');
        reset();
      }
    } catch (error) {
      console.error("Erro ao processar submissão:", error);
      toast.error("Ocorreu um erro ao processar o cadastro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit: handleSubmitWithData,
    isSubmitting
  };
};

