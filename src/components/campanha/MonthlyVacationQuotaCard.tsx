import React from 'react';
import { Calendar } from 'lucide-react';

interface VacationQuota {
  limit: number;
  marked: number;
  balance: number;
  isOverLimit: boolean;
}

interface MonthlyVacationQuotaCardProps {
  quota: VacationQuota;
  compact?: boolean;
}

export const MonthlyVacationQuotaCard: React.FC<MonthlyVacationQuotaCardProps> = ({
  quota,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>
          Cota: {quota.marked}/{quota.limit} dias
          {quota.isOverLimit ? (
            <span className="text-red-500 font-medium ml-1">
              (excedente: {Math.abs(quota.balance)})
            </span>
          ) : (
            <span className="text-blue-500 font-medium ml-1">
              (saldo: +{quota.balance})
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-blue-500" />
        </div>
        <h3 className="font-semibold text-sm">Cota de Férias</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Limite mensal</span>
          <span className="font-medium">{quota.limit} dias</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Marcados</span>
          <span className="font-medium">{quota.marked} dias</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {quota.isOverLimit ? 'Excedente' : 'Saldo'}
          </span>
          <span className={`font-semibold ${quota.isOverLimit ? 'text-red-500' : 'text-blue-500'}`}>
            {quota.isOverLimit ? '' : '+'}{quota.balance} dias
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              quota.isOverLimit ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((quota.marked / quota.limit) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
