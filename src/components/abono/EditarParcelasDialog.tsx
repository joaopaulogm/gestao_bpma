import React, { useState, useEffect } from 'react';
import { Edit2, Calendar, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Parcela {
  inicio: string;
  fim: string;
  dias: number | null;
  sgpol: boolean;
  campanha: boolean;
}

interface MilitarAbono {
  id: string;
  efetivo_id: string;
  nome_guerra: string;
  posto: string;
  matricula: string;
  parcela1_inicio: string | null;
  parcela1_fim: string | null;
  parcela1_dias: number | null;
  parcela1_sgpol: boolean;
  parcela1_campanha: boolean;
  parcela2_inicio: string | null;
  parcela2_fim: string | null;
  parcela2_dias: number | null;
  parcela2_sgpol: boolean;
  parcela2_campanha: boolean;
  parcela3_inicio: string | null;
  parcela3_fim: string | null;
  parcela3_dias: number | null;
}

interface EditarParcelasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  militar: MilitarAbono | null;
  onSuccess: () => void;
}

export const EditarParcelasDialog: React.FC<EditarParcelasDialogProps> = ({
  open,
  onOpenChange,
  militar,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [parcela1, setParcela1] = useState<Parcela>({ inicio: '', fim: '', dias: null, sgpol: false, campanha: false });
  const [parcela2, setParcela2] = useState<Parcela>({ inicio: '', fim: '', dias: null, sgpol: false, campanha: false });
  const [parcela3, setParcela3] = useState<Parcela>({ inicio: '', fim: '', dias: null, sgpol: false, campanha: false });

  useEffect(() => {
    if (militar) {
      setParcela1({
        inicio: militar.parcela1_inicio || '',
        fim: militar.parcela1_fim || '',
        dias: militar.parcela1_dias,
        sgpol: militar.parcela1_sgpol || false,
        campanha: militar.parcela1_campanha || false,
      });
      setParcela2({
        inicio: militar.parcela2_inicio || '',
        fim: militar.parcela2_fim || '',
        dias: militar.parcela2_dias,
        sgpol: militar.parcela2_sgpol || false,
        campanha: militar.parcela2_campanha || false,
      });
      setParcela3({
        inicio: militar.parcela3_inicio || '',
        fim: militar.parcela3_fim || '',
        dias: null,
        sgpol: false,
        campanha: false,
      });
    }
  }, [militar]);

  const handleSubmit = async () => {
    if (!militar) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('fat_abono')
        .update({
          parcela1_inicio: parcela1.inicio || null,
          parcela1_fim: parcela1.fim || null,
          parcela1_dias: parcela1.dias,
          parcela1_sgpol: parcela1.sgpol,
          parcela1_campanha: parcela1.campanha,
          parcela2_inicio: parcela2.inicio || null,
          parcela2_fim: parcela2.fim || null,
          parcela2_dias: parcela2.dias,
          parcela2_sgpol: parcela2.sgpol,
          parcela2_campanha: parcela2.campanha,
          parcela3_inicio: parcela3.inicio || null,
          parcela3_fim: parcela3.fim || null,
          parcela3_dias: parcela3.dias,
          data_inicio: parcela1.inicio || parcela2.inicio || parcela3.inicio || null,
          data_fim: parcela1.fim || parcela2.fim || parcela3.fim || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', militar.id);

      if (error) throw error;
      
      toast.success(`Parcelas de ${militar.nome_guerra} atualizadas`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar parcelas:', error);
      toast.error('Erro ao atualizar parcelas');
    } finally {
      setSubmitting(false);
    }
  };

  const renderParcelaFields = (
    label: string,
    parcela: Parcela,
    setParcela: React.Dispatch<React.SetStateAction<Parcela>>
  ) => (
    <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline" className="text-xs">
          {parcela.dias ? `${parcela.dias} dias` : 'Não definido'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Início</Label>
          <Input
            type="date"
            value={parcela.inicio}
            onChange={(e) => setParcela(prev => ({ ...prev, inicio: e.target.value }))}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fim</Label>
          <Input
            type="date"
            value={parcela.fim}
            onChange={(e) => setParcela(prev => ({ ...prev, fim: e.target.value }))}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${label}-sgpol`}
            checked={parcela.sgpol}
            onCheckedChange={(checked) => setParcela(prev => ({ ...prev, sgpol: !!checked }))}
          />
          <Label htmlFor={`${label}-sgpol`} className="text-xs cursor-pointer">
            Lançado SGPOL
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${label}-campanha`}
            checked={parcela.campanha}
            onCheckedChange={(checked) => setParcela(prev => ({ ...prev, campanha: !!checked }))}
          />
          <Label htmlFor={`${label}-campanha`} className="text-xs cursor-pointer">
            Lançado Campanha
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Editar Parcelas de Abono
          </DialogTitle>
          <DialogDescription>
            {militar && (
              <span className="flex items-center gap-2">
                <Badge variant="outline">{militar.posto}</Badge>
                <span className="font-medium">{militar.nome_guerra}</span>
                <span className="text-muted-foreground">- Mat: {militar.matricula}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderParcelaFields('1ª Parcela', parcela1, setParcela1)}
          {renderParcelaFields('2ª Parcela', parcela2, setParcela2)}
          {renderParcelaFields('3ª Parcela', parcela3, setParcela3)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
