import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, X, Check, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamType, UnitType } from '@/hooks/useCampanhaData';

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  unidade: UnitType;
  currentTeam: TeamType | null;
  hasExistingAlteration: boolean;
  onSave: (team: TeamType, motivo?: string) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
}

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TEAMS: TeamType[] = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

export const EditTeamDialog: React.FC<EditTeamDialogProps> = ({
  open,
  onOpenChange,
  date,
  unidade,
  currentTeam,
  hasExistingAlteration,
  onSave,
  onRemove,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<TeamType | ''>(currentTeam || '');
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedTeam) return;
    setSaving(true);
    const success = await onSave(selectedTeam, motivo || undefined);
    setSaving(false);
    if (success) {
      onOpenChange(false);
      setMotivo('');
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    const success = await onRemove();
    setSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Alterar Equipe de Serviço
          </DialogTitle>
          <DialogDescription>
            Altere a equipe escalada para esta unidade neste dia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Data:</span>
              <span className="font-medium">
                {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unidade:</span>
              <Badge variant="secondary">{unidade}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Equipe atual:</span>
              {currentTeam ? (
                <Badge variant="outline" className={teamColors[currentTeam]}>
                  {currentTeam}
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            {hasExistingAlteration && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-500">Este dia possui uma alteração manual</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nova equipe</label>
            <Select value={selectedTeam} onValueChange={(v) => setSelectedTeam(v as TeamType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a equipe" />
              </SelectTrigger>
              <SelectContent>
                {TEAMS.map(team => (
                  <SelectItem key={team} value={team}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${teamColors[team]} text-xs`}>
                        {team}
                      </Badge>
                      <span>Equipe {team}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo da alteração (opcional)</label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Troca de serviço solicitada pelo policial..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasExistingAlteration && (
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={saving}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Alteração
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedTeam || saving}>
            <Check className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
