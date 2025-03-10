
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import RegistrosActions from '@/components/registros/RegistrosActions';
import RegistrosFilters from '@/components/registros/RegistrosFilters';
import RegistrosTable from '@/components/registros/RegistrosTable';

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

const Registros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterDestinacao, setFilterDestinacao] = useState('all');
  const [filterClasse, setFilterClasse] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRegistros = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('registros')
          .select('*')
          .order('data', { ascending: false });
        
        if (error) throw error;
        setRegistros(data || []);
      } catch (error) {
        console.error('Erro ao buscar registros:', error);
        toast.error('Erro ao carregar os registros');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistros();
  }, []);
  
  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = searchTerm === '' || 
      registro.regiao_administrativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === 'all' || 
      registro.origem === filterTipo;
      
    const matchesEstado = filterEstado === 'all' || 
      registro.estado_saude === filterEstado;
      
    const matchesDestinacao = filterDestinacao === 'all' || 
      registro.destinacao === filterDestinacao;
      
    const matchesClasse = filterClasse === 'all' || 
      registro.classe_taxonomica === filterClasse;
    
    return matchesSearch && matchesTipo && matchesEstado && matchesDestinacao && matchesClasse;
  });

  const handleViewDetails = (id: string) => {
    navigate(`/registro-detalhes/${id}`);
  };
  
  const handleExportCSV = () => {
    const headers = [
      'Data', 'Região Administrativa', 'Tipo', 'Latitude', 'Longitude',
      'Classe Taxonômica', 'Nome Científico', 'Nome Popular',
      'Estado de Saúde', 'Atropelamento', 'Estágio de Vida', 'Quantidade',
      'Destinação'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => [
        format(new Date(registro.data), 'dd/MM/yyyy'),
        `"${registro.regiao_administrativa}"`,
        registro.origem,
        registro.latitude_origem,
        registro.longitude_origem,
        registro.classe_taxonomica,
        `"${registro.nome_cientifico}"`,
        `"${registro.nome_popular}"`,
        registro.estado_saude,
        registro.atropelamento,
        registro.estagio_vida,
        registro.quantidade,
        registro.destinacao
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_fauna_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Lista de Registros" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <RegistrosActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExportCSV={handleExportCSV}
        />
        
        {showFilters && (
          <RegistrosFilters
            filterTipo={filterTipo}
            setFilterTipo={setFilterTipo}
            filterEstado={filterEstado}
            setFilterEstado={setFilterEstado}
            filterDestinacao={filterDestinacao}
            setFilterDestinacao={setFilterDestinacao}
            filterClasse={filterClasse}
            setFilterClasse={setFilterClasse}
          />
        )}
        
        <div className="border border-fauna-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
              <span className="ml-2">Carregando registros...</span>
            </div>
          ) : (
            <RegistrosTable
              registros={filteredRegistros}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {filteredRegistros.length} de {registros.length} registros
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Registros;

