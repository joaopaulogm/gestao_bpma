import React, { useState, useCallback, memo } from 'react';
import { Search, ArrowLeft, Bird, PawPrint, Leaf, TreeDeciduous, ChevronDown, ChevronUp, ImageOff, X, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

// Normalize text for comparison
const normalizeText = (text: string) => 
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

// Global cache for file lists to avoid repeated API calls
const fileListCache: Record<string, { name: string }[]> = {};

// Get cached image URL
const imageUrlCache: Record<string, string | null> = {};

const getImageUrl = async (speciesName: string, folderKey: string): Promise<string | null> => {
  const cacheKey = `${folderKey}-${speciesName}`;
  
  if (cacheKey in imageUrlCache) {
    return imageUrlCache[cacheKey];
  }

  try {
    // Get or fetch file list for folder
    if (!fileListCache[folderKey]) {
      const { data: files } = await supabase.storage
        .from('fotos_especies')
        .list(folderKey, { limit: 1000 });
      fileListCache[folderKey] = files || [];
    }

    const files = fileListCache[folderKey];
    const normalizedSearch = normalizeText(speciesName);
    
    const matchingFile = files.find(file => {
      const fileName = normalizeText(file.name);
      const fileNameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
      return fileNameWithoutExt === normalizedSearch || 
             fileNameWithoutExt.includes(normalizedSearch) || 
             normalizedSearch.includes(fileNameWithoutExt);
    });

    if (matchingFile) {
      const { data } = supabase.storage
        .from('fotos_especies')
        .getPublicUrl(`${folderKey}/${matchingFile.name}`);
      imageUrlCache[cacheKey] = data?.publicUrl || null;
      return imageUrlCache[cacheKey];
    }

    // Try root folder
    if (!fileListCache['root']) {
      const { data: rootFiles } = await supabase.storage
        .from('fotos_especies')
        .list('', { limit: 1000 });
      fileListCache['root'] = rootFiles || [];
    }

    const rootFiles = fileListCache['root'];
    const rootMatch = rootFiles.find(file => {
      const fileName = normalizeText(file.name);
      const fileNameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
      return fileNameWithoutExt === normalizedSearch || 
             fileNameWithoutExt.includes(normalizedSearch) || 
             normalizedSearch.includes(fileNameWithoutExt);
    });

    if (rootMatch) {
      const { data } = supabase.storage
        .from('fotos_especies')
        .getPublicUrl(rootMatch.name);
      imageUrlCache[cacheKey] = data?.publicUrl || null;
      return imageUrlCache[cacheKey];
    }

    imageUrlCache[cacheKey] = null;
    return null;
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    imageUrlCache[cacheKey] = null;
    return null;
  }
};

// Memoized species image component with zoom
const SpeciesImage = memo(({ speciesName, folderKey, onZoom }: { speciesName: string; folderKey: string; onZoom: (url: string, name: string) => void }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      const url = await getImageUrl(speciesName, folderKey);
      if (mounted) {
        setImageUrl(url);
        setLoading(false);
      }
    };

    loadImage();
    return () => { mounted = false; };
  }, [speciesName, folderKey]);

  if (loading) {
    return (
      <div className="w-full h-40 bg-muted/50 rounded-lg flex items-center justify-center animate-pulse">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!imageUrl || error) {
    return (
      <div className="w-full h-40 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div 
      className="w-full h-40 rounded-lg overflow-hidden mb-3 relative group cursor-pointer"
      onClick={() => onZoom(imageUrl, speciesName)}
    >
      <img
        src={imageUrl}
        alt={speciesName}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        onError={() => setError(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
    </div>
  );
});

SpeciesImage.displayName = 'SpeciesImage';

// Memoized fauna card
const FaunaCard = memo(({ especie, folderKey, index, onZoom }: { especie: EspecieFauna; folderKey: string; index: number; onZoom: (url: string, name: string) => void }) => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
    <CardContent className="p-4">
      <SpeciesImage speciesName={especie.nome_popular} folderKey={folderKey} onZoom={onZoom} />
      <h3 className="text-lg font-semibold text-foreground mb-1">{especie.nome_popular}</h3>
      <p className="text-sm text-muted-foreground italic mb-3">{especie.nome_cientifico}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted-foreground">Classe: </span><span className="text-foreground">{especie.classe_taxonomica}</span></div>
        <div><span className="text-muted-foreground">Ordem: </span><span className="text-foreground">{especie.ordem_taxonomica}</span></div>
        <div><span className="text-muted-foreground">Tipo: </span><span className="text-foreground">{especie.tipo_de_fauna}</span></div>
        <div><span className="text-muted-foreground">Conservação: </span><span className="text-foreground">{especie.estado_de_conservacao}</span></div>
      </div>
    </CardContent>
  </Card>
));

FaunaCard.displayName = 'FaunaCard';

// Memoized flora card
const FloraCard = memo(({ especie, index, onZoom }: { especie: EspecieFlora; index: number; onZoom: (url: string, name: string) => void }) => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
    <CardContent className="p-4">
      <SpeciesImage speciesName={especie.nome_popular} folderKey="flora" onZoom={onZoom} />
      <h3 className="text-lg font-semibold text-foreground mb-1">{especie.nome_popular}</h3>
      <p className="text-sm text-muted-foreground italic mb-3">{especie.nome_cientifico || '-'}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted-foreground">Classe: </span><span className="text-foreground">{especie.classe || '-'}</span></div>
        <div><span className="text-muted-foreground">Ordem: </span><span className="text-foreground">{especie.ordem || '-'}</span></div>
        <div><span className="text-muted-foreground">Família: </span><span className="text-foreground">{especie.familia || '-'}</span></div>
        <div><span className="text-muted-foreground">Conservação: </span><span className="text-foreground">{especie.estado_de_conservacao || '-'}</span></div>
        <div><span className="text-muted-foreground">Tipo: </span><span className="text-foreground">{especie.tipo_de_planta || '-'}</span></div>
        <div><span className="text-muted-foreground">Madeira de Lei: </span><span className="text-foreground">{especie.madeira_de_lei || '-'}</span></div>
      </div>
    </CardContent>
  </Card>
));

