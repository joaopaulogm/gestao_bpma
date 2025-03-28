
import React from 'react';
import { Input } from '@/components/ui/input';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
  // Format user input as DD/MM/AAAA while typing
  const formatDateInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbersOnly = input.replace(/\D/g, '');
    
    // Add slashes while typing
    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 4) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
    }
    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
  };

  // Handle input changes with automatic formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateInput(e.target.value);
    console.log("Input changed, formatted as:", formattedDate);
    
    // Create a synthetic event to pass to the onChange handler
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  return (
    <FormSection>
      <FormField 
        id="data" 
        label="Data" 
        error={error}
        required={required}
      >
        <div className="flex w-auto">
          <Input
            id="data"
            name="data"
            type="text"
            placeholder="DD/MM/AAAA"
            value={value}
            onChange={handleInputChange}
            className={cn(
              "w-full",
              error ? "border-red-500 bg-red-50" : ""
            )}
            maxLength={10}
            aria-invalid={!!error}
          />
        </div>
      </FormField>
    </FormSection>
  );
};

export default DataField;
