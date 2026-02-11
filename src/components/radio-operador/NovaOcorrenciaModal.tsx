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

const timeToDb = (v: string) => (v && v.trim() ? (v.split(':').length < 3 ? v + ':00' : v) : null);

const NovaOcorrenciaModal: React.FC<NovaOcorrenciaModalProps> = ({
  open, onOpenChange, type, dims, onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    data: '',
    equipe_id: '',
    ocorrencia_copom: '',
    fauna_crime: '',
    hora_cadastro: '',
    hora_recebido: '',
    hora_despacho: '',
    hora_finalizacao: '',
    telefone: '',
    local_id: '',
    prefixo: '',
    grupamento_id: '',
    cmt_vtr: '',
    desfecho_id: '',
    destinacao_id: '',
    numero_rap: '',
    numero_tco: '',
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) {
      setForm({
        data: format(new Date(), 'yyyy-MM-dd'),
        equipe_id: '',
        ocorrencia_copom: '',
        fauna_crime: '',
        hora_cadastro: '',
        hora_recebido: '',
        hora_despacho: '',
        hora_finalizacao: '',
        telefone: '',
        local_id: '',
        prefixo: '',
        grupamento_id: '',
        cmt_vtr: '',
        desfecho_id: '',
        destinacao_id: '',
        numero_rap: '',
        numero_tco: '',
      });
    }
  }, [open]);

  const desfechosForTab = type === 'resgate' ? dims.getDesfechosForTab('resgate') : dims.getDesfechosForTab('crime');
  const destinacoesForTab = type === 'resgate' ? dims.getDestinacoesForTab('resgate') : dims.getDestinacoesForTab('crime');
  const grupamentosForTab = type === 'resgate' ? dims.getGrupamentosForTab('resgate') : dims.getGrupamentosForTab('crime');

  const handleSave = async () => {
    if (!form.data || !form.ocorrencia_copom.trim() || !form.fauna_crime.trim()) {
      toast.error('Preencha Data, N° Ocorrência COPOM e ' + (type === 'resgate' ? 'Fauna' : 'Crime'));
      return;
    }

    setSaving(true);
    try {
      const baseRecord: any = {
        data: form.data,
        equipe_id: form.equipe_id || null,
        ocorrencia_copom: form.ocorrencia_copom.trim(),
        fauna: type === 'resgate' ? form.fauna_crime.trim() : undefined,
        crime: type === 'crime' ? form.fauna_crime.trim() : undefined,
        hora_cadastro_ocorrencia: timeToDb(form.hora_cadastro),
        hora_recebido_copom_central: timeToDb(form.hora_recebido),
        hora_despacho_ro: timeToDb(form.hora_despacho),
        hora_finalizacao_ocorrencia: timeToDb(form.hora_finalizacao),
        telefone: form.telefone?.trim() || null,
        local_id: form.local_id || null,
        prefixo: form.prefixo?.trim() || null,
        grupamento_id: form.grupamento_id || null,
        cmt_vtr: form.cmt_vtr?.trim() || null,
        desfecho_id: form.desfecho_id || null,
        destinacao_id: form.destinacao_id || null,
        numero_rap: form.numero_rap?.trim() || null,
      };

      if (type === 'resgate') {
        const { error } = await (supabase as any)
          .from('fat_controle_ocorrencias_resgate_2026')
          .insert(baseRecord);
        if (error) throw error;
      } else {
        baseRecord.numero_tco_pmdf_ou_tco_apf_pcdf = form.numero_tco?.trim() || null;
        delete baseRecord.fauna;
        const { error } = await (supabase as any)
          .from('fat_controle_ocorrencias_crime_ambientais_2026')
          .insert(baseRecord);
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

  const renderSelect = (label: string, key: string, options: { id: string; nome: string }[], placeholder: string) => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={form[key] || '__none__'} onValueChange={(v) => set(key, v === '__none__' ? '' : v)}>
        <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— Nenhum —</SelectItem>
          {options.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const renderInput = (label: string, key: string, type = 'text', placeholder = '') => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type={type} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="h-10 rounded-xl" />
    </div>
  );

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Data *', 'data', 'date')}
              {renderSelect('Equipe', 'equipe_id', dims.equipes, 'Selecione')}
              {renderInput('N° Ocorrência COPOM *', 'ocorrencia_copom', 'text', 'Ex: 123456')}
              {renderInput(type === 'resgate' ? 'Fauna *' : 'Crime *', 'fauna_crime', 'text', type === 'resgate' ? 'Ex: Serpente' : 'Ex: Desmatamento')}
              {renderInput('Hora Cadastro', 'hora_cadastro', 'time')}
              {renderInput('Hora Recebido COPOM', 'hora_recebido', 'time')}
              {renderInput('Hora Despacho RO', 'hora_despacho', 'time')}
              {renderInput('Hora Finalização', 'hora_finalizacao', 'time')}
              {renderInput('Telefone', 'telefone', 'tel', '(61) 99999-9999')}
              {renderSelect('Local (RA)', 'local_id', dims.locaisFromRegioes, 'Selecione')}
              {renderInput('Prefixo', 'prefixo')}
              {renderSelect('Grupamento', 'grupamento_id', grupamentosForTab, 'Selecione')}
              {renderInput('CMT VTR', 'cmt_vtr')}
              {renderSelect('Desfecho', 'desfecho_id', desfechosForTab, 'Selecione')}
              {renderSelect('Destinação', 'destinacao_id', destinacoesForTab, 'Selecione')}
              {renderInput('N° RAP', 'numero_rap')}
              {type === 'crime' && renderInput('N° TCO - PMDF ou TCO/APF-PCDF', 'numero_tco')}
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
