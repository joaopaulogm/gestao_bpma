
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import ResgateFormWrapper from './ResgateFormWrapper';
import { MembroEquipe } from './EquipeSection';
import { EspecieItem } from './EspeciesMultiplasSection';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: ResgateFormData, membrosEquipe?: MembroEquipe[], especies?: EspecieItem[]) => Promise<void>;
  isSubmitting: boolean;
  isEditing: boolean;
  fetchError?: string | null;
}

const ResgateForm: React.FC<ResgateFormProps> = (props) => {
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);

  const createEspecieItem = (): EspecieItem => ({
    id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)),
    especieId: '',
    classeTaxonomica: '',
    nomeCientifico: '',
    ordemTaxonomica: '',
    estadoConservacao: '',
    tipoFauna: '',
    estadoSaude: '',
    atropelamento: '',
    estagioVida: '',
    quantidadeAdulto: 0,
    quantidadeFilhote: 0,
    quantidadeTotal: 0,
    destinacao: '',
    numeroTermoEntrega: '',
    horaGuardaCEAPA: '',
    motivoEntregaCEAPA: '',
    latitudeSoltura: '',
    longitudeSoltura: '',
    outroDestinacao: '',
  });

  const [especies, setEspecies] = useState<EspecieItem[]>([createEspecieItem()]);

  const handleFormSubmitWithData = async (data: ResgateFormData) => {
    await props.handleFormSubmit(data, membrosEquipe, especies);
    // Reset after successful submit if not editing
    if (!props.isEditing) {
      setMembrosEquipe([]);
      setEspecies([createEspecieItem()]);
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
    />
  );
};

export default ResgateForm;
