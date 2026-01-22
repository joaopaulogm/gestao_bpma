import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Check, ChevronDown, ChevronUp, Clock, Download, ExternalLink, FilterX, ImageIcon, Pencil, RefreshCw, Search, Trash, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { FloraEditDialog } from '@/components/flora/FloraEditDialog';
import { useFloraTable, SortField } from '@/hooks/useFloraTable';
import { syncSpecies, listBucketImages, updateSpeciesPhoto, revalidateSpeciesPhoto } from '@/services/syncService';
import { buscarImagemEspecie, getDirectImageUrl } from '@/services/speciesImageService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper to get image URL via service or fallback
const getImageUrl = (bucket: string, filename: string) => getDirectImageUrl(bucket, filename);

const FloraCadastrada = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<any>(null);

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
    filterFotoStatus,
    setFilterFotoStatus,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    refreshEspecies,
    uniqueClasses,
    uniqueTiposPlanta,
    uniqueEstadosConservacao,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
    hasActiveFilters,
  } = useFloraTable();

  // Realtime listener for flora table changes
  useEffect(() => {
    const channel = supabase
      .channel('realtime-flora-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dim_especies_flora' },
        (payload) => {
          console.log('Flora table changed:', payload);
          refreshEspecies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshEspecies]);

  const especieToDelete = especies.find(especie => especie.id === confirmDeleteId);

  const handleEditClick = (especie: any) => {
    setEditingSpecies(especie);
  };

  const handleSync = async (dryRun = false) => {
    setSyncing(true);
    try {
      const result = await syncSpecies('flora', dryRun);
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

  const handleFetchGBIFImages = async () => {
    setFetchingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-images', {
        body: { tipo: 'flora', limit: 5 }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        const successCount = data.results?.filter((r: any) => r.status === 'success').length || 0;
        const notFoundCount = data.results?.filter((r: any) => r.status === 'not_found_gbif').length || 0;
        const noImagesCount = data.results?.filter((r: any) => r.status === 'no_images_gbif').length || 0;
        
        if (successCount > 0) {
          toast.success(`${successCount} espécies atualizadas com imagens do GBIF`);
          refreshEspecies();
        }
        if (notFoundCount > 0) {
          toast.info(`${notFoundCount} espécies não encontradas no GBIF`);
        }
        if (noImagesCount > 0) {
          toast.info(`${noImagesCount} espécies sem imagens disponíveis no GBIF`);
        }
        if (successCount === 0 && notFoundCount === 0 && noImagesCount === 0) {
          toast.info('Todas as espécies já possuem imagens');
        }
      } else {
        toast.error('Erro ao buscar imagens');
      }
    } catch (err: any) {
      console.error('GBIF fetch error:', err);
      toast.error(err.message || 'Erro ao buscar imagens do GBIF');
    } finally {
      setFetchingImages(false);
    }
  };

  // Generate slug from nome popular
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenPhotoSelector = async (especie: any) => {
    setSelectedSpecies(especie);
    setLoadingImages(true);
    try {
      const slug = slugify(especie.nomePopular || '');
      const images = await listBucketImages('imagens-flora', slug);
      setBucketImages(images);
    } catch (err) {
      toast.error('Erro ao carregar imagens do bucket');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSelectPhoto = async (filename: string) => {
    if (!selectedSpecies?.id) {
      toast.error('Espécie não encontrada');
      return;
    }
    
    const success = await updateSpeciesPhoto(
      'dim_especies_flora',
      selectedSpecies.id,
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
    if (!especie.id) {
      toast.error('Espécie não encontrada');
      return;
    }
    
    const success = await revalidateSpeciesPhoto('dim_especies_flora', especie.id);
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
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome popular, científico ou família..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline"
              onClick={() => handleSync(true)}
              disabled={syncing || fetchingImages}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Dry Run
            </Button>
            <Button 
              variant="secondary"
              onClick={() => handleSync(false)}
              disabled={syncing || fetchingImages}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Button 
              variant="outline"
              onClick={handleFetchGBIFImages}
              disabled={fetchingImages || syncing}
              className="border-green-500/50 text-green-700 hover:bg-green-500/10"
            >
              <Download className={`h-4 w-4 mr-2 ${fetchingImages ? 'animate-bounce' : ''}`} />
              Buscar Imagens GBIF
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/secao-operacional/flora-cadastro')}
            >
              Cadastrar Nova
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
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

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Status da Foto</label>
                  <Select onValueChange={setFilterFotoStatus} value={filterFotoStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="validada">Validada</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
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
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
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
            <ScrollArea className="h-[calc(100vh-450px)] min-h-[350px]">
              <div className="min-w-[800px]">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <SortableHeader field="nomePopular">Nome Popular</SortableHeader>
                  <SortableHeader field="nomeCientifico">Nome Científico</SortableHeader>
                  <SortableHeader field="classe">Classe</SortableHeader>
                  <SortableHeader field="tipoPlanta">Tipo de Planta</SortableHeader>
                  <SortableHeader field="fotoStatus">Status Foto</SortableHeader>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {especies.length > 0 ? (
                  especies.map((especie) => (
                    <TableRow key={especie.id} className="hover:bg-muted/50">
                      <TableCell>
                        {especie.fotoPrincipalPath || especie.imagens[0] ? (
                          <img 
                            src={getImageUrl('imagens-flora', especie.fotoPrincipalPath || especie.imagens[0])} 
                            alt={especie.nomePopular || ''}
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
                      <TableCell className="font-medium">{especie.nomePopular || '-'}</TableCell>
                      <TableCell className="italic text-muted-foreground">{especie.nomeCientifico || '-'}</TableCell>
                      <TableCell>{especie.classe || '-'}</TableCell>
                      <TableCell>{especie.tipoPlanta || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFotoStatusBadge(especie.fotoStatus)}
                          {especie.fotoFonteValidacao && (
                            <a 
                              href={`https://pt.wikipedia.org/wiki/${encodeURIComponent(especie.nomeCientifico || especie.nomePopular || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
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
                                <DialogTitle>Selecionar Foto - {selectedSpecies?.nomePopular}</DialogTitle>
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
                                        src={getImageUrl('imagens-flora', img)} 
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
                            onClick={() => handleEditClick(especie)}
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma espécie encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
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

      <FloraEditDialog
        especie={editingSpecies}
        open={!!editingSpecies}
        onOpenChange={(open) => !open && setEditingSpecies(null)}
        onSave={refreshEspecies}
      />
    </Layout>
  );
};

export default FloraCadastrada;
