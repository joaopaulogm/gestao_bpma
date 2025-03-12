
import React from 'react';
import { Loader2 } from 'lucide-react';

const RegistrosLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
      <span className="ml-2">Carregando registros...</span>
    </div>
  );
};

export default RegistrosLoading;
