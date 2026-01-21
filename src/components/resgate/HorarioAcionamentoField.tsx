
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import FormField from './FormField';

interface HorarioAcionamentoFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}

const HorarioAcionamentoField: React.FC<HorarioAcionamentoFieldProps> = ({ 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <FormField 
      id="horarioAcionamento" 
      label="Horário de Acionamento" 
      error={error}
      required={required}
    >
      <Input
        id="horarioAcionamento"
        name="horarioAcionamento"
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

export default HorarioAcionamentoField;
