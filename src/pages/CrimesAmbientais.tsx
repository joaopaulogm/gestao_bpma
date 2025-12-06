// Environmental Crimes Form Page
import React from 'react';
import Layout from '@/components/Layout';
import CrimesAmbientaisForm from '@/components/crimes/CrimesAmbientaisForm';
import { useCrimesAmbientaisForm } from '@/hooks/useCrimesAmbientaisForm';

const CrimesAmbientais = () => {
  const {
    form,
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
    isSubmitting,
    getFieldError,
    floraItems,
    handleFloraItemsChange,
    faunaItems,
    handleFaunaItemsChange,
    handleNumeroTermoEntregaFloraChange,
    bensApreendidos,
    handleBensApreendidosChange
  } = useCrimesAmbientaisForm();

  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
      <CrimesAmbientaisForm
        form={form}
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        getFieldError={getFieldError}
        floraItems={floraItems}
        onFloraItemsChange={handleFloraItemsChange}
        faunaItems={faunaItems}
        onFaunaItemsChange={handleFaunaItemsChange}
        onNumeroTermoEntregaFloraChange={handleNumeroTermoEntregaFloraChange}
        bensApreendidos={bensApreendidos}
        onBensApreendidosChange={handleBensApreendidosChange}
      />
    </Layout>
  );
};

export default CrimesAmbientais;
