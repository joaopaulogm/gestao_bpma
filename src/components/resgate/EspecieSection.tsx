
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Especie } from '@/services/especieService';
import { ResgateFormData } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import EspecieTaxonomicaFields from './EspecieTaxonomicaFields';
import AnimalInfoFields from './AnimalInfoFields';

interface EspecieSectionProps {
  formData: ResgateFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  errors: any;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  onBuscarDetalhesEspecie: (especieId: string) => void;
  isEvadido?: boolean;
}

const EspecieSection: React.FC<EspecieSectionProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  errors,
  especieSelecionada,
  carregandoEspecie,
  onBuscarDetalhesEspecie,
  isEvadido = false,
}) => {
  return (
    <FormSection title="Informações do Animal">
      {isEvadido && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Como o desfecho é "Evadido", os campos nesta seção são opcionais.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <EspecieTaxonomicaFields
          classeTaxonomica={formData.classeTaxonomica || ''}
          especieId={formData.especieId || ''}
          onClasseTaxonomicaChange={(value) => handleSelectChange('classeTaxonomica', value)}
          onEspecieChange={(value) => {
            handleSelectChange('especieId', value);
            onBuscarDetalhesEspecie(value);
          }}
          especieSelecionada={especieSelecionada}
          carregandoEspecie={carregandoEspecie}
          errors={{
            classeTaxonomica: errors.classeTaxonomica?.message,
            especieId: errors.especieId?.message
          }}
          required={!isEvadido}
        />
        
        <AnimalInfoFields
          estadoSaude={formData.estadoSaude || ''}
          atropelamento={formData.atropelamento || ''}
          estagioVida={formData.estagioVida || ''}
          quantidadeAdulto={formData.quantidadeAdulto || 0}
          quantidadeFilhote={formData.quantidadeFilhote || 0}
          quantidade={formData.quantidade || 0}
          onEstadoSaudeChange={value => handleSelectChange('estadoSaude', value)}
          onAtropelamentoChange={value => handleSelectChange('atropelamento', value)}
          onEstagioVidaChange={value => handleSelectChange('estagioVida', value)}
          onQuantidadeChange={(tipo, operacao) => {
            let novoValor = 0;
            
            if (tipo === 'adulto') {
              const atual = formData.quantidadeAdulto || 0;
              novoValor = operacao === 'aumentar' ? atual + 1 : Math.max(0, atual - 1);
              handleSelectChange('quantidadeAdulto', novoValor.toString());
            } else {
              const atual = formData.quantidadeFilhote || 0;
              novoValor = operacao === 'aumentar' ? atual + 1 : Math.max(0, atual - 1);
              handleSelectChange('quantidadeFilhote', novoValor.toString());
            }
            
            // Update total
            const novoTotal = (formData.quantidadeAdulto || 0) + (formData.quantidadeFilhote || 0);
            handleSelectChange('quantidade', novoTotal.toString());
          }}
          errorEstadoSaude={errors.estadoSaude?.message}
          errorAtropelamento={errors.atropelamento?.message}
          errorEstagioVida={errors.estagioVida?.message}
          errorQuantidadeAdulto={errors.quantidadeAdulto?.message}
          errorQuantidadeFilhote={errors.quantidadeFilhote?.message}
          required={!isEvadido}
          isEvadido={isEvadido}
        />
      </div>
    </FormSection>
  );
};

export default EspecieSection;
