
import React from 'react';
import { Input } from '@/components/ui/input';
import FormField from './FormField';
import FormSection from './FormSection';

interface DataFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

const DataField: React.FC<DataFieldProps> = ({ 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <FormSection>
      <FormField 
        id="data" 
        label="Data" 
        error={error}
        required={required}
      >
        <Input
          id="data"
          name="data"
          type="date"
          value={value}
          onChange={onChange}
          className={error ? "border-red-500" : ""}
        />
      </FormField>
    </FormSection>
  );
};

export default DataField;
