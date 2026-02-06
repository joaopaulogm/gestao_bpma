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
import { Input } from '@/components/ui/input';
import { RadioRow } from './types';
import { cn } from '@/lib/utils';

interface OcorrenciaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  headerKeys: string[];
  headerLabels: string[];
  formData: Record<string, string>;
  onFormDataChange: (data: Record<string, string>) => void;
  onSave: () => void;
  saving?: boolean;
  className?: string;
}

const OcorrenciaFormModal: React.FC<OcorrenciaFormModalProps> = ({
  open,
  onOpenChange,
  title,
  headerKeys,
  headerLabels,
  formData,
  onFormDataChange,
  onSave,
  saving = false,
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-2xl max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-md border-border shadow-xl rounded-2xl',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto space-y-3 py-2 pr-2 -mr-2">
          {headerKeys.map((key, i) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {headerLabels[i] ?? key}
              </Label>
              <Input
                value={formData[key] ?? ''}
                onChange={(e) =>
                  onFormDataChange({ ...formData, [key]: e.target.value })
                }
                className="text-sm"
                aria-label={headerLabels[i] ?? key}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaFormModal;
