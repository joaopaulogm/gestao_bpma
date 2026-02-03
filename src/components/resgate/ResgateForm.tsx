
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import ResgateFormWrapper from './ResgateFormWrapper';
import { MembroEquipe } from './EquipeSection';
import { EspecieItem } from './EspeciesMultiplasSection';
import { useGrupamentoServico } from '@/hooks/useGrupamentoServico';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: Record<string, { message?: string } | undefined>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: ResgateFormData, membrosEquipe?: MembroEquipe[], especies?: EspecieItem[], grupamentoServicoId?: string | null) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateForm: React.FC<ResgateFormProps> = (props) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [especies, setEspecies] = useState<EspecieItem[]>([]);
  const [grupamentoServicoId, setGrupamentoServicoId] = useState<string>('');
  const { options: grupamentoServicoOptions } = useGrupamentoServico();

  const handleFormSubmitWithData = async (data: ResgateFormData) => {
    await props.handleFormSubmit(data, membrosEquipe, especies, grupamentoServicoId || null);
    // Reset after successful submit if not editing
    if (!props.isEditing) {
      setMembrosEquipe([]);
      setEspecies([]);
      setGrupamentoServicoId('');
    }
  };

  return (
    <ResgateFormWrapper
      form={props.form}
      formData={props.formData}
      errors={props.errors}
      handleChange={props.handleChange}
      handleSelectChange={props.handleSelectChange}
      handleQuantidadeChange={props.handleQuantidadeChange}
      handleFormSubmit={handleFormSubmitWithData}
      isSubmitting={props.isSubmitting}
      isEditing={props.isEditing}
      fetchError={props.fetchError}
      membrosEquipe={membrosEquipe}
      onMembrosEquipeChange={setMembrosEquipe}
      especies={especies}
      onEspeciesChange={setEspecies}
      grupamentoServicoOptions={grupamentoServicoOptions}
      grupamentoServicoId={grupamentoServicoId}
      onGrupamentoServicoChange={setGrupamentoServicoId}
    />
  );
};

export default ResgateForm;
