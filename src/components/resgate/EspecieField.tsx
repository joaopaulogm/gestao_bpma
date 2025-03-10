
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from './FormField';
import { Especie, buscarEspeciesPorClasse } from '@/services/especieService';

interface EspecieFieldProps {
  classeTaxonomica: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const EspecieField = ({ 
  classeTaxonomica,
  value, 
  onChange, 
  error, 
  required = false 
}: EspecieFieldProps) => {
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEspecies = async () => {
      if (!classeTaxonomica) {
        setEspecies([]);
        return;
      }

      setIsLoading(true);
      try {
        const especiesData = await buscarEspeciesPorClasse(classeTaxonomica);
        setEspecies(especiesData);
      } catch (error) {
        console.error("Erro ao carregar espécies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEspecies();
  }, [classeTaxonomica]);

  return (
    <FormField
      id="especie"
      label="Espécie"
      error={error}
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
          ) : especies.length === 0 ? (
            <SelectItem value="sem-especies" disabled>
              Nenhuma espécie encontrada
            </SelectItem>
          ) : (
            especies.map((especie) => (
              <SelectItem key={especie.id} value={especie.id}>
                {especie.nome_popular} ({especie.nome_cientifico})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default EspecieField;
