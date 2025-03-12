
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import ResgateFormWrapper from './ResgateFormWrapper';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: any) => Promise<void>;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateForm: React.FC<ResgateFormProps> = (props) => {
  return <ResgateFormWrapper {...props} />;
};

export default ResgateForm;
