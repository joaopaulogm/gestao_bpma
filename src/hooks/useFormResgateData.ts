
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resgateSchema, type ResgateFormData } from '@/schemas/resgateSchema';
import { defaultResgateForm } from '@/constants/defaultResgateForm';
import { regioes } from '@/constants/regioes';

export { regioes } from '@/constants/regioes';

export const useFormResgateData = () => {
  const form = useForm<ResgateFormData>({
    resolver: zodResolver(resgateSchema),
    defaultValues: defaultResgateForm
  });

  const { watch, setValue, formState } = form;
  const formData = watch();
  const { errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValue(name as any, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    setValue(name as any, value);
  };

  const handleQuantidadeChange = (operacao: 'aumentar' | 'diminuir') => {
    const currentValue = formData.quantidade;
    setValue('quantidade', operacao === 'aumentar' 
      ? currentValue + 1 
      : Math.max(1, currentValue - 1)
    );
  };

  const handleSubmit = form.handleSubmit((data) => {
    console.log('Form submitted:', data);
    toast.success('Registro de resgate cadastrado com sucesso!');
    
    // Resetar formulário após envio
    form.reset();
  });

  return {
    form,
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit
  };
};
