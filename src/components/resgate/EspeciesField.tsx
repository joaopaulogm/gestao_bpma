
import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import { buscarEspeciesPorClasse } from '@/services/especieService';
import type { Especie } from '@/services/especieService';

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
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loadingEspecies, setLoadingEspecies] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEspecies = async () => {
      if (!classeTaxonomica) return;
      
      setLoadingEspecies(true);
      setLoadError(null);
      
      try {
        const especiesData = await buscarEspeciesPorClasse(classeTaxonomica);
        console.log('Espécies carregadas:', especiesData);
        setEspecies(especiesData);
      } catch (error) {
        console.error("Erro ao carregar espécies:", error);
        setLoadError("Falha ao carregar espécies");
      } finally {
        setLoadingEspecies(false);
      }
    };

    fetchEspecies();
  }, [classeTaxonomica]);

  return (
    <FormField
      id="especieId"
      label="Espécie"
      error={error}
      loading={isLoading || loadingEspecies}
      required={required}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading || loadingEspecies || !classeTaxonomica}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={classeTaxonomica ? "Selecione a espécie" : "Selecione primeiro a classe taxonômica"} />
        </SelectTrigger>
        <SelectContent>
          {loadingEspecies ? (
            <SelectItem value="carregando" disabled>
              Carregando espécies...
            </SelectItem>
          ) : loadError ? (
            <SelectItem value="erro" disabled>
              Erro: {loadError}
            </SelectItem>
          ) : especies.length === 0 ? (
            <SelectItem value="sem-especies" disabled>
              Nenhuma espécie encontrada para esta classe
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

export default EspeciesField;
