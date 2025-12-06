import React from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const TIPOS_POLUICAO = [
  'Poluição Hídrica',
  'Poluição Atmosférica',
  'Poluição do Solo',
  'Poluição Sonora',
  'Poluição Visual',
  'Resíduos Sólidos',
  'Efluentes Líquidos',
  'Outro'
];

const INTENSIDADES = [
  'Baixa',
  'Moderada',
  'Alta',
  'Muito Alta'
];

export interface PoluicaoData {
  tipoPoluicao: string;
  descricaoSituacaoPoluicao: string;
  materialVisivel: string;
  volumeAparente: string;
  origemAparente: string;
  animalAfetado: boolean;
  vegetacaoAfetada: boolean;
  alteracaoVisual: boolean;
  odorForte: boolean;
  mortandadeAnimais: boolean;
  riscoImediato: string;
  intensidadePercebida: string;
}

interface PoluicaoSectionProps {
  data: PoluicaoData;
  onChange: (field: keyof PoluicaoData, value: string | boolean) => void;
  getFieldError: (fieldName: string) => string | undefined;
}

const PoluicaoSection: React.FC<PoluicaoSectionProps> = ({
  data,
  onChange,
  getFieldError
}) => {
  return (
    <FormSection title="Informações Específicas – Crime de Poluição">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="tipoPoluicao"
          label="Tipo de Poluição Constatada"
          required
          error={getFieldError('tipoPoluicao')}
        >
          <Select
            value={data.tipoPoluicao || ''}
            onValueChange={(value) => onChange('tipoPoluicao', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de poluição" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_POLUICAO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="intensidadePercebida"
          label="Intensidade Percebida"
          required
          error={getFieldError('intensidadePercebida')}
        >
          <Select
            value={data.intensidadePercebida || ''}
            onValueChange={(value) => onChange('intensidadePercebida', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a intensidade" />
            </SelectTrigger>
            <SelectContent>
              {INTENSIDADES.map((intensidade) => (
                <SelectItem key={intensidade} value={intensidade}>
                  {intensidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="descricaoSituacaoPoluicao"
        label="Descrição Objetiva da Situação"
        error={getFieldError('descricaoSituacaoPoluicao')}
      >
        <Textarea
          id="descricaoSituacaoPoluicao"
          placeholder="Descreva objetivamente a situação encontrada..."
          value={data.descricaoSituacaoPoluicao || ''}
          onChange={(e) => onChange('descricaoSituacaoPoluicao', e.target.value)}
          className="min-h-[100px] rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="materialVisivel"
          label="Material Visível no Local"
          error={getFieldError('materialVisivel')}
        >
          <Input
            id="materialVisivel"
            placeholder="Ex: Óleo, lixo, entulho..."
            value={data.materialVisivel || ''}
            onChange={(e) => onChange('materialVisivel', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>

        <FormField
          id="volumeAparente"
          label="Volume Aparente"
          error={getFieldError('volumeAparente')}
        >
          <Input
            id="volumeAparente"
            placeholder="Ex: Aproximadamente 100 litros"
            value={data.volumeAparente || ''}
            onChange={(e) => onChange('volumeAparente', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>

        <FormField
          id="origemAparente"
          label="Origem Aparente"
          error={getFieldError('origemAparente')}
        >
          <Input
            id="origemAparente"
            placeholder="Ex: Indústria, residência, veículo..."
            value={data.origemAparente || ''}
            onChange={(e) => onChange('origemAparente', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>

        <FormField
          id="riscoImediato"
          label="Risco Imediato Percebido"
          error={getFieldError('riscoImediato')}
        >
          <Input
            id="riscoImediato"
            placeholder="Ex: Contaminação de curso d'água..."
            value={data.riscoImediato || ''}
            onChange={(e) => onChange('riscoImediato', e.target.value)}
            className="h-11 rounded-xl border-primary/15 bg-background/80 backdrop-blur-md"
          />
        </FormField>
      </div>

      {/* Campos booleanos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="animalAfetado"
            checked={data.animalAfetado || false}
            onCheckedChange={(checked) => onChange('animalAfetado', checked)}
          />
          <Label htmlFor="animalAfetado" className="cursor-pointer">
            Animal Afetado
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="vegetacaoAfetada"
            checked={data.vegetacaoAfetada || false}
            onCheckedChange={(checked) => onChange('vegetacaoAfetada', checked)}
          />
          <Label htmlFor="vegetacaoAfetada" className="cursor-pointer">
            Vegetação Afetada
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="alteracaoVisual"
            checked={data.alteracaoVisual || false}
            onCheckedChange={(checked) => onChange('alteracaoVisual', checked)}
          />
          <Label htmlFor="alteracaoVisual" className="cursor-pointer">
            Alteração Visual
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="odorForte"
            checked={data.odorForte || false}
            onCheckedChange={(checked) => onChange('odorForte', checked)}
          />
          <Label htmlFor="odorForte" className="cursor-pointer">
            Odor Forte
          </Label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15">
          <Switch
            id="mortandadeAnimais"
            checked={data.mortandadeAnimais || false}
            onCheckedChange={(checked) => onChange('mortandadeAnimais', checked)}
          />
          <Label htmlFor="mortandadeAnimais" className="cursor-pointer">
            Mortandade de Animais Visível
          </Label>
        </div>
      </div>
    </FormSection>
  );
};

export default PoluicaoSection;
