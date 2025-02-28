
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Search, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for demonstration
const MOCK_FAUNA = [
  { id: 1, nomeComum: 'Onça-pintada', nomeCientifico: 'Panthera onca', grupo: 'Mamífero', status: 'Vulnerável (VU)' },
  { id: 2, nomeComum: 'Arara-azul', nomeCientifico: 'Anodorhynchus hyacinthinus', grupo: 'Ave', status: 'Em Perigo (EN)' },
  { id: 3, nomeComum: 'Jabuti-piranga', nomeCientifico: 'Chelonoidis carbonaria', grupo: 'Réptil', status: 'Pouco Preocupante (LC)' },
  { id: 4, nomeComum: 'Lobo-guará', nomeCientifico: 'Chrysocyon brachyurus', grupo: 'Mamífero', status: 'Quase Ameaçada (NT)' },
  { id: 5, nomeComum: 'Peixe-boi', nomeCientifico: 'Trichechus manatus', grupo: 'Mamífero', status: 'Em Perigo (EN)' },
];

const FaunaCadastrada = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');
  
  const filteredFauna = MOCK_FAUNA.filter(fauna => {
    const matchesSearch = searchTerm === '' || 
      fauna.nomeComum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fauna.nomeCientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrupo = filterGrupo === '' || 
      fauna.grupo.toLowerCase() === filterGrupo.toLowerCase();
    
    return matchesSearch && matchesGrupo;
  });

  return (
    <Layout title="Fauna Cadastrada" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar por nome comum ou científico"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select 
              onValueChange={setFilterGrupo}
              value={filterGrupo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os grupos</SelectItem>
                <SelectItem value="mamífero">Mamífero</SelectItem>
                <SelectItem value="ave">Ave</SelectItem>
                <SelectItem value="réptil">Réptil</SelectItem>
                <SelectItem value="anfíbio">Anfíbio</SelectItem>
                <SelectItem value="peixe">Peixe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border border-fauna-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Comum</TableHead>
                <TableHead>Nome Científico</TableHead>
                <TableHead className="hidden md:table-cell">Grupo</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFauna.length > 0 ? (
                filteredFauna.map((fauna) => (
                  <TableRow key={fauna.id}>
                    <TableCell className="font-medium">{fauna.nomeComum}</TableCell>
                    <TableCell className="italic">{fauna.nomeCientifico}</TableCell>
                    <TableCell className="hidden md:table-cell">{fauna.grupo}</TableCell>
                    <TableCell className="hidden md:table-cell">{fauna.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Ver detalhes">
                          <Eye className="h-4 w-4 text-fauna-blue" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Pencil className="h-4 w-4 text-fauna-blue" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Excluir">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhuma fauna encontrada com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default FaunaCadastrada;
