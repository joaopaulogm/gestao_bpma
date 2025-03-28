
import React from 'react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';

interface CoordenadasOrigemFieldProps {
  latitudeOrigem: string;
  longitudeOrigem: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    latitudeOrigem?: string;
    longitudeOrigem?: string;
  };
  required?: boolean;
}

const CoordenadasOrigemField: React.FC<CoordenadasOrigemFieldProps> = ({
  latitudeOrigem,
  longitudeOrigem,
  onChange,
  errors,
  required = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        id="latitudeOrigem"
        label="Latitude do Resgate"
        error={errors?.latitudeOrigem}
        required={required}
      >
        <Input
          id="latitudeOrigem"
          name="latitudeOrigem"
          placeholder="Ex: -15.7801"
          value={latitudeOrigem}
          onChange={onChange}
          className={errors?.latitudeOrigem ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        id="longitudeOrigem"
        label="Longitude do Resgate"
        error={errors?.longitudeOrigem}
        required={required}
      >
        <Input
          id="longitudeOrigem"
          name="longitudeOrigem"
          placeholder="Ex: -47.9292"
          value={longitudeOrigem}
          onChange={onChange}
          className={errors?.longitudeOrigem ? 'border-red-500' : ''}
        />
      </FormField>
    </div>
  );
};

export default CoordenadasOrigemField;
