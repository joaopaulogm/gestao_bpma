
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import DataField from './DataField';
import OrigemField from './OrigemField';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import DesfechoResgateField from './DesfechoResgateField';
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
    <FormSection title="Informações Gerais" columns={true}>
      <DataField
        value={formData.data}
        onChange={handleChange}
        error={errors.data?.message}
        required={true}
      />

      <RegiaoAdministrativaField
        regiao={formData.regiaoAdministrativa}
        onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
        error={errors.regiaoAdministrativa?.message}
        required={true}
      />

      <OrigemField
        origem={formData.origem}
        latitude={formData.latitudeOrigem}
        longitude={formData.longitudeOrigem}
        onOrigemChange={(value) => handleSelectChange('origem', value)}
        onLatitudeChange={handleChange}
        onLongitudeChange={handleChange}
        errors={{
          origem: errors.origem?.message,
          latitude: errors.latitudeOrigem?.message,
          longitude: errors.longitudeOrigem?.message
        }}
        required={true}
      />

      <DesfechoResgateField
        desfechoResgate={formData.desfechoResgate}
        onDesfechoChange={(value) => handleSelectChange('desfechoResgate', value)}
        error={errors.desfechoResgate?.message}
        required={true}
      />

      {formData.origem === 'Apreensão/Resgate' && (
        <div className="col-span-full">
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
        </div>
      )}
    </FormSection>
  );
};

export default InformacoesGeraisSection;
