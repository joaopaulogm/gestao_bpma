import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileCheck, ArrowLeft, Search, AlertTriangle, Activity, Filter, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LicencaMedica {
  id: string;
  efetivo_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string | null;
  dias: number | null;
  tipo: string;
  cid: string | null;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

interface Restricao {
  id: string;
  efetivo_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string | null;
  tipo_restricao: string;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

const restricaoLabels: Record<string, { label: string; color: string; description: string }> = {
  'PO': { label: 'PO', color: 'bg-red-500/20 text-red-400 border-red-500/30', description: 'Policiamento Ostensivo' },
  'PA': { label: 'PA', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Porte de Arma' },
  'SN': { label: 'SN', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', description: 'Serviço Noturno' },
  'EF': { label: 'EF', color: 'bg-primary/20 text-primary/80 border-primary/30', description: 'Educação Física' },
};

const Licencas: React.FC = () => {
  const [search, setSearch] = useState('');
  const [restricaoFiltro, setRestricaoFiltro] = useState<string>('todas');
  const [activeTab, setActiveTab] = useState('dispensa');
  const [licencas, setLicencas] = useState<LicencaMedica[]>([]);
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano] = useState(2025);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch licenças médicas
      const { data: licencasData, error: licencasError } = await supabase
        .from('fat_licencas_medicas')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)
        `)
        .eq('ano', ano)
        .order('data_inicio', { ascending: false });

      if (licencasError) throw licencasError;
      setLicencas(licencasData || []);

      // Fetch restrições
      const { data: restricoesData, error: restricoesError } = await supabase
        .from('fat_restricoes')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)
        `)
        .eq('ano', ano)
        .order('data_inicio', { ascending: false });

      if (restricoesError) throw restricoesError;
      setRestricoes(restricoesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('licencas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_licencas_medicas' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_restricoes' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const filteredDispensa = useMemo(() => {
    return licencas.filter(item => 
      item.efetivo?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
      item.efetivo?.matricula?.includes(search) ||
      item.efetivo?.posto_graduacao?.toLowerCase().includes(search.toLowerCase())
    );
  }, [licencas, search]);

  const filteredRestricao = useMemo(() => {
    return restricoes.filter(item => {
      const matchSearch = 
        item.efetivo?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
        item.efetivo?.matricula?.includes(search) ||
        item.efetivo?.posto_graduacao?.toLowerCase().includes(search.toLowerCase());
      
      const matchRestricao = restricaoFiltro === 'todas' || 
        item.tipo_restricao === restricaoFiltro;
      
      return matchSearch && matchRestricao;
    });
  }, [restricoes, search, restricaoFiltro]);

  // Summary counts
  const totalDispensas = licencas.length;
  const totalDiasDispensa = licencas.reduce((acc, item) => acc + (item.dias || 0), 0);
  const totalRestricoes = restricoes.length;
  const restricoesAtivas = restricoes.filter(r => {
    if (!r.data_fim) return true;
    const hoje = new Date();
    const fim = new Date(r.data_fim);
    return fim >= hoje;
  }).length;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollArea className="h-screen">
    <div className="container mx-auto p-4 md:p-6 max-w-7xl pb-20">
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
            <h1 className="text-2xl font-bold text-foreground">Licenças e Restrições {ano}</h1>
            <p className="text-sm text-muted-foreground">Controle de dispensas médicas e restrições</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dispensas</p>
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
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Restrições</p>
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
                <p className="text-sm text-muted-foreground">Restrições Ativas</p>
                <p className="text-2xl font-bold">{restricoesAtivas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="dispensa" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dispensas Médicas
          </TabsTrigger>
          <TabsTrigger value="restricao" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Restrições
          </TabsTrigger>
        </TabsList>

        {/* Search */}
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
              {activeTab === 'restricao' && (
                <Select value={restricaoFiltro} onValueChange={setRestricaoFiltro}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo de restrição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {Object.entries(restricaoLabels).map(([key, { description }]) => (
                      <SelectItem key={key} value={key}>{description}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        <TabsContent value="dispensa">
          <Card>
            <CardHeader>
              <CardTitle>Dispensas Médicas ({filteredDispensa.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : licencas.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma dispensa médica cadastrada para {ano}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDispensa.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.efetivo?.matricula}</TableCell>
                          <TableCell>{item.efetivo?.posto_graduacao}</TableCell>
                          <TableCell className="font-medium">{item.efetivo?.nome_guerra}</TableCell>
                          <TableCell>{formatDate(item.data_inicio)}</TableCell>
                          <TableCell>{item.data_fim ? formatDate(item.data_fim) : '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.dias || '-'} dias</Badge>
                          </TableCell>
                          <TableCell>{item.tipo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restricao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Restrições ({filteredRestricao.length})</span>
                <TooltipProvider>
                  <div className="flex gap-2">
                    {Object.entries(restricaoLabels).map(([key, { label, color, description }]) => (
                      <Tooltip key={key}>
                        <TooltipTrigger>
                          <Badge className={color}>{label}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>{description}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : restricoes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma restrição cadastrada para {ano}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Restrição</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Observação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRestricao.map((item) => {
                        const restricaoInfo = restricaoLabels[item.tipo_restricao];
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-sm">{item.efetivo?.matricula}</TableCell>
                            <TableCell>{item.efetivo?.posto_graduacao}</TableCell>
                            <TableCell className="font-medium">{item.efetivo?.nome_guerra}</TableCell>
                            <TableCell>
                              <Badge className={restricaoInfo?.color || ''}>
                                {restricaoInfo?.label || item.tipo_restricao}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(item.data_inicio)}</TableCell>
                            <TableCell>{item.data_fim ? formatDate(item.data_fim) : '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.observacao || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ScrollArea>
  );
};

export default Licencas;
