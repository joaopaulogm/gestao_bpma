import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import FormSection from '@/components/resgate/FormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit2, Save, X, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ItemApreensao {
  id: string;
  'Tipo de Crime': string;
  'Bem Apreendido': string;
  Item: string;
  'Uso Ilicito': string;
}

const tiposCrimeOptions = [
  'Crime Contra a Fauna',
  'Crime Contra a Flora',
  'Crimes de poluição e outros crimes ambientais',
  'Crimes contra a administração ambiental',
  'Crimes contra o ordenamento urbano e o patrimônio cultural'
];

const BensApreendidosCadastro = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itens, setItens] = useState<ItemApreensao[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [tipoCrime, setTipoCrime] = useState('');
  const [bemApreendido, setBemApreendido] = useState('');
  const [item, setItem] = useState('');
  const [usoIlicito, setUsoIlicito] = useState('');
  
  // Edit state
  const [editTipoCrime, setEditTipoCrime] = useState('');
  const [editBemApreendido, setEditBemApreendido] = useState('');
  const [editItem, setEditItem] = useState('');
  const [editUsoIlicito, setEditUsoIlicito] = useState('');
  
  // Listas únicas para sugestões
  const [bensUnicos, setBensUnicos] = useState<string[]>([]);
  const [usosUnicos, setUsosUnicos] = useState<string[]>([]);

  useEffect(() => {
    loadItens();
  }, []);

  const loadItens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dim_itens_apreensao')
        .select('*')
        .order('Tipo de Crime')
        .order('Bem Apreendido')
        .order('Item');

      if (error) throw error;

      if (data) {
        setItens(data as unknown as ItemApreensao[]);
        // Extrair valores únicos
        const bens = [...new Set(data.map(i => i['Bem Apreendido']).filter(Boolean))] as string[];
        setBensUnicos(bens);
        const usos = [...new Set(data.map(i => i['Uso Ilicito']).filter(Boolean))] as string[];
        setUsosUnicos(usos);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoCrime || !bemApreendido || !item || !usoIlicito) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('dim_itens_apreensao')
        .insert({
          'Tipo de Crime': tipoCrime,
          'Bem Apreendido': bemApreendido,
          'Item': item,
          'Uso Ilicito': usoIlicito
        });

      if (error) throw error;

      toast.success('Item cadastrado com sucesso!');
      resetForm();
      loadItens();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error('Erro ao cadastrar item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTipoCrime('');
    setBemApreendido('');
    setItem('');
    setUsoIlicito('');
  };

  const handleEdit = (itemData: ItemApreensao) => {
    setEditingId(itemData.id);
    setEditTipoCrime(itemData['Tipo de Crime']);
    setEditBemApreendido(itemData['Bem Apreendido']);
    setEditItem(itemData.Item);
    setEditUsoIlicito(itemData['Uso Ilicito']);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('dim_itens_apreensao')
        .update({
          'Tipo de Crime': editTipoCrime,
          'Bem Apreendido': editBemApreendido,
          'Item': editItem,
          'Uso Ilicito': editUsoIlicito
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('Item atualizado com sucesso!');
      setEditingId(null);
      loadItens();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('dim_itens_apreensao')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      loadItens();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
    }
  };

  // Agrupar por Tipo de Crime
  const itensAgrupados = itens.reduce((acc, item) => {
    const tipo = item['Tipo de Crime'];
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(item);
    return acc;
  }, {} as Record<string, ItemApreensao[]>);

  return (
    <Layout title="Cadastro de Bens Apreendidos" showBackButton>
      <div className="space-y-6 animate-fade-in">
        {/* Formulário de Cadastro */}
        <FormSection title="Novo Item de Apreensão">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tipo de Crime <span className="text-destructive">*</span>
                </Label>
                <Select value={tipoCrime} onValueChange={setTipoCrime}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione o tipo de crime" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {tiposCrimeOptions.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Bem Apreendido <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={bemApreendido}
                  onChange={(e) => setBemApreendido(e.target.value)}
                  placeholder="Ex: Armas de Fogo, Petrechos de Caça..."
                  list="bens-list"
                  className="bg-background"
                />
                <datalist id="bens-list">
                  {bensUnicos.map(bem => (
                    <option key={bem} value={bem} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Item <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Ex: Espingarda calibre 12, Armadilha arapuca..."
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Uso Ilícito <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={usoIlicito}
                  onChange={(e) => setUsoIlicito(e.target.value)}
                  placeholder="Ex: Caça ilegal, Tráfico..."
                  list="usos-list"
                  className="bg-background"
                />
                <datalist id="usos-list">
                  {usosUnicos.map(uso => (
                    <option key={uso} value={uso} />
                  ))}
                </datalist>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Item
                </>
              )}
            </Button>
          </form>
        </FormSection>

        {/* Lista de Itens */}
        <FormSection title="Itens Cadastrados">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-12 bg-background/50 rounded-xl border border-primary/10">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Nenhum item cadastrado</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itensAgrupados).map(([tipo, items]) => (
                <div key={tipo} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({items.length} {items.length === 1 ? 'item' : 'itens'})
                    </span>
                  </div>

                  <div className="rounded-lg border border-primary/10 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-[200px]">Bem Apreendido</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Uso Ilícito</TableHead>
                          <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((itemData) => (
                          <TableRow key={itemData.id}>
                            {editingId === itemData.id ? (
                              <>
                                <TableCell>
                                  <Input
                                    value={editBemApreendido}
                                    onChange={(e) => setEditBemApreendido(e.target.value)}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={editItem}
                                    onChange={(e) => setEditItem(e.target.value)}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={editUsoIlicito}
                                    onChange={(e) => setEditUsoIlicito(e.target.value)}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleSaveEdit}
                                      className="h-8 w-8 text-green-600 hover:text-green-700"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleCancelEdit}
                                      className="h-8 w-8"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="font-medium">{itemData['Bem Apreendido']}</TableCell>
                                <TableCell>{itemData.Item}</TableCell>
                                <TableCell>{itemData['Uso Ilicito']}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(itemData)}
                                      className="h-8 w-8"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(itemData.id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}

              {/* Resumo */}
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/15">
                <span className="font-medium">Total de Itens:</span>
                <span className="font-bold text-lg">{itens.length}</span>
              </div>
            </div>
          )}
        </FormSection>
      </div>
    </Layout>
  );
};

export default BensApreendidosCadastro;
