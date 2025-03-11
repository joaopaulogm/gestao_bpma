
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ResgateFormHeader from '@/components/resgate/ResgateFormHeader';
import FormSection from '@/components/resgate/FormSection';
import RegiaoAdministrativaField from '@/components/resgate/RegiaoAdministrativaField';
import DataField from '@/components/resgate/DataField';
import OrigemField from '@/components/resgate/OrigemField';
import DesfechoApreensaoField from '@/components/resgate/DesfechoApreensaoField';
import ClasseTaxonomicaField from '@/components/resgate/ClasseTaxonomicaField';
import EspeciesField from '@/components/resgate/EspeciesField';
import EspecieTaxonomicaFields from '@/components/resgate/EspecieTaxonomicaFields';
import EspecieDetailsPanel from '@/components/resgate/EspecieDetailsPanel';
import AnimalInfoFields from '@/components/resgate/AnimalInfoFields';
import DestinacaoField from '@/components/resgate/DestinacaoField';
import ResgateFormSubmitButton from '@/components/resgate/ResgateFormSubmitButton';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('editar');
  const [isEditing, setIsEditing] = useState(false);
  const [originalRegistro, setOriginalRegistro] = useState<Registro | null>(null);
  
  useEffect(() => {
    // Check if we're in edit mode and have a registro
    if (editingId) {
      const registroFromState = location.state?.registro as Registro | undefined;
      
      if (registroFromState) {
        setOriginalRegistro(registroFromState);
        populateFormWithRegistro(registroFromState);
        setIsEditing(true);
      } else {
        // If we don't have the registro in state, fetch it
        fetchRegistro(editingId);
      }
    }
  }, [editingId, location.state]);
  
  const fetchRegistro = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setOriginalRegistro(data);
        populateFormWithRegistro(data);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Erro ao buscar registro para edição:', error);
      toast.error('Erro ao carregar os dados do registro');
      navigate('/registros');
    }
  };
  
  const populateFormWithRegistro = (registro: Registro) => {
    // Populate form fields with registro data
    form.reset({
      regiaoAdministrativa: registro.regiao_administrativa,
      data: new Date(registro.data).toISOString().split('T')[0],
      origem: registro.origem,
      latitudeOrigem: registro.latitude_origem,
      longitudeOrigem: registro.longitude_origem,
      desfechoApreensao: registro.desfecho_apreensao || '',
      numeroTCO: registro.numero_tco || '',
      outroDesfecho: registro.outro_desfecho || '',
      classeTaxonomica: registro.classe_taxonomica,
      especieId: '', // This will be handled separately
      estadoSaude: registro.estado_saude,
      atropelamento: registro.atropelamento,
      estagioVida: registro.estagio_vida,
      quantidade: registro.quantidade,
      destinacao: registro.destinacao,
      numeroTermoEntrega: registro.numero_termo_entrega || '',
      horaGuardaCEAPA: registro.hora_guarda_ceapa || '',
      motivoEntregaCEAPA: registro.motivo_entrega_ceapa || '',
      latitudeSoltura: registro.latitude_soltura || '',
      longitudeSoltura: registro.longitude_soltura || '',
      outroDestinacao: registro.outro_destinacao || ''
    });
    
    // We need to fetch the especie ID based on the nome_cientifico
    fetchEspecieId(registro.nome_cientifico);
  };
  
  const fetchEspecieId = async (nomeCientifico: string) => {
    try {
      const { data, error } = await supabase
        .from('especies_fauna')
        .select('id')
        .eq('nome_cientifico', nomeCientifico)
        .single();
      
      if (error) throw error;
      
      if (data) {
        form.setValue('especieId', data.id);
      }
    } catch (error) {
      console.error('Erro ao buscar ID da espécie:', error);
      // Don't show an error toast as this is a background operation
    }
  };
  
  const handleFormSubmit = async (data: any) => {
    if (isEditing && editingId && originalRegistro) {
      try {
        // Format the date for the database
        const dataFormatada = new Date(data.data);
        
        const { error } = await supabase
          .from('registros')
          .update({
            data: dataFormatada.toISOString(),
            classe_taxonomica: data.classeTaxonomica,
            nome_cientifico: especieSelecionada?.nome_cientifico || originalRegistro.nome_cientifico,
            nome_popular: especieSelecionada?.nome_popular || originalRegistro.nome_popular,
            regiao_administrativa: data.regiaoAdministrativa,
            origem: data.origem,
            latitude_origem: data.latitudeOrigem,
            longitude_origem: data.longitudeOrigem,
            desfecho_apreensao: data.desfechoApreensao || null,
            numero_tco: data.numeroTCO || null,
            outro_desfecho: data.outroDesfecho || null,
            estado_saude: data.estadoSaude,
            atropelamento: data.atropelamento,
            estagio_vida: data.estagioVida,
            quantidade: data.quantidade,
            destinacao: data.destinacao,
            numero_termo_entrega: data.numeroTermoEntrega || null,
            hora_guarda_ceapa: data.horaGuardaCEAPA || null,
            motivo_entrega_ceapa: data.motivoEntregaCEAPA || null,
            latitude_soltura: data.latitudeSoltura || null,
            longitude_soltura: data.longitudeSoltura || null,
            outro_destinacao: data.outroDestinacao || null
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast.success('Registro atualizado com sucesso!');
        navigate('/registros');
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        toast.error('Erro ao atualizar o registro');
      }
    } else {
      // Default submission for new records
      handleSubmit(data);
    }
  };
  
  return (
    <Layout title={isEditing ? "Editar Registro" : "Cadastro de Resgate"} showBackButton>
      <div className="space-y-6 animate-fade-in">
        <ResgateFormHeader isEditing={isEditing} />
        
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormSection title="Informações Gerais" description="Dados sobre a localização e identificação do resgate">
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
              />
            </div>
            
            <OrigemField 
              value={formData.origem}
              onChange={(value) => handleSelectChange('origem', value)}
              latitudeOrigem={formData.latitudeOrigem}
              longitudeOrigem={formData.longitudeOrigem}
              onLatitudeChange={handleChange}
              onLongitudeChange={handleChange}
              error={errors.origem?.message}
              latitudeError={errors.latitudeOrigem?.message}
              longitudeError={errors.longitudeOrigem?.message}
            />
            
            {formData.origem === 'Apreensão' && (
              <DesfechoApreensaoField 
                value={formData.desfechoApreensao}
                onChange={(value) => handleSelectChange('desfechoApreensao', value)}
                numeroTCO={formData.numeroTCO}
                outroDesfecho={formData.outroDesfecho}
                onNumeroTCOChange={handleChange}
                onOutroDesfechoChange={handleChange}
                error={errors.desfechoApreensao?.message}
                numeroTCOError={errors.numeroTCO?.message}
                outroDesfechoError={errors.outroDesfecho?.message}
              />
            )}
          </FormSection>
          
          <FormSection 
            title="Espécie" 
            description="Informações taxonômicas do animal resgatado"
          >
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
                  <EspecieDetailsPanel especie={especieSelecionada} />
                )}
                
                <EspecieTaxonomicaFields 
                  nomeCientifico={especieSelecionada?.nome_cientifico || ''}
                  nomePopular={especieSelecionada?.nome_popular || ''}
                />
              </div>
            )}
          </FormSection>
          
          <FormSection 
            title="Informações do Animal" 
            description="Estado de saúde e outras informações do animal"
          >
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
          
          <FormSection 
            title="Destinação" 
            description="Para onde o animal foi encaminhado após o resgate"
          >
            <DestinacaoField 
              value={formData.destinacao}
              onChange={(value) => handleSelectChange('destinacao', value)}
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
    </Layout>
  );
};

export default ResgateCadastro;
