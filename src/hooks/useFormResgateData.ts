
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { useEspecieSelector } from './useEspecieSelector';
import { useResgateSubmission, MembroEquipeSubmit } from './useResgateSubmission';
import { useResgateFormFields } from './useResgateFormFields';
import { MembroEquipe } from '@/components/resgate/EquipeSection';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { reset, formState } = form;
  const { errors } = formState;
  
  const { 
    especieSelecionada, 
    carregandoEspecie, 
    buscarDetalhesEspecie, 
    limparEspecie 
  } = useEspecieSelector();
  
  const { 
    isSubmitting, 
    setIsSubmitting, 
    salvarRegistroNoBanco 
  } = useResgateSubmission();
  
  const { 
    formData, 
    handleChange, 
    handleSelectChange: baseHandleSelectChange, 
    handleQuantidadeChange 
  } = useResgateFormFields(form);

  // Enhanced select change handler that also handles especie-related logic
  const handleSelectChange = (name: string, value: string) => {
    baseHandleSelectChange(name, value);
    
    // Se o campo alterado for a espécie, busca os detalhes da espécie
    if (name === 'especieId' && value) {
      buscarDetalhesEspecie(value);
    }
    
    // Se o campo alterado for a classe taxonômica, limpa a espécie selecionada
    if (name === 'classeTaxonomica') {
      baseHandleSelectChange('especieId', '');
      limparEspecie();
    }
  };

  const handleSubmitWithEquipe = async (data: ResgateFormData, membrosEquipe?: MembroEquipe[]) => {
    console.log('Form submitted:', data);
    
    setIsSubmitting(true);
    try {
      // Convert MembroEquipe to MembroEquipeSubmit
      const membrosSubmit: MembroEquipeSubmit[] | undefined = membrosEquipe?.map(m => ({
        efetivo_id: m.efetivo_id
      }));
      
      const sucesso = await salvarRegistroNoBanco(data, especieSelecionada, membrosSubmit);
      
      if (sucesso) {
        toast.success('Registro de resgate cadastrado com sucesso!');
        
        // Resetar formulário após envio bem-sucedido
        reset();
        limparEspecie();
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
    handleSubmit: handleSubmitWithEquipe,
    especieSelecionada,
    carregandoEspecie,
    buscarDetalhesEspecie,
    isSubmitting
  };
};

