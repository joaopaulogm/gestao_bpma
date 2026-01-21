import React from 'react';
import { Gift } from 'lucide-react';

interface AbonoQuota {
  limite: number;
  previsto: number;
  marcados: number;
  saldo: number;
  isOverLimit: boolean;
}

interface MonthlyAbonoQuotaCardProps {
  quota: AbonoQuota;
  mesNome: string;
  compact?: boolean;
}

export const MonthlyAbonoQuotaCard: React.FC<MonthlyAbonoQuotaCardProps> = ({
  quota,
  mesNome,
  compact = false,
}) => {
  const total = quota.previsto + quota.marcados;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Gift className="h-3 w-3" />
        <span>
          Cota: {quota.marcados}/{quota.limite} dias
          {quota.isOverLimit ? (
            <span className="text-red-500 font-medium ml-1">
              (excedente: {Math.abs(quota.saldo)})
            </span>
          ) : (
            <span className="text-green-500 font-medium ml-1">
              (saldo: {quota.saldo})
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <Gift className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="font-semibold text-sm">Cota de Abono - {mesNome}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Limite mensal</span>
          <span className="font-medium">{quota.limite} dias</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Previsão</span>
          <span className="font-medium text-amber-600">{quota.previsto} dias</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Marcados</span>
          <span className="font-medium text-primary">{quota.marcados} dias</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Saldo disponível</span>
          <span className={`font-semibold ${quota.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {quota.saldo} dias
          </span>
        </div>
      </div>

      {/* Progress bar with two segments */}
      <div className="mt-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          {/* Marked segment (primary) */}
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min((quota.marcados / quota.limite) * 100, 100)}%` }}
          />
          {/* Previsto segment (amber) */}
          <div 
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${Math.min((quota.previsto / quota.limite) * 100, 100 - (quota.marcados / quota.limite) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{total} / {quota.limite}</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Marcados
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Previsão
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
