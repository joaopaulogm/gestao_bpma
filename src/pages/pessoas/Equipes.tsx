import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Save, X, UsersRound, ChevronDown, ChevronRight, Upload, Shield, Anchor, Car, Building, Wrench, GraduationCap, Radio, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import * as XLSX from 'xlsx';

interface Efetivo {
  id: string;
  matricula: string;
  posto_graduacao: string;
  nome_guerra: string;
  nome: string;
}

interface MembroEquipe {
  id: string;
  efetivo_id: string;
  funcao: string;
  efetivo?: Efetivo;
}

interface Equipe {
  id: string;
  nome: string;
  grupamento: string;
  escala: string | null;
  servico: string | null;
  membros?: MembroEquipe[];
}

interface ExcelRow {
  'Matrícula': string;
  'Posto/Graduação': string;
  'Nome de Guerra': string;
  'Nome Completo': string;
  'Circunstância': string;
  'Serviço': string;
  'Escala': string;
  'Grupamento': string;
  'Equipe': string;
  'Função': string;
}

const GRUPAMENTOS_ORDER = [
  'GOC', 'GTA', 'LACUSTRE', 'GUARDA', 'ARMEIRO', 'PATRULHA AMBIENTAL',
  'EXPEDIENTE', 'OFICIAIS', 'OFICIAIS OPERACIONAIS', 'MANUTENÇÃO', 
  'MOTORISTAS', 'INSTRUÇÕES E CURSO', 'COMISSÕES', 'P2'
];

const GRUPAMENTO_CONFIG: Record<string, { icon: React.ReactNode; color: string; parentGroup?: string }> = {
  'GOC': { icon: <Shield className="h-5 w-5" />, color: 'from-emerald-600 to-emerald-800' },
  'GTA': { icon: <Car className="h-5 w-5" />, color: 'from-blue-600 to-blue-800' },
  'LACUSTRE': { icon: <Anchor className="h-5 w-5" />, color: 'from-cyan-600 to-cyan-800' },
  'GUARDA': { icon: <Radio className="h-5 w-5" />, color: 'from-amber-600 to-amber-800' },
  'ARMEIRO': { icon: <Shield className="h-5 w-5" />, color: 'from-red-600 to-red-800', parentGroup: 'GUARDA' },
  'PATRULHA AMBIENTAL': { icon: <Shield className="h-5 w-5" />, color: 'from-green-600 to-green-800' },
  'EXPEDIENTE': { icon: <Building className="h-5 w-5" />, color: 'from-slate-600 to-slate-800' },
  'OFICIAIS': { icon: <UserCog className="h-5 w-5" />, color: 'from-purple-600 to-purple-800' },
  'OFICIAIS OPERACIONAIS': { icon: <UserCog className="h-5 w-5" />, color: 'from-violet-600 to-violet-800' },
  'MANUTENÇÃO': { icon: <Wrench className="h-5 w-5" />, color: 'from-orange-600 to-orange-800' },
  'MOTORISTAS': { icon: <Car className="h-5 w-5" />, color: 'from-zinc-600 to-zinc-800' },
  'INSTRUÇÕES E CURSO': { icon: <GraduationCap className="h-5 w-5" />, color: 'from-indigo-600 to-indigo-800' },
  'COMISSÕES': { icon: <Users className="h-5 w-5" />, color: 'from-teal-600 to-teal-800' },
  'P2': { icon: <Shield className="h-5 w-5" />, color: 'from-rose-600 to-rose-800' },
};

const ESCALAS = ['24 X 72', '12 X 36', '12 X 60', 'EXPEDIENTE'];
const SERVICOS = ['OPERACIONAL', 'APOIO OPERACIONAL', 'ADMINISTRATIVO'];
const FUNCOES = [
  'COMANDANTE', 'PATRULHEIRO', 'MOTORISTA', 'TRIPULANTE', 'RÁDIO OPERADOR',
  'ADJ OFICIAL DE DIA', 'ADJUNTO', 'INSTRUTOR', 'ARMEIRO', 'APOIO GERAL',
  'AUXILIAR ADMINISTRATIVO', 'COORDENADOR', 'MECÂNICO', 'EXPEDIENTE ADM',
  'MOTORISTA OFICIAL DE DIA', 'MOTORISTA DO CMT'
];

