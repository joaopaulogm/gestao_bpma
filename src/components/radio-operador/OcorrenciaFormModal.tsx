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
import { cn } from '@/lib/utils';
import { Save, X, Loader2, FileEdit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RadioRow } from './types';
import type { useRadioDimensions } from './useRadioDimensions';

interface OcorrenciaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RadioRow;
  isCrime: boolean;
  dims: ReturnType<typeof useRadioDimensions>;
  onSaved: () => void;
}

const NONE_VALUE = '__none__';

const OcorrenciaFormModal: React.FC<OcorrenciaFormModalProps> = ({
  open, onOpenChange, row, isCrime, dims, onSaved,
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && row) {
      // Parse date from DD/MM/YYYY to YYYY-MM-DD for input
      let dataISO = '';
      const dataStr = String(row.data['Data'] ?? '');
      const dm = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (dm) dataISO = `${dm[3]}-${dm[2]!.padStart(2, '0')}-${dm[1]!.padStart(2, '0')}`;
      else dataISO = dataStr;

      // Extract time from HH:MM display
      const getTime = (key: string) => {
        const v = String(row.data[key] ?? '').trim();
        return v && v !== '—' ? v : '';
      };

      setForm({
        data: dataISO,
        equipe_id: String(row.data['_equipe_id'] ?? ''),
        ocorrencia_copom: String(row.data['N° OCORRÊNCIA COPOM'] ?? ''),
        fauna_crime: isCrime ? String(row.data['CRIME'] ?? '') : String(row.data['FAUNA'] ?? ''),
        hora_cadastro: getTime('Hora cadastro'),
        hora_recebido: getTime('Hora recebido COPOM'),
        hora_despacho: getTime('Despacho RO'),
        hora_finalizacao: getTime('Hora finalização'),
        telefone: String(row.data['Telefone'] ?? ''),
        local_id: String(row.data['_local_id'] ?? ''),
        prefixo: String(row.data['PREFIXO'] ?? ''),
        grupamento_id: String(row.data['_grupamento_id'] ?? ''),
        cmt_vtr: String(row.data['CMT VTR'] ?? ''),
        desfecho_id: String(row.data['_desfecho_id'] ?? ''),
        destinacao_id: String(row.data['_destinacao_id'] ?? ''),
        numero_rap: String(row.data['N° RAP'] ?? ''),
        numero_tco: isCrime ? String(row.data['N° TCO'] ?? '') : '',
      });
    }
  }, [open, row, isCrime]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const desfechosForTab = isCrime ? dims.getDesfechosForTab('crime') : dims.getDesfechosForTab('resgate');
  const destinacoesForTab = isCrime ? dims.getDestinacoesForTab('crime') : dims.getDestinacoesForTab('resgate');

  const handleSave = async () => {
    if (!form.data) { toast.error('Data é obrigatória'); return; }
    setSaving(true);
    try {
      const table = isCrime
        ? 'fat_controle_ocorrencias_crime_ambientais_2026'
        : 'fat_controle_ocorrencias_resgate_2026';

      // Ensure local exists
      let localId = form.local_id || null;

      const updateObj: any = {
        data: form.data,
        equipe_id: form.equipe_id || null,
        ocorrencia_copom: form.ocorrencia_copom || null,
        hora_cadastro_ocorrencia: form.hora_cadastro ? form.hora_cadastro + (form.hora_cadastro.split(':').length < 3 ? ':00' : '') : null,
        hora_recebido_copom_central: form.hora_recebido ? form.hora_recebido + (form.hora_recebido.split(':').length < 3 ? ':00' : '') : null,
        hora_despacho_ro: form.hora_despacho ? form.hora_despacho + (form.hora_despacho.split(':').length < 3 ? ':00' : '') : null,
        hora_finalizacao_ocorrencia: form.hora_finalizacao ? form.hora_finalizacao + (form.hora_finalizacao.split(':').length < 3 ? ':00' : '') : null,
        telefone: form.telefone || null,
        local_id: localId,
        prefixo: form.prefixo || null,
        grupamento_id: form.grupamento_id || null,
        cmt_vtr: form.cmt_vtr || null,
        desfecho_id: form.desfecho_id || null,
        destinacao_id: form.destinacao_id || null,
        numero_rap: form.numero_rap || null,
      };

      if (isCrime) {
        updateObj.crime = form.fauna_crime || null;
        updateObj.numero_tco_pmdf_ou_tco_apf_pcdf = form.numero_tco || null;
      } else {
        updateObj.fauna = form.fauna_crime || null;
      }

      const { error } = await (supabase as any).from(table).update(updateObj).eq('id', row.id);
      if (error) throw error;
      toast.success('Ocorrência atualizada');
      onOpenChange(false);
      onSaved();
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + (e.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (label: string, key: string, options: { id: string; nome: string }[], placeholder: string) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Select value={form[key] || NONE_VALUE} onValueChange={(v) => set(key, v === NONE_VALUE ? '' : v)}>
        <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>— Nenhum —</SelectItem>
          {options.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const renderInput = (label: string, key: string, type = 'text', placeholder = '') => (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input type={type} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="h-10 rounded-xl" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl')}>
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileEdit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Editar Ocorrência</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Atualize os campos e salve</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Data', 'data', 'date')}
              {renderSelect('Equipe', 'equipe_id', dims.equipes, 'Selecione')}
              {renderInput('N° Ocorrência COPOM', 'ocorrencia_copom')}
              {renderInput(isCrime ? 'Crime' : 'Fauna', 'fauna_crime')}
              {renderInput('Hora Cadastro', 'hora_cadastro', 'time')}
              {renderInput('Hora Recebido COPOM', 'hora_recebido', 'time')}
              {renderInput('Hora Despacho RO', 'hora_despacho', 'time')}
              {renderInput('Hora Finalização', 'hora_finalizacao', 'time')}
              {renderInput('Telefone', 'telefone', 'tel')}
              {renderSelect('Local (RA)', 'local_id', dims.locais, 'Selecione')}
              {renderInput('Prefixo', 'prefixo')}
              {renderSelect('Grupamento', 'grupamento_id', dims.grupamentos, 'Selecione')}
              {renderInput('CMT VTR', 'cmt_vtr')}
              {renderSelect('Desfecho', 'desfecho_id', desfechosForTab, 'Selecione')}
              {renderSelect('Destinação', 'destinacao_id', destinacoesForTab, 'Selecione')}
              {renderInput('N° RAP', 'numero_rap')}
              {isCrime && renderInput('N° TCO - PMDF ou TCO/APF-PCDF', 'numero_tco')}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/10 gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="rounded-xl">
            <X className="h-4 w-4 mr-2" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
            {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>) : (<><Save className="h-4 w-4 mr-2" />Salvar</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaFormModal;
