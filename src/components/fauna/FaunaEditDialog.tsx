import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { FaunaImageUploader } from './FaunaImageUploader';

interface FaunaEspecie {
  id: string;
  nome_popular: string;
  nome_cientifico: string | null;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  tipo_de_fauna: string | null;
  estado_de_conservacao: string | null;
  nomes_populares?: string[];
  imagens_paths?: string[];
}

interface FaunaEditDialogProps {
  especie: FaunaEspecie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const CLASSES_TAXONOMICAS = [
  'AVE',
  'MAMIFERO',
  'RÉPTEIS',
  'PEIXE',
  'ANFIBIO',
  'INVERTEBRADO',
];

const TIPOS_FAUNA = [
  'Silvestre',
  'Exótica',
  'Doméstica',
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

export function FaunaEditDialog({ especie, open, onOpenChange, onSave }: FaunaEditDialogProps) {
  const [formData, setFormData] = useState<Partial<FaunaEspecie>>({});
  const [nomesPopulares, setNomesPopulares] = useState<string[]>([]);
  const [imagensPaths, setImagensPaths] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (especie) {
      setFormData({
        nome_popular: especie.nome_popular,
        nome_cientifico: especie.nome_cientifico,
        classe_taxonomica: especie.classe_taxonomica,
        ordem_taxonomica: especie.ordem_taxonomica,
        tipo_de_fauna: especie.tipo_de_fauna,
        estado_de_conservacao: especie.estado_de_conservacao,
      });
      
      // Load nomes_populares and imagens from the species
      loadEspecieData(especie.id);
    }
  }, [especie]);

  const loadEspecieData = async (id: string) => {
    const { data } = await supabase
      .from('dim_especies_fauna')
      .select('nomes_populares, imagens_paths')
      .eq('id', id)
      .maybeSingle();
    
    if (data?.nomes_populares) {
      setNomesPopulares(data.nomes_populares as string[]);
    } else {
      setNomesPopulares([]);
    }

    if (data?.imagens_paths) {
      setImagensPaths(data.imagens_paths as string[]);
    } else {
      setImagensPaths([]);
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
      // Update dim_especies_fauna table
      const { error: updateError } = await supabase
        .from('dim_especies_fauna')
        .update({
          nome_popular: formData.nome_popular,
          nome_cientifico: formData.nome_cientifico,
          classe_taxonomica: formData.classe_taxonomica,
          ordem_taxonomica: formData.ordem_taxonomica,
          tipo_de_fauna: formData.tipo_de_fauna,
          estado_de_conservacao: formData.estado_de_conservacao,
          nomes_populares: nomesPopulares,
        })
        .eq('id', especie.id);

      if (updateError) throw updateError;

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
          <DialogTitle>Editar Espécie</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome_popular">Nome Popular Principal *</Label>
            <Input
              id="nome_popular"
              value={formData.nome_popular || ''}
              onChange={(e) => setFormData({ ...formData, nome_popular: e.target.value })}
              placeholder="Ex: Capivara"
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
              value={formData.nome_cientifico || ''}
              onChange={(e) => setFormData({ ...formData, nome_cientifico: e.target.value })}
              placeholder="Ex: Hydrochoerus hydrochaeris"
              className="italic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe Taxonômica</Label>
              <Select
                value={formData.classe_taxonomica || ''}
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
              <Label>Tipo de Fauna</Label>
              <Select
                value={formData.tipo_de_fauna || ''}
                onValueChange={(value) => setFormData({ ...formData, tipo_de_fauna: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_FAUNA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordem_taxonomica">Ordem Taxonômica</Label>
            <Input
              id="ordem_taxonomica"
              value={formData.ordem_taxonomica || ''}
              onChange={(e) => setFormData({ ...formData, ordem_taxonomica: e.target.value })}
              placeholder="Ex: Rodentia"
            />
          </div>

          <div className="space-y-2">
            <Label>Estado de Conservação</Label>
            <Select
              value={formData.estado_de_conservacao || ''}
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

          {/* Photo Upload Section */}
          {especie && (
            <div className="space-y-2 pt-2 border-t">
              <Label>Fotos da Espécie</Label>
              <FaunaImageUploader
                especieId={especie.id}
                nomePopular={formData.nome_popular || especie.nome_popular}
                imagensPaths={imagensPaths}
                onImagesChange={setImagensPaths}
              />
            </div>
          )}
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
