import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { useRadioDimensions } from './useRadioDimensions';

interface NovaOcorrenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'resgate' | 'crime';
  dims: ReturnType<typeof useRadioDimensions>;
  onSaved: () => void;
}

const NovaOcorrenciaModal: React.FC<NovaOcorrenciaModalProps> = ({
  open, onOpenChange, type, dims, onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [equipeId, setEquipeId] = useState('');
  const [ocorrenciaCopom, setOcorrenciaCopom] = useState('');
  const [faunaOuCrime, setFaunaOuCrime] = useState('');
  const [horaCadastro, setHoraCadastro] = useState('');
  const [horaRecebidoCopom, setHoraRecebidoCopom] = useState('');

  useEffect(() => {
    if (open) {
      setDataOcorrencia(format(new Date(), 'yyyy-MM-dd'));
      setEquipeId('');
      setOcorrenciaCopom('');
      setFaunaOuCrime('');
      setHoraCadastro('');
      setHoraRecebidoCopom('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!dataOcorrencia || !ocorrenciaCopom.trim() || !faunaOuCrime.trim() || !horaCadastro || !horaRecebidoCopom) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const baseRecord: any = {
        data: dataOcorrencia,
        equipe_id: equipeId || null,
        ocorrencia_copom: ocorrenciaCopom.trim(),
        hora_cadastro_ocorrencia: horaCadastro + ':00',
        hora_recebido_copom_central: horaRecebidoCopom + ':00',
      };

      if (type === 'resgate') {
        const { error } = await (supabase as any)
          .from('fat_controle_ocorrencias_resgate_2026')
          .insert({ ...baseRecord, fauna: faunaOuCrime.trim() });
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('fat_controle_ocorrencias_crime_ambientais_2026')
          .insert({ ...baseRecord, crime: faunaOuCrime.trim() });
        if (error) throw error;
      }

      toast.success('Ocorrência registrada com sucesso!');
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao salvar: ' + (e.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#071d49] to-[#0d3a7a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                Nova Ocorrência - {type === 'resgate' ? 'Resgate de Fauna' : 'Crime Ambiental'}
              </DialogTitle>
              <p className="text-sm text-white/70 mt-0.5">Preencha os campos obrigatórios</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data *</Label>
              <Input type="date" value={dataOcorrencia} onChange={(e) => setDataOcorrencia(e.target.value)} className="h-10 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Equipe</Label>
              <Select value={equipeId} onValueChange={setEquipeId}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Selecione a equipe" /></SelectTrigger>
                <SelectContent>
                  {dims.equipes.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">N° Ocorrência COPOM *</Label>
              <Input value={ocorrenciaCopom} onChange={(e) => setOcorrenciaCopom(e.target.value)} placeholder="Ex: 123456" className="h-10 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {type === 'resgate' ? 'Fauna *' : 'Crime *'}
              </Label>
              <Input value={faunaOuCrime} onChange={(e) => setFaunaOuCrime(e.target.value)} placeholder={type === 'resgate' ? 'Ex: Serpente' : 'Ex: Desmatamento'} className="h-10 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hora Cadastro *</Label>
                <Input type="time" value={horaCadastro} onChange={(e) => setHoraCadastro(e.target.value)} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hora Recebido COPOM *</Label>
                <Input type="time" value={horaRecebidoCopom} onChange={(e) => setHoraRecebidoCopom(e.target.value)} className="h-10 rounded-xl" />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="rounded-xl">
            <X className="h-4 w-4 mr-2" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-[#071d49] to-[#0d3a7a] text-white hover:opacity-90">
            {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>) : (<><Save className="h-4 w-4 mr-2" />Registrar Ocorrência</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovaOcorrenciaModal;
