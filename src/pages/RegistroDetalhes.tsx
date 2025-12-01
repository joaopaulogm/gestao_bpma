
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RegistroLoading from '@/components/registros/RegistroLoading';
import RegistroNotFound from '@/components/registros/RegistroNotFound';
import RegistroActionsBar from '@/components/registros/RegistroActionsBar';
import InformacoesGeraisCard from '@/components/registros/InformacoesGeraisCard';
import InformacoesEspecieCard from '@/components/registros/InformacoesEspecieCard';
import InformacoesDestinacaoCard from '@/components/registros/InformacoesDestinacaoCard';
import { Registro } from '@/types/hotspots';

const RegistroDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistro = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('registros')
          .select(`
            *,
            regiao_administrativa:dim_regiao_administrativa(nome),
            origem:dim_origem(nome),
            destinacao:dim_destinacao(nome),
            estado_saude:dim_estado_saude(nome),
            estagio_vida:dim_estagio_vida(nome),
            desfecho:dim_desfecho(nome, tipo),
            especie:dim_especies(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Process the data to ensure quantidade is calculated properly
        const processedRegistro: Registro = {
          ...data,
          quantidade_adulto: data.quantidade_adulto || 0,
          quantidade_filhote: data.quantidade_filhote || 0,
          quantidade: (data.quantidade_adulto || 0) + (data.quantidade_filhote || 0)
        };
        
        setRegistro(processedRegistro);
      } catch (error) {
        console.error('Erro ao buscar detalhes do registro:', error);
        toast.error('Erro ao carregar os detalhes do registro');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistro();
  }, [id]);

  const formatDateTime = (dateString: string) => {
    try {
      // If already in DD/MM/YYYY format
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
      }
      
      // If date is in ISO format (with T)
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return format(date, 'dd/MM/yyyy', { locale: ptBR });
        }
      }
      
      // If date is in YYYY-MM-DD format
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          // Ensure we're parsing in the correct format
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2]);
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
          }
        }
      }
      
      // Generic fallback
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };
  
  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  if (isLoading) {
    return <RegistroLoading />;
  }

  if (!registro) {
    return <RegistroNotFound />;
  }

  return (
    <Layout title={`Detalhes do Registro: ${registro.especie?.nome_popular || 'Registro'}`} showBackButton>
      <div className="space-y-6 animate-fade-in">
        <RegistroActionsBar onExportPDF={handleExportPDF} />

        <InformacoesGeraisCard 
          data={registro.data}
          regiao_administrativa={registro.regiao_administrativa?.nome || ''}
          origem={registro.origem?.nome || ''}
          latitude_origem={registro.latitude_origem}
          longitude_origem={registro.longitude_origem}
          desfecho_apreensao={registro.desfecho?.tipo === 'apreensao' ? registro.desfecho?.nome : ''}
          numero_tco={registro.numero_tco}
          outro_desfecho={registro.outro_desfecho}
          formatDateTime={formatDateTime}
        />

        <InformacoesEspecieCard 
          classe_taxonomica={registro.especie?.classe_taxonomica || ''}
          nome_cientifico={registro.especie?.nome_cientifico || ''}
          nome_popular={registro.especie?.nome_popular || ''}
          estado_saude={registro.estado_saude?.nome || ''}
          atropelamento={registro.atropelamento}
          estagio_vida={registro.estagio_vida?.nome || ''}
          quantidade={registro.quantidade || 0}
          quantidade_adulto={registro.quantidade_adulto || 0}
          quantidade_filhote={registro.quantidade_filhote || 0}
        />

        <InformacoesDestinacaoCard 
          destinacao={registro.destinacao?.nome || ''}
          numero_termo_entrega={registro.numero_termo_entrega}
          hora_guarda_ceapa={registro.hora_guarda_ceapa}
          motivo_entrega_ceapa={registro.motivo_entrega_ceapa}
          latitude_soltura={registro.latitude_soltura}
          longitude_soltura={registro.longitude_soltura}
          outro_destinacao={registro.outro_destinacao}
        />
      </div>
    </Layout>
  );
};

export default RegistroDetalhes;
