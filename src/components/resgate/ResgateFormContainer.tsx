
import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { useResgateFormEdit } from '@/hooks/useResgateFormEdit';
import { useResgateFormSubmitEdit } from '@/hooks/useResgateFormSubmitEdit';
import ResgateForm from './ResgateForm';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { MembroEquipe } from './EquipeSection';
import { EspecieItem } from './EspeciesMultiplasSection';

const ResgateFormContainer = () => {
  const { 
    form, 
    formData, 
    errors, 
    handleChange, 
    handleSelectChange, 
    handleQuantidadeChange, 
    handleSubmit,
    isSubmitting: isSubmittingCreate
  } = useFormResgateData();
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editingId = searchParams.get('editar');
  const isFromEditPage = (location.state as any)?.fromEdit || false;
  
  const {
    isEditing,
    originalRegistro,
    fetchError
  } = useResgateFormEdit(form, editingId, null);
  
  const {
    handleFormSubmit: handleFormSubmitEdit,
    isSubmitting: isSubmittingEdit
  } = useResgateFormSubmitEdit(form, handleSubmit);

  const isSubmitting = isSubmittingCreate || isSubmittingEdit;
  
  // For debugging
  useEffect(() => {
    if (editingId) {
      console.log("Modo de edição ativado, ID:", editingId);
      console.log("Dados recebidos do estado:", location.state);
    }
  }, [editingId, location.state]);
  
  const onFormSubmit = async (
    data: ResgateFormData,
    membrosEquipe?: MembroEquipe[],
    especies?: EspecieItem[],
    grupamentoServicoId?: string | null
  ) => {
    if (isEditing) {
      await handleFormSubmitEdit(data, isEditing, editingId, originalRegistro, null);
    } else {
      await handleSubmit(data, membrosEquipe, especies, grupamentoServicoId);
    }
  };

  return (
    <ResgateForm
      form={form}
      formData={formData}
      errors={errors}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleQuantidadeChange={handleQuantidadeChange}
      handleFormSubmit={onFormSubmit}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      fetchError={fetchError}
    />
  );
};

export default ResgateFormContainer;
