import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Filter, Eye, Edit, Trash2, 
  Bird, TreePine, AlertTriangle, Shield, Loader2,
  ChevronDown, FileText, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Dialog components removed - not needed
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;

// ==================== TIPOS ====================

interface RegistroFauna {
  id: string;
  data: string;
  especie_nome?: string;
  especie_cientifico?: string;
  classe?: string;
  quantidade?: number;
  regiao?: string;
  destinacao?: string;
  estado_saude?: string;
  atropelamento?: boolean;
}

interface RegistroCrimeAmbiental {
  id: string;
  data: string;
  tipo_crime?: string;
  enquadramento?: string;
  regiao?: string;
  ocorreu_apreensao?: boolean;
  procedimento?: string;
  desfecho?: string;
}

interface RegistroCrimeComum {
  id: string;
  data: string;
  natureza_crime?: string;
  tipo_penal?: string;
  regiao?: string;
  local_especifico?: string;
  vitimas?: number;
  suspeitos?: number;
  desfecho?: string;
}

interface RegistroPrevencao {
  id: string;
  data: string;
  tipo_atividade?: string;
  categoria?: string;
  regiao?: string;
  publico?: number;
  observacoes?: string;
}

// ==================== BOTÃO 3D ====================

interface Button3DProps {
  variant: 'view' | 'edit' | 'delete';
  onClick: () => void;
  disabled?: boolean;
}

