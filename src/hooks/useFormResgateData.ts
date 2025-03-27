
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { useResgateSubmission } from './useResgateSubmission';
import { useResgateFormFields } from './useResgateFormFields';
import { Especie } from '@/services/especieService';

// Default form values now include animais array
const defaultResgateForm: ResgateFormData = {
  data: '',
  regiaoAdministrativa: '',
  origem: '',
  latitudeOrigem: '',
  longitudeOrigem: '',
  destinacao: '',
  animais: [{
    classeTaxonomica: '',
    especieId: '',
    estadoSaude: '',
    atropelamento: '',
    estagioVida: '',
    quantidadeAdulto: 0,
    quantidadeFilhote: 0,
    quantidade: 0,
  }]
};

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
    handleSelectChange: baseHandleSelectChange,
  } = useResgateFormFields(form);

  // Enhanced select change handler
  const handleSelectChange = (name: string, value: string) => {
    baseHandleSelectChange(name, value);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log('Form submitted:', data);
    
    setIsSubmitting(true);
    try {
      const sucesso = await salvarRegistrosNoBanco(data);
      
      if (sucesso) {
        toast.success('Registro de resgate cadastrado com sucesso!');
        
        // Resetar formulário após envio bem-sucedido
        reset(defaultResgateForm);
      }
    } catch (error) {
      console.error("Erro ao processar submissão:", error);
      toast.error("Ocorreu um erro ao processar o cadastro");
    } finally {
      setIsSubmitting(false);
    }
  });

  // New function to save multiple records
  const salvarRegistrosNoBanco = async (data: ResgateFormData) => {
    if (!data.animais || data.animais.length === 0) {
      toast.error("É necessário adicionar pelo menos um animal");
      return false;
    }

    try {
      const promises = data.animais.map(async (animal, index) => {
        // For evaded animals, we can skip validation
        const isEvadido = data.desfechoResgate === "Evadido";
        
        if (!isEvadido && (!animal.classeTaxonomica || !animal.especieId)) {
          toast.error(`Animal ${index + 1}: Classe taxonômica e espécie são obrigatórios`);
          return false;
        }

        try {
          // Create a synthetic record that combines the common data with the animal-specific data
          const recordData = {
            data: data.data,
            regiaoAdministrativa: data.regiaoAdministrativa,
            origem: data.origem,
            desfechoResgate: data.desfechoResgate,
            latitudeOrigem: data.latitudeOrigem,
            longitudeOrigem: data.longitudeOrigem,
            desfechoApreensao: data.desfechoApreensao,
            numeroTCO: data.numeroTCO,
            outroDesfecho: data.outroDesfecho,
            estadoSaude: animal.estadoSaude,
            atropelamento: animal.atropelamento,
            estagioVida: animal.estagioVida,
            quantidadeAdulto: animal.quantidadeAdulto,
            quantidadeFilhote: animal.quantidadeFilhote,
            quantidade: animal.quantidade,
            destinacao: data.destinacao,
            numeroTermoEntrega: data.numeroTermoEntrega,
            horaGuardaCEAPA: data.horaGuardaCEAPA,
            motivoEntregaCEAPA: data.motivoEntregaCEAPA,
            latitudeSoltura: data.latitudeSoltura,
            longitudeSoltura: data.longitudeSoltura,
            outroDestinacao: data.outroDestinacao,
            classeTaxonomica: animal.classeTaxonomica,
            especieId: animal.especieId
          };
          
          const result = await salvarRegistroNoBanco(recordData, null);
          return result;
        } catch (error) {
          console.error(`Erro ao salvar animal ${index + 1}:`, error);
          toast.error(`Erro ao salvar animal ${index + 1}`);
          return false;
        }
      });

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error("Erro ao salvar múltiplos registros:", error);
      toast.error("Ocorreu um erro ao salvar os registros");
      return false;
    }
  };

  return {
    form,
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleSubmit,
    isSubmitting
  };
};
