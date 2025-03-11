
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
  onQuantidadeChange: (operacao: 'aumentar' | 'diminuir') => void;
  errorEstadoSaude?: string;
  errorAtropelamento?: string;
  errorEstagioVida?: string;
  errorQuantidade?: string;
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
  errorEstadoSaude,
  errorAtropelamento,
  errorEstagioVida,
  errorQuantidade,
  required = false
}) => {
  const handleInputQuantidade = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a placeholder for direct input changes that we'll ignore in this component
    // The parent component handles quantity via the increase/decrease operations
    console.log("Quantidade input changed directly:", e.target.value);
  };

  return (
    <FormSection>
      <FormField id="estadoSaude" label="Estado de Saúde" error={errorEstadoSaude} required={required}>
        <Select 
          onValueChange={onEstadoSaudeChange}
          value={estadoSaude}
        >
          <SelectTrigger className={errorEstadoSaude ? "border-red-500" : ""}>
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
        {errorAtropelamento && (
          <div className="text-red-500 text-sm">{errorAtropelamento}</div>
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
      
      <FormField id="estagioVida" label="Estágio da Vida" error={errorEstagioVida} required={required}>
        <Select 
          onValueChange={onEstagioVidaChange}
          value={estagioVida}
        >
          <SelectTrigger className={errorEstagioVida ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione o estágio da vida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Adulto">Adulto</SelectItem>
            <SelectItem value="Filhote">Filhote</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      <FormField id="quantidade" label="Quantidade" error={errorQuantidade} required={required}>
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0"
            onClick={() => onQuantidadeChange('diminuir')}
          >
            -
          </Button>
          <Input
            id="quantidade"
            name="quantidade"
            type="number"
            value={quantidade.toString()}
            onChange={handleInputQuantidade}
            className={`text-center ${errorQuantidade ? "border-red-500" : ""}`}
            min="1"
            readOnly
          />
          <Button 
            type="button" 
            variant="outline" 
            className="h-10 w-10 p-0"
            onClick={() => onQuantidadeChange('aumentar')}
          >
            +
          </Button>
        </div>
      </FormField>
    </FormSection>
  );
};

export default AnimalInfoFields;
