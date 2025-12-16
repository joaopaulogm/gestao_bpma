import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, ArrowLeft, Bird, PawPrint, Leaf, TreeDeciduous, ImageOff, X, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";

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

// Helper to build public URL for storage images
const getImageUrl = (bucket: string, filename: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
};

// Normalize text for search
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
        {/* Images Gallery */}
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

        {/* Additional Info */}
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
        {/* Images Gallery */}
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

        {/* Additional Info */}
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

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch fauna
        const { data: fauna, error: faunaError } = await supabase
          .from('fauna')
          .select('*')
          .order('nome_popular', { ascending: true });

        if (faunaError) {
          console.error('Error fetching fauna:', faunaError);
        } else {
          setFaunaData(fauna || []);
        }

        // Fetch flora
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

  const handleZoom = useCallback((url: string, name: string) => {
    setZoomImage({ url, name });
  }, []);

  // Filter fauna by search term
  const filteredFauna = useMemo(() => {
    if (!searchTerm.trim()) return faunaData;
    
    const normalizedSearch = normalizeText(searchTerm);
    return faunaData.filter(item => {
      const nomePopular = normalizeText(item.nome_popular || '');
      const nomeCientifico = normalizeText(item.nome_cientifico || '');
      return nomePopular.includes(normalizedSearch) || nomeCientifico.includes(normalizedSearch);
    });
  }, [faunaData, searchTerm]);

  // Filter flora by search term
  const filteredFlora = useMemo(() => {
    if (!searchTerm.trim()) return floraData;
    
    const normalizedSearch = normalizeText(searchTerm);
    return floraData.filter(item => {
      const nomePopular = normalizeText(item.nome_popular || '');
      const nomeCientifico = normalizeText(item.nome_cientifico || '');
      return nomePopular.includes(normalizedSearch) || nomeCientifico.includes(normalizedSearch);
    });
  }, [floraData, searchTerm]);

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

      {/* Search Input */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFauna.length > 0 ? (
            filteredFauna.map((item) => (
              <FaunaCard key={item.id} item={item} onZoom={handleZoom} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm ? 'Nenhuma espécie encontrada para a busca.' : 'Nenhuma espécie de fauna cadastrada.'}
            </div>
          )}
        </div>
      )}

      {/* Flora Tab */}
      {!loading && activeTab === 'flora' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFlora.length > 0 ? (
            filteredFlora.map((item) => (
              <FloraCard key={item.id} item={item} onZoom={handleZoom} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm ? 'Nenhuma espécie encontrada para a busca.' : 'Nenhuma espécie de flora cadastrada.'}
            </div>
          )}
        </div>
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
