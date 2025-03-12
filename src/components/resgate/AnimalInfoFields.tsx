
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
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidade: number;
  onEstadoSaudeChange: (value: string) => void;
  onAtropelamentoChange: (value: string) => void;
  onEstagioVidaChange: (value: string) => void;
  onQuantidadeChange: (tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  errorEstadoSaude?: string;
  errorAtropelamento?: string;
  errorEstagioVida?: string;
  errorQuantidadeAdulto?: string;
  errorQuantidadeFilhote?: string;
  required?: boolean;
}

const AnimalInfoFields: React.FC<AnimalInfoFieldsProps> = ({
  estadoSaude,
  atropelamento,
  estagioVida,
  quantidadeAdulto,
  quantidadeFilhote,
  quantidade,
  onEstadoSaudeChange,
  onAtropelamentoChange,
  onEstagioVidaChange,
  onQuantidadeChange,
  errorEstadoSaude,
  errorAtropelamento,
  errorEstagioVida,
  errorQuantidadeAdulto,
  errorQuantidadeFilhote,
  required = false
}) => {
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
            <SelectItem value="Ambos">Ambos (Mãe e filhotes)</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField id="quantidadeAdulto" label="Quantidade (Adultos)" error={errorQuantidadeAdulto}>
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 w-10 p-0"
              onClick={() => onQuantidadeChange('adulto', 'diminuir')}
            >
              -
            </Button>
            <Input
              id="quantidadeAdulto"
              name="quantidadeAdulto"
              type="number"
              value={quantidadeAdulto.toString()}
              className={`text-center ${errorQuantidadeAdulto ? "border-red-500" : ""}`}
              min="0"
              readOnly
            />
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 w-10 p-0"
              onClick={() => onQuantidadeChange('adulto', 'aumentar')}
            >
              +
            </Button>
          </div>
        </FormField>
        
        <FormField id="quantidadeFilhote" label="Quantidade (Filhotes)" error={errorQuantidadeFilhote}>
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 w-10 p-0"
              onClick={() => onQuantidadeChange('filhote', 'diminuir')}
            >
              -
            </Button>
            <Input
              id="quantidadeFilhote"
              name="quantidadeFilhote"
              type="number"
              value={quantidadeFilhote.toString()}
              className={`text-center ${errorQuantidadeFilhote ? "border-red-500" : ""}`}
              min="0"
              readOnly
            />
            <Button 
              type="button" 
              variant="outline" 
              className="h-10 w-10 p-0"
              onClick={() => onQuantidadeChange('filhote', 'aumentar')}
            >
              +
            </Button>
          </div>
        </FormField>
      </div>
      
      <FormField id="quantidadeTotal" label="Quantidade Total" required={required}>
        <Input
          id="quantidade"
          name="quantidade"
          type="number"
          value={quantidade.toString()}
          className="text-center bg-slate-50"
          readOnly
        />
      </FormField>
    </FormSection>
  );
};

export default AnimalInfoFields;
