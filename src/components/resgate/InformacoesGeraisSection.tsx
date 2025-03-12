
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { regioes } from '@/hooks/useFormResgateData';
import FormSection from './FormSection';
import DataField from './DataField';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import OrigemField from './OrigemField';
import DesfechoApreensaoField from './DesfechoApreensaoField';

interface InformacoesGeraisSectionProps {
  formData: ResgateFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  errors: any;
}

const InformacoesGeraisSection: React.FC<InformacoesGeraisSectionProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  errors
}) => {
  return (
    <FormSection title="Informações Gerais">
      <DataField 
        data={formData.data}
        onChange={handleChange}
        error={errors.data?.message}
        required={true}
      />
      
      <RegiaoAdministrativaField 
        regiaoAdministrativa={formData.regiaoAdministrativa}
        onRegiaoChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
        error={errors.regiaoAdministrativa?.message}
        regioes={regioes}
        required={true}
      />
      
      <OrigemField 
        origem={formData.origem}
        desfechoResgate={formData.desfechoResgate}
        latitudeOrigem={formData.latitudeOrigem}
        longitudeOrigem={formData.longitudeOrigem}
        onOrigemChange={(value) => handleSelectChange('origem', value)}
        onDesfechoResgateChange={(value) => handleSelectChange('desfechoResgate', value)}
        onLatitudeChange={handleChange}
        onLongitudeChange={handleChange}
        errors={{
          origem: errors.origem?.message,
          desfechoResgate: errors.desfechoResgate?.message,
          latitudeOrigem: errors.latitudeOrigem?.message,
          longitudeOrigem: errors.longitudeOrigem?.message
        }}
        required={true}
      />
      
      {formData.origem === 'Apreensão' && (
        <DesfechoApreensaoField 
          desfechoApreensao={formData.desfechoApreensao}
          numeroTCO={formData.numeroTCO}
          outroDesfecho={formData.outroDesfecho}
          onDesfechoChange={(value) => handleSelectChange('desfechoApreensao', value)}
          onNumeroTCOChange={handleChange}
          onOutroDesfechoChange={handleChange}
          errors={{
            desfechoApreensao: errors.desfechoApreensao?.message,
            numeroTCO: errors.numeroTCO?.message,
            outroDesfecho: errors.outroDesfecho?.message
          }}
          required={true}
        />
      )}
    </FormSection>
  );
};

export default InformacoesGeraisSection;
