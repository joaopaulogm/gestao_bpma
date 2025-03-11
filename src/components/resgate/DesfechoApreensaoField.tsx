
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import FormSection from './FormSection';

interface DesfechoApreensaoFieldProps {
  desfechoApreensao: string;
  numeroTCO: string;
  outroDesfecho: string;
  onDesfechoChange: (value: string) => void;
  onNumeroTCOChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOutroDesfechoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  errors?: {
    desfechoApreensao?: string;
    numeroTCO?: string;
    outroDesfecho?: string;
  };
  required?: boolean;
}

const DesfechoApreensaoField: React.FC<DesfechoApreensaoFieldProps> = ({
  desfechoApreensao,
  numeroTCO,
  outroDesfecho,
  onDesfechoChange,
  onNumeroTCOChange,
  onOutroDesfechoChange,
  errors = {},
  required = false
}) => {
  return (
    <FormSection>
      <FormField id="desfechoApreensao" label="Desfecho da Apreensão" error={errors.desfechoApreensao} required={required}>
        <Select 
          onValueChange={onDesfechoChange}
          value={desfechoApreensao}
        >
          <SelectTrigger className={errors.desfechoApreensao ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione o desfecho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TCO PMDF">TCO PMDF</SelectItem>
            <SelectItem value="TCO PCDF">TCO PCDF</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {desfechoApreensao === 'TCO PMDF' && (
        <FormField id="numeroTCO" label="Nº TCO PMDF" error={errors.numeroTCO} required={required}>
          <Input
            id="numeroTCO"
            name="numeroTCO"
            value={numeroTCO}
            onChange={onNumeroTCOChange}
            className={errors.numeroTCO ? "border-red-500" : ""}
          />
        </FormField>
      )}
      
      {desfechoApreensao === 'TCO PCDF' && (
        <FormField id="numeroTCO" label="Nº TCO PCDF" error={errors.numeroTCO} required={required}>
          <Input
            id="numeroTCO"
            name="numeroTCO"
            value={numeroTCO}
            onChange={onNumeroTCOChange}
            className={errors.numeroTCO ? "border-red-500" : ""}
          />
        </FormField>
      )}
      
      {desfechoApreensao === 'Outros' && (
        <FormField id="outroDesfecho" label="Descreva o Desfecho" error={errors.outroDesfecho} required={required}>
          <Textarea
            id="outroDesfecho"
            name="outroDesfecho"
            value={outroDesfecho}
            onChange={onOutroDesfechoChange}
            className={errors.outroDesfecho ? "border-red-500" : ""}
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default DesfechoApreensaoField;
