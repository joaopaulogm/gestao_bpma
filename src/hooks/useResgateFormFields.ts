
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
    if (tipo === 'adulto') {
      const currentValue = formData.quantidadeAdulto || 0; // Ensure we have a value even if it's undefined
      setValue('quantidadeAdulto', operacao === 'aumentar' 
        ? currentValue + 1 
        : Math.max(0, currentValue - 1)
      );
    } else {
      const currentValue = formData.quantidadeFilhote || 0; // Ensure we have a value even if it's undefined
      setValue('quantidadeFilhote', operacao === 'aumentar' 
        ? currentValue + 1 
        : Math.max(0, currentValue - 1)
      );
    }
    
    // Update total quantity
    const adultos = formData.quantidadeAdulto || 0;
    const filhotes = formData.quantidadeFilhote || 0;
    const totalQuantidade = (operacao === 'aumentar' ? 1 : -1) + (tipo === 'adulto' ? adultos : filhotes) + (tipo === 'adulto' ? filhotes : adultos);
    
    // Ensure the total is at least 0
    setValue('quantidade', Math.max(0, totalQuantidade));
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
