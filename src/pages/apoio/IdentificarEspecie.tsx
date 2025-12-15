import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Bird, PawPrint, Leaf, TreeDeciduous, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
}

interface EspecieFlora {
  id: string;
  "Nome Popular": string | null;
  "Nome Científico": string | null;
  Classe: string | null;
  Ordem: string | null;
  Família: string | null;
  "Estado de Conservação": string | null;
  "Tipo de Planta": string | null;
  "Madeira de Lei": string | null;
  "Imune ao Corte": string | null;
}

const FAUNA_GROUPS = [
  { key: 'Aves', label: 'Aves', icon: Bird },
  { key: 'Mammalia', label: 'Mamíferos', icon: PawPrint },
  { key: 'Reptilia', label: 'Répteis', icon: PawPrint },
  { key: 'Actinopterygii', label: 'Peixes', icon: PawPrint },
];

const FLORA_GROUPS = [
  { key: 'madeira_lei', label: 'Madeira de Lei', filter: (e: EspecieFlora) => e["Madeira de Lei"] === 'Sim' },
  { key: 'ornamental', label: 'Ornamental', filter: (e: EspecieFlora) => e["Tipo de Planta"] === 'Ornamental' },
  { key: 'frutifera', label: 'Frutífera / Exótica', filter: (e: EspecieFlora) => e["Tipo de Planta"] === 'Frutífera' || e["Tipo de Planta"] === 'Exótica' },
  { key: 'imune_corte', label: 'Espécies Imune ao Corte', filter: (e: EspecieFlora) => e["Imune ao Corte"] === 'Sim' },
];

const IdentificarEspecie: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [especiesFlora, setEspeciesFlora] = useState<EspecieFlora[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fauna' | 'flora'>('fauna');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [faunaRes, floraRes] = await Promise.all([
          supabase.from('dim_especies_fauna').select('*').order('nome_popular'),
          supabase.from('dim_especies_flora').select('*').order('Nome Popular'),
        ]);

        if (faunaRes.error) throw faunaRes.error;
        if (floraRes.error) throw floraRes.error;

        setEspeciesFauna(faunaRes.data || []);
        setEspeciesFlora(floraRes.data || []);
      } catch (error) {
        console.error('Erro ao buscar espécies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filterFaunaByGroup = (classe: string) => {
    return especiesFauna.filter((e) => {
      const matchesClass = e.classe_taxonomica === classe;
      const matchesSearch =
        searchTerm === '' ||
        e.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
  };

  const filterFloraByGroup = (filterFn: (e: EspecieFlora) => boolean) => {
    return especiesFlora.filter((e) => {
      const matchesGroup = filterFn(e);
      const matchesSearch =
        searchTerm === '' ||
        (e["Nome Popular"] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e["Nome Científico"] || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  };

  const renderFaunaCard = (especie: EspecieFauna) => (
    <Card key={especie.id} className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
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

  const renderFloraCard = (especie: EspecieFlora) => (
    <Card key={especie.id} className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {especie["Nome Popular"] || 'Nome não disponível'}
        </h3>
        <p className="text-sm text-muted-foreground italic mb-3">
          {especie["Nome Científico"] || '-'}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Classe: </span>
            <span className="text-foreground">{especie.Classe || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ordem: </span>
            <span className="text-foreground">{especie.Ordem || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Família: </span>
            <span className="text-foreground">{especie.Família || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conservação: </span>
            <span className="text-foreground">{especie["Estado de Conservação"] || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tipo: </span>
            <span className="text-foreground">{especie["Tipo de Planta"] || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Madeira de Lei: </span>
            <span className="text-foreground">{especie["Madeira de Lei"] || '-'}</span>
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
                              {species.map(renderFaunaCard)}
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
                              {species.map(renderFloraCard)}
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
