import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus } from 'lucide-react';
import { UnitType, UNITS, EfetivoData, VolunteerEntry } from '@/hooks/useCampanhaCalendar';

interface VolunteerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  efetivo: EfetivoData[];
  onSave: (volunteer: VolunteerEntry) => void;
  existingVolunteers: string[]; // efetivo_ids already added
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  open,
  onOpenChange,
  efetivo,
  onSave,
  existingVolunteers,
}) => {
  const [selectedUnidade, setSelectedUnidade] = useState<UnitType | ''>('');
  const [selectedEfetivo, setSelectedEfetivo] = useState<string>('');
  const [observacao, setObservacao] = useState('');
  const [search, setSearch] = useState('');

  const filteredEfetivo = efetivo.filter(e => {
    if (existingVolunteers.includes(e.id)) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      e.nome_guerra.toLowerCase().includes(searchLower) ||
      e.nome.toLowerCase().includes(searchLower) ||
      e.matricula.toLowerCase().includes(searchLower)
    );
  });

  const handleSave = () => {
    if (!selectedEfetivo || !selectedUnidade) return;
    
    onSave({
      efetivo_id: selectedEfetivo,
      unidade: selectedUnidade,
      observacao: observacao || undefined,
    });

    // Reset form
    setSelectedUnidade('');
    setSelectedEfetivo('');
    setObservacao('');
    setSearch('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedUnidade('');
    setSelectedEfetivo('');
    setObservacao('');
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Voluntário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Unidade selection */}
          <div className="space-y-2">
            <Label>Unidade</Label>
            <Select value={selectedUnidade} onValueChange={(v) => setSelectedUnidade(v as UnitType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search and select policial */}
          <div className="space-y-2">
            <Label>Policial</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ScrollArea className="h-[200px] border rounded-xl">
              <div className="p-2 space-y-1">
                {filteredEfetivo.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nenhum policial encontrado
                  </p>
                ) : (
                  filteredEfetivo.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEfetivo(e.id)}
                      className={`
                        w-full text-left p-2 rounded-lg transition-colors text-sm
                        ${selectedEfetivo === e.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono opacity-70">
                          {e.posto_graduacao}
                        </span>
                        <span className="font-medium">{e.nome_guerra}</span>
                      </div>
                      <span className="text-xs opacity-70">{e.matricula}</span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Textarea
              placeholder="Adicione uma observação..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={!selectedEfetivo || !selectedUnidade}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
