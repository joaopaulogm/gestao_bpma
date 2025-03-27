
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';

export const useResgateFormFields = (form: UseFormReturn<ResgateFormData>) => {
  const { setValue, watch, setError, clearErrors, formState } = form;
  const formData = watch();
  const { errors, touchedFields } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as any, value);
    
    // Clear the error for this field if it exists
    if (errors[name as keyof ResgateFormData]) {
      clearErrors(name as keyof ResgateFormData);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as any, value);
    
    // Clear the error for this field if it exists
    if (errors[name as keyof ResgateFormData]) {
      clearErrors(name as keyof ResgateFormData);
    }
  };

  const handleQuantidadeChange = (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => {
    let adultos = formData.quantidadeAdulto || 0;
    let filhotes = formData.quantidadeFilhote || 0;
    
    if (tipo === 'adulto') {
      adultos = operacao === 'aumentar' ? adultos + 1 : Math.max(0, adultos - 1);
      setValue('quantidadeAdulto', adultos);
    } else {
      filhotes = operacao === 'aumentar' ? filhotes + 1 : Math.max(0, filhotes - 1);
      setValue('quantidadeFilhote', filhotes);
    }
    
    // Calculate and update total quantity separately to ensure it's always correct
    const totalQuantidade = adultos + filhotes;
    setValue('quantidade', totalQuantidade);
    
    console.log(`Quantities updated - Adultos: ${adultos}, Filhotes: ${filhotes}, Total: ${totalQuantidade}`);
  };

  const getFieldError = (fieldName: keyof ResgateFormData): string | undefined => {
    return errors[fieldName]?.message as string | undefined;
  };

  const isFieldInvalid = (fieldName: keyof ResgateFormData): boolean => {
    return !!errors[fieldName];
  };

  return {
    formData,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    getFieldError,
    isFieldInvalid,
    touchedFields,
    errors
  };
};
