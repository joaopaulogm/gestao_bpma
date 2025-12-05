import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CrimesAmbientaisFormData, FloraItemData, TIPOS_CRIME, ENQUADRAMENTOS, DESFECHOS, PROCEDIMENTOS_LEGAIS } from '@/schemas/crimesAmbientaisSchema';
import { regioes } from '@/constants/regioes';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import TipoAreaField from '@/components/resgate/TipoAreaField';
import FaunaSection, { FaunaItem } from './FaunaSection';
import FloraSection, { FloraItem } from './FloraSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CrimesAmbientaisFormProps {
  form: UseFormReturn<CrimesAmbientaisFormData>;
  formData: CrimesAmbientaisFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  getFieldError: (fieldName: any) => string | undefined;
  floraItems: FloraItem[];
  onFloraItemsChange: (items: FloraItem[]) => void;
  onNumeroTermoEntregaFloraChange: (value: string) => void;
  faunaItems: FaunaItem[];
  onFaunaItemsChange: (items: FaunaItem[]) => void;
}

const CrimesAmbientaisForm: React.FC<CrimesAmbientaisFormProps> = ({
  form,
  formData,
  handleChange,
  handleSelectChange,
  handleSubmit,
  isSubmitting,
  getFieldError,
  floraItems,
  onFloraItemsChange,
  onNumeroTermoEntregaFloraChange,
  faunaItems,
  onFaunaItemsChange
}) => {
  const enquadramentosDisponiveis = formData.tipoCrime ? ENQUADRAMENTOS[formData.tipoCrime as keyof typeof ENQUADRAMENTOS] || [] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Informações Gerais */}
        <FormSection title="Informações Gerais" columns>
          <FormField
            id="data"
            label="Data"
            required
            error={getFieldError('data')}
          >
            <Input
              id="data"
              name="data"
              type="date"
              value={formData.data || ''}
              onChange={handleChange}
              className={getFieldError('data') ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            id="regiaoAdministrativa"
            label="Região Administrativa"
            required
            error={getFieldError('regiaoAdministrativa')}
          >
            <Select
              value={formData.regiaoAdministrativa || ''}
              onValueChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
            >
              <SelectTrigger className={getFieldError('regiaoAdministrativa') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione a região administrativa" />
              </SelectTrigger>
              <SelectContent>
                {regioes.map((regiao) => (
                  <SelectItem key={regiao} value={regiao}>
                    {regiao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <TipoAreaField
            value={formData.tipoAreaId || ''}
            onChange={(value) => handleSelectChange('tipoAreaId', value)}
            error={getFieldError('tipoAreaId')}
          />

          <FormField
            id="latitudeOcorrencia"
            label="Latitude da Ocorrência"
            error={getFieldError('latitudeOcorrencia')}
          >
            <Input
              id="latitudeOcorrencia"
              name="latitudeOcorrencia"
              placeholder="Ex: -15.7801"
              value={formData.latitudeOcorrencia || ''}
              onChange={handleChange}
              className={getFieldError('latitudeOcorrencia') ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            id="longitudeOcorrencia"
            label="Longitude da Ocorrência"
            error={getFieldError('longitudeOcorrencia')}
          >
            <Input
              id="longitudeOcorrencia"
              name="longitudeOcorrencia"
              placeholder="Ex: -47.9292"
              value={formData.longitudeOcorrencia || ''}
              onChange={handleChange}
              className={getFieldError('longitudeOcorrencia') ? 'border-red-500' : ''}
            />
          </FormField>
        </FormSection>

        {/* Tipo de Crime e Enquadramento */}
        <FormSection columns>
          <FormField
            id="tipoCrime"
            label="Tipo de Crime"
            required
            error={getFieldError('tipoCrime')}
          >
            <Select
              value={formData.tipoCrime || ''}
              onValueChange={(value) => {
                handleSelectChange('tipoCrime', value);
                // Limpar enquadramento quando mudar tipo de crime
                if (formData.enquadramento) {
                  handleSelectChange('enquadramento', '');
                }
              }}
            >
              <SelectTrigger className={getFieldError('tipoCrime') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo de crime" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CRIME.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {formData.tipoCrime && (
            <FormField
              id="enquadramento"
              label="Enquadramento"
              required
              error={getFieldError('enquadramento')}
            >
              <Select
                value={formData.enquadramento || ''}
                onValueChange={(value) => handleSelectChange('enquadramento', value)}
              >
                <SelectTrigger className={getFieldError('enquadramento') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o enquadramento" />
                </SelectTrigger>
                <SelectContent>
                  {enquadramentosDisponiveis.map((enquadramento, index) => (
                    <SelectItem key={index} value={enquadramento}>
                      {enquadramento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </FormSection>

        {/* Ocorreu Apreensão? */}
        {formData.enquadramento && (
          <FormSection>
            <div className="flex items-center space-x-3 p-4 bg-secondary/5 rounded-lg border border-border">
              <Switch
                id="ocorreuApreensao"
                checked={formData.ocorreuApreensao || false}
                onCheckedChange={(checked) => handleSelectChange('ocorreuApreensao', String(checked))}
              />
              <Label htmlFor="ocorreuApreensao" className="text-base font-medium cursor-pointer">
                Ocorreu Apreensão?
              </Label>
            </div>
          </FormSection>
        )}

        {/* Seção de Fauna - apenas para Crime Contra a Fauna E após selecionar enquadramento (exceto "Exportar pele de...") */}
        {formData.tipoCrime === 'Crime Contra a Fauna' && 
         formData.enquadramento && 
         !formData.enquadramento.startsWith('Exportar pele de') && (
          <FaunaSection
            faunaItems={faunaItems}
            onFaunaItemsChange={onFaunaItemsChange}
            getFieldError={getFieldError}
          />
        )}

        {/* Seção de Flora - apenas para Crime Contra a Flora E após selecionar enquadramento */}
        {formData.tipoCrime === 'Crime Contra a Flora' && formData.enquadramento && (
          <FloraSection
            floraItems={floraItems}
            onFloraItemsChange={onFloraItemsChange}
            numeroTermoEntrega={formData.numeroTermoEntregaFlora || ''}
            onNumeroTermoEntregaChange={onNumeroTermoEntregaFloraChange}
            getFieldError={getFieldError}
          />
        )}

        {/* Desfecho */}
        <FormSection title="Desfecho" columns>
          <FormField
            id="desfecho"
            label="Desfecho"
            required
            error={getFieldError('desfecho')}
          >
            <Select
              value={formData.desfecho || ''}
              onValueChange={(value) => {
                handleSelectChange('desfecho', value);
                // Limpar procedimento legal se não for flagrante
                if (value !== 'Flagrante' && formData.procedimentoLegal) {
                  handleSelectChange('procedimentoLegal', '');
                }
              }}
            >
              <SelectTrigger className={getFieldError('desfecho') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o desfecho" />
              </SelectTrigger>
              <SelectContent>
                {DESFECHOS.map((desfecho) => (
                  <SelectItem key={desfecho} value={desfecho}>
                    {desfecho}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {formData.desfecho === 'Flagrante' && (
            <FormField
              id="procedimentoLegal"
              label="Procedimento Legal"
              required
              error={getFieldError('procedimentoLegal')}
            >
              <Select
                value={formData.procedimentoLegal || ''}
                onValueChange={(value) => handleSelectChange('procedimentoLegal', value)}
              >
                <SelectTrigger className={getFieldError('procedimentoLegal') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o procedimento legal" />
                </SelectTrigger>
                <SelectContent>
                  {PROCEDIMENTOS_LEGAIS.map((procedimento) => (
                    <SelectItem key={procedimento} value={procedimento}>
                      {procedimento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </FormSection>

        {/* Quantidade */}
        <FormSection title="Quantidade" columns>
          <FormField
            id="quantidadeDetidosMaiorIdade"
            label="Qtd Detidos Maior de Idade"
            error={getFieldError('quantidadeDetidosMaiorIdade')}
          >
            <Input
              id="quantidadeDetidosMaiorIdade"
              name="quantidadeDetidosMaiorIdade"
              type="number"
              min={0}
              max={1000}
              value={formData.quantidadeDetidosMaiorIdade || 0}
              onChange={handleChange}
              className={getFieldError('quantidadeDetidosMaiorIdade') ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            id="quantidadeDetidosMenorIdade"
            label="Qtd Detidos Menor de Idade"
            error={getFieldError('quantidadeDetidosMenorIdade')}
          >
            <Input
              id="quantidadeDetidosMenorIdade"
              name="quantidadeDetidosMenorIdade"
              type="number"
              min={0}
              max={1000}
              value={formData.quantidadeDetidosMenorIdade || 0}
              onChange={handleChange}
              className={getFieldError('quantidadeDetidosMenorIdade') ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            id="quantidadeLiberadosMaiorIdade"
            label="Qtd Liberados Maior de Idade"
            error={getFieldError('quantidadeLiberadosMaiorIdade')}
          >
            <Input
              id="quantidadeLiberadosMaiorIdade"
              name="quantidadeLiberadosMaiorIdade"
              type="number"
              min={0}
              max={1000}
              value={formData.quantidadeLiberadosMaiorIdade || 0}
              onChange={handleChange}
              className={getFieldError('quantidadeLiberadosMaiorIdade') ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            id="quantidadeLiberadosMenorIdade"
            label="Qtd Liberados Menor de Idade"
            error={getFieldError('quantidadeLiberadosMenorIdade')}
          >
            <Input
              id="quantidadeLiberadosMenorIdade"
              name="quantidadeLiberadosMenorIdade"
              type="number"
              min={0}
              max={1000}
              value={formData.quantidadeLiberadosMenorIdade || 0}
              onChange={handleChange}
              className={getFieldError('quantidadeLiberadosMenorIdade') ? 'border-red-500' : ''}
            />
          </FormField>
        </FormSection>

        {/* Botão de Envio */}
        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-fauna-blue hover:bg-fauna-blue/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Ocorrência
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CrimesAmbientaisForm;
