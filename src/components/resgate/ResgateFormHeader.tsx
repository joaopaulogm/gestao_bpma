
import React from 'react';

interface ResgateFormHeaderProps {
  isSubmitting: boolean;
}

const ResgateFormHeader: React.FC<ResgateFormHeaderProps> = () => {
  return (
    <h2 className="text-lg text-gray-600 mb-6">Preencha os dados do registro de atividade</h2>
  );
};

export default ResgateFormHeader;
