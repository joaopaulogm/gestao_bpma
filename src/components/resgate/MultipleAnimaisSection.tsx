
import React from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Especie } from '@/services/especieService';
import { AnimalItem } from '@/schemas/resgateSchema';
import FormSection from './FormSection';
import EspecieTaxonomicaFields from './EspecieTaxonomicaFields';
import AnimalInfoFields from './AnimalInfoFields';
import { AlertTriangle } from 'lucide-react';

interface MultipleAnimaisSectionProps {
  animais: AnimalItem[];
  onAddAnimal: () => void;
  onRemoveAnimal: (index: number) => void;
  onUpdateAnimal: (index: number, field: string, value: any) => void;
  onQuantidadeChange: (index: number, tipo: 'adulto' | 'filhote', operacao: 'aumentar' | 'diminuir') => void;
  errors: any;
  especiesSelecionadas: (Especie | null)[];
  carregandoEspecies: boolean[];
  onBuscarDetalhesEspecie: (index: number, especieId: string) => void;
  isEvadido?: boolean;
}

const MultipleAnimaisSection: React.FC<MultipleAnimaisSectionProps> = ({
  animais,
  onAddAnimal,
  onRemoveAnimal,
  onUpdateAnimal,
  onQuantidadeChange,
  errors,
  especiesSelecionadas,
  carregandoEspecies,
  onBuscarDetalhesEspecie,
  isEvadido = false,
}) => {
  return (
    <FormSection title="Animais">
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

      {animais.length === 0 && (
        <div className="p-4 border border-dashed rounded-md bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Nenhum animal adicionado</p>
        </div>
      )}

      {animais.map((animal, index) => (
        <Card key={index} className="p-4 mb-4 relative">
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveAnimal(index)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remover animal</span>
            </Button>
          </div>

          <h3 className="text-md font-medium mb-4">Animal {index + 1}</h3>
          
          <div className="space-y-4">
            <EspecieTaxonomicaFields
              classeTaxonomica={animal.classeTaxonomica || ''}
              especieId={animal.especieId || ''}
              onClasseTaxonomicaChange={(value) => onUpdateAnimal(index, 'classeTaxonomica', value)}
              onEspecieChange={(value) => {
                onUpdateAnimal(index, 'especieId', value);
                onBuscarDetalhesEspecie(index, value);
              }}
              especieSelecionada={especiesSelecionadas[index]}
              carregandoEspecie={carregandoEspecies[index]}
              errors={{
                classeTaxonomica: errors[`animais.${index}.classeTaxonomica`]?.message,
                especieId: errors[`animais.${index}.especieId`]?.message
              }}
              required={!isEvadido}
            />
            
            <AnimalInfoFields
              estadoSaude={animal.estadoSaude || ''}
              atropelamento={animal.atropelamento || ''}
              estagioVida={animal.estagioVida || ''}
              quantidadeAdulto={animal.quantidadeAdulto}
              quantidadeFilhote={animal.quantidadeFilhote}
              quantidade={animal.quantidade}
              onEstadoSaudeChange={value => onUpdateAnimal(index, 'estadoSaude', value)}
              onAtropelamentoChange={value => onUpdateAnimal(index, 'atropelamento', value)}
              onEstagioVidaChange={value => onUpdateAnimal(index, 'estagioVida', value)}
              onQuantidadeChange={(tipo, operacao) => onQuantidadeChange(index, tipo, operacao)}
              errorEstadoSaude={errors[`animais.${index}.estadoSaude`]?.message}
              errorAtropelamento={errors[`animais.${index}.atropelamento`]?.message}
              errorEstagioVida={errors[`animais.${index}.estagioVida`]?.message}
              errorQuantidadeAdulto={errors[`animais.${index}.quantidadeAdulto`]?.message}
              errorQuantidadeFilhote={errors[`animais.${index}.quantidadeFilhote`]?.message}
              required={!isEvadido}
              isEvadido={isEvadido}
            />
            
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={onAddAnimal}
              >
                <Plus className="h-4 w-4" />
                Incluir outro animal
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full mt-2"
        onClick={onAddAnimal}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar outro animal
      </Button>
    </FormSection>
  );
};

export default MultipleAnimaisSection;
