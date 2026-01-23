
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import FormField from './FormField';

interface HorarioTerminoFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}

const HorarioTerminoField: React.FC<HorarioTerminoFieldProps> = ({ 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <FormField 
      id="horarioTermino" 
      label="Horário de Término" 
      error={error}
      required={required}
    >
      <Input
        id="horarioTermino"
        name="horarioTermino"
        type="time"
        value={value}
        onChange={onChange}
        className={cn(
          "w-full",
          error ? "border-red-500 bg-red-50" : ""
        )}
        aria-invalid={!!error}
      />
    </FormField>
  );
};

export default HorarioTerminoField;
