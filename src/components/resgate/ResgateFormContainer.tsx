
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { useResgateFormEdit } from '@/hooks/useResgateFormEdit';
import { useResgateFormSubmitEdit } from '@/hooks/useResgateFormSubmitEdit';
import ResgateForm from './ResgateForm';
import { ResgateFormData } from '@/schemas/resgateSchema';

const ResgateFormContainer = () => {
  const { 
    form, 
    formData, 
    errors, 
    handleChange, 
    handleSelectChange, 
    handleQuantidadeChange, 
    handleSubmit,
    especieSelecionada,
    carregandoEspecie,
    buscarDetalhesEspecie,
    isSubmitting: isSubmittingCreate
  } = useFormResgateData();
  
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('editar');
  
  const {
    isEditing,
    originalRegistro,
    fetchError
  } = useResgateFormEdit(form, editingId, buscarDetalhesEspecie);
  
  const {
    handleFormSubmit,
    isSubmitting: isSubmittingEdit
  } = useResgateFormSubmitEdit(form, handleSubmit);

  const isSubmitting = isSubmittingCreate || isSubmittingEdit;
  
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
      handleQuantidadeChange={handleQuantidadeChange}
      handleFormSubmit={form.handleSubmit(onFormSubmit)}
      especieSelecionada={especieSelecionada}
      carregandoEspecie={carregandoEspecie}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      fetchError={fetchError}
    />
  );
};

export default ResgateFormContainer;
