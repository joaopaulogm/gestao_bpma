import React, { useState } from 'react';
import { Users, Plus, X, ArrowRightLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { TeamType, UnitType, CampanhaMembro, EquipeMembro } from '@/hooks/useCampanhaData';

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamType;
  unidade: UnitType;
  membros: EquipeMembro[];
  allEfetivo: any[];
  allMembros: CampanhaMembro[];
  onAddMembro: (efetivoId: string, funcao?: string) => Promise<boolean>;
  onRemoveMembro: (membroId: string) => Promise<boolean>;
  onTransferMembro: (membroId: string, novaEquipe: TeamType) => Promise<boolean>;
}

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TEAMS: TeamType[] = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

const postoOrder: Record<string, number> = {
  'Cel': 1, 'Ten Cel': 2, 'Maj': 3, 'Cap': 4, '1º Ten': 5, '2º Ten': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12,
};

export const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({
  open,
  onOpenChange,
  team,
  unidade,
  membros,
  allEfetivo,
  allMembros,
  onAddMembro,
  onRemoveMembro,
  onTransferMembro,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEfetivo, setSelectedEfetivo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transferingMembro, setTransferingMembro] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter efetivo that are not already assigned to this unit
  const availableEfetivo = allEfetivo
    .filter(e => {
      const isAssigned = allMembros.some(m => m.efetivo_id === e.id && m.unidade === unidade);
      const matchesSearch = e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matricula.includes(searchTerm);
      return !isAssigned && matchesSearch;
    })
    .sort((a, b) => {
      const orderA = postoOrder[a.posto_graduacao] || 99;
      const orderB = postoOrder[b.posto_graduacao] || 99;
      return orderA - orderB;
    });

  const handleAdd = async () => {
    if (!selectedEfetivo) return;
    setSaving(true);
    const success = await onAddMembro(selectedEfetivo);
    setSaving(false);
    if (success) {
      setSelectedEfetivo('');
      setShowAddForm(false);
    }
  };

  const handleRemove = async (membroId: string) => {
    setSaving(true);
    await onRemoveMembro(membroId);
    setSaving(false);
  };

  const handleTransfer = async (membroId: string, novaEquipe: TeamType) => {
    setSaving(true);
    await onTransferMembro(membroId, novaEquipe);
    setSaving(false);
    setTransferingMembro(null);
  };

  const sortedMembros = [...membros].sort((a, b) => {
    const orderA = postoOrder[a.efetivo?.posto_graduacao || ''] || 99;
    const orderB = postoOrder[b.efetivo?.posto_graduacao || ''] || 99;
    return orderA - orderB;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipe {team} - {unidade}
          </DialogTitle>
          <DialogDescription>
            Gerencie os membros desta equipe. Você pode adicionar, remover ou transferir policiais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Team badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${teamColors[team]} text-sm px-3 py-1`}>
              Equipe {team}
            </Badge>
            <Badge variant="secondary">{membros.length} membros</Badge>
          </div>

          {/* Members list */}
          <ScrollArea className="h-[300px] pr-4">
            {sortedMembros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum membro nesta equipe</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedMembros.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border group"
                  >
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {membro.efetivo?.posto_graduacao}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {membro.efetivo?.nome_guerra || membro.efetivo?.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mat. {membro.efetivo?.matricula}
                      </p>
                    </div>

                    {transferingMembro === membro.id ? (
                      <div className="flex items-center gap-1">
                        <Select onValueChange={(v) => handleTransfer(membro.id, v as TeamType)}>
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue placeholder="Equipe" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAMS.filter(t => t !== team).map(t => (
                              <SelectItem key={t} value={t}>
                                <Badge variant="outline" className={`${teamColors[t]} text-xs`}>
                                  {t}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setTransferingMembro(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                          onClick={() => setTransferingMembro(membro.id)}
                          title="Transferir para outra equipe"
                          disabled={saving}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleRemove(membro.id)}
                          title="Remover da equipe"
                          disabled={saving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add member form */}
          {showAddForm ? (
            <div className="space-y-3 p-3 rounded-lg border bg-card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar policial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <ScrollArea className="h-[150px]">
                <div className="space-y-1">
                  {availableEfetivo.slice(0, 50).map((ef) => (
                    <div
                      key={ef.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedEfetivo === ef.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedEfetivo(ef.id)}
                    >
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ef.posto_graduacao}
                      </Badge>
                      <span className="text-sm truncate">{ef.nome_guerra}</span>
                    </div>
                  ))}
                  {availableEfetivo.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhum policial disponível
                    </p>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedEfetivo('');
                    setSearchTerm('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAdd}
                  disabled={!selectedEfetivo || saving}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
