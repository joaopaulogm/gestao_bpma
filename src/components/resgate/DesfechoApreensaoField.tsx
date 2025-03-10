
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
  origem: string;
  desfechoApreensao: string;
  numeroTCO: string;
  outroDesfecho: string;
  onDesfechoChange: (value: string) => void;
  onNumeroTCOChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOutroDesfechoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const DesfechoApreensaoField: React.FC<DesfechoApreensaoFieldProps> = ({
  origem,
  desfechoApreensao,
  numeroTCO,
  outroDesfecho,
  onDesfechoChange,
  onNumeroTCOChange,
  onOutroDesfechoChange
}) => {
  if (origem !== 'Apreensão') return null;

  return (
    <FormSection>
      <FormField id="desfechoApreensao" label="Desfecho da Apreensão">
        <Select 
          onValueChange={onDesfechoChange}
          value={desfechoApreensao}
        >
          <SelectTrigger>
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
        <FormField id="numeroTCO" label="Nº TCO PMDF">
          <Input
            id="numeroTCO"
            name="numeroTCO"
            value={numeroTCO}
            onChange={onNumeroTCOChange}
            required
          />
        </FormField>
      )}
      
      {desfechoApreensao === 'TCO PCDF' && (
        <FormField id="numeroTCO" label="Nº TCO PCDF">
          <Input
            id="numeroTCO"
            name="numeroTCO"
            value={numeroTCO}
            onChange={onNumeroTCOChange}
            required
          />
        </FormField>
      )}
      
      {desfechoApreensao === 'Outros' && (
        <FormField id="outroDesfecho" label="Descreva o Desfecho">
          <Textarea
            id="outroDesfecho"
            name="outroDesfecho"
            value={outroDesfecho}
            onChange={onOutroDesfechoChange}
            required
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default DesfechoApreensaoField;
