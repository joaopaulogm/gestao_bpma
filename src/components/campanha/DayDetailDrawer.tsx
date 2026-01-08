import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TeamCard } from './TeamCard';
import { StatusLegendChips } from './StatusLegendChips';
import { MonthlyVacationQuotaCard } from './MonthlyVacationQuotaCard';
import { VolunteerModal } from './VolunteerModal';
import { 
  TeamForDay, 
  MemberStatus, 
  DayCounts, 
  STATUS_COLORS,
  EfetivoData,
  VolunteerEntry,
} from '@/hooks/useCampanhaCalendar';
import { 
  UserPlus, 
  Users, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Star,
  Search,
  X,
} from 'lucide-react';

interface DayDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  teams: TeamForDay[];
  counts: DayCounts;
  vacationQuota: { limit: number; marked: number; balance: number; isOverLimit: boolean };
  efetivo: EfetivoData[];
  onSaveVolunteer: (volunteer: VolunteerEntry) => void;
  onRemoveVolunteer: (efetivoId: string) => void;
  existingVolunteers: string[];
}

export const DayDetailDrawer: React.FC<DayDetailDrawerProps> = ({
  open,
  onOpenChange,
  date,
  teams,
  counts,
  vacationQuota,
  efetivo,
  onSaveVolunteer,
  onRemoveVolunteer,
  existingVolunteers,
}) => {
  const [statusFilters, setStatusFilters] = useState<MemberStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [observacao, setObservacao] = useState('');

  const handleToggleFilter = (status: MemberStatus) => {
    setStatusFilters(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      }
      return [...prev, status];
    });
  };

  // Filter teams by search
  const filteredTeams = teams.map(team => ({
    ...team,
    membros: team.membros.filter(m => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.efetivo?.nome_guerra?.toLowerCase().includes(query) ||
        m.efetivo?.nome?.toLowerCase().includes(query) ||
        m.efetivo?.matricula?.toLowerCase().includes(query)
      );
    }),
  })).filter(team => team.membros.length > 0 || !searchQuery);

  if (!date) return null;

  const StatTile: React.FC<{ 
    label: string; 
    value: number; 
    status: MemberStatus; 
    icon: React.ReactNode;
  }> = ({ label, value, status, icon }) => {
    const colors = STATUS_COLORS[status];
    return (
      <div className={`
        flex items-center gap-2 p-3 rounded-xl border
        ${colors.bg} ${colors.border}
      `}>
        <span className={colors.text}>{icon}</span>
        <div>
          <p className={`text-lg font-bold ${colors.text}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          <SheetHeader className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl">
                {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-4">
              {/* Status tiles */}
              <div className="grid grid-cols-3 gap-2">
                <StatTile 
                  label="Aptos" 
                  value={counts.apto} 
                  status="apto" 
                  icon={<Users className="h-4 w-4" />} 
                />
                <StatTile 
                  label="Impedidos" 
                  value={counts.impedido} 
                  status="impedido" 
                  icon={<AlertTriangle className="h-4 w-4" />} 
                />
                <StatTile 
                  label="Restrição" 
                  value={counts.restricao} 
                  status="restricao" 
                  icon={<Activity className="h-4 w-4" />} 
                />
                <StatTile 
                  label="Atestado" 
                  value={counts.atestado} 
                  status="atestado" 
                  icon={<FileText className="h-4 w-4" />} 
                />
                <StatTile 
                  label="Voluntários" 
                  value={counts.voluntario} 
                  status="voluntario" 
                  icon={<Star className="h-4 w-4" />} 
                />
              </div>

              {/* Vacation quota compact */}
              <MonthlyVacationQuotaCard quota={vacationQuota} compact />

              {/* Observação do escalante */}
              <div className="bg-white rounded-xl border p-3">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Observação do escalante
                </label>
                <Input
                  placeholder="Adicione uma observação para este dia..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Add volunteer button */}
              <Button
                onClick={() => setShowVolunteerModal(true)}
                className="w-full"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Voluntário
              </Button>

              {/* Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, matrícula..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <StatusLegendChips 
                  activeFilters={statusFilters} 
                  onToggleFilter={handleToggleFilter} 
                />
              </div>

              {/* Teams */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Equipes previstas no dia
                </h3>
                {filteredTeams.map(team => (
                  <TeamCard
                    key={team.unidade}
                    team={team}
                    statusFilters={statusFilters}
                    onRemoveVolunteer={(efetivoId) => onRemoveVolunteer(efetivoId)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <VolunteerModal
        open={showVolunteerModal}
        onOpenChange={setShowVolunteerModal}
        efetivo={efetivo}
        onSave={onSaveVolunteer}
        existingVolunteers={existingVolunteers}
      />
    </>
  );
};
