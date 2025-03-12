
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import DataField from './DataField';
import OrigemField from './OrigemField';
import DesfechoApreensaoField from './DesfechoApreensaoField';
import { regioes } from '@/constants/regioes';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataField 
          value={formData.data}
          onChange={handleChange}
          error={errors.data?.message}
          required={true}
        />
        
        <RegiaoAdministrativaField 
          value={formData.regiaoAdministrativa}
          onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
          error={errors.regiaoAdministrativa?.message}
          regioes={regioes}
          required={true}
        />
      </div>
      
      <OrigemField 
        origem={formData.origem}
        onOrigemChange={(value) => handleSelectChange('origem', value)}
        latitudeOrigem={formData.latitudeOrigem}
        longitudeOrigem={formData.longitudeOrigem}
        onLatitudeChange={handleChange}
        onLongitudeChange={handleChange}
        errors={{
          origem: errors.origem?.message,
          latitudeOrigem: errors.latitudeOrigem?.message,
          longitudeOrigem: errors.longitudeOrigem?.message
        }}
        required={true}
      />
      
      {formData.origem === 'Apreensão' && (
        <DesfechoApreensaoField 
          desfechoApreensao={formData.desfechoApreensao}
          onDesfechoChange={(value) => handleSelectChange('desfechoApreensao', value)}
          numeroTCO={formData.numeroTCO}
          outroDesfecho={formData.outroDesfecho}
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
