import React from 'react';
import { MemberStatus, STATUS_COLORS, STATUS_LABELS } from '@/hooks/useCampanhaCalendar';

interface StatusLegendChipsProps {
  activeFilters: MemberStatus[];
  onToggleFilter: (status: MemberStatus) => void;
}

const STATUS_ORDER: MemberStatus[] = ['apto', 'impedido', 'restricao', 'atestado', 'voluntario'];

export const StatusLegendChips: React.FC<StatusLegendChipsProps> = ({
  activeFilters,
  onToggleFilter,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_ORDER.map((status) => {
        const isActive = activeFilters.length === 0 || activeFilters.includes(status);
        const colors = STATUS_COLORS[status];
        
        return (
          <button
            key={status}
            onClick={() => onToggleFilter(status)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 border
              ${isActive 
                ? `${colors.bg} ${colors.border} ${colors.text}` 
                : 'bg-muted/50 border-border text-muted-foreground opacity-50'
              }
            `}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? colors.dot : 'bg-muted-foreground'}`} />
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
};
