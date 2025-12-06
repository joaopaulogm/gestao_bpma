import React, { useState, useEffect } from 'react';
import FormSection from '@/components/resgate/FormSection';
import FormField from '@/components/resgate/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ItemApreensao {
  id: string;
  Categoria: string | null;
  Item: string | null;
  'Uso Ilicito': string | null;
  Aplicacao: string | null;
}

export interface BemApreendido {
  id: string;
  itemId: string;
  categoria: string;
  item: string;
  usoIlicito: string;
  aplicacao: string;
  quantidade: number;
}

interface BensApreendidosSectionProps {
  bensApreendidos: BemApreendido[];
  onBensChange: (bens: BemApreendido[]) => void;
}

const BensApreendidosSection: React.FC<BensApreendidosSectionProps> = ({
  bensApreendidos,
  onBensChange
}) => {
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemApreensao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<string[]>([]);
  const [categoriaFilter, setCategoriaFilter] = useState<string>('');

  useEffect(() => {
    const loadItens = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('dim_itens_apreensao')
          .select('*')
          .order('Categoria')
          .order('Item');

        if (error) throw error;

        if (data) {
          setItensDisponiveis(data);
          // Extrair categorias únicas
          const categorias = [...new Set(data.map(item => item.Categoria).filter(Boolean))] as string[];
          setCategoriasFiltradas(categorias);
        }
      } catch (error) {
        console.error('Erro ao carregar itens de apreensão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItens();
  }, []);

  const itensFiltrados = categoriaFilter
    ? itensDisponiveis.filter(item => item.Categoria === categoriaFilter)
    : itensDisponiveis;

  const handleAddItem = () => {
    if (!selectedItem) return;

    const itemSelecionado = itensDisponiveis.find(i => i.id === selectedItem);
    if (!itemSelecionado) return;

    // Verificar se já existe
    const existe = bensApreendidos.some(b => b.itemId === selectedItem);
    if (existe) return;

    const novoBem: BemApreendido = {
      id: crypto.randomUUID(),
      itemId: itemSelecionado.id,
      categoria: itemSelecionado.Categoria || '',
      item: itemSelecionado.Item || '',
      usoIlicito: itemSelecionado['Uso Ilicito'] || '',
      aplicacao: itemSelecionado.Aplicacao || '',
      quantidade: 1
    };

    onBensChange([...bensApreendidos, novoBem]);
    setSelectedItem('');
  };

  const handleRemoveItem = (id: string) => {
    onBensChange(bensApreendidos.filter(b => b.id !== id));
  };

  const handleQuantidadeChange = (id: string, quantidade: number) => {
    onBensChange(
      bensApreendidos.map(b =>
        b.id === id ? { ...b, quantidade: Math.max(1, quantidade) } : b
      )
    );
  };

  // Agrupar por categoria para exibição
  const bensAgrupados = bensApreendidos.reduce((acc, bem) => {
    if (!acc[bem.categoria]) {
      acc[bem.categoria] = [];
    }
    acc[bem.categoria].push(bem);
    return acc;
  }, {} as Record<string, BemApreendido[]>);

  return (
    <FormSection title="Bens Apreendidos">
      <div className="space-y-4">
        {/* Seletor de itens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField id="categoriaFilter" label="Filtrar por Categoria">
            <Select
              value={categoriaFilter || '__all__'}
              onValueChange={(val) => setCategoriaFilter(val === '__all__' ? '' : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas as categorias</SelectItem>
                {categoriasFiltradas.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="selectedItem" label="Selecionar Item">
            <Select
              value={selectedItem}
              onValueChange={setSelectedItem}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um item"} />
              </SelectTrigger>
              <SelectContent>
                {itensFiltrados.map((item) => (
                  <SelectItem 
                    key={item.id} 
                    value={item.id}
                    disabled={bensApreendidos.some(b => b.itemId === item.id)}
                  >
                    {item.Item} ({item.Categoria})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>

        {/* Lista de bens apreendidos */}
        {bensApreendidos.length === 0 ? (
          <div className="text-center py-8 bg-background/50 rounded-xl border border-primary/10">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">Nenhum bem apreendido adicionado</p>
            <p className="text-sm text-muted-foreground/70">
              Selecione itens acima para adicionar à lista
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(bensAgrupados).map(([categoria, bens]) => (
              <div key={categoria} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {categoria}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({bens.length} {bens.length === 1 ? 'item' : 'itens'})
                  </span>
                </div>
                
                <div className="space-y-2">
                  {bens.map((bem) => (
                    <div
                      key={bem.id}
                      className="flex items-center gap-4 p-4 bg-background/80 backdrop-blur-xl rounded-xl border border-primary/15"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {bem.item}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {bem.usoIlicito && (
                            <span className="text-xs text-muted-foreground">
                              Uso: {bem.usoIlicito}
                            </span>
                          )}
                          {bem.aplicacao && (
                            <Badge variant="outline" className="text-xs">
                              {bem.aplicacao}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={bem.quantidade}
                          onChange={(e) => handleQuantidadeChange(bem.id, parseInt(e.target.value) || 1)}
                          className="w-20 h-9 text-center rounded-lg border-primary/15 bg-background/80"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(bem.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Resumo */}
            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/15">
              <span className="font-medium">Total de Itens Apreendidos:</span>
              <span className="font-bold text-lg">
                {bensApreendidos.reduce((sum, b) => sum + b.quantidade, 0)} unidades
              </span>
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default BensApreendidosSection;
