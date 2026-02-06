import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioRow, getDisplayVal, getRowData } from './types';
import { cn } from '@/lib/utils';
import { Pencil, X, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OcorrenciaViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RadioRow | null;
  columns: { id: string; header: string; key: string }[];
  onEdit: () => void;
  className?: string;
}

/** Get badge variant for status display */
function getDesfechoVariant(desfecho: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const d = (desfecho || '').toUpperCase();
  if (d.includes('PENDENTE') || d.includes('EVADIDO') || d.includes('ÓBITO')) return 'destructive';
  if (d.includes('RESGATADO') || d.includes('SOLTURA') || d.includes('VIDA LIVRE') || d.includes('PRISÃO')) return 'default';
  if (d.includes('NADA CONSTATADO') || d.includes('LIBERADO')) return 'secondary';
  return 'outline';
}

const OcorrenciaViewModal: React.FC<OcorrenciaViewModalProps> = ({
  open,
  onOpenChange,
  row,
  columns,
  onEdit,
  className,
}) => {
  if (!row) return null;

  const dataValue = getRowData(row, 'Data') ?? row.data['Data'];
  const equipeValue = getRowData(row, 'Equipe') ?? row.data['Equipe'];
  const copomValue = getRowData(row, 'N° OCORRÊNCIA COPOM') ?? row.data['N° OCORRÊNCIA COPOM'];
  const desfechoValue = getRowData(row, 'Desfecho') ?? row.data['Desfecho'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden',
          'bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl',
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Detalhes da Ocorrência
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {getDisplayVal(dataValue)} • {getDisplayVal(equipeValue)}
                </p>
              </div>
            </div>
            {desfechoValue && (
              <Badge 
                variant={getDesfechoVariant(String(desfechoValue))}
                className="shrink-0"
              >
                {getDisplayVal(desfechoValue)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {columns.map((col) => {
                const val = getRowData(row, col.key) ?? row.data[col.key];
                const str = getDisplayVal(val);
                const isDesfecho = col.id === 'Desfecho';
                
                return (
                  <div 
                    key={col.id} 
                    className={cn(
                      'space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/30',
                      col.id === 'LOCAL' && 'sm:col-span-2'
                    )}
                  >
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {col.header}
                    </Label>
                    {isDesfecho ? (
                      <Badge variant={getDesfechoVariant(str)} className="mt-1">
                        {str}
                      </Badge>
                    ) : (
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {str}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/10 gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button 
            onClick={() => { onEdit(); onOpenChange(false); }}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaViewModal;
