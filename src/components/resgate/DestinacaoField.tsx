
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

interface DestinacaoFieldProps {
  destinacao: string;
  numeroTermoEntrega: string;
  horaGuardaCEAPA: string;
  motivoEntregaCEAPA: string;
  latitudeSoltura: string;
  longitudeSoltura: string;
  outroDestinacao: string;
  onDestinacaoChange: (value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const DestinacaoField: React.FC<DestinacaoFieldProps> = ({
  destinacao,
  numeroTermoEntrega,
  horaGuardaCEAPA,
  motivoEntregaCEAPA,
  latitudeSoltura,
  longitudeSoltura,
  outroDestinacao,
  onDestinacaoChange,
  onInputChange,
  onTextareaChange
}) => {
  return (
    <FormSection>
      <FormField id="destinacao" label="Destinação">
        <Select 
          onValueChange={onDestinacaoChange}
          value={destinacao}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a destinação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
            <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
            <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
            <SelectItem value="Soltura">Soltura</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {(destinacao === 'CETAS/IBAMA' || destinacao === 'HFAUS/IBRAM') && (
        <FormField id="numeroTermoEntrega" label="Nº Termo de Entrega">
          <Input
            id="numeroTermoEntrega"
            name="numeroTermoEntrega"
            value={numeroTermoEntrega}
            onChange={onInputChange}
            required
          />
        </FormField>
      )}
      
      {destinacao === 'CEAPA/BPMA' && (
        <>
          <FormField id="horaGuardaCEAPA" label="Hora de Guarda no CEAPA">
            <Input
              id="horaGuardaCEAPA"
              name="horaGuardaCEAPA"
              value={horaGuardaCEAPA}
              onChange={onInputChange}
              placeholder="HH:MM (formato 24h)"
              required
            />
          </FormField>
          <FormField id="motivoEntregaCEAPA" label="Motivo">
            <Textarea
              id="motivoEntregaCEAPA"
              name="motivoEntregaCEAPA"
              value={motivoEntregaCEAPA}
              onChange={onTextareaChange}
              placeholder="Descreva o motivo da entrega"
              required
            />
          </FormField>
        </>
      )}
      
      {destinacao === 'Soltura' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="latitudeSoltura" label="Latitude da Soltura (DD - Decimal Degres)">
            <Input
              id="latitudeSoltura"
              name="latitudeSoltura"
              value={latitudeSoltura}
              onChange={onInputChange}
              placeholder="Ex: -15.7801"
              required
            />
          </FormField>
          <FormField id="longitudeSoltura" label="Longitude da Soltura (DD - Decimal Degres)">
            <Input
              id="longitudeSoltura"
              name="longitudeSoltura"
              value={longitudeSoltura}
              onChange={onInputChange}
              placeholder="Ex: -47.9292"
              required
            />
          </FormField>
        </div>
      )}
      
      {destinacao === 'Outros' && (
        <FormField id="outroDestinacao" label="Especifique a Destinação">
          <Textarea
            id="outroDestinacao"
            name="outroDestinacao"
            value={outroDestinacao}
            onChange={onTextareaChange}
            placeholder="Descreva a destinação"
            required
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default DestinacaoField;
