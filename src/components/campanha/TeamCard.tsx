import React from 'react';
import { TeamForDay, MemberStatus, STATUS_COLORS } from '@/hooks/useCampanhaCalendar';
import { MemberStatusRow } from './MemberStatusRow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Shield, Target, Anchor, Plane, Navigation } from 'lucide-react';

const unitIcons: Record<string, React.ReactNode> = {
  'Guarda': <Shield className="h-4 w-4" />,
  'Armeiro': <Target className="h-4 w-4" />,
  'RP Ambiental': <Navigation className="h-4 w-4" />,
  'GOC': <Users className="h-4 w-4" />,
  'Lacustre': <Anchor className="h-4 w-4" />,
  'GTA': <Plane className="h-4 w-4" />,
};

const teamColors: Record<string, string> = {
  'Alfa': 'bg-red-100 text-red-700 border-red-200',
  'Bravo': 'bg-blue-100 text-blue-700 border-blue-200',
  'Charlie': 'bg-green-100 text-green-700 border-green-200',
  'Delta': 'bg-purple-100 text-purple-700 border-purple-200',
};

interface TeamCardProps {
  team: TeamForDay;
  statusFilters: MemberStatus[];
  onMemberClick?: (memberId: string) => void;
  onRemoveVolunteer?: (efetivoId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  statusFilters,
  onMemberClick,
  onRemoveVolunteer,
}) => {
  const filteredMembros = statusFilters.length === 0
    ? team.membros
    : team.membros.filter(m => statusFilters.includes(m.status));

  const StatusCounter: React.FC<{ status: MemberStatus; count: number }> = ({ status, count }) => {
    if (count === 0) return null;
    const colors = STATUS_COLORS[status];
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${colors.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {count}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {unitIcons[team.unidade]}
            </span>
            <h3 className="font-semibold text-sm">{team.unidade}</h3>
          </div>
          {team.equipe && (
            <Badge className={`${teamColors[team.equipe]} text-xs`}>
              Equipe {team.equipe}
            </Badge>
          )}
        </div>
        
        {/* Status counters */}
        <div className="flex flex-wrap gap-3">
          <StatusCounter status="apto" count={team.counts.apto} />
          <StatusCounter status="impedido" count={team.counts.impedido} />
          <StatusCounter status="restricao" count={team.counts.restricao} />
          <StatusCounter status="atestado" count={team.counts.atestado} />
          <StatusCounter status="voluntario" count={team.counts.voluntario} />
        </div>
      </div>

      {/* Members list */}
      <ScrollArea className="max-h-[300px]">
        <div className="p-3 space-y-2">
          {filteredMembros.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum membro {statusFilters.length > 0 ? 'com os filtros selecionados' : 'cadastrado'}
            </p>
          ) : (
            filteredMembros.map((member) => (
              <MemberStatusRow
                key={member.id}
                member={member}
                onClick={onMemberClick ? () => onMemberClick(member.id) : undefined}
                onRemoveVolunteer={
                  member.isVolunteer && onRemoveVolunteer 
                    ? () => onRemoveVolunteer(member.efetivo_id) 
                    : undefined
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
