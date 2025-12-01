import React, { useState, useEffect } from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import ClasseTaxonomicaField from '@/components/resgate/ClasseTaxonomicaField';
import EspecieField from '@/components/resgate/EspecieField';
import EspecieDetailsPanel from '@/components/resgate/EspecieDetailsPanel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useEspecieSelector } from '@/hooks/useEspecieSelector';

interface FaunaSectionProps {
  formData: any;
  handleSelectChange: (name: string, value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getFieldError: (field: string) => string | undefined;
  estadosSaude: Array<{ id: string; nome: string }>;
  estagiosVida: Array<{ id: string; nome: string }>;
}

const FaunaSection: React.FC<FaunaSectionProps> = ({
  formData,
  handleSelectChange,
  handleChange,
  getFieldError,
  estadosSaude,
  estagiosVida
}) => {
  const { especieSelecionada, carregandoEspecie, buscarDetalhesEspecie, limparEspecie } = useEspecieSelector();

  useEffect(() => {
    if (formData.especieId) {
      buscarDetalhesEspecie(formData.especieId);
    } else {
      limparEspecie();
    }
  }, [formData.especieId]);

  const handleQuantidadeChange = (field: 'quantidadeAdulto' | 'quantidadeFilhote', increment: boolean) => {
    const currentValue = formData[field] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleSelectChange(field, String(newValue));
    
    // Atualizar total
    const otherField = field === 'quantidadeAdulto' ? 'quantidadeFilhote' : 'quantidadeAdulto';
    const otherValue = formData[otherField] || 0;
    handleSelectChange('quantidadeTotal', String(newValue + otherValue));
  };

  const handleQuantidadeObitoChange = (field: 'quantidadeAdultoObito' | 'quantidadeFilhoteObito', increment: boolean) => {
    const currentValue = formData[field] || 0;
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleSelectChange(field, String(newValue));
    
    // Atualizar total
    const otherField = field === 'quantidadeAdultoObito' ? 'quantidadeFilhoteObito' : 'quantidadeAdultoObito';
    const otherValue = formData[otherField] || 0;
    handleSelectChange('quantidadeTotalObito', String(newValue + otherValue));
  };

  return (
    <div className="space-y-6">
      <FormSection title="Identificação da Espécie" columns>
        <ClasseTaxonomicaField
          value={formData.classeTaxonomica || ''}
          onChange={(value) => {
            handleSelectChange('classeTaxonomica', value);
            handleSelectChange('especieId', ''); // Limpar espécie ao mudar classe
          }}
          error={getFieldError('classeTaxonomica')}
          required
        />
        
        <EspecieField
          classeTaxonomica={formData.classeTaxonomica || ''}
          value={formData.especieId || ''}
          onChange={(value) => handleSelectChange('especieId', value)}
          error={getFieldError('especieId')}
          required
        />

        <div className="col-span-full">
          <EspecieDetailsPanel 
            especie={especieSelecionada} 
            isLoading={carregandoEspecie} 
          />
        </div>
      </FormSection>

      <FormSection title="Informações do Animal" columns>
        <FormField
          id="estadoSaudeId"
          label="Estado de Saúde"
          required
          error={getFieldError('estadoSaudeId')}
        >
          <Select
            value={formData.estadoSaudeId || ''}
            onValueChange={(value) => handleSelectChange('estadoSaudeId', value)}
          >
            <SelectTrigger className={getFieldError('estadoSaudeId') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o estado de saúde" />
            </SelectTrigger>
            <SelectContent>
              {estadosSaude.map((estado) => (
                <SelectItem key={estado.id} value={estado.id}>
                  {estado.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="atropelamento"
          label="Animal sofreu atropelamento?"
          required
          error={getFieldError('atropelamento')}
        >
          <Select
            value={formData.atropelamento || ''}
            onValueChange={(value) => handleSelectChange('atropelamento', value)}
          >
            <SelectTrigger className={getFieldError('atropelamento') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sim">Sim</SelectItem>
              <SelectItem value="Não">Não</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="estagioVidaId"
          label="Estágio da Vida"
          required
          error={getFieldError('estagioVidaId')}
        >
          <Select
            value={formData.estagioVidaId || ''}
            onValueChange={(value) => handleSelectChange('estagioVidaId', value)}
          >
            <SelectTrigger className={getFieldError('estagioVidaId') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione o estágio da vida" />
            </SelectTrigger>
            <SelectContent>
              {estagiosVida.map((estagio) => (
                <SelectItem key={estagio.id} value={estagio.id}>
                  {estagio.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="quantidadeAdulto"
          label="Quantidade (Adultos)"
          required
          error={getFieldError('quantidadeAdulto')}
        >
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantidadeChange('quantidadeAdulto', false)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={formData.quantidadeAdulto || 0}
              readOnly
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantidadeChange('quantidadeAdulto', true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </FormField>

        <FormField
          id="quantidadeFilhote"
          label="Quantidade (Filhotes)"
          required
          error={getFieldError('quantidadeFilhote')}
        >
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantidadeChange('quantidadeFilhote', false)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={formData.quantidadeFilhote || 0}
              readOnly
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantidadeChange('quantidadeFilhote', true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </FormField>

        <FormField
          id="quantidadeTotal"
          label="Quantidade Total"
          required
          error={getFieldError('quantidadeTotal')}
        >
          <Input
            type="number"
            value={formData.quantidadeTotal || 0}
            readOnly
            className="bg-gray-50"
          />
        </FormField>
      </FormSection>

      <FormSection title="Destinação" columns>
        <FormField
          id="destinacao"
          label="Destinação"
          required
          error={getFieldError('destinacao')}
        >
          <Select
            value={formData.destinacao || ''}
            onValueChange={(value) => handleSelectChange('destinacao', value)}
          >
            <SelectTrigger className={getFieldError('destinacao') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione a destinação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CETAS-IBAMA">CETAS-IBAMA</SelectItem>
              <SelectItem value="HFAUS-IBRAM">HFAUS-IBRAM</SelectItem>
              <SelectItem value="Óbito">Óbito</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {formData.destinacao === 'Óbito' && (
          <>
            <FormField
              id="estagioVidaObito"
              label="Estágio da Vida (Óbito)"
              required
              error={getFieldError('estagioVidaObito')}
            >
              <Select
                value={formData.estagioVidaObito || ''}
                onValueChange={(value) => handleSelectChange('estagioVidaObito', value)}
              >
                <SelectTrigger className={getFieldError('estagioVidaObito') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o estágio da vida" />
                </SelectTrigger>
                <SelectContent>
                  {estagiosVida.map((estagio) => (
                    <SelectItem key={estagio.id} value={estagio.id}>
                      {estagio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="quantidadeAdultoObito"
              label="Quantidade (Adultos)"
              error={getFieldError('quantidadeAdultoObito')}
            >
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantidadeObitoChange('quantidadeAdultoObito', false)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.quantidadeAdultoObito || 0}
                  readOnly
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantidadeObitoChange('quantidadeAdultoObito', true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FormField>

            <FormField
              id="quantidadeFilhoteObito"
              label="Quantidade (Filhotes)"
              error={getFieldError('quantidadeFilhoteObito')}
            >
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantidadeObitoChange('quantidadeFilhoteObito', false)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={formData.quantidadeFilhoteObito || 0}
                  readOnly
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantidadeObitoChange('quantidadeFilhoteObito', true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FormField>

            <FormField
              id="quantidadeTotalObito"
              label="Quantidade Total"
              error={getFieldError('quantidadeTotalObito')}
            >
              <Input
                type="number"
                value={formData.quantidadeTotalObito || 0}
                readOnly
                className="bg-gray-50"
              />
            </FormField>
          </>
        )}
      </FormSection>
    </div>
  );
};

export default FaunaSection;