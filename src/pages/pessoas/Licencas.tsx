import React, { useState, useMemo } from 'react';
import { FileCheck, ArrowLeft, Search, AlertTriangle, Activity, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Dados de Dispensa Médica baseados na aba "D. MÉDICA 2025"
const dispensaMedicaData = [
  { matricula: '58.973-6', posto: '3º SGT QPPMC', nome: 'ADENALDO', dataInicio: '15/01/2025', dataFim: '30/01/2025', dias: 15, motivo: 'Licença Médica' },
  { matricula: '70.430-9', posto: 'SD QPPMC', nome: 'ADRIANO', dataInicio: '05/02/2025', dataFim: '12/02/2025', dias: 7, motivo: 'Dispensa Médica' },
  { matricula: '225.506-3', posto: 'SD QPPMC', nome: 'ALEX', dataInicio: '20/03/2025', dataFim: '27/03/2025', dias: 7, motivo: 'Dispensa Médica' },
  { matricula: '72.893-5', posto: 'SD QPPMC', nome: 'AMARAL', dataInicio: '01/04/2025', dataFim: '15/04/2025', dias: 14, motivo: 'Licença Médica' },
  { matricula: '224.899-0', posto: 'SD QPPMC', nome: 'ANA CECÍLIA', dataInicio: '10/05/2025', dataFim: '17/05/2025', dias: 7, motivo: 'Dispensa Médica' },
  { matricula: '58.847-0', posto: '2º SGT QPPMC', nome: 'ANDERSON', dataInicio: '22/06/2025', dataFim: '07/07/2025', dias: 15, motivo: 'Licença Médica' },
  { matricula: '72.817-X', posto: 'SD QPPMC', nome: 'ANDRÉ', dataInicio: '14/07/2025', dataFim: '21/07/2025', dias: 7, motivo: 'Dispensa Médica' },
  { matricula: '225.348-6', posto: 'SD QPPMC', nome: 'AQUILA', dataInicio: '03/08/2025', dataFim: '10/08/2025', dias: 7, motivo: 'Dispensa Médica' },
];

// Dados de Restrição baseados na aba "06 | RESTRIÇÃO - 2025"
// Legenda: PO (Policiamento Ostensivo), PA (Porte de Arma), SN (Serviço Noturno), EF (Educação Física)
const restricaoData = [
  { matricula: '58.973-6', posto: '3º SGT QPPMC', nome: 'ADENALDO', restricoes: ['PO', 'PA'], dataInicio: '01/01/2025', dataFim: '30/06/2025', motivo: 'Restrição Médica' },
  { matricula: '70.694-8', posto: 'CB QPPMC', nome: 'ALVES RODRIGUES', restricoes: ['SN', 'EF'], dataInicio: '15/02/2025', dataFim: '15/08/2025', motivo: 'Restrição Médica' },
  { matricula: '72.893-5', posto: 'SD QPPMC', nome: 'AMARAL', restricoes: ['PO'], dataInicio: '01/03/2025', dataFim: '01/09/2025', motivo: 'Restrição Médica' },
  { matricula: '224.899-0', posto: 'SD QPPMC', nome: 'ANA CECÍLIA', restricoes: ['EF'], dataInicio: '01/04/2025', dataFim: '01/10/2025', motivo: 'Gestante' },
  { matricula: '225.116-5', posto: 'SD QPPMC', nome: 'BRAGA', restricoes: ['PA', 'SN'], dataInicio: '15/05/2025', dataFim: '15/11/2025', motivo: 'Restrição Médica' },
  { matricula: '72.912-5', posto: 'SD QPPMC', nome: 'BRITO', restricoes: ['PO', 'PA', 'SN'], dataInicio: '01/06/2025', dataFim: '31/12/2025', motivo: 'Restrição Médica' },
  { matricula: '58.890-X', posto: '3º SGT QPPMC', nome: 'CARLOS HENRIQUE', restricoes: ['EF'], dataInicio: '01/07/2025', dataFim: '31/12/2025', motivo: 'Restrição Médica' },
];

const restricaoLabels: Record<string, { label: string; color: string; description: string }> = {
  'PO': { label: 'PO', color: 'bg-red-500/20 text-red-400 border-red-500/30', description: 'Policiamento Ostensivo' },
  'PA': { label: 'PA', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Porte de Arma' },
  'SN': { label: 'SN', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', description: 'Serviço Noturno' },
  'EF': { label: 'EF', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', description: 'Educação Física' },
};

const Licencas: React.FC = () => {
  const [search, setSearch] = useState('');
  const [restricaoFiltro, setRestricaoFiltro] = useState<string>('todas');
  const [activeTab, setActiveTab] = useState('dispensa');

  const filteredDispensa = useMemo(() => {
    return dispensaMedicaData.filter(item => 
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.matricula.includes(search) ||
      item.posto.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredRestricao = useMemo(() => {
    return restricaoData.filter(item => {
      const matchSearch = 
        item.nome.toLowerCase().includes(search.toLowerCase()) ||
        item.matricula.includes(search) ||
        item.posto.toLowerCase().includes(search.toLowerCase());
      
      const matchRestricao = restricaoFiltro === 'todas' || 
        item.restricoes.includes(restricaoFiltro);
      
      return matchSearch && matchRestricao;
    });
  }, [search, restricaoFiltro]);

  // Summary counts
  const totalDispensas = dispensaMedicaData.length;
  const totalDiasDispensa = dispensaMedicaData.reduce((acc, item) => acc + item.dias, 0);
  const totalRestricoes = restricaoData.length;
  const restricoesAtivas = restricaoData.filter(r => {
    const hoje = new Date();
    const fim = new Date(r.dataFim.split('/').reverse().join('-'));
    return fim >= hoje;
  }).length;

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
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
            <FileCheck className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Licenças e Restrições 2025</h1>
            <p className="text-sm text-muted-foreground">Controle de dispensas médicas e restrições</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dispensas</p>
                <p className="text-2xl font-bold">{totalDispensas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dias</p>
                <p className="text-2xl font-bold">{totalDiasDispensa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restrições</p>
                <p className="text-2xl font-bold">{totalRestricoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold">{restricoesAtivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legenda de Restrições */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Legenda das Restrições</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <TooltipProvider>
            {Object.entries(restricaoLabels).map(([key, val]) => (
              <Tooltip key={key}>
                <TooltipTrigger>
                  <Badge variant="outline" className={`${val.color} cursor-help`}>
                    {val.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{val.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dispensa" className="gap-2">
            <Activity className="h-4 w-4" />
            Dispensas Médicas
          </TabsTrigger>
          <TabsTrigger value="restricao" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Restrições
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mb-4">
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
              {activeTab === 'restricao' && (
                <Select value={restricaoFiltro} onValueChange={setRestricaoFiltro}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo de Restrição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Restrições</SelectItem>
                    {Object.entries(restricaoLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        <TabsContent value="dispensa">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Dispensas Médicas</span>
                <Badge variant="outline">{filteredDispensa.length} registros</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-600px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Posto/Grad</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Dias</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDispensa.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">{item.matricula}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{item.posto}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.dataInicio}</TableCell>
                        <TableCell>{item.dataFim}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">{item.dias}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.motivo}</TableCell>
                      </TableRow>
                    ))}
                    {filteredDispensa.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restricao">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Restrições</span>
                <Badge variant="outline">{filteredRestricao.length} registros</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-600px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Posto/Grad</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Restrições</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestricao.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">{item.matricula}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{item.posto}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <TooltipProvider>
                              {item.restricoes.map(r => (
                                <Tooltip key={r}>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className={restricaoLabels[r]?.color || ''}>
                                      {r}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{restricaoLabels[r]?.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>{item.dataInicio}</TableCell>
                        <TableCell>{item.dataFim}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.motivo}</TableCell>
                      </TableRow>
                    ))}
                    {filteredRestricao.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Licencas;
