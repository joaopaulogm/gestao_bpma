import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit2, AlertCircle, Clock, UserX, Stethoscope, UserPlus } from 'lucide-react';
import { MemberStatus, STATUS_COLORS, STATUS_LABELS, MemberWithStatus } from '@/hooks/useCampanhaCalendar';

interface TeamMemberCardProps {
  member: MemberWithStatus;
  showEditButton?: boolean;
  onEdit?: (member: MemberWithStatus) => void;
  compact?: boolean;
}

const statusIcons: Record<MemberStatus, React.ReactNode> = {
  apto: null,
  impedido: <AlertCircle className="h-3.5 w-3.5" />,
  restricao: <UserX className="h-3.5 w-3.5" />,
  atestado: <Stethoscope className="h-3.5 w-3.5" />,
  voluntario: <UserPlus className="h-3.5 w-3.5" />,
  previsao: <Clock className="h-3.5 w-3.5" />,
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  showEditButton = false,
  onEdit,
  compact = false,
}) => {
  const { efetivo, status, statusReason, returnDate, isVolunteer } = member;
  const colors = STATUS_COLORS[status];
  const initials = (efetivo?.nome_guerra || efetivo?.nome || '??')
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const isImpedido = status === 'impedido' || status === 'atestado' || status === 'restricao';

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-1.5 rounded-lg ${colors.bg} border ${colors.border} ${isImpedido ? 'opacity-70' : ''}`}
      >
        <span className={`${colors.text}`}>{statusIcons[status]}</span>
        <span className={`text-xs truncate ${isImpedido ? 'line-through' : ''}`}>
          {efetivo?.posto_graduacao} {efetivo?.nome_guerra || efetivo?.nome}
        </span>
        {isVolunteer && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700 border-blue-300">
            VOL
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border} transition-all hover:shadow-sm ${isImpedido ? 'opacity-80' : ''}`}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback className={`${colors.text} bg-white/80 text-xs font-medium`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className={`flex items-center gap-1.5 ${isImpedido ? 'line-through' : ''}`}>
          <span className="text-xs text-muted-foreground">{efetivo?.posto_graduacao}</span>
          <span className="font-medium text-sm truncate">
            {efetivo?.nome_guerra || efetivo?.nome}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors.text} ${colors.border}`}>
            {statusIcons[status]}
            <span className="ml-1">{STATUS_LABELS[status]}</span>
          </Badge>
          {statusReason && status !== 'apto' && (
            <span className="text-[10px] text-muted-foreground truncate">
              {statusReason}
            </span>
          )}
          {isVolunteer && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700 border-blue-300">
              Voluntário
            </Badge>
          )}
        </div>
      </div>

      {showEditButton && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onEdit(member)}
          aria-label="Editar membro"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
