import React from 'react';
import { MemberWithStatus, STATUS_COLORS, STATUS_LABELS } from '@/hooks/useCampanhaCalendar';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface MemberStatusRowProps {
  member: MemberWithStatus;
  onClick?: () => void;
  onRemoveVolunteer?: () => void;
}

export const MemberStatusRow: React.FC<MemberStatusRowProps> = ({
  member,
  onClick,
  onRemoveVolunteer,
}) => {
  const colors = STATUS_COLORS[member.status];
  const isImpedido = member.status === 'impedido';

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl border transition-all
        ${isImpedido ? 'bg-red-50 border-red-200' : 'bg-white border-border hover:border-primary/30'}
        ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}
      `}
      onClick={onClick}
    >
      {/* Status dot */}
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      
      {/* Member info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {member.efetivo?.posto_graduacao}
          </span>
          <span className="font-medium text-sm truncate">
            {member.efetivo?.nome_guerra}
          </span>
        </div>
        
        {/* Status reason */}
        {member.statusReason && member.status !== 'apto' && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${colors.text}`}>
              {member.statusReason}
            </span>
            {member.returnDate && (
              <span className="text-xs text-muted-foreground">
                Retorno: {member.returnDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {member.isVolunteer && (
          <>
            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">
              VOL
            </Badge>
            {onRemoveVolunteer && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveVolunteer();
                }}
                className="p-1 rounded-full hover:bg-red-100 text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        )}
        
        {isImpedido && (
          <Badge variant="outline" className="text-red-500 border-red-300 text-[10px]">
            NÃO escala
          </Badge>
        )}
        
        {member.status === 'restricao' && (
          <Badge variant="outline" className="text-orange-500 border-orange-300 text-[10px]">
            Restrição
          </Badge>
        )}
        
        {member.status === 'atestado' && (
          <Badge variant="outline" className="text-purple-500 border-purple-300 text-[10px]">
            Atestado
          </Badge>
        )}
      </div>
    </div>
  );
};
