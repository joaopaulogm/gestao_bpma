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
import { useFloraTable } from '@/hooks/useFloraTable';

const FloraCadastrada = () => {
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
    handleDelete,
    uniqueClasses
  } = useFloraTable();

  const especieToDelete = especies.find(especie => especie.id === confirmDeleteId);

  const handleEditClick = (id: string) => {
    navigate(`/flora-cadastro/${id}`);
  };

  return (
    <Layout title="Flora Cadastrada" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar por nome popular ou científico"
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
                {uniqueClasses.map((classe) => (
                  <SelectItem key={classe} value={classe}>
                    {classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/flora-cadastro')}
          >
            Cadastrar Nova Espécie
          </Button>
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <p className="text-muted-foreground">Carregando espécies...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <p className="text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Popular</TableHead>
                  <TableHead>Nome Científico</TableHead>
                  <TableHead className="hidden md:table-cell">Classe</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo de Planta</TableHead>
                  <TableHead className="hidden lg:table-cell">Estado de Conservação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.length > 0 ? (
                  especies.map((especie) => (
                    <TableRow key={especie.id}>
                      <TableCell className="font-medium">{especie.nomePopular || '-'}</TableCell>
                      <TableCell className="italic">{especie.nomeCientifico || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.classe || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.tipoPlanta || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{especie.estadoConservacao || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Editar"
                            onClick={() => handleEditClick(especie.id)}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Excluir"
                            onClick={() => setConfirmDeleteId(especie.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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
          itemName={especieToDelete.nomePopular || 'Espécie'}
        />
      )}
    </Layout>
  );
};

export default FloraCadastrada;
