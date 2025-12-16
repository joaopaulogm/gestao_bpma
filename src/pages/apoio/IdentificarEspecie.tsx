import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Bird, PawPrint, Leaf, TreeDeciduous, ChevronDown, ChevronUp, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { especiesFaunaData, type EspecieFauna } from '@/data/especiesFaunaData';
import { especiesFloraData, type EspecieFlora } from '@/data/especiesFloraData';

const FAUNA_GROUPS = [
  { key: 'AVES', label: 'Aves', icon: Bird, folderKey: 'aves' },
  { key: 'MAMÍFEROS', label: 'Mamíferos', icon: PawPrint, folderKey: 'mamiferos' },
  { key: 'RÉPTEIS', label: 'Répteis', icon: PawPrint, folderKey: 'repteis' },
  { key: 'PEIXES', label: 'Peixes', icon: PawPrint, folderKey: 'peixes' },
];

const FLORA_GROUPS = [
  { key: 'madeira_lei', label: 'Madeira de Lei', filter: (e: EspecieFlora) => e.madeira_de_lei === 'Sim' },
  { key: 'ornamental', label: 'Ornamental', filter: (e: EspecieFlora) => e.tipo_de_planta === 'Ornamental' },
  { key: 'frutifera', label: 'Frutífera / Exótica', filter: (e: EspecieFlora) => e.tipo_de_planta === 'Exótico' },
  { key: 'imune_corte', label: 'Espécies Imune ao Corte', filter: (e: EspecieFlora) => e.imune_ao_corte === 'Sim' },
  { key: 'silvestre', label: 'Silvestre', filter: (e: EspecieFlora) => e.tipo_de_planta === 'Silvestre' },
];

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'fauna' | 'flora'>('fauna');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const fetchImageForSpecies = async (speciesName: string, folderKey: string) => {
    const cacheKey = `${folderKey}-${speciesName}`;
    
    if (imageCache[cacheKey] || loadingImages[cacheKey]) {
      return;
    }

    setLoadingImages(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const { data: files, error: listError } = await supabase.storage
        .from('fotos_especies')
        .list(folderKey, { limit: 500 });

      if (!listError && files && files.length > 0) {
        const normalizedSearch = speciesName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const matchingFile = files.find(file => {
          const fileName = file.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const fileNameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
          return fileNameWithoutExt.includes(normalizedSearch) || normalizedSearch.includes(fileNameWithoutExt);
        });

        if (matchingFile) {
          const { data: urlData } = supabase.storage
            .from('fotos_especies')
            .getPublicUrl(`${folderKey}/${matchingFile.name}`);
          
          if (urlData?.publicUrl) {
            setImageCache(prev => ({ ...prev, [cacheKey]: urlData.publicUrl }));
            setLoadingImages(prev => ({ ...prev, [cacheKey]: false }));
            return;
          }
        }
      }

      // Try root folder
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('fotos_especies')
        .list('', { limit: 1000 });

      if (!rootError && rootFiles && rootFiles.length > 0) {
        const normalizedSearch = speciesName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const matchingFile = rootFiles.find(file => {
          const fileName = file.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const fileNameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
          return fileNameWithoutExt.includes(normalizedSearch) || normalizedSearch.includes(fileNameWithoutExt);
        });

        if (matchingFile) {
          const { data: urlData } = supabase.storage
            .from('fotos_especies')
            .getPublicUrl(matchingFile.name);
          
          if (urlData?.publicUrl) {
            setImageCache(prev => ({ ...prev, [cacheKey]: urlData.publicUrl }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar imagem:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [cacheKey]: false }));
    }
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filterFaunaByGroup = (classe: string) => {
    return especiesFaunaData.filter((e) => {
      const matchesClass = e.classe_taxonomica.toUpperCase() === classe.toUpperCase();
      const matchesSearch =
        searchTerm === '' ||
        e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
  };

  const filterFloraByGroup = (filterFn: (e: EspecieFlora) => boolean) => {
    return especiesFloraData.filter((e) => {
      const matchesGroup = filterFn(e);
      const matchesSearch =
        searchTerm === '' ||
        e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  };

  const SpeciesImage: React.FC<{ speciesName: string; folderKey: string }> = ({ speciesName, folderKey }) => {
    const cacheKey = `${folderKey}-${speciesName}`;
    const imageUrl = imageCache[cacheKey];
    const isLoading = loadingImages[cacheKey];

    useEffect(() => {
      if (!imageUrl && !isLoading) {
        fetchImageForSpecies(speciesName, folderKey);
      }
    }, [speciesName, folderKey, imageUrl, isLoading]);

    if (isLoading) {
      return (
        <div className="w-full h-40 bg-muted/50 rounded-lg flex items-center justify-center animate-pulse">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
          <img
            src={imageUrl}
            alt={speciesName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    return (
      <div className="w-full h-40 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  };

  const renderFaunaCard = (especie: EspecieFauna, folderKey: string, index: number) => (
    <Card key={`${especie.nome_popular}-${index}`} className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <SpeciesImage speciesName={especie.nome_popular} folderKey={folderKey} />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {especie.nome_popular}
        </h3>
        <p className="text-sm text-muted-foreground italic mb-3">
          {especie.nome_cientifico}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Classe: </span>
            <span className="text-foreground">{especie.classe_taxonomica}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ordem: </span>
            <span className="text-foreground">{especie.ordem_taxonomica}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo: </span>
            <span className="text-foreground">{especie.tipo_de_fauna}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conservação: </span>
            <span className="text-foreground">{especie.estado_de_conservacao}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFloraCard = (especie: EspecieFlora, index: number) => (
    <Card key={`${especie.nome_popular}-${index}`} className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-4">
        <SpeciesImage speciesName={especie.nome_popular} folderKey="flora" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {especie.nome_popular}
        </h3>
        <p className="text-sm text-muted-foreground italic mb-3">
          {especie.nome_cientifico || '-'}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Classe: </span>
            <span className="text-foreground">{especie.classe || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ordem: </span>
            <span className="text-foreground">{especie.ordem || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Família: </span>
            <span className="text-foreground">{especie.familia || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conservação: </span>
            <span className="text-foreground">{especie.estado_de_conservacao || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo: </span>
            <span className="text-foreground">{especie.tipo_de_planta || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Madeira de Lei: </span>
            <span className="text-foreground">{especie.madeira_de_lei || '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/material-apoio">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Identificar Espécie</h1>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome popular ou científico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tab Selection */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'fauna' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fauna')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <PawPrint className="h-6 w-6" />
          Fauna
        </Button>
        <Button
          variant={activeTab === 'flora' ? 'default' : 'outline'}
          onClick={() => setActiveTab('flora')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <TreeDeciduous className="h-6 w-6" />
          Flora
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'fauna' ? (
            <>
              {FAUNA_GROUPS.map((group) => {
                const species = filterFaunaByGroup(group.key);
                const Icon = group.icon;
                return (
                  <Collapsible
                    key={group.key}
                    open={expandedGroups[group.key]}
                    onOpenChange={() => toggleGroup(group.key)}
                  >
                    <Card className="bg-primary/10 backdrop-blur-sm border-border/50">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-primary/20 transition-colors rounded-t-lg">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6 text-primary" />
                              <span>{group.label}</span>
                              <span className="text-sm text-muted-foreground font-normal">
                                ({species.length} espécies)
                              </span>
                            </div>
                            {expandedGroups[group.key] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {species.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              Nenhuma espécie encontrada
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {species.map((s, idx) => renderFaunaCard(s, group.folderKey, idx))}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </>
          ) : (
            <>
              {FLORA_GROUPS.map((group) => {
                const species = filterFloraByGroup(group.filter);
                return (
                  <Collapsible
                    key={group.key}
                    open={expandedGroups[group.key]}
                    onOpenChange={() => toggleGroup(group.key)}
                  >
                    <Card className="bg-green-500/10 backdrop-blur-sm border-border/50">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-green-500/20 transition-colors rounded-t-lg">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Leaf className="h-6 w-6 text-green-600" />
                              <span>{group.label}</span>
                              <span className="text-sm text-muted-foreground font-normal">
                                ({species.length} espécies)
                              </span>
                            </div>
                            {expandedGroups[group.key] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {species.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                              Nenhuma espécie encontrada
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {species.map((s, idx) => renderFloraCard(s, idx))}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IdentificarEspecie;
