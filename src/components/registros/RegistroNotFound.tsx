
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegistroNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Layout title="Detalhes do Registro" showBackButton>
      <div className="text-center py-32 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Registro não encontrado</h2>
          <p className="text-gray-600 mb-6">
            O registro que você está procurando não existe ou foi removido.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              onClick={() => navigate('/registros')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Ver todos os registros
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegistroNotFound;
