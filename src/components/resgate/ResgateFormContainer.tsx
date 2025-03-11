
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import ResgateForm from './ResgateForm';

const ResgateFormContainer = () => {
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
    <ResgateForm
      form={form}
      formData={formData}
      errors={errors}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleQuantidadeChange={handleQuantidadeChange}
      handleFormSubmit={handleFormSubmit}
      especieSelecionada={especieSelecionada}
      carregandoEspecie={carregandoEspecie}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
    />
  );
};

export default ResgateFormContainer;
