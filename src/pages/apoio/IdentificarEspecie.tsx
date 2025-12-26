import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, ArrowLeft, PawPrint, TreeDeciduous, ImageOff, X, ZoomIn, ChevronDown, Bird, Fish, Leaf, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { buscarImagemEspecie, getDirectImageUrl } from '@/services/speciesImageService';

const ITEMS_PER_PAGE = 20;

// Cache for image URLs
const imageCache = new Map<string, string[]>();

// Fauna categories - matching dim_especies_fauna classe_taxonomica values
const FAUNA_CATEGORIES = [
  { value: 'AVE', label: 'Aves', icon: Bird, color: 'bg-sky-500/10 text-sky-600 border-sky-500/30 hover:bg-sky-500/20' },
  { value: 'MAMIFERO', label: 'Mamíferos', icon: PawPrint, color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20' },
  { value: 'REPTIL', label: 'Répteis', icon: Leaf, color: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20' },
  { value: 'PEIXE', label: 'Peixes', icon: Fish, color: 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20' },
];

// Flora categories - matching dim_especies_flora fields
const FLORA_CATEGORIES = [
  { value: 'ornamental', label: 'Ornamental', icon: Leaf, color: 'bg-pink-500/10 text-pink-600 border-pink-500/30 hover:bg-pink-500/20' },
  { value: 'madeira_lei', label: 'Madeira de Lei', icon: TreePine, color: 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20' },
  { value: 'imune_corte', label: 'Imune ao Corte', icon: TreeDeciduous, color: 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20' },
  { value: 'frutifera_exotica', label: 'Frutífera Exótica', icon: Leaf, color: 'bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20' },
];

interface FaunaRecord {
  id: string;
  nome_popular: string | null;
  nome_cientifico: string | null;
  nome_cientifico_slug: string | null;
  imagens: string[] | null;
  imagens_paths: string[] | null;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  estado_de_conservacao: string | null;
  tipo_de_fauna: string | null;
  nomes_populares: string[] | null;
}

interface FloraRecord {
  id: string;
  nome_popular: string | null;
  nome_cientifico: string | null;
  nome_cientifico_slug: string | null;
  imagens: string[] | null;
  imagens_paths: string[] | null;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  familia_taxonomica: string | null;
  estado_de_conservacao: string | null;
  tipo_de_planta: string | null;
  madeira_de_lei: string | null;
  imune_ao_corte: string | null;
  nomes_populares: string[] | null;
}

const getImageUrl = (filename: string, type: 'fauna' | 'flora'): string => {
  const bucket = type === 'fauna' ? 'imagens-fauna' : 'imagens-flora';
  return getDirectImageUrl(bucket, filename);
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Species Image Component with edge function lookup
const SpeciesImage = memo(({ 
  nomeCientifico,
  nomePopular,
  tipo,
  fallbackImages,
  alt, 
  onZoom 
}: { 
  nomeCientifico: string | null;
  nomePopular: string | null;
  tipo: 'fauna' | 'flora';
  fallbackImages: string[];
  alt: string; 
  onZoom: (url: string, name: string) => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      const cacheKey = `${tipo}-${nomeCientifico || nomePopular}`;
      
      // Check cache first
      if (imageCache.has(cacheKey)) {
        const cached = imageCache.get(cacheKey)!;
        if (cached.length > 0) {
          setImageUrl(cached[0]);
        }
        setLoading(false);
        return;
      }

      // If we have fallback images, use them directly
      if (fallbackImages && fallbackImages.length > 0) {
        const url = getImageUrl(fallbackImages[0], tipo);
        imageCache.set(cacheKey, [url]);
        setImageUrl(url);
        setLoading(false);
        return;
      }

      // Fetch from edge function
      try {
        const result = await buscarImagemEspecie(
          nomeCientifico,
          nomePopular,
          tipo,
          null
        );

        if (result.success && result.urls && result.urls.length > 0) {
          imageCache.set(cacheKey, result.urls);
          setImageUrl(result.urls[0]);
        } else {
          imageCache.set(cacheKey, []);
        }
      } catch (err) {
        console.error('Error fetching species image:', err);
        imageCache.set(cacheKey, []);
      }
      setLoading(false);
    };

    fetchImage();
  }, [nomeCientifico, nomePopular, tipo, fallbackImages]);

  if (loading) {
    return (
      <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center animate-pulse" />
    );
  }

  if (error || !imageUrl) {
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
  // Get images from imagens_paths or imagens
  const images = useMemo(() => {
    const paths = item.imagens_paths as string[] | null;
    const imgs = item.imagens as string[] | null;
    return paths && paths.length > 0 ? paths : (imgs || []);
  }, [item.imagens_paths, item.imagens]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="mb-3">
          <SpeciesImage
            nomeCientifico={item.nome_cientifico}
            nomePopular={item.nome_popular}
            tipo="fauna"
            fallbackImages={images}
            alt={item.nome_popular || 'Espécie'}
            onZoom={onZoom}
          />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">{item.nome_popular || 'Sem nome'}</h3>
        {item.nome_cientifico && (
          <p className="text-sm text-muted-foreground italic mb-3">{item.nome_cientifico}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {item.classe_taxonomica && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{item.classe_taxonomica}</span>
          )}
          {item.estado_de_conservacao && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full">{item.estado_de_conservacao}</span>
          )}
          {item.tipo_de_fauna && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-full">{item.tipo_de_fauna}</span>
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
  // Get images from imagens_paths or imagens
  const images = useMemo(() => {
    const paths = item.imagens_paths as string[] | null;
    const imgs = item.imagens as string[] | null;
    return paths && paths.length > 0 ? paths : (imgs || []);
  }, [item.imagens_paths, item.imagens]);

  const isMadeiraLei = item.madeira_de_lei === 'Sim';
  const isImuneCorte = item.imune_ao_corte === 'Sim';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="mb-3">
          <SpeciesImage
            nomeCientifico={item.nome_cientifico}
            nomePopular={item.nome_popular}
            tipo="flora"
            fallbackImages={images}
            alt={item.nome_popular || 'Espécie'}
            onZoom={onZoom}
          />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">{item.nome_popular || 'Sem nome'}</h3>
        {item.nome_cientifico && (
          <p className="text-sm text-muted-foreground italic mb-3">{item.nome_cientifico}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {item.classe_taxonomica && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{item.classe_taxonomica}</span>
          )}
          {isMadeiraLei && (
            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full">Madeira de Lei</span>
          )}
          {isImuneCorte && (
            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full">Imune ao Corte</span>
          )}
          {item.estado_de_conservacao && (
            <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-full">{item.estado_de_conservacao}</span>
          )}
          {item.tipo_de_planta && (
            <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full">{item.tipo_de_planta}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

FloraCard.displayName = 'FloraCard';

// Category Card Component
const CategoryCard = memo(({ 
  label, 
  icon: Icon, 
  color, 
  count, 
  isSelected,
  onClick 
}: { 
  label: string;
  icon: React.ElementType;
  color: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-primary ring-offset-2 border-primary shadow-lg scale-105' 
          : `${color} border`
        }
        ${color}
        min-h-[120px] w-full
      `}
    >
      <Icon className="h-8 w-8 mb-2" />
      <span className="font-semibold text-sm">{label}</span>
      <Badge variant="secondary" className="mt-2 text-xs">
        {count} espécies
      </Badge>
    </button>
  );
});

CategoryCard.displayName = 'CategoryCard';

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'fauna' | 'flora'>('fauna');
  const [faunaData, setFaunaData] = useState<FaunaRecord[]>([]);
  const [floraData, setFloraData] = useState<FloraRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);
  
  // Filters
  const [faunaCategory, setFaunaCategory] = useState<string | null>(null);
  const [floraCategory, setFloraCategory] = useState<string | null>(null);
  const [faunaConservation, setFaunaConservation] = useState('all');
  const [floraConservation, setFloraConservation] = useState('all');
  
  // Pagination
  const [faunaPage, setFaunaPage] = useState(1);
  const [floraPage, setFloraPage] = useState(1);

  // Fetch data from Supabase - using dim_especies tables
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: fauna, error: faunaError } = await supabase
          .from('dim_especies_fauna')
          .select('*')
          .order('nome_popular', { ascending: true });

        if (faunaError) {
          console.error('Error fetching fauna:', faunaError);
        } else {
          setFaunaData((fauna || []) as FaunaRecord[]);
        }

        const { data: flora, error: floraError } = await supabase
          .from('dim_especies_flora')
          .select('*')
          .order('nome_popular', { ascending: true });

        if (floraError) {
          console.error('Error fetching flora:', floraError);
        } else {
          setFloraData((flora || []) as FloraRecord[]);
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
    const statuses = new Set(faunaData.map(item => item.estado_de_conservacao).filter(Boolean));
    return ['all', ...Array.from(statuses)] as string[];
  }, [faunaData]);

  const floraConservationOptions = useMemo(() => {
    const statuses = new Set(floraData.map(item => item.estado_de_conservacao).filter(Boolean));
    return ['all', ...Array.from(statuses)] as string[];
  }, [floraData]);

  // Count fauna by category (classe_taxonomica)
  const faunaCounts = useMemo(() => {
    return FAUNA_CATEGORIES.reduce((acc, cat) => {
      acc[cat.value] = faunaData.filter(item => 
        item.classe_taxonomica?.toUpperCase() === cat.value.toUpperCase()
      ).length;
      return acc;
    }, {} as Record<string, number>);
  }, [faunaData]);

  // Count flora by category
  const floraCounts = useMemo(() => {
    return {
      ornamental: floraData.filter(item => 
        item.tipo_de_planta?.toLowerCase().includes('ornamental')
      ).length,
      madeira_lei: floraData.filter(item => item.madeira_de_lei === 'Sim').length,
      imune_corte: floraData.filter(item => item.imune_ao_corte === 'Sim').length,
      frutifera_exotica: floraData.filter(item => 
        item.tipo_de_planta?.toLowerCase().includes('frutífera') || 
        item.tipo_de_planta?.toLowerCase().includes('frutifera') ||
        item.tipo_de_planta?.toLowerCase().includes('exótica') ||
        item.tipo_de_planta?.toLowerCase().includes('exotica')
      ).length,
    };
  }, [floraData]);

  // Filter fauna
  const filteredFauna = useMemo(() => {
    let result = faunaData;

    // Search filter - also search nomes_populares
    if (searchTerm.trim()) {
      const normalizedSearch = normalizeText(searchTerm);
      result = result.filter(item => {
        const nomePopular = normalizeText(item.nome_popular || '');
        const nomeCientifico = normalizeText(item.nome_cientifico || '');
        const nomesPopulares = (item.nomes_populares || []).map(n => normalizeText(n)).join(' ');
        return nomePopular.includes(normalizedSearch) || 
               nomeCientifico.includes(normalizedSearch) ||
               nomesPopulares.includes(normalizedSearch);
      });
    }

    // Category filter (classe_taxonomica)
    if (faunaCategory) {
      result = result.filter(item => 
        item.classe_taxonomica?.toUpperCase() === faunaCategory.toUpperCase()
      );
    }

    // Conservation status filter
    if (faunaConservation !== 'all') {
      result = result.filter(item => item.estado_de_conservacao === faunaConservation);
    }

    return result;
  }, [faunaData, searchTerm, faunaCategory, faunaConservation]);

  // Filter flora
  const filteredFlora = useMemo(() => {
    let result = floraData;

    // Search filter - also search nomes_populares
    if (searchTerm.trim()) {
      const normalizedSearch = normalizeText(searchTerm);
      result = result.filter(item => {
        const nomePopular = normalizeText(item.nome_popular || '');
        const nomeCientifico = normalizeText(item.nome_cientifico || '');
        const nomesPopulares = (item.nomes_populares || []).map(n => normalizeText(n)).join(' ');
        return nomePopular.includes(normalizedSearch) || 
               nomeCientifico.includes(normalizedSearch) ||
               nomesPopulares.includes(normalizedSearch);
      });
    }

    // Category filter
    if (floraCategory) {
      switch (floraCategory) {
        case 'ornamental':
          result = result.filter(item => item.tipo_de_planta?.toLowerCase().includes('ornamental'));
          break;
        case 'madeira_lei':
          result = result.filter(item => item.madeira_de_lei === 'Sim');
          break;
        case 'imune_corte':
          result = result.filter(item => item.imune_ao_corte === 'Sim');
          break;
        case 'frutifera_exotica':
          result = result.filter(item => 
            item.tipo_de_planta?.toLowerCase().includes('frutífera') || 
            item.tipo_de_planta?.toLowerCase().includes('frutifera') ||
            item.tipo_de_planta?.toLowerCase().includes('exótica') ||
            item.tipo_de_planta?.toLowerCase().includes('exotica')
          );
          break;
      }
    }

    // Conservation status filter
    if (floraConservation !== 'all') {
      result = result.filter(item => item.estado_de_conservacao === floraConservation);
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
    setFaunaCategory(null);
    setFloraCategory(null);
    setFaunaConservation('all');
    setFloraConservation('all');
  };

  const hasActiveFilters = searchTerm || 
    faunaCategory || 
    floraCategory || 
    faunaConservation !== 'all' || 
    floraConservation !== 'all';

  const handleFaunaCategoryClick = (value: string) => {
    setFaunaCategory(faunaCategory === value ? null : value);
  };

  const handleFloraCategoryClick = (value: string) => {
    setFloraCategory(floraCategory === value ? null : value);
  };

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

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'fauna' ? 'default' : 'outline'}
          onClick={() => setActiveTab('fauna')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <PawPrint className="h-6 w-6" />
          Fauna ({faunaData.length})
        </Button>
        <Button
          variant={activeTab === 'flora' ? 'default' : 'outline'}
          onClick={() => setActiveTab('flora')}
          className="flex-1 h-16 text-lg gap-3"
        >
          <TreeDeciduous className="h-6 w-6" />
          Flora ({floraData.length})
        </Button>
      </div>

      {/* Category Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {activeTab === 'fauna' ? (
            FAUNA_CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.value}
                label={cat.label}
                icon={cat.icon}
                color={cat.color}
                count={faunaCounts[cat.value] || 0}
                isSelected={faunaCategory === cat.value}
                onClick={() => handleFaunaCategoryClick(cat.value)}
              />
            ))
          ) : (
            FLORA_CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.value}
                label={cat.label}
                icon={cat.icon}
                color={cat.color}
                count={floraCounts[cat.value] || 0}
                isSelected={floraCategory === cat.value}
                onClick={() => handleFloraCategoryClick(cat.value)}
              />
            ))
          )}
        </div>
      )}

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
            <span className="text-sm font-medium text-muted-foreground">Estado de Conservação:</span>

            {activeTab === 'fauna' ? (
              <Select value={faunaConservation} onValueChange={setFaunaConservation}>
                <SelectTrigger className="w-[200px] bg-background/50">
                  <SelectValue placeholder="Estado de Conservação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {faunaConservationOptions.filter(s => s !== 'all').map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={floraConservation} onValueChange={setFloraConservation}>
                <SelectTrigger className="w-[200px] bg-background/50">
                  <SelectValue placeholder="Estado de Conservação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {floraConservationOptions.filter(s => s !== 'all').map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
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
              {activeTab === 'fauna' && faunaCategory && (
                <Badge variant="secondary" className="gap-1">
                  {FAUNA_CATEGORIES.find(c => c.value === faunaCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFaunaCategory(null)} />
                </Badge>
              )}
              {activeTab === 'fauna' && faunaConservation !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {faunaConservation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFaunaConservation('all')} />
                </Badge>
              )}
              {activeTab === 'flora' && floraCategory && (
                <Badge variant="secondary" className="gap-1">
                  {FLORA_CATEGORIES.find(c => c.value === floraCategory)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFloraCategory(null)} />
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

      {/* Results Count */}
      {!loading && (
        <p className="text-sm text-muted-foreground mb-4">
          Exibindo {activeTab === 'fauna' ? paginatedFauna.length : paginatedFlora.length} de {activeTab === 'fauna' ? filteredFauna.length : filteredFlora.length} espécies
        </p>
      )}

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
                {hasActiveFilters 
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
                {hasActiveFilters
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
