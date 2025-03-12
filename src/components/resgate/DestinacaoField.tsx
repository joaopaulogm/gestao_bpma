
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
  onNumeroTermoEntregaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHoraGuardaCEAPAChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMotivoEntregaCEAPAChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onLatitudeSolturaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLongitudeSolturaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOutroDestinacaoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  numeroTermoEntregaError?: string;
  horaGuardaCEAPAError?: string;
  motivoEntregaCEAPAError?: string;
  latitudeSolturaError?: string;
  longitudeSolturaError?: string;
  outroDestinacaoError?: string;
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
  onNumeroTermoEntregaChange,
  onHoraGuardaCEAPAChange,
  onMotivoEntregaCEAPAChange,
  onLatitudeSolturaChange,
  onLongitudeSolturaChange,
  onOutroDestinacaoChange,
  error,
  numeroTermoEntregaError,
  horaGuardaCEAPAError,
  motivoEntregaCEAPAError,
  latitudeSolturaError,
  longitudeSolturaError,
  outroDestinacaoError,
  required = false
}) => {
  return (
    <FormSection>
      <FormField id="destinacao" label="Destinação" error={error} required={required}>
        <Select 
          onValueChange={onDestinacaoChange}
          value={destinacao}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione a destinação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
            <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
            <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
            <SelectItem value="Soltura">Soltura</SelectItem>
            <SelectItem value="Vida Livre">Vida Livre</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {(destinacao === 'CETAS/IBAMA' || destinacao === 'HFAUS/IBRAM') && (
        <FormField id="numeroTermoEntrega" label="Nº Termo de Entrega" error={numeroTermoEntregaError} required={required}>
          <Input
            id="numeroTermoEntrega"
            name="numeroTermoEntrega"
            value={numeroTermoEntrega}
            onChange={onNumeroTermoEntregaChange}
            className={numeroTermoEntregaError ? "border-red-500" : ""}
          />
        </FormField>
      )}
      
      {destinacao === 'CEAPA/BPMA' && (
        <>
          <FormField id="horaGuardaCEAPA" label="Hora de Guarda no CEAPA" error={horaGuardaCEAPAError} required={required}>
            <Input
              id="horaGuardaCEAPA"
              name="horaGuardaCEAPA"
              value={horaGuardaCEAPA}
              onChange={onHoraGuardaCEAPAChange}
              placeholder="HH:MM (formato 24h)"
              className={horaGuardaCEAPAError ? "border-red-500" : ""}
            />
          </FormField>
          <FormField id="motivoEntregaCEAPA" label="Motivo" error={motivoEntregaCEAPAError} required={required}>
            <Textarea
              id="motivoEntregaCEAPA"
              name="motivoEntregaCEAPA"
              value={motivoEntregaCEAPA}
              onChange={onMotivoEntregaCEAPAChange}
              placeholder="Descreva o motivo da entrega"
              className={motivoEntregaCEAPAError ? "border-red-500" : ""}
            />
          </FormField>
        </>
      )}
      
      {destinacao === 'Soltura' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="latitudeSoltura" label="Latitude da Soltura (DD - Decimal Degres)" error={latitudeSolturaError} required={required}>
            <Input
              id="latitudeSoltura"
              name="latitudeSoltura"
              value={latitudeSoltura}
              onChange={onLatitudeSolturaChange}
              placeholder="Ex: -15.7801"
              className={latitudeSolturaError ? "border-red-500" : ""}
            />
          </FormField>
          <FormField id="longitudeSoltura" label="Longitude da Soltura (DD - Decimal Degres)" error={longitudeSolturaError} required={required}>
            <Input
              id="longitudeSoltura"
              name="longitudeSoltura"
              value={longitudeSoltura}
              onChange={onLongitudeSolturaChange}
              placeholder="Ex: -47.9292"
              className={longitudeSolturaError ? "border-red-500" : ""}
            />
          </FormField>
        </div>
      )}
      
      {destinacao === 'Outros' && (
        <FormField id="outroDestinacao" label="Especifique a Destinação" error={outroDestinacaoError} required={required}>
          <Textarea
            id="outroDestinacao"
            name="outroDestinacao"
            value={outroDestinacao}
            onChange={onOutroDestinacaoChange}
            placeholder="Descreva a destinação"
            className={outroDestinacaoError ? "border-red-500" : ""}
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default DestinacaoField;
