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
  ChevronDown, FileText, Calendar, MoreHorizontal,
  Check, X as XIcon
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

interface RegistroBemApreendido {
  id: string;
  data: string;
  item?: string;
  bem_apreendido?: string;
  tipo_crime?: string;
  quantidade?: number;
  ocorrencia_id?: string;
}

// ==================== BOTÃO 3D ====================

interface Button3DProps {
  variant: 'view' | 'edit' | 'delete';
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const Button3D: React.FC<Button3DProps> = ({ variant, onClick, disabled, size = 'md' }) => {
  const configs = {
    view: {
      icon: Eye,
      bg: 'bg-gradient-to-b from-blue-400 to-blue-600',
      shadow: 'shadow-[0_4px_0_0_#1e40af]',
      hover: 'hover:from-blue-500 hover:to-blue-700',
      active: 'active:translate-y-1 active:shadow-[0_0px_0_0_#1e40af]',
      label: 'Ver',
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
  const sizeClasses = size === 'sm' ? 'px-2 py-1.5 text-xs gap-1' : 'px-3 py-2 text-sm gap-1.5';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center rounded-lg text-white font-medium',
        'transition-all duration-150 transform',
        sizeClasses,
        config.bg,
        config.shadow,
        config.hover,
        config.active,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
};

// ==================== STATUS BADGE ====================

const StatusBadge: React.FC<{ status: string; variant?: 'success' | 'warning' | 'error' | 'default' }> = ({ 
  status, 
  variant = 'default' 
}) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[variant]
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'success' && 'bg-emerald-500',
        variant === 'warning' && 'bg-amber-500',
        variant === 'error' && 'bg-red-500',
        variant === 'default' && 'bg-slate-500',
      )} />
      {status}
    </span>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================

const RegistrosUnificados: React.FC = () => {
  console.log('🚀 [RegistrosUnificados] Componente renderizado');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fauna');
  const [searchTerm, setSearchTerm] = useState('');
  // Ano selecionado via abas (2026, 2025, etc.)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterMes, setFilterMes] = useState('all');
  const [filterDia, setFilterDia] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Estados de dados
  const [faunaRegistros, setFaunaRegistros] = useState<RegistroFauna[]>([]);
  const [crimesAmbientais, setCrimesAmbientais] = useState<RegistroCrimeAmbiental[]>([]);
  const [crimesComuns, setCrimesComuns] = useState<RegistroCrimeComum[]>([]);
  const [prevencaoRegistros, setPrevencaoRegistros] = useState<RegistroPrevencao[]>([]);
  const [bensApreendidos, setBensApreendidos] = useState<RegistroBemApreendido[]>([]);
  
  // Estados de loading
  const [loadingFauna, setLoadingFauna] = useState(false);
  const [loadingCrimesAmbientais, setLoadingCrimesAmbientais] = useState(false);
  const [loadingCrimesComuns, setLoadingCrimesComuns] = useState(false);
  const [loadingPrevencao, setLoadingPrevencao] = useState(false);
  const [loadingBensApreendidos, setLoadingBensApreendidos] = useState(false);
  
  // Estados de delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Cache de dimensões
  const [dimensionCache, setDimensionCache] = useState<any>(null);

  // Anos disponíveis para as abas
  const anosDisponiveis = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

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
  
  // Dias do mês selecionado
  const diasDoMes = useMemo(() => {
    if (filterMes === 'all') return [];
    const mes = parseInt(filterMes);
    const ultimoDia = new Date(selectedYear, mes, 0).getDate();
    return Array.from({ length: ultimoDia }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1).padStart(2, '0')
    }));
  }, [filterMes, selectedYear]);

  // Limpar seleção ao trocar de aba
  useEffect(() => {
    setSelectedItems(new Set());
  }, [activeTab]);

  // Carregar cache de dimensões
  useEffect(() => {
    console.log('🔄 [RegistrosUnificados] useEffect: Carregando cache de dimensões...');
    loadDimensionCache();
  }, []);

  // Carregar dados quando cache estiver pronto ou tab mudar
  useEffect(() => {
    if (dimensionCache) {
      // Carregar todos os dados de uma vez para contadores nas abas
      console.log('📊 Cache de dimensões carregado, iniciando carregamento de dados...');
      loadAllData();
    }
  }, [dimensionCache]);
  
  // Recarregar dados quando a aba mudar
  useEffect(() => {
    if (dimensionCache) {
      console.log(`🔄 Aba mudou para: ${activeTab}, recarregando dados...`);
      loadDataForTab(activeTab);
    }
  }, [activeTab]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (dimensionCache) {
      loadDataForTab(activeTab);
    }
  }, [selectedYear, filterMes, filterDia]);

  const loadDimensionCache = async () => {
    console.log('📦 [DimensionCache] Iniciando carregamento de cache de dimensões...');
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

      const cache = {
        regioes: new Map(regioesRes.data?.map((r: any) => [r.id, r.nome]) || []) as Map<string, string>,
        especies: new Map(especiesRes.data?.map((e: any) => [e.id, { nome_popular: e.nome_popular || '', nome_cientifico: e.nome_cientifico || '', classe_taxonomica: e.classe_taxonomica || '' }]) || []) as Map<string, { nome_popular: string; nome_cientifico: string; classe_taxonomica: string }>,
        destinacoes: new Map(destinacoesRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        estadosSaude: new Map(estadosSaudeRes.data?.map((e: any) => [e.id, e.nome]) || []) as Map<string, string>,
        tiposCrime: tiposCrimeMap,
        tiposPenal: new Map(tiposPenalRes.data?.map((t: any) => [t.id, t.nome]) || []) as Map<string, string>,
        desfechosResgates: new Map(desfechosResgatesRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        desfechosCrimesComuns: new Map(desfechosCrimesComunsRes.data?.map((d: any) => [d.id, d.nome]) || []) as Map<string, string>,
        tiposAtividade: new Map(tiposAtividadeRes.data?.map((t: any) => [t.id, { nome: t.nome || '', categoria: t.categoria || '' }]) || []) as Map<string, { nome: string; categoria: string }>,
      };
      
      console.log('✅ [DimensionCache] Cache carregado com sucesso:', {
        regioes: cache.regioes.size,
        especies: cache.especies.size,
        destinacoes: cache.destinacoes.size,
        estadosSaude: cache.estadosSaude.size,
        tiposCrime: cache.tiposCrime.size,
        tiposPenal: cache.tiposPenal.size,
        desfechosResgates: cache.desfechosResgates.size,
        desfechosCrimesComuns: cache.desfechosCrimesComuns.size,
        tiposAtividade: cache.tiposAtividade.size,
      });
      
      setDimensionCache(cache);
    } catch (error) {
      console.error('❌ [DimensionCache] Erro ao carregar cache de dimensões:', error);
      toast.error('Erro ao carregar dados auxiliares');
    }
  };

  const loadAllData = async () => {
    console.log('📊 [loadAllData] Iniciando carregamento de todos os dados...');
    // Carregar todos de uma vez
    await Promise.all([
      loadFaunaData(),
      loadCrimesAmbientaisData(),
      loadCrimesComunsData(),
      loadPrevencaoData(),
      loadBensApreendidosData(),
    ]);
    console.log('✅ [loadAllData] Todos os dados foram carregados');
  };

  const loadDataForTab = async (tab: string) => {
    switch (tab) {
      case 'fauna':
        loadFaunaData();
        break;
      case 'crimes-ambientais':
        loadCrimesAmbientaisData();
        break;
      case 'crimes-comuns':
        loadCrimesComunsData();
        break;
      case 'prevencao':
        loadPrevencaoData();
        break;
      case 'bens-apreendidos':
        loadBensApreendidosData();
        break;
    }
  };

  const buildDateFilters = (query: any, dateField: string) => {
    console.log(`📅 [buildDateFilters] Aplicando filtros para ${dateField}:`, { selectedYear, filterMes, filterDia });
    
    // Sempre filtrar pelo ano selecionado nas abas
    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;
    console.log(`📅 [buildDateFilters] Filtro de ano: ${startDate} a ${endDate}`);
    query = query.gte(dateField, startDate).lte(dateField, endDate);
    
    // Filtro de mês
    if (filterMes !== 'all') {
      const mes = parseInt(filterMes);
      const mesStartDate = `${selectedYear}-${String(mes).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, mes, 0).getDate();
      const mesEndDate = `${selectedYear}-${String(mes).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      console.log(`📅 [buildDateFilters] Filtro de mês: ${mesStartDate} a ${mesEndDate}`);
      query = query.gte(dateField, mesStartDate).lte(dateField, mesEndDate);
      
      // Filtro de dia (só se mês estiver selecionado)
      if (filterDia !== 'all') {
        const diaDate = `${selectedYear}-${String(mes).padStart(2, '0')}-${String(parseInt(filterDia)).padStart(2, '0')}`;
        console.log(`📅 [buildDateFilters] Filtro de dia: ${diaDate}`);
        query = query.eq(dateField, diaDate);
      }
    }
    
    return query;
  };

  const loadFaunaData = async () => {
    setLoadingFauna(true);
    try {
      console.log('🔍 [Fauna] Iniciando busca de registros de fauna...');
      
      // Determinar quais tabelas buscar baseado no ano selecionado
      let tabelas: string[] = [];
      const anoFiltrado = selectedYear;
      
      if (anoFiltrado >= 2026) {
        tabelas = ['fat_registros_de_resgate'];
      } else if (anoFiltrado === 2025) {
        tabelas = ['fat_registros_de_resgate', 'fat_resgates_diarios_2025'];
      } else if (anoFiltrado >= 2020 && anoFiltrado <= 2024) {
        tabelas = [`fat_resgates_diarios_${anoFiltrado}`];
      } else {
        tabelas = ['fat_registros_de_resgate'];
      }
      
      console.log('📊 [Fauna] Tabelas a buscar:', tabelas);
      
      const allRegistros: any[] = [];
      
      await Promise.all(tabelas.map(async (tabela) => {
        try {
          console.log(`🔍 [Fauna] Buscando de ${tabela}...`);
          
          // Tabelas históricas (2020-2024) têm campos diferentes
          if (tabela.match(/fat_resgates_diarios_202[0-4]$/)) {
            let query = supabaseAny
              .from(tabela)
              .select('id, data_ocorrencia, especie_id, quantidade_resgates, nome_popular, nome_cientifico, classe_taxonomica')
              .order('data_ocorrencia', { ascending: false });
            
            // Aplicar filtros de data
            const startDate = `${anoFiltrado}-01-01`;
            const endDate = `${anoFiltrado}-12-31`;
            query = query.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
            
            if (filterMes !== 'all') {
              const mes = parseInt(filterMes);
              const mesStartDate = `${anoFiltrado}-${String(mes).padStart(2, '0')}-01`;
              const lastDay = new Date(anoFiltrado, mes, 0).getDate();
              const mesEndDate = `${anoFiltrado}-${String(mes).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
              query = query.gte('data_ocorrencia', mesStartDate).lte('data_ocorrencia', mesEndDate);
              
              if (filterDia !== 'all') {
                const diaDate = `${anoFiltrado}-${String(mes).padStart(2, '0')}-${String(parseInt(filterDia)).padStart(2, '0')}`;
                query = query.eq('data_ocorrencia', diaDate);
              }
            }
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ [Fauna] Erro ao buscar de ${tabela}:`, error);
              return;
            }
            
            // Normalizar dados históricos para o formato esperado
            const normalized = (data || []).map((r: any) => ({
              id: r.id,
              data: r.data_ocorrencia,
              especie_id: r.especie_id,
              quantidade: r.quantidade_resgates || 0,
              quantidade_total: r.quantidade_resgates || 0,
              regiao_administrativa_id: null,
              destinacao_id: null,
              estado_saude_id: null,
              atropelamento: false,
              created_at: r.data_ocorrencia,
              nome_popular: r.nome_popular,
              nome_cientifico: r.nome_cientifico,
              classe_taxonomica: r.classe_taxonomica,
              fonte: tabela,
            }));
            
            allRegistros.push(...normalized);
            console.log(`✅ [Fauna] ${tabela}: ${normalized.length} registros encontrados`);
          } else {
            // Para fat_registros_de_resgate e fat_resgates_diarios_2025
            let query = supabaseAny
              .from(tabela)
              .select('id, data, especie_id, quantidade, quantidade_total, regiao_administrativa_id, destinacao_id, estado_saude_id, atropelamento, created_at')
              .order('data', { ascending: false });
            
            query = buildDateFilters(query, 'data');
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ [Fauna] Erro ao buscar de ${tabela}:`, error);
              return;
            }
            
            const normalized = (data || []).map((r: any) => ({
              ...r,
              fonte: tabela,
            }));
            
            allRegistros.push(...normalized);
            console.log(`✅ [Fauna] ${tabela}: ${(data || []).length} registros encontrados`);
          }
        } catch (err: any) {
          console.error(`❌ [Fauna] Erro ao buscar de ${tabela}:`, err);
        }
      }));
      
      console.log(`✅ [Fauna] Total de registros encontrados: ${allRegistros.length}`);
      
      // Enriquecer dados usando cache de dimensões
      const enriched: RegistroFauna[] = allRegistros.map((r: any) => {
        const especie = dimensionCache?.especies.get(r.especie_id) || {
          nome_popular: r.nome_popular || 'Não identificado',
          nome_cientifico: r.nome_cientifico,
          classe_taxonomica: r.classe_taxonomica
        };
        
        return {
          id: r.id,
          data: r.data,
          especie_nome: especie.nome_popular || 'Não identificado',
          especie_cientifico: especie.nome_cientifico,
          classe: especie.classe_taxonomica,
          quantidade: r.quantidade_total || r.quantidade || 0,
          regiao: dimensionCache?.regioes.get(r.regiao_administrativa_id),
          destinacao: dimensionCache?.destinacoes.get(r.destinacao_id),
          estado_saude: dimensionCache?.estadosSaude.get(r.estado_saude_id),
          atropelamento: r.atropelamento === true || r.atropelamento === 'Sim',
        };
      });
      
      // Ordenar por data (mais recente primeiro)
      enriched.sort((a, b) => {
        const dateA = a.data ? new Date(a.data).getTime() : 0;
        const dateB = b.data ? new Date(b.data).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log(`✅ [Fauna] Dados enriquecidos e prontos para exibição: ${enriched.length} registros`);
      setFaunaRegistros(enriched);
    } catch (error: any) {
      console.error('❌ [Fauna] Erro ao carregar fauna:', error);
      toast.error(`Erro ao carregar registros de fauna: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setLoadingFauna(false);
      console.log('✅ [Fauna] Loading finalizado');
    }
  };

  const loadCrimesAmbientaisData = async () => {
    setLoadingCrimesAmbientais(true);
    try {
      console.log('🔍 [Crimes Ambientais] Iniciando busca em fat_registros_de_crimes_ambientais...');
      
      // Buscar da tabela principal de crimes ambientais
      let query = supabaseAny
        .from('fat_registros_de_crimes_ambientais')
        .select('id, data, tipo_crime_id, enquadramento_id, regiao_administrativa_id, ocorreu_apreensao, procedimento_legal, desfecho_id, created_at')
        .order('data', { ascending: false });

      query = buildDateFilters(query, 'data');
      console.log('🔍 [Crimes Ambientais] Executando query...', { selectedYear, filterMes, filterDia });
      
      const { data, error } = await query;

      if (error) {
        console.error('❌ [Crimes Ambientais] Erro na query:', error);
        toast.error(`Erro ao carregar registros de crimes ambientais: ${error.message}`);
        throw error;
      }
      
      console.log(`✅ [Crimes Ambientais] Carregados ${data?.length || 0} registros de fat_registros_de_crimes_ambientais`);

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
      console.log('🔍 [Crimes Comuns] Iniciando busca em fat_crimes_comuns...');
      let query = supabase
        .from('fat_crimes_comuns')
        .select('id, data, natureza_crime, tipo_penal_id, regiao_administrativa_id, local_especifico, vitimas_envolvidas, suspeitos_envolvidos, desfecho_id, created_at')
        .order('data', { ascending: false });

      query = buildDateFilters(query, 'data');
      console.log('🔍 [Crimes Comuns] Executando query...', { selectedYear, filterMes, filterDia });
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ [Crimes Comuns] Erro na query:', error);
        console.error('❌ [Crimes Comuns] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Erro ao carregar registros de crimes comuns: ${error.message}`);
        throw error;
      }
      
      console.log(`✅ [Crimes Comuns] Carregados ${data?.length || 0} registros de crimes comuns`);
      if (data && data.length === 0) {
        console.warn('⚠️ [Crimes Comuns] Nenhum registro encontrado na tabela fat_crimes_comuns');
      }

      if (error) {
        console.error('Erro na query de crimes comuns:', error);
        throw error;
      }
      
      console.log(`✅ Carregados ${data?.length || 0} registros de crimes comuns da tabela fat_crimes_comuns`);

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
        .select('id, data, tipo_atividade_id, regiao_administrativa_id, quantidade_publico, observacoes, created_at')
        .order('data', { ascending: false });

      query = buildDateFilters(query, 'data');
      const { data, error } = await query;

      if (error) {
        console.error('Erro na query de prevenção:', error);
        throw error;
      }
      
      console.log(`✅ Carregados ${data?.length || 0} registros de prevenção da tabela fat_atividades_prevencao`);

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

  const loadBensApreendidosData = async () => {
    setLoadingBensApreendidos(true);
    try {
      console.log('🔍 [Bens Apreendidos] Iniciando busca em fat_ocorrencia_apreensao e fat_ocorrencia_apreensao_crime_comum...');
      
      // Buscar da tabela de apreensões de crimes ambientais
      const { data: apreensaoAmbiental, error: errorAmbiental } = await supabaseAny
        .from('fat_ocorrencia_apreensao')
        .select('id, quantidade, id_ocorrencia, id_item_apreendido, created_at')
        .order('created_at', { ascending: false });

      if (errorAmbiental) {
        console.error('❌ [Bens Apreendidos] Erro ao buscar fat_ocorrencia_apreensao:', errorAmbiental);
      }
      
      // Buscar da tabela de apreensões de crimes comuns
      const { data: apreensaoComum, error: errorComum } = await supabaseAny
        .from('fat_ocorrencia_apreensao_crime_comum')
        .select('id, quantidade, id_ocorrencia, id_item_apreendido, created_at')
        .order('created_at', { ascending: false });

      if (errorComum) {
        console.error('❌ [Bens Apreendidos] Erro ao buscar fat_ocorrencia_apreensao_crime_comum:', errorComum);
      }
      
      // Combinar os dados de ambas as tabelas
      const allApreensoes = [
        ...(apreensaoAmbiental || []).map((r: any) => ({ ...r, fonte: 'ambiental' })),
        ...(apreensaoComum || []).map((r: any) => ({ ...r, fonte: 'comum' })),
      ];
      
      console.log(`✅ [Bens Apreendidos] Total de ${allApreensoes.length} apreensões encontradas`);

      // Buscar itens de apreensão
      const { data: itensData } = await supabaseAny
        .from('dim_itens_apreensao')
        .select('id, Item, "Bem Apreendido", "Tipo de Crime"');
      
      const itensMap = new Map<string, any>();
      itensData?.forEach((i: any) => {
        itensMap.set(i.id, i);
      });

      // Buscar datas das ocorrências de crimes ambientais
      const ocorrenciaIdsAmbiental = [...new Set(
        allApreensoes
          .filter((r: any) => r.fonte === 'ambiental' && r.id_ocorrencia)
          .map((r: any) => r.id_ocorrencia)
      )];
      
      let ocorrenciasAmbientalMap = new Map<string, string>();
      if (ocorrenciaIdsAmbiental.length > 0) {
        const { data: ocorrenciasData } = await supabaseAny
          .from('fat_registros_de_crimes_ambientais')
          .select('id, data')
          .in('id', ocorrenciaIdsAmbiental);
        ocorrenciasData?.forEach((o: any) => {
          ocorrenciasAmbientalMap.set(o.id, o.data);
        });
      }

      // Buscar datas das ocorrências de crimes comuns
      const ocorrenciaIdsComum = [...new Set(
        allApreensoes
          .filter((r: any) => r.fonte === 'comum' && r.id_ocorrencia)
          .map((r: any) => r.id_ocorrencia)
      )];
      
      let ocorrenciasComumMap = new Map<string, string>();
      if (ocorrenciaIdsComum.length > 0) {
        const { data: ocorrenciasData } = await supabaseAny
          .from('fat_crimes_comuns')
          .select('id, data')
          .in('id', ocorrenciaIdsComum);
        ocorrenciasData?.forEach((o: any) => {
          ocorrenciasComumMap.set(o.id, o.data);
        });
      }

      const enriched: RegistroBemApreendido[] = allApreensoes.map((r: any) => {
        const item = itensMap.get(r.id_item_apreendido);
        const dataOcorrencia = r.fonte === 'ambiental' 
          ? ocorrenciasAmbientalMap.get(r.id_ocorrencia)
          : ocorrenciasComumMap.get(r.id_ocorrencia);
        
        return {
          id: r.id,
          data: dataOcorrencia || r.created_at?.substring(0, 10) || '',
          item: item?.Item,
          bem_apreendido: item?.['Bem Apreendido'],
          tipo_crime: item?.['Tipo de Crime'] || (r.fonte === 'comum' ? 'Crime Comum' : 'Crime Ambiental'),
          quantidade: r.quantidade,
          ocorrencia_id: r.id_ocorrencia,
        };
      });

      // Ordenar por data (mais recente primeiro)
      enriched.sort((a, b) => {
        const dateA = a.data ? new Date(a.data).getTime() : 0;
        const dateB = b.data ? new Date(b.data).getTime() : 0;
        return dateB - dateA;
      });

      setBensApreendidos(enriched);
    } catch (error) {
      console.error('Erro ao carregar bens apreendidos:', error);
    } finally {
      setLoadingBensApreendidos(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatDateRelative = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays} dias atrás`;
      
      return format(date, 'dd MMM, yyyy', { locale: ptBR });
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
          table = 'fat_registros_de_crimes_ambientais';
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
    console.log(`🔍 [getFilteredData] Entrada: data.length=${data.length}, searchTerm="${searchTerm}", searchFields=`, searchFields);
    if (!searchTerm) {
      console.log(`✅ [getFilteredData] Sem termo de busca, retornando todos os ${data.length} registros`);
      return data;
    }
    const term = searchTerm.toLowerCase();
    const filtered = data.filter(item => 
      searchFields.some(field => 
        String(item[field] || '').toLowerCase().includes(term)
      )
    );
    console.log(`✅ [getFilteredData] Filtrado: ${filtered.length} de ${data.length} registros`);
    return filtered;
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = (ids: string[]) => {
    if (selectedItems.size === ids.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(ids));
    }
  };


  const tabStats = useMemo(() => {
    const stats = {
      fauna: faunaRegistros.length,
      crimesAmbientais: crimesAmbientais.length,
      crimesComuns: crimesComuns.length,
      prevencao: prevencaoRegistros.length,
      bensApreendidos: bensApreendidos.length,
    };
    console.log('📊 [tabStats] Estatísticas atualizadas:', stats);
    return stats;
  }, [faunaRegistros, crimesAmbientais, crimesComuns, prevencaoRegistros, bensApreendidos]);

  const getStatusVariant = (status: string | undefined): 'success' | 'warning' | 'error' | 'default' => {
    if (!status) return 'default';
    const lower = status.toLowerCase();
    if (lower.includes('solto') || lower.includes('encaminhado') || lower.includes('liberado')) return 'success';
    if (lower.includes('óbito') || lower.includes('morte') || lower.includes('apreensão')) return 'error';
    if (lower.includes('ferido') || lower.includes('tratamento')) return 'warning';
    return 'default';
  };

  // Renderização de tabela para cada tipo
  const renderFaunaTable = () => {
    console.log(`🔍 [renderFaunaTable] faunaRegistros.length: ${faunaRegistros.length}, searchTerm: "${searchTerm}"`);
    const filteredData = getFilteredData(faunaRegistros, ['especie_nome', 'especie_cientifico', 'regiao']);
    console.log(`🔍 [renderFaunaTable] filteredData.length: ${filteredData.length}`);
    const allIds = filteredData.map(r => r.id);

    if (loadingFauna) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Bird className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum registro de fauna encontrado</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.size === allIds.length && allIds.length > 0}
                  onCheckedChange={() => toggleSelectAll(allIds)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Espécie</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Quantidade</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="hidden lg:table-cell">Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((registro, index) => (
              <TableRow 
                key={registro.id}
                className={cn(
                  "transition-colors",
                  selectedItems.has(registro.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.has(registro.id)}
                    onCheckedChange={() => toggleSelectItem(registro.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{registro.especie_nome}</p>
                    {registro.especie_cientifico && (
                      <p className="text-xs text-muted-foreground italic">{registro.especie_cientifico}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge 
                    status={registro.destinacao || 'Pendente'} 
                    variant={getStatusVariant(registro.destinacao)}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {registro.quantidade || 1}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(registro.data)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {formatDateRelative(registro.data)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button3D size="sm" variant="view" onClick={() => handleView('fauna', registro.id)} />
                    <Button3D size="sm" variant="edit" onClick={() => handleEdit('fauna', registro.id)} />
                    <Button3D size="sm" variant="delete" onClick={() => handleDeleteClick('fauna', registro.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCrimesAmbientaisTable = () => {
    const filteredData = getFilteredData(crimesAmbientais, ['tipo_crime', 'regiao']);
    const allIds = filteredData.map(r => r.id);

    if (loadingCrimesAmbientais) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum registro de crime ambiental encontrado</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.size === allIds.length && allIds.length > 0}
                  onCheckedChange={() => toggleSelectAll(allIds)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Tipo de Crime</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Região</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="hidden lg:table-cell">Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((registro, index) => (
              <TableRow 
                key={registro.id}
                className={cn(
                  "transition-colors",
                  selectedItems.has(registro.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.has(registro.id)}
                    onCheckedChange={() => toggleSelectItem(registro.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{registro.tipo_crime || 'Crime Ambiental'}</p>
                    {registro.procedimento && (
                      <p className="text-xs text-muted-foreground">{registro.procedimento}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge 
                    status={registro.ocorreu_apreensao ? 'Apreensão' : registro.desfecho || 'Registrado'} 
                    variant={registro.ocorreu_apreensao ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {registro.regiao || '-'}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(registro.data)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {formatDateRelative(registro.data)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button3D size="sm" variant="view" onClick={() => handleView('crimes-ambientais', registro.id)} />
                    <Button3D size="sm" variant="edit" onClick={() => handleEdit('crimes-ambientais', registro.id)} />
                    <Button3D size="sm" variant="delete" onClick={() => handleDeleteClick('crimes-ambientais', registro.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderCrimesComunsTable = () => {
    const filteredData = getFilteredData(crimesComuns, ['natureza_crime', 'tipo_penal', 'regiao']);
    const allIds = filteredData.map(r => r.id);

    if (loadingCrimesComuns) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum registro de crime comum encontrado</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.size === allIds.length && allIds.length > 0}
                  onCheckedChange={() => toggleSelectAll(allIds)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Natureza</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Vítimas</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="hidden lg:table-cell">Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((registro, index) => (
              <TableRow 
                key={registro.id}
                className={cn(
                  "transition-colors",
                  selectedItems.has(registro.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.has(registro.id)}
                    onCheckedChange={() => toggleSelectItem(registro.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{registro.natureza_crime || registro.tipo_penal || 'Crime Comum'}</p>
                    {registro.local_especifico && (
                      <p className="text-xs text-muted-foreground">{registro.local_especifico}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge 
                    status={registro.desfecho || 'Registrado'} 
                    variant={getStatusVariant(registro.desfecho)}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {registro.vitimas || 0}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(registro.data)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {formatDateRelative(registro.data)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button3D size="sm" variant="view" onClick={() => handleView('crimes-comuns', registro.id)} />
                    <Button3D size="sm" variant="edit" onClick={() => handleEdit('crimes-comuns', registro.id)} />
                    <Button3D size="sm" variant="delete" onClick={() => handleDeleteClick('crimes-comuns', registro.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderPrevencaoTable = () => {
    const filteredData = getFilteredData(prevencaoRegistros, ['tipo_atividade', 'categoria', 'regiao']);
    const allIds = filteredData.map(r => r.id);

    if (loadingPrevencao) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum registro de prevenção encontrado</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.size === allIds.length && allIds.length > 0}
                  onCheckedChange={() => toggleSelectAll(allIds)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Público</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="hidden lg:table-cell">Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((registro, index) => (
              <TableRow 
                key={registro.id}
                className={cn(
                  "transition-colors",
                  selectedItems.has(registro.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.has(registro.id)}
                    onCheckedChange={() => toggleSelectItem(registro.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{registro.tipo_atividade || 'Atividade'}</p>
                    {registro.regiao && (
                      <p className="text-xs text-muted-foreground">{registro.regiao}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">{registro.categoria || '-'}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {registro.publico || 0}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(registro.data)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {formatDateRelative(registro.data)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button3D size="sm" variant="view" onClick={() => handleView('prevencao', registro.id)} />
                    <Button3D size="sm" variant="edit" onClick={() => handleEdit('prevencao', registro.id)} />
                    <Button3D size="sm" variant="delete" onClick={() => handleDeleteClick('prevencao', registro.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderBensApreendidosTable = () => {
    const filteredData = getFilteredData(bensApreendidos, ['item', 'bem_apreendido', 'tipo_crime']);
    const allIds = filteredData.map(r => r.id);

    if (loadingBensApreendidos) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum bem apreendido encontrado</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedItems.size === allIds.length && allIds.length > 0}
                  onCheckedChange={() => toggleSelectAll(allIds)}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="hidden lg:table-cell">Quantidade</TableHead>
              <TableHead className="hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((registro, index) => (
              <TableRow 
                key={registro.id}
                className={cn(
                  "transition-colors",
                  selectedItems.has(registro.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedItems.has(registro.id)}
                    onCheckedChange={() => toggleSelectItem(registro.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{String(index + 1).padStart(5, '0')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{registro.item || 'Item'}</p>
                    {registro.tipo_crime && (
                      <p className="text-xs text-muted-foreground">{registro.tipo_crime}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">{registro.bem_apreendido || '-'}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {registro.quantidade || 0}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {registro.data ? formatDate(registro.data) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button3D size="sm" variant="view" onClick={() => registro.ocorrencia_id && handleView('crimes-ambientais', registro.ocorrencia_id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  console.log('🎨 [RegistrosUnificados] Renderizando JSX...', {
    activeTab,
    faunaRegistros: faunaRegistros.length,
    crimesAmbientais: crimesAmbientais.length,
    crimesComuns: crimesComuns.length,
    prevencao: prevencaoRegistros.length,
    bensApreendidos: bensApreendidos.length,
    loadingFauna,
    dimensionCache: !!dimensionCache
  });

  return (
    <Layout title="Registros" showBackButton>
      <div className="space-y-4">
        {/* Tabs estilo moderno */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tab triggers no estilo da imagem */}
            <TabsList className="h-auto p-1 bg-muted/50 rounded-full inline-flex w-auto">
              <TabsTrigger 
                value="fauna" 
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Bird className="h-4 w-4" />
                <span className="hidden sm:inline">Fauna</span>
                <Badge variant="secondary" className="ml-1 text-xs rounded-full bg-background/50">
                  {tabStats.fauna}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="crimes-ambientais" 
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <TreePine className="h-4 w-4" />
                <span className="hidden sm:inline">Ambientais</span>
                <Badge variant="secondary" className="ml-1 text-xs rounded-full bg-background/50">
                  {tabStats.crimesAmbientais}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="crimes-comuns" 
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Comuns</span>
                <Badge variant="secondary" className="ml-1 text-xs rounded-full bg-background/50">
                  {tabStats.crimesComuns}
                </Badge>
              </TabsTrigger>
              
              <TabsTrigger 
                value="prevencao" 
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Prevenção</span>
                <Badge variant="secondary" className="ml-1 text-xs rounded-full bg-background/50">
                  {tabStats.prevencao}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="bens-apreendidos" 
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Apreendidos</span>
                <Badge variant="secondary" className="ml-1 text-xs rounded-full bg-background/50">
                  {tabStats.bensApreendidos}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Ações */}
            <div className="flex items-center gap-2">
              {/* Pesquisa */}
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-registros"
                  name="search-registros"
                  placeholder="Filtrar registros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
              
            </div>
          </div>

          {/* Abas de Anos */}
          <div className="w-full border-b border-border/40 bg-background/50 backdrop-blur-sm -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
            <div className="flex items-end gap-0.5 sm:gap-1 pt-2 overflow-x-auto scrollbar-hide">
              {anosDisponiveis.map((ano) => (
                <button
                  key={ano}
                  onClick={() => {
                    setSelectedYear(ano);
                    setFilterMes('all');
                    setFilterDia('all');
                  }}
                  className={cn(
                    "relative px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200",
                    "border border-b-0 min-w-[60px] sm:min-w-[80px]",
                    "hover:bg-muted/50",
                    selectedYear === ano
                      ? "bg-background text-primary border-border shadow-sm z-10 -mb-px"
                      : "bg-muted/30 text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">{ano}</span>
                  {selectedYear === ano && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Mês e Dia */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterMes} onValueChange={(val) => {
              setFilterMes(val);
              setFilterDia('all'); // Reset dia quando mês muda
            }}>
              <SelectTrigger className="w-36 rounded-full bg-muted/50 border-0">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {meses.map(mes => (
                  <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Mostrar filtro de dia apenas se mês estiver selecionado */}
            {filterMes !== 'all' && (
              <Select value={filterDia} onValueChange={setFilterDia}>
                <SelectTrigger className="w-28 rounded-full bg-muted/50 border-0">
                  <SelectValue placeholder="Dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os dias</SelectItem>
                  {diasDoMes.map(dia => (
                    <SelectItem key={dia.value} value={dia.value}>{dia.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Botão para limpar filtros */}
            {(filterMes !== 'all' || filterDia !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterMes('all');
                  setFilterDia('all');
                }}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Conteúdo das Tabs */}
          <TabsContent value="fauna" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {(() => {
                console.log('🎨 [TabsContent Fauna] Renderizando conteúdo da aba fauna');
                return renderFaunaTable();
              })()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="crimes-ambientais" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {renderCrimesAmbientaisTable()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="crimes-comuns" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {renderCrimesComunsTable()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prevencao" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {renderPrevencaoTable()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bens-apreendidos" className="mt-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {renderBensApreendidosTable()}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Barra de ações flutuante quando há itens selecionados */}
        {selectedItems.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <button 
                onClick={() => setSelectedItems(new Set())}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Limpar seleção"
                title="Limpar seleção"
              >
                <XIcon className="h-4 w-4" />
              </button>
              <span className="font-medium">{selectedItems.size} selecionados</span>
              
              <div className="w-px h-6 bg-white/20" />
              
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors">
                <MoreHorizontal className="h-4 w-4" />
                <span className="text-sm">Mais</span>
              </button>
              
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors">
                <Edit className="h-4 w-4" />
                <span className="text-sm">Editar</span>
              </button>
              
              <button 
                className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                onClick={() => {
                  if (selectedItems.size === 1) {
                    const id = Array.from(selectedItems)[0];
                    handleDeleteClick(activeTab, id);
                  } else {
                    toast.error('Selecione apenas um item para excluir');
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Excluir</span>
              </button>
            </div>
          </div>
        )}
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
