
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import FormField from './FormField';

interface OrigemFieldProps {
  origem: string;
  latitudeOrigem: string;
  longitudeOrigem: string;
  onOrigemChange: (value: string) => void;
  onLatitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLongitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    origem?: string;
    latitudeOrigem?: string;
    longitudeOrigem?: string;
  };
  required?: boolean;
}

const ORIGENS = [
  'Resgate de Fauna',
  'Apreensão/Resgate'
];

const OrigemField: React.FC<OrigemFieldProps> = ({
  origem,
  latitudeOrigem,
  longitudeOrigem,
  onOrigemChange,
  onLatitudeChange,
  onLongitudeChange,
  errors = {},
  required = false
}) => {
  return (
    <div className="space-y-4 col-span-full">
      <FormField id="origem" label="Origem" error={errors.origem} required={required}>
        <Select value={origem} onValueChange={onOrigemChange}>
          <SelectTrigger className={errors.origem ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            {ORIGENS.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <FormField id="latitudeOrigem" label="Latitude de Origem" error={errors.latitudeOrigem} required={required}>
          <Input
            id="latitudeOrigem"
            name="latitudeOrigem"
            value={latitudeOrigem}
            onChange={onLatitudeChange}
            placeholder="-15.7801"
            className={errors.latitudeOrigem ? "border-red-500" : ""}
          />
        </FormField>

        <FormField id="longitudeOrigem" label="Longitude de Origem" error={errors.longitudeOrigem} required={required}>
          <Input
            id="longitudeOrigem"
            name="longitudeOrigem"
            value={longitudeOrigem}
            onChange={onLongitudeChange}
            placeholder="-47.9292"
            className={errors.longitudeOrigem ? "border-red-500" : ""}
          />
        </FormField>
      </div>
    </div>
  );
};

export default OrigemField;
