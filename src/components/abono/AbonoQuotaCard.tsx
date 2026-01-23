import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarCheck, CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react';

export interface AbonoQuota {
  mes: string;
  mesNum: number;
  limite: number;
  previsto: number;
  marcados: number;
  saldo: number;
}

interface AbonoQuotaCardProps {
  quotas: AbonoQuota[];
  compact?: boolean;
}

export const AbonoQuotaCard: React.FC<AbonoQuotaCardProps> = ({ quotas, compact = false }) => {
  const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  if (compact) {
    // Versão compacta para a página Campanha
    return (
      <Card className="border-primary/20">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Cota Mensal de Abono
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-6 gap-1 text-xs">
            {quotas.slice(0, 6).map((q) => (
              <div 
                key={q.mesNum} 
                className={`text-center p-1.5 rounded ${
                  q.saldo < 0 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-muted/50'
                }`}
              >
                <p className="font-medium text-muted-foreground">{mesesNome[q.mesNum - 1]}</p>
                <p className={`font-bold ${q.saldo < 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {q.saldo}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1 text-xs mt-1">
            {quotas.slice(6, 12).map((q) => (
              <div 
                key={q.mesNum} 
                className={`text-center p-1.5 rounded ${
                  q.saldo < 0 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-muted/50'
                }`}
              >
                <p className="font-medium text-muted-foreground">{mesesNome[q.mesNum - 1]}</p>
                <p className={`font-bold ${q.saldo < 0 ? 'text-red-500' : 'text-foreground'}`}>
                  {q.saldo}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Saldo = Limite ({quotas[0]?.limite || 80}) - Marcados
          </p>
        </CardContent>
      </Card>
    );
  }

  // Versão completa para a página Abono
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          Cota Mensal de Abono
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Mês</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Limite
                  </div>
                </th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Previsão
                  </div>
                </th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Marcados
                  </div>
                </th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => (
                <tr 
                  key={q.mesNum} 
                  className={`border-b last:border-0 ${
                    q.saldo < 0 ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium">{q.mes}</td>
                  <td className="text-center py-2 px-2">
                    <Badge variant="outline" className="bg-muted/50">
                      {q.limite}
                    </Badge>
                  </td>
                  <td className="text-center py-2 px-2">
                    <Badge variant="secondary">
                      {q.previsto}
                    </Badge>
                  </td>
                  <td className="text-center py-2 px-2">
                    <Badge className="bg-primary/80">
                      {q.marcados}
                    </Badge>
                  </td>
                  <td className="text-center py-2 px-2">
                    {q.saldo < 0 ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {q.saldo}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        {q.saldo}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Limite Mensal: máximo de dias de abono permitidos por mês (1/11 do efetivo × 5 dias)
        </p>
      </CardContent>
    </Card>
  );
};
