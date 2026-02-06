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
import { RadioRow, getDisplayVal, getRowData } from './types';
import { cn } from '@/lib/utils';

interface OcorrenciaViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: RadioRow | null;
  columns: { id: string; header: string; key: string }[];
  onEdit: () => void;
  className?: string;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-2xl max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-md border-border shadow-xl rounded-2xl',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>Visualizar ocorrência</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto space-y-3 py-2 pr-2 -mr-2">
          {columns.map((col) => {
            const val = getRowData(row, col.key) ?? row.data[col.key];
            const str = getDisplayVal(val);
            return (
              <div key={col.id} className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">{col.header}</Label>
                <p className="text-sm text-foreground">{str}</p>
              </div>
            );
          })}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => { onEdit(); onOpenChange(false); }}>
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaViewModal;
