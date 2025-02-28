
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Filter, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demonstration
const MOCK_REGISTROS = [
  { id: 1, data: '12/05/2023', local: 'Av. Paulista, São Paulo', tipo: 'Resgate', especies: 3, responsavel: 'João Silva' },
  { id: 2, data: '25/05/2023', local: 'Parque Ibirapuera, São Paulo', tipo: 'Apreensão', especies: 5, responsavel: 'Maria Santos' },
  { id: 3, data: '08/06/2023', local: 'Zona Norte, São Paulo', tipo: 'Entrega', especies: 1, responsavel: 'Carlos Oliveira' },
  { id: 4, data: '17/06/2023', local: 'Santo André, SP', tipo: 'Resgate', especies: 2, responsavel: 'Ana Costa' },
  { id: 5, data: '02/07/2023', local: 'Guarulhos, SP', tipo: 'Apreensão', especies: 7, responsavel: 'Pedro Souza' },
  { id: 6, data: '16/07/2023', local: 'Osasco, SP', tipo: 'Resgate', especies: 2, responsavel: 'Fernanda Lima' },
  { id: 7, data: '29/07/2023', local: 'Diadema, SP', tipo: 'Entrega', especies: 1, responsavel: 'Ricardo Nunes' },
];

const Registros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredRegistros = MOCK_REGISTROS.filter(registro => {
    const matchesSearch = searchTerm === '' || 
      registro.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === '' || 
      registro.tipo.toLowerCase() === filterTipo.toLowerCase();
    
    return matchesSearch && matchesTipo;
  });

  return (
    <Layout title="Lista de Registros" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar por local ou responsável"
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Espécies</TableHead>
                <TableHead className="hidden md:table-cell">Responsável</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistros.length > 0 ? (
                filteredRegistros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>{registro.data}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{registro.local}</TableCell>
                    <TableCell className="hidden md:table-cell">{registro.tipo}</TableCell>
                    <TableCell className="hidden md:table-cell">{registro.especies}</TableCell>
                    <TableCell className="hidden md:table-cell">{registro.responsavel}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4 text-fauna-blue" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum registro encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {filteredRegistros.length} de {MOCK_REGISTROS.length} registros
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
