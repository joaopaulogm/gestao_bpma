
import React from 'react';
import Layout from '@/components/Layout';
import ResgateFormContainer from '@/components/resgate/ResgateFormContainer';

const ResgateCadastro = () => {
  return (
    <Layout title="Ocorrências de Resgate e Animais Apreendidos" showBackButton>
      <ResgateFormContainer />
    </Layout>
  );
};

export default ResgateCadastro;
