import React from 'react';
import Layout from '@/components/Layout';
import { FormProvider } from 'react-hook-form';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { regioes } from '@/constants/regioes';

// Component imports
import ResgateFormHeader from '@/components/resgate/ResgateFormHeader';
import ResgateFormSubmitButton from '@/components/resgate/ResgateFormSubmitButton';
import DataField from '@/components/resgate/DataField';
import RegiaoAdministrativaField from '@/components/resgate/RegiaoAdministrativaField';
import EspecieTaxonomicaFields from '@/components/resgate/EspecieTaxonomicaFields';
import OrigemField from '@/components/resgate/OrigemField';
import DesfechoApreensaoField from '@/components/resgate/DesfechoApreensaoField';
import AnimalInfoFields from '@/components/resgate/AnimalInfoFields';
import DestinacaoField from '@/components/resgate/DestinacaoField';

const ResgateCadastro = () => {
  const {
    form,
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit,
    especieSelecionada,
    carregandoEspecie,
    isSubmitting
  } = useFormResgateData();

  return (
    <Layout title="Registro de Atividade de Resgate de Fauna" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <ResgateFormHeader />
        
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data */}
            <DataField
              value={formData.data}
              onChange={handleChange}
              error={errors.data?.message}
              required
            />
            
            {/* Região Administrativa */}
            <RegiaoAdministrativaField
              regioes={regioes}
              value={formData.regiaoAdministrativa}
              onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
              error={errors.regiaoAdministrativa?.message}
              required
            />
            
            {/* Classe Taxonômica e Espécie */}
            <EspecieTaxonomicaFields
              classeTaxonomica={formData.classeTaxonomica}
              especieId={formData.especieId}
              onClasseTaxonomicaChange={(value) => handleSelectChange('classeTaxonomica', value)}
              onEspecieChange={(value) => handleSelectChange('especieId', value)}
              especieSelecionada={especieSelecionada}
              carregandoEspecie={carregandoEspecie}
              errors={{
                classeTaxonomica: errors.classeTaxonomica?.message,
                especieId: errors.especieId?.message
              }}
              required
            />
            
            {/* Origem e Coordenadas */}
            <OrigemField
              origem={formData.origem}
              latitudeOrigem={formData.latitudeOrigem}
              longitudeOrigem={formData.longitudeOrigem}
              onOrigemChange={(value) => handleSelectChange('origem', value)}
              onLatitudeChange={handleChange}
              onLongitudeChange={handleChange}
              errors={{
                origem: errors.origem?.message,
                latitudeOrigem: errors.latitudeOrigem?.message,
                longitudeOrigem: errors.longitudeOrigem?.message
              }}
              required
            />
            
            {/* Desfecho da Apreensão (condicional) */}
            <DesfechoApreensaoField
              origem={formData.origem}
              desfechoApreensao={formData.desfechoApreensao}
              numeroTCO={formData.numeroTCO}
              outroDesfecho={formData.outroDesfecho}
              onDesfechoChange={(value) => handleSelectChange('desfechoApreensao', value)}
              onNumeroTCOChange={handleChange}
              onOutroDesfechoChange={handleChange}
              errors={{
                desfechoApreensao: errors.desfechoApreensao?.message,
                numeroTCO: errors.numeroTCO?.message,
                outroDesfecho: errors.outroDesfecho?.message
              }}
              required
            />
            
            {/* Estado de Saúde, Atropelamento, Estágio da Vida, Quantidade */}
            <AnimalInfoFields
              estadoSaude={formData.estadoSaude}
              atropelamento={formData.atropelamento}
              estagioVida={formData.estagioVida}
              quantidade={formData.quantidade}
              onEstadoSaudeChange={(value) => handleSelectChange('estadoSaude', value)}
              onAtropelamentoChange={(value) => handleSelectChange('atropelamento', value)}
              onEstagioVidaChange={(value) => handleSelectChange('estagioVida', value)}
              onQuantidadeChange={handleChange}
              onQuantidadeDecrease={() => handleQuantidadeChange('diminuir')}
              onQuantidadeIncrease={() => handleQuantidadeChange('aumentar')}
              errors={{
                estadoSaude: errors.estadoSaude?.message,
                atropelamento: errors.atropelamento?.message,
                estagioVida: errors.estagioVida?.message,
                quantidade: errors.quantidade?.message
              }}
              required
            />
            
            {/* Destinação e campos relacionados */}
            <DestinacaoField
              destinacao={formData.destinacao}
              numeroTermoEntrega={formData.numeroTermoEntrega}
              horaGuardaCEAPA={formData.horaGuardaCEAPA}
              motivoEntregaCEAPA={formData.motivoEntregaCEAPA}
              latitudeSoltura={formData.latitudeSoltura}
              longitudeSoltura={formData.longitudeSoltura}
              outroDestinacao={formData.outroDestinacao}
              onDestinacaoChange={(value) => handleSelectChange('destinacao', value)}
              onInputChange={handleChange}
              onTextareaChange={handleChange}
              errors={{
                destinacao: errors.destinacao?.message,
                numeroTermoEntrega: errors.numeroTermoEntrega?.message,
                horaGuardaCEAPA: errors.horaGuardaCEAPA?.message,
                motivoEntregaCEAPA: errors.motivoEntregaCEAPA?.message,
                latitudeSoltura: errors.latitudeSoltura?.message,
                longitudeSoltura: errors.longitudeSoltura?.message,
                outroDestinacao: errors.outroDestinacao?.message
              }}
              required
            />
            
            <ResgateFormSubmitButton isSubmitting={isSubmitting} />
          </form>
        </FormProvider>
      </div>
    </Layout>
  );
};

export default ResgateCadastro;
