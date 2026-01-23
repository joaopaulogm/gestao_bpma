import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Registro } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RegistroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: Registro | null;
  onSuccess: () => void;
  dimensionCache: {
    regioes: Map<string, any>;
    origens: Map<string, any>;
    destinacoes: Map<string, any>;
    estadosSaude: Map<string, any>;
    estagiosVida: Map<string, any>;
    desfechos: Map<string, any>;
    especies: Map<string, any>;
  } | null;
}

const RegistroEditDialog: React.FC<RegistroEditDialogProps> = ({
  open,
  onOpenChange,
  registro,
  onSuccess,
  dimensionCache,
}) => {
  const [formData, setFormData] = useState({
    data: '',
    horario_acionamento: '',
    horario_termino: '',
    regiao_administrativa_id: '',
    origem_id: '',
    destinacao_id: '',
    estado_saude_id: '',
    estagio_vida_id: '',
    desfecho_id: '',
    especie_id: '',
    quantidade_adulto: 0,
    quantidade_filhote: 0,
    latitude_origem: '',
    longitude_origem: '',
    atropelamento: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (registro) {
      // Extrair horário de acionamento e término do registro
      const horarioAcionamento = (registro as any).horario_acionamento || '';
      const horarioTermino = (registro as any).horario_termino || '';
      
      setFormData({
        data: registro.data?.split('T')[0] || '',
        horario_acionamento: horarioAcionamento,
        horario_termino: horarioTermino,
        regiao_administrativa_id: registro.regiao_administrativa_id || '',
        origem_id: registro.origem_id || '',
        destinacao_id: registro.destinacao_id || '',
        estado_saude_id: registro.estado_saude_id || '',
        estagio_vida_id: registro.estagio_vida_id || '',
        desfecho_id: registro.desfecho_id || '',
        especie_id: registro.especie_id || '',
        quantidade_adulto: registro.quantidade_adulto || 0,
        quantidade_filhote: registro.quantidade_filhote || 0,
        latitude_origem: registro.latitude_origem || '',
        longitude_origem: registro.longitude_origem || '',
        atropelamento: registro.atropelamento || '',
      });
    }
  }, [registro]);

  const canEdit = (data: string) => {
    const year = new Date(data).getFullYear();
    return year >= 2026;
  };

  const handleSave = async () => {
    if (!registro) return;

    if (!canEdit(formData.data)) {
      toast.error('Somente registros de 2026 em diante podem ser editados');
      return;
    }

    setIsSaving(true);
    try {
      const supabaseAny = supabase as any;
      
      const updateData: any = {
        data: formData.data,
        horario_acionamento: formData.horario_acionamento || null,
        horario_termino: formData.horario_termino || null,
        quantidade_adulto: formData.quantidade_adulto,
        quantidade_filhote: formData.quantidade_filhote,
        quantidade_total: formData.quantidade_adulto + formData.quantidade_filhote,
        quantidade: formData.quantidade_adulto + formData.quantidade_filhote,
        latitude_origem: formData.latitude_origem || null,
        longitude_origem: formData.longitude_origem || null,
        atropelamento: formData.atropelamento || null,
      };

      // Add IDs only if they are set
      if (formData.regiao_administrativa_id) updateData.regiao_administrativa_id = formData.regiao_administrativa_id;
      if (formData.origem_id) updateData.origem_id = formData.origem_id;
      if (formData.destinacao_id) updateData.destinacao_id = formData.destinacao_id;
      if (formData.estado_saude_id) updateData.estado_saude_id = formData.estado_saude_id;
      if (formData.estagio_vida_id) updateData.estagio_vida_id = formData.estagio_vida_id;
      if (formData.desfecho_id) updateData.desfecho_id = formData.desfecho_id;
      if (formData.especie_id) updateData.especie_id = formData.especie_id;

      const { error } = await supabaseAny
        .from('fat_registros_de_resgate')
        .update(updateData)
        .eq('id', registro.id);

      if (error) throw error;

      toast.success('Registro atualizado com sucesso');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar registro:', error);
      toast.error(`Erro ao atualizar registro: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!registro || !dimensionCache) return null;

  const regioes = Array.from(dimensionCache.regioes.values());
  const origens = Array.from(dimensionCache.origens.values());
  const destinacoes = Array.from(dimensionCache.destinacoes.values());
  const estadosSaude = Array.from(dimensionCache.estadosSaude.values());
  const estagiosVida = Array.from(dimensionCache.estagiosVida.values());
  const desfechos = Array.from(dimensionCache.desfechos.values());
  const especies = Array.from(dimensionCache.especies.values());

  const isEditable = canEdit(formData.data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditable ? 'Editar Registro de Resgate' : 'Visualizar Registro (Somente Leitura)'}
          </DialogTitle>
        </DialogHeader>

        {!isEditable && (
          <div className="bg-amber-500/10 text-amber-600 p-3 rounded-lg text-sm mb-4">
            Este registro é anterior a 2026 e não pode ser editado.
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Região Administrativa</Label>
              <Select
                value={formData.regiao_administrativa_id}
                onValueChange={(value) => setFormData({ ...formData, regiao_administrativa_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {regioes.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de Acionamento</Label>
              <Input
                type="time"
                value={formData.horario_acionamento}
                onChange={(e) => setFormData({ ...formData, horario_acionamento: e.target.value })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário de Término</Label>
              <Input
                type="time"
                value={formData.horario_termino}
                onChange={(e) => setFormData({ ...formData, horario_termino: e.target.value })}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={formData.origem_id}
                onValueChange={(value) => setFormData({ ...formData, origem_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {origens.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Espécie</Label>
              <Select
                value={formData.especie_id}
                onValueChange={(value) => setFormData({ ...formData, especie_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {especies.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome_popular} ({e.nome_cientifico})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado de Saúde</Label>
              <Select
                value={formData.estado_saude_id}
                onValueChange={(value) => setFormData({ ...formData, estado_saude_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {estadosSaude.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estágio de Vida</Label>
              <Select
                value={formData.estagio_vida_id}
                onValueChange={(value) => setFormData({ ...formData, estagio_vida_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {estagiosVida.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destinação</Label>
              <Select
                value={formData.destinacao_id}
                onValueChange={(value) => setFormData({ ...formData, destinacao_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {destinacoes.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desfecho</Label>
              <Select
                value={formData.desfecho_id}
                onValueChange={(value) => setFormData({ ...formData, desfecho_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {desfechos.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade Adulto</Label>
              <Input
                type="number"
                min={0}
                value={formData.quantidade_adulto}
                onChange={(e) => setFormData({ ...formData, quantidade_adulto: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade Filhote</Label>
              <Input
                type="number"
                min={0}
                value={formData.quantidade_filhote}
                onChange={(e) => setFormData({ ...formData, quantidade_filhote: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude Origem</Label>
              <Input
                value={formData.latitude_origem}
                onChange={(e) => setFormData({ ...formData, latitude_origem: e.target.value })}
                placeholder="-15.7801"
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude Origem</Label>
              <Input
                value={formData.longitude_origem}
                onChange={(e) => setFormData({ ...formData, longitude_origem: e.target.value })}
                placeholder="-47.9292"
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Atropelamento</Label>
            <Select
              value={formData.atropelamento}
              onValueChange={(value) => setFormData({ ...formData, atropelamento: value })}
              disabled={!isEditable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {isEditable && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistroEditDialog;
