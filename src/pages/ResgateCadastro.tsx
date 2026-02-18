
import React from 'react';
import Layout from '@/components/Layout';
import ResgateFormContainer from '@/components/resgate/ResgateFormContainer';

interface ResgateCadastroProps {
  embedded?: boolean;
}

const ResgateCadastro: React.FC<ResgateCadastroProps> = ({ embedded = false }) => {
  if (embedded) {
    return <ResgateFormContainer />;
  }
  return (
    <Layout title="Resgate de Fauna" showBackButton>
      <ResgateFormContainer />
    </Layout>
  );
};

export default ResgateCadastro;
