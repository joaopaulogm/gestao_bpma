
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
  nomePopular: string;
  especiesLista: Especie[];
  loading: boolean;
  error: string;
  onClasseTaxonomicaChange: (value: string) => void;
  onNomePopularChange: (value: string) => void;
  errors?: {
    classeTaxonomica?: string;
    nomePopular?: string;
  };
  required?: boolean;
}

const EspeciesField: React.FC<EspeciesFieldProps> = ({
  classeTaxonomica,
  nomePopular,
  especiesLista,
  loading,
  error,
  onClasseTaxonomicaChange,
  onNomePopularChange,
  errors = {},
  required = false
}) => {
  // Log para debug
  useEffect(() => {
    console.log('EspeciesField renderizado com valores:', {
      classeTaxonomica,
      nomePopular,
      especiesListaLength: especiesLista?.length || 0,
      especiesLista,
      loading,
      error
    });
  }, [classeTaxonomica, nomePopular, especiesLista, loading, error]);

  return (
    <FormSection>
      <FormField id="classeTaxonomica" label="Classe Taxonômica" error={errors.classeTaxonomica} required={required}>
        <Select 
          onValueChange={onClasseTaxonomicaChange}
          value={classeTaxonomica}
        >
          <SelectTrigger className={errors.classeTaxonomica ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione a classe taxonômica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ave">Ave</SelectItem>
            <SelectItem value="Mamífero">Mamífero</SelectItem>
            <SelectItem value="Réptil">Réptil</SelectItem>
            <SelectItem value="Peixe">Peixe</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {classeTaxonomica && (
        <FormField 
          id="nomePopular" 
          label="Nome Popular" 
          error={error || errors.nomePopular}
          loading={loading}
          required={required}
        >
          {loading ? (
            <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              Carregando espécies...
            </div>
          ) : (
            <Select 
              onValueChange={onNomePopularChange}
              value={nomePopular}
              disabled={loading || especiesLista?.length === 0}
            >
              <SelectTrigger className={errors.nomePopular ? "border-red-500" : ""}>
                <SelectValue placeholder={`Selecione a espécie de ${classeTaxonomica.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-80 bg-background">
                {Array.isArray(especiesLista) && especiesLista.length > 0 ? (
                  especiesLista.map((especie, index) => (
                    <SelectItem key={index} value={especie.nome_popular || `especie-${index}`}>
                      {especie.nome_popular || `Espécie ${index + 1}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="nenhuma-especie" disabled>
                    Nenhuma espécie encontrada
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </FormField>
      )}
    </FormSection>
  );
};

export default EspeciesField;
