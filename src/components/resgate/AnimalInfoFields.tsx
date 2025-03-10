
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import FormField from './FormField';
import FormSection from './FormSection';

interface AnimalInfoFieldsProps {
  estadoSaude: string;
  atropelamento: string;
  estagioVida: string;
  quantidade: number;
  onEstadoSaudeChange: (value: string) => void;
  onAtropelamentoChange: (value: string) => void;
  onEstagioVidaChange: (value: string) => void;
  onQuantidadeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantidadeDecrease: () => void;
  onQuantidadeIncrease: () => void;
}

const AnimalInfoFields: React.FC<AnimalInfoFieldsProps> = ({
  estadoSaude,
  atropelamento,
  estagioVida,
  quantidade,
  onEstadoSaudeChange,
  onAtropelamentoChange,
  onEstagioVidaChange,
  onQuantidadeChange,
  onQuantidadeDecrease,
  onQuantidadeIncrease
}) => {
  return (
    <FormSection>
      <FormField id="estadoSaude" label="Estado de Saúde">
        <Select 
          onValueChange={onEstadoSaudeChange}
          value={estadoSaude}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado de saúde" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Saudável">Saudável</SelectItem>
            <SelectItem value="Ferido">Ferido</SelectItem>
            <SelectItem value="Debilitado">Debilitado</SelectItem>
            <SelectItem value="Óbito">Óbito</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      <div className="space-y-2">
        <Label>Animal sofreu atropelamento?</Label>
        <RadioGroup 
          value={atropelamento} 
          onValueChange={onAtropelamentoChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Sim" id="atropelamento-sim" />
            <Label htmlFor="atropelamento-sim">Sim</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Não" id="atropelamento-nao" />
            <Label htmlFor="atropelamento-nao">Não</Label>
          </div>
        </RadioGroup>
      </div>
      
      <FormField id="estagioVida" label="Estágio da Vida">
        <Select 
          onValueChange={onEstagioVidaChange}
          value={estagioVida}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estágio da vida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Adulto">Adulto</SelectItem>
            <SelectItem value="Filhote">Filhote</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      <FormField id="quantidade" label="Quantidade">
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0"
            onClick={onQuantidadeDecrease}
          >
            -
          </Button>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            value={quantidade}
            onChange={onQuantidadeChange}
            className="text-center"
            min="1"
            required
          />
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0"
            onClick={onQuantidadeIncrease}
          >
            +
          </Button>
        </div>
      </FormField>
    </FormSection>
  );
};

export default AnimalInfoFields;
