import React from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TIPOS_INTERVENCAO = [
  'Construção irregular',
  'Demolição irregular',
  'Reforma irregular',
  'Terraplanagem irregular',
  'Ocupação irregular',
  'Desmatamento',
  'Pichação/Grafite',
  'Dano a patrimônio histórico',
  'Outro'
];

export interface OrdenamentoUrbanoData {
  tipoIntervencaoIrregular: string;
  estruturasEncontradas: string;
  quantidadeEstruturas: number;
  danoAlteracaoPerceptivel: string;
  maquinasPresentes: boolean;
  materialApreendidoUrbano: boolean;
  descricaoMaterialUrbano: string;
}

interface OrdenamentoUrbanoSectionProps {
  data: OrdenamentoUrbanoData;
  onChange: (field: keyof OrdenamentoUrbanoData, value: string | boolean | number) => void;
  getFieldError: (fieldName: string) => string | undefined;
}

const OrdenamentoUrbanoSection: React.FC<OrdenamentoUrbanoSectionProps> = ({
  data,
  onChange,
  getFieldError
}) => {
  return (
    <FormSection title="Informações Específicas – Ordenamento Urbano / Patrimônio">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="tipoIntervencaoIrregular"
          label="Tipo de Intervenção Irregular"
          required
          error={getFieldError('tipoIntervencaoIrregular')}
        >
          <Select
            value={data.tipoIntervencaoIrregular || ''}
            onValueChange={(value) => onChange('tipoIntervencaoIrregular', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de intervenção" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_INTERVENCAO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="quantidadeEstruturas"
          label="Quantidade de Estruturas"
          error={getFieldError('quantidadeEstruturas')}
        >
          <Input
            id="quantidadeEstruturas"
            type="number"
            min={0}
            value={data.quantidadeEstruturas || 0}
            onChange={(e) => onChange('quantidadeEstruturas', parseInt(e.target.value) || 0)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>
      </div>

      <FormField
        id="estruturasEncontradas"
        label="Estruturas Encontradas"
        error={getFieldError('estruturasEncontradas')}
      >
        <Textarea
          id="estruturasEncontradas"
          placeholder="Descreva as estruturas encontradas no local..."
          value={data.estruturasEncontradas || ''}
          onChange={(e) => onChange('estruturasEncontradas', e.target.value)}
          className="min-h-[80px] rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
        />
      </FormField>

      <FormField
        id="danoAlteracaoPerceptivel"
        label="Dano ou Alteração Perceptível"
        error={getFieldError('danoAlteracaoPerceptivel')}
      >
        <Textarea
          id="danoAlteracaoPerceptivel"
          placeholder="Descreva danos ou alterações perceptíveis..."
          value={data.danoAlteracaoPerceptivel || ''}
          onChange={(e) => onChange('danoAlteracaoPerceptivel', e.target.value)}
          className="min-h-[80px] rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="maquinasPresentes"
            checked={data.maquinasPresentes || false}
            onCheckedChange={(checked) => onChange('maquinasPresentes', checked)}
          />
          <Label htmlFor="maquinasPresentes" className="cursor-pointer">
            Máquinas Presentes
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="materialApreendidoUrbano"
            checked={data.materialApreendidoUrbano || false}
            onCheckedChange={(checked) => onChange('materialApreendidoUrbano', checked)}
          />
          <Label htmlFor="materialApreendidoUrbano" className="cursor-pointer">
            Material Apreendido
          </Label>
        </div>
      </div>

      {data.materialApreendidoUrbano && (
        <FormField
          id="descricaoMaterialUrbano"
          label="Descrição do Material Apreendido"
          error={getFieldError('descricaoMaterialUrbano')}
        >
          <Input
            id="descricaoMaterialUrbano"
            placeholder="Descreva brevemente o material apreendido..."
            value={data.descricaoMaterialUrbano || ''}
            onChange={(e) => onChange('descricaoMaterialUrbano', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default OrdenamentoUrbanoSection;
