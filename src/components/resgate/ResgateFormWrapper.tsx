
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import ResgateFormHeader from './ResgateFormHeader';
import FormErrorDisplay from './FormErrorDisplay';
import ResgateFormSubmitButton from './ResgateFormSubmitButton';
import InformacoesGeraisSection from './InformacoesGeraisSection';
import EspecieSection from './EspecieSection';
import DestinacaoSection from './DestinacaoSection';

interface ResgateFormWrapperProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleFormSubmit: (data: any) => Promise<void>;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  onBuscarDetalhesEspecie: (especieId: string) => void;
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
  handleFormSubmit,
  especieSelecionada,
  carregandoEspecie,
  onBuscarDetalhesEspecie,
  isSubmitting,
  isEditing,
  fetchError
}) => {
  // Check if we have form-level errors
  const formLevelError = errors.root?.message || errors._errors?.join(', ');
  
  // Check if desfecho is Evadido to make fields optional
  const isEvadido = formData.desfechoResgate === "Evadido";

  return (
    <div className="space-y-6 animate-fade-in">
      <ResgateFormHeader isEditing={isEditing} isSubmitting={isSubmitting} />
      
      <FormErrorDisplay 
        formLevelError={formLevelError} 
        fetchError={fetchError} 
      />
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <InformacoesGeraisSection 
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          errors={errors}
        />
        
        <EspecieSection
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          errors={errors}
          especieSelecionada={especieSelecionada}
          carregandoEspecie={carregandoEspecie}
          onBuscarDetalhesEspecie={onBuscarDetalhesEspecie}
          isEvadido={isEvadido}
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
