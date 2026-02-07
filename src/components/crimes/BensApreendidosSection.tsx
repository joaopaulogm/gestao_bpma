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
  'Tipo de Crime': string | null;
  'Bem Apreendido': string | null;
  Item: string | null;
  'Uso Ilicito': string | null;
}

export interface BemApreendido {
  id: string;
  itemId: string;
  tipoCrime: string;
  bemApreendido: string;
  item: string;
  usoIlicito: string;
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
  
  // Listas para filtros
  const [tiposCrime, setTiposCrime] = useState<string[]>([]);
  const [bensApreendidosList, setBensApreendidosList] = useState<string[]>([]);
  const [usosIlicitos, setUsosIlicitos] = useState<string[]>([]);
  
  // Filtros selecionados
  const [tipoCrimeFilter, setTipoCrimeFilter] = useState<string>('');
  const [bemApreendidoFilter, setBemApreendidoFilter] = useState<string>('');
  const [usoIlicitoFilter, setUsoIlicitoFilter] = useState<string>('');

  useEffect(() => {
    const loadItens = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('dim_itens_apreensao')
          .select('*')
          .order('Bem Apreendido')
          .order('Item');

        if (error) throw error;

        if (data) {
          setItensDisponiveis(data as unknown as ItemApreensao[]);
          // Extrair valores únicos para filtros
          const tipos = [...new Set(data.map(item => item['Tipo de Crime']).filter(Boolean))] as string[];
          setTiposCrime(tipos);
          const bens = [...new Set(data.map(item => item['Bem Apreendido']).filter(Boolean))] as string[];
          setBensApreendidosList(bens);
          const usos = [...new Set(data.map(item => item['Uso Ilicito']).filter(Boolean))] as string[];
          setUsosIlicitos(usos);
        }
      } catch (error) {
        console.error('Erro ao carregar itens de apreensão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItens();
  }, []);

  // Filtrar itens baseado nos filtros selecionados
  const itensFiltrados = itensDisponiveis.filter(item => {
    const matchTipo = !tipoCrimeFilter || item['Tipo de Crime'] === tipoCrimeFilter;
    const matchBem = !bemApreendidoFilter || item['Bem Apreendido'] === bemApreendidoFilter;
    const matchUso = !usoIlicitoFilter || item['Uso Ilicito'] === usoIlicitoFilter;
    return matchTipo && matchBem && matchUso;
  });

  const handleAddItem = () => {
    if (!selectedItem) return;

    const itemSelecionado = itensDisponiveis.find(i => i.id === selectedItem);
    if (!itemSelecionado) return;

    const novoBem: BemApreendido = {
      id: crypto.randomUUID(),
      itemId: itemSelecionado.id,
      tipoCrime: itemSelecionado['Tipo de Crime'] || '',
      bemApreendido: itemSelecionado['Bem Apreendido'] || '',
      item: itemSelecionado.Item || '',
      usoIlicito: itemSelecionado['Uso Ilicito'] || '',
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

  // Agrupar por Bem Apreendido para exibição
  const bensAgrupados = bensApreendidos.reduce((acc, bem) => {
    if (!acc[bem.bemApreendido]) {
      acc[bem.bemApreendido] = [];
    }
    acc[bem.bemApreendido].push(bem);
    return acc;
  }, {} as Record<string, BemApreendido[]>);

  return (
    <FormSection title="Bens Apreendidos">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField id="tipoCrimeFilter" label="Tipo de Crime">
            <Select
              value={tipoCrimeFilter || '__all__'}
              onValueChange={(val) => setTipoCrimeFilter(val === '__all__' ? '' : val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-60">
                <SelectItem value="__all__">Todos os tipos</SelectItem>
                {tiposCrime.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="bemApreendidoFilter" label="Bem Apreendido">
            <Select
              value={bemApreendidoFilter || '__all__'}
              onValueChange={(val) => setBemApreendidoFilter(val === '__all__' ? '' : val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todos os bens" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-60">
                <SelectItem value="__all__">Todos os bens</SelectItem>
                {bensApreendidosList.map((bem) => (
                  <SelectItem key={bem} value={bem}>
                    {bem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="usoIlicitoFilter" label="Uso Ilícito">
            <Select
              value={usoIlicitoFilter || '__all__'}
              onValueChange={(val) => setUsoIlicitoFilter(val === '__all__' ? '' : val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Todos os usos" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-60">
                <SelectItem value="__all__">Todos os usos</SelectItem>
                {usosIlicitos.map((uso) => (
                  <SelectItem key={uso} value={uso}>
                    {uso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="selectedItem" label="Item">
            <Select
              value={selectedItem}
              onValueChange={setSelectedItem}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um item"} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-60">
                {itensFiltrados.map((item) => (
                  <SelectItem 
                    key={item.id} 
                    value={item.id}
                  >
                    {item.Item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Botão Adicionar */}
        <Button
          type="button"
          onClick={handleAddItem}
          disabled={!selectedItem}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>

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
            {Object.entries(bensAgrupados).map(([bemApreendido, bens]) => (
              <div key={bemApreendido} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {bemApreendido}
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
                          <span className="text-xs text-muted-foreground">
                            Uso: {bem.usoIlicito}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {bem.tipoCrime}
                          </Badge>
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
