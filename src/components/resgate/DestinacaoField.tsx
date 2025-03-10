
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
  errors?: {
    destinacao?: string;
    numeroTermoEntrega?: string;
    horaGuardaCEAPA?: string;
    motivoEntregaCEAPA?: string;
    latitudeSoltura?: string;
    longitudeSoltura?: string;
    outroDestinacao?: string;
  };
  required?: boolean;
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
  onTextareaChange,
  errors = {},
  required = false
}) => {
  return (
    <FormSection>
      <FormField id="destinacao" label="Destinação" error={errors.destinacao} required={required}>
        <Select 
          onValueChange={onDestinacaoChange}
          value={destinacao}
        >
          <SelectTrigger className={errors.destinacao ? "border-red-500" : ""}>
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
        <FormField id="numeroTermoEntrega" label="Nº Termo de Entrega" error={errors.numeroTermoEntrega} required={required}>
          <Input
            id="numeroTermoEntrega"
            name="numeroTermoEntrega"
            value={numeroTermoEntrega}
            onChange={onInputChange}
            className={errors.numeroTermoEntrega ? "border-red-500" : ""}
          />
        </FormField>
      )}
      
      {destinacao === 'CEAPA/BPMA' && (
        <>
          <FormField id="horaGuardaCEAPA" label="Hora de Guarda no CEAPA" error={errors.horaGuardaCEAPA} required={required}>
            <Input
              id="horaGuardaCEAPA"
              name="horaGuardaCEAPA"
              value={horaGuardaCEAPA}
              onChange={onInputChange}
              placeholder="HH:MM (formato 24h)"
              className={errors.horaGuardaCEAPA ? "border-red-500" : ""}
            />
          </FormField>
          <FormField id="motivoEntregaCEAPA" label="Motivo" error={errors.motivoEntregaCEAPA} required={required}>
            <Textarea
              id="motivoEntregaCEAPA"
              name="motivoEntregaCEAPA"
              value={motivoEntregaCEAPA}
              onChange={onTextareaChange}
              placeholder="Descreva o motivo da entrega"
              className={errors.motivoEntregaCEAPA ? "border-red-500" : ""}
            />
          </FormField>
        </>
      )}
      
      {destinacao === 'Soltura' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="latitudeSoltura" label="Latitude da Soltura (DD - Decimal Degres)" error={errors.latitudeSoltura} required={required}>
            <Input
              id="latitudeSoltura"
              name="latitudeSoltura"
              value={latitudeSoltura}
              onChange={onInputChange}
              placeholder="Ex: -15.7801"
              className={errors.latitudeSoltura ? "border-red-500" : ""}
            />
          </FormField>
          <FormField id="longitudeSoltura" label="Longitude da Soltura (DD - Decimal Degres)" error={errors.longitudeSoltura} required={required}>
            <Input
              id="longitudeSoltura"
              name="longitudeSoltura"
              value={longitudeSoltura}
              onChange={onInputChange}
              placeholder="Ex: -47.9292"
              className={errors.longitudeSoltura ? "border-red-500" : ""}
            />
          </FormField>
        </div>
      )}
      
      {destinacao === 'Outros' && (
        <FormField id="outroDestinacao" label="Especifique a Destinação" error={errors.outroDestinacao} required={required}>
          <Textarea
            id="outroDestinacao"
            name="outroDestinacao"
            value={outroDestinacao}
            onChange={onTextareaChange}
            placeholder="Descreva a destinação"
            className={errors.outroDestinacao ? "border-red-500" : ""}
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default DestinacaoField;
