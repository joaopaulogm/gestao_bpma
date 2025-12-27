import React, { useState, useMemo } from 'react';
import { Palmtree, ArrowLeft, Search, Calendar, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Dados de férias baseados na aba "02 | FÉRIAS 2025 PRAÇAS" do Excel
const feriasData = [
  { matricula: '58.973-6', posto: '3º SGT QPPMC', nome: 'ADENALDO', mes1: 'MAIO', mes2: 'OUTUBRO', tipo: 'PRAÇA' },
  { matricula: '70.430-9', posto: 'SD QPPMC', nome: 'ADRIANO', mes1: 'JULHO', mes2: 'DEZEMBRO', tipo: 'PRAÇA' },
  { matricula: '225.506-3', posto: 'SD QPPMC', nome: 'ALEX', mes1: 'MARÇO', mes2: 'AGOSTO', tipo: 'PRAÇA' },
  { matricula: '70.694-8', posto: 'CB QPPMC', nome: 'ALVES RODRIGUES', mes1: 'JUNHO', mes2: 'NOVEMBRO', tipo: 'PRAÇA' },
  { matricula: '72.893-5', posto: 'SD QPPMC', nome: 'AMARAL', mes1: 'ABRIL', mes2: 'SETEMBRO', tipo: 'PRAÇA' },
  { matricula: '224.899-0', posto: 'SD QPPMC', nome: 'ANA CECÍLIA', mes1: 'JANEIRO', mes2: 'JUNHO', tipo: 'PRAÇA' },
  { matricula: '58.847-0', posto: '2º SGT QPPMC', nome: 'ANDERSON', mes1: 'FEVEREIRO', mes2: 'JULHO', tipo: 'PRAÇA' },
  { matricula: '72.817-X', posto: 'SD QPPMC', nome: 'ANDRÉ', mes1: 'MARÇO', mes2: 'AGOSTO', tipo: 'PRAÇA' },
  { matricula: '225.348-6', posto: 'SD QPPMC', nome: 'AQUILA', mes1: 'MAIO', mes2: 'OUTUBRO', tipo: 'PRAÇA' },
  { matricula: '223.556-7', posto: 'SD QPPMC', nome: 'ARANHA', mes1: 'ABRIL', mes2: 'SETEMBRO', tipo: 'PRAÇA' },
  { matricula: '73.003-4', posto: 'SD QPPMC', nome: 'BACELAR', mes1: 'JULHO', mes2: 'DEZEMBRO', tipo: 'PRAÇA' },
  { matricula: '224.958-X', posto: 'SD QPPMC', nome: 'BARROS', mes1: 'JUNHO', mes2: 'NOVEMBRO', tipo: 'PRAÇA' },
  { matricula: '58.847-0', posto: 'CB QPPMC', nome: 'BATISTA', mes1: 'JANEIRO', mes2: 'JUNHO', tipo: 'PRAÇA' },
  { matricula: '225.116-5', posto: 'SD QPPMC', nome: 'BRAGA', mes1: 'FEVEREIRO', mes2: 'JULHO', tipo: 'PRAÇA' },
  { matricula: '72.912-5', posto: 'SD QPPMC', nome: 'BRITO', mes1: 'AGOSTO', mes2: 'JANEIRO', tipo: 'PRAÇA' },
  { matricula: '225.268-4', posto: 'SD QPPMC', nome: 'BRUNO RAFAEL', mes1: 'SETEMBRO', mes2: 'FEVEREIRO', tipo: 'PRAÇA' },
  { matricula: '223.595-8', posto: 'SD QPPMC', nome: 'CAETANO', mes1: 'OUTUBRO', mes2: 'MARÇO', tipo: 'PRAÇA' },
  { matricula: '58.890-X', posto: '3º SGT QPPMC', nome: 'CARLOS HENRIQUE', mes1: 'NOVEMBRO', mes2: 'ABRIL', tipo: 'PRAÇA' },
  { matricula: '225.470-9', posto: 'SD QPPMC', nome: 'CASTRO', mes1: 'DEZEMBRO', mes2: 'MAIO', tipo: 'PRAÇA' },
  { matricula: '72.954-0', posto: 'CB QPPMC', nome: 'CERQUEIRA', mes1: 'JANEIRO', mes2: 'JUNHO', tipo: 'PRAÇA' },
];

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const mesColors: Record<string, string> = {
  'JANEIRO': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'FEVEREIRO': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'MARÇO': 'bg-green-500/20 text-green-400 border-green-500/30',
  'ABRIL': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'MAIO': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'JUNHO': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'JULHO': 'bg-red-500/20 text-red-400 border-red-500/30',
  'AGOSTO': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'SETEMBRO': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'OUTUBRO': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'NOVEMBRO': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'DEZEMBRO': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const Ferias: React.FC = () => {
  const [search, setSearch] = useState('');
  const [mesFiltro, setMesFiltro] = useState<string>('todos');

  const filteredData = useMemo(() => {
    return feriasData.filter(item => {
      const matchSearch = 
        item.nome.toLowerCase().includes(search.toLowerCase()) ||
        item.matricula.includes(search) ||
        item.posto.toLowerCase().includes(search.toLowerCase());
      
      const matchMes = mesFiltro === 'todos' || 
        item.mes1 === mesFiltro || 
        item.mes2 === mesFiltro;
      
      return matchSearch && matchMes;
    });
  }, [search, mesFiltro]);

  // Summary by month
  const summaryByMonth = useMemo(() => {
    const summary: Record<string, number> = {};
    MESES.forEach(m => { summary[m] = 0; });
    
    feriasData.forEach(item => {
      if (item.mes1) summary[item.mes1]++;
      if (item.mes2) summary[item.mes2]++;
    });
    
    return summary;
  }, []);

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
            <h1 className="text-2xl font-bold text-foreground">Férias 2025</h1>
            <p className="text-sm text-muted-foreground">Controle de férias do efetivo</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-6">
        {MESES.map((mes, idx) => (
          <Card 
            key={mes} 
            className={`cursor-pointer transition-all hover:scale-105 ${
              mesFiltro === mes ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setMesFiltro(mesFiltro === mes ? 'todos' : mes)}
          >
            <CardContent className="p-2 text-center">
              <p className="text-xs text-muted-foreground">{mes.slice(0, 3)}</p>
              <p className="text-lg font-bold">{summaryByMonth[mes]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, matrícula ou posto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={mesFiltro} onValueChange={setMesFiltro}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Meses</SelectItem>
                {MESES.map(mes => (
                  <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Programação de Férias</span>
            <Badge variant="outline">{filteredData.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-500px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Posto/Grad</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>1ª Parcela</TableHead>
                  <TableHead>2ª Parcela</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">{item.matricula}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.posto}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={mesColors[item.mes1] || ''}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.mes1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={mesColors[item.mes2] || ''}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.mes2}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ferias;
