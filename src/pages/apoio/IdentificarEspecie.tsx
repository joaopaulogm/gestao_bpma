import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, ArrowLeft, PawPrint, TreeDeciduous, ImageOff, X, ZoomIn, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const ITEMS_PER_PAGE = 20;

// Fauna categories based on classe_taxonomica
const FAUNA_CATEGORIES = [
  { value: 'all', label: 'Todas as Classes' },
  { value: 'Aves', label: 'Aves' },
  { value: 'Mammalia', label: 'Mamíferos' },
  { value: 'Reptilia', label: 'Répteis' },
  { value: 'Actinopterygii', label: 'Peixes' },
];

// Flora categories
const FLORA_CATEGORIES = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'ornamental', label: 'Ornamental' },
  { value: 'madeira_lei', label: 'Madeira de Lei' },
  { value: 'imune_corte', label: 'Imune ao Corte' },
  { value: 'frutifera_exotica', label: 'Frutífera Exótica' },
];

interface FaunaRecord {
  id: string;
  nome_popular: string;
  nome_popular_slug: string;
  nome_cientifico: string | null;
  imagens: string[];
  bucket: string;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  estado_conservacao: string | null;
  tipo_fauna: string | null;
  grupo: string | null;
}

interface FloraRecord {
  id: string;
  nome_popular: string;
  nome_popular_slug: string;
  nome_cientifico: string | null;
  imagens: string[];
  bucket: string;
  classe: string | null;
  ordem: string | null;
  familia: string | null;
  estado_conservacao: string | null;
  tipo_planta: string | null;
  madeira_lei: boolean | null;
  imune_ao_corte: boolean | null;
}

const getImageUrl = (bucket: string, filename: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Species Image Component
const SpeciesImage = memo(({ 
  imageUrl, 
  alt, 
  onZoom 
}: { 
  imageUrl: string; 
  alt: string; 
  onZoom: (url: string, name: string) => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => onZoom(imageUrl, alt)}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
    </div>
  );
});

SpeciesImage.displayName = 'SpeciesImage';

