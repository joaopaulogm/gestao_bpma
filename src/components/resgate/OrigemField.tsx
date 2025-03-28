
import React from 'react';
import { FormField } from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrigemFieldProps {
  origem?: string;
  onChange: (value: string) => void;
  error?: any;
  required?: boolean;
}

const OrigemField: React.FC<OrigemFieldProps> = ({ 
  origem, 
  onChange, 
  error,
  required = false
}) => {
  return (
    <FormField
      label="Origem *"
      error={error?.origem || error?.latitudeOrigem || error?.longitudeOrigem}
      required={required}
    >
      <Select 
        value={origem} 
        onValueChange={onChange}
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
