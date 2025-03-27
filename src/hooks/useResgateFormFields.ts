
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
    getFieldError,
    isFieldInvalid,
    touchedFields,
    errors
  };
};
