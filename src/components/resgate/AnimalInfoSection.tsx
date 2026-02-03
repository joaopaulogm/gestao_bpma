
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import AnimalInfoFields from './AnimalInfoFields';

interface AnimalInfoSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  errors: Record<string, { message?: string } | undefined>;
  isEvadido?: boolean;
}

const AnimalInfoSection: React.FC<AnimalInfoSectionProps> = ({
  formData,
  handleSelectChange,
  handleQuantidadeChange,
  errors,
  isEvadido = false
}) => {
  return (
    <FormSection title="Informações do Animal">
      <AnimalInfoFields 
        estadoSaude={formData.estadoSaude}
        atropelamento={formData.atropelamento}
        estagioVida={formData.estagioVida}
        quantidadeAdulto={formData.quantidadeAdulto}
        quantidadeFilhote={formData.quantidadeFilhote}
        quantidade={formData.quantidade}
        onEstadoSaudeChange={value => handleSelectChange('estadoSaude', value)}
        onAtropelamentoChange={value => handleSelectChange('atropelamento', value)}
        onEstagioVidaChange={value => handleSelectChange('estagioVida', value)}
        onQuantidadeChange={handleQuantidadeChange}
        errorEstadoSaude={errors.estadoSaude?.message}
        errorAtropelamento={errors.atropelamento?.message}
        errorEstagioVida={errors.estagioVida?.message}
        errorQuantidadeAdulto={errors.quantidadeAdulto?.message}
        errorQuantidadeFilhote={errors.quantidadeFilhote?.message}
        required={true}
        isEvadido={isEvadido}
      />
    </FormSection>
  );
};

export default AnimalInfoSection;
