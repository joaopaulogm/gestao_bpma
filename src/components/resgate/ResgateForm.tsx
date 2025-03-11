
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ResgateFormData } from '@/schemas/resgateSchema';
import { Especie } from '@/services/especieService';
import { regioes } from '@/constants/regioes';
import ResgateFormHeader from './ResgateFormHeader';
import FormSection from './FormSection';
import RegiaoAdministrativaField from './RegiaoAdministrativaField';
import DataField from './DataField';
import OrigemField from './OrigemField';
import DesfechoApreensaoField from './DesfechoApreensaoField';
import ClasseTaxonomicaField from './ClasseTaxonomicaField';
import EspeciesField from './EspeciesField';
import EspecieDetailsPanel from './EspecieDetailsPanel';
import AnimalInfoFields from './AnimalInfoFields';
import DestinacaoField from './DestinacaoField';
import ResgateFormSubmitButton from './ResgateFormSubmitButton';

interface ResgateFormProps {
  form: UseFormReturn<ResgateFormData>;
  formData: ResgateFormData;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleQuantidadeChange: (operacao: 'aumentar' | 'diminuir') => void;
  handleFormSubmit: (data: any) => Promise<void>;
  especieSelecionada: Especie | null;
  carregandoEspecie: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
}

const ResgateForm: React.FC<ResgateFormProps> = ({
  form,
  formData,
  errors,
  handleChange,
  handleSelectChange,
  handleQuantidadeChange,
  handleFormSubmit,
  especieSelecionada,
  carregandoEspecie,
  isSubmitting,
  isEditing
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <ResgateFormHeader isEditing={isEditing} isSubmitting={isSubmitting} />
      
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormSection title="Informações Gerais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataField 
              value={formData.data}
              onChange={handleChange}
              error={errors.data?.message}
            />
            
            <RegiaoAdministrativaField 
              value={formData.regiaoAdministrativa}
              onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
              error={errors.regiaoAdministrativa?.message}
              regioes={regioes}
            />
          </div>
          
          <OrigemField 
            origem={formData.origem}
            onOrigemChange={(value) => handleSelectChange('origem', value)}
            latitudeOrigem={formData.latitudeOrigem}
            longitudeOrigem={formData.longitudeOrigem}
            onLatitudeChange={handleChange}
            onLongitudeChange={handleChange}
            errors={{
              origem: errors.origem?.message,
              latitudeOrigem: errors.latitudeOrigem?.message,
              longitudeOrigem: errors.longitudeOrigem?.message
            }}
          />
          
          {formData.origem === 'Apreensão' && (
            <DesfechoApreensaoField 
              desfechoApreensao={formData.desfechoApreensao}
              onDesfechoChange={(value) => handleSelectChange('desfechoApreensao', value)}
              numeroTCO={formData.numeroTCO}
              outroDesfecho={formData.outroDesfecho}
              onNumeroTCOChange={handleChange}
              onOutroDesfechoChange={handleChange}
              errors={{
                desfechoApreensao: errors.desfechoApreensao?.message,
                numeroTCO: errors.numeroTCO?.message,
                outroDesfecho: errors.outroDesfecho?.message
              }}
            />
          )}
        </FormSection>
        
        <FormSection title="Espécie">
          <ClasseTaxonomicaField 
            value={formData.classeTaxonomica}
            onChange={(value) => handleSelectChange('classeTaxonomica', value)}
            error={errors.classeTaxonomica?.message}
          />
          
          {formData.classeTaxonomica && (
            <div className="space-y-6">
              <EspeciesField 
                classeTaxonomica={formData.classeTaxonomica}
                value={formData.especieId}
                onChange={(value) => handleSelectChange('especieId', value)}
                error={errors.especieId?.message}
                isLoading={carregandoEspecie}
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
        
        <FormSection title="Informações do Animal">
          <AnimalInfoFields 
            estadoSaude={formData.estadoSaude}
            atropelamento={formData.atropelamento}
            estagioVida={formData.estagioVida}
            quantidade={formData.quantidade}
            onEstadoSaudeChange={(value) => handleSelectChange('estadoSaude', value)}
            onAtropelamentoChange={(value) => handleSelectChange('atropelamento', value)}
            onEstagioVidaChange={(value) => handleSelectChange('estagioVida', value)}
            onQuantidadeChange={handleQuantidadeChange}
            errorEstadoSaude={errors.estadoSaude?.message}
            errorAtropelamento={errors.atropelamento?.message}
            errorEstagioVida={errors.estagioVida?.message}
          />
        </FormSection>
        
        <FormSection title="Destinação">
          <DestinacaoField 
            destinacao={formData.destinacao}
            onDestinacaoChange={(value) => handleSelectChange('destinacao', value)}
            numeroTermoEntrega={formData.numeroTermoEntrega}
            horaGuardaCEAPA={formData.horaGuardaCEAPA}
            motivoEntregaCEAPA={formData.motivoEntregaCEAPA}
            latitudeSoltura={formData.latitudeSoltura}
            longitudeSoltura={formData.longitudeSoltura}
            outroDestinacao={formData.outroDestinacao}
            onNumeroTermoEntregaChange={handleChange}
            onHoraGuardaCEAPAChange={handleChange}
            onMotivoEntregaCEAPAChange={handleChange}
            onLatitudeSolturaChange={handleChange}
            onLongitudeSolturaChange={handleChange}
            onOutroDestinacaoChange={handleChange}
            error={errors.destinacao?.message}
            numeroTermoEntregaError={errors.numeroTermoEntrega?.message}
            horaGuardaCEAPAError={errors.horaGuardaCEAPA?.message}
            motivoEntregaCEAPAError={errors.motivoEntregaCEAPA?.message}
            latitudeSolturaError={errors.latitudeSoltura?.message}
            longitudeSolturaError={errors.longitudeSoltura?.message}
            outroDestinacaoError={errors.outroDestinacao?.message}
          />
        </FormSection>
        
        <ResgateFormSubmitButton 
          isSubmitting={isSubmitting} 
          isEditing={isEditing}
        />
      </form>
    </div>
  );
};

export default ResgateForm;
