
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import FormField from './FormField';
import FormSection from './FormSection';
import DesfechoResgateField from './DesfechoResgateField';

interface OrigemFieldProps {
  origem: string;
  desfechoResgate: string;
  latitudeOrigem: string;
  longitudeOrigem: string;
  onOrigemChange: (value: string) => void;
  onDesfechoResgateChange: (value: string) => void;
  onLatitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLongitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    origem?: string;
    desfechoResgate?: string;
    latitudeOrigem?: string;
    longitudeOrigem?: string;
  };
  required?: boolean;
}

const OrigemField: React.FC<OrigemFieldProps> = ({
  origem,
  desfechoResgate,
  latitudeOrigem,
  longitudeOrigem,
  onOrigemChange,
  onDesfechoResgateChange,
  onLatitudeChange,
  onLongitudeChange,
  errors = {},
  required = false
}) => {
  return (
    <FormSection>
      <FormField id="origem" label="Origem" error={errors.origem} required={required}>
        <Select 
          onValueChange={onOrigemChange}
          value={origem}
        >
          <SelectTrigger className={errors.origem ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
            <SelectItem value="Apreensão">Apreensão</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {origem === 'Resgate de Fauna' && (
        <DesfechoResgateField
          desfechoResgate={desfechoResgate}
          onDesfechoChange={onDesfechoResgateChange}
          error={errors.desfechoResgate}
          required={true}
        />
      )}
      
      {(origem === 'Resgate de Fauna' || origem === 'Apreensão') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="latitudeOrigem" label={`Latitude do ${origem} (DD - Decimal Degres)`} error={errors.latitudeOrigem} required={required}>
            <Input
              id="latitudeOrigem"
              name="latitudeOrigem"
              value={latitudeOrigem}
              onChange={onLatitudeChange}
              placeholder="Ex: -15.7801"
              className={errors.latitudeOrigem ? "border-red-500" : ""}
            />
          </FormField>
          <FormField id="longitudeOrigem" label={`Longitude do ${origem} (DD - Decimal Degres)`} error={errors.longitudeOrigem} required={required}>
            <Input
              id="longitudeOrigem"
              name="longitudeOrigem"
              value={longitudeOrigem}
              onChange={onLongitudeChange}
              placeholder="Ex: -47.9292"
              className={errors.longitudeOrigem ? "border-red-500" : ""}
            />
          </FormField>
        </div>
      )}
    </FormSection>
  );
};

export default OrigemField;
