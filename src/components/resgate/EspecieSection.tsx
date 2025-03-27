
import React, { useEffect } from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import FormSection from './FormSection';
import ClasseTaxonomicaField from './ClasseTaxonomicaField';
import EspeciesField from './EspeciesField';
import EspecieDetailsPanel from './EspecieDetailsPanel';
import { AlertTriangle } from 'lucide-react';

interface EspecieSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  errors: any;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isEvadido?: boolean;
}

const EspecieSection: React.FC<EspecieSectionProps> = ({
  formData,
  handleSelectChange,
  errors,
  especieSelecionada,
  carregandoEspecie,
  isEvadido = false
}) => {
  // For debugging
  useEffect(() => {
    console.log("EspecieSection - classeTaxonomica atual:", formData.classeTaxonomica);
  }, [formData.classeTaxonomica]);

  return (
    <FormSection title="Espécie">
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

      <ClasseTaxonomicaField 
        value={formData.classeTaxonomica}
        onChange={(value) => handleSelectChange('classeTaxonomica', value)}
        error={errors.classeTaxonomica?.message}
        required={!isEvadido}
      />
      
      {formData.classeTaxonomica && (
        <div className="space-y-6">
          <EspeciesField 
            classeTaxonomica={formData.classeTaxonomica}
            value={formData.especieId}
            onChange={(value) => handleSelectChange('especieId', value)}
            error={errors.especieId?.message}
            isLoading={carregandoEspecie}
            required={!isEvadido}
          />
          
          {especieSelecionada && (
            <EspecieDetailsPanel 
              especie={especieSelecionada} 
              isLoading={carregandoEspecie} 
            />
          )}
        </div>
      )}
    </FormSection>
  );
};

export default EspecieSection;
