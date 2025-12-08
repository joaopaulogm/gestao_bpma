
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import ResgateFormWrapper from './ResgateFormWrapper';
import { MembroEquipe } from './EquipeSection';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: ResgateFormData, membrosEquipe?: MembroEquipe[]) => Promise<void>;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateForm: React.FC<ResgateFormProps> = (props) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);

  const handleFormSubmitWithEquipe = async (data: ResgateFormData) => {
    await props.handleFormSubmit(data, membrosEquipe);
    // Reset equipe after successful submit if not editing
    if (!props.isEditing) {
      setMembrosEquipe([]);
    }
  };

  return (
    <ResgateFormWrapper 
      {...props} 
      handleFormSubmit={handleFormSubmitWithEquipe}
      membrosEquipe={membrosEquipe}
      onMembrosEquipeChange={setMembrosEquipe}
    />
  );
};

export default ResgateForm;
