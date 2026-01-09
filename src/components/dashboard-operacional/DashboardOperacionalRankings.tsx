import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, TrendingUp } from 'lucide-react';
import { EspecieRanking } from './DashboardOperacionalContent';

interface DashboardOperacionalRankingsProps {
  especiesRanking: EspecieRanking[];
  year: number;
  isHistorico: boolean;
}

const DashboardOperacionalRankings: React.FC<DashboardOperacionalRankingsProps> = ({
  especiesRanking,
  year,
  isHistorico
}) => {
  if (especiesRanking.length === 0) {
    return null;
  }

  const maxValue = especiesRanking[0]?.quantidade || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ranking de Espécies */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Top Espécies Resgatadas - {year}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {especiesRanking.map((especie, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6 text-right">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate pr-2">
                        {especie.nome}
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {especie.quantidade.toLocaleString('pt-BR')}
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(especie.quantidade / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Informações adicionais ou placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Resumo do Período
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total de Espécies</p>
              <p className="text-2xl font-bold">{especiesRanking.length}</p>
            </div>
            
            {especiesRanking.length > 0 && (
              <>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Espécie Mais Resgatada</p>
                  <p className="text-lg font-semibold text-primary">
                    {especiesRanking[0].nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {especiesRanking[0].quantidade.toLocaleString('pt-BR')} resgates
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Concentração Top 5
                  </p>
                  <p className="text-lg font-semibold">
                    {(
                      (especiesRanking.slice(0, 5).reduce((s, e) => s + e.quantidade, 0) /
                        especiesRanking.reduce((s, e) => s + e.quantidade, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    do total de resgates
                  </p>
                </div>
              </>
            )}

            {isHistorico && (
              <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Dados históricos sem georreferenciamento.
                  Rankings de região não disponíveis.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOperacionalRankings;
