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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
const supabaseAny = supabase as any;
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RegistroCrime {
  id: string;
  data: string;
  regiao_administrativa_id?: string;
  tipo_crime_id?: string;
  enquadramento_id?: string;
  tipo_area_id?: string;
  latitude: string;
  longitude: string;
  ocorreu_apreensao: boolean;
  procedimento_legal?: string;
  qtd_detidos_maior?: number;
  qtd_detidos_menor?: number;
  qtd_liberados_maior?: number;
  qtd_liberados_menor?: number;
  desfecho_id?: string;
  horario_acionamento?: string;
  horario_desfecho?: string;
}

interface CrimeAmbientalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: RegistroCrime | null;
  onSuccess: () => void;
  regioes: Array<{ id: string; nome: string }>;
  tiposCrime: Array<{ id_tipo_de_crime: string; "Tipo de Crime": string }>;
}

const CrimeAmbientalEditDialog: React.FC<CrimeAmbientalEditDialogProps> = ({
  open,
  onOpenChange,
  registro,
  onSuccess,
  regioes,
  tiposCrime,
}) => {
  const [formData, setFormData] = useState<RegistroCrime>({
    id: '',
    data: '',
    latitude: '',
    longitude: '',
    ocorreu_apreensao: false,
    horario_acionamento: '',
    horario_desfecho: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (registro) {
      // Converter horários do formato TIME do PostgreSQL para formato HH:MM
      const formatTime = (time: string | undefined) => {
        if (!time) return '';
        // Se já está no formato HH:MM, retornar
        if (time.match(/^\d{2}:\d{2}$/)) return time;
        // Se está no formato HH:MM:SS, pegar apenas HH:MM
        if (time.match(/^\d{2}:\d{2}:\d{2}/)) return time.substring(0, 5);
        return '';
      };

      setFormData({
        id: registro.id,
        data: registro.data?.split('T')[0] || '',
        regiao_administrativa_id: registro.regiao_administrativa_id || '',
        tipo_crime_id: registro.tipo_crime_id || '',
        latitude: registro.latitude || '',
        longitude: registro.longitude || '',
        ocorreu_apreensao: registro.ocorreu_apreensao || false,
        procedimento_legal: registro.procedimento_legal || '',
        qtd_detidos_maior: registro.qtd_detidos_maior || 0,
        qtd_detidos_menor: registro.qtd_detidos_menor || 0,
        qtd_liberados_maior: registro.qtd_liberados_maior || 0,
        qtd_liberados_menor: registro.qtd_liberados_menor || 0,
        horario_acionamento: formatTime(registro.horario_acionamento),
        horario_desfecho: formatTime(registro.horario_desfecho),
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
      const { error } = await supabaseAny
        .from('fat_registros_de_crimes_ambientais')
        .update({
          data: formData.data,
          regiao_administrativa_id: formData.regiao_administrativa_id || null,
          tipo_crime_id: formData.tipo_crime_id || null,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          ocorreu_apreensao: formData.ocorreu_apreensao,
          procedimento_legal: formData.procedimento_legal || null,
          qtd_detidos_maior: formData.qtd_detidos_maior || 0,
          qtd_detidos_menor: formData.qtd_detidos_menor || 0,
          qtd_liberados_maior: formData.qtd_liberados_maior || 0,
          qtd_liberados_menor: formData.qtd_liberados_menor || 0,
          horario_acionamento: formData.horario_acionamento || null,
          horario_desfecho: formData.horario_desfecho || null,
        })
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

  if (!registro) return null;

  const isEditable = canEdit(formData.data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditable ? 'Editar Registro de Crime Ambiental' : 'Visualizar Registro (Somente Leitura)'}
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
              <Label>Horário de Acionamento</Label>
              <Input
                type="time"
                value={formData.horario_acionamento || ''}
                onChange={(e) => setFormData({ ...formData, horario_acionamento: e.target.value })}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de Término/Desfecho</Label>
              <Input
                type="time"
                value={formData.horario_desfecho || ''}
                onChange={(e) => setFormData({ ...formData, horario_desfecho: e.target.value })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Região Administrativa</Label>
              <Select
                value={formData.regiao_administrativa_id || ''}
                onValueChange={(value) => setFormData({ ...formData, regiao_administrativa_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {regioes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Crime</Label>
              <Select
                value={formData.tipo_crime_id || ''}
                onValueChange={(value) => setFormData({ ...formData, tipo_crime_id: value })}
                disabled={!isEditable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposCrime.map((t) => (
                    <SelectItem key={t.id_tipo_de_crime} value={t.id_tipo_de_crime}>
                      {t["Tipo de Crime"]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Procedimento Legal</Label>
              <Input
                value={formData.procedimento_legal || ''}
                onChange={(e) => setFormData({ ...formData, procedimento_legal: e.target.value })}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-15.7801"
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-47.9292"
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Switch
              id="ocorreu_apreensao"
              checked={formData.ocorreu_apreensao}
              onCheckedChange={(checked) => setFormData({ ...formData, ocorreu_apreensao: checked })}
              disabled={!isEditable}
            />
            <Label htmlFor="ocorreu_apreensao" className="cursor-pointer">
              Ocorreu Apreensão
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Detidos Maiores</Label>
              <Input
                type="number"
                min={0}
                value={formData.qtd_detidos_maior || 0}
                onChange={(e) => setFormData({ ...formData, qtd_detidos_maior: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Detidos Menores</Label>
              <Input
                type="number"
                min={0}
                value={formData.qtd_detidos_menor || 0}
                onChange={(e) => setFormData({ ...formData, qtd_detidos_menor: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Liberados Maiores</Label>
              <Input
                type="number"
                min={0}
                value={formData.qtd_liberados_maior || 0}
                onChange={(e) => setFormData({ ...formData, qtd_liberados_maior: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
            <div className="space-y-2">
              <Label>Liberados Menores</Label>
              <Input
                type="number"
                min={0}
                value={formData.qtd_liberados_menor || 0}
                onChange={(e) => setFormData({ ...formData, qtd_liberados_menor: parseInt(e.target.value) || 0 })}
                disabled={!isEditable}
              />
            </div>
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

export default CrimeAmbientalEditDialog;
