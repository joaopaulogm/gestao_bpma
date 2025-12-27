import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Palmtree, ArrowLeft, Search, Calendar, Filter, Loader2, Plus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeriasData {
  id: string;
  efetivo_id: string;
  ano: number;
  mes_inicio: number;
  mes_fim: number | null;
  dias: number;
  tipo: string;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const mesColors: Record<number, string> = {
  1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  2: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  3: 'bg-green-500/20 text-green-400 border-green-500/30',
  4: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  5: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  6: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  7: 'bg-red-500/20 text-red-400 border-red-500/30',
  8: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  9: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  10: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  11: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  12: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const Ferias: React.FC = () => {
  const [search, setSearch] = useState('');
  const [mesFiltro, setMesFiltro] = useState<string>('todos');
  const [ferias, setFerias] = useState<FeriasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano] = useState(2025);

  const fetchFerias = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_ferias')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)
        `)
        .eq('ano', ano)
        .order('mes_inicio');

      if (error) throw error;
      setFerias(data || []);
    } catch (error) {
      console.error('Erro ao carregar férias:', error);
      toast.error('Erro ao carregar férias');
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    fetchFerias();
  }, [fetchFerias]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('ferias-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias' }, () => fetchFerias())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFerias]);

  const filteredData = useMemo(() => {
    return ferias.filter(item => {
      const matchSearch = 
        item.efetivo?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
        item.efetivo?.matricula?.includes(search) ||
        item.efetivo?.posto_graduacao?.toLowerCase().includes(search.toLowerCase());
      
      const mesFiltroNum = mesFiltro === 'todos' ? null : parseInt(mesFiltro);
      const matchMes = mesFiltroNum === null || 
        item.mes_inicio === mesFiltroNum || 
        item.mes_fim === mesFiltroNum;
      
      return matchSearch && matchMes;
    });
  }, [ferias, search, mesFiltro]);

  // Summary by month
  const summaryByMonth = useMemo(() => {
    const summary: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) { summary[i] = 0; }
    
    ferias.forEach(item => {
      if (item.mes_inicio) summary[item.mes_inicio]++;
      if (item.mes_fim && item.mes_fim !== item.mes_inicio) summary[item.mes_fim]++;
    });
    
    return summary;
  }, [ferias]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/secao-pessoas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
            <Palmtree className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Férias {ano}</h1>
            <p className="text-sm text-muted-foreground">Programação de férias do efetivo</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {MESES.map((mes, idx) => (
          <Card 
            key={mes} 
            className={`cursor-pointer transition-all hover:scale-105 ${mesFiltro === String(idx + 1) ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setMesFiltro(mesFiltro === String(idx + 1) ? 'todos' : String(idx + 1))}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{mes.slice(0, 3)}</p>
              <p className="text-xl font-bold">{summaryByMonth[idx + 1] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, matrícula ou posto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={mesFiltro} onValueChange={setMesFiltro}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os meses</SelectItem>
                {MESES.map((mes, idx) => (
                  <SelectItem key={mes} value={String(idx + 1)}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programação de Férias ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ferias.length === 0 ? (
            <div className="text-center py-12">
              <Palmtree className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma férias cadastrada para {ano}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Importe dados do Excel ou cadastre manualmente
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Posto/Grad</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>1º Período</TableHead>
                    <TableHead>2º Período</TableHead>
                    <TableHead>Dias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.efetivo?.matricula}</TableCell>
                      <TableCell>{item.efetivo?.posto_graduacao}</TableCell>
                      <TableCell className="font-medium">{item.efetivo?.nome_guerra}</TableCell>
                      <TableCell>
                        <Badge className={mesColors[item.mes_inicio] || ''}>
                          {MESES[item.mes_inicio - 1]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.mes_fim && (
                          <Badge className={mesColors[item.mes_fim] || ''}>
                            {MESES[item.mes_fim - 1]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.dias}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Ferias;
