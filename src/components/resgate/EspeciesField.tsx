
import React, { useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import FormSection from './FormSection';

interface Especie {
  nome_popular: string;
}

interface EspeciesFieldProps {
  classeTaxonomica: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isLoading?: boolean;
  required?: boolean;
}

const EspeciesField: React.FC<EspeciesFieldProps> = ({
  classeTaxonomica,
  value,
  onChange,
  error,
  isLoading = false,
  required = false
}) => {
  // Log para debug
  useEffect(() => {
    console.log('EspeciesField renderizado com valores:', {
      classeTaxonomica,
      value
    });
  }, [classeTaxonomica, value]);

  return (
    <FormField
      id="especieId"
      label="Espécie"
      error={error}
      loading={isLoading}
      required={required}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading || !classeTaxonomica}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={classeTaxonomica ? "Selecione a espécie" : "Selecione primeiro a classe taxonômica"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="carregando" disabled>
              Carregando...
            </SelectItem>
          ) : !classeTaxonomica ? (
            <SelectItem value="selecione-classe" disabled>
              Selecione primeiro a classe taxonômica
            </SelectItem>
          ) : (
            <SelectItem value="carregando-especies" disabled>
              Carregando espécies...
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default EspeciesField;
