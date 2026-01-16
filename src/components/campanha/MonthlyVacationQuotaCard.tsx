import React from 'react';
import { Calendar } from 'lucide-react';

interface VacationQuota {
  limit: number;
  previsto: number;
  marked: number;
  saldoBruto: number;
  saldoReal: number;
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
  const total = quota.previsto + quota.marked;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>
          Cota: {total}/{quota.limit} dias
          {quota.isOverLimit ? (
            <span className="text-red-500 font-medium ml-1">
              (excedente: +{quota.saldoReal})
            </span>
          ) : (
            <span className="text-blue-500 font-medium ml-1">
              (saldo: {quota.saldoBruto})
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
          <span className="text-muted-foreground">Previsto</span>
          <span className="font-medium text-amber-600">{quota.previsto} dias</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Marcados</span>
          <span className="font-medium text-red-600">{quota.marked} dias</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Saldo Bruto</span>
          <span className={`font-semibold ${quota.saldoBruto >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {quota.saldoBruto >= 0 ? '+' : ''}{quota.saldoBruto} dias
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Saldo Real</span>
          <span className={`font-semibold ${quota.saldoReal <= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {quota.saldoReal > 0 ? '+' : ''}{quota.saldoReal} dias
          </span>
        </div>
      </div>

      {/* Progress bar with two segments */}
      <div className="mt-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          {/* Marked segment (red) */}
          <div 
            className="h-full bg-red-500 transition-all"
            style={{ width: `${Math.min((quota.marked / quota.limit) * 100, 100)}%` }}
          />
          {/* Previsto segment (amber) */}
          <div 
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${Math.min((quota.previsto / quota.limit) * 100, 100 - (quota.marked / quota.limit) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{total} / {quota.limit}</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Marcados
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Previsto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
