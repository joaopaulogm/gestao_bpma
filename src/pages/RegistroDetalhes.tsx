
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

interface Registro {
  id: string;
  data: string;
  regiao_administrativa: string;
  origem: string;
  latitude_origem: string;
  longitude_origem: string;
  desfecho_apreensao: string | null;
  numero_tco: string | null;
  outro_desfecho: string | null;
  classe_taxonomica: string;
  nome_cientifico: string;
  nome_popular: string;
  estado_saude: string;
  atropelamento: string;
  estagio_vida: string;
  quantidade: number;
  destinacao: string;
  numero_termo_entrega: string | null;
  hora_guarda_ceapa: string | null;
  motivo_entrega_ceapa: string | null;
  latitude_soltura: string | null;
  longitude_soltura: string | null;
  outro_destinacao: string | null;
}

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
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setRegistro(data);
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
    <Layout title={`Detalhes do Registro: ${registro.nome_popular}`} showBackButton>
      <div className="space-y-6 animate-fade-in">
        <RegistroActionsBar onExportPDF={handleExportPDF} />

        <InformacoesGeraisCard 
          data={registro.data}
          regiao_administrativa={registro.regiao_administrativa}
          origem={registro.origem}
          latitude_origem={registro.latitude_origem}
          longitude_origem={registro.longitude_origem}
          desfecho_apreensao={registro.desfecho_apreensao}
          numero_tco={registro.numero_tco}
          outro_desfecho={registro.outro_desfecho}
          formatDateTime={formatDateTime}
        />

        <InformacoesEspecieCard 
          classe_taxonomica={registro.classe_taxonomica}
          nome_cientifico={registro.nome_cientifico}
          nome_popular={registro.nome_popular}
          estado_saude={registro.estado_saude}
          atropelamento={registro.atropelamento}
          estagio_vida={registro.estagio_vida}
          quantidade={registro.quantidade}
        />

        <InformacoesDestinacaoCard 
          destinacao={registro.destinacao}
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
