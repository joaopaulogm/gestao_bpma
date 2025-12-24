import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';

interface FloraEspecie {
  id: string;
  nomePopular: string | null;
  nomeCientifico: string | null;
  classe: string | null;
  ordem: string | null;
  familia: string | null;
  estadoConservacao: string | null;
  tipoPlanta: string | null;
  madeiraLei: string | null;
  imuneCorte: string | null;
}

interface FloraEditDialogProps {
  especie: FloraEspecie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const CLASSES_TAXONOMICAS = [
  'Magnoliopsida',
  'Liliopsida',
  'Pinopsida',
  'Polypodiopsida',
  'Bryopsida',
];

const TIPOS_PLANTA = [
  'Árvore',
  'Arbusto',
  'Herbácea',
  'Palmeira',
  'Trepadeira',
  'Epífita',
  'Aquática',
  'Suculenta',
];

const ESTADOS_CONSERVACAO = [
  'Não avaliado (NE)',
  'Dados insuficientes (DD)',
  'Pouco preocupante (LC)',
  'Quase ameaçada (NT)',
  'Vulnerável (VU)',
  'Em perigo (EN)',
  'Criticamente em perigo (CR)',
  'Extinta na natureza (EW)',
  'Extinta (EX)',
];

export function FloraEditDialog({ especie, open, onOpenChange, onSave }: FloraEditDialogProps) {
  const [formData, setFormData] = useState<{
    nome_popular: string;
    nome_cientifico: string;
    classe_taxonomica: string;
    ordem_taxonomica: string;
    familia_taxonomica: string;
    estado_de_conservacao: string;
    tipo_de_planta: string;
    madeira_de_lei: string;
    imune_ao_corte: string;
  }>({
    nome_popular: '',
    nome_cientifico: '',
    classe_taxonomica: '',
    ordem_taxonomica: '',
    familia_taxonomica: '',
    estado_de_conservacao: '',
    tipo_de_planta: '',
    madeira_de_lei: 'Não',
    imune_ao_corte: 'Não',
  });
  const [nomesPopulares, setNomesPopulares] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (especie) {
      setFormData({
        nome_popular: especie.nomePopular || '',
        nome_cientifico: especie.nomeCientifico || '',
        classe_taxonomica: especie.classe || '',
        ordem_taxonomica: especie.ordem || '',
        familia_taxonomica: especie.familia || '',
        estado_de_conservacao: especie.estadoConservacao || '',
        tipo_de_planta: especie.tipoPlanta || '',
        madeira_de_lei: especie.madeiraLei || 'Não',
        imune_ao_corte: especie.imuneCorte || 'Não',
      });
      
      // Load additional names
      loadNomesPopulares(especie.id);
    }
  }, [especie]);

  const loadNomesPopulares = async (id: string) => {
    const { data } = await supabase
      .from('dim_especies_flora')
      .select('nomes_populares')
      .eq('id', id)
      .maybeSingle();
    
    if (data?.nomes_populares) {
      setNomesPopulares(data.nomes_populares as string[]);
    } else {
      setNomesPopulares([]);
    }
  };

  const handleAddNome = () => {
    if (novoNome.trim() && !nomesPopulares.includes(novoNome.trim())) {
      setNomesPopulares([...nomesPopulares, novoNome.trim()]);
      setNovoNome('');
    }
  };

  const handleRemoveNome = (nome: string) => {
    setNomesPopulares(nomesPopulares.filter(n => n !== nome));
  };

  const handleSave = async () => {
    if (!especie) return;

    setSaving(true);
    try {
      // Update dim_especies_flora directly
      const { error } = await supabase
        .from('dim_especies_flora')
        .update({
          nome_popular: formData.nome_popular,
          nome_cientifico: formData.nome_cientifico,
          classe_taxonomica: formData.classe_taxonomica,
          ordem_taxonomica: formData.ordem_taxonomica,
          familia_taxonomica: formData.familia_taxonomica,
          estado_de_conservacao: formData.estado_de_conservacao,
          tipo_de_planta: formData.tipo_de_planta,
          madeira_de_lei: formData.madeira_de_lei,
          imune_ao_corte: formData.imune_ao_corte,
          nomes_populares: nomesPopulares,
        })
        .eq('id', especie.id);

      if (error) throw error;

      toast.success('Espécie atualizada com sucesso');
      onOpenChange(false);
      onSave?.();
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      toast.error(err.message || 'Erro ao salvar espécie');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Espécie de Flora</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome_popular">Nome Popular Principal *</Label>
            <Input
              id="nome_popular"
              value={formData.nome_popular}
              onChange={(e) => setFormData({ ...formData, nome_popular: e.target.value })}
              placeholder="Ex: Ipê-amarelo"
            />
          </div>

          {/* Multiple popular names */}
          <div className="space-y-2">
            <Label>Outros Nomes Populares</Label>
            <div className="flex gap-2">
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Adicionar nome alternativo"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNome())}
              />
              <Button type="button" size="icon" variant="outline" onClick={handleAddNome}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {nomesPopulares.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {nomesPopulares.map((nome) => (
                  <Badge key={nome} variant="secondary" className="gap-1">
                    {nome}
                    <button onClick={() => handleRemoveNome(nome)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_cientifico">Nome Científico</Label>
            <Input
              id="nome_cientifico"
              value={formData.nome_cientifico}
              onChange={(e) => setFormData({ ...formData, nome_cientifico: e.target.value })}
              placeholder="Ex: Handroanthus albus"
              className="italic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe Taxonômica</Label>
              <Select
                value={formData.classe_taxonomica}
                onValueChange={(value) => setFormData({ ...formData, classe_taxonomica: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES_TAXONOMICAS.map((classe) => (
                    <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Planta</Label>
              <Select
                value={formData.tipo_de_planta}
                onValueChange={(value) => setFormData({ ...formData, tipo_de_planta: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PLANTA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ordem_taxonomica">Ordem Taxonômica</Label>
              <Input
                id="ordem_taxonomica"
                value={formData.ordem_taxonomica}
                onChange={(e) => setFormData({ ...formData, ordem_taxonomica: e.target.value })}
                placeholder="Ex: Lamiales"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familia_taxonomica">Família</Label>
              <Input
                id="familia_taxonomica"
                value={formData.familia_taxonomica}
                onChange={(e) => setFormData({ ...formData, familia_taxonomica: e.target.value })}
                placeholder="Ex: Bignoniaceae"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado de Conservação</Label>
            <Select
              value={formData.estado_de_conservacao}
              onValueChange={(value) => setFormData({ ...formData, estado_de_conservacao: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_CONSERVACAO.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="madeira_lei" className="cursor-pointer">Madeira de Lei</Label>
              <Switch
                id="madeira_lei"
                checked={formData.madeira_de_lei === 'Sim'}
                onCheckedChange={(checked) => setFormData({ ...formData, madeira_de_lei: checked ? 'Sim' : 'Não' })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="imune_corte" className="cursor-pointer">Imune ao Corte</Label>
              <Switch
                id="imune_corte"
                checked={formData.imune_ao_corte === 'Sim'}
                onCheckedChange={(checked) => setFormData({ ...formData, imune_ao_corte: checked ? 'Sim' : 'Não' })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.nome_popular}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
