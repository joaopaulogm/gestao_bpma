
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegistroNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Layout title="Detalhes do Registro" showBackButton>
      <div className="text-center py-32">
        <p className="text-xl text-gray-600">Registro não encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/registros')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
      </div>
    </Layout>
  );
};

export default RegistroNotFound;
