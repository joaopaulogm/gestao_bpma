
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import DataField from './DataField';
import OrigemField from './OrigemField';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import DesfechoResgateField from './DesfechoResgateField';
import DesfechoApreensaoField from './DesfechoApreensaoField';
import CoordenadasOrigemField from './CoordenadasOrigemField';
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
    <FormSection title="Informações Gerais" columns={true}>
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
        required={true}
        regioes={regioes}
      />

      <OrigemField
        origem={formData.origem}
        onOrigemChange={(value) => handleSelectChange('origem', value)}
        errors={{
          origem: errors.origem?.message
        }}
        required={true}
      />

      <DesfechoResgateField
        desfechoResgate={formData.desfechoResgate}
        onDesfechoChange={(value) => handleSelectChange('desfechoResgate', value)}
        error={errors.desfechoResgate?.message}
        required={true}
      />

      {/* Add the coordinates fields */}
      <div className="col-span-full">
        <CoordenadasOrigemField
          latitudeOrigem={formData.latitudeOrigem}
          longitudeOrigem={formData.longitudeOrigem}
          onChange={handleChange}
          errors={{
            latitudeOrigem: errors.latitudeOrigem?.message,
            longitudeOrigem: errors.longitudeOrigem?.message
          }}
          required={true}
        />
      </div>

      {formData.origem === 'Apreensão' && (
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
