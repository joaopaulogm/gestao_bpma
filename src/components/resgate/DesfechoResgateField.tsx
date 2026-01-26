import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import { buscarDesfechosResgate, DesfechoItem } from '@/services/dimensionService';

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
  const [desfechos, setDesfechos] = useState<DesfechoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDesfechos = async () => {
      setLoading(true);
      const dados = await buscarDesfechosResgate();
      setDesfechos(dados);
      setLoading(false);
    };
    carregarDesfechos();
  }, []);

  return (
    <FormField 
      id="desfechoResgate" 
      label="Desfecho do Resgate" 
      error={error}
      required={required}
    >
      <Select 
        onValueChange={onDesfechoChange}
        value={desfechoResgate}
        disabled={loading}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={loading ? "Carregando..." : "Selecione o desfecho"} />
        </SelectTrigger>
        <SelectContent>
          {desfechos.map((desfecho) => (
            <SelectItem key={desfecho.id} value={desfecho.nome}>
              {desfecho.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default DesfechoResgateField;
