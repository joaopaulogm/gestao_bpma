import React, { useState, useEffect, useRef } from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export interface FaunaItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classeTaxonomica: string;
  ordemTaxonomica: string;
  tipoFauna: string;
  estadoConservacao: string;
  estadoSaudeId: string;
  estagioVidaId: string;
  atropelamento: string;
  quantidadeAdulto: number;
  quantidadeFilhote: number;
  quantidadeTotal: number;
  destinacao: string;
  estagioVidaObitoId: string;
  quantidadeAdultoObito: number;
  quantidadeFilhoteObito: number;
  quantidadeTotalObito: number;
}

interface FaunaSectionProps {
  faunaItems: FaunaItem[];
  onFaunaItemsChange: (items: FaunaItem[]) => void;
  getFieldError: (field: any) => string | undefined;
}

interface EspecieFauna {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  ordem_taxonomica: string;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
}

const DESTINACOES_FAUNA = [
  "CETAS-IBAMA",
  "HFAUS-IBRAM",
  "Óbito"
];

const FaunaSection: React.FC<FaunaSectionProps> = ({
  faunaItems,
  onFaunaItemsChange,
  getFieldError
}) => {
  const [especiesFauna, setEspeciesFauna] = useState<EspecieFauna[]>([]);
  const [classesTaxonomicas, setClassesTaxonomicas] = useState<string[]>([]);
  const [estadosSaude, setEstadosSaude] = useState<Array<{ id: string; nome: string }>>([]);
  const [estagiosVida, setEstagiosVida] = useState<Array<{ id: string; nome: string }>>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carregar espécies com paginação
        const PAGE_SIZE = 1000;
        let allEspecies: any[] = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          const { data: pageData, error: pageError } = await supabase
            .from('dim_especies_fauna')
            .select('*')
            .order('nome_popular', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

          if (pageError) {
            console.error('Erro ao carregar espécies:', pageError);
            break;
          }

          if (pageData && pageData.length > 0) {
            allEspecies = [...allEspecies, ...pageData];
            from += PAGE_SIZE;
            hasMore = pageData.length === PAGE_SIZE;
          } else {
            hasMore = false;
          }
        }

        const [estadosResult, estagiosResult] = await Promise.all([
          supabase.from('dim_estado_saude').select('id, nome'),
          supabase.from('dim_estagio_vida').select('id, nome')
        ]);

        const especiesResult = { data: allEspecies, error: null };

        if (especiesResult.data) {
          setEspeciesFauna(especiesResult.data);
          // Extrair classes taxonômicas únicas da coluna classe_taxonomica
          const classes = [...new Set(especiesResult.data.map(e => e.classe_taxonomica).filter(Boolean))].sort((a, b) => 
            (a || '').localeCompare(b || '', 'pt-BR')
          );
          setClassesTaxonomicas(classes);
        }
        if (estadosResult.data) setEstadosSaude(estadosResult.data);
        if (estagiosResult.data) setEstagiosVida(estagiosResult.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const createEmptyFaunaItem = (): FaunaItem => ({
    id: crypto.randomUUID(),
    especieId: '',
    nomePopular: '',
    nomeCientifico: '',
    classeTaxonomica: '',
    ordemTaxonomica: '',
    tipoFauna: '',
    estadoConservacao: '',
    estadoSaudeId: '',
    estagioVidaId: '',
    atropelamento: '',
    quantidadeAdulto: 0,
    quantidadeFilhote: 0,
    quantidadeTotal: 0,
    destinacao: '',
    estagioVidaObitoId: '',
    quantidadeAdultoObito: 0,
    quantidadeFilhoteObito: 0,
    quantidadeTotalObito: 0
  });

  const handleAddItem = () => {
    if (faunaItems.length < 50) {
      onFaunaItemsChange([...faunaItems, createEmptyFaunaItem()]);
    }
  };

  const handleRemoveItem = (id: string) => {
    onFaunaItemsChange(faunaItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FaunaItem, value: string | number) => {
    onFaunaItemsChange(
      faunaItems.map(item => {
        if (item.id !== id) return item;

        // Se mudou a classe taxonômica, limpar espécie
        if (field === 'classeTaxonomica') {
          return {
            ...item,
            classeTaxonomica: value as string,
            especieId: '',
            nomePopular: '',
            nomeCientifico: '',
            ordemTaxonomica: '',
            tipoFauna: '',
            estadoConservacao: ''
          };
        }
        
        // Se mudou a espécie, atualizar os detalhes
        if (field === 'especieId') {
          const especie = especiesFauna.find(e => e.id === value);
          if (especie) {
            return {
              ...item,
              especieId: value as string,
              nomePopular: especie.nome_popular,
              nomeCientifico: especie.nome_cientifico,
              classeTaxonomica: especie.classe_taxonomica,
              ordemTaxonomica: especie.ordem_taxonomica,
              tipoFauna: especie.tipo_de_fauna,
              estadoConservacao: especie.estado_de_conservacao
            };
          }
        }

        // Atualizar quantidades
        if (field === 'quantidadeAdulto' || field === 'quantidadeFilhote') {
          const adulto = field === 'quantidadeAdulto' ? Number(value) : item.quantidadeAdulto;
          const filhote = field === 'quantidadeFilhote' ? Number(value) : item.quantidadeFilhote;
          return {
            ...item,
            [field]: Number(value),
            quantidadeTotal: adulto + filhote
          };
        }

        if (field === 'quantidadeAdultoObito' || field === 'quantidadeFilhoteObito') {
          const adulto = field === 'quantidadeAdultoObito' ? Number(value) : item.quantidadeAdultoObito;
          const filhote = field === 'quantidadeFilhoteObito' ? Number(value) : item.quantidadeFilhoteObito;
          return {
            ...item,
            [field]: Number(value),
            quantidadeTotalObito: adulto + filhote
          };
        }
        
        return { ...item, [field]: value };
      })
    );
  };

  const handleQuantidadeChange = (id: string, field: 'quantidadeAdulto' | 'quantidadeFilhote', increment: boolean) => {
    const item = faunaItems.find(i => i.id === id);
    if (!item) return;
    const currentValue = item[field];
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleItemChange(id, field, newValue);
  };

  const handleQuantidadeObitoChange = (id: string, field: 'quantidadeAdultoObito' | 'quantidadeFilhoteObito', increment: boolean) => {
    const item = faunaItems.find(i => i.id === id);
    if (!item) return;
    const currentValue = item[field];
    const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
    handleItemChange(id, field, newValue);
  };

  // Inicializar com um item vazio se não houver nenhum
  useEffect(() => {
    if (faunaItems.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      onFaunaItemsChange([createEmptyFaunaItem()]);
    }
  }, [faunaItems.length, onFaunaItemsChange]);

  const getEspeciesPorClasse = (classe: string) => {
    if (!classe) return [];
    // Filtrar espécies pela classe taxonômica selecionada (comparação case-insensitive)
    const normalize = (v?: string | null) => (v ?? '').trim().toUpperCase();
    const wanted = normalize(classe);
    const especiesFiltradas = especiesFauna.filter(e => normalize(e.classe_taxonomica) === wanted);
    
    console.log(`Filtrando espécies para classe "${classe}":`, {
      classeSelecionada: classe,
      totalEspecies: especiesFauna.length,
      especiesFiltradas: especiesFiltradas.length
    });
    
    // Ordenar por nome popular
    return especiesFiltradas.sort((a, b) => 
      (a.nome_popular || '').localeCompare(b.nome_popular || '', 'pt-BR')
    );
  };

  return (
    <div className="space-y-6">
      <FormSection title="Identificação das Espécies de Fauna">
        <div className="space-y-4">
          {faunaItems.map((item, index) => (
            <Card key={item.id} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    Espécie {index + 1}
                  </span>
                  {faunaItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Identificação da Espécie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    id={`classeTaxonomica-${item.id}`}
                    label="Classe Taxonômica"
                    required
                  >
                    <Select
                      value={item.classeTaxonomica}
                      onValueChange={(value) => handleItemChange(item.id, 'classeTaxonomica', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione a classe"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classesTaxonomicas.map((classe) => (
                          <SelectItem key={classe} value={classe}>
                            {classe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    id={`especie-${item.id}`}
                    label="Espécie (Nome Popular)"
                    required
                  >
                    <Select
                      value={item.especieId}
                      onValueChange={(value) => handleItemChange(item.id, 'especieId', value)}
                      disabled={loading || !item.classeTaxonomica}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!item.classeTaxonomica ? "Selecione a classe primeiro" : "Selecione a espécie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getEspeciesPorClasse(item.classeTaxonomica).map((especie) => (
                          <SelectItem key={especie.id} value={especie.id}>
                            {especie.nome_popular}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    id={`nomeCientifico-${item.id}`}
                    label="Nome Científico"
                  >
                    <Input
                      value={item.nomeCientifico}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`ordemTaxonomica-${item.id}`}
                    label="Ordem Taxonômica"
                  >
                    <Input
                      value={item.ordemTaxonomica}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`estadoConservacao-${item.id}`}
                    label="Estado de Conservação"
                  >
                    <Input
                      value={item.estadoConservacao}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`tipoFauna-${item.id}`}
                    label="Tipo de Fauna"
                  >
                    <Input
                      value={item.tipoFauna}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>
                </div>

                {/* Informações do Animal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <FormField
                    id={`estadoSaude-${item.id}`}
                    label="Estado de Saúde"
                    required
                  >
                    <Select
                      value={item.estadoSaudeId}
                      onValueChange={(value) => handleItemChange(item.id, 'estadoSaudeId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosSaude.map((estado) => (
                          <SelectItem key={estado.id} value={estado.id}>
                            {estado.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    id={`atropelamento-${item.id}`}
                    label="Atropelamento?"
                    required
                  >
                    <Select
                      value={item.atropelamento}
                      onValueChange={(value) => handleItemChange(item.id, 'atropelamento', value)}
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

                  <FormField
                    id={`estagioVida-${item.id}`}
                    label="Estágio da Vida"
                    required
                  >
                    <Select
                      value={item.estagioVidaId}
                      onValueChange={(value) => handleItemChange(item.id, 'estagioVidaId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estagiosVida.map((estagio) => (
                          <SelectItem key={estagio.id} value={estagio.id}>
                            {estagio.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Quantidades */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    id={`quantidadeAdulto-${item.id}`}
                    label="Quantidade (Adultos)"
                  >
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantidadeChange(item.id, 'quantidadeAdulto', false)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantidadeAdulto}
                        readOnly
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantidadeChange(item.id, 'quantidadeAdulto', true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormField>

                  <FormField
                    id={`quantidadeFilhote-${item.id}`}
                    label="Quantidade (Filhotes)"
                  >
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantidadeChange(item.id, 'quantidadeFilhote', false)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantidadeFilhote}
                        readOnly
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantidadeChange(item.id, 'quantidadeFilhote', true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormField>

                  <FormField
                    id={`quantidadeTotal-${item.id}`}
                    label="Quantidade Total"
                  >
                    <Input
                      type="number"
                      value={item.quantidadeTotal}
                      readOnly
                      className="bg-muted text-center"
                    />
                  </FormField>
                </div>

                {/* Destinação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <FormField
                    id={`destinacao-${item.id}`}
                    label="Destinação"
                    required
                  >
                    <Select
                      value={item.destinacao}
                      onValueChange={(value) => handleItemChange(item.id, 'destinacao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a destinação" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESTINACOES_FAUNA.map((destinacao) => (
                          <SelectItem key={destinacao} value={destinacao}>
                            {destinacao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Seção de Óbito */}
                {item.destinacao === 'Óbito' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t bg-muted/50 p-4 rounded-md">
                    <FormField
                      id={`estagioVidaObito-${item.id}`}
                      label="Estágio da Vida (Óbito)"
                      required
                    >
                      <Select
                        value={item.estagioVidaObitoId}
                        onValueChange={(value) => handleItemChange(item.id, 'estagioVidaObitoId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {estagiosVida.map((estagio) => (
                            <SelectItem key={estagio.id} value={estagio.id}>
                              {estagio.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      id={`quantidadeAdultoObito-${item.id}`}
                      label="Adultos (Óbito)"
                    >
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantidadeObitoChange(item.id, 'quantidadeAdultoObito', false)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantidadeAdultoObito}
                          readOnly
                          className="text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantidadeObitoChange(item.id, 'quantidadeAdultoObito', true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormField>

                    <FormField
                      id={`quantidadeFilhoteObito-${item.id}`}
                      label="Filhotes (Óbito)"
                    >
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantidadeObitoChange(item.id, 'quantidadeFilhoteObito', false)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantidadeFilhoteObito}
                          readOnly
                          className="text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantidadeObitoChange(item.id, 'quantidadeFilhoteObito', true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormField>

                    <FormField
                      id={`quantidadeTotalObito-${item.id}`}
                      label="Total (Óbito)"
                    >
                      <Input
                        type="number"
                        value={item.quantidadeTotalObito}
                        readOnly
                        className="bg-muted text-center"
                      />
                    </FormField>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {faunaItems.length < 50 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Espécie ({faunaItems.length}/50)
            </Button>
          )}
        </div>
      </FormSection>
    </div>
  );
};

export default FaunaSection;
