
import React from 'react';
import FormSection from './FormSection';
import ClasseTaxonomicaField from './ClasseTaxonomicaField';
import EspecieField from './EspecieField';
import EspecieDetailsPanel from './EspecieDetailsPanel';
import { Especie } from '@/services/especieService';

interface EspecieTaxonomicaFieldsProps {
  classeTaxonomica: string;
  especieId: string;
  onClasseTaxonomicaChange: (value: string) => void;
  onEspecieChange: (value: string) => void;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  errors: {
    classeTaxonomica?: string;
    especieId?: string;
  };
  required?: boolean;
}

const EspecieTaxonomicaFields: React.FC<EspecieTaxonomicaFieldsProps> = ({
  classeTaxonomica,
  especieId,
  onClasseTaxonomicaChange,
  onEspecieChange,
  especieSelecionada,
  carregandoEspecie,
  errors = {},
  required = false
}) => {
  return (
    <FormSection columns={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ClasseTaxonomicaField
          value={classeTaxonomica}
          onChange={onClasseTaxonomicaChange}
          error={errors.classeTaxonomica}
          required={required}
        />
        
        <EspecieField
          classeTaxonomica={classeTaxonomica}
          value={especieId}
          onChange={onEspecieChange}
          error={errors.especieId}
          required={required}
        />
      </div>
      
      <EspecieDetailsPanel 
        especie={especieSelecionada} 
        isLoading={carregandoEspecie} 
      />
    </FormSection>
  );
};

export default EspecieTaxonomicaFields;
