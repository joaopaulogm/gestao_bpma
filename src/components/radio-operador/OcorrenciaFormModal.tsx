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
import { cn } from '@/lib/utils';
import { Save, X, Loader2, FileEdit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
          'max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden',
          'bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl',
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileEdit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Preencha os campos abaixo para atualizar a ocorrência
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form Content */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {headerKeys.map((key, i) => {
                const isWide = key.toLowerCase().includes('local') || key.toLowerCase().includes('destinação');
                
                return (
                  <div 
                    key={key} 
                    className={cn(
                      'space-y-2',
                      isWide && 'sm:col-span-2'
                    )}
                  >
                    <Label 
                      htmlFor={key}
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      {headerLabels[i] ?? key}
                    </Label>
                    <Input
                      id={key}
                      value={formData[key] ?? ''}
                      onChange={(e) =>
                        onFormDataChange({ ...formData, [key]: e.target.value })
                      }
                      className="h-10 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 transition-all"
                      aria-label={headerLabels[i] ?? key}
                    />
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
            disabled={saving}
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OcorrenciaFormModal;
