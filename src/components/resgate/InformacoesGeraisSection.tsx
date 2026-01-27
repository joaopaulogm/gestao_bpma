
import React from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import DataField from './DataField';
import HorarioAcionamentoField from './HorarioAcionamentoField';
import HorarioTerminoField from './HorarioTerminoField';
import OrigemField from './OrigemField';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import TipoAreaField from './TipoAreaField';
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

      <HorarioAcionamentoField
        value={formData.horarioAcionamento || ''}
        onChange={handleChange}
        error={errors.horarioAcionamento?.message}
        required={false}
      />

      <HorarioTerminoField
        value={formData.horarioTermino || ''}
        onChange={handleChange}
        error={errors.horarioTermino?.message}
        required={false}
      />

      <RegiaoAdministrativaField
        value={formData.regiaoAdministrativa}
        onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
        error={errors.regiaoAdministrativa?.message}
        required={true}
        regioes={regioes}
      />

      <TipoAreaField
        value={formData.tipoAreaId || ''}
        onChange={(value) => handleSelectChange('tipoAreaId', value)}
        error={errors.tipoAreaId?.message}
      />

      <OrigemField
        origem={formData.origem}
        onOrigemChange={(value) => handleSelectChange('origem', value)}
        errors={{
          origem: errors.origem?.message
        }}
        required={true}
      />

      {/* Desfecho do Resgate foi movido para DesfechoResgateSection */}

      {/* Desfecho da Apreensão - apenas se origem for Apreensão */}
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
    </FormSection>
  );
};

export default InformacoesGeraisSection;
