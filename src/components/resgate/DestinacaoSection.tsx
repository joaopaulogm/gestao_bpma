
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import DestinacaoField from './DestinacaoField';

interface DestinacaoSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: any;
}

const DestinacaoSection: React.FC<DestinacaoSectionProps> = ({
  formData,
  handleSelectChange,
  handleChange,
  errors
}) => {
  return (
    <FormSection title="Destinação">
      <DestinacaoField 
        destinacao={formData.destinacao}
        onDestinacaoChange={(value) => handleSelectChange('destinacao', value)}
        numeroTermoEntrega={formData.numeroTermoEntrega}
        horaGuardaCEAPA={formData.horaGuardaCEAPA}
        motivoEntregaCEAPA={formData.motivoEntregaCEAPA}
        latitudeSoltura={formData.latitudeSoltura}
        longitudeSoltura={formData.longitudeSoltura}
        outroDestinacao={formData.outroDestinacao}
        onNumeroTermoEntregaChange={handleChange}
        onHoraGuardaCEAPAChange={handleChange}
        onMotivoEntregaCEAPAChange={handleChange}
        onLatitudeSolturaChange={handleChange}
        onLongitudeSolturaChange={handleChange}
        onOutroDestinacaoChange={handleChange}
        error={errors.destinacao?.message}
        numeroTermoEntregaError={errors.numeroTermoEntrega?.message}
        horaGuardaCEAPAError={errors.horaGuardaCEAPA?.message}
        motivoEntregaCEAPAError={errors.motivoEntregaCEAPA?.message}
        latitudeSolturaError={errors.latitudeSoltura?.message}
        longitudeSolturaError={errors.longitudeSoltura?.message}
        outroDestinacaoError={errors.outroDestinacao?.message}
        required={true}
      />
    </FormSection>
  );
};

export default DestinacaoSection;
