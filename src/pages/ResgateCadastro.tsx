
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
import EspeciesField from '@/components/resgate/EspeciesField';
import { useFormResgateData, regioes } from '@/hooks/useFormResgateData';

const ResgateCadastro = () => {
  const {
    formData,
    especiesLista,
    loading,
    error,
    handleChange,
    handleSelectChange,
    handleQuantidadeChange,
    handleSubmit
  } = useFormResgateData();

  return (
    <Layout title="Registro de Atividade de Resgate de Fauna" showBackButton>
      <div className="bg-white rounded-lg border border-fauna-border p-6 animate-fade-in">
        <h2 className="text-lg text-gray-600 mb-6">Preencha os dados do registro de atividade</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data */}
          <FormSection>
            <FormField id="data" label="Data">
              <Input
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                required
              />
            </FormField>
          </FormSection>
          
          {/* Região Administrativa */}
          <FormSection>
            <RegiaoAdministrativaField
              regioes={regioes}
              value={formData.regiaoAdministrativa}
              onChange={(value) => handleSelectChange('regiaoAdministrativa', value)}
            />
          </FormSection>
          
          {/* Origem e Coordenadas */}
          <OrigemField
            origem={formData.origem}
            latitudeOrigem={formData.latitudeOrigem}
            longitudeOrigem={formData.longitudeOrigem}
            onOrigemChange={(value) => handleSelectChange('origem', value)}
            onLatitudeChange={handleChange}
            onLongitudeChange={handleChange}
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
          />
          
          {/* Classe Taxonômica e Nome Popular */}
          <EspeciesField
            classeTaxonomica={formData.classeTaxonomica}
            nomePopular={formData.nomePopular}
            especiesLista={especiesLista}
            loading={loading}
            error={error}
            onClasseTaxonomicaChange={(value) => handleSelectChange('classeTaxonomica', value)}
            onNomePopularChange={(value) => handleSelectChange('nomePopular', value)}
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
      </div>
    </Layout>
  );
};

export default ResgateCadastro;
