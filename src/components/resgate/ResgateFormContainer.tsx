
import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { useResgateFormEdit } from '@/hooks/useResgateFormEdit';
import { useResgateFormSubmitEdit } from '@/hooks/useResgateFormSubmitEdit';
import { buscarEspeciePorId } from '@/services/especieService';
import ResgateForm from './ResgateForm';
import { ResgateFormData } from '@/schemas/resgateSchema';

const ResgateFormContainer = () => {
  const { 
    form, 
    formData, 
    errors, 
    handleChange, 
    handleSelectChange, 
    handleSubmit,
    isSubmitting: isSubmittingCreate
  } = useFormResgateData();
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editingId = searchParams.get('editar');
  const isFromEditPage = location.state?.fromEdit || false;
  
  const {
    isEditing,
    originalRegistro,
    fetchError,
    especieSelecionada,
    carregandoEspecie,
    onBuscarDetalhesEspecie
  } = useResgateFormEdit(form, editingId, buscarEspeciePorId);
  
  const {
    handleFormSubmit,
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
  
  const onFormSubmit = async (data: ResgateFormData) => {
    await handleFormSubmit(data, isEditing, editingId, originalRegistro, especieSelecionada);
  };

  return (
    <ResgateForm
      form={form}
      formData={formData}
      errors={errors}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleFormSubmit={form.handleSubmit(onFormSubmit)}
      especieSelecionada={especieSelecionada}
      carregandoEspecie={carregandoEspecie}
      onBuscarDetalhesEspecie={onBuscarDetalhesEspecie}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      fetchError={fetchError}
    />
  );
};

export default ResgateFormContainer;
