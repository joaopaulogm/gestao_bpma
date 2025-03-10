
import React from 'react';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';

const RegistroLoading = () => {
  return (
    <Layout title="Detalhes do Registro" showBackButton>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
        <span className="ml-2">Carregando detalhes...</span>
      </div>
    </Layout>
  );
};

export default RegistroLoading;
