
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
  errors?: {
    estadoSaude?: string;
    atropelamento?: string;
    estagioVida?: string;
    quantidade?: string;
  };
  required?: boolean;
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
  onQuantidadeIncrease,
  errors = {},
  required = false
}) => {
  return (
    <FormSection>
      <FormField id="estadoSaude" label="Estado de Saúde" error={errors.estadoSaude} required={required}>
        <Select 
          onValueChange={onEstadoSaudeChange}
          value={estadoSaude}
        >
          <SelectTrigger className={errors.estadoSaude ? "border-red-500" : ""}>
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
        <Label className="flex items-center">
          Animal sofreu atropelamento?
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {errors.atropelamento && (
          <div className="text-red-500 text-sm">{errors.atropelamento}</div>
        )}
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
      
      <FormField id="estagioVida" label="Estágio da Vida" error={errors.estagioVida} required={required}>
        <Select 
          onValueChange={onEstagioVidaChange}
          value={estagioVida}
        >
          <SelectTrigger className={errors.estagioVida ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione o estágio da vida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Adulto">Adulto</SelectItem>
            <SelectItem value="Filhote">Filhote</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      <FormField id="quantidade" label="Quantidade" error={errors.quantidade} required={required}>
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
            className={`text-center ${errors.quantidade ? "border-red-500" : ""}`}
            min="1"
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
