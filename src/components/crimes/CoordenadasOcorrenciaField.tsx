import React from 'react';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';

interface CoordenadasOcorrenciaFieldProps {
  latitudeOcorrencia: string;
  longitudeOcorrencia: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    latitudeOcorrencia?: string;
    longitudeOcorrencia?: string;
  };
  required?: boolean;
}

const CoordenadasOcorrenciaField: React.FC<CoordenadasOcorrenciaFieldProps> = ({
  latitudeOcorrencia,
  longitudeOcorrencia,
  onChange,
  errors,
  required = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        id="latitudeOcorrencia"
        label="Latitude da Ocorrência"
        error={errors?.latitudeOcorrencia}
        required={required}
      >
        <Input
          id="latitudeOcorrencia"
          name="latitudeOcorrencia"
          placeholder="Ex: -15.7801"
          value={latitudeOcorrencia}
          onChange={onChange}
          className={errors?.latitudeOcorrencia ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        id="longitudeOcorrencia"
        label="Longitude da Ocorrência"
        error={errors?.longitudeOcorrencia}
        required={required}
      >
        <Input
          id="longitudeOcorrencia"
          name="longitudeOcorrencia"
          placeholder="Ex: -47.9292"
          value={longitudeOcorrencia}
          onChange={onChange}
          className={errors?.longitudeOcorrencia ? 'border-red-500' : ''}
        />
      </FormField>
    </div>
  );
};

export default CoordenadasOcorrenciaField;