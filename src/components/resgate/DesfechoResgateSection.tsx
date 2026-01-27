import React, { useEffect, useState } from 'react';
import FormSection from './FormSection';
import FormField from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { buscarDesfechosResgate, DesfechoItem } from '@/services/dimensionService';

interface DesfechoResgateProps {
  situacaoDesfecho: string;
  onSituacaoChange: (value: string) => void;
  animalIdentificado: boolean;
  onAnimalIdentificadoChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
}

const DesfechoResgateSection: React.FC<DesfechoResgateProps> = ({
  situacaoDesfecho,
  onSituacaoChange,
  animalIdentificado,
  onAnimalIdentificadoChange,
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
    <FormSection title="Desfecho do Resgate">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          id="situacaoDesfecho" 
          label="Situação do Desfecho" 
          error={error}
          required={required}
        >
          <Select 
            onValueChange={onSituacaoChange}
            value={situacaoDesfecho}
            disabled={loading}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={loading ? "Carregando..." : "Selecione a situação"} />
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

        <FormField 
          id="animalIdentificado" 
          label="O animal foi identificado?"
          required={required}
        >
          <RadioGroup
            value={animalIdentificado ? 'sim' : 'nao'}
            onValueChange={(value) => onAnimalIdentificadoChange(value === 'sim')}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="animal-sim" />
              <Label htmlFor="animal-sim" className="cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="animal-nao" />
              <Label htmlFor="animal-nao" className="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </FormField>
      </div>
    </FormSection>
  );
};

export default DesfechoResgateSection;
