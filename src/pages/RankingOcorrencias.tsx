import React, { useState, useEffect } from 'react';
import { Trophy, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RankingItem {
  id: string;
  nome: string;
  total: number;
}

const RankingOcorrencias: React.FC = () => {
  const [filterType, setFilterType] = useState<'grupamento' | 'policial' | 'equipe'>('policial');
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'mes' | 'ano' | 'total'>('mes');

  useEffect(() => {
    fetchRanking();
  }, [filterType, periodo]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      let startDate: string | null = null;
      const now = new Date();
      
      if (periodo === 'mes') {
        startDate = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
      } else if (periodo === 'ano') {
        startDate = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd');
      }

      if (filterType === 'policial') {
        // Count rescues per officer
        let query = supabase
          .from('fat_equipe_resgate')
          .select(`
            efetivo_id,
            dim_efetivo!inner(id, nome_guerra, posto_graduacao)
          `);

        const { data: resgateData, error: resgateError } = await query;
        if (resgateError) throw resgateError;

        // Count crimes per officer
        const { data: crimeData, error: crimeError } = await supabase
          .from('fat_equipe_crime')
          .select(`
            efetivo_id,
            dim_efetivo!inner(id, nome_guerra, posto_graduacao)
          `);
        if (crimeError) throw crimeError;

        // Combine and count
        const countMap = new Map<string, { nome: string; total: number }>();
        
        [...(resgateData || []), ...(crimeData || [])].forEach((item: any) => {
          const efetivo = item.dim_efetivo;
          const key = efetivo.id;
          const nome = `${efetivo.posto_graduacao} ${efetivo.nome_guerra}`;
          
          if (countMap.has(key)) {
            countMap.get(key)!.total += 1;
          } else {
            countMap.set(key, { nome, total: 1 });
          }
        });

        const rankingData = Array.from(countMap.entries())
          .map(([id, { nome, total }]) => ({ id, nome, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 20);

        setRanking(rankingData);
      } else if (filterType === 'grupamento') {
        // Count by lotação
        const { data: efetivoData, error } = await supabase
          .from('dim_efetivo')
          .select('lotacao');
        
        if (error) throw error;

        const countMap = new Map<string, number>();
        (efetivoData || []).forEach((item) => {
          const lotacao = item.lotacao || 'Sem lotação';
          countMap.set(lotacao, (countMap.get(lotacao) || 0) + 1);
        });

        // Get occurrences per grupamento
        const { data: resgateData } = await supabase
          .from('fat_equipe_resgate')
          .select(`efetivo_id, dim_efetivo!inner(lotacao)`);

        const { data: crimeData } = await supabase
          .from('fat_equipe_crime')
          .select(`efetivo_id, dim_efetivo!inner(lotacao)`);

        const ocorrenciaMap = new Map<string, number>();
        [...(resgateData || []), ...(crimeData || [])].forEach((item: any) => {
          const lotacao = item.dim_efetivo?.lotacao || 'Sem lotação';
          ocorrenciaMap.set(lotacao, (ocorrenciaMap.get(lotacao) || 0) + 1);
        });

        const rankingData = Array.from(ocorrenciaMap.entries())
          .map(([nome, total]) => ({ id: nome, nome, total }))
          .sort((a, b) => b.total - a.total);

        setRanking(rankingData);
      } else {
        // Equipe - count unique combinations of officers per occurrence
        const { data: resgateData } = await supabase
          .from('fat_equipe_resgate')
          .select('registro_id, efetivo_id, dim_efetivo!inner(nome_guerra, posto_graduacao)');

        const equipeMap = new Map<string, { nomes: string[]; total: number }>();
        const registroEquipe = new Map<string, string[]>();

        (resgateData || []).forEach((item: any) => {
          const registroId = item.registro_id;
          const nome = `${item.dim_efetivo.posto_graduacao} ${item.dim_efetivo.nome_guerra}`;
          
          if (!registroEquipe.has(registroId)) {
            registroEquipe.set(registroId, []);
          }
          registroEquipe.get(registroId)!.push(nome);
        });

        registroEquipe.forEach((nomes) => {
          const key = nomes.sort().join(' + ');
          if (equipeMap.has(key)) {
            equipeMap.get(key)!.total += 1;
          } else {
            equipeMap.set(key, { nomes, total: 1 });
          }
        });

        const rankingData = Array.from(equipeMap.entries())
          .map(([id, { nomes, total }]) => ({ id, nome: nomes.join(' + '), total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 20);

        setRanking(rankingData);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-accent';
      case 1: return 'text-muted-foreground';
      case 2: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-[75%] mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Ranking de Ocorrências</h1>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Agrupar por</label>
              <Select value={filterType} onValueChange={(v: 'grupamento' | 'policial' | 'equipe') => setFilterType(v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policial">Por Policial</SelectItem>
                  <SelectItem value="grupamento">Por Grupamento</SelectItem>
                  <SelectItem value="equipe">Por Equipe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Período</label>
              <Select value={periodo} onValueChange={(v: 'mes' | 'ano' | 'total') => setPeriodo(v)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="ano">Este Ano</SelectItem>
                  <SelectItem value="total">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>
            Ranking {filterType === 'policial' ? 'por Policial' : filterType === 'grupamento' ? 'por Grupamento' : 'por Equipe'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : ranking.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado encontrado para o período selecionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Posição</TableHead>
                  <TableHead>{filterType === 'policial' ? 'Policial' : filterType === 'grupamento' ? 'Grupamento' : 'Equipe'}</TableHead>
                  <TableHead className="text-right">Ocorrências</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <Trophy className={`h-5 w-5 ${getMedalColor(index)}`} />
                        ) : (
                          <span className="text-muted-foreground w-5 text-center">{index + 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-right font-bold">{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingOcorrencias;
