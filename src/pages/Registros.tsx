
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Filter, Search, Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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

const Registros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterDestinacao, setFilterDestinacao] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
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
        
        if (error) {
          throw error;
        }
        
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
    
    const matchesTipo = filterTipo === '' || 
      registro.origem.toLowerCase() === filterTipo.toLowerCase();
      
    const matchesEstado = filterEstado === '' || 
      registro.estado_saude.toLowerCase() === filterEstado.toLowerCase();
      
    const matchesDestinacao = filterDestinacao === '' || 
      registro.destinacao.toLowerCase() === filterDestinacao.toLowerCase();
      
    const matchesClasse = filterClasse === '' || 
      registro.classe_taxonomica.toLowerCase() === filterClasse.toLowerCase();
    
    return matchesSearch && matchesTipo && matchesEstado && matchesDestinacao && matchesClasse;
  });

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/registro-detalhes/${id}`);
  };
  
  const handleExportCSV = () => {
    // Convert the data to CSV
    const headers = [
      'Data', 'Região Administrativa', 'Tipo', 'Latitude', 'Longitude',
      'Classe Taxonômica', 'Nome Científico', 'Nome Popular',
      'Estado de Saúde', 'Atropelamento', 'Estágio de Vida', 'Quantidade',
      'Destinação'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => [
        formatDateTime(registro.data),
        `"${registro.regiao_administrativa}"`, // Escape strings with quotes to handle commas
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
    
    // Create a blob and download it
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
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar por região, nome popular ou científico"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <Card className="border border-fauna-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Filtros avançados</CardTitle>
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
            </CardContent>
          </Card>
        )}
        
        <div className="border border-fauna-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-fauna-blue" />
              <span className="ml-2">Carregando registros...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Espécie</TableHead>
                    <TableHead>Nome Científico</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Estágio de Vida</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Destinação</TableHead>
                    <TableHead className="text-right">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistros.length > 0 ? (
                    filteredRegistros.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell>{formatDateTime(registro.data)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{registro.regiao_administrativa}</TableCell>
                        <TableCell>{registro.origem}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{registro.nome_popular}</TableCell>
                        <TableCell className="max-w-[150px] truncate italic">{registro.nome_cientifico}</TableCell>
                        <TableCell>{registro.classe_taxonomica}</TableCell>
                        <TableCell>{registro.estado_saude}</TableCell>
                        <TableCell>{registro.estagio_vida}</TableCell>
                        <TableCell>{registro.quantidade}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{registro.destinacao}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleViewDetails(registro.id)}
                          >
                            <Eye className="h-4 w-4 text-fauna-blue" />
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        {searchTerm || filterTipo || filterEstado || filterDestinacao || filterClasse
                          ? 'Nenhum registro encontrado com os filtros atuais.'
                          : 'Nenhum registro cadastrado ainda.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
