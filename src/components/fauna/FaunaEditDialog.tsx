import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FaunaEspecie {
  id: string;
  nome_popular: string;
  nome_cientifico: string | null;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  tipo_fauna: string | null;
  estado_conservacao: string | null;
  grupo: string | null;
}

interface FaunaEditDialogProps {
  especie: FaunaEspecie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const CLASSES_TAXONOMICAS = [
  'Mammalia',
  'Aves',
  'Reptilia',
  'Amphibia',
  'Actinopterygii',
  'Chondrichthyes',
  'Insecta',
  'Arachnida',
  'Malacostraca',
  'Gastropoda',
];

const GRUPOS = [
  'Mamíferos',
  'Aves',
  'Répteis',
  'Anfíbios',
  'Peixes',
  'Invertebrados',
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (especie) {
      setFormData({
        nome_popular: especie.nome_popular,
        nome_cientifico: especie.nome_cientifico,
        classe_taxonomica: especie.classe_taxonomica,
        ordem_taxonomica: especie.ordem_taxonomica,
        tipo_fauna: especie.tipo_fauna,
        estado_conservacao: especie.estado_conservacao,
        grupo: especie.grupo,
      });
    }
  }, [especie]);

  const handleSave = async () => {
    if (!especie) return;

    setSaving(true);
    try {
      // Generate slug from nome_popular
      const nome_popular_slug = formData.nome_popular
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || '';

      const { error } = await supabase
        .from('fauna')
        .update({
          ...formData,
          nome_popular_slug,
          updated_at: new Date().toISOString(),
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Espécie</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome_popular">Nome Popular *</Label>
            <Input
              id="nome_popular"
              value={formData.nome_popular || ''}
              onChange={(e) => setFormData({ ...formData, nome_popular: e.target.value })}
              placeholder="Ex: Capivara"
            />
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
              <Label>Grupo</Label>
              <Select
                value={formData.grupo || ''}
                onValueChange={(value) => setFormData({ ...formData, grupo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {GRUPOS.map((grupo) => (
                    <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Fauna</Label>
              <Select
                value={formData.tipo_fauna || ''}
                onValueChange={(value) => setFormData({ ...formData, tipo_fauna: value })}
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

            <div className="space-y-2">
              <Label htmlFor="ordem_taxonomica">Ordem Taxonômica</Label>
              <Input
                id="ordem_taxonomica"
                value={formData.ordem_taxonomica || ''}
                onChange={(e) => setFormData({ ...formData, ordem_taxonomica: e.target.value })}
                placeholder="Ex: Rodentia"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado de Conservação</Label>
            <Select
              value={formData.estado_conservacao || ''}
              onValueChange={(value) => setFormData({ ...formData, estado_conservacao: value })}
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
