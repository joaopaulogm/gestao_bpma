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
    getFieldError
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
      />
    </Layout>
  );
};

export default CrimesAmbientais;