
import React from 'react';

interface ResgateFormHeaderProps {
  isSubmitting?: boolean;
}

const ResgateFormHeader: React.FC<ResgateFormHeaderProps> = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg text-gray-600">Preencha os dados do registro de atividade</h2>
      <p className="text-sm text-gray-500 mt-1">
        Todos os campos marcados com * são obrigatórios.
      </p>
    </div>
  );
};

export default ResgateFormHeader;
