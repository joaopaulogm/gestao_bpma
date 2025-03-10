
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Search, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { useFaunaTable } from '@/hooks/useFaunaTable';

const FaunaCadastrada = () => {
  const navigate = useNavigate();
  const { 
    especies, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    filterClasse, 
    setFilterClasse,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete
  } = useFaunaTable();

  const especieToDelete = especies.find(especie => especie.id === confirmDeleteId);

  const handleEditClick = (id: string) => {
    navigate(`/fauna-cadastro/${id}`);
  };

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
              onValueChange={setFilterClasse}
              value={filterClasse}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as classes</SelectItem>
                <SelectItem value="AVE">Ave</SelectItem>
                <SelectItem value="MAMIFERO">Mamífero</SelectItem>
                <SelectItem value="REPTIL">Réptil</SelectItem>
                <SelectItem value="PEIXE">Peixe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="bg-fauna-blue hover:bg-fauna-blue/90"
            onClick={() => navigate('/fauna-cadastro')}
          >
            Cadastrar Nova Espécie
          </Button>
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <p className="text-gray-500">Carregando espécies...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-fauna-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Popular</TableHead>
                  <TableHead>Nome Científico</TableHead>
                  <TableHead className="hidden md:table-cell">Classe</TableHead>
                  <TableHead className="hidden md:table-cell">Estado de Conservação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.length > 0 ? (
                  especies.map((especie) => (
                    <TableRow key={especie.id}>
                      <TableCell className="font-medium">{especie.nome_popular}</TableCell>
                      <TableCell className="italic">{especie.nome_cientifico}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.classe_taxonomica}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.estado_de_conservacao}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Editar"
                            onClick={() => handleEditClick(especie.id)}
                          >
                            <Pencil className="h-4 w-4 text-fauna-blue" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Excluir"
                            onClick={() => setConfirmDeleteId(especie.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma espécie encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {confirmDeleteId && especieToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
          itemName={especieToDelete.nome_popular}
        />
      )}
    </Layout>
  );
};

export default FaunaCadastrada;
