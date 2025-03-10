
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Filter, Search, Loader2 } from 'lucide-react';
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
  nome_popular: string;
  quantidade: number;
  estado_saude: string;
  destinacao: string;
}

const Registros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
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
      registro.nome_popular.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === '' || 
      registro.origem.toLowerCase() === filterTipo.toLowerCase();
    
    return matchesSearch && matchesTipo;
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

  return (
    <Layout title="Lista de Registros" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar por região administrativa ou espécie"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
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
                    <SelectItem value="resgate">Resgate</SelectItem>
                    <SelectItem value="apreensão">Apreensão</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input type="date" placeholder="Data inicial" />
              </div>
              
              <div>
                <Input type="date" placeholder="Data final" />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Região Administrativa</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Espécie</TableHead>
                  <TableHead className="hidden md:table-cell">Qtd.</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Destinação</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistros.length > 0 ? (
                  filteredRegistros.map((registro) => (
                    <TableRow key={registro.id}>
                      <TableCell>{formatDateTime(registro.data)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{registro.regiao_administrativa}</TableCell>
                      <TableCell className="hidden md:table-cell">{registro.origem}</TableCell>
                      <TableCell className="hidden md:table-cell">{registro.nome_popular}</TableCell>
                      <TableCell className="hidden md:table-cell">{registro.quantidade}</TableCell>
                      <TableCell className="hidden md:table-cell">{registro.estado_saude}</TableCell>
                      <TableCell className="hidden md:table-cell">{registro.destinacao}</TableCell>
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
                    <TableCell colSpan={8} className="text-center py-8">
                      {searchTerm || filterTipo
                        ? 'Nenhum registro encontrado com os filtros atuais.'
                        : 'Nenhum registro cadastrado ainda.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {filteredRegistros.length} de {registros.length} registros
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm" disabled>Próximo</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Registros;
