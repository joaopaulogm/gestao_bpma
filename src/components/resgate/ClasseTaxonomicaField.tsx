
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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        console.log("Buscando classes taxonômicas...");
        const classesData = await buscarClassesTaxonomicas();
        
        // Corrigir possíveis erros de digitação nas classes
        const classesCorrigidas = classesData.map(classe => {
          // Corrigir "Avém" para "Aves"
          if (classe === "Avém") return "Aves";
          return classe;
        });
        
        console.log(`Classes encontradas: ${classesCorrigidas.join(', ')}`);
        setClasses(classesCorrigidas);
      } catch (error) {
        console.error("Erro ao carregar classes taxonômicas:", error);
        setLoadError("Falha ao carregar classes taxonômicas");
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
      error={error || loadError}
      required={required}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className={error || loadError ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione a classe taxonômica" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="carregando" disabled>
              Carregando...
            </SelectItem>
          ) : loadError ? (
            <SelectItem value="erro" disabled>
              Erro: {loadError}
            </SelectItem>
          ) : classes.length === 0 ? (
            <SelectItem value="sem-classes" disabled>
              Nenhuma classe encontrada
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
