
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from './FormField';
import { buscarClassesTaxonomicas } from '@/services/especieService';

interface ClasseTaxonomicaFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const ClasseTaxonomicaField = ({ 
  value, 
  onChange, 
  error, 
  required = false 
}: ClasseTaxonomicaFieldProps) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const classesData = await buscarClassesTaxonomicas();
        setClasses(classesData);
      } catch (error) {
        console.error("Erro ao carregar classes taxonômicas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <FormField
      id="classeTaxonomica"
      label="Classe Taxonômica"
      error={error}
      required={required}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione a classe taxonômica" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="carregando" disabled>
              Carregando...
            </SelectItem>
          ) : (
            classes.map((classe) => (
              <SelectItem key={classe} value={classe}>
                {classe}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default ClasseTaxonomicaField;
