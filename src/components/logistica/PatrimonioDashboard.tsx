import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Package, BarChart3, PieChart, MapPin } from 'lucide-react';
import type { EstatisticasFrota, EstatisticasTGRL } from '@/services/logisticaService';

interface PatrimonioDashboardProps {
  estatisticasFrota: EstatisticasFrota | null;
  estatisticasTGRL: EstatisticasTGRL | null;
}

const PatrimonioDashboard: React.FC<PatrimonioDashboardProps> = ({
  estatisticasFrota,
  estatisticasTGRL,
}) => {
  const [filtroLocalizacao, setFiltroLocalizacao] = useState<string>('all');
  const [filtroSegmento, setFiltroSegmento] = useState<'todos' | 'frota' | 'equipamentos'>('todos');

  const valorFrota = estatisticasFrota?.valorTotal ?? 0;
  const valorTGRL = estatisticasTGRL?.valorTotal ?? 0;
  const valorTotal = valorFrota + valorTGRL;

  const localizacoes = useMemo(() => {
    const set = new Set<string>();
    Object.keys(estatisticasFrota?.porLocalizacao ?? {}).forEach((key) => set.add(key));
    Object.keys(estatisticasTGRL?.porLocalizacao ?? {}).forEach((key) => set.add(key));
    return Array.from(set).filter(Boolean).sort();
  }, [estatisticasFrota?.porLocalizacao, estatisticasTGRL?.porLocalizacao]);

  const tiposFrota = useMemo(
    () => Object.entries(estatisticasFrota?.porTipo ?? {}).sort((a, b) => b[1] - a[1]),
    [estatisticasFrota?.porTipo]
  );
  const estadosTGRL = useMemo(
    () => Object.entries(estatisticasTGRL?.porEstado ?? {}).sort((a, b) => b[1] - a[1]),
    [estatisticasTGRL?.porEstado]
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={filtroSegmento} onValueChange={(v: any) => setFiltroSegmento(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo o patrimônio</SelectItem>
            <SelectItem value="frota">Só Frota</SelectItem>
            <SelectItem value="equipamentos">Só Equipamentos e Bens</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroLocalizacao} onValueChange={setFiltroLocalizacao}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Localização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as localizações</SelectItem>
            {localizacoes.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Patrimônio</CardTitle>
            <PieChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                filtroSegmento === 'equipamentos' ? valorTGRL : filtroSegmento === 'frota' ? valorFrota : valorTotal
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filtroSegmento === 'todos' && 'Frota + Equipamentos e Bens'}
              {filtroSegmento === 'frota' && 'Apenas veículos e viaturas'}
              {filtroSegmento === 'equipamentos' && 'Apenas equipamentos (TGRL)'}
            </p>
          </CardContent>
        </Card>

        {(filtroSegmento === 'todos' || filtroSegmento === 'frota') && (
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor da Frota</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFrota)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {estatisticasFrota?.total ?? 0} veículos
              </p>
            </CardContent>
          </Card>
        )}

        {(filtroSegmento === 'todos' || filtroSegmento === 'equipamentos') && (
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Equipamentos e Bens</CardTitle>
              <Package className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTGRL)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {estatisticasTGRL?.total ?? 0} itens
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumo por tipo / estado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Use os cards abaixo para segmentação visual.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segmentação: por tipo (frota) e por estado (TGRL) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(filtroSegmento === 'todos' || filtroSegmento === 'frota') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Frota por tipo de veículo
              </CardTitle>
              <CardDescription>Quantidade por tipo (segmentação)</CardDescription>
            </CardHeader>
            <CardContent>
              {tiposFrota.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum tipo cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {tiposFrota.map(([tipo, qtd]) => (
                    <div
                      key={tipo}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <span className="font-medium text-sm">{tipo}</span>
                      <span className="text-primary font-bold">{qtd} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(filtroSegmento === 'todos' || filtroSegmento === 'equipamentos') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Equipamentos por estado de conservação
              </CardTitle>
              <CardDescription>Quantidade por estado (segmentação)</CardDescription>
            </CardHeader>
            <CardContent>
              {estadosTGRL.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum estado cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {estadosTGRL.map(([estado, qtd]) => (
                    <div
                      key={estado}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <span className="font-medium text-sm">{estado}</span>
                      <span className="text-emerald-700 font-bold">{qtd} un.</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Localizações */}
      {(estatisticasFrota?.porLocalizacao && Object.keys(estatisticasFrota.porLocalizacao).length > 0) ||
       (estatisticasTGRL?.porLocalizacao && Object.keys(estatisticasTGRL.porLocalizacao).length > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Distribuição por localização
            </CardTitle>
            <CardDescription>Quantidade de itens por local (frota e equipamentos)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {localizacoes.map((loc) => {
                const qtdFrota = estatisticasFrota?.porLocalizacao?.[loc] ?? 0;
                const qtdTgrl = estatisticasTGRL?.porLocalizacao?.[loc] ?? 0;
                const total = qtdFrota + qtdTgrl;
                if (filtroLocalizacao !== 'all' && filtroLocalizacao !== loc) return null;
                return (
                  <div
                    key={loc}
                    className="p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <p className="font-medium text-sm truncate" title={loc}>{loc}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      {qtdFrota > 0 && <span>{qtdFrota} veíc.</span>}
                      {qtdTgrl > 0 && <span>{qtdTgrl} equip.</span>}
                    </div>
                    <p className="text-lg font-bold text-primary mt-1">{total} itens</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default PatrimonioDashboard;
