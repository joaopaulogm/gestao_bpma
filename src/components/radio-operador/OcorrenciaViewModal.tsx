import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioRow, getDisplayVal, getRowData } from './types';
import { cn } from '@/lib/utils';
import { Pencil, X, FileText, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatIntervalHHMM, intervalToMinutes } from './useRadioDimensions';

interface OcorrenciaViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RadioRow | null;
  columns: { id: string; header: string; key: string }[];
  onEdit: () => void;
  className?: string;
}

const OcorrenciaViewModal: React.FC<OcorrenciaViewModalProps> = ({
  open, onOpenChange, row, columns, onEdit, className,
}) => {
  if (!row) return null;

  const desfechoValue = String(row.data['Desfecho'] ?? '').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl', className)}>
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Detalhes da Ocorrência</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {getDisplayVal(row.data['Data'])} • {getDisplayVal(row.data['Equipe'])}
                </p>
              </div>
            </div>
            {desfechoValue ? (
              <Badge className="shrink-0 bg-[#071d49]/10 text-[#071d49]">{desfechoValue}</Badge>
            ) : (
              <Badge variant="destructive" className="shrink-0">Sem desfecho</Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {columns.map((col) => {
                const val = getRowData(row, col.key) ?? row.data[col.key];
                const isDuration = col.id.startsWith('Duração');
                let displayStr: string;

                if (isDuration) {
                  displayStr = formatIntervalHHMM(val as string);
                } else if (col.id === 'Desfecho') {
                  const d = String(val ?? '').trim();
                  displayStr = d || 'Sem desfecho';
                } else {
                  displayStr = getDisplayVal(val);
                }

                // Duration alerts
                let alert = false;
                if (isDuration) {
                  const mins = intervalToMinutes(val as string);
                  if (col.id === 'Duração cadastro/encaminhamento' && mins != null && mins > 30) alert = true;
                  if (col.id === 'Duração despacho/finalização' && mins != null && mins > 120) alert = true;
                }

                return (
                  <div
                    key={col.id}
                    className={cn(
                      'space-y-1.5 p-3 rounded-xl border border-border/30',
                      alert ? 'bg-red-50 border-red-200' : 'bg-muted/30',
                      col.id === 'LOCAL' && 'sm:col-span-2',
                    )}
                  >
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.header.replace(/\n/g, ' ')}
                    </Label>
                    <div className="flex items-center gap-1">
                      {alert && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      {col.id === 'Desfecho' && !String(val ?? '').trim() ? (
                        <span className="text-sm font-medium text-red-500">Sem desfecho</span>
                      ) : (
                        <p className={cn('text-sm font-medium text-foreground leading-relaxed', alert && 'text-red-600 font-bold')}>
                          {displayStr}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/10 gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
          <Button onClick={() => { onEdit(); onOpenChange(false); }} className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaViewModal;
