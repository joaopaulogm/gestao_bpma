
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormField from '@/components/resgate/FormField';
import FormSection from '@/components/resgate/FormSection';
import RegiaoAdministrativaField from '@/components/resgate/RegiaoAdministrativaField';
import OrigemField from '@/components/resgate/OrigemField';
import DesfechoApreensaoField from '@/components/resgate/DesfechoApreensaoField';
import AnimalInfoFields from '@/components/resgate/AnimalInfoFields';
import DestinacaoField from '@/components/resgate/DestinacaoField';
import ClasseTaxonomicaField from '@/components/resgate/ClasseTaxonomicaField';
import EspecieField from '@/components/resgate/EspecieField';
import { useFormResgateData, regioes } from '@/hooks/useFormResgateData';
import { FormProvider } from 'react-hook-form';

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
    carregandoEspecie
  } = useFormResgateData();

  return (
    <Layout title="Registro de Atividade de Resgate de Fauna" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <h2 className="text-lg text-gray-600 mb-6">Preencha os dados do registro de atividade</h2>
        
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data */}
            <FormSection>
              <FormField 
                id="data" 
                label="Data" 
                error={errors.data?.message}
                required
              >
                <Input
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  className={errors.data ? "border-red-500" : ""}
                />
              </FormField>
            </FormSection>
            
            {/* Região Administrativa */}
            <FormSection>
              <RegiaoAdministrativaField
                regioes={regioes}
                value={formData.regiaoAdministrativa}
                onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
                error={errors.regiaoAdministrativa?.message}
                required
              />
            </FormSection>
            
            {/* Classe Taxonômica e Espécie */}
            <FormSection title="Informações da Espécie">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClasseTaxonomicaField
                  value={formData.classeTaxonomica}
                  onChange={(value) => handleSelectChange('classeTaxonomica', value)}
                  error={errors.classeTaxonomica?.message}
                  required
                />
                <EspecieField
                  classeTaxonomica={formData.classeTaxonomica}
                  value={formData.especieId}
                  onChange={(value) => handleSelectChange('especieId', value)}
                  error={errors.especieId?.message}
                  required
                />
              </div>
              
              {especieSelecionada && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes da Espécie Selecionada</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">Nome Científico:</span> {especieSelecionada.nome_cientifico}</div>
                    <div><span className="font-semibold">Ordem Taxonômica:</span> {especieSelecionada.ordem_taxonomica}</div>
                    <div><span className="font-semibold">Estado de Conservação:</span> {especieSelecionada.estado_de_conservacao}</div>
                    <div><span className="font-semibold">Tipo de Fauna:</span> {especieSelecionada.tipo_de_fauna}</div>
                  </div>
                </div>
              )}
            </FormSection>
            
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
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-fauna-blue hover:bg-opacity-90 text-white"
              >
                Salvar Registro
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Layout>
  );
};

export default ResgateCadastro;
