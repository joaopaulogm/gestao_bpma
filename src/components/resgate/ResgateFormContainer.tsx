
import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { useResgateFormEdit } from '@/hooks/useResgateFormEdit';
import { useResgateFormSubmitEdit } from '@/hooks/useResgateFormSubmitEdit';
import { useMultipleAnimaisForm } from '@/hooks/useMultipleAnimaisForm';
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
  
  const {
    especiesSelecionadas,
    carregandoEspecies,
    initializeAnimais,
    handleAnimalAdd,
    handleAnimalRemove,
    handleAnimalChange,
    handleAnimalQuantidadeChange,
    onBuscarDetalhesEspecie
  } = useMultipleAnimaisForm(form);
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const editingId = searchParams.get('editar');
  const isFromEditPage = location.state?.fromEdit || false;
  
  const {
    isEditing,
    originalRegistro,
    fetchError
  } = useResgateFormEdit(form, editingId, async (especieId: string) => {
    // This now returns a Promise to match the expected function signature
    return Promise.resolve();
  });
  
  const {
    handleFormSubmit,
    isSubmitting: isSubmittingEdit
  } = useResgateFormSubmitEdit(form, handleSubmit);

  const isSubmitting = isSubmittingCreate || isSubmittingEdit;
  
  // Initialize animals if needed
  useEffect(() => {
    initializeAnimais();
  }, [initializeAnimais]);
  
  // For debugging
  useEffect(() => {
    if (editingId) {
      console.log("Modo de edição ativado, ID:", editingId);
      console.log("Dados recebidos do estado:", location.state);
    }
  }, [editingId, location.state]);

  // Handler to pass to child components
  const handleEspecieSelection = (index: number, especieId: string) => {
    onBuscarDetalhesEspecie(index, especieId, buscarEspeciePorId);
  };
  
  const onFormSubmit = async (data: ResgateFormData) => {
    await handleFormSubmit(data, isEditing, editingId, originalRegistro, especiesSelecionadas[0]);
  };

  return (
    <ResgateForm
      form={form}
      formData={formData}
      errors={errors}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleAnimalChange={handleAnimalChange}
      handleAnimalAdd={handleAnimalAdd}
      handleAnimalRemove={handleAnimalRemove}
      handleAnimalQuantidadeChange={handleAnimalQuantidadeChange}
      handleFormSubmit={form.handleSubmit(onFormSubmit)}
      especiesSelecionadas={especiesSelecionadas}
      carregandoEspecies={carregandoEspecies}
      onBuscarDetalhesEspecie={handleEspecieSelection}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      fetchError={fetchError}
    />
  );
};

export default ResgateFormContainer;
