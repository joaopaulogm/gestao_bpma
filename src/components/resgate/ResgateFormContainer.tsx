
import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const editingId = searchParams.get('editar');
  const isFromEditPage = location.state?.fromEdit || false;
  
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
  
  // For debugging
  useEffect(() => {
    if (editingId) {
      console.log("Modo de edição ativado, ID:", editingId);
      console.log("Dados recebidos do estado:", location.state);
      console.log("Classe taxonomica no formData:", formData.classeTaxonomica);
    }
  }, [editingId, location.state, formData.classeTaxonomica]);
  
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
