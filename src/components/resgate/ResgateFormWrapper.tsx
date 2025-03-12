
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import ResgateFormHeader from './ResgateFormHeader';
import FormErrorDisplay from './FormErrorDisplay';
import ResgateFormSubmitButton from './ResgateFormSubmitButton';
import InformacoesGeraisSection from './InformacoesGeraisSection';
import EspecieSection from './EspecieSection';
import AnimalInfoSection from './AnimalInfoSection';
import DestinacaoSection from './DestinacaoSection';

interface ResgateFormWrapperProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: any) => Promise<void>;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateFormWrapper: React.FC<ResgateFormWrapperProps> = ({
  form,
  formData,
  errors,
  handleChange,
  handleSelectChange,
  handleQuantidadeChange,
  handleFormSubmit,
  especieSelecionada,
  carregandoEspecie,
  isSubmitting,
  isEditing,
  fetchError
}) => {
  // Check if we have form-level errors
  const formLevelError = errors.root?.message || errors._errors?.join(', ');

  return (
    <div className="space-y-6 animate-fade-in">
      <ResgateFormHeader isEditing={isEditing} isSubmitting={isSubmitting} />
      
      <FormErrorDisplay 
        formLevelError={formLevelError} 
        fetchError={fetchError} 
      />
      
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <InformacoesGeraisSection 
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          errors={errors}
        />
        
        <EspecieSection 
          formData={formData}
          handleSelectChange={handleSelectChange}
          errors={errors}
          especieSelecionada={especieSelecionada}
          carregandoEspecie={carregandoEspecie}
        />
        
        <AnimalInfoSection 
          formData={formData}
          handleSelectChange={handleSelectChange}
          handleQuantidadeChange={handleQuantidadeChange}
          errors={errors}
        />
        
        <DestinacaoSection 
          formData={formData}
          handleSelectChange={handleSelectChange}
          handleChange={handleChange}
          errors={errors}
        />
        
        <ResgateFormSubmitButton 
          isSubmitting={isSubmitting} 
          isEditing={isEditing}
        />
      </form>
    </div>
  );
};

export default ResgateFormWrapper;
