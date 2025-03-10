
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { FormProvider } from 'react-hook-form';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { regioes } from '@/constants/regioes';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showFilters, setShowFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDestinacao, setFilterDestinacao] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  
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

  // Apply filters to the form data
  const applyFilters = () => {
    if (filterTipo) {
      handleSelectChange('origem', filterTipo);
    }
    
    if (filterEstado) {
      handleSelectChange('estadoSaude', filterEstado);
    }
    
    if (filterDestinacao) {
      handleSelectChange('destinacao', filterDestinacao);
    }
    
    if (filterClasse) {
      handleSelectChange('classeTaxonomica', filterClasse);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterTipo('');
    setFilterEstado('');
    setFilterDestinacao('');
    setFilterClasse('');
  };

  return (
    <Layout title="Registro de Atividade de Resgate de Fauna" showBackButton>
      <div className="mb-6">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros Rápidos
          </Button>
        </div>
        
        {showFilters && (
          <Card className="border border-fauna-border mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Pré-configurar formulário</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Select 
                  onValueChange={setFilterTipo}
                  value={filterTipo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de ocorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
                    <SelectItem value="Apreensão">Apreensão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  onValueChange={setFilterEstado}
                  value={filterEstado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado de saúde" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os estados</SelectItem>
                    <SelectItem value="Bom">Bom</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Ruim">Ruim</SelectItem>
                    <SelectItem value="Óbito">Óbito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  onValueChange={setFilterClasse}
                  value={filterClasse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Classe taxonômica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as classes</SelectItem>
                    <SelectItem value="Aves">Aves</SelectItem>
                    <SelectItem value="Mamíferos">Mamíferos</SelectItem>
                    <SelectItem value="Répteis">Répteis</SelectItem>
                    <SelectItem value="Anfíbios">Anfíbios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  onValueChange={setFilterDestinacao}
                  value={filterDestinacao}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destinação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as destinações</SelectItem>
                    <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
                    <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
                    <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
                    <SelectItem value="Soltura">Soltura</SelectItem>
                    <SelectItem value="Óbito">Óbito</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-full flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Limpar
                </Button>
                <Button
                  variant="default"
                  onClick={applyFilters}
                >
                  Aplicar aos Campos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
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
