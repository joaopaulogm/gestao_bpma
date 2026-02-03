import React, { useState, useEffect, useRef } from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

export interface FloraItem {
  id: string;
  especieId: string;
  nomePopular: string;
  nomeCientifico: string;
  classe: string;
  ordem: string;
  familia: string;
  estadoConservacao: string;
  tipoPlanta: string;
  madeiraLei: string;
  imuneCote: string;
  condicao: string;
  quantidade: number;
  destinacao: string;
}

interface FloraSectionProps {
  floraItems: FloraItem[];
  onFloraItemsChange: (items: FloraItem[]) => void;
  numeroTermoEntrega: string;
  onNumeroTermoEntregaChange: (value: string) => void;
  getFieldError: (field: string) => string | undefined;
}

const CONDICOES_FLORA = [
  "Árvore em pé (viva)",
  "Árvore em pé (morta)",
  "Árvore derrubada (recentemente)",
  "Árvore derrubada (antiga)",
  "Tora inteira",
  "Torete (seção de tora)",
  "Estaca",
  "Poste",
  "Mourão",
  "Prancha",
  "Tábua",
  "Viga",
  "Caibro",
  "Ripa",
  "Lenha (achas)",
  "Carvão vegetal",
  "Raiz exposta",
  "Cepa / Toco remanescente",
  "Galhada empilhada",
  "Resíduo florestal (material lenhoso diverso)",
  "Madeira beneficiada (serrada)",
  "Madeira parcialmente beneficiada",
  "Madeira roliça",
  "Madeira aparelhada",
  "Madeira desdobrada",
  "Sementes",
  "Mudas vivas",
  "Mudas mortas",
  "Casca de árvore (retirada)",
  "Casca de árvore (depositada para transporte)",
  "Folhagem cortada",
  "Biomassa vegetal diversa",
  "Subproduto florestal não identificado"
];

const DESTINACOES_FLORA = [
  "IBRAM/DF",
  "IBAMA",
  "DEPASA/DF",
  "Outro órgão ambiental competente",
  "Entregue a fiel depositário",
  "Mantido sob guarda do BPMA",
  "Reintroduzido no ambiente (quando autorizado)",
  "Destruído / descartado conforme autorização"
];

interface EspecieFlora {
  id: string;
  nome_popular: string | null;
  nome_cientifico: string | null;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  familia_taxonomica: string | null;
  estado_de_conservacao: string | null;
  tipo_de_planta: string | null;
  madeira_de_lei: string | null;
  imune_ao_corte: string | null;
}

