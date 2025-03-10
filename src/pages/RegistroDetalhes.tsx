
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
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
        navigate('/registros');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistro();
  }, [id, navigate]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const DetailsField = ({ label, value }: { label: string; value: string | number | null }) => {
    if (value === null || value === '') return null;
    
    return (
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    );
  };
  
  const handleExportPDF = () => {
    toast.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  if (isLoading) {
    return (
      <Layout title="Detalhes do Registro" showBackButton>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
          <span className="ml-2">Carregando detalhes...</span>
        </div>
      </Layout>
    );
  }

  if (!registro) {
    return (
      <Layout title="Detalhes do Registro" showBackButton>
        <div className="text-center py-32">
          <p className="text-xl text-gray-600">Registro não encontrado</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/registros')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Detalhes do Registro: ${registro.nome_popular}`} showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate('/registros')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        <Card className="border border-fauna-border">
          <CardHeader>
            <CardTitle className="text-fauna-blue">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DetailsField label="Data" value={formatDateTime(registro.data)} />
              <DetailsField label="Região Administrativa" value={registro.regiao_administrativa} />
              <DetailsField label="Origem" value={registro.origem} />
              <DetailsField label="Latitude da Origem" value={registro.latitude_origem} />
              <DetailsField label="Longitude da Origem" value={registro.longitude_origem} />
            </div>
            <div>
              {registro.origem === 'Apreensão' && (
                <>
                  <DetailsField label="Desfecho da Apreensão" value={registro.desfecho_apreensao} />
                  <DetailsField label="Número do TCO" value={registro.numero_tco} />
                  <DetailsField label="Outro Desfecho" value={registro.outro_desfecho} />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-fauna-border">
          <CardHeader>
            <CardTitle className="text-fauna-blue">Informações da Espécie</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DetailsField label="Classe Taxonômica" value={registro.classe_taxonomica} />
              <DetailsField label="Nome Científico" value={registro.nome_cientifico} />
              <DetailsField label="Nome Popular" value={registro.nome_popular} />
            </div>
            <div>
              <DetailsField label="Estado de Saúde" value={registro.estado_saude} />
              <DetailsField label="Atropelamento" value={registro.atropelamento} />
              <DetailsField label="Estágio de Vida" value={registro.estagio_vida} />
              <DetailsField label="Quantidade" value={registro.quantidade} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-fauna-border">
          <CardHeader>
            <CardTitle className="text-fauna-blue">Informações de Destinação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DetailsField label="Destinação" value={registro.destinacao} />
              <DetailsField label="Número do Termo de Entrega" value={registro.numero_termo_entrega} />
              <DetailsField label="Hora da Guarda CEAPA" value={registro.hora_guarda_ceapa} />
              <DetailsField label="Motivo da Entrega CEAPA" value={registro.motivo_entrega_ceapa} />
            </div>
            <div>
              <DetailsField label="Latitude da Soltura" value={registro.latitude_soltura} />
              <DetailsField label="Longitude da Soltura" value={registro.longitude_soltura} />
              <DetailsField label="Outras Informações de Destinação" value={registro.outro_destinacao} />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegistroDetalhes;