FloraCard.displayName = 'FloraCard';

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'fauna' | 'flora'>('fauna');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);

  const handleZoom = useCallback((url: string, name: string) => {
    setZoomImage({ url, name });
  }, []);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filterFaunaByGroup = useCallback((classe: string) => {
    return especiesFaunaData.filter(e => {
      const matchesClass = e.classe_taxonomica.toUpperCase() === classe.toUpperCase();
      const matchesSearch = searchTerm === '' ||
        e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [searchTerm]);

  const filterFloraByGroup = useCallback((filterFn: (e: EspecieFlora) => boolean) => {
    return especiesFloraData.filter(e => {
      const matchesGroup = filterFn(e);
      const matchesSearch = searchTerm === '' ||
        e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [searchTerm]);

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

      <div className="space-y-4">
        {activeTab === 'fauna' ? (
          <>
            {FAUNA_GROUPS.map((group) => {
              const species = filterFaunaByGroup(group.key);
              const Icon = group.icon;
              const isExpanded = expandedGroups[group.key];
              return (
                <Collapsible
                  key={group.key}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.key)}
                >
                  <Card className="bg-primary/10 backdrop-blur-sm border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-primary/20 transition-colors rounded-t-lg">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-primary" />
                            <span>{group.label}</span>
                            <span className="text-sm text-muted-foreground font-normal">({species.length} espécies)</span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {species.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">Nenhuma espécie encontrada</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {species.map((s, idx) => (
                              <FaunaCard key={`${s.nome_popular}-${idx}`} especie={s} folderKey={group.folderKey} index={idx} onZoom={handleZoom} />
                            ))}
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
              const isExpanded = expandedGroups[group.key];
              return (
                <Collapsible
                  key={group.key}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.key)}
                >
                  <Card className="bg-green-500/10 backdrop-blur-sm border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-green-500/20 transition-colors rounded-t-lg">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Leaf className="h-6 w-6 text-green-600" />
                            <span>{group.label}</span>
                            <span className="text-sm text-muted-foreground font-normal">({species.length} espécies)</span>
                          </div>
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {species.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">Nenhuma espécie encontrada</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {species.map((s, idx) => (
                              <FloraCard key={`${s.nome_popular}-${idx}`} especie={s} index={idx} onZoom={handleZoom} />
                            ))}
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

      {/* Zoom Modal */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border">
          <div className="relative">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {zoomImage && (
              <div className="flex flex-col">
                <img
                  src={zoomImage.url}
                  alt={zoomImage.name}
                  className="w-full max-h-[70vh] object-contain"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-foreground">{zoomImage.name}</h3>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdentificarEspecie;
