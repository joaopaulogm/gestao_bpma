
import React, { useState, useEffect, useCallback } from 'react';
import FormSection from './FormSection';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getFaunaImageUrl } from '@/services/especieService';
import { AISpeciesIdentifier } from '@/components/species/AISpeciesIdentifier';
import { toast } from 'sonner';

export interface EspecieItem {
  id: string;
  especieId: string;
  classeTaxonomica: string;
  nomeCientifico: string;
  ordemTaxonomica: string;
  estadoConservacao: string;
  tipoFauna: string;
  estadoSaude: string;
  atropelamento: string;
  estagioVida: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidadeJovem: number;
  quantidadeTotal: number;
  desfechoResgate: string;
  destinacao: string;
  numeroTermoEntrega: string;
  horaGuardaCEAPA: string;
  motivoEntregaCEAPA: string;
  latitudeSoltura: string;
  longitudeSoltura: string;
  outroDestinacao: string;
}

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  familia_taxonomica: string | null;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imagens_paths?: any;
}

interface DimensionItem {
  id: string;
  nome: string;
}

interface EspeciesMultiplasSectionProps {
  especies: EspecieItem[];
  onEspeciesChange: (especies: EspecieItem[]) => void;
  isEvadido?: boolean;
  errors?: Record<string, { message?: string }>;
}