const Button3D: React.FC<Button3DProps> = ({ variant, onClick, disabled }) => {
  const configs = {
    view: {
      icon: Eye,
      bg: 'bg-gradient-to-b from-blue-400 to-blue-600',
      shadow: 'shadow-[0_4px_0_0_#1e40af]',
      hover: 'hover:from-blue-500 hover:to-blue-700',
      active: 'active:translate-y-1 active:shadow-[0_0px_0_0_#1e40af]',
      label: 'Visualizar',
    },
    edit: {
      icon: Edit,
      bg: 'bg-gradient-to-b from-amber-400 to-amber-600',
      shadow: 'shadow-[0_4px_0_0_#b45309]',
      hover: 'hover:from-amber-500 hover:to-amber-700',
      active: 'active:translate-y-1 active:shadow-[0_0px_0_0_#b45309]',
      label: 'Editar',
    },
    delete: {
      icon: Trash2,
      bg: 'bg-gradient-to-b from-red-400 to-red-600',
      shadow: 'shadow-[0_4px_0_0_#b91c1c]',
      hover: 'hover:from-red-500 hover:to-red-700',
      active: 'active:translate-y-1 active:shadow-[0_0px_0_0_#b91c1c]',
      label: 'Excluir',
    },
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium',
        'transition-all duration-150 transform',
        config.bg,
        config.shadow,
        config.hover,
        config.active,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
};

// ==================== CARD DE REGISTRO ====================

interface RegistroCardProps {
  title: string;
  subtitle?: string;
  date: string;
  badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }>;
  fields: Array<{ label: string; value: string | number | undefined }>;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RegistroCard: React.FC<RegistroCardProps> = ({
  title,
  subtitle,
  date,
  badges = [],
  fields,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Conteúdo principal */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-muted-foreground italic truncate">{subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{date}</span>
              </div>
            </div>
            
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || 'secondary'} className="text-xs">
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
              {fields.slice(0, 6).map((field, index) => (
                <div key={index} className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">{field.label}</span>
                  <p className="font-medium truncate">{field.value || '-'}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex sm:flex-col gap-2">
            <Button3D variant="view" onClick={onView} />
            <Button3D variant="edit" onClick={onEdit} />
            <Button3D variant="delete" onClick={onDelete} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================

const RegistrosUnificados: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fauna');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('all');
  const [filterMes, setFilterMes] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de dados
  const [faunaRegistros, setFaunaRegistros] = useState<RegistroFauna[]>([]);
  const [crimesAmbientais, setCrimesAmbientais] = useState<RegistroCrimeAmbiental[]>([]);
  const [crimesComuns, setCrimesComuns] = useState<RegistroCrimeComum[]>([]);
  const [prevencaoRegistros, setPrevencaoRegistros] = useState<RegistroPrevencao[]>([]);
  
  // Estados de loading
  const [loadingFauna, setLoadingFauna] = useState(false);
  const [loadingCrimesAmbientais, setLoadingCrimesAmbientais] = useState(false);
  const [loadingCrimesComuns, setLoadingCrimesComuns] = useState(false);
  const [loadingPrevencao, setLoadingPrevencao] = useState(false);
  
  // Estados de delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Cache de dimensões
  const [dimensionCache, setDimensionCache] = useState<any>(null);

  // Anos disponíveis
  const anos = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  // Meses
  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Carregar cache de dimensões
  useEffect(() => {
    loadDimensionCache();
  }, []);

  // Carregar dados quando cache estiver pronto ou tab mudar
  useEffect(() => {
    if (dimensionCache) {
      loadDataForTab(activeTab);
    }
  }, [dimensionCache, activeTab, filterAno, filterMes]);

  const loadDimensionCache = async () => {
    try {
      const [
        regioesRes,
        especiesRes,
        destinacoesRes,
        estadosSaudeRes,
        tiposCrimeRes,
        tiposPenalRes,
        desfechosResgatesRes,
        desfechosCrimesComunsRes,
        tiposAtividadeRes,
      ] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome'),
        supabase.from('dim_especies_fauna').select('id, nome_popular, nome_cientifico, classe_taxonomica'),
        supabase.from('dim_destinacao').select('id, nome'),
        supabase.from('dim_estado_saude').select('id, nome'),
        supabaseAny.from('dim_tipo_de_crime').select('id_tipo_de_crime, "Tipo de Crime"'),
        supabase.from('dim_tipo_penal').select('id, nome'),
        supabase.from('dim_desfecho_resgates').select('id, nome'),
        supabase.from('dim_desfecho_crime_comum').select('id, nome'),
        supabase.from('dim_tipo_atividade_prevencao').select('id, nome, categoria'),
      ]);

      const tiposCrimeMap = new Map<string, string>();
      tiposCrimeRes.data?.forEach((t: any) => {
        tiposCrimeMap.set(t.id_tipo_de_crime, t['Tipo de Crime'] || '');
      });

      setDimensionCache({
        regioes: new Map(regioesRes.data?.map((r: any) => [r.id, r.nome]) || []) as Map<string, string>,
        especies: new Map(especiesRes.data?.map((e: any) => [e.id, { nome_popular: e.nome_popular || '', nome_cientifico: e.nome_cientifico || '', classe_taxonomica: e.classe_taxonomica || '' }]) || []) as Map<string, { nome_popular: string; nome_cientifico: string; classe_taxonomica: string }>,
        destinacoes: new Map(destinacoesRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        estadosSaude: new Map(estadosSaudeRes.data?.map((e: any) => [e.id, e.nome]) || []) as Map<string, string>,
        tiposCrime: tiposCrimeMap,
        tiposPenal: new Map(tiposPenalRes.data?.map((t: any) => [t.id, t.nome]) || []) as Map<string, string>,
        desfechosResgates: new Map(desfechosResgatesRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        desfechosCrimesComuns: new Map(desfechosCrimesComunsRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        tiposAtividade: new Map(tiposAtividadeRes.data?.map((t: any) => [t.id, { nome: t.nome || '', categoria: t.categoria || '' }]) || []) as Map<string, { nome: string; categoria: string }>,
      });
    } catch (error) {
      console.error('Erro ao carregar cache de dimensões:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  };

  const loadDataForTab = async (tab: string) => {
    switch (tab) {
      case 'fauna':
        if (faunaRegistros.length === 0) loadFaunaData();
        break;
      case 'crimes-ambientais':
        if (crimesAmbientais.length === 0) loadCrimesAmbientaisData();
        break;
      case 'crimes-comuns':
        if (crimesComuns.length === 0) loadCrimesComunsData();
        break;
      case 'prevencao':
        if (prevencaoRegistros.length === 0) loadPrevencaoData();
        break;
    }
  };

  const buildDateFilters = (query: any, dateField: string) => {
    if (filterAno !== 'all') {
      const startDate = `${filterAno}-01-01`;
      const endDate = `${filterAno}-12-31`;
      query = query.gte(dateField, startDate).lte(dateField, endDate);
    }
    return query;
  };

  const loadFaunaData = async () => {
    setLoadingFauna(true);
    try {
      let query = supabaseAny
        .from('fat_registros_de_resgate')
        .select('id, data, especie_id, quantidade, quantidade_total, regiao_administrativa_id, destinacao_id, estado_saude_id, atropelamento')
        .order('data', { ascending: false })
        .limit(200);

      query = buildDateFilters(query, 'data');
      const { data, error } = await query;

      if (error) throw error;

      const enriched: RegistroFauna[] = (data || []).map((r: any) => {
        const especie = dimensionCache?.especies.get(r.especie_id);
        return {
          id: r.id,
          data: r.data,
          especie_nome: especie?.nome_popular || 'Não identificado',
          especie_cientifico: especie?.nome_cientifico,
          classe: especie?.classe_taxonomica,
          quantidade: r.quantidade_total || r.quantidade,
          regiao: dimensionCache?.regioes.get(r.regiao_administrativa_id),
          destinacao: dimensionCache?.destinacoes.get(r.destinacao_id),
          estado_saude: dimensionCache?.estadosSaude.get(r.estado_saude_id),
          atropelamento: r.atropelamento,
        };
      });

      setFaunaRegistros(enriched);
    } catch (error) {
      console.error('Erro ao carregar fauna:', error);
      toast.error('Erro ao carregar registros de fauna');
    } finally {
      setLoadingFauna(false);
    }
  };

  const loadCrimesAmbientaisData = async () => {
    setLoadingCrimesAmbientais(true);
    try {
      let query = supabase
        .from('fat_registros_de_crime')
        .select('id, data, tipo_crime_id, enquadramento_id, regiao_administrativa_id, ocorreu_apreensao, procedimento_legal, desfecho_id')
        .order('data', { ascending: false })
        .limit(200);

      query = buildDateFilters(query, 'data');
      const { data, error } = await query;

      if (error) throw error;

      const enriched: RegistroCrimeAmbiental[] = (data || []).map((r: any) => ({
        id: r.id,
        data: r.data,
        tipo_crime: dimensionCache?.tiposCrime.get(r.tipo_crime_id),
        regiao: dimensionCache?.regioes.get(r.regiao_administrativa_id),
        ocorreu_apreensao: r.ocorreu_apreensao,
        procedimento: r.procedimento_legal,
        desfecho: dimensionCache?.desfechosResgates.get(r.desfecho_id),
      }));

      setCrimesAmbientais(enriched);
    } catch (error) {
      console.error('Erro ao carregar crimes ambientais:', error);
      toast.error('Erro ao carregar registros de crimes ambientais');
    } finally {
      setLoadingCrimesAmbientais(false);
    }
  };

  const loadCrimesComunsData = async () => {
    setLoadingCrimesComuns(true);
    try {
      let query = supabase
        .from('fat_crimes_comuns')
        .select('id, data, natureza_crime, tipo_penal_id, regiao_administrativa_id, local_especifico, vitimas_envolvidas, suspeitos_envolvidos, desfecho_id')
        .order('data', { ascending: false })
        .limit(200);

      query = buildDateFilters(query, 'data');
      const { data, error } = await query;

      if (error) throw error;

      const enriched: RegistroCrimeComum[] = (data || []).map((r: any) => ({
        id: r.id,
        data: r.data,
        natureza_crime: r.natureza_crime,
        tipo_penal: dimensionCache?.tiposPenal.get(r.tipo_penal_id),
        regiao: dimensionCache?.regioes.get(r.regiao_administrativa_id),
        local_especifico: r.local_especifico,
        vitimas: r.vitimas_envolvidas,
        suspeitos: r.suspeitos_envolvidos,
        desfecho: dimensionCache?.desfechosCrimesComuns.get(r.desfecho_id),
      }));

      setCrimesComuns(enriched);
    } catch (error) {
      console.error('Erro ao carregar crimes comuns:', error);
      toast.error('Erro ao carregar registros de crimes comuns');
    } finally {
      setLoadingCrimesComuns(false);
    }
  };

  const loadPrevencaoData = async () => {
    setLoadingPrevencao(true);
    try {
      let query = supabase
        .from('fat_atividades_prevencao')
        .select('id, data, tipo_atividade_id, regiao_administrativa_id, quantidade_publico, observacoes')
        .order('data', { ascending: false })
        .limit(200);

      query = buildDateFilters(query, 'data');
      const { data, error } = await query;

      if (error) throw error;

      const enriched: RegistroPrevencao[] = (data || []).map((r: any) => {
        const tipoAtividade = dimensionCache?.tiposAtividade.get(r.tipo_atividade_id);
        return {
          id: r.id,
          data: r.data,
          tipo_atividade: tipoAtividade?.nome,
          categoria: tipoAtividade?.categoria,
          regiao: dimensionCache?.regioes.get(r.regiao_administrativa_id),
          publico: r.quantidade_publico,
          observacoes: r.observacoes,
        };
      });

      setPrevencaoRegistros(enriched);
    } catch (error) {
      console.error('Erro ao carregar prevenção:', error);
      toast.error('Erro ao carregar registros de prevenção');
    } finally {
      setLoadingPrevencao(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const handleView = (type: string, id: string) => {
    navigate(`/registro-detalhes/${id}`);
  };

  const handleEdit = (type: string, id: string) => {
    switch (type) {
      case 'fauna':
        navigate(`/resgate-editar/${id}`);
        break;
      case 'crimes-ambientais':
        navigate(`/secao-operacional/crimes-ambientais?edit=${id}`);
        break;
      case 'crimes-comuns':
        navigate(`/secao-operacional/crimes-comuns?edit=${id}`);
        break;
      case 'prevencao':
        navigate(`/secao-operacional/atividades-prevencao?edit=${id}`);
        break;
    }
  };

  const handleDeleteClick = (type: string, id: string) => {
    setDeleteTarget({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      let table = '';
      switch (deleteTarget.type) {
        case 'fauna':
          table = 'fat_registros_de_resgate';
          break;
        case 'crimes-ambientais':
          table = 'fat_registros_de_crime';
          break;
        case 'crimes-comuns':
          table = 'fat_crimes_comuns';
          break;
        case 'prevencao':
          table = 'fat_atividades_prevencao';
          break;
      }

      const { error } = await supabaseAny.from(table).delete().eq('id', deleteTarget.id);
      
      if (error) throw error;
      
      toast.success('Registro excluído com sucesso');
      
      // Atualizar lista local
      switch (deleteTarget.type) {
        case 'fauna':
          setFaunaRegistros(prev => prev.filter(r => r.id !== deleteTarget.id));
          break;
        case 'crimes-ambientais':
          setCrimesAmbientais(prev => prev.filter(r => r.id !== deleteTarget.id));
          break;
        case 'crimes-comuns':
          setCrimesComuns(prev => prev.filter(r => r.id !== deleteTarget.id));
          break;
        case 'prevencao':
          setPrevencaoRegistros(prev => prev.filter(r => r.id !== deleteTarget.id));
          break;
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir registro');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const getFilteredData = (data: any[], searchFields: string[]) => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields.some(field => 
        String(item[field] || '').toLowerCase().includes(term)
      )
    );
  };

  const tabStats = useMemo(() => ({
    fauna: faunaRegistros.length,
    crimesAmbientais: crimesAmbientais.length,
    crimesComuns: crimesComuns.length,
    prevencao: prevencaoRegistros.length,
  }), [faunaRegistros, crimesAmbientais, crimesComuns, prevencaoRegistros]);

  return (
    <Layout title="Registros" showBackButton>
      <div className="space-y-6">
        {/* Header com filtros */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Central de Registros
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showFilters && 'rotate-180')} />
                </Button>
              </div>
            </div>
            
            {/* Filtros expandíveis */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Select value={filterAno} onValueChange={setFilterAno}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mês</label>
                  <Select value={filterMes} onValueChange={setFilterMes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os meses</SelectItem>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-auto p-1 gap-1">
            <TabsTrigger 
              value="fauna" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bird className="h-4 w-4" />
              <span className="hidden sm:inline">Resgate de Fauna</span>
              <span className="sm:hidden">Fauna</span>
              <Badge variant="secondary" className="ml-1 text-xs">{tabStats.fauna}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="crimes-ambientais" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Crimes Ambientais</span>
              <span className="sm:hidden">Ambientais</span>
              <Badge variant="secondary" className="ml-1 text-xs">{tabStats.crimesAmbientais}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="crimes-comuns" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Crimes Comuns</span>
              <span className="sm:hidden">Comuns</span>
              <Badge variant="secondary" className="ml-1 text-xs">{tabStats.crimesComuns}</Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="prevencao" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Prevenção</span>
              <span className="sm:hidden">Prevenção</span>
              <Badge variant="secondary" className="ml-1 text-xs">{tabStats.prevencao}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Tabs */}
          <TabsContent value="fauna" className="space-y-4">
            {loadingFauna ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3 pr-4">
                  {getFilteredData(faunaRegistros, ['especie_nome', 'especie_cientifico', 'regiao']).map(registro => (
                    <RegistroCard
                      key={registro.id}
                      title={registro.especie_nome || 'Espécie não identificada'}
                      subtitle={registro.especie_cientifico}
                      date={formatDate(registro.data)}
                      badges={[
                        ...(registro.classe ? [{ label: registro.classe }] : []),
                        ...(registro.atropelamento ? [{ label: 'Atropelamento', variant: 'destructive' as const }] : []),
                      ]}
                      fields={[
                        { label: 'Quantidade', value: registro.quantidade },
                        { label: 'Região', value: registro.regiao },
                        { label: 'Destinação', value: registro.destinacao },
                        { label: 'Estado de Saúde', value: registro.estado_saude },
                      ]}
                      onView={() => handleView('fauna', registro.id)}
                      onEdit={() => handleEdit('fauna', registro.id)}
                      onDelete={() => handleDeleteClick('fauna', registro.id)}
                    />
                  ))}
                  {faunaRegistros.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bird className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum registro de fauna encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="crimes-ambientais" className="space-y-4">
            {loadingCrimesAmbientais ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3 pr-4">
                  {getFilteredData(crimesAmbientais, ['tipo_crime', 'regiao']).map(registro => (
                    <RegistroCard
                      key={registro.id}
                      title={registro.tipo_crime || 'Crime Ambiental'}
                      date={formatDate(registro.data)}
                      badges={[
                        ...(registro.ocorreu_apreensao ? [{ label: 'Apreensão', variant: 'destructive' as const }] : []),
                        ...(registro.desfecho ? [{ label: registro.desfecho }] : []),
                      ]}
                      fields={[
                        { label: 'Região', value: registro.regiao },
                        { label: 'Procedimento', value: registro.procedimento },
                      ]}
                      onView={() => handleView('crimes-ambientais', registro.id)}
                      onEdit={() => handleEdit('crimes-ambientais', registro.id)}
                      onDelete={() => handleDeleteClick('crimes-ambientais', registro.id)}
                    />
                  ))}
                  {crimesAmbientais.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum registro de crime ambiental encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="crimes-comuns" className="space-y-4">
            {loadingCrimesComuns ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3 pr-4">
                  {getFilteredData(crimesComuns, ['natureza_crime', 'tipo_penal', 'regiao']).map(registro => (
                    <RegistroCard
                      key={registro.id}
                      title={registro.natureza_crime || registro.tipo_penal || 'Crime Comum'}
                      date={formatDate(registro.data)}
                      badges={[
                        ...(registro.desfecho ? [{ label: registro.desfecho }] : []),
                      ]}
                      fields={[
                        { label: 'Região', value: registro.regiao },
                        { label: 'Local', value: registro.local_especifico },
                        { label: 'Vítimas', value: registro.vitimas },
                        { label: 'Suspeitos', value: registro.suspeitos },
                      ]}
                      onView={() => handleView('crimes-comuns', registro.id)}
                      onEdit={() => handleEdit('crimes-comuns', registro.id)}
                      onDelete={() => handleDeleteClick('crimes-comuns', registro.id)}
                    />
                  ))}
                  {crimesComuns.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum registro de crime comum encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="prevencao" className="space-y-4">
            {loadingPrevencao ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3 pr-4">
                  {getFilteredData(prevencaoRegistros, ['tipo_atividade', 'categoria', 'regiao']).map(registro => (
                    <RegistroCard
                      key={registro.id}
                      title={registro.tipo_atividade || 'Atividade de Prevenção'}
                      date={formatDate(registro.data)}
                      badges={[
                        ...(registro.categoria ? [{ label: registro.categoria }] : []),
                      ]}
                      fields={[
                        { label: 'Região', value: registro.regiao },
                        { label: 'Público Atingido', value: registro.publico },
                        { label: 'Observações', value: registro.observacoes?.substring(0, 50) },
                      ]}
                      onView={() => handleView('prevencao', registro.id)}
                      onEdit={() => handleEdit('prevencao', registro.id)}
                      onDelete={() => handleDeleteClick('prevencao', registro.id)}
                    />
                  ))}
                  {prevencaoRegistros.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum registro de prevenção encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName="registro"
      />
    </Layout>
  );
};

export default RegistrosUnificados;
