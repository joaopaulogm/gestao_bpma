import React from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TIPOS_IMPEDIMENTO = [
  'Obstrução de fiscalização',
  'Impedimento de acesso',
  'Recusa de informação',
  'Falsificação de documento',
  'Omissão de dados',
  'Fraude em licenciamento',
  'Outro'
];

const TIPOS_INDICIO = [
  'Rasura',
  'Falta de dado',
  'Incoerência de informação',
  'Documento incompleto',
  'Assinatura suspeita',
  'Data inconsistente',
  'Outro'
];

export interface AdministracaoAmbientalData {
  tipoImpedimentoObstrucao: string;
  descricaoAdministracao: string;
  documentoIndicioVisual: boolean;
  tipoIndicio: string;
  materialApreendidoAdmin: boolean;
  descricaoMaterialAdmin: string;
  veiculoRelacionado: boolean;
}

interface AdministracaoAmbientalSectionProps {
  data: AdministracaoAmbientalData;
  onChange: (field: keyof AdministracaoAmbientalData, value: string | boolean) => void;
  getFieldError: (fieldName: string) => string | undefined;
}

const AdministracaoAmbientalSection: React.FC<AdministracaoAmbientalSectionProps> = ({
  data,
  onChange,
  getFieldError
}) => {
  return (
    <FormSection title="Informações Específicas – Administração Ambiental">
      <FormField
        id="tipoImpedimentoObstrucao"
        label="Tipo de Impedimento ou Obstrução"
        required
        error={getFieldError('tipoImpedimentoObstrucao')}
      >
        <Select
          value={data.tipoImpedimentoObstrucao || ''}
          onValueChange={(value) => onChange('tipoImpedimentoObstrucao', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de impedimento" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_IMPEDIMENTO.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        id="descricaoAdministracao"
        label="Descrição Objetiva"
        error={getFieldError('descricaoAdministracao')}
      >
        <Textarea
          id="descricaoAdministracao"
          placeholder="Descreva objetivamente a situação..."
          value={data.descricaoAdministracao || ''}
          onChange={(e) => onChange('descricaoAdministracao', e.target.value)}
          className="min-h-[100px] rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="documentoIndicioVisual"
            checked={data.documentoIndicioVisual || false}
            onCheckedChange={(checked) => onChange('documentoIndicioVisual', checked)}
          />
          <Label htmlFor="documentoIndicioVisual" className="cursor-pointer text-sm">
            Documento com Indício Visual
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="materialApreendidoAdmin"
            checked={data.materialApreendidoAdmin || false}
            onCheckedChange={(checked) => onChange('materialApreendidoAdmin', checked)}
          />
          <Label htmlFor="materialApreendidoAdmin" className="cursor-pointer text-sm">
            Material Apreendido
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="veiculoRelacionado"
            checked={data.veiculoRelacionado || false}
            onCheckedChange={(checked) => onChange('veiculoRelacionado', checked)}
          />
          <Label htmlFor="veiculoRelacionado" className="cursor-pointer text-sm">
            Veículo Relacionado
          </Label>
        </div>
      </div>

      {data.documentoIndicioVisual && (
        <FormField
          id="tipoIndicio"
          label="Tipo de Indício"
          error={getFieldError('tipoIndicio')}
        >
          <Select
            value={data.tipoIndicio || ''}
            onValueChange={(value) => onChange('tipoIndicio', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de indício" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_INDICIO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      {data.materialApreendidoAdmin && (
        <FormField
          id="descricaoMaterialAdmin"
          label="Descrição do Material Apreendido"
          error={getFieldError('descricaoMaterialAdmin')}
        >
          <Input
            id="descricaoMaterialAdmin"
            placeholder="Descreva brevemente o material apreendido..."
            value={data.descricaoMaterialAdmin || ''}
            onChange={(e) => onChange('descricaoMaterialAdmin', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>
      )}
    </FormSection>
  );
};

export default AdministracaoAmbientalSection;
