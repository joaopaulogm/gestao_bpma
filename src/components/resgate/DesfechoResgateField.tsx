
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import FormSection from './FormSection';

interface DesfechoResgateFieldProps {
  desfechoResgate: string;
  onDesfechoChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const DesfechoResgateField: React.FC<DesfechoResgateFieldProps> = ({
  desfechoResgate,
  onDesfechoChange,
  error,
  required = false
}) => {
  return (
    <FormSection>
      <FormField 
        id="desfechoResgate" 
        label="Desfecho do Resgate" 
        error={error}
        required={required}
      >
        <Select 
          onValueChange={onDesfechoChange}
          value={desfechoResgate}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione o desfecho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Resgatado">Resgatado</SelectItem>
            <SelectItem value="Evadido">Evadido</SelectItem>
            <SelectItem value="Óbito">Óbito</SelectItem>
            <SelectItem value="Desistência do Solicitante">Desistência do Solicitante</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </FormSection>
  );
};

export default DesfechoResgateField;
