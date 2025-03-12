
import React from 'react';
import { Input } from '@/components/ui/input';
import FormField from './FormField';
import FormSection from './FormSection';

interface DataFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}

const DataField: React.FC<DataFieldProps> = ({ 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  // Ensure the date is in YYYY-MM-DD format for the input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // If the date already includes a 'T', it's in ISO format and we just need the date part
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      
      // If it's just a date string, make sure it's in the right format
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error, dateString);
      return dateString;
    }
  };

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
          value={formatDateForInput(value)}
          onChange={onChange}
          className={error ? "border-red-500 bg-red-50" : ""}
          aria-invalid={!!error}
        />
      </FormField>
    </FormSection>
  );
};

export default DataField;
