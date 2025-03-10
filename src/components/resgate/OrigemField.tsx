
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

interface OrigemFieldProps {
  origem: string;
  latitudeOrigem: string;
  longitudeOrigem: string;
  onOrigemChange: (value: string) => void;
  onLatitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLongitudeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OrigemField: React.FC<OrigemFieldProps> = ({
  origem,
  latitudeOrigem,
  longitudeOrigem,
  onOrigemChange,
  onLatitudeChange,
  onLongitudeChange
}) => {
  return (
    <FormSection>
      <FormField id="origem" label="Origem">
        <Select 
          onValueChange={onOrigemChange}
          value={origem}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
            <SelectItem value="Apreensão">Apreensão</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      
      {(origem === 'Resgate de Fauna' || origem === 'Apreensão') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="latitudeOrigem" label={`Latitude do ${origem} (DD - Decimal Degres)`}>
            <Input
              id="latitudeOrigem"
              name="latitudeOrigem"
              value={latitudeOrigem}
              onChange={onLatitudeChange}
              placeholder="Ex: -15.7801"
              required
            />
          </FormField>
          <FormField id="longitudeOrigem" label={`Longitude do ${origem} (DD - Decimal Degres)`}>
            <Input
              id="longitudeOrigem"
              name="longitudeOrigem"
              value={longitudeOrigem}
              onChange={onLongitudeChange}
              placeholder="Ex: -47.9292"
              required
            />
          </FormField>
        </div>
      )}
    </FormSection>
  );
};

export default OrigemField;
