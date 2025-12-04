import React, { useState, useEffect } from 'react';
import FormField from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface TipoAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

interface TipoArea {
  id: string;
  "Tipo de Área": string | null;
}

const TipoAreaField: React.FC<TipoAreaFieldProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const [tiposArea, setTiposArea] = useState<TipoArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiposArea = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const { data, error } = await supabase
          .from('dim_tipo_de_area')
          .select('id, "Tipo de Área"')
          .order('Tipo de Área', { ascending: true });

        if (error) {
          console.error('Erro ao carregar tipos de área:', error);
          setLoadError('Erro ao carregar tipos de área');
        } else if (data) {
          setTiposArea(data);
        }
      } catch (err) {
        console.error('Erro ao carregar tipos de área:', err);
        setLoadError('Erro ao carregar tipos de área');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiposArea();
  }, []);

  return (
    <FormField
      id="tipoArea"
      label="Tipo de Área"
      error={error || loadError || undefined}
      required={required}
    >
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className={error || loadError ? 'border-red-500' : ''}>
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo de área"} />
        </SelectTrigger>
        <SelectContent>
          {tiposArea.map((tipo) => (
            <SelectItem key={tipo.id} value={tipo.id}>
              {tipo["Tipo de Área"] || 'Sem nome'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default TipoAreaField;