const Equipes: React.FC = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [efetivos, setEfetivos] = useState<Efetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('cadastradas');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Form state
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState({ nome: '', grupamento: '', escala: '', servico: '' });
  const [selectedMembros, setSelectedMembros] = useState<{efetivo_id: string; funcao: string}[]>([]);
  const [searchEquipe, setSearchEquipe] = useState('');
  const [matriculaInput, setMatriculaInput] = useState('');

  const fetchEquipes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: equipesData, error: equipesError } = await supabase
        .from('dim_equipes')
        .select('*')
        .order('grupamento', { ascending: true });

      if (equipesError) throw equipesError;

      const equipesWithMembros = await Promise.all(
        (equipesData || []).map(async (equipe) => {
          const { data: membrosData } = await supabase
            .from('fat_equipe_membros')
            .select(`
              id,
              efetivo_id,
              funcao,
              dim_efetivo!inner(id, matricula, posto_graduacao, nome_guerra, nome)
            `)
            .eq('equipe_id', equipe.id);

          return {
            ...equipe,
            membros: (membrosData || []).map((m: any) => ({
              id: m.id,
              efetivo_id: m.efetivo_id,
              funcao: m.funcao,
              efetivo: m.dim_efetivo
            }))
          };
        })
      );

      setEquipes(equipesWithMembros);
      
      // Expand all groups by default
      const expanded: Record<string, boolean> = {};
      equipesWithMembros.forEach(e => { expanded[e.grupamento] = true; });
      setExpandedGroups(expanded);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEfetivos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('id, matricula, posto_graduacao, nome_guerra, nome')
        .order('nome_guerra', { ascending: true });

      if (error) throw error;
      setEfetivos(data || []);
    } catch (error) {
      console.error('Erro ao carregar efetivos:', error);
    }
  }, []);

  useEffect(() => {
    fetchEquipes();
    fetchEfetivos();
  }, [fetchEquipes, fetchEfetivos]);

  const importFromExcel = async () => {
    setImporting(true);
    try {
      // Fetch from Supabase Storage bucket "files"
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('files')
        .download('Equipes_BPMA.xlsx');
      
      if (downloadError) {
        console.error('Erro ao baixar arquivo:', downloadError);
        toast.error('Arquivo não encontrado no bucket. Verifique se Equipes_BPMA.xlsx existe em storage/files');
        setImporting(false);
        return;
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      // Group by Grupamento + Equipe
      const equipesMap = new Map<string, { nome: string; grupamento: string; escala: string; servico: string; membros: { matricula: string; funcao: string }[] }>();

      for (const row of jsonData) {
        const key = `${row.Grupamento}-${row.Equipe}`;
        if (!equipesMap.has(key)) {
          equipesMap.set(key, {
            nome: row.Equipe,
            grupamento: row.Grupamento,
            escala: row.Escala,
            servico: row.Serviço,
            membros: []
          });
        }
        const equipe = equipesMap.get(key)!;
        // Avoid duplicate members
        if (!equipe.membros.some(m => m.matricula === row['Matrícula'])) {
          equipe.membros.push({ matricula: row['Matrícula'], funcao: row['Função'] });
        }
      }

      let createdCount = 0;
      let updatedCount = 0;

      for (const [, equipeData] of equipesMap) {
        // Check if team exists
        const { data: existingEquipe } = await supabase
          .from('dim_equipes')
          .select('id')
          .eq('nome', equipeData.nome)
          .eq('grupamento', equipeData.grupamento)
          .single();

        let equipeId: string;

        if (existingEquipe) {
          equipeId = existingEquipe.id;
          // Delete existing members
          await supabase.from('fat_equipe_membros').delete().eq('equipe_id', equipeId);
          updatedCount++;
        } else {
          const { data: newEquipe, error } = await supabase
            .from('dim_equipes')
            .insert({
              nome: equipeData.nome,
              grupamento: equipeData.grupamento,
              escala: equipeData.escala || null,
              servico: equipeData.servico || null
            })
            .select()
            .single();

          if (error) {
            console.error('Erro ao criar equipe:', error);
            continue;
          }
          equipeId = newEquipe.id;
          createdCount++;
        }

        // Add members
        for (const membro of equipeData.membros) {
          const matriculaNorm = membro.matricula.replace(/^0+/, '');
          const efetivo = efetivos.find(e => 
            e.matricula === membro.matricula || 
            e.matricula === matriculaNorm ||
            e.matricula.replace(/^0+/, '') === matriculaNorm
          );

          if (efetivo) {
            await supabase.from('fat_equipe_membros').insert({
              equipe_id: equipeId,
              efetivo_id: efetivo.id,
              funcao: membro.funcao || 'PATRULHEIRO'
            });
          }
        }
      }

      toast.success(`Importação concluída: ${createdCount} equipes criadas, ${updatedCount} atualizadas`);
      fetchEquipes();
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', grupamento: '', escala: '', servico: '' });
    setSelectedMembros([]);
    setEditingEquipe(null);
    setMatriculaInput('');
  };

  const handleEdit = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      nome: equipe.nome,
      grupamento: equipe.grupamento,
      escala: equipe.escala || '',
      servico: equipe.servico || ''
    });
    setSelectedMembros(
      (equipe.membros || []).map(m => ({ efetivo_id: m.efetivo_id, funcao: m.funcao }))
    );
    setActiveTab('cadastrar');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta equipe?')) return;
    try {
      const { error } = await supabase.from('dim_equipes').delete().eq('id', id);
      if (error) throw error;
      toast.success('Equipe excluída com sucesso');
      fetchEquipes();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      toast.error('Erro ao excluir equipe');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.grupamento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      let equipeId = editingEquipe?.id;

      if (editingEquipe) {
        const { error } = await supabase
          .from('dim_equipes')
          .update({
            nome: formData.nome,
            grupamento: formData.grupamento,
            escala: formData.escala || null,
            servico: formData.servico || null
          })
          .eq('id', editingEquipe.id);

        if (error) throw error;
        await supabase.from('fat_equipe_membros').delete().eq('equipe_id', editingEquipe.id);
      } else {
        const { data, error } = await supabase
          .from('dim_equipes')
          .insert({
            nome: formData.nome,
            grupamento: formData.grupamento,
            escala: formData.escala || null,
            servico: formData.servico || null
          })
          .select()
          .single();

        if (error) throw error;
        equipeId = data.id;
      }

      if (selectedMembros.length > 0 && equipeId) {
        const { error: membrosError } = await supabase
          .from('fat_equipe_membros')
          .insert(selectedMembros.map(m => ({
            equipe_id: equipeId,
            efetivo_id: m.efetivo_id,
            funcao: m.funcao
          })));

        if (membrosError) throw membrosError;
      }

      toast.success(editingEquipe ? 'Equipe atualizada' : 'Equipe cadastrada');
      resetForm();
      fetchEquipes();
      setActiveTab('cadastradas');
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error('Erro ao salvar equipe');
    }
  };

  const addMembroByMatricula = () => {
    if (!matriculaInput.trim()) return;
    const matriculaSemZeros = matriculaInput.replace(/^0+/, '');
    const efetivo = efetivos.find(e => 
      e.matricula === matriculaInput || 
      e.matricula === matriculaSemZeros ||
      e.matricula.replace(/^0+/, '') === matriculaSemZeros
    );
    
    if (!efetivo) {
      toast.error('Policial não encontrado');
      return;
    }
    
    if (selectedMembros.some(m => m.efetivo_id === efetivo.id)) {
      toast.error('Este policial já está na equipe');
      return;
    }
    
    setSelectedMembros([...selectedMembros, { efetivo_id: efetivo.id, funcao: 'PATRULHEIRO' }]);
    setMatriculaInput('');
    toast.success(`${efetivo.posto_graduacao} ${efetivo.nome_guerra} adicionado`);
  };

  const removeMembro = (efetivoId: string) => {
    setSelectedMembros(selectedMembros.filter(m => m.efetivo_id !== efetivoId));
  };

  const updateMembroFuncao = (efetivoId: string, funcao: string) => {
    setSelectedMembros(selectedMembros.map(m => 
      m.efetivo_id === efetivoId ? { ...m, funcao } : m
    ));
  };

  const filteredEquipes = equipes.filter(e => 
    e.nome.toLowerCase().includes(searchEquipe.toLowerCase()) ||
    e.grupamento.toLowerCase().includes(searchEquipe.toLowerCase()) ||
    e.membros?.some(m => 
      m.efetivo?.nome_guerra.toLowerCase().includes(searchEquipe.toLowerCase()) ||
      m.efetivo?.matricula.includes(searchEquipe)
    )
  );

  // Group equipes by grupamento, ordered
  const groupedEquipes = GRUPAMENTOS_ORDER.reduce((acc, grupamento) => {
    const equipesGrupo = filteredEquipes.filter(e => e.grupamento === grupamento);
    if (equipesGrupo.length > 0) {
      acc[grupamento] = equipesGrupo;
    }
    return acc;
  }, {} as Record<string, Equipe[]>);

  // Add any remaining grupamentos not in the order
  filteredEquipes.forEach(e => {
    if (!GRUPAMENTOS_ORDER.includes(e.grupamento)) {
      if (!groupedEquipes[e.grupamento]) groupedEquipes[e.grupamento] = [];
      if (!groupedEquipes[e.grupamento].some(eq => eq.id === e.id)) {
        groupedEquipes[e.grupamento].push(e);
      }
    }
  });

  const toggleGroup = (grupamento: string) => {
    setExpandedGroups(prev => ({ ...prev, [grupamento]: !prev[grupamento] }));
  };

  const getMembroInfo = (efetivoId: string) => efetivos.find(e => e.id === efetivoId);

  const config = (grupamento: string) => GRUPAMENTO_CONFIG[grupamento] || { icon: <Users className="h-5 w-5" />, color: 'from-[#071d49] to-[#0a2a5e]' };

  const MembroCard = ({ membro }: { membro: MembroEquipe }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
      <div className="w-8 h-8 rounded-full bg-[#ffcc00]/20 flex items-center justify-center flex-shrink-0">
        <span className="text-[#ffcc00] text-xs font-bold">
          {membro.efetivo?.posto_graduacao?.slice(0, 2) || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {membro.efetivo?.posto_graduacao} {membro.efetivo?.nome_guerra}
        </p>
        <p className="text-white/50 text-xs font-mono">{membro.efetivo?.matricula}</p>
      </div>
      <Badge className="bg-[#ffcc00]/20 text-[#ffcc00] border-0 text-[10px] shrink-0">
        {membro.funcao}
      </Badge>
    </div>
  );

  const EquipeCard = ({ equipe, compact = false }: { equipe: Equipe; compact?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const grupConfig = config(equipe.grupamento);

    return (
      <Card className={`bg-gradient-to-br ${grupConfig.color} border-0 shadow-lg hover:shadow-[0_0_30px_rgba(255,204,0,0.2)] transition-all duration-300 overflow-hidden`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    {grupConfig.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                      {equipe.nome}
                      <Badge variant="outline" className="border-white/30 text-white/70 text-[10px]">
                        {equipe.membros?.length || 0}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-1.5 mt-1">
                      {equipe.escala && (
                        <Badge className="bg-white/10 text-white/80 border-0 text-[10px]">
                          {equipe.escala}
                        </Badge>
                      )}
                      {equipe.servico && (
                        <Badge className="bg-[#ffcc00]/20 text-[#ffcc00] border-0 text-[10px]">
                          {equipe.servico}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleEdit(equipe); }}
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleDelete(equipe.id); }}
                    className="h-8 w-8 text-white/60 hover:text-red-400 hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-white/50" /> : <ChevronRight className="h-5 w-5 text-white/50" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {equipe.membros?.map((membro) => (
                  <MembroCard key={membro.id} membro={membro} />
                ))}
                {(!equipe.membros || equipe.membros.length === 0) && (
                  <p className="text-white/40 text-sm italic py-4 text-center">Nenhum membro cadastrado</p>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const GrupamentoSection = ({ grupamento, equipesGrupo }: { grupamento: string; equipesGrupo: Equipe[] }) => {
    const grupConfig = config(grupamento);
    const isExpanded = expandedGroups[grupamento] !== false;

    // Check if ARMEIRO should be nested under GUARDA
    const armeirosEquipes = grupamento === 'GUARDA' ? groupedEquipes['ARMEIRO'] || [] : [];

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(grupamento)}>
        <CollapsibleTrigger asChild>
          <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${grupConfig.color} cursor-pointer hover:opacity-90 transition-all group`}>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {grupConfig.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{grupamento}</h2>
              <p className="text-white/60 text-sm">{equipesGrupo.length + armeirosEquipes.length} equipe(s)</p>
            </div>
            {isExpanded ? <ChevronDown className="h-6 w-6 text-white/50" /> : <ChevronRight className="h-6 w-6 text-white/50" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 pl-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {equipesGrupo.map((equipe) => (
                <EquipeCard key={equipe.id} equipe={equipe} />
              ))}
            </div>
            
            {/* Nested ARMEIRO under GUARDA */}
            {armeirosEquipes.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-[#ffcc00] mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" /> ARMEIROS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {armeirosEquipes.map((equipe) => (
                    <EquipeCard key={equipe.id} equipe={equipe} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#071d49] flex items-center justify-center">
            <UsersRound className="h-6 w-6 text-[#ffcc00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Equipes</h1>
            <p className="text-muted-foreground text-sm">Gestão de equipes de serviço do BPMA</p>
          </div>
        </div>
        <Button 
          onClick={importFromExcel} 
          disabled={importing}
          className="bg-[#071d49] hover:bg-[#0a2a5e] text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          {importing ? 'Importando...' : 'Importar do Excel'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#071d49]/10 p-1 rounded-xl">
          <TabsTrigger 
            value="cadastradas" 
            className="rounded-lg data-[state=active]:bg-[#071d49] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            <Users className="h-4 w-4 mr-2" />
            Equipes Cadastradas
          </TabsTrigger>
          <TabsTrigger 
            value="cadastrar" 
            className="rounded-lg data-[state=active]:bg-[#071d49] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            {editingEquipe ? 'Editar Equipe' : 'Cadastrar Equipe'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastradas" className="mt-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipe, grupamento, policial ou matrícula..."
                value={searchEquipe}
                onChange={(e) => setSearchEquipe(e.target.value)}
                className="pl-12 h-12 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl text-base"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ffcc00] border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEquipes)
                .filter(([grupamento]) => grupamento !== 'ARMEIRO') // ARMEIRO is nested under GUARDA
                .map(([grupamento, equipesGrupo]) => (
                  <GrupamentoSection key={grupamento} grupamento={grupamento} equipesGrupo={equipesGrupo} />
                ))}
              {Object.keys(groupedEquipes).length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#071d49]/10 flex items-center justify-center">
                    <Users className="h-10 w-10 text-[#071d49]/30" />
                  </div>
                  <p className="text-muted-foreground text-lg">Nenhuma equipe encontrada</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">Clique em "Importar do Excel" para carregar os dados</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cadastrar" className="mt-6">
          <Card className="bg-background/50 backdrop-blur-sm border-border/50 rounded-xl overflow-hidden">
            <CardHeader className="bg-[#071d49]/5 border-b border-border/30">
              <CardTitle className="flex items-center gap-2 text-[#071d49]">
                {editingEquipe ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingEquipe ? 'Editar Equipe' : 'Nova Equipe'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Equipe *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: ALFA, BRAVO, CHARLIE..."
                      className="bg-background/50 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grupamento">Grupamento *</Label>
                    <Select
                      value={formData.grupamento}
                      onValueChange={(value) => setFormData({ ...formData, grupamento: value })}
                    >
                      <SelectTrigger className="bg-background/50 h-11">
                        <SelectValue placeholder="Selecione o grupamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRUPAMENTOS_ORDER.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escala">Escala</Label>
                    <Select
                      value={formData.escala}
                      onValueChange={(value) => setFormData({ ...formData, escala: value })}
                    >
                      <SelectTrigger className="bg-background/50 h-11">
                        <SelectValue placeholder="Selecione a escala" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESCALAS.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servico">Serviço</Label>
                    <Select
                      value={formData.servico}
                      onValueChange={(value) => setFormData({ ...formData, servico: value })}
                    >
                      <SelectTrigger className="bg-background/50 h-11">
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICOS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Members Section */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <Label className="text-base font-semibold">Membros da Equipe</Label>
                  
                  <div className="flex gap-2">
                    <Input
                      value={matriculaInput}
                      onChange={(e) => setMatriculaInput(e.target.value)}
                      placeholder="Digite a matrícula..."
                      className="bg-background/50 h-11"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMembroByMatricula())}
                    />
                    <Button type="button" onClick={addMembroByMatricula} className="bg-[#071d49] hover:bg-[#0a2a5e] h-11 px-6">
                      Adicionar
                    </Button>
                  </div>

                  {selectedMembros.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {selectedMembros.map((membro) => {
                        const info = getMembroInfo(membro.efetivo_id);
                        return (
                          <div key={membro.efetivo_id} className="flex items-center gap-3 p-3 bg-[#071d49]/5 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {info?.posto_graduacao} {info?.nome_guerra}
                              </p>
                              <p className="text-sm text-muted-foreground font-mono">{info?.matricula}</p>
                            </div>
                            <Select
                              value={membro.funcao}
                              onValueChange={(value) => updateMembroFuncao(membro.efetivo_id, value)}
                            >
                              <SelectTrigger className="w-[180px] bg-background/50 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FUNCOES.map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMembro(membro.efetivo_id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-[#071d49] hover:bg-[#0a2a5e] h-11 px-8">
                    <Save className="h-4 w-4 mr-2" />
                    {editingEquipe ? 'Salvar Alterações' : 'Cadastrar Equipe'}
                  </Button>
                  {editingEquipe && (
                    <Button type="button" variant="outline" onClick={resetForm} className="h-11">
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,204,0,0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,204,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default Equipes;
