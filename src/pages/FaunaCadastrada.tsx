import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Check, Clock, ExternalLink, ImageIcon, Pencil, RefreshCw, Search, Trash, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { useFaunaTable } from '@/hooks/useFaunaTable';
import { syncSpecies, getImageUrl, listBucketImages, updateSpeciesPhoto, revalidateSpeciesPhoto } from '@/services/syncService';
import { toast } from 'sonner';

const FaunaCadastrada = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const { 
    especies, 
    totalCount,
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    filterClasse, 
    setFilterClasse,
    filterGrupo,
    setFilterGrupo,
    filterFotoStatus,
    setFilterFotoStatus,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    refreshEspecies,
    uniqueClasses,
    uniqueGrupos,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
    hasActiveFilters
  } = useFaunaTable();

  const especieToDelete = especies.find(especie => especie.id === confirmDeleteId);

  const handleEditClick = (id: string) => {
    navigate(`/secao-operacional/fauna-cadastro/${id}`);
  };

  const handleSync = async (dryRun = false) => {
    setSyncing(true);
    try {
      const result = await syncSpecies('fauna', dryRun);
      if (result.success) {
        toast.success(dryRun 
          ? `Simulação concluída: ${result.results[0]?.processed || 0} registros processados` 
          : `Sincronização concluída: ${result.results[0]?.updated || 0} registros atualizados`
        );
        if (!dryRun) refreshEspecies();
      } else {
        toast.error('Erro na sincronização');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenPhotoSelector = async (especie: any) => {
    setSelectedSpecies(especie);
    setLoadingImages(true);
    try {
      const images = await listBucketImages('imagens-fauna', especie.nome_popular_slug);
      setBucketImages(images);
    } catch (err) {
      toast.error('Erro ao carregar imagens do bucket');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSelectPhoto = async (filename: string) => {
    if (!selectedSpecies?.id_dim_especie_fauna) {
      toast.error('Espécie não vinculada à dimensão');
      return;
    }
    
    const success = await updateSpeciesPhoto(
      'dim_especies_fauna',
      selectedSpecies.id_dim_especie_fauna,
      filename,
      [filename, ...bucketImages.filter(img => img !== filename).slice(0, 2)]
    );

    if (success) {
      toast.success('Foto atualizada com sucesso');
      setSelectedSpecies(null);
      refreshEspecies();
    } else {
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleRevalidate = async (especie: any) => {
    if (!especie.id_dim_especie_fauna) {
      toast.error('Espécie não vinculada à dimensão');
      return;
    }
    
    const success = await revalidateSpeciesPhoto('dim_especies_fauna', especie.id_dim_especie_fauna);
    if (success) {
      toast.success('Status alterado para pendente');
      refreshEspecies();
    } else {
      toast.error('Erro ao revalidar');
    }
  };

  const getFotoStatusBadge = (status: string | null) => {
    switch (status) {
      case 'validada':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30"><Check className="h-3 w-3 mr-1" />Validada</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'rejeitada':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30"><X className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">Sem foto</Badge>;
    }
  };

  return (
    <Layout title="Fauna Cadastrada" showBackButton>
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome comum ou científico"
                className="pl-10 bg-card/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select onValueChange={setFilterClasse} value={filterClasse}>
              <SelectTrigger className="w-full sm:w-40 bg-card/80">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas classes</SelectItem>
                {uniqueClasses.map(classe => (
                  <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setFilterGrupo} value={filterGrupo}>
              <SelectTrigger className="w-full sm:w-40 bg-card/80">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos grupos</SelectItem>
                {uniqueGrupos.map(grupo => (
                  <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setFilterFotoStatus} value={filterFotoStatus}>
              <SelectTrigger className="w-full sm:w-44 bg-card/80">
                <SelectValue placeholder="Status Foto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="validada">Validada</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />Limpar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => handleSync(true)}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Dry Run
            </Button>
            <Button 
              variant="secondary"
              onClick={() => handleSync(false)}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/secao-operacional/fauna-cadastro')}
            >
              Cadastrar Nova
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Exibindo {especies.length} de {totalCount} espécies
        </div>

        {/* Content */}
        {loading ? (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="h-60 flex items-center justify-center">
                <p className="text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card/80 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('nome_popular')}>
                    <div className="flex items-center gap-1">
                      Nome Popular
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('nome_cientifico')}>
                    <div className="flex items-center gap-1">
                      Nome Científico
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('grupo')}>
                    <div className="flex items-center gap-1">
                      Grupo
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('classe_taxonomica')}>
                    <div className="flex items-center gap-1">
                      Classe
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('foto_status')}>
                    <div className="flex items-center gap-1">
                      Status Foto
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.length > 0 ? (
                  especies.map((especie) => (
                    <TableRow key={especie.id}>
                      <TableCell>
                        {especie.foto_principal_path || especie.imagens[0] ? (
                          <img 
                            src={getImageUrl('imagens-fauna', especie.foto_principal_path || especie.imagens[0])} 
                            alt={especie.nome_popular}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{especie.nome_popular}</TableCell>
                      <TableCell className="italic text-muted-foreground">{especie.nome_cientifico}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.grupo}</TableCell>
                      <TableCell className="hidden md:table-cell">{especie.classe_taxonomica}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getFotoStatusBadge(especie.foto_status)}
                        {especie.foto_fonte_validacao && (
                          <a 
                            href={`https://pt.wikipedia.org/wiki/${encodeURIComponent(especie.nome_cientifico || especie.nome_popular)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-500 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Escolher foto"
                                onClick={() => handleOpenPhotoSelector(especie)}
                              >
                                <ImageIcon className="h-4 w-4 text-primary" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Selecionar Foto - {selectedSpecies?.nome_popular}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                {loadingImages ? (
                                  <div className="col-span-3 flex justify-center p-8">
                                    <RefreshCw className="h-6 w-6 animate-spin" />
                                  </div>
                                ) : bucketImages.length > 0 ? (
                                  bucketImages.map((img) => (
                                    <div 
                                      key={img}
                                      className="cursor-pointer border rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                                      onClick={() => handleSelectPhoto(img)}
                                    >
                                      <img 
                                        src={getImageUrl('imagens-fauna', img)} 
                                        alt={img}
                                        className="w-full h-32 object-cover"
                                      />
                                      <p className="text-xs p-2 truncate">{img}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="col-span-3 text-center text-muted-foreground p-8">
                                    Nenhuma imagem encontrada no bucket para esta espécie
                                  </p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Revalidar foto"
                            onClick={() => handleRevalidate(especie)}
                          >
                            <RefreshCw className="h-4 w-4 text-yellow-600" />
                          </Button>
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
                    <TableCell colSpan={7} className="text-center py-8">
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
