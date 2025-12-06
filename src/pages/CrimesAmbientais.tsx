import React from 'react';
import Layout from '@/components/Layout';
import CrimesAmbientaisForm from '@/components/crimes/CrimesAmbientaisForm';
import { useCrimesAmbientaisForm } from '@/hooks/useCrimesAmbientaisForm';

const CrimesAmbientais = () => {
  const formHook = useCrimesAmbientaisForm();

  return (
    <Layout title="Ocorrências Crimes Ambientais" showBackButton>
      <CrimesAmbientaisForm
        form={formHook.form}
        formData={formHook.formData}
        handleChange={formHook.handleChange}
        handleSelectChange={formHook.handleSelectChange}
        handleSubmit={formHook.handleSubmit}
        isSubmitting={formHook.isSubmitting}
        getFieldError={formHook.getFieldError}
        floraItems={formHook.floraItems}
        onFloraItemsChange={formHook.handleFloraItemsChange}
        faunaItems={formHook.faunaItems}
        onFaunaItemsChange={formHook.handleFaunaItemsChange}
        onNumeroTermoEntregaFloraChange={formHook.handleNumeroTermoEntregaFloraChange}
        bensApreendidos={formHook.bensApreendidos}
        onBensApreendidosChange={formHook.handleBensApreendidosChange}
      />
    </Layout>
  );
};

export default CrimesAmbientais;