const EspeciesMultiplasSection: React.FC<EspeciesMultiplasSectionProps> = ({
  especies,
  onEspeciesChange,
  isEvadido = false,
  errors
}) => {
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [classesTaxonomicas, setClassesTaxonomicas] = useState<string[]>([]);
  const [classesCount, setClassesCount] = useState<Record<string, number>>({});
  const [classeSearchById, setClasseSearchById] = useState<Record<string, string>>({});
  const [especieSearchById, setEspecieSearchById] = useState<Record<string, string>>({});
  const [estadosSaude, setEstadosSaude] = useState<DimensionItem[]>([]);
  const [estagiosVida, setEstagiosVida] = useState<DimensionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar todas as espécies de uma vez (são menos de 300 registros)
        const { data: allSpecies, error } = await supabase
          .from('dim_especies_fauna')
          .select('id, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, familia_taxonomica, tipo_de_fauna, estado_de_conservacao, imagens_paths')
          .order('nome_popular', { ascending: true });

        if (error) {
          console.error('Erro ao carregar espécies:', error);
        }

        const speciesList = (allSpecies as EspecieFauna[]) || [];
        console.log('=== DEBUG CARREGAMENTO ESPÉCIES ===');
        console.log('Total de espécies carregadas:', speciesList.length);
        console.log('Primeiras 10 espécies:', speciesList.slice(0, 10).map(e => ({
          nome: e.nome_popular,
          classe: e.classe_taxonomica,
          classeRaw: JSON.stringify(e.classe_taxonomica)
        })));

        if (speciesList.length > 0) {
          setEspeciesFauna(speciesList);

          // Extract unique classes + counts (normalized for safety)
          // Usar o valor original da primeira ocorrência para preservar acentos e formatação
          const counts: Record<string, number> = {};
          const displayByNorm: Record<string, string> = {};
          const todasClasses: string[] = [];

          speciesList.forEach((e) => {
            const raw = (e.classe_taxonomica ?? '').trim();
            if (!raw) return;
            
            // Adicionar à lista de todas as classes (para debug)
            todasClasses.push(raw);
            
            // Normalizar para comparação (maiúsculas, sem espaços extras)
            const norm = raw.toUpperCase().trim();
            // Preservar o valor original da primeira ocorrência encontrada
            if (!displayByNorm[norm]) {
              displayByNorm[norm] = raw;
            }
            counts[norm] = (counts[norm] ?? 0) + 1;
          });

          // Ordenar classes mantendo o valor original (com acentos)
          const classes = Object.keys(displayByNorm)
            .map((norm) => displayByNorm[norm])
            .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

          setClassesTaxonomicas(classes);
          setClassesCount(counts);

          console.log('=== RESUMO ===');
          console.log('Total de espécies:', speciesList.length);
          console.log('Todas as classes encontradas (com duplicatas):', [...new Set(todasClasses)]);
          console.log('Classes únicas normalizadas:', Object.keys(displayByNorm));
          console.log('Classes finais para exibição:', classes);
          console.log('Contagem por classe:', counts);
          console.log('=== FIM DEBUG ===');
        } else {
          console.warn('Nenhuma espécie encontrada na tabela dim_especies_fauna');
        }

        // Fetch dimension tables (desfecho do resgate é único por registro, na seção Desfecho)
        const [estadosSaudeRes, estagiosVidaRes] = await Promise.all([
          supabase.from('dim_estado_saude').select('id, nome').order('nome', { ascending: true }),
          supabase.from('dim_estagio_vida').select('id, nome').order('nome', { ascending: true })
        ]);

        if (estadosSaudeRes.data) setEstadosSaude(estadosSaudeRes.data);
        if (estagiosVidaRes.data) setEstagiosVida(estagiosVidaRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const normalizeClasse = (v?: string | null) => (v ?? '').trim().toUpperCase();

  // Memoizar resultado para evitar recálculos desnecessários
  const getEspeciesPorClasse = useCallback((classe: string) => {
    if (!classe || !especiesFauna.length) return [];
    // Normalizar a classe selecionada para comparação
    const wanted = normalizeClasse(classe);
    // Filtrar espécies pela classe (comparação case-insensitive)
    const especiesFiltradas = especiesFauna.filter((e) => {
      const especieClasse = normalizeClasse(e.classe_taxonomica);
      return especieClasse === wanted;
    });
    
    // Ordenar por nome popular
    return especiesFiltradas.sort((a, b) => 
      (a.nome_popular || '').localeCompare(b.nome_popular || '', 'pt-BR')
    );
  }, [especiesFauna]);

  const handleAddEspecie = () => {
    const novaEspecie: EspecieItem = {
      id: generateId(),
      especieId: '',
      classeTaxonomica: '',
      nomeCientifico: '',
      ordemTaxonomica: '',
      estadoConservacao: '',
      tipoFauna: '',
      estadoSaude: '',
      atropelamento: '',
      estagioVida: '',
      quantidadeAdulto: 0,
      quantidadeFilhote: 0,
      quantidadeJovem: 0,
      quantidadeTotal: 0,
      desfechoResgate: '',
      destinacao: '',
      numeroTermoEntrega: '',
      horaGuardaCEAPA: '',
      motivoEntregaCEAPA: '',
      latitudeSoltura: '',
      longitudeSoltura: '',
      outroDestinacao: ''
    };
    onEspeciesChange([...especies, novaEspecie]);
  };

  const handleRemoveEspecie = (id: string) => {
    onEspeciesChange(especies.filter(e => e.id !== id));
  };

  const handleEspecieChange = (id: string, field: keyof EspecieItem, value: string | number) => {
    const updated = especies.map(e => {
      if (e.id !== id) return e;

      const updatedEspecie = { ...e, [field]: value };

      // Se mudou a classe, limpa a espécie e campos relacionados
      if (field === 'classeTaxonomica') {
        updatedEspecie.especieId = '';
        updatedEspecie.nomeCientifico = '';
        updatedEspecie.ordemTaxonomica = '';
        updatedEspecie.estadoConservacao = '';
        updatedEspecie.tipoFauna = '';
        // Limpar busca de espécie quando classe muda
        setEspecieSearchById((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }

      // Se selecionou uma espécie, preenche os detalhes e sincroniza classe
      if (field === 'especieId') {
        // Se value for vazio, limpar campos
        if (!value || value === '') {
          updatedEspecie.nomeCientifico = '';
          updatedEspecie.ordemTaxonomica = '';
          updatedEspecie.estadoConservacao = '';
          updatedEspecie.tipoFauna = '';
        } else {
          const especie = especiesFauna.find(ef => ef.id === value);
          if (especie) {
            updatedEspecie.nomeCientifico = especie.nome_cientifico || '';
            updatedEspecie.ordemTaxonomica = especie.ordem_taxonomica || '';
            updatedEspecie.estadoConservacao = especie.estado_de_conservacao || '';
            updatedEspecie.tipoFauna = especie.tipo_de_fauna || '';
            
            // Sincronizar classe taxonômica se estiver vazia ou diferente
            const especieClasse = especie.classe_taxonomica || '';
            if (especieClasse && (!updatedEspecie.classeTaxonomica || 
                normalizeClasse(updatedEspecie.classeTaxonomica) !== normalizeClasse(especieClasse))) {
              updatedEspecie.classeTaxonomica = especieClasse;
            }
          } else {
            // Se espécie não encontrada, limpar campos mas manter classe
            console.warn(`Espécie com ID ${value} não encontrada`);
            updatedEspecie.nomeCientifico = '';
            updatedEspecie.ordemTaxonomica = '';
            updatedEspecie.estadoConservacao = '';
            updatedEspecie.tipoFauna = '';
          }
        }
      }

      // Recalcula quantidade total
      if (field === 'quantidadeAdulto' || field === 'quantidadeFilhote' || field === 'quantidadeJovem') {
        const adultos = field === 'quantidadeAdulto' ? (value as number) : updatedEspecie.quantidadeAdulto;
        const filhotes = field === 'quantidadeFilhote' ? (value as number) : updatedEspecie.quantidadeFilhote;
        const jovens = field === 'quantidadeJovem' ? (value as number) : updatedEspecie.quantidadeJovem;
        updatedEspecie.quantidadeTotal = adultos + filhotes + jovens;
      }

      return updatedEspecie;
    });
    onEspeciesChange(updated);
  };

  const getQuantidadeField = (tipo: 'adulto' | 'filhote' | 'jovem'): keyof EspecieItem => {
    if (tipo === 'adulto') return 'quantidadeAdulto';
    if (tipo === 'filhote') return 'quantidadeFilhote';
    return 'quantidadeJovem';
  };

  const handleQuantidadeChange = (id: string, tipo: 'adulto' | 'filhote' | 'jovem', operacao: 'aumentar' | 'diminuir') => {
    const especie = especies.find(e => e.id === id);
    if (!especie) return;

    const field = getQuantidadeField(tipo);
    const currentValue = Number(especie[field]) || 0;
    const newValue = operacao === 'aumentar' ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleEspecieChange(id, field, newValue);
  };

  const renderEspeciesSelectContent = (
    isLoading: boolean,
    esp: EspecieItem,
    searchById: Record<string, string>,
    getPorClasse: (classe: string) => EspecieFauna[]
  ) => {
    if (isLoading) {
      return (
        <div className="p-3 text-center text-muted-foreground text-sm">Carregando espécies...</div>
      );
    }
    if (!esp.classeTaxonomica) {
      return (
        <div className="p-3 text-center text-muted-foreground text-sm">Selecione uma classe primeiro</div>
      );
    }
    const especiesFiltradas = getPorClasse(esp.classeTaxonomica);
    const searchTerm = (searchById[esp.id] ?? '').trim().toLowerCase();
    const especiesComBusca = searchTerm
      ? especiesFiltradas.filter((ef) =>
          (ef.nome_popular ?? '').toLowerCase().includes(searchTerm)
        )
      : especiesFiltradas;
    if (especiesComBusca.length === 0) {
      return (
        <div className="p-3 text-center text-muted-foreground text-sm">
          {searchTerm ? 'Nenhuma espécie encontrada' : 'Nenhuma espécie disponível para esta classe'}
        </div>
      );
    }
    return especiesComBusca.map((ef) => (
      <SelectItem key={ef.id} value={ef.id}>
        {ef.nome_popular}
      </SelectItem>
    ));
  };

  return (
    <FormSection title="Identificação das Espécies">
      {isEvadido && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Como o desfecho é "Evadido", os campos nesta seção são opcionais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Identificação por Foto */}
      <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Identificar Espécie por Foto</h4>
            <p className="text-xs text-muted-foreground">
              Use a inteligência artificial para identificar a espécie através de uma foto
            </p>
          </div>
          <AISpeciesIdentifier
            tipo="fauna"
            onIdentified={(result) => {
              if (result.identificado && result.nome_popular) {
                // Buscar a espécie no banco usando o nome popular ou científico
                const especieEncontrada = especiesFauna.find(
                  e => e.nome_popular?.toLowerCase() === result.nome_popular?.toLowerCase() ||
                       e.nome_cientifico?.toLowerCase() === result.nome_cientifico?.toLowerCase()
                );
                
                if (especieEncontrada) {
                  // Adicionar nova espécie com dados preenchidos
                  const novaEspecie: EspecieItem = {
                    id: `temp-${Date.now()}`,
                    especieId: especieEncontrada.id,
                    classeTaxonomica: especieEncontrada.classe_taxonomica || '',
                    nomeCientifico: especieEncontrada.nome_cientifico || '',
                    ordemTaxonomica: especieEncontrada.ordem_taxonomica || '',
                    estadoConservacao: especieEncontrada.estado_de_conservacao || '',
                    tipoFauna: especieEncontrada.tipo_de_fauna || '',
                    estadoSaude: '',
                    atropelamento: '',
                    estagioVida: '',
                    quantidadeAdulto: 0,
                    quantidadeFilhote: 0,
                    quantidadeJovem: 0,
                    quantidadeTotal: 0,
                    desfechoResgate: '',
                    destinacao: '',
                    numeroTermoEntrega: '',
                    horaGuardaCEAPA: '',
                    motivoEntregaCEAPA: '',
                    latitudeSoltura: '',
                    longitudeSoltura: '',
                    outroDestinacao: ''
                  };
                  onEspeciesChange([...especies, novaEspecie]);
                } else if (result.especie_id) {
                  // Se a IA retornou um ID de espécie (encontrado no banco)
                  const especiePorId = especiesFauna.find(e => e.id === result.especie_id);
                  if (especiePorId) {
                    const novaEspecie: EspecieItem = {
                      id: `temp-${Date.now()}`,
                      especieId: especiePorId.id,
                      classeTaxonomica: especiePorId.classe_taxonomica || '',
                      nomeCientifico: especiePorId.nome_cientifico || '',
                      ordemTaxonomica: especiePorId.ordem_taxonomica || '',
                      estadoConservacao: especiePorId.estado_de_conservacao || '',
                      tipoFauna: especiePorId.tipo_de_fauna || '',
                      estadoSaude: '',
                      atropelamento: '',
                      estagioVida: '',
                      quantidadeAdulto: 0,
                      quantidadeFilhote: 0,
                      quantidadeJovem: 0,
                      quantidadeTotal: 0,
                      desfechoResgate: '',
                      destinacao: '',
                      numeroTermoEntrega: '',
                      horaGuardaCEAPA: '',
                      motivoEntregaCEAPA: '',
                      latitudeSoltura: '',
                      longitudeSoltura: '',
                      outroDestinacao: ''
                    };
                    onEspeciesChange([...especies, novaEspecie]);
                  }
                } else {
                  // Espécie não encontrada no banco - mostrar aviso e permitir adicionar manualmente
                  toast.warning(
                    result.aviso || 
                    'Espécie identificada mas não encontrada no banco. Adicione manualmente.',
                    { duration: 5000 }
                  );
                }
              }
            }}
          />
        </div>
      </div>

      {especies.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma espécie adicionada. Use a identificação por foto acima ou clique no botão abaixo para adicionar manualmente.
        </div>
      )}

      {especies.map((especie, index) => (
        <div key={especie.id} className="border rounded-lg p-4 mb-4 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-secondary">Espécie {index + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveEspecie(especie.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField id={`classeTaxonomica-${especie.id}`} label="Classe Taxonômica" required={!isEvadido}>
              <Select
                value={especie.classeTaxonomica}
                onValueChange={(value) => handleEspecieChange(especie.id, 'classeTaxonomica', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione a classe"} />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]" position="popper" sideOffset={4}>
                  <div className="p-2 bg-background border-b sticky top-0 z-10">
                    <Input
                      value={classeSearchById[especie.id] ?? ''}
                      onChange={(e) =>
                        setClasseSearchById((prev) => ({ ...prev, [especie.id]: e.target.value }))
                      }
                      placeholder="Buscar classe..."
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                  {loading ? (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      Carregando classes...
                    </div>
                  ) : (() => {
                    const searchTerm = (classeSearchById[especie.id] ?? '').trim().toLowerCase();
                    const filtered = classesTaxonomicas.filter((c) =>
                      (c ?? '').toLowerCase().includes(searchTerm)
                    );
                    
                    // Debug: log das classes filtradas
                    if (searchTerm) {
                      console.log('Filtrando classes com termo:', searchTerm, 'Resultado:', filtered);
                    }
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="p-3 text-center text-muted-foreground text-sm">
                          Nenhuma classe encontrada
                        </div>
                      );
                    }
                    
                    return filtered.map((classe) => {
                      const count = classesCount[normalizeClasse(classe)] ?? 0;
                      return (
                        <SelectItem key={classe} value={classe}>
                          {classe} ({count})
                        </SelectItem>
                      );
                    });
                  })()}
                  </div>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`especieId-${especie.id}`} label="Espécie (Nome Popular)" required={!isEvadido}>
              <Select
                value={especie.especieId}
                onValueChange={(value) => handleEspecieChange(especie.id, 'especieId', value)}
                disabled={loading || !especie.classeTaxonomica}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={especie.classeTaxonomica ? "Selecione a espécie" : "Selecione a classe primeiro"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-background z-[100]" position="popper" sideOffset={4}>
                  <div className="p-2 bg-background border-b sticky top-0 z-10">
                    <Input
                      value={especieSearchById[especie.id] ?? ''}
                      onChange={(e) =>
                        setEspecieSearchById((prev) => ({ ...prev, [especie.id]: e.target.value }))
                      }
                      placeholder="Buscar espécie..."
                      disabled={!especie.classeTaxonomica}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {renderEspeciesSelectContent(loading, especie, especieSearchById, getEspeciesPorClasse)}
                  </div>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Card de Detalhes da Espécie - aparece após seleção */}
          {especie.especieId && (() => {
            const selectedEspecie = especiesFauna.find(ef => ef.id === especie.especieId);
            if (!selectedEspecie) return null;
            return (
              <div className="md:col-span-2 mt-2 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                {/* Header com nome da espécie */}
                <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {selectedEspecie.nome_popular}
                    <span className="font-normal text-muted-foreground italic text-sm">
                      ({selectedEspecie.nome_cientifico})
                    </span>
                  </h4>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Informações Taxonômicas em layout elegante */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ordem</p>
                      <p className="text-sm font-medium text-foreground">{selectedEspecie.ordem_taxonomica || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Família</p>
                      <p className="text-sm font-medium text-foreground">{selectedEspecie.familia_taxonomica || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tipo</p>
                      <p className="text-sm font-medium text-foreground">{selectedEspecie.tipo_de_fauna || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conservação</p>
                      <p className="text-sm font-medium text-foreground">{selectedEspecie.estado_de_conservacao || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Classe</p>
                      <p className="text-sm font-medium text-foreground">{selectedEspecie.classe_taxonomica || '—'}</p>
                    </div>
                  </div>

                  {/* Galeria de Fotos */}
                  {(() => {
                    const imagensPaths = Array.isArray(selectedEspecie.imagens_paths) 
                      ? selectedEspecie.imagens_paths as string[]
                      : [];
                    if (imagensPaths.length === 0) return null;
                    return (
                      <div className="pt-3 border-t border-primary/10">
                        <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Fotos da Espécie</p>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                          {imagensPaths.slice(0, 6).map((filename) => (
                            <div 
                              key={filename} 
                              className="aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm hover:shadow-md transition-shadow"
                            >
                              <img
                                src={getFaunaImageUrl(filename)}
                                alt={`${selectedEspecie.nome_popular} ${filename}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField id={`estadoSaude-${especie.id}`} label="Estado de Saúde" required={!isEvadido}>
              <Select
                value={especie.estadoSaude}
                onValueChange={(value) => handleEspecieChange(especie.id, 'estadoSaude', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado de saúde" />
                </SelectTrigger>
                <SelectContent>
                  {estadosSaude.map((estado) => (
                    <SelectItem key={estado.id} value={estado.nome}>{estado.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`atropelamento-${especie.id}`} label="Atropelamento" required={!isEvadido}>
              <Select
                value={especie.atropelamento}
                onValueChange={(value) => handleEspecieChange(especie.id, 'atropelamento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={`estagioVida-${especie.id}`} label="Estágio da Vida" required={!isEvadido}>
              <Select
                value={especie.estagioVida}
                onValueChange={(value) => handleEspecieChange(especie.id, 'estagioVida', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  {estagiosVida.map((estagio) => (
                    <SelectItem key={estagio.id} value={estagio.nome}>{estagio.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField id={`quantidadeAdulto-${especie.id}`} label="Quantidade Adultos" required={!isEvadido}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'adulto', 'diminuir')}
                  >
                    -
                  </Button>
                  <Input
                    value={especie.quantidadeAdulto}
                    readOnly
                    className="text-center w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'adulto', 'aumentar')}
                  >
                    +
                  </Button>
                </div>
              </FormField>

              <FormField id={`quantidadeFilhote-${especie.id}`} label="Quantidade Filhotes" required={!isEvadido}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'filhote', 'diminuir')}
                  >
                    -
                  </Button>
                  <Input
                    value={especie.quantidadeFilhote}
                    readOnly
                    className="text-center w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'filhote', 'aumentar')}
                  >
                    +
                  </Button>
                </div>
              </FormField>

              <FormField id={`quantidadeJovem-${especie.id}`} label="Quantidade Jovem" required={!isEvadido}>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'jovem', 'diminuir')}
                  >
                    -
                  </Button>
                  <Input
                    value={especie.quantidadeJovem}
                    readOnly
                    className="text-center w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantidadeChange(especie.id, 'jovem', 'aumentar')}
                  >
                    +
                  </Button>
                </div>
              </FormField>

              <FormField id={`quantidadeTotal-${especie.id}`} label="Quantidade Total">
                <Input
                  value={especie.quantidadeTotal}
                  readOnly
                  className="bg-muted text-center font-semibold"
                />
              </FormField>
            </div>

            {/* Desfecho do Resgate: removido daqui; usar apenas a seção "Desfecho do Resgate" (um por registro). */}

            {/* Destinação por Espécie */}
            <div className="md:col-span-2 pt-4 border-t mt-4">
              <h5 className="font-medium text-secondary mb-3">Destinação desta Espécie</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id={`destinacao-${especie.id}`} label="Destinação" required={!isEvadido}>
                  <Select
                    value={especie.destinacao}
                    onValueChange={(value) => handleEspecieChange(especie.id, 'destinacao', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a destinação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
                      <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
                      <SelectItem value="HVet/UnB">HVet/UnB</SelectItem>
                      <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
                      <SelectItem value="Soltura">Soltura</SelectItem>
                      <SelectItem value="Vida Livre">Vida Livre</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {(especie.destinacao === 'CETAS/IBAMA' || especie.destinacao === 'HFAUS/IBRAM' || especie.destinacao === 'HVet/UnB') && (
                  <FormField id={`numeroTermoEntrega-${especie.id}`} label="Nº Termo de Entrega" required={false}>
                    <Input
                      value={especie.numeroTermoEntrega}
                      onChange={(e) => handleEspecieChange(especie.id, 'numeroTermoEntrega', e.target.value)}
                      placeholder="Número do termo"
                    />
                  </FormField>
                )}

                {especie.destinacao === 'CEAPA/BPMA' && (
                  <>
                    <FormField id={`horaGuardaCEAPA-${especie.id}`} label="Hora de Guarda no CEAPA" required={!isEvadido}>
                      <Input
                        value={especie.horaGuardaCEAPA}
                        onChange={(e) => handleEspecieChange(especie.id, 'horaGuardaCEAPA', e.target.value)}
                        placeholder="HH:MM (formato 24h)"
                      />
                    </FormField>
                    <FormField id={`motivoEntregaCEAPA-${especie.id}`} label="Motivo" required={!isEvadido} className="md:col-span-2">
                      <Textarea
                        value={especie.motivoEntregaCEAPA}
                        onChange={(e) => handleEspecieChange(especie.id, 'motivoEntregaCEAPA', e.target.value)}
                        placeholder="Descreva o motivo da entrega"
                      />
                    </FormField>
                  </>
                )}

                {especie.destinacao === 'Soltura' && (
                  <>
                    <FormField id={`latitudeSoltura-${especie.id}`} label="Latitude da Soltura" required={!isEvadido}>
                      <Input
                        value={especie.latitudeSoltura}
                        onChange={(e) => handleEspecieChange(especie.id, 'latitudeSoltura', e.target.value)}
                        placeholder="Ex: -15.7801"
                      />
                    </FormField>
                    <FormField id={`longitudeSoltura-${especie.id}`} label="Longitude da Soltura" required={!isEvadido}>
                      <Input
                        value={especie.longitudeSoltura}
                        onChange={(e) => handleEspecieChange(especie.id, 'longitudeSoltura', e.target.value)}
                        placeholder="Ex: -47.9292"
                      />
                    </FormField>
                  </>
                )}

                {especie.destinacao === 'Outros' && (
                  <FormField id={`outroDestinacao-${especie.id}`} label="Especifique a Destinação" required={!isEvadido} className="md:col-span-2">
                    <Textarea
                      value={especie.outroDestinacao}
                      onChange={(e) => handleEspecieChange(especie.id, 'outroDestinacao', e.target.value)}
                      placeholder="Descreva a destinação"
                    />
                  </FormField>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddEspecie}
        className="w-full mt-2 border-dashed border-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Espécie
      </Button>
    </FormSection>
  );
};

export default EspeciesMultiplasSection;
