
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { ResgateFormData } from '@/schemas/resgateSchema';
import ResgateFormHeader from './ResgateFormHeader';
import FormErrorDisplay from './FormErrorDisplay';
import ResgateFormSubmitButton from './ResgateFormSubmitButton';
import InformacoesGeraisSection from './InformacoesGeraisSection';
import EspeciesMultiplasSection, { EspecieItem } from './EspeciesMultiplasSection';
import EquipeSection, { MembroEquipe } from './EquipeSection';

interface ResgateFormWrapperProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
  membrosEquipe: MembroEquipe[];
  onMembrosEquipeChange: (membros: MembroEquipe[]) => void;
  especies: EspecieItem[];
  onEspeciesChange: (especies: EspecieItem[]) => void;
}

const ResgateFormWrapper: React.FC<ResgateFormWrapperProps> = ({
  form,
  formData,
  errors,
  handleChange,
  handleSelectChange,
  handleFormSubmit,
  isSubmitting,
  isEditing,
  fetchError,
  membrosEquipe,
  onMembrosEquipeChange,
  especies,
  onEspeciesChange
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

      <form
        onSubmit={form.handleSubmit(handleFormSubmit, () => {
          toast.error('Não foi possível salvar: revise os campos destacados.');
        })}
        className="space-y-6"
      >
        <InformacoesGeraisSection 
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          errors={errors}
        />

        <EquipeSection
          membros={membrosEquipe}
          onMembrosChange={onMembrosEquipeChange}
        />

        <EspeciesMultiplasSection 
          especies={especies}
          onEspeciesChange={onEspeciesChange}
          isEvadido={isEvadido}
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

