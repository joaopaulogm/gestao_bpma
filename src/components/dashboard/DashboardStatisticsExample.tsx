/**
 * Exemplo de componente usando o novo sistema de estatísticas
 * Este componente demonstra como usar as views materializadas
 */

import React from 'react';
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';
import { useFilterState } from '@/hooks/useFilterState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardStatisticsExample: React.FC = () => {
  const { filters } = useFilterState(2025);
  const { data, isLoading, error } = useDashboardStatistics(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  const { statistics, topEspecies, distribuicaoClasse, timeSeries } = data;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Resgates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_resgates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.total_individuos_resgatados} indivíduos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Crimes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_crimes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.total_apreensoes} apreensões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Espécies Diferentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.especies_diferentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.classes_diferentes} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Atropelamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_atropelamentos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ocorrências registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Espécies Resgatadas */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Espécies Resgatadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topEspecies.slice(0, 10).map((especie, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <div className="font-medium">{especie.nome_popular}</div>
                  <div className="text-sm text-muted-foreground">
                    {especie.classe_taxonomica}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{especie.total_resgatado}</div>
                  <div className="text-xs text-muted-foreground">
                    {especie.total_ocorrencias} ocorrências
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Classe Taxonômica */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Classe Taxonômica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {distribuicaoClasse.map((classe, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="font-medium">{classe.classe_taxonomica}</div>
                <div className="text-right">
                  <div className="font-bold">{classe.total_individuos}</div>
                  <div className="text-xs text-muted-foreground">
                    {classe.total_registros} registros
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Série Temporal (exemplo simplificado) */}
      <Card>
        <CardHeader>
          <CardTitle>Série Temporal de Resgates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {timeSeries.length} pontos de dados disponíveis
          </div>
          <div className="mt-4 space-y-1 max-h-64 overflow-y-auto">
            {timeSeries.slice(0, 20).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.data} ({item.mes}/{item.ano})
                </span>
                <span className="font-medium">
                  {item.total_resgates} resgates ({item.total_individuos} indivíduos)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