const FloraSection: React.FC<FloraSectionProps> = ({
  floraItems,
  onFloraItemsChange,
  numeroTermoEntrega,
  onNumeroTermoEntregaChange,
  getFieldError
}) => {
  const [especiesFlora, setEspeciesFlora] = useState<EspecieFlora[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    const fetchEspeciesFlora = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('dim_especies_flora')
          .select('*')
          .order('nome_popular', { ascending: true });
        
        if (error) {
          console.error('Erro ao carregar espécies de flora:', error);
        } else if (data) {
          setEspeciesFlora(data as EspecieFlora[]);
        }
      } catch (err) {
        console.error('Erro ao carregar espécies de flora:', err);
      }
      setLoading(false);
    };

    fetchEspeciesFlora();
  }, []);

  const createEmptyFloraItem = (): FloraItem => ({
    id: crypto.randomUUID(),
    especieId: '',
    nomePopular: '',
    nomeCientifico: '',
    classe: '',
    ordem: '',
    familia: '',
    estadoConservacao: '',
    tipoPlanta: '',
    madeiraLei: '',
    imuneCote: '',
    condicao: '',
    quantidade: 1,
    destinacao: ''
  });

  const handleAddItem = () => {
    if (floraItems.length < 50) {
      onFloraItemsChange([...floraItems, createEmptyFloraItem()]);
    }
  };

  const handleRemoveItem = (id: string) => {
    onFloraItemsChange(floraItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FloraItem, value: string | number) => {
    onFloraItemsChange(
      floraItems.map(item => {
        if (item.id !== id) return item;
        
        // Se mudou a espécie, atualizar os detalhes
        if (field === 'especieId') {
          const especie = especiesFlora.find(e => e.id === value);
          if (especie) {
            return {
              ...item,
              especieId: value as string,
              nomePopular: especie.nome_popular || '',
              nomeCientifico: especie.nome_cientifico || '',
              classe: especie.classe_taxonomica || '',
              ordem: especie.ordem_taxonomica || '',
              familia: especie.familia_taxonomica || '',
              estadoConservacao: especie.estado_de_conservacao || '',
              tipoPlanta: especie.tipo_de_planta || '',
              madeiraLei: especie.madeira_de_lei || '',
              imuneCote: especie.imune_ao_corte || ''
            };
          }
        }
        
        return { ...item, [field]: value };
      })
    );
  };

  // Inicializar com um item vazio se não houver nenhum
  useEffect(() => {
    if (floraItems.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      onFloraItemsChange([createEmptyFloraItem()]);
    }
  }, [floraItems.length, onFloraItemsChange]);

  return (
    <div className="space-y-6">
      <FormSection title="Identificação das Espécies de Flora">
        <div className="space-y-4">
          {floraItems.map((item, index) => (
            <Card key={item.id} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    Espécie {index + 1}
                  </span>
                  {floraItems.length > 1 && (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    id={`nomePopular-${item.id}`}
                    label="Nome Popular"
                    required
                  >
                    <Select
                      value={item.especieId}
                      onValueChange={(value) => handleItemChange(item.id, 'especieId', value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione a espécie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {especiesFlora.map((especie) => (
                          <SelectItem key={especie.id} value={especie.id}>
                            {especie.nome_popular || 'Sem nome popular'}
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
                    id={`classe-${item.id}`}
                    label="Classe"
                  >
                    <Input
                      value={item.classe}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`ordem-${item.id}`}
                    label="Ordem"
                  >
                    <Input
                      value={item.ordem}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`familia-${item.id}`}
                    label="Família"
                  >
                    <Input
                      value={item.familia}
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
                    id={`tipoPlanta-${item.id}`}
                    label="Tipo de Planta"
                  >
                    <Input
                      value={item.tipoPlanta}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`madeiraLei-${item.id}`}
                    label="Madeira de Lei"
                  >
                    <Input
                      value={item.madeiraLei}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>

                  <FormField
                    id={`imuneCote-${item.id}`}
                    label="Imune ao Corte"
                  >
                    <Input
                      value={item.imuneCote}
                      readOnly
                      className="bg-muted"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <FormField
                    id={`condicao-${item.id}`}
                    label="Condição"
                    required
                  >
                    <Select
                      value={item.condicao}
                      onValueChange={(value) => handleItemChange(item.id, 'condicao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a condição" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDICOES_FLORA.map((condicao) => (
                          <SelectItem key={condicao} value={condicao}>
                            {condicao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    id={`quantidade-${item.id}`}
                    label="Quantidade"
                    required
                  >
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => handleItemChange(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                    />
                  </FormField>

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
                        {DESTINACOES_FLORA.map((destinacao) => (
                          <SelectItem key={destinacao} value={destinacao}>
                            {destinacao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>
          ))}

          {floraItems.length < 50 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Espécie ({floraItems.length}/50)
            </Button>
          )}
        </div>
      </FormSection>

      <FormSection title="Termo de Entrega">
        <FormField
          id="numeroTermoEntrega"
          label="N° do Termo de Entrega"
          error={getFieldError('numeroTermoEntregaFlora')}
        >
          <Input
            id="numeroTermoEntrega"
            value={numeroTermoEntrega}
            onChange={(e) => onNumeroTermoEntregaChange(e.target.value)}
            placeholder="Digite o número do termo de entrega"
          />
        </FormField>
      </FormSection>
    </div>
  );
};

export default FloraSection;
