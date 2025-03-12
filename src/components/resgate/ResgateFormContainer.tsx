import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useFormResgateData } from '@/hooks/useFormResgateData';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import ResgateForm from './ResgateForm';
import { buscarEspeciePorNomeCientifico, buscarEspeciePorId } from '@/services/especieService';

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    if (editingId) {
      const registroFromState = location.state?.registro as Registro | undefined;
      
      if (registroFromState) {
        setOriginalRegistro(registroFromState);
        populateFormWithRegistro(registroFromState);
        setIsEditing(true);
      } else {
        fetchRegistro(editingId);
      }
    }
  }, [editingId, location.state]);
  
  const fetchRegistro = async (id: string) => {
    try {
      setFetchError(null);
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
      setFetchError('Não foi possível carregar o registro para edição');
      toast.error('Erro ao carregar os dados do registro');
      
      setTimeout(() => {
        navigate('/registros');
      }, 2000);
    }
  };
  
  const populateFormWithRegistro = async (registro: Registro) => {
    const formatDateForForm = (dateString: string) => {
      try {
        if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date for form:', error, dateString);
        return dateString;
      }
    };
    
    form.reset({
      regiaoAdministrativa: registro.regiao_administrativa,
      data: formatDateForForm(registro.data),
      origem: registro.origem,
      latitudeOrigem: registro.latitude_origem,
      longitudeOrigem: registro.longitude_origem,
      desfechoApreensao: registro.desfecho_apreensao || '',
      numeroTCO: registro.numero_tco || '',
      outroDesfecho: registro.outro_desfecho || '',
      classeTaxonomica: registro.classe_taxonomica,
      especieId: '',
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
    
    const especie = await buscarEspeciePorNomeCientifico(registro.nome_cientifico);
    if (especie) {
      form.setValue('especieId', especie.id);
      await buscarDetalhesEspecie(especie.id);
    } else {
      console.warn(`Espécie com nome científico "${registro.nome_cientifico}" não encontrada`);
      toast.warning("Espécie do registro original não encontrada no cadastro");
    }
  };
  
  const fetchEspecieId = async (nomeCientifico: string) => {
    try {
      const especie = await buscarEspeciePorNomeCientifico(nomeCientifico);
      
      if (especie) {
        form.setValue('especieId', especie.id);
        await buscarDetalhesEspecie(especie.id);
      } else {
        console.warn(`Espécie com nome científico "${nomeCientifico}" não encontrada`);
        toast.warning("Espécie do registro original não encontrada no cadastro");
      }
    } catch (error) {
      console.error("Erro ao buscar ID da espécie:", error);
      toast.error("Erro ao carregar dados da espécie");
    }
  };
  
  const buscarDetalhesEspecie = async (especieId: string) => {
    try {
      const especie = await buscarEspeciePorId(especieId);
      if (especie) {
        if (form.getValues('especieId') === especieId) {
          form.setValue('especieId', especieId);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes da espécie:", error);
      toast.error("Erro ao carregar detalhes da espécie");
    }
  };
  
  const handleFormSubmit = async (data: any) => {
    if (isEditing && editingId && originalRegistro) {
      try {
        const formatDateForDB = (dateString: string) => {
          try {
            const [year, month, day] = dateString.split('-').map(Number);
            const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return formattedDate;
          } catch (error) {
            console.error('Error formatting date for database:', error, dateString);
            throw new Error('Data inválida');
          }
        };
        
        const dataFormatada = formatDateForDB(data.data);
        console.log('Updating with date:', dataFormatada, 'Original value:', data.data);
        
        const { error } = await supabase
          .from('registros')
          .update({
            data: dataFormatada,
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
        
        if (error instanceof Error) {
          form.setError('root', { 
            type: 'manual',
            message: `Erro ao atualizar: ${error.message}`
          });
        }
      }
    } else {
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
      fetchError={fetchError}
    />
  );
};

export default ResgateFormContainer;
