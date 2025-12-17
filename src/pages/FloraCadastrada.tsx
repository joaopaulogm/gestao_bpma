import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, ChevronDown, ChevronUp, FilterX, Pencil, Search, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { useFloraTable, SortField } from '@/hooks/useFloraTable';

const FloraCadastrada = () => {
  const navigate = useNavigate();
  const { 
    especies, 
    totalCount,
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    filterClasse, 
    setFilterClasse,
    filterTipoPlanta,
    setFilterTipoPlanta,
    filterEstadoConservacao,
    setFilterEstadoConservacao,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    uniqueClasses,
    uniqueTiposPlanta,
    uniqueEstadosConservacao,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
    hasActiveFilters,
  } = useFloraTable();

  const especieToDelete = especies.find(especie => especie.id === confirmDeleteId);

  const handleEditClick = (id: string) => {
    navigate(`/secao-operacional/flora-cadastro/${id}`);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  return (
    <Layout title="Flora Cadastrada" showBackButton>
      <div className="space-y-6 animate-fade-in">
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome popular, científico ou família..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate('/secao-operacional/flora-cadastro')}
          >
            Cadastrar Nova Espécie
          </Button>
        </div>

        {/* Advanced Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Classe</label>
                  <Select onValueChange={setFilterClasse} value={filterClasse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as classes" />
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

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Planta</label>
                  <Select onValueChange={setFilterTipoPlanta} value={filterTipoPlanta}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {uniqueTiposPlanta.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Estado de Conservação</label>
                  <Select onValueChange={setFilterEstadoConservacao} value={filterEstadoConservacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      {uniqueEstadosConservacao.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="whitespace-nowrap">
                  <FilterX className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Exibindo {especies.length} de {totalCount} espécies</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtros ativos
            </Badge>
          )}
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
                  <SortableHeader field="nomePopular">Nome Popular</SortableHeader>
                  <SortableHeader field="nomeCientifico">Nome Científico</SortableHeader>
                  <SortableHeader field="classe">Classe</SortableHeader>
                  <SortableHeader field="tipoPlanta">Tipo de Planta</SortableHeader>
                  <SortableHeader field="estadoConservacao">Estado de Conservação</SortableHeader>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.length > 0 ? (
                  especies.map((especie) => (
                    <TableRow key={especie.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{especie.nomePopular || '-'}</TableCell>
                      <TableCell className="italic text-muted-foreground">{especie.nomeCientifico || '-'}</TableCell>
                      <TableCell>{especie.classe || '-'}</TableCell>
                      <TableCell>{especie.tipoPlanta || '-'}</TableCell>
                      <TableCell>
                        {especie.estadoConservacao ? (
                          <Badge variant="outline" className="text-xs">
                            {especie.estadoConservacao}
                          </Badge>
                        ) : '-'}
                      </TableCell>
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
