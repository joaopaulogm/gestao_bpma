
import React from 'react';
import FormField from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrigemFieldProps {
  origem?: string;
  onOrigemChange: (value: string) => void;
  errors?: {
    origem?: string;
    latitudeOrigem?: string;
    longitudeOrigem?: string;
  };
  required?: boolean;
}

const OrigemField: React.FC<OrigemFieldProps> = ({ 
  origem, 
  onOrigemChange, 
  errors,
  required = false
}) => {
  return (
    <FormField
      id="origem"
      label="Origem"
      error={errors?.origem || errors?.latitudeOrigem || errors?.longitudeOrigem}
      required={required}
    >
      <Select 
        value={origem} 
        onValueChange={onOrigemChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione a origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
          <SelectItem value="Apreensão/Resgate">Apreensão/Resgate</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default OrigemField;