// Fauna Card Component
const FaunaCard = memo(({ 
  item, 
  onZoom 
}: { 
  item: FaunaRecord; 
  onZoom: (url: string, name: string) => void;
}) => {
  const images = item.imagens || [];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden hover:shadow-lg transition-all">
      <CardContent className="p-4">
        {images.length > 0 ? (
          <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {images.slice(0, 6).map((filename, idx) => (
              <SpeciesImage
                key={idx}
                imageUrl={getImageUrl(item.bucket, filename)}
                alt={`${item.nome_popular} - ${idx + 1}`}
                onZoom={onZoom}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <h3 className="text-lg font-semibold text-foreground mb-1">{item.nome_popular}</h3>
        {item.nome_cientifico && (
          <p className="text-sm text-muted-foreground italic mb-3">{item.nome_cientifico}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {item.classe_taxonomica && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{item.classe_taxonomica}</span>
          )}
          {item.estado_conservacao && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full">{item.estado_conservacao}</span>
          )}
          {item.tipo_fauna && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">{item.tipo_fauna}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

FaunaCard.displayName = 'FaunaCard';

// Flora Card Component
const FloraCard = memo(({ 
  item, 
  onZoom 
}: { 
  item: FloraRecord; 
  onZoom: (url: string, name: string) => void;
}) => {
  const images = item.imagens || [];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden hover:shadow-lg transition-all">
      <CardContent className="p-4">
        {images.length > 0 ? (
          <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {images.slice(0, 6).map((filename, idx) => (
              <SpeciesImage
                key={idx}
                imageUrl={getImageUrl(item.bucket, filename)}
                alt={`${item.nome_popular} - ${idx + 1}`}
                onZoom={onZoom}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
            <ImageOff className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <h3 className="text-lg font-semibold text-foreground mb-1">{item.nome_popular}</h3>
        {item.nome_cientifico && (
          <p className="text-sm text-muted-foreground italic mb-3">{item.nome_cientifico}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {item.classe && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{item.classe}</span>
          )}
          {item.madeira_lei && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full">Madeira de Lei</span>
          )}
          {item.imune_ao_corte && (
            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full">Imune ao Corte</span>
          )}
          {item.estado_conservacao && (
            <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-full">{item.estado_conservacao}</span>
          )}
          {item.tipo_planta && (
            <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full">{item.tipo_planta}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

FloraCard.displayName = 'FloraCard';

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'fauna' | 'flora'>('fauna');
  const [faunaData, setFaunaData] = useState<FaunaRecord[]>([]);
  const [floraData, setFloraData] = useState<FloraRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);
  
  // Filters
  const [faunaCategory, setFaunaCategory] = useState('all');
  const [floraCategory, setFloraCategory] = useState('all');
  const [faunaConservation, setFaunaConservation] = useState('all');
  const [floraConservation, setFloraConservation] = useState('all');
  
  // Pagination
  const [faunaPage, setFaunaPage] = useState(1);
  const [floraPage, setFloraPage] = useState(1);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: fauna, error: faunaError } = await supabase
          .from('fauna')
          .select('*')
          .order('nome_popular', { ascending: true });

        if (faunaError) {
          console.error('Error fetching fauna:', faunaError);
        } else {
          setFaunaData(fauna || []);
        }

        const { data: flora, error: floraError } = await supabase
          .from('flora')
          .select('*')
          .order('nome_popular', { ascending: true });

        if (floraError) {
          console.error('Error fetching flora:', floraError);
        } else {
          setFloraData(flora || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setFaunaPage(1);
  }, [searchTerm, faunaCategory, faunaConservation]);

  useEffect(() => {
    setFloraPage(1);
  }, [searchTerm, floraCategory, floraConservation]);

  const handleZoom = useCallback((url: string, name: string) => {
    setZoomImage({ url, name });
  }, []);

  // Get unique conservation statuses
  const faunaConservationOptions = useMemo(() => {
    const statuses = new Set(faunaData.map(item => item.estado_conservacao).filter(Boolean));
    return ['all', ...Array.from(statuses)] as string[];
  }, [faunaData]);

  const floraConservationOptions = useMemo(() => {
    const statuses = new Set(floraData.map(item => item.estado_conservacao).filter(Boolean));
    return ['all', ...Array.from(statuses)] as string[];
  }, [floraData]);

  // Filter fauna
  const filteredFauna = useMemo(() => {
    let result = faunaData;

    // Search filter
    if (searchTerm.trim()) {
      const normalizedSearch = normalizeText(searchTerm);
      result = result.filter(item => {
        const nomePopular = normalizeText(item.nome_popular || '');
        const nomeCientifico = normalizeText(item.nome_cientifico || '');
        return nomePopular.includes(normalizedSearch) || nomeCientifico.includes(normalizedSearch);
      });
    }

    // Category filter (classe_taxonomica)
    if (faunaCategory !== 'all') {
      result = result.filter(item => item.classe_taxonomica === faunaCategory);
    }

    // Conservation status filter
    if (faunaConservation !== 'all') {
      result = result.filter(item => item.estado_conservacao === faunaConservation);
    }

    return result;
  }, [faunaData, searchTerm, faunaCategory, faunaConservation]);

  // Filter flora
  const filteredFlora = useMemo(() => {
    let result = floraData;

    // Search filter
    if (searchTerm.trim()) {
      const normalizedSearch = normalizeText(searchTerm);
      result = result.filter(item => {
        const nomePopular = normalizeText(item.nome_popular || '');
        const nomeCientifico = normalizeText(item.nome_cientifico || '');
        return nomePopular.includes(normalizedSearch) || nomeCientifico.includes(normalizedSearch);
      });
    }

    // Category filter
    if (floraCategory !== 'all') {
      switch (floraCategory) {
        case 'ornamental':
          result = result.filter(item => item.tipo_planta?.toLowerCase().includes('ornamental'));
          break;
        case 'madeira_lei':
          result = result.filter(item => item.madeira_lei === true);
          break;
        case 'imune_corte':
          result = result.filter(item => item.imune_ao_corte === true);
          break;
        case 'frutifera_exotica':
          result = result.filter(item => 
            item.tipo_planta?.toLowerCase().includes('frutífera') || 
            item.tipo_planta?.toLowerCase().includes('frutifera') ||
            item.tipo_planta?.toLowerCase().includes('exótica') ||
            item.tipo_planta?.toLowerCase().includes('exotica')
          );
          break;
      }
    }

    // Conservation status filter
    if (floraConservation !== 'all') {
      result = result.filter(item => item.estado_conservacao === floraConservation);
    }

    return result;
  }, [floraData, searchTerm, floraCategory, floraConservation]);

  // Paginated data
  const paginatedFauna = useMemo(() => {
    return filteredFauna.slice(0, faunaPage * ITEMS_PER_PAGE);
  }, [filteredFauna, faunaPage]);

  const paginatedFlora = useMemo(() => {
    return filteredFlora.slice(0, floraPage * ITEMS_PER_PAGE);
  }, [filteredFlora, floraPage]);

  const hasMoreFauna = paginatedFauna.length < filteredFauna.length;
  const hasMoreFlora = paginatedFlora.length < filteredFlora.length;

  const clearFilters = () => {
    setSearchTerm('');
    setFaunaCategory('all');
    setFloraCategory('all');
    setFaunaConservation('all');
    setFloraConservation('all');
  };

  const hasActiveFilters = searchTerm || 
    faunaCategory !== 'all' || 
    floraCategory !== 'all' || 
    faunaConservation !== 'all' || 
    floraConservation !== 'all';

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

      {/* Search and Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 mb-6">
        <CardContent className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome popular ou científico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
            </div>

            {activeTab === 'fauna' ? (
              <>
                <Select value={faunaCategory} onValueChange={setFaunaCategory}>
                  <SelectTrigger className="w-[180px] bg-background/50">
                    <SelectValue placeholder="Classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAUNA_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={faunaConservation} onValueChange={setFaunaConservation}>
                  <SelectTrigger className="w-[200px] bg-background/50">
                    <SelectValue placeholder="Estado de Conservação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    {faunaConservationOptions.filter(s => s !== 'all').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select value={floraCategory} onValueChange={setFloraCategory}>
                  <SelectTrigger className="w-[180px] bg-background/50">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLORA_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={floraConservation} onValueChange={setFloraConservation}>
                  <SelectTrigger className="w-[200px] bg-background/50">
                    <SelectValue placeholder="Estado de Conservação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    {floraConservationOptions.filter(s => s !== 'all').map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {activeTab === 'fauna' && faunaCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {FAUNA_CATEGORIES.find(c => c.value === faunaCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFaunaCategory('all')} />
                </Badge>
              )}
              {activeTab === 'fauna' && faunaConservation !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {faunaConservation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFaunaConservation('all')} />
                </Badge>
              )}
              {activeTab === 'flora' && floraCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {FLORA_CATEGORIES.find(c => c.value === floraCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFloraCategory('all')} />
                </Badge>
              )}
              {activeTab === 'flora' && floraConservation !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {floraConservation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFloraConservation('all')} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'fauna' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fauna')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <PawPrint className="h-6 w-6" />
          Fauna ({filteredFauna.length})
        </Button>
        <Button
          variant={activeTab === 'flora' ? 'default' : 'outline'}
          onClick={() => setActiveTab('flora')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <TreeDeciduous className="h-6 w-6" />
          Flora ({filteredFlora.length})
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Fauna Tab */}
      {!loading && activeTab === 'fauna' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedFauna.length > 0 ? (
              paginatedFauna.map((item) => (
                <FaunaCard key={item.id} item={item} onZoom={handleZoom} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {searchTerm || faunaCategory !== 'all' || faunaConservation !== 'all' 
                  ? 'Nenhuma espécie encontrada para os filtros selecionados.' 
                  : 'Nenhuma espécie de fauna cadastrada.'}
              </div>
            )}
          </div>
          
          {/* Load More Button */}
          {hasMoreFauna && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setFaunaPage(p => p + 1)}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Carregar mais ({filteredFauna.length - paginatedFauna.length} restantes)
              </Button>
            </div>
          )}
        </>
      )}

      {/* Flora Tab */}
      {!loading && activeTab === 'flora' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedFlora.length > 0 ? (
              paginatedFlora.map((item) => (
                <FloraCard key={item.id} item={item} onZoom={handleZoom} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {searchTerm || floraCategory !== 'all' || floraConservation !== 'all'
                  ? 'Nenhuma espécie encontrada para os filtros selecionados.' 
                  : 'Nenhuma espécie de flora cadastrada.'}
              </div>
            )}
          </div>
          
          {/* Load More Button */}
          {hasMoreFlora && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setFloraPage(p => p + 1)}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Carregar mais ({filteredFlora.length - paginatedFlora.length} restantes)
              </Button>
            </div>
          )}
        </>
      )}

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
