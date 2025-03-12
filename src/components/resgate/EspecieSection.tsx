
import React, { useEffect } from 'react';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import FormSection from './FormSection';
import ClasseTaxonomicaField from './ClasseTaxonomicaField';
import EspeciesField from './EspeciesField';
import EspecieDetailsPanel from './EspecieDetailsPanel';

interface EspecieSectionProps {
  formData: ResgateFormData;
  handleSelectChange: (name: string, value: string) => void;
  errors: any;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
}

const EspecieSection: React.FC<EspecieSectionProps> = ({
  formData,
  handleSelectChange,
  errors,
  especieSelecionada,
  carregandoEspecie
}) => {
  // For debugging
  useEffect(() => {
    console.log("EspecieSection - classeTaxonomica atual:", formData.classeTaxonomica);
  }, [formData.classeTaxonomica]);

  return (
    <FormSection title="Espécie">
      <ClasseTaxonomicaField 
        value={formData.classeTaxonomica}
        onChange={(value) => handleSelectChange('classeTaxonomica', value)}
        error={errors.classeTaxonomica?.message}
        required={true}
      />
      
      {formData.classeTaxonomica && (
        <div className="space-y-6">
          <EspeciesField 
            classeTaxonomica={formData.classeTaxonomica}
            value={formData.especieId}
            onChange={(value) => handleSelectChange('especieId', value)}
            error={errors.especieId?.message}
            isLoading={carregandoEspecie}
            required={true}
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
